"use client";

import React from "react";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import { CopyButton } from "~~/components/import";
import { toNostrSmartAccount } from "~~/services/custom/evm-account/nostrSmartAccount";
import { nostrService } from "~~/services/custom/nostr/nostrService";
import { useGlobalState } from "~~/services/store/store";

const SearchWalletAddressDialog = ({ className, id }: { className?: string; id: string }) => {
  const [inputValue, setInputValue] = React.useState("");
  const [resolvedAddress, setResolvedAddress] = React.useState<string | null>(null);
  const [showShimmer, setShowShimmer] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  let publicClient = useGlobalState((state: any) => state.publicClient);

  const onSearch = async () => {
    if (!publicClient) {
      publicClient = createPublicClient({
        chain: base,
        transport: http("https://base-mainnet.public.blastapi.io"),
      });
    }

    if (!inputValue) {
      setErrorMessage("Input value is empty.");
      return;
    }

    try {
      const decodedValue = nostrService.getNostrPubkey(inputValue);

      const account = await toNostrSmartAccount({
        client: publicClient,
        owner: `0x${decodedValue}`,
      });

      const address = await account.getAddress();
      setInputValue("");
      setResolvedAddress(address);
      setErrorMessage(null);
    } catch (e) {
      console.error("Something went wrong", e);
      setErrorMessage("Invalid address or network error. Please try again.");
    }
    setShowShimmer(true);
    setTimeout(() => setShowShimmer(false), 1500);
  };

  return (
    <dialog id={id} className={`modal ${className ?? ""}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Type Nostr npub to display EVM wallet address</h3>
        <form method="dialog" className="flex flex-col items-center justify-center mt-4 gap-6 ">
          <label className="input w-full">
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input
              type="search"
              className="grow input-lg"
              placeholder="Type npub"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
            />
          </label>
          {errorMessage && <div className="text-error text-sm w-full text-left">{errorMessage}</div>}
          {resolvedAddress && (
            <div className="card w-full relative overflow-hidden bg-accent-content shadow-xl text-white w-110 transition-transform duration-300 ease-out">
              {showShimmer && <div className="shimmer-overlay"></div>}
              <button
                type="button"
                onClick={() => setResolvedAddress(null)}
                className="absolute top-2 right-4 text-white text-sm opacity-60 hover:opacity-100 cursor-pointer"
                aria-label="Close"
              >
                ×
              </button>
              <div className="card-body">
                <div className="card-title">Wallet Address:</div>
                <div className="flex carousel-item gap-2">
                  <CopyButton value={resolvedAddress} />
                  {resolvedAddress}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-4 w-full">
            <button className="btn">Close</button>
            <button type="button" className="btn btn-secondary" onClick={onSearch}>
              <MagnifyingGlassIcon className="h-6 w-6 -ml-2 inline" />
              Get
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default SearchWalletAddressDialog;
