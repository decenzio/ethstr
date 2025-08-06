import { createPublicClient } from "viem";
import { create } from "zustand";
import scaffoldConfig from "~~/scaffold.config";
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
  setNativeCurrencyPrice: (newValue: number): void =>
    set(state => ({ nativeCurrency: { ...state.nativeCurrency, price: newValue } })),
  setIsNativeCurrencyFetching: (newValue: boolean): void =>
    set(state => ({ nativeCurrency: { ...state.nativeCurrency, isFetching: newValue } })),
  targetNetwork: {
    ...scaffoldConfig.targetNetworks[0],
    ...NETWORKS_EXTRA_DATA[scaffoldConfig.targetNetworks[0].id],
  },
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => set(() => ({ targetNetwork: newTargetNetwork })),
  setWalletAddress: (walletAddress: string | null) => set(() => ({ walletAddress })),
  setNPubKey: (nPubkey: string) => set(() => ({ nPubkey })),
  setPublicClient: (publicClient: ReturnType<typeof createPublicClient> | null) => set(() => ({ publicClient })),
  setEvmAccount: (evmAccount: ReturnType<any>) => set(() => ({ evmAccount })),
  setBundlerClient: (bundlerClient: ReturnType<any>) => set(() => ({ bundlerClient })),
}));
