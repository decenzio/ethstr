"use client";

import React from "react";
import { SupportedChain, getChainConfig, getSupportedChains } from "../../../../chains.config";
import { useGlobalState } from "~~/services/store/store";

interface ChainSelectorProps {
  className?: string;
  showTestnetLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ChainSelector({ className = "", showTestnetLabel = true, size = "md" }: ChainSelectorProps) {
  const selectedChain = useGlobalState(state => state.selectedChain);
  const setSelectedChain = useGlobalState(state => state.setSelectedChain);
  const supportedChains = getSupportedChains();

  const handleChainChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      const newChain = event.target.value as SupportedChain;
      await setSelectedChain(newChain);
    } catch (error) {
      console.error("Failed to switch chain:", error);
    }
  };

  const sizeClasses = {
    sm: "text-sm py-1 px-2",
    md: "text-base py-2 px-3",
    lg: "text-lg py-3 px-4",
  };

  return (
    <div className={`relative ${className}`}>
      <label htmlFor="chain-selector" className="sr-only">
        Select Network
      </label>
      <select
        id="chain-selector"
        value={selectedChain}
        onChange={handleChainChange}
        className={`
          ${sizeClasses[size]}
          bg-white dark:bg-gray-800 
          border border-gray-300 dark:border-gray-600
          rounded-lg shadow-sm
          text-gray-900 dark:text-gray-100
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          hover:border-gray-400 dark:hover:border-gray-500
          transition-colors duration-200
          cursor-pointer
          w-full
        `}
      >
        {supportedChains.map(chainName => {
          const config = getChainConfig(chainName);
          const displayName = showTestnetLabel && config.testnet ? `${config.name} (Testnet)` : config.name;

          return (
            <option key={chainName} value={chainName}>
              {displayName}
            </option>
          );
        })}
      </select>
    </div>
  );
}

// Compact version for headers/navigation
export function CompactChainSelector({ className = "" }: { className?: string }) {
  return <ChainSelector className={className} size="sm" showTestnetLabel={false} />;
}

// Card-style chain selector with more details
export function DetailedChainSelector({ className = "" }: { className?: string }) {
  const selectedChain = useGlobalState(state => state.selectedChain);
  const selectedConfig = getChainConfig(selectedChain);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Select Network</h3>
        <ChainSelector />
      </div>

      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Current Network Details:</h4>
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex justify-between">
            <span>Name:</span>
            <span className="font-medium">{selectedConfig.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Chain ID:</span>
            <span className="font-medium">{selectedConfig.chainId}</span>
          </div>
          <div className="flex justify-between">
            <span>Currency:</span>
            <span className="font-medium">{selectedConfig.currency}</span>
          </div>
          <div className="flex justify-between">
            <span>Type:</span>
            <span
              className={`font-medium ${selectedConfig.testnet ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"}`}
            >
              {selectedConfig.testnet ? "Testnet" : "Mainnet"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
