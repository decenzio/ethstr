"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useCopyToClipboard } from "~~/hooks/scaffold-eth";
import { nostr, useNip07Ready } from "~~/services/connectNostrExtensionService";
import { connectService } from "~~/services/connectToNetworkService";
import { useGlobalState } from "~~/services/store/store";

export const NostrConnectButton = () => {
  const [mounted, setMounted] = useState(false);
  const ready = useNip07Ready();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializingAA, setInitializingAA] = useState(false);
  const { copyToClipboard, isCopiedToClipboard } = useCopyToClipboard();

  // Get connection state from global state
  const walletAddress = useGlobalState(state => state.walletAddress);
  const nPubkey = useGlobalState(state => state.nPubkey);

  // Ensure component is mounted before showing dynamic content
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize connection state on mount
  useEffect(() => {
    // If we have a pubkey in global state but no session in nostr service,
    // try to restore the connection
    if (nPubkey && !nostr.session) {
      // The connection is already established in global state, no need to reconnect
      return;
    }
  }, [nPubkey]);

  const handleConnectNostr = useCallback(async () => {
    if (!ready) {
      setError("No Nostr extension detected.");
      return;
    }
    setError(null);
    setConnecting(true);
    try {
      // Initialize Account Abstraction after Nostr connection
      setInitializingAA(true);
      try {
        const result = await connectService.connect();
        if (!result) {
          setError("Failed to initialize smart account");
        }
      } catch (aaError: any) {
        console.error("Account Abstraction initialization failed:", aaError);
        setError(`AA Init failed: ${aaError.message || "Unknown error"}`);
      } finally {
        setInitializingAA(false);
      }
    } catch (e: any) {
      const message = e?.message ?? "Failed to connect";
      setError(message);
    } finally {
      setConnecting(false);
    }
  }, [ready]);

  const handleKeyDownConnect = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleConnectNostr();
      }
    },
    [handleConnectNostr],
  );

  // --- Minimal bech32 (BIP-0173) encoder for NIP-19 npub ---
  const HEX_RE = useMemo(() => /^[0-9a-fA-F]+$/, []);
  const CHARSET = useMemo(() => "qpzry9x8gf2tvdw0s3jn54khce6mua7l", []);

  const convertBits = useCallback((data: number[], from: number, to: number, pad: boolean): number[] => {
    let acc = 0;
    let bits = 0;
    const ret: number[] = [];
    const maxv = (1 << to) - 1;
    for (const value of data) {
      if (value < 0 || value >> from !== 0) return [];
      acc = (acc << from) | value;
      bits += from;
      while (bits >= to) {
        bits -= to;
        ret.push((acc >> bits) & maxv);
      }
    }
    if (pad) {
      if (bits > 0) ret.push((acc << (to - bits)) & maxv);
    } else {
      if (bits >= from) return [];
      if (((acc << (to - bits)) & maxv) !== 0) return [];
    }
    return ret;
  }, []);

  const hrpExpand = useCallback((hrp: string): number[] => {
    const ret: number[] = [];
    for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) >> 5);
    ret.push(0);
    for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) & 31);
    return ret;
  }, []);

  const polymod = useCallback((values: number[]): number => {
    const GENERATORS = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
    let chk = 1;
    for (const v of values) {
      const top = chk >> 25;
      chk = ((chk & 0x1ffffff) << 5) ^ v;
      for (let i = 0; i < 5; i++) {
        if (((top >> i) & 1) !== 0) chk ^= GENERATORS[i];
      }
    }
    return chk;
  }, []);

  const bech32CreateChecksum = useCallback(
    (hrp: string, data: number[], constVal: number): number[] => {
      const values = hrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
      const pm = polymod(values) ^ constVal;
      const ret: number[] = [];
      for (let i = 0; i < 6; i++) ret.push((pm >> (5 * (5 - i))) & 31);
      return ret;
    },
    [hrpExpand, polymod],
  );

  const bech32Encode = useCallback(
    (hrp: string, data: number[]): string => {
      const constVal = 1; // bech32 (not bech32m)
      const combined = data.concat(bech32CreateChecksum(hrp, data, constVal));
      let out = `${hrp}1`;
      for (const d of combined) out += CHARSET[d];
      return out;
    },
    [CHARSET, bech32CreateChecksum],
  );

  const hexToBytes = useCallback(
    (hex: string): Uint8Array | null => {
      const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
      if (clean.length === 0 || clean.length % 2 !== 0 || !HEX_RE.test(clean)) return null;
      const bytes = new Uint8Array(clean.length / 2);
      for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
      return bytes;
    },
    [HEX_RE],
  );

  const npub = useMemo(() => {
    // Use nPubkey from global state if available, otherwise try to derive from nostr session
    if (nPubkey) return nPubkey;

    const session = nostr.session;
    if (!session?.pubkey) return null;

    const bytes = hexToBytes(session.pubkey);
    if (!bytes || bytes.length !== 32) return null;
    const words = convertBits(Array.from(bytes), 8, 5, true);
    if (words.length === 0) return null;
    return bech32Encode("npub", words);
  }, [nPubkey, hexToBytes, convertBits, bech32Encode]);

  const shortNpub = useMemo(() => {
    if (!npub) return null;
    if (npub.length <= 20) return npub;
    return `${npub.slice(0, 12)}…${npub.slice(-8)}`;
  }, [npub]);

  const handleCopyNpub = useCallback(async () => {
    if (!npub) return;
    try {
      await copyToClipboard(npub);
    } catch (error) {
      console.error("Failed to copy npub:", error);
    }
  }, [npub, copyToClipboard]);

  const isConnected = !!nPubkey || !!nostr.session;
  const isAAInitialized = !!walletAddress;

  // Show loading state during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end min-w-0">
          <span className="badge badge-ghost">Loading...</span>
        </div>
        <button type="button" className="btn btn-sm btn-secondary" disabled={true}>
          Loading...
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-end min-w-0" aria-live="polite">
        {npub ? (
          <>
            <div
              className="flex items-center gap-1 group cursor-pointer"
              onClick={handleCopyNpub}
              title="Click to copy npub"
            >
              <span className="font-mono text-xs truncate max-w-[160px]" aria-label="Your Nostr npub">
                {shortNpub}
              </span>
              {isCopiedToClipboard ? (
                <CheckCircleIcon className="h-3 w-3 text-success flex-shrink-0" />
              ) : (
                <DocumentDuplicateIcon className="h-3 w-3 opacity-60 group-hover:opacity-100 flex-shrink-0" />
              )}
            </div>
            {walletAddress && (
              <span
                className="font-mono text-[10px] text-success truncate max-w-[180px]"
                title={`Smart Account: ${walletAddress}`}
                aria-label="Your smart account address"
              >
                AA: {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
              </span>
            )}
          </>
        ) : (
          <span className="badge badge-ghost">Not connected</span>
        )}
      </div>
      <button
        type="button"
        className={`btn btn-sm ${isConnected ? "btn-ghost" : "btn-secondary"}`}
        aria-label="Connect Nostr wallet"
        tabIndex={0}
        onClick={handleConnectNostr}
        onKeyDown={handleKeyDownConnect}
        disabled={!ready || connecting || isConnected || initializingAA}
      >
        {initializingAA
          ? "Initializing AA…"
          : connecting
            ? "Connecting…"
            : isConnected
              ? isAAInitialized
                ? "Connected"
                : "AA Failed"
              : ready
                ? "Connect Nostr"
                : "No Nostr wallet"}
      </button>
      {error ? (
        <span className="text-xs text-error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
};
