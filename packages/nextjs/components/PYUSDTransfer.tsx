"use client";

import { useState } from "react";
import { AddressInput } from "~~/components/scaffold-eth";
import { transactionService } from "~~/services/sendTransactionService";
import { useGlobalState } from "~~/services/store/store";
import { tokenService } from "~~/services/tokenService";

interface PYUSDTransferProps {
  className?: string;
  onTransferComplete?: (txHash: string) => void;
  onTransferError?: (error: string) => void;
}

export const PYUSDTransfer = ({ className = "", onTransferComplete, onTransferError }: PYUSDTransferProps) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletAddress = useGlobalState(state => state.walletAddress);
  const targetNetwork = useGlobalState(state => state.targetNetwork);

  const handleTransfer = async () => {
    if (!recipient || !amount) {
      setError("Please fill in all fields");
      return;
    }

    if (!walletAddress) {
      setError("Wallet not connected");
      return;
    }

    if (!tokenService.isPYUSDSupported()) {
      setError(`PYUSD is not supported on ${targetNetwork.name}`);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const amountBigInt = tokenService.parsePYUSDAmount(amount);
      if (amountBigInt === 0n) {
        setError("Amount must be greater than 0");
        return;
      }

      console.log("Sending PYUSD transfer:", {
        to: recipient,
        amount: amountBigInt.toString(),
        amountFormatted: amount,
      });

      const txHash = await transactionService.sendPYUSDTransfer(recipient, amountBigInt);

      if (txHash) {
        console.log("PYUSD transfer successful:", txHash);
        onTransferComplete?.(txHash);

        // Reset form
        setRecipient("");
        setAmount("");
      } else {
        throw new Error("Transaction failed - no transaction hash returned");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Transfer failed";
      console.error("PYUSD transfer error:", errorMessage);
      setError(errorMessage);
      onTransferError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleTransfer();
    }
  };

  if (!tokenService.isPYUSDSupported()) {
    return (
      <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
        <p className="text-sm text-gray-500">PYUSD is not supported on {targetNetwork.name}</p>
      </div>
    );
  }

  return (
    <div className={`p-4 border border-gray-200 rounded-lg bg-white ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Send PYUSD</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
          <AddressInput value={recipient} onChange={setRecipient} placeholder="Enter recipient address" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount (PYUSD)</label>
          <input
            type="number"
            step="0.000001"
            min="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          onClick={handleTransfer}
          disabled={isLoading || !recipient || !amount}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Sending..." : "Send PYUSD"}
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">Gas fees will be paid from your accounts ETH balance</p>
      </div>
    </div>
  );
};

export default PYUSDTransfer;
