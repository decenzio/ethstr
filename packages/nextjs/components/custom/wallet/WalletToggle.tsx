import React from "react";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useGlobalState } from "~~/services/store/store";

const WalletToggle = ({ className }: { className?: string }) => {
  const walletAddress = useGlobalState(state => state.walletAddress);
  const nPubkey = useGlobalState(state => state.nPubkey);

  const handleCopy = async (value: string) => {
    navigator.clipboard.writeText(value);
    const toast = document.createElement("div");
    toast.className = "toast toast-bottom toast-end z-50";
    toast.innerHTML = `
                    <div class="alert alert-success">
                      <span>Copied to clipboard</span>
                    </div>
                  `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const WalletField = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col">
      <span className="font-bold">{label}</span>
      <span
        className="flex gap-1 items-center tooltip tooltip-left cursor-pointer"
        onClick={() => handleCopy(value)}
        data-tip="Copy"
      >
        <button>
          <DocumentDuplicateIcon className="h-[15px] opacity-[.4] hover:opacity-100  transition-all" />
        </button>
        {value}
      </span>
    </div>
  );

  return (
    <div className={`dropdown dropdown-left ${className ?? ""}`}>
      <div
        tabIndex={0}
        role="button"
        className="btn btn-secondary btn-dash m-1 tooltip tooltip-bottom"
        data-tip="Display wallet information"
      >
        {`${nPubkey.slice(0, 6)}…${nPubkey.slice(-6)}`}
      </div>
      <div tabIndex={0} className="dropdown-content card card-md bg-accent-content/30 backdrop-blur-lg z-1 shadow-lg">
        {walletAddress && (
          <div className="card-body space-y-2 text-sm text-neutral-content">
            <span className="font-bold opacity-[.6]">Connected wallet information</span>
            <WalletField label="Nostr Pubkey" value={nPubkey} />
            <WalletField label="Wallet Address" value={walletAddress} />
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletToggle;
