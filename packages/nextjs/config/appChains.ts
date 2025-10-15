import type { Address } from "viem";
import * as chains from "viem/chains";

export type AppChainConfig = {
  bundlerUrl: string;
  entryPointAddress?: Address;
  factoryAddress?: Address;
  relayerUrl?: string;
  apiBaseUrl?: string;
};

// Pimlico-style placeholders for now; fill via envs later
export const APP_CHAIN_CONFIG: Record<number, AppChainConfig> = {
  [chains.hardhat.id]: {
    bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL_LOCAL || "http://localhost:4337",
    factoryAddress: "0xaCeEF9bf23b41D4898516D2Fdcd7b4BDc22444D7",
    apiBaseUrl: "http://localhost:3000/api",
  },
  [chains.sepolia.id]: {
    bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL_SEPOLIA || "",
    factoryAddress: "0xaCeEF9bf23b41D4898516D2Fdcd7b4BDc22444D7",
  },
  [chains.base.id]: {
    bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL_BASE || "",
    factoryAddress: "0xaCeEF9bf23b41D4898516D2Fdcd7b4BDc22444D7",
  },
  [chains.arbitrumSepolia.id]: {
    bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL_ARB_SEPOLIA || "",
    factoryAddress: "0xaCeEF9bf23b41D4898516D2Fdcd7b4BDc22444D7",
  },
  // TODO: Add Zircuit Garfield when chain object/details available
};

export const getAppChainConfig = (chainId: number): AppChainConfig => {
  return APP_CHAIN_CONFIG[chainId] ?? { bundlerUrl: "" };
};
