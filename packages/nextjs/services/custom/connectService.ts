import { createChainClients } from "~~/services/custom/chainClientService";
import { nostrService } from "~~/services/custom/nostr/nostrService";
import { useGlobalState } from "~~/services/store/store";
import { ConnectService } from "~~/types/custom/connectService";

export const connectService = {
  async connect(): Promise<ConnectService | null> {
    await nostrService.connect();
    const pubkey: string | null = nostrService.getPubkey();
    const npub: string | null = nostrService.getNostrNpub();

    if (!npub || !pubkey) {
      return null;
    }

    // Get the currently selected chain from store
    const selectedChain = useGlobalState.getState().selectedChain;

    // Use the dynamic chain client service to create all clients for the selected chain
    const { publicClient, smartAccount, bundlerClient, address } = await createChainClients(
      selectedChain,
      `0x${pubkey}`,
    );

    // Update the global state with the created clients
    useGlobalState.getState().setPublicClient(publicClient);
    useGlobalState.getState().setEvmAccount(smartAccount);
    useGlobalState.getState().setBundlerClient(bundlerClient);
    useGlobalState.getState().setWalletAddress(address);
    useGlobalState.getState().setNPubKey(npub);

    return { ethPubkey: address, nPubkey: npub };
  },
};
