"use client";

import React, { useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/16/solid";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { transactionService } from "~~/services/custom/transactionService";

const SendDialog = ({ className, id }: { className?: string; id: string }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successHash, setSuccessHash] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setErrorMessage("");
    setSuccessHash("");
    setIsSending(true);
    try {
      const weiAmount = BigInt(Math.floor(parseFloat(amount) * 1e18));
      const txHash = await transactionService.sendTransaction(walletAddress, weiAmount);
      if (txHash) {
        setSuccessHash(txHash);
        const toast = document.createElement("div");
        toast.className = "toast toast-bottom toast-end z-50";
        toast.innerHTML = `
                    <div class="alert alert-success">
                      <span>Transaction was sent</span>
                    </div>
                  `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      } else {
        setErrorMessage("Transaction failed.");
      }
    } catch (error) {
      console.error("Error sending transaction:", error);
      setErrorMessage("Error sending transaction.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <dialog id={id} className={`modal ${className ?? ""}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Send to wallet address</h3>
        <form method="dialog" className="flex justify-center mt-4 flex-col">
          <fieldset className="fieldset w-full relative">
            <legend className="fieldset-legend">Wallet address</legend>
            <input
              type="text"
              className="input w-full"
              placeholder="Type wallet address here"
              value={walletAddress}
              onChange={e => setWalletAddress(e.target.value)}
            />
          </fieldset>
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend">Amount</legend>
            <input
              type="text"
              className="input w-full"
              placeholder="Amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            {errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
            {successHash && (
              <div className="w-full">
                <p className="text-green-500 text-sm mt-1 break-all">
                  Transaction sent!
                  <a
                    href={`https://basescan.org/tx/${successHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 underline mt-1 ml-2 underline hover:no-underline flex-inline items-center"
                  >
                    <span>Open in explorer.</span>{" "}
                    <ArrowTopRightOnSquareIcon className="inline h-4 w-4 ml-1 relative -top-[2px]" />
                  </a>
                </p>
              </div>
            )}
          </fieldset>
          <div className="flex justify-end gap-4 w-full mt-5">
            {isSending ? (
              <div className="btn btn-disabled loading">Sending...</div>
            ) : (
              <>
                <button className="btn">Close</button>
                <button type="button" className="btn btn-secondary" onClick={handleSend}>
                  <PaperAirplaneIcon className="h-6 w-6 -ml-2 inline" />
                  Send to this address
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default SendDialog;
