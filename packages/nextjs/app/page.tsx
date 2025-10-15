"use client";

import { useCallback, useMemo, useState } from "react";
import { nostr, useNip07Ready } from "../services/connectNostrExtensionService";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const ready = useNip07Ready();
  const [pubkeyHex, setPubkeyHex] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnectNostr = useCallback(async () => {
    if (!ready) {
      setError("No Nostr extension detected.");
      return;
    }
    setError(null);
    setConnecting(true);
    try {
      const session = await nostr.connect();
      setPubkeyHex(session.pubkey);
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
    if (!pubkeyHex) return null;
    const bytes = hexToBytes(pubkeyHex);
    if (!bytes || bytes.length !== 32) return null;
    const words = convertBits(Array.from(bytes), 8, 5, true);
    if (words.length === 0) return null;
    return bech32Encode("npub", words);
  }, [pubkeyHex, hexToBytes, convertBits, bech32Encode]);

  const isConnected = !!pubkeyHex;

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="w-full max-w-xl px-6">
          <div className="rounded-xl border border-base-300 bg-base-200/30 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Nostr Wallet</h2>
              <span className={`badge ${isConnected ? "badge-success" : "badge-ghost"}`} aria-live="polite">
                {isConnected ? "Connected" : "Not connected"}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <button
                type="button"
                className="btn btn-primary"
                aria-label="Connect Nostr wallet"
                tabIndex={0}
                onClick={handleConnectNostr}
                onKeyDown={handleKeyDownConnect}
                disabled={!ready || connecting || isConnected}
              >
                {connecting ? "Connecting…" : isConnected ? "Connected" : ready ? "Connect Nostr" : "No Nostr wallet"}
              </button>

              {error ? (
                <p className="text-sm text-error" role="alert">
                  {error}
                </p>
              ) : null}

              {isConnected && npub ? (
                <div className="rounded-lg border border-base-300 p-4">
                  <p className="mb-1 text-sm opacity-70">Your npub</p>
                  <p className="break-all font-mono text-sm" aria-label="Your Nostr npub">
                    {npub}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
