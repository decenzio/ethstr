"use client";

import { useCallback, useMemo, useState } from "react";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { AddressInput, EtherInput } from "~~/components/scaffold-eth";
import { useSelectedNetwork } from "~~/hooks/scaffold-eth/useSelectedNetwork";
import { transactionService } from "~~/services/sendTransactionService";
import { getBlockExplorerTxLink } from "~~/utils/scaffold-eth";

const WalletPage = () => {
  const { address: eoaAddress } = useAccount();
  const network = useSelectedNetwork();
  const [to, setTo] = useState<Address | string>("");
  const [amountEth, setAmountEth] = useState<string>("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleSend = useCallback(async () => {
    if (!to || !amountEth) return;
    setSending(true);
    setTxHash(null);
    try {
      const wei = transactionService.parseAmountToWei(amountEth);
      const hash = await transactionService.sendTransaction(to as string, wei);
      setTxHash(hash);
    } catch (err) {
      console.error(err);
      alert((err as Error).message || "Failed to send");
    } finally {
      setSending(false);
    }
  }, [to, amountEth]);

  const explorerLink = useMemo(() => (txHash ? getBlockExplorerTxLink(network.id, txHash) : ""), [txHash, network.id]);
  const isDisabled = useMemo(() => sending || !to || !amountEth, [sending, to, amountEth]);
  const disabledTitle = useMemo(() => {
    if (sending) return "Transaction in progress";
    if (!to && !amountEth) return "Enter recipient and amount";
    if (!to) return "Enter recipient";
    if (!amountEth) return "Enter amount";
    return "";
  }, [sending, to, amountEth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-light text-slate-900 dark:text-slate-100 mb-2">Wallet</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Send transactions securely with your smart account
          </p>
        </div>

        {/* Network Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Network</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{network.name}</p>
              </div>
            </div>
          </div>
          {eoaAddress && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Account</p>
                  <p className="font-mono text-sm text-slate-900 dark:text-slate-100 truncate">
                    {eoaAddress.slice(0, 6)}...{eoaAddress.slice(-4)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Transaction Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-8">Send Transaction</h2>

            <div className="space-y-6">
              {/* Recipient Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Recipient Address
                </label>
                <div className="relative">
                  <AddressInput name="to" placeholder="0x… or alice.eth" value={to} onChange={setTo} />
                </div>
              </div>

              {/* Amount Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Amount (ETH)
                </label>
                <div className="relative">
                  <EtherInput name="amount" placeholder="0.01" value={amountEth} onChange={setAmountEth} />
                </div>
              </div>

              {/* Send Button */}
              <div className="pt-4">
                <button
                  type="button"
                  className={`group relative w-full sm:w-auto px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                    isDisabled
                      ? "bg-slate-300 dark:bg-slate-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
                  } ${sending ? "animate-pulse" : ""}`}
                  onClick={handleSend}
                  disabled={isDisabled}
                  tabIndex={0}
                  aria-label="Send transaction"
                  aria-busy={sending}
                  aria-disabled={isDisabled}
                  title={disabledTitle}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    {!sending ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      >
                        <path d="M2.94 2.94a.75.75 0 0 1 .8-.17l13.5 5.25a.75.75 0 0 1 0 1.38l-13.5 5.25a.75.75 0 0 1-1.02-.87l1.5-5.25a.75.75 0 0 1 .52-.52l5.25-1.5a.25.25 0 0 0 0-.48l-5.25-1.5a.75.75 0 0 1-.52-.52l-1.5-5.25a.75.75 0 0 1 .22-.72Z" />
                      </svg>
                    ) : (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span className="font-medium">{sending ? "Sending Transaction..." : "Send Transaction"}</span>
                  </div>
                </button>
              </div>

              {/* Transaction Success Alert */}
              {txHash && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-600 dark:text-green-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                        Transaction Sent Successfully
                      </h3>
                      <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                        {explorerLink ? (
                          <a
                            className="font-mono hover:underline focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
                            href={explorerLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {txHash.slice(0, 10)}...{txHash.slice(-8)}
                          </a>
                        ) : (
                          <span className="font-mono">{txHash}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
