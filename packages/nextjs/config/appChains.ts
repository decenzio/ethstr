import type { Address } from "viem";
import * as chains from "viem/chains";

export type AppChainConfig = {
  bundlerUrl: string;
  rpcUrl?: string;
  wsRpcUrl?: string;
  entryPointAddress?: Address;
  factoryAddress?: Address;
  relayerUrl?: string;
  apiBaseUrl?: string;
  blockExplorerUrl?: string;
};

// Configuration for each supported network
// Values from ethba2025 project, can be overridden via environment variables
export const APP_CHAIN_CONFIG: Record<number, AppChainConfig> = {
  [chains.hardhat.id]: {
    bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL_LOCAL || "http://localhost:4337",
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL_LOCAL || "http://localhost:8545",
    factoryAddress: "0xaCeEF9bf23b41D4898516D2Fdcd7b4BDc22444D7",
    apiBaseUrl: "http://localhost:3000/api",
    blockExplorerUrl: "http://localhost:3000/blockexplorer",
  },
  [chains.sepolia.id]: {
    bundlerUrl:
      process.env.NEXT_PUBLIC_BUNDLER_URL_BASE ||
      "https://api.pimlico.io/v2/11155111/rpc?apikey=pim_X5CHVGtEhbJLu7Wj4H8fDC",
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL_BASE || "https://eth-sepolia.public.blastapi.io",
    wsRpcUrl:
      process.env.NEXT_PUBLIC_WS_RPC_URL_BASE || "wss://eth-sepolia.blastapi.io/5648ecee-3f48-4b1f-b060-824a76b34d94",
    factoryAddress: "0xaCeEF9bf23b41D4898516D2Fdcd7b4BDc22444D7",
    blockExplorerUrl: "https://sepolia.etherscan.io",
  },
  [chains.base.id]: {
    // Pimlico bundler URL from ethba2025 (Base Mainnet chain ID: 8453)
    bundlerUrl:
      process.env.NEXT_PUBLIC_BUNDLER_URL_BASE ||
      "https://api.pimlico.io/v2/8453/rpc?apikey=pim_X5CHVGtEhbJLu7Wj4H8fDC",
    // RPC URLs from ethba2025
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL_BASE || "https://base-mainnet.public.blastapi.io",
    wsRpcUrl:
      process.env.NEXT_PUBLIC_WS_RPC_URL_BASE || "wss://base-mainnet.blastapi.io/5648ecee-3f48-4b1f-b060-824a76b34d94",
    // Factory address from ethba2025
    factoryAddress: "0xaCeEF9bf23b41D4898516D2Fdcd7b4BDc22444D7",
    // Block explorer from ethba2025
    blockExplorerUrl: "https://basescan.org",
  },
  [chains.arbitrumSepolia.id]: {
    bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL_ARB_SEPOLIA || "",
    factoryAddress: "0xaCeEF9bf23b41D4898516D2Fdcd7b4BDc22444D7",
    blockExplorerUrl: "https://sepolia.arbiscan.io",
  },
  // TODO: Add Zircuit Garfield when chain object/details available
};

export const getAppChainConfig = (chainId: number): AppChainConfig => {
  return APP_CHAIN_CONFIG[chainId] ?? { bundlerUrl: "" };
};

// Nostr relay configuration from ethba2025
export const NOSTR_RELAYS = ["wss://relay.primal.net", "wss://nos.lol", "wss://relay.damus.io"] as const;
