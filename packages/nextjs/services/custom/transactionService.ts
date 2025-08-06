// import { entryPoint08Abi, entryPoint08Address } from "viem/account-abstraction";
// import { nostrBundlerService } from "~~/services/nostrBundlerService";
import { useGlobalState } from "~~/services/store/store";

export const transactionService = {
  async sendTransaction(to: string, amount: bigint): Promise<string | null> {
    const publicClient = useGlobalState.getState().publicClient;

    const bundlerClient = useGlobalState.getState().bundlerClient;
    // const account = useGlobalState.getState().evmAccount;

    const estimateFees = await publicClient.estimateFeesPerGas();

    // const userOp = await bundlerClient.prepareUserOperation({
    //   account: account as any,
    //   calls: [
    //     {
    //       to,
    //       value: amount,
    //       data: "0x",
    //     },
    //   ],
    //   maxFeePerGas: estimateFees.maxFeePerGas * 15n,
    //   maxPriorityFeePerGas: 1250000n,
    // });
    // console.log("Created UserOperation:", userOp);
    //
    // const signature = await account.signUserOperation(userOp as any);
    // userOp.signature = signature;
    // //@ts-ignore
    // delete userOp.account;
    // console.log("Signed user op: ", userOp);
    //
    // const txIdPromise = new Promise<string>((resolve, reject) => {
    //   let unsubscribe: () => void;
    //   // eslint-disable-next-line prefer-const
    //   unsubscribe = publicClient.watchContractEvent({
    //     address: entryPoint08Address,
    //     abi: entryPoint08Abi,
    //     eventName: "UserOperationEvent",
    //     args: { sender: account.address },
    //     onLogs: (logs: any) => {
    //       console.log("Logs event:", logs);
    //       resolve(logs[0].transactionHash);
    //       unsubscribe();
    //     },
    //     onError: (err: any) => reject(err),
    //   });
    // });
    //
    // await nostrBundlerService.sendUserOp(userOp);
    // console.log("Sent over nostr!");
    //
    // return await txIdPromise;

    //Don't send transaction through nasty centralized bundler!!!
    return await bundlerClient.sendTransaction({
      to, // address you want to send to
      value: amount, // amount in wei (e.g., 0.01 ETH)
      data: "0x", // optional calldata, '0x' for simple ETH transfer
      maxFeePerGas: estimateFees.maxFeePerGas * 15n,
      maxPriorityFeePerGas: 1250000n,
    });
  },
};
