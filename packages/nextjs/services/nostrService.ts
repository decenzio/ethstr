import { decodeNpub, encodeNpub, getEthAddressFromNpub } from "~~/services/nostrCore";
import type { ClientNostrServiceInterface } from "~~/services/nostrService.types";
import { NostrServiceError } from "~~/services/nostrService.types";
import { useGlobalState } from "~~/services/store/store";

// Client-side state management
let nostrPubkey: string | null = null;

/**
 * Client-side Nostr service with browser-specific functionality
 * Implements ClientNostrServiceInterface for type safety
 */
export const nostrService: ClientNostrServiceInterface = {
  /**
   * Connects to the Nostr extension and retrieves the user's public key.
   * The result is cached in nostrService and global state.
   */
  async connect(): Promise<string | null> {
    // @ts-ignore
    if (!window.nostr) {
      throw new NostrServiceError("Nostr extension not found", "EXTENSION_NOT_FOUND");
    }

    try {
      // @ts-ignore
      nostrPubkey = await window.nostr.getPublicKey();

      // Update global state
      useGlobalState.getState().setNPubKey(nostrPubkey);

      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent("nostr:pubkey", { detail: this.getNostrNpub() }));

      return nostrPubkey;
    } catch (error) {
      console.error("Failed to connect to nostr:", error);
      throw new NostrServiceError("Failed to connect to Nostr extension", "CONNECTION_FAILED", error);
    }
  },

  /**
   * Returns the cached Nostr public key.
   * Falls back to global state if local cache is empty.
   */
  getPubkey(): string | null {
    if (nostrPubkey) {
      return nostrPubkey;
    }

    // Fallback to global state
    const globalPubkey = useGlobalState.getState().nPubkey;
    if (globalPubkey) {
      nostrPubkey = globalPubkey;
      return nostrPubkey;
    }

    return null;
  },

  /**
   * Get npub from cached public key
   */
  getNostrNpub(): string | null {
    const pubkey = this.getPubkey();
    if (!pubkey) return null;

    const npub = encodeNpub(pubkey);
    if (!npub) {
      throw new NostrServiceError("Failed to encode public key to npub", "ENCODE_FAILED");
    }

    return npub;
  },

  /**
   * Decode npub to public key
   */
  getNostrPubkey(nPub: string): string | null {
    if (!nPub) {
      throw new NostrServiceError("npub is required", "INVALID_INPUT");
    }

    const pubkey = decodeNpub(nPub);
    if (!pubkey) {
      throw new NostrServiceError("Invalid npub format", "INVALID_NPUB");
    }

    return pubkey;
  },

  /**
   * Get EVM address from npub using specified network
   * Uses global state for chain configuration
   */
  async getEthAddress(nPub: string, chainId?: number): Promise<string | null> {
    try {
      // Use provided chainId or fall back to global state
      const targetChainId = chainId || useGlobalState.getState().targetNetwork.id;

      if (!nPub) {
        throw new NostrServiceError("npub is required", "INVALID_INPUT");
      }

      return await getEthAddressFromNpub(nPub, targetChainId);
    } catch (error) {
      console.error("Failed to get ETH address:", error);
      if (error instanceof NostrServiceError) {
        throw error;
      }
      throw new NostrServiceError("Failed to get ETH address", "ADDRESS_RESOLUTION_FAILED", error);
    }
  },
};
