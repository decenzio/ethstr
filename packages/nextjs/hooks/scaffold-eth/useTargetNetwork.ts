import { useMemo } from "react";
import { useGlobalState } from "~~/services/store/store";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";

/**
 * Simple hook that returns the target network from global store
 */
export function useTargetNetwork(): { targetNetwork: ChainWithAttributes } {
  const targetNetwork = useGlobalState(({ targetNetwork }) => targetNetwork);

  return useMemo(() => ({ targetNetwork }), [targetNetwork]);
}
