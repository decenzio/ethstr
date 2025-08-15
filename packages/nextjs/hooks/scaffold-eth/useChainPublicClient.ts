import { useTargetNetwork } from "./useTargetNetwork";
import { usePublicClient } from "wagmi";
import { useGlobalState } from "~~/services/store/store";

/**
 * Custom hook that returns the appropriate public client for the current chain.
 *
 * This hook provides the public client in the following priority:
 * 1. Global state publicClient (when user is connected and using dynamic chain switching)
 * 2. Wagmi publicClient for the target network (fallback for when global state is not available)
 * Use this instead of usePublicClient directly in components that need to work with the
 * dynamically selected chain.
 */
export function useChainPublicClient() {
  const { targetNetwork } = useTargetNetwork();
  const globalPublicClient = useGlobalState(state => state.publicClient);
  const wagmiPublicClient = usePublicClient({ chainId: targetNetwork.id });

  // Prefer the global state client if available (for multi-chain support)
  // Fall back to wagmi client for the target network
  return globalPublicClient || wagmiPublicClient;
}
