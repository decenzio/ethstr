import { ChainConfig, SupportedChain, getChainConfig, getSupportedChains } from "../../../../../chains.config";
import { nip19 } from "nostr-tools";
import { createChainSmartAccount } from "~~/services/custom/chainClientService";
import { useGlobalState } from "~~/services/store/store";

let nostrPubkey: string | null = null;

export const nostrService = {
  /**
   * Connects to the Nostr extension and retrieves the user's public key.
   * The result is cached in nostrService.
   */
  async connect(): Promise<string | null> {
    try {
      console.log("🔄 [NostrService] Starting connection...");

      // @ts-ignore
      if (!window.nostr) {
        console.error("❌ [NostrService] window.nostr not available");
        return null;
      }
      // @ts-ignore
      nostrPubkey = await window.nostr.getPublicKey();

      const npub = this.getNostrNpub();

      window.dispatchEvent(new CustomEvent("nostr:pubkey", { detail: npub }));
      return nostrPubkey;
    } catch (error) {
      console.error("❌ [NostrService] Failed to connect to nostr:", error);
      throw error;
    }
  },

  /**
   * Returns the cached Nostr public key.
   */
  getPubkey(): string | null {
    console.log("getPubkey: ", nostrPubkey);
    return nostrPubkey;
  },

  getNostrNpub(): string | null {
    if (!nostrPubkey) return null;
    const temp = nip19.npubEncode(nostrPubkey);
    console.log("getNostrNpub: ", temp);
    return temp;
  },

  getNostrPubkey(nPub: string): string | null {
    if (!nPub) return null;
    const temp = nip19.decode(nPub).data as string;
    console.log("getNostrPubkey: ", temp);
    return temp;
  },

  /**
   * Gets the current chain info from the global store.
   * This is the single source of truth for chain selection across the app.
   */
  getCurrentChain(): SupportedChain {
    return useGlobalState.getState().selectedChain;
  },

  /**
   * Gets the current chain configuration from the global store.
   * Includes all chain details like RPC URLs, contracts, etc.
   */
  getCurrentChainConfig(): ChainConfig {
    const currentChain = this.getCurrentChain();
    return getChainConfig(currentChain);
  },

  /**
   * Gets the EVM address for a given nPub on the currently selected chain.
   * Uses the chain from global store - automatically stays in sync with chain selector.
   */
  async getEvmAddress(nPub: string): Promise<string | null> {
    const decodedValue = this.getNostrPubkey(nPub);
    if (!decodedValue) {
      throw new Error("Invalid nPub provided");
    }

    // Use the helper method to get current chain
    const selectedChain = this.getCurrentChain();
    const chainConfig = this.getCurrentChainConfig();

    console.log(`🔗 Using chain: ${selectedChain} (${chainConfig.name}) - RPC: ${chainConfig.rpcUrl}`);

    try {
      const account = await createChainSmartAccount(selectedChain, `0x${decodedValue}`);
      const address = await account.getAddress();
      console.log(`✅ Generated EVM address for ${selectedChain}:`, address);
      return address;
    } catch (error) {
      console.error(`❌ Failed to get EVM address for chain ${selectedChain}:`, error);
      throw error;
    }
  },

  /**
   * Gets EVM addresses for all supported chains.
   * Useful for displaying addresses across different networks.
   */
  async getEvmAddressesForAllChains(nPub: string): Promise<Record<SupportedChain, string | null>> {
    const decodedValue = this.getNostrPubkey(nPub);
    if (!decodedValue) {
      throw new Error("Invalid nPub provided");
    }

    const addresses: Record<SupportedChain, string | null> = {} as Record<SupportedChain, string | null>;
    const supportedChains = getSupportedChains();

    console.log(`🌐 Getting EVM addresses for all chains: [${supportedChains.join(", ")}]`);

    // Process all chains in parallel for better performance
    const results = await Promise.allSettled(
      supportedChains.map(async chainName => {
        console.log(`🔗 Processing chain: ${chainName}`);
        const account = await createChainSmartAccount(chainName, `0x${decodedValue}`);
        const address = await account.getAddress();
        console.log(`✅ Generated address for ${chainName}:`, address);
        return { chainName, address };
      }),
    );

    // Build result object with error handling
    results.forEach((result, index) => {
      const chainName = supportedChains[index];
      if (result.status === "fulfilled") {
        addresses[chainName] = result.value.address;
      } else {
        console.error(`❌ Failed to get address for ${chainName}:`, result.reason);
        addresses[chainName] = null;
      }
    });

    console.log(`🎯 Final addresses for all chains:`, addresses);
    return addresses;
  },
};
