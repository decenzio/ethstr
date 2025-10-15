import { getAppChainConfig } from "~~/config/appChains";
import { useGlobalState } from "~~/services/store/store";

export const getCurrentAppChainConfig = () => {
  const chainId = useGlobalState.getState().targetNetwork.id;
  return getAppChainConfig(chainId);
};
