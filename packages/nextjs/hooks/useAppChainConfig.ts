"use client";

import { useMemo } from "react";
import { getAppChainConfig } from "~~/config/appChains";
import { useGlobalState } from "~~/services/store/store";

export const useAppChainConfig = () => {
  const chainId = useGlobalState(s => s.targetNetwork.id);
  return useMemo(() => getAppChainConfig(chainId), [chainId]);
};
