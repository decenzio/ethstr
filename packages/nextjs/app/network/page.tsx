"use client";

import React from "react";
import { useAppChainConfig } from "~~/hooks/useAppChainConfig";
import { useGlobalState } from "~~/services/store/store";

const NetworkPage: React.FC = () => {
  const network = useGlobalState(s => s.targetNetwork);
  const cfg = useAppChainConfig();

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Selected Network</h1>
      <div className="grid gap-4 max-w-xl">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <span className="opacity-70">Name</span>
              <span className="font-mono">{network.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="opacity-70">Chain ID</span>
              <span className="font-mono">{network.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="opacity-70">Native Currency</span>
              <span className="font-mono">{network.nativeCurrency?.symbol}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="opacity-70">Bundler URL</span>
              <span className="font-mono break-all">{cfg.bundlerUrl || "not set"}</span>
            </div>
            {cfg.factoryAddress && (
              <div className="flex items-center justify-between">
                <span className="opacity-70">Factory</span>
                <span className="font-mono break-all">{cfg.factoryAddress}</span>
              </div>
            )}
            {cfg.entryPointAddress && (
              <div className="flex items-center justify-between">
                <span className="opacity-70">EntryPoint</span>
                <span className="font-mono break-all">{cfg.entryPointAddress}</span>
              </div>
            )}
            {network.blockExplorers?.default?.url && (
              <div className="flex items-center justify-between">
                <span className="opacity-70">Explorer</span>
                <a
                  href={network.blockExplorers.default.url}
                  target="_blank"
                  rel="noreferrer"
                  className="link link-primary truncate max-w-[60%] text-right"
                >
                  {network.blockExplorers.default.url}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkPage;
