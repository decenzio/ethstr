"use client";

import { encodeFunctionData, parseEther } from "viem";
import { entryPoint08Abi, entryPoint08Address } from "viem/account-abstraction";
import { nostrBundlerService } from "~~/services/nostrBundlerService";
import { useGlobalState } from "~~/services/store/store";
import { erc20Abi, getPYUSDAddress } from "~~/utils/erc20";

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
      const isDeployed = code && code.length > 0;

      console.log("Smart account deployment status:", {
        address: evmAccount.address,
        isDeployed,
        codeLength: code?.length || 0,
      });

      // Prepare UserOperation for ETH transfer using bundler client
      let userOp = await bundlerClient.prepareUserOperation({
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
      });

      // If account is not deployed, manually estimate gas
      if (!isDeployed) {
        console.log("Account not deployed, manually estimating gas...");
        try {
          const gasEstimate = await bundlerClient.estimateUserOperationGas({
            userOperation: userOp,
          });
          console.log("Gas estimate:", gasEstimate);

          userOp = {
            ...userOp,
            callGasLimit: gasEstimate.callGasLimit || 200_000n,
            verificationGasLimit: gasEstimate.verificationGasLimit || 200_000n,
            preVerificationGas: gasEstimate.preVerificationGas || 50_000n,
          };
        } catch (gasError) {
          console.warn("Gas estimation failed, using fallback values:", gasError);
          userOp = {
            ...userOp,
            callGasLimit: 200_000n,
            verificationGasLimit: 200_000n,
            preVerificationGas: 50_000n,
          };
        }
      }
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

  async sendERC20Transfer(tokenAddress: string, to: string, amount: bigint): Promise<string | null> {
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

      // Encode ERC20 transfer function call
      const transferData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [to as `0x${string}`, amount],
      });

      console.log("ERC20 Transfer Data:", transferData);
      console.log("Token Address:", tokenAddress);
      console.log("To:", to);
      console.log("Amount:", amount.toString());

      // Check if smart account is deployed, if not, we need to include initCode
      const code = await publicClient.getBytecode({ address: evmAccount.address as `0x${string}` });
      const isDeployed = code && code.length > 0;

      console.log("Smart account deployment status:", {
        address: evmAccount.address,
        isDeployed,
        codeLength: code?.length || 0,
      });

      // Prepare UserOperation for ERC20 transfer
      let userOp = await bundlerClient.prepareUserOperation({
        account: evmAccount,
        calls: [
          {
            to: tokenAddress as `0x${string}`,
            value: 0n, // No ETH value for ERC20 transfers
            data: transferData,
          },
        ],
        maxFeePerGas: fees.maxFeePerGas ? fees.maxFeePerGas * 15n : undefined,
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas
          ? fees.maxPriorityFeePerGas > 1_500_000n
            ? fees.maxPriorityFeePerGas
            : 1_500_000n
          : 1_500_000n,
      });

      // If account is not deployed, manually estimate gas
      if (!isDeployed) {
        console.log("Account not deployed, manually estimating gas...");
        try {
          const gasEstimate = await bundlerClient.estimateUserOperationGas({
            userOperation: userOp,
          });
          console.log("Gas estimate:", gasEstimate);

          userOp = {
            ...userOp,
            callGasLimit: gasEstimate.callGasLimit || 200_000n,
            verificationGasLimit: gasEstimate.verificationGasLimit || 200_000n,
            preVerificationGas: gasEstimate.preVerificationGas || 50_000n,
          };
        } catch (gasError) {
          console.warn("Gas estimation failed, using fallback values:", gasError);
          userOp = {
            ...userOp,
            callGasLimit: 200_000n,
            verificationGasLimit: 200_000n,
            preVerificationGas: 50_000n,
          };
        }
      }

      console.log("Created ERC20 UserOperation:", userOp);

      // Sign the UserOperation
      const signature = await evmAccount.signUserOperation(userOp);
      userOp.signature = signature;
      console.log("Signed ERC20 UserOperation:", userOp);

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
      console.log("ERC20 UserOperation sent via Nostr!");

      return await txIdPromise;
    } catch (error) {
      console.error("ERC20 Transfer failed:", error);
      throw new Error(`ERC20 Transfer failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },

  async sendPYUSDTransfer(to: string, amount: bigint): Promise<string | null> {
    const currentNetwork = useGlobalState.getState().targetNetwork;
    const pyusdAddress = getPYUSDAddress(currentNetwork.id);

    console.log("sendPYUSDTransfer - Current Network:", {
      id: currentNetwork.id,
      name: currentNetwork.name,
      tokenAddress: pyusdAddress,
      tokenType: "PYUSD",
    });

    // Only support PYUSD on Arbitrum
    if (currentNetwork.id !== 42161) {
      throw new Error(
        `PYUSD is only supported on Arbitrum. Current network: ${currentNetwork.name} (Chain ID: ${currentNetwork.id})`,
      );
    }

    if (!pyusdAddress) {
      throw new Error(`PYUSD is not available on ${currentNetwork.name} (Chain ID: ${currentNetwork.id})`);
    }

    return this.sendERC20Transfer(pyusdAddress, to, amount);
  },

  parseAmountToWei(amountEth: string): bigint {
    if (!amountEth || Number.isNaN(Number(amountEth))) return 0n;
    return parseEther(amountEth as `${number}`);
  },

  parsePYUSDAmount(amountPYUSD: string): bigint {
    if (!amountPYUSD || Number.isNaN(Number(amountPYUSD))) return 0n;
    // PYUSD has 6 decimals
    return BigInt(Math.floor(Number(amountPYUSD) * 1_000_000));
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
