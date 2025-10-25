// Server-safe version of nostrService for API routes
// This file should NOT import from client-side hooks or stores
import { decodeNpub, getEthAddressFromNpub } from "~~/services/nostrCore";
import type { ServerNostrServiceInterface } from "~~/services/nostrService.types";
import { NostrServiceError } from "~~/services/nostrService.types";

/**
 * Server-side Nostr service for API routes
 * Implements ServerNostrServiceInterface for type safety
 */
export const nostrServiceServer: ServerNostrServiceInterface = {
  /**
   * Decode npub to hex public key
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
   * Get EVM address from npub on a specific chain
   * Server-safe version that doesn't use global state
   * chainId is required - no default value
   */
  async getEthAddress(nPub: string, chainId: number): Promise<string | null> {
    if (!nPub) {
      throw new NostrServiceError("npub is required", "INVALID_INPUT");
    }

    if (!chainId || chainId <= 0) {
      throw new NostrServiceError("Valid chainId is required", "INVALID_CHAIN_ID");
    }

    try {
      return await getEthAddressFromNpub(nPub, chainId);
    } catch (error) {
      console.error("Failed to get ETH address:", error);
      if (error instanceof NostrServiceError) {
        throw error;
      }
      throw new NostrServiceError("Failed to get ETH address", "ADDRESS_RESOLUTION_FAILED", error);
    }
  },
};
