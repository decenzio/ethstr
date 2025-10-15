"use client";

import React from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { getAppChainConfig } from "~~/config/appChains";
import { useGlobalState } from "~~/services/store/store";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

export const ChainSelect: React.FC = () => {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const selectedNetwork = useGlobalState(s => s.targetNetwork);
  const setTargetNetwork = useGlobalState(s => s.setTargetNetwork);
  const networks = getTargetNetworks();
  const cfg = getAppChainConfig(selectedNetwork.id);
  const bundlerHost = cfg.bundlerUrl
    ? (() => {
        try {
          return new URL(cfg.bundlerUrl).host;
        } catch {
          return "";
        }
      })()
    : "";

  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = e => {
    const chainId = Number(e.target.value);
    const newNetwork = networks.find(n => n.id === chainId);
    if (!newNetwork) return;
    setTargetNetwork(newNetwork);
    if (chain?.id !== chainId && switchChain) {
      try {
        switchChain({ chainId });
      } catch {
        // ignore
      }
    }
  };

  return (
    <label className="flex items-center gap-2 mr-3" aria-label="Select EVM network">
      <select
        className="select select-bordered select-sm bg-base-100"
        aria-label="EVM network"
        value={selectedNetwork.id}
        onChange={handleChange}
        tabIndex={0}
        title={bundlerHost ? `Bundler: ${bundlerHost}` : "Bundler: not set"}
      >
        {networks.map(n => (
          <option key={n.id} value={n.id}>
            {n.name}
          </option>
        ))}
      </select>
    </label>
  );
};
