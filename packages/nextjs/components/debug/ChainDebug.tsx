"use client";

import React from "react";
import { useAccount } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useGlobalState } from "~~/services/store/store";
import { useSelectedChain } from "~~/storage/hooks";

export function ChainDebug() {
  const { chain, isConnected } = useAccount();
  const [selectedChain] = useSelectedChain();
  const { targetNetwork } = useTargetNetwork();
  const globalTargetNetwork = useGlobalState(state => state.targetNetwork);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm space-y-2">
      <h3 className="font-bold text-lg mb-3">Chain Debug Info</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <strong>Wallet Info:</strong>
          <div>Connected: {isConnected ? "Yes" : "No"}</div>
          <div>Wallet Chain ID: {chain?.id || "N/A"}</div>
          <div>Wallet Chain Name: {chain?.name || "N/A"}</div>
        </div>

        <div>
          <strong>Storage Info:</strong>
          <div>Selected Chain: {selectedChain}</div>
        </div>

        <div>
          <strong>Target Network (Hook):</strong>
          <div>ID: {targetNetwork.id}</div>
          <div>Name: {targetNetwork.name}</div>
        </div>

        <div>
          <strong>Global Target Network:</strong>
          <div>ID: {globalTargetNetwork.id}</div>
          <div>Name: {globalTargetNetwork.name}</div>
        </div>
      </div>
    </div>
  );
}
