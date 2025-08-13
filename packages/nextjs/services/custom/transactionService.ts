// import { entryPoint08Abi, entryPoint08Address } from "viem/account-abstraction";
// import { nostrBundlerService } from "~~/services/nostrBundlerService";
import { getChainConfig } from "../../../../chains.config";
import { useGlobalState } from "~~/services/store/store";

export const transactionService = {
  async sendTransaction(to: string, amount: bigint): Promise<string | null> {
    console.log("🚀 Starting transaction:", { to, amount: amount.toString() });

    const state = useGlobalState.getState();
    const publicClient = state.publicClient;
    const bundlerClient = state.bundlerClient;
    const evmAccount = state.evmAccount;
    const selectedChain = state.selectedChain;

    console.log("📊 Current state:", {
      hasPublicClient: !!publicClient,
      hasBundlerClient: !!bundlerClient,
      hasEvmAccount: !!evmAccount,
      selectedChain,
      accountAddress: evmAccount ? await evmAccount.getAddress().catch(() => "unknown") : "no account",
    });

    if (!publicClient || !bundlerClient || !evmAccount) {
      throw new Error("Missing required clients or account. Please connect your wallet first.");
    }

    try {
      // Check account balance first
      const accountAddress = await evmAccount.getAddress();
      const balance = await publicClient.getBalance({ address: accountAddress });
      console.log("💰 Account balance:", balance.toString(), "wei");

      if (balance === 0n) {
        throw new Error(`Account has no balance. Please fund your account: ${accountAddress}`);
      }

      if (balance < amount) {
        throw new Error(`Insufficient balance. Account: ${balance.toString()} wei, Required: ${amount.toString()} wei`);
      }

      const estimateFees = await publicClient.estimateFeesPerGas();
      console.log("⛽ Estimated fees:", {
        maxFeePerGas: estimateFees.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: estimateFees.maxPriorityFeePerGas?.toString(),
      });

      // Estimate gas for the actual call
      const callGasEstimate = await publicClient.estimateGas({
        account: accountAddress,
        to,
        value: amount,
        data: "0x",
      });

      // Check if this is the first transaction (account deployment needed)
      const accountCode = await publicClient.getBytecode({ address: accountAddress });
      const isDeployment = !accountCode || accountCode === "0x";

      // Set even higher gas limits for deployment - the previous values might still be too low
      const verificationGasLimit = isDeployment ? 1000000n : 150000n; // Much higher for deployment
      const preVerificationGas = isDeployment ? 200000n : 60000n; // Higher for deployment overhead

      console.log("🔍 Account deployment check:", {
        accountAddress,
        accountCode: accountCode || "0x",
        codeLength: accountCode?.length || 0,
        isDeployment,
        selectedChain,
      });

      // If this is a deployment, let's validate the factory contract
      if (isDeployment) {
        try {
          const chainConfig = getChainConfig(selectedChain);
          const factoryAddress = chainConfig.contracts?.npubAccountFactory;

          if (factoryAddress) {
            const factoryCode = await publicClient.getBytecode({ address: factoryAddress as `0x${string}` });
            console.log("🏭 Factory contract check:", {
              factoryAddress,
              hasFactoryCode: !!factoryCode && factoryCode !== "0x",
              factoryCodeLength: factoryCode?.length || 0,
            });

            if (!factoryCode || factoryCode === "0x") {
              throw new Error(`Factory contract not deployed at ${factoryAddress} on ${selectedChain}`);
            }
          } else {
            console.warn("⚠️ No factory address found in chain config");
          }
        } catch (error) {
          console.error("❌ Factory validation failed:", error);
        }
      }

      console.log("⛽ Gas estimates:", {
        callGasEstimate: callGasEstimate.toString(),
        verificationGasLimit: verificationGasLimit.toString(),
        preVerificationGas: preVerificationGas.toString(),
        isDeployment,
        accountHasCode: !!accountCode && accountCode !== "0x",
      });

      console.log("📤 Sending transaction via bundlerClient...");
      const txHash = await bundlerClient.sendTransaction({
        to, // address you want to send to
        value: amount, // amount in wei (e.g., 0.01 ETH)
        data: "0x", // optional calldata, '0x' for simple ETH transfer
        maxFeePerGas: estimateFees.maxFeePerGas ? estimateFees.maxFeePerGas * 15n : undefined,
        maxPriorityFeePerGas: 1250000n,
        // Add gas limits for UserOperation
        verificationGasLimit, // Much higher for account deployment
        callGasLimit: callGasEstimate + 20000n, // Add more buffer to estimate
        preVerificationGas, // Higher for deployment overhead
      });

      console.log("✅ Transaction sent successfully:", txHash);
      return txHash;
    } catch (error) {
      console.error("❌ Transaction failed:", error);

      // Extract more specific error information
      if (error instanceof Error) {
        if (error.message.includes("AA13 initCode failed or OOG")) {
          throw new Error(
            "Smart account deployment failed due to insufficient gas. The account factory might be invalid or the deployment ran out of gas. Please try again or contact support if the issue persists.",
          );
        }
        if (error.message.includes("InitCodeFailedError") || error.message.includes("Failed to simulate deployment")) {
          throw new Error(
            "Smart account deployment simulation failed. This could be due to invalid factory configuration or insufficient gas limits. Please check your setup and try again.",
          );
        }
        if (error.message.includes("UserOperationExecutionError")) {
          throw new Error(
            "Transaction simulation failed. This might be due to insufficient funds, incorrect contract addresses, or network issues. Please check your account balance and try again.",
          );
        }
        if (error.message.includes("simulation")) {
          throw new Error(
            "Transaction simulation failed. Please ensure your account has sufficient funds and is properly deployed.",
          );
        }
        if (error.message.includes("0x")) {
          throw new Error(
            "Smart contract execution reverted. Please check the recipient address and ensure your account has sufficient balance.",
          );
        }
      }

      throw error;
    }
  },
};
