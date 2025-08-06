import { SimplePool, finalizeEvent, generateSecretKey } from "nostr-tools";
import { toString } from "~~/utils/custom/toString";

const pool = new SimplePool();
const relays = ["wss://relay.primal.net", "wss://nos.lol", "wss://relay.damus.io"];
const sk = generateSecretKey();

export const nostrBundlerService = {
  async sendUserOp(userOp: any): Promise<void> {
    const serializeUserOp = toString(userOp);
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
