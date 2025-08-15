// Chain configuration types and utilities
export interface ChainConfig {
  chainId: number;
  name: string;
  network: string;
  currency: string;
  rpcUrl: string;
  wsRpcUrl: string;
  bundlerUrl: string;
  contracts: {
    entryPoint: string;
    npubAccountFactory: string;
    npubAccountImplementation: string;
  };
  testnet: boolean;
  faucets: string[];
}

export interface ChainsConfig {
  chains: {
    [chainName: string]: ChainConfig;
  };
  defaultChain: string;
  supportedChains: string[];
  metadata: {
    version: string;
    lastUpdated: string;
    description: string;
  };
}

export type SupportedChain = "sepolia" | "base" | "coredao" | "rootstock";

// Load configuration
import chainsConfigJson from "./chains.config.json";

export const chainsConfig: ChainsConfig =
  chainsConfigJson as unknown as ChainsConfig;

// Utility functions
export function getChainConfig(chainName: SupportedChain): ChainConfig {
  const config = chainsConfig.chains[chainName];
  if (!config) {
    throw new Error(`Chain configuration not found for: ${chainName}`);
  }
  return config;
}

export function getContractAddress(
  chainName: SupportedChain,
  contractName: keyof ChainConfig["contracts"]
): string {
  const chain = getChainConfig(chainName);
  const address = chain.contracts[contractName];
  if (!address) {
    throw new Error(`Contract ${contractName} not deployed on ${chainName}`);
  }
  return address;
}

export function getRpcUrl(chainName: SupportedChain): string {
  return getChainConfig(chainName).rpcUrl;
}

export function getBundlerUrl(chainName: SupportedChain): string {
  return getChainConfig(chainName).bundlerUrl;
}

export function getChainId(chainName: SupportedChain): number {
  return getChainConfig(chainName).chainId;
}

export function isTestnet(chainName: SupportedChain): boolean {
  return getChainConfig(chainName).testnet;
}

export function getSupportedChains(): SupportedChain[] {
  return chainsConfig.supportedChains as SupportedChain[];
}

export function getDefaultChain(): SupportedChain {
  return chainsConfig.defaultChain as SupportedChain;
}

// Update contract address in config (for deployment scripts)
export function updateContractAddress(
  chainName: SupportedChain,
  contractName: keyof ChainConfig["contracts"],
  address: string
): void {
  chainsConfig.chains[chainName].contracts[contractName] = address;
}

// Get all deployed contracts for a chain
export function getDeployedContracts(
  chainName: SupportedChain
): ChainConfig["contracts"] {
  return getChainConfig(chainName).contracts;
}

// Check if all required contracts are deployed on a chain
export function areContractsDeployed(chainName: SupportedChain): boolean {
  const contracts = getChainConfig(chainName).contracts;
  return !!(
    contracts.npubAccountFactory && contracts.npubAccountImplementation
  );
}

export default chainsConfig;
