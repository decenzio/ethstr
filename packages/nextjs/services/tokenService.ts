"use client";

import { useGlobalState } from "~~/services/store/store";
import { type TokenInfo, erc20Abi, getPYUSDAddress, getPYUSDInfo } from "~~/utils/erc20";

export interface TokenBalance {
  token: TokenInfo;
  balance: bigint;
  formattedBalance: string;
}

export const tokenService = {
  /**
   * Get PYUSD balance for the current wallet address (Arbitrum only)
   */
  async getPYUSDBalance(): Promise<TokenBalance | null> {
    const publicClient = useGlobalState.getState().publicClient;
    const walletAddress = useGlobalState.getState().walletAddress;
    const currentNetwork = useGlobalState.getState().targetNetwork;

    if (!publicClient || !walletAddress) {
      console.log("Missing publicClient or walletAddress");
      return null;
    }

    const pyusdInfo = getPYUSDInfo(currentNetwork.id);
    if (!pyusdInfo) {
      console.log(`PYUSD not supported on network ${currentNetwork.name} (${currentNetwork.id})`);
      return null;
    }

    console.log(`Fetching PYUSD balance for ${walletAddress} on ${currentNetwork.name} (${currentNetwork.id})`);
    console.log(`PYUSD contract address: ${pyusdInfo.address}`);

    // Verify we're on the correct network
    if (currentNetwork.id !== 42161) {
      console.error(
        `Expected Arbitrum network (42161), but connected to ${currentNetwork.name} (${currentNetwork.id})`,
      );
      return null;
    }

    try {
      // First verify the contract exists by calling symbol()
      const symbol = await publicClient.readContract({
        address: pyusdInfo.address as `0x${string}`,
        abi: erc20Abi,
        functionName: "symbol",
      });

      console.log(`Contract symbol: ${symbol}`);

      // Try to get balance with a timeout
      const balance = (await Promise.race([
        publicClient.readContract({
          address: pyusdInfo.address as `0x${string}`,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [walletAddress as `0x${string}`],
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Contract call timeout")), 10000)),
      ])) as bigint;

      console.log(`Raw balance: ${balance}`);

      const formattedBalance = this.formatTokenBalance(balance, pyusdInfo.decimals);

      return {
        token: pyusdInfo,
        balance,
        formattedBalance,
      };
    } catch (error) {
      console.error(`Error fetching PYUSD balance on ${currentNetwork.name}:`, error);

      // Additional debugging for contract interaction issues
      if (error instanceof Error) {
        if (error.message.includes("returned no data")) {
          console.error("Contract returned no data - possible issues:");
          console.error("1. Contract address might be incorrect");
          console.error("2. Contract might not be deployed");
          console.error("3. Network connection issue");
          console.error("4. Contract ABI mismatch");
        }
      }

      return null;
    }
  },

  /**
   * Get ERC20 token balance for any token
   */
  async getTokenBalance(tokenAddress: string): Promise<bigint | null> {
    const publicClient = useGlobalState.getState().publicClient;
    const walletAddress = useGlobalState.getState().walletAddress;

    if (!publicClient || !walletAddress) {
      return null;
    }

    try {
      const balance = await publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [walletAddress as `0x${string}`],
      });

      return balance;
    } catch (error) {
      console.error("Error fetching token balance:", error);
      return null;
    }
  },

  /**
   * Get token metadata (name, symbol, decimals)
   */
  async getTokenMetadata(tokenAddress: string): Promise<{
    name: string;
    symbol: string;
    decimals: number;
  } | null> {
    const publicClient = useGlobalState.getState().publicClient;

    if (!publicClient) {
      return null;
    }

    try {
      const [name, symbol, decimals] = await Promise.all([
        publicClient.readContract({
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "name",
        }),
        publicClient.readContract({
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "symbol",
        }),
        publicClient.readContract({
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "decimals",
        }),
      ]);

      return {
        name: name as string,
        symbol: symbol as string,
        decimals: decimals as number,
      };
    } catch (error) {
      console.error("Error fetching token metadata:", error);
      return null;
    }
  },

  /**
   * Format token balance with proper decimals
   */
  formatTokenBalance(balance: bigint, decimals: number): string {
    const divisor = BigInt(10 ** decimals);
    const wholePart = balance / divisor;
    const fractionalPart = balance % divisor;

    if (fractionalPart === 0n) {
      return wholePart.toString();
    }

    const fractionalStr = fractionalPart.toString().padStart(decimals, "0");
    const trimmedFractional = fractionalStr.replace(/0+$/, "");

    if (trimmedFractional === "") {
      return wholePart.toString();
    }

    return `${wholePart}.${trimmedFractional}`;
  },

  /**
   * Parse PYUSD amount from string to bigint (PYUSD has 6 decimals)
   */
  parsePYUSDAmount(amount: string): bigint {
    if (!amount || Number.isNaN(Number(amount))) return 0n;
    // PYUSD has 6 decimals
    return BigInt(Math.floor(Number(amount) * 1_000_000));
  },

  /**
   * Check if PYUSD is supported on current network (Arbitrum only)
   */
  isPYUSDSupported(): boolean {
    const currentNetwork = useGlobalState.getState().targetNetwork;
    return getPYUSDAddress(currentNetwork.id) !== null;
  },

  /**
   * Get PYUSD info for current network (Arbitrum only)
   */
  getPYUSDInfo(): TokenInfo | null {
    const currentNetwork = useGlobalState.getState().targetNetwork;
    return getPYUSDInfo(currentNetwork.id);
  },
};
