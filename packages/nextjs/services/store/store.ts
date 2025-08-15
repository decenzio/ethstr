import { SupportedChain, getChainConfig, getDefaultChain } from "../../../../chains.config";
import { createPublicClient } from "viem";
import { create } from "zustand";
import scaffoldConfig from "~~/scaffold.config";
import { createChainClients } from "~~/services/custom/chainClientService";
import { nostrService } from "~~/services/custom/nostr/nostrService";
import { ChainWithAttributes, NETWORKS_EXTRA_DATA } from "~~/utils/scaffold-eth";

/**
 * Zustand Store
 *
 * You can add global state to the app using this useGlobalState, to get & set
 * values from anywhere in the app.
 *
 * Think about it as a global useState.
 */

type GlobalState = {
  nativeCurrency: {
    price: number;
    isFetching: boolean;
  };
  setNativeCurrencyPrice: (newNativeCurrencyPriceState: number) => void;
  setIsNativeCurrencyFetching: (newIsNativeCurrencyFetching: boolean) => void;
  targetNetwork: ChainWithAttributes;
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => void;
  selectedChain: SupportedChain;
  setSelectedChain: (chain: SupportedChain) => Promise<void>;
  walletAddress: string | null;
  setWalletAddress: (walletAddress: string | null) => void;
  nPubkey: string;
  setNPubKey: (nPubkey: string) => void;
  publicClient: ReturnType<typeof createPublicClient> | any;
  evmAccount: any;
  bundlerClient: any;
  setPublicClient: (publicClient: ReturnType<typeof createPublicClient> | any) => void;
  setBundlerClient: (publicClient: ReturnType<any> | any) => void;
  setEvmAccount: (publicClient: any) => void;
};

// Helper to get initial selected chain from localStorage
const getInitialSelectedChain = (): SupportedChain => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("ethstr_selected_chain");
    if (stored) {
      return stored as SupportedChain;
    }
  }
  return getDefaultChain();
};

export const useGlobalState = create<GlobalState>(set => ({
  nativeCurrency: {
    price: 0,
    isFetching: true,
  },
  walletAddress: null,
  nPubkey: "",
  publicClient: null,
  evmAccount: null,
  bundlerClient: null,
  selectedChain: getInitialSelectedChain(),
  setNativeCurrencyPrice: (newValue: number): void =>
    set(state => ({ nativeCurrency: { ...state.nativeCurrency, price: newValue } })),
  setIsNativeCurrencyFetching: (newValue: boolean): void =>
    set(state => ({ nativeCurrency: { ...state.nativeCurrency, isFetching: newValue } })),
  targetNetwork: {
    ...scaffoldConfig.targetNetworks[0],
    ...NETWORKS_EXTRA_DATA[scaffoldConfig.targetNetworks[0].id],
  },
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => set(() => ({ targetNetwork: newTargetNetwork })),
  setSelectedChain: async (selectedChain: SupportedChain) => {
    // Also update localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("ethstr_selected_chain", selectedChain);
    }

    // Update target network when chain changes
    const chainConfig = getChainConfig(selectedChain);
    const newTargetNetwork = scaffoldConfig.targetNetworks.find(network => network.id === chainConfig.chainId);

    if (newTargetNetwork) {
      set(() => ({
        selectedChain,
        targetNetwork: { ...newTargetNetwork, ...NETWORKS_EXTRA_DATA[newTargetNetwork.id] },
      }));
    } else {
      set(() => ({ selectedChain }));
    }

    // Recreate clients for the new chain if user is connected
    const currentState = useGlobalState.getState();
    if (currentState.evmAccount && currentState.walletAddress) {
      try {
        // Get the current pubkey from nostr service
        const pubkey = nostrService.getPubkey();
        if (pubkey) {
          // Create new clients for the selected chain
          const { publicClient, smartAccount, bundlerClient } = await createChainClients(selectedChain, `0x${pubkey}`);

          // Update all clients in the store
          set(() => ({
            publicClient,
            evmAccount: smartAccount,
            bundlerClient,
          }));
        }
      } catch (error) {
        console.error("Failed to update clients for chain switch:", error);
      }
    }
  },
  setWalletAddress: (walletAddress: string | null) => set(() => ({ walletAddress })),
  setNPubKey: (nPubkey: string) => set(() => ({ nPubkey })),
  setPublicClient: (publicClient: ReturnType<typeof createPublicClient> | null) => set(() => ({ publicClient })),
  setEvmAccount: (evmAccount: ReturnType<any>) => set(() => ({ evmAccount })),
  setBundlerClient: (bundlerClient: ReturnType<any>) => set(() => ({ bundlerClient })),
}));
