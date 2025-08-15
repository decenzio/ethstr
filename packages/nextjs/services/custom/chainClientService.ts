import { SupportedChain, getChainConfig } from "../../../../chains.config";
import { createSmartAccountClient } from "permissionless";
import { createPublicClient as createViemPublicClient, http, webSocket } from "viem";
import scaffoldConfig from "~~/scaffold.config";
import { toNostrSmartAccount } from "~~/services/custom/evm-account/nostrSmartAccount";

/**
 * Creates a public client for the specified chain
 */
export function createChainPublicClient(chainName: SupportedChain) {
  const chainConfig = getChainConfig(chainName);
  const scaffoldChain = scaffoldConfig.targetNetworks.find(network => network.id === chainConfig.chainId);

  if (!scaffoldChain) {
    throw new Error(`Chain ${chainName} not found in scaffold config`);
  }

  let transport;
  try {
    transport = webSocket(chainConfig.wsRpcUrl);
  } catch {
    transport = http(chainConfig.rpcUrl);
  }

  return createViemPublicClient({
    chain: scaffoldChain,
    transport,
  });
}

export async function createChainSmartAccount(chainName: SupportedChain, owner: `0x${string}`) {
  const publicClient = createChainPublicClient(chainName);
  const account = await toNostrSmartAccount({
    client: publicClient,
    owner,
  });

  return account;
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

export async function createChainClients(chainName: SupportedChain, owner: `0x${string}`) {
  const publicClient = createChainPublicClient(chainName);
  const smartAccount = await createChainSmartAccount(chainName, owner);
  const address = await smartAccount.getAddress();
  const bundlerClient = createChainBundlerClient(chainName, smartAccount);

  return {
    publicClient,
    smartAccount,
    bundlerClient,
    address,
  };
}
