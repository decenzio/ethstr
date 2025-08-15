import { createChainClients } from "~~/services/custom/chainClientService";
import { nostrService } from "~~/services/custom/nostr/nostrService";
import { useGlobalState } from "~~/services/store/store";
import { ConnectService } from "~~/types/custom/connectService";

export const connectService = {
  async connect(): Promise<ConnectService | null> {
    try {
      console.log("🔄 [ConnectService] Starting connection process...");

      // Reduce timeout to 20 seconds since we have more granular timeouts now
      const connectionPromise = this._performConnection();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Connection timeout after 20 seconds")), 20000);
      });

      return (await Promise.race([connectionPromise, timeoutPromise])) as ConnectService | null;
    } catch (error) {
      console.error("❌ [ConnectService] Connection failed:", error);
      console.error("❌ [ConnectService] Error stack:", (error as Error)?.stack);

      // If it's a timeout error, provide more helpful message
      if ((error as Error)?.message?.includes("timeout")) {
        throw new Error(
          "Connection timed out. This might be due to slow RPC endpoints. Please try again or switch to a different network.",
        );
      }

      throw error;
    }
  },

  async _performConnection(): Promise<ConnectService | null> {
    await nostrService.connect();

    // Step 2: Get pubkey and npub
    console.log("🔄 [ConnectService] Getting pubkey and npub...");
    const pubkey: string | null = nostrService.getPubkey();
    const npub: string | null = nostrService.getNostrNpub();

    console.log("🔍 [ConnectService] Pubkey:", pubkey);
    console.log("🔍 [ConnectService] NPub:", npub);

    if (!npub || !pubkey) {
      console.error("❌ [ConnectService] Missing pubkey or npub");
      return null;
    }

    const selectedChain = useGlobalState.getState().selectedChain;
    console.log("🔍 [ConnectService] Selected chain:", selectedChain);
    const { publicClient, smartAccount, bundlerClient, address } = await createChainClients(
      selectedChain,
      `0x${pubkey}`,
    );

    console.log("✅ [ConnectService] Clients created successfully");
    console.log("🔍 [ConnectService] Wallet address:", address);

    useGlobalState.getState().setPublicClient(publicClient);
    useGlobalState.getState().setEvmAccount(smartAccount);
    useGlobalState.getState().setBundlerClient(bundlerClient);
    useGlobalState.getState().setWalletAddress(address);
    useGlobalState.getState().setNPubKey(npub);

    return { ethPubkey: address, nPubkey: npub };
  },
};
