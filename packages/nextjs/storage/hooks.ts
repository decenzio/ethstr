import { useState } from "react";
import { SupportedChain, getChainConfig } from "../../../chains.config";
import { getSelectedChain, setSelectedChain as setStoredChain } from "./storage";

// React hook for managing selected chain
export function useSelectedChain(): [SupportedChain, (chain: SupportedChain) => void] {
  const [selectedChain, setSelectedChain] = useState<SupportedChain>(() => getSelectedChain());

  const updateSelectedChain = (chain: SupportedChain) => {
    setStoredChain(chain);
    setSelectedChain(chain);
  };

  return [selectedChain, updateSelectedChain];
}

// Hook that only returns the current selected chain (read-only)
export function useCurrentChain(): SupportedChain {
  const [selectedChain] = useSelectedChain();
  return selectedChain;
}

// Hook that returns chain configuration for the selected chain
export function useSelectedChainConfig() {
  const [selectedChain] = useSelectedChain();
  return getChainConfig(selectedChain);
}
