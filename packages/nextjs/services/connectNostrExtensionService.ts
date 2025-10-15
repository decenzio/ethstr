// lib/connectNostrExtensionService.ts
// Minimal, framework-agnostic NIP-07 connector for Next.js apps.
//
// Usage (client-side):
//   import { nostr } from "@/lib/connectNostrExtensionService";
//   const session = await nostr.connect(); // prompts user via extension
//   const pubkey = session.pubkey;
//   const signed = await nostr.signEvent({ kind: 1, content: "gm", tags: [] });
//
// Notes:
// - Works only in the browser (guards against SSR).
// - Supports optional NIP-04 encrypt/decrypt if the extension exposes `nip04`.
// - Verifies event id computed locally matches the one returned by the extension.

type NostrUnsignedEvent = {
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[][];
  content: string;
};

type NostrEvent = NostrUnsignedEvent & {
  id: string;
  sig: string;
};

type NostrNIP04 = {
  encrypt: (pubkey: string, plaintext: string) => Promise<string>;
  decrypt: (pubkey: string, ciphertext: string) => Promise<string>;
};

type NIP07 = {
  // Required
  getPublicKey: () => Promise<string>;
  signEvent: (event: NostrUnsignedEvent) => Promise<NostrEvent>;
  // Optional
  enable?: () => Promise<void>;
  getVersion?: () => Promise<string>;
  getRelays?: () => Promise<Record<string, { read: boolean; write: boolean }>>;
  nip04?: NostrNIP04;
  // Non-standard but supported by some wallets (e.g., nos2x)
  signSchnorr?: (hex32: string) => Promise<string>;
  // Some wallets expose additional namespaces (nip44, nip07.getInfo, etc.)
  // We leave them as `any` to avoid forcing dependencies.
  [key: string]: any;
};

// Extend Window typing in a module-safe way (no TS global pollution across files)
declare global {
  interface Window {
    nostr?: NIP07;
  }
}

export type NostrSession = {
  pubkey: string;
  provider: "nip07";
  relays?: Record<string, { read: boolean; write: boolean }>;
};

class NostrExtensionService {
  private _session: NostrSession | null = null;

  /** True only on the client and when an extension injected window.nostr */
  isAvailable(): boolean {
    return typeof window !== "undefined" && typeof window.nostr !== "undefined";
  }

  /**
   * Wait for NIP-07 injection (e.g., user just enabled the extension tab) with a timeout.
   * Most extensions inject quickly after DOM loads; we poll a few times.
   */
  async waitForAvailability(timeoutMs = 2500, pollMs = 100): Promise<boolean> {
    if (this.isAvailable()) return true;
    if (typeof window === "undefined") return false;

    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (this.isAvailable()) return true;
      await new Promise(r => setTimeout(r, pollMs));
    }
    return this.isAvailable();
  }

  /**
   * Connect = ask extension for the user's pubkey and (optionally) relays.
   * Throws with a helpful message if not available or user rejects.
   */
  async connect(options?: { timeoutMs?: number }): Promise<NostrSession> {
    const isAvailable = await this.waitForAvailability(options?.timeoutMs ?? 2500);
    if (!isAvailable) {
      throw new Error(
        "No Nostr extension (NIP-07) detected. Install/enable a wallet like Alby or nos2x, then refresh.",
      );
    }

    try {
      // Some extensions require calling enable() before first use
      if (typeof window.nostr!.enable === "function") {
        await window.nostr!.enable();
      }

      const pubkey = await window.nostr!.getPublicKey();
      let relays: NostrSession["relays"];
      try {
        relays = (await window.nostr!.getRelays?.()) ?? undefined;
      } catch {
        // Some extensions don't implement getRelays; that's fine.
      }

      this._session = { pubkey, provider: "nip07", relays };
      return this._session;
    } catch (err: any) {
      // Map common wallet errors to something dev-friendly.
      const message = err?.message || (typeof err === "string" ? err : "User declined or wallet error.");
      throw new Error(`Failed to connect Nostr wallet: ${message}`);
    }
  }

  /** Returns current session (if connected) or null. */
  get session(): NostrSession | null {
    return this._session;
  }

  /** Ensure we have a pubkey; if not, connect. */
  private async ensureSession(): Promise<NostrSession> {
    if (this._session) return this._session;
    return this.connect();
  }

  /**
   * Build a complete unsigned event. If `pubkey` / `created_at` missing,
   * they’re filled from the session and current time.
   */
  async buildUnsignedEvent(input: Partial<NostrUnsignedEvent> & { kind: number }): Promise<NostrUnsignedEvent> {
    const { pubkey } = await this.ensureSession();
    return {
      pubkey,
      created_at: input.created_at ?? Math.floor(Date.now() / 1000),
      kind: input.kind,
      tags: input.tags ?? [],
      content: input.content ?? "",
    };
  }

  /**
   * Sign a Nostr event via the extension. Optionally verifies the returned `id`
   * by recomputing it locally using Web Crypto (SHA-256 over NIP-01 serialization).
   */
  async signEvent(
    input: Partial<NostrUnsignedEvent> & { kind: number },
    options?: { verifyLocally?: boolean },
  ): Promise<NostrEvent> {
    if (!this.isAvailable()) {
      throw new Error("NIP-07 provider not available in this environment.");
    }

    const unsigned = await this.buildUnsignedEvent(input);
    const signed = await window.nostr!.signEvent(unsigned);

    if (options?.verifyLocally) {
      const expectedId = await this.computeEventId(unsigned);
      if (expectedId !== signed.id) {
        throw new Error(`Signed event id mismatch. Expected ${expectedId}, got ${signed.id}`);
      }
    }

    return signed;
  }

  /** Get current pubkey; connects first time if needed. */
  async getPublicKey(): Promise<string> {
    const s = await this.ensureSession();
    return s.pubkey;
  }

  /**
   * Optional: sign a raw 32-byte hex digest using Schnorr, if the wallet supports it.
   * Input must be exactly 64 hex characters (no 0x prefix).
   */
  async signSchnorrHex32(hex32: string): Promise<string> {
    await this.ensureSession();
    const provider = window.nostr;
    if (!/^[0-9a-fA-F]{64}$/.test(hex32)) {
      throw new Error("hex32 must be 64 hex characters (no 0x prefix)");
    }
    if (!provider?.signSchnorr) {
      throw new Error("signSchnorr is not supported by this extension.");
    }
    return provider.signSchnorr(hex32);
  }

  /**
   * Optional: NIP-04 encrypt/decrypt if the extension supports it.
   */
  async nip04Encrypt(recipientHexPubkey: string, plaintext: string): Promise<string> {
    await this.ensureSession();
    const n = window.nostr;
    if (!n?.nip04?.encrypt) {
      throw new Error("NIP-04 not supported by this extension.");
    }
    return n.nip04.encrypt(recipientHexPubkey, plaintext);
  }

  async nip04Decrypt(senderHexPubkey: string, ciphertext: string): Promise<string> {
    await this.ensureSession();
    const n = window.nostr;
    if (!n?.nip04?.decrypt) {
      throw new Error("NIP-04 not supported by this extension.");
    }
    return n.nip04.decrypt(senderHexPubkey, ciphertext);
  }

  /**
   * Compute Nostr event id per NIP-01:
   *   sha256(JSON.stringify([0, pubkey, created_at, kind, tags, content]))
   * Uses Web Crypto API (available in modern browsers).
   */
  async computeEventId(unsigned: NostrUnsignedEvent): Promise<string> {
    const payload = [0, unsigned.pubkey, unsigned.created_at, unsigned.kind, unsigned.tags, unsigned.content];
    const json = JSON.stringify(payload);
    const enc = new TextEncoder().encode(json);
    if (typeof crypto === "undefined" || typeof crypto.subtle === "undefined") {
      throw new Error("Web Crypto API (crypto.subtle) is not available in this environment.");
    }
    const hashBuf = await crypto.subtle.digest("SHA-256", enc);
    return this.bytesToHex(new Uint8Array(hashBuf));
  }

  // --- Helpers ---
  private bytesToHex(bytes: Uint8Array): string {
    // Fast hex conversion
    let out = "";
    for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, "0");
    return out;
  }

  /** Clear in-memory session (e.g., on sign-out). */
  clearSession(): void {
    this._session = null;
  }
}

// Export a singleton for convenience.
export const nostr = new NostrExtensionService();

/**
 * Small React-friendly check you can use before calling `nostr.connect()`:
 *
 * Example (client component):
 *   const ready = useNip07Ready();
 *   useEffect(() => { if (ready) nostr.connect(); }, [ready]);
 */
export function useNip07Ready(): boolean {
  if (typeof window === "undefined") return false;
  // In case you want a more reactive hook, you can enhance this to listen for
  // extension-injection events if your target wallet emits any.
  return typeof window.nostr !== "undefined";
}

/**
 * Subscribe to provider availability. The callback is invoked once when `window.nostr` appears.
 * Returns an unsubscribe function.
 */
export function onNip07Available(callback: (provider: NIP07) => void, pollMs = 50): () => void {
  if (typeof window === "undefined") return () => undefined;
  if (typeof window.nostr !== "undefined") {
    callback(window.nostr);
    return () => undefined;
  }
  const int = setInterval(() => {
    if (typeof window.nostr !== "undefined") {
      clearInterval(int);
      callback(window.nostr);
    }
  }, pollMs);
  return () => clearInterval(int);
}

/** Return the current pubkey if connected, otherwise null. */
export async function getNip07PublicKey(): Promise<string | null> {
  const s = nostr.session;
  return s?.pubkey ?? null;
}

/** Clear the in-memory Nostr session (e.g., on app sign-out). */
export function clearNip07Session(): void {
  nostr.clearSession();
}
