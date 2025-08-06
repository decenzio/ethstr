import { useEffect, useState } from "react";
import { useTargetNetwork } from "./useTargetNetwork";
import { Address } from "viem";
import { useGlobalState } from "~~/services/store/store";

export type UseBalanceParameters = {
  address?: Address;
};

export type BalanceData = {
  value: bigint;
  decimals: number;
  formatted: string;
  symbol: string;
};

/**
 * Custom balance hook that works with our smart account system
 */
export const useWatchBalance = ({ address }: UseBalanceParameters) => {
  const { targetNetwork } = useTargetNetwork();
  const publicClient = useGlobalState(state => state.publicClient);
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!address || !publicClient) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setIsError(false);

        const balanceValue = await publicClient.getBalance({ address });

        const balanceData: BalanceData = {
          value: balanceValue,
          decimals: 18,
          formatted: (Number(balanceValue) / Math.pow(10, 18)).toString(),
          symbol: targetNetwork.nativeCurrency.symbol,
        };

        setBalance(balanceData);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setIsError(true);
        setBalance(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();

    // Set up polling to update balance periodically
    const interval = setInterval(fetchBalance, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [address, publicClient, targetNetwork.nativeCurrency.symbol]);

  return {
    data: balance,
    isLoading,
    isError,
  };
};
