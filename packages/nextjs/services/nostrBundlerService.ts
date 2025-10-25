import { SimplePool, finalizeEvent, generateSecretKey } from "nostr-tools";
import { NOSTR_RELAYS } from "~~/config/appChains";
import { stringifyWithBigInt } from "~~/utils/stringifyWithBigInt";

const pool = new SimplePool();
const relays = [...NOSTR_RELAYS]; // Use relays from config
const sk = generateSecretKey();

export const nostrBundlerService = {
  async sendUserOp(userOp: any): Promise<void> {
    const serializeUserOp = stringifyWithBigInt(userOp);
    const signedEvent = finalizeEvent(
      {
        kind: 96124,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: serializeUserOp,
      },
      sk,
    );
    await Promise.any(pool.publish(relays, signedEvent));
  },
};
