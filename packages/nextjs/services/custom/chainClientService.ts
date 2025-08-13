import { SupportedChain, getChainConfig } from "../../../../chains.config";
import { createSmartAccountClient } from "permissionless";
import { createPublicClient as createViemPublicClient, http, webSocket } from "viem";
import scaffoldConfig from "~~/scaffold.config";
import { toNostrSmartAccount } from "~~/services/custom/evm-account/nostrSmartAccount";

// WebSocket configurations (fallback for chains that support it)
const CHAIN_WS_CONFIG: Partial<Record<SupportedChain, string>> = {
  sepolia: "wss://sepolia.drpc.org",
  base: "wss://base-mainnet.blastapi.io/5648ecee-3f48-4b1f-b060-824a76b34d94",
  // coredao and rootstock don't have WebSocket support in current config
};

/**
 * Creates a public client for the specified chain
 */
export function createChainPublicClient(chainName: SupportedChain) {
  const chainConfig = getChainConfig(chainName);
  const scaffoldChain = scaffoldConfig.targetNetworks.find(network => network.id === chainConfig.chainId);

  if (!scaffoldChain) {
    throw new Error(`Chain ${chainName} not found in scaffold config`);
  }

  // Use WebSocket if available, otherwise fallback to HTTP
  const wsUrl = CHAIN_WS_CONFIG[chainName];
  const transport = wsUrl ? webSocket(wsUrl) : http(chainConfig.rpcUrl);

  return createViemPublicClient({
    chain: scaffoldChain,
    transport,
  });
}

/**
 * Creates a smart account for the specified chain and owner
 */
export async function createChainSmartAccount(chainName: SupportedChain, owner: `0x${string}`) {
  const publicClient = createChainPublicClient(chainName);

  return await toNostrSmartAccount({
    client: publicClient,
    owner,
  });
}

/**
 * Creates a bundler client for the specified chain and smart account
 */
export function createChainBundlerClient(chainName: SupportedChain, smartAccount: any) {
  const chainConfig = getChainConfig(chainName);
  const scaffoldChain = scaffoldConfig.targetNetworks.find(network => network.id === chainConfig.chainId);

  if (!scaffoldChain) {
    throw new Error(`Chain ${chainName} not found in scaffold config`);
  }

  return createSmartAccountClient({
    account: smartAccount,
    chain: scaffoldChain,
    bundlerTransport: http(chainConfig.bundlerUrl),
  });
}

/**
 * Creates all necessary clients for a specific chain
 */
export async function createChainClients(chainName: SupportedChain, owner: `0x${string}`) {
  const publicClient = createChainPublicClient(chainName);
  const smartAccount = await createChainSmartAccount(chainName, owner);
  const bundlerClient = createChainBundlerClient(chainName, smartAccount);

  return {
    publicClient,
    smartAccount,
    bundlerClient,
    address: await smartAccount.getAddress(),
  };
}
