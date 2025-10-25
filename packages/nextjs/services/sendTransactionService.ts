"use client";

import { parseEther } from "viem";
import { entryPoint08Abi, entryPoint08Address } from "viem/account-abstraction";
import { nostrBundlerService } from "~~/services/nostrBundlerService";
import { useGlobalState } from "~~/services/store/store";

export const transactionService = {
  async sendTransaction(to: string, amountWei: bigint): Promise<string | null> {
    const publicClient = useGlobalState.getState().publicClient;
    const evmAccount = useGlobalState.getState().evmAccount;

    if (!publicClient || !evmAccount) {
      throw new Error("Wallet is not initialized for Account Abstraction on this network");
    }

    const fees = await publicClient.estimateFeesPerGas();

    try {
      // Get bundler client from global state
      const bundlerClient = useGlobalState.getState().bundlerClient;

      if (!bundlerClient) {
        throw new Error("Bundler client is not initialized");
      }

      // Get the current nonce for the smart account
      const nonce = await evmAccount.getNonce();
      console.log("Current nonce:", nonce);

      // Check if the smart account is deployed
      const code = await publicClient.getBytecode({ address: evmAccount.address as `0x${string}` });
      console.log("Smart account code length:", code?.length || 0);
      console.log("Smart account address:", evmAccount.address);

      // Prepare UserOperation for ETH transfer using bundler client
      const userOp = await bundlerClient.prepareUserOperation({
        account: evmAccount,
        calls: [
          {
            to: to as `0x${string}`,
            value: amountWei,
            data: "0x",
          },
        ],
        maxFeePerGas: fees.maxFeePerGas ? fees.maxFeePerGas * 15n : undefined,
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas
          ? fees.maxPriorityFeePerGas > 1_500_000n
            ? fees.maxPriorityFeePerGas
            : 1_500_000n
          : 1_500_000n,
        // Let the bundler client handle nonce management
      });
      console.log("Created UserOperation:", userOp);

      // Sign the UserOperation
      const signature = await evmAccount.signUserOperation(userOp);
      userOp.signature = signature;
      console.log("Signed UserOperation:", userOp);

      // Watch for UserOperationEvent to get the transaction hash
      const txIdPromise = new Promise<string>((resolve, reject) => {
        const unsubscribe = publicClient.watchContractEvent({
          address: entryPoint08Address,
          abi: entryPoint08Abi,
          eventName: "UserOperationEvent",
          args: { sender: evmAccount.address },
          onLogs: (logs: any) => {
            console.log("UserOperationEvent received:", logs);
            resolve(logs[0].transactionHash);
            unsubscribe();
          },
          onError: (err: any) => reject(err),
        });
      });

      // Send UserOperation via Nostr relays
      await nostrBundlerService.sendUserOp(userOp);
      console.log("UserOperation sent via Nostr!");

      return await txIdPromise;
    } catch (error) {
      console.error("Transaction failed:", error);
      throw new Error(`Transaction failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },

  parseAmountToWei(amountEth: string): bigint {
    if (!amountEth || Number.isNaN(Number(amountEth))) return 0n;
    return parseEther(amountEth as `${number}`);
  },

  // Check if the current network is supported for transactions
  isNetworkSupported(): boolean {
    const publicClient = useGlobalState.getState().publicClient;
    const evmAccount = useGlobalState.getState().evmAccount;
    return !!(publicClient && evmAccount);
  },

  // Get current wallet address from global state
  getWalletAddress(): string | null {
    return useGlobalState.getState().walletAddress;
  },

  // Get current network from global state
  getCurrentNetwork() {
    return useGlobalState.getState().targetNetwork;
  },
};
