import { parseAbi } from "viem";

// Standard ERC20 ABI
export const erc20Abi = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function transferFrom(address from, address to, uint256 value) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
]);

// PYUSD contract address for Arbitrum only
export const PYUSD_ADDRESSES = {
  // Arbitrum - PYUSD only
  42161: "0x46850ad61c2b7d64d08c9c754f45254596696984", // PYUSD on Arbitrum
} as const;

export type TokenInfo = {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
};

export const PYUSD_TOKEN_INFO: Record<number, TokenInfo> = {
  42161: {
    address: PYUSD_ADDRESSES[42161],
    symbol: "PYUSD",
    name: "PayPal USD",
    decimals: 6,
    chainId: 42161,
  },
};

export const getPYUSDAddress = (chainId: number): string | null => {
  const address = PYUSD_ADDRESSES[chainId as keyof typeof PYUSD_ADDRESSES] || null;
  console.log("getPYUSDAddress - Chain ID:", chainId, "Address:", address);
  return address;
};

export const getPYUSDInfo = (chainId: number): TokenInfo | null => {
  return PYUSD_TOKEN_INFO[chainId] || null;
};
