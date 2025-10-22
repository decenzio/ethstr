"use client";

import { parseEther } from "viem";
import { useGlobalState } from "~~/services/store/store";

export const transactionService = {
  async sendTransaction(to: string, amountWei: bigint): Promise<string | null> {
    const publicClient = useGlobalState.getState().publicClient;
    const bundlerClient = useGlobalState.getState().bundlerClient;

    if (!publicClient || !bundlerClient) {
      throw new Error("Wallet is not initialized for Account Abstraction on this network");
    }

    const fees = await publicClient.estimateFeesPerGas();

    return await bundlerClient.sendTransaction({
      to: to as `0x${string}`,
      value: amountWei,
      data: "0x",
      maxFeePerGas: fees.maxFeePerGas ? fees.maxFeePerGas * 15n : undefined,
      maxPriorityFeePerGas: fees.maxPriorityFeePerGas ?? 1_250_000n,
    });
  },
  parseAmountToWei(amountEth: string): bigint {
    if (!amountEth || Number.isNaN(Number(amountEth))) return 0n;
    return parseEther(amountEth as `${number}`);
  },
};
