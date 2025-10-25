// Core Nostr functionality - pure functions that work everywhere
// This file contains the business logic without any environment-specific code
import { nip19 } from "nostr-tools";
import { createPublicClient, http } from "viem";
import { getAppChainConfig } from "~~/config/appChains";
import { toNostrSmartAccount } from "~~/services/nostrSmartAccount";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

/**
 * Decode npub to hex public key with proper error handling
 */
export const decodeNpub = (nPub: string): string | null => {
  if (!nPub) return null;
  try {
    const decoded = nip19.decode(nPub).data as string;
    return decoded;
  } catch (error) {
    console.error("Failed to decode npub:", error);
    return null;
  }
};

/**
 * Encode hex public key to npub
 */
export const encodeNpub = (pubkey: string): string | null => {
  if (!pubkey) return null;
  try {
    return nip19.npubEncode(pubkey);
  } catch (error) {
    console.error("Failed to encode npub:", error);
    return null;
  }
};

/**
 * Get chain object by chain ID using Scaffold-ETH utilities
 * Uses the configured target networks from scaffold.config.ts
 */
export const getChainById = (chainId: number) => {
  const targetNetworks = getTargetNetworks();
  const chain = targetNetworks.find(network => network.id === chainId);

  if (!chain) {
    // Fallback to the first configured network (usually base)
    console.warn(`Chain with ID ${chainId} not found in target networks, using fallback`);
    return targetNetworks[0];
  }

  return chain;
};

/**
 * Get EVM address from npub on a specific chain
 * Core business logic - works everywhere
 */
export const getEthAddressFromNpub = async (nPub: string, chainId: number): Promise<string | null> => {
  const decodedValue = decodeNpub(nPub);
  if (!decodedValue) {
    throw new Error("Invalid npub");
  }

  // Get chain configuration and chain object
  const appChainConfig = getAppChainConfig(chainId);
  const chain = getChainById(chainId);

  // Use configured RPC URL or fallback
  const rpcUrl = appChainConfig.rpcUrl || `https://${chain.name.toLowerCase()}-mainnet.public.blastapi.io`;

  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  const account = await toNostrSmartAccount({
    client: publicClient,
    owner: `0x${decodedValue}`,
    factoryAddress: appChainConfig.factoryAddress,
  });

  const address = await account.getAddress();
  return address;
};
