import { toNostrSmartAccount } from "./nostrSmartAccount";
import { createSmartAccountClient } from "permissionless";
import { createPublicClient, http, webSocket } from "viem";
import { getAppChainConfig } from "~~/config/appChains";
import { nostrService } from "~~/services/nostrService";
import { useGlobalState } from "~~/services/store/store";

export interface ConnectService {
  ethPubkey: string;
  nPubkey: string;
}

export const connectService = {
  async connect(): Promise<ConnectService | null> {
    await nostrService.connect();
    const pubkey: string | null = nostrService.getPubkey();
    const npub: string | null = nostrService.getNostrNpub();

    if (!npub || !pubkey) {
      return null;
    }

    return await this.initializeForCurrentNetwork(pubkey, npub);
  },

  async initializeForCurrentNetwork(pubkey: string, npub: string): Promise<ConnectService | null> {
    // Get the currently selected network from global state
    const targetNetwork = useGlobalState.getState().targetNetwork;
    const appChainConfig = getAppChainConfig(targetNetwork.id);

    // Determine which transport to use for public client
    // Priority: wsRpcUrl > rpcUrl > fallback pattern
    const rpcTransport = appChainConfig.wsRpcUrl
      ? webSocket(appChainConfig.wsRpcUrl)
      : appChainConfig.rpcUrl
        ? http(appChainConfig.rpcUrl)
        : webSocket(
            `wss://${targetNetwork.name.toLowerCase()}-mainnet.blastapi.io/5648ecee-3f48-4b1f-b060-824a76b34d94`,
          );

    // Create public client with the selected network
    const publicClient = createPublicClient({
      chain: targetNetwork,
      transport: rpcTransport,
    });

    useGlobalState.getState().setPublicClient(publicClient);

    const evmAccount = await toNostrSmartAccount({
      client: publicClient,
      owner: `0x${pubkey}`,
      factoryAddress: appChainConfig.factoryAddress,
    });

    useGlobalState.getState().setEvmAccount(evmAccount);

    // Create a proper bundler client using permissionless
    const bundlerClient = createSmartAccountClient({
      account: evmAccount,
      chain: targetNetwork,
      bundlerTransport: http(appChainConfig.bundlerUrl),
    });

    useGlobalState.getState().setBundlerClient(bundlerClient);

    const ethPubKey = (await evmAccount.getAddress()).toString();

    useGlobalState.getState().setWalletAddress(ethPubKey);
    useGlobalState.getState().setNPubKey(npub);

    return { ethPubkey: ethPubKey, nPubkey: npub };
  },

  // Re-initialize services when network changes
  async reinitializeForNewNetwork(): Promise<ConnectService | null> {
    const pubkey: string | null = nostrService.getPubkey();
    const npub: string | null = nostrService.getNostrNpub();

    if (!npub || !pubkey) {
      return null;
    }

    return await this.initializeForCurrentNetwork(pubkey, npub);
  },
};
