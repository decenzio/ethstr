import { nip19 } from "nostr-tools";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { toNostrSmartAccount } from "~~/services/nostrSmartAccount";

let nostrPubkey: string | null = null;

export const nostrService = {
  /**
   * Connects to the Nostr extension and retrieves the user's public key.
   * The result is cached in nostrService.
   */
  async connect(): Promise<string | null> {
    // @ts-ignore
    if (!window.nostr) {
      return null;
    }

    try {
      // @ts-ignore
      nostrPubkey = await window.nostr.getPublicKey();
      window.dispatchEvent(new CustomEvent("nostr:pubkey", { detail: this.getNostrNpub() }));
      return nostrPubkey;
    } catch (error) {
      console.error("Failed to connect to nostr:", error);
      throw error;
    }
  },

  /**
   * Returns the cached Nostr public key.
   */
  getPubkey(): string | null {
    console.log("getPubkey: ", nostrPubkey);
    return nostrPubkey;
  },

  getNostrNpub(): string | null {
    if (!nostrPubkey) return null;
    const temp = nip19.npubEncode(nostrPubkey);
    console.log("getNostrNpub: ", temp);
    return temp;
  },

  getNostrPubkey(nPub: string): string | null {
    if (!nPub) return null;
    const temp = nip19.decode(nPub).data as string;
    console.log("getNostrPubkey: ", temp);
    return temp;
  },

  async getEthAddress(nPub: string): Promise<string | null> {
    const decodedValue = nostrService.getNostrPubkey(nPub);

    const publicClient = createPublicClient({
      chain: base,
      transport: http("https://base-mainnet.public.blastapi.io"),
    });

    const account = await toNostrSmartAccount({
      client: publicClient,
      owner: `0x${decodedValue}`,
    });

    const address = await account.getAddress();

    return address;
  },
};
