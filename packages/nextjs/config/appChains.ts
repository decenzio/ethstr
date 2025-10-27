import type { Address } from "viem";
import * as chains from "viem/chains";

export type AppChainConfig = {
  bundlerUrl: string;
  rpcUrl: string;
  wsRpcUrl: string;
  entryPointAddress: Address;
  factoryAddress: Address;
  relayerUrl: string;
  blockExplorerUrl: string;
};

// Configuration for each supported network
// Addresses from deployments/addresses.json - updated from hardhat deployments
export const APP_CHAIN_CONFIG: Record<number, AppChainConfig> = {
  [chains.hardhat.id]: {
    bundlerUrl: "http://localhost:4337",
    rpcUrl: "http://localhost:8545",
    wsRpcUrl: "",
    entryPointAddress: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
    factoryAddress: "",
    relayerUrl: "",
    blockExplorerUrl: "http://localhost:3000/blockexplorer",
  },
  [chains.sepolia.id]: {
    bundlerUrl: "https://api.pimlico.io/v2/11155111/rpc?apikey=pim_X5CHVGtEhbJLu7Wj4H8fDC",
    rpcUrl: "https://eth-sepolia.public.blastapi.io",
    wsRpcUrl: "wss://eth-sepolia.blastapi.io/5648ecee-3f48-4b1f-b060-824a76b34d94",
    entryPointAddress: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
    factoryAddress: "0xbFa5A21ADaA24746194547f44d44fd333729c662",
    relayerUrl: "",
    blockExplorerUrl: "https://sepolia.etherscan.io",
  },
  [chains.base.id]: {
    // Pimlico bundler URL (Base Mainnet chain ID: 8453)
    bundlerUrl: "https://api.pimlico.io/v2/8453/rpc?apikey=pim_X5CHVGtEhbJLu7Wj4H8fDC",
    rpcUrl: "https://base-mainnet.public.blastapi.io",
    wsRpcUrl: "wss://base-mainnet.blastapi.io/5648ecee-3f48-4b1f-b060-824a76b34d94",
    entryPointAddress: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
    factoryAddress: "0xaCeEF9bf23b41D4898516D2Fdcd7b4BDc22444D7",
    relayerUrl: "",
    blockExplorerUrl: "https://basescan.org",
  },
  [chains.arbitrum.id]: {
    bundlerUrl: "https://api.pimlico.io/v2/42161/rpc?apikey=pim_X5CHVGtEhbJLu7Wj4H8fDC",
    rpcUrl: "https://arbitrum-one.public.blastapi.io/",
    wsRpcUrl: "wss://arbitrum-one.blastapi.io/5648ecee-3f48-4b1f-b060-824a76b34d94",
    entryPointAddress: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
    factoryAddress: "0xF1810bD15522EA0E005a94239868Ae5b7B6Cb377",
    relayerUrl: "",
    blockExplorerUrl: "https://arbiscan.io/",
  },
};

export const getAppChainConfig = (chainId: number): AppChainConfig => {
  return APP_CHAIN_CONFIG[chainId] ?? { bundlerUrl: "" };
};

// Nostr relay configuration from ethba2025
export const NOSTR_RELAYS = ["wss://relay.primal.net", "wss://nos.lol", "wss://relay.damus.io"] as const;
