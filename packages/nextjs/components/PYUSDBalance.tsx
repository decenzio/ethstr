"use client";

import { useEffect, useState } from "react";
import { useGlobalState } from "~~/services/store/store";
import { type TokenBalance, tokenService } from "~~/services/tokenService";

interface PYUSDBalanceProps {
  className?: string;
  showLabel?: boolean;
  refreshInterval?: number; // in milliseconds
}

export const PYUSDBalance = ({ className = "", showLabel = true, refreshInterval = 10000 }: PYUSDBalanceProps) => {
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const walletAddress = useGlobalState(state => state.walletAddress);
  const targetNetwork = useGlobalState(state => state.targetNetwork);

  const fetchBalance = async () => {
    if (!walletAddress) {
      setBalance(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const pyusdBalance = await tokenService.getPYUSDBalance();
      setBalance(pyusdBalance);
    } catch (err) {
      console.error("Error fetching PYUSD balance:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch balance");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();

    // Set up refresh interval
    const interval = setInterval(fetchBalance, refreshInterval);

    return () => clearInterval(interval);
  }, [walletAddress, targetNetwork.id, refreshInterval, fetchBalance]);

  // Don't render if PYUSD is not supported on this network
  if (!tokenService.isPYUSDSupported()) {
    return null;
  }

  if (!walletAddress) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showLabel && <span className="text-sm text-gray-500">PYUSD:</span>}
        <span className="text-sm text-gray-400">Connect wallet</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showLabel && <span className="text-sm text-gray-500">PYUSD:</span>}
        <div className="animate-pulse bg-gray-300 h-4 w-16 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showLabel && <span className="text-sm text-gray-500">PYUSD:</span>}
        <span className="text-sm text-red-500">Error</span>
      </div>
    );
  }

  if (!balance) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showLabel && <span className="text-sm text-gray-500">PYUSD:</span>}
        <span className="text-sm text-gray-400">0</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && <span className="text-sm text-gray-500">PYUSD:</span>}
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">{balance.formattedBalance}</span>
        <span className="text-xs text-gray-400">{balance.token.symbol}</span>
      </div>
    </div>
  );
};

export default PYUSDBalance;
