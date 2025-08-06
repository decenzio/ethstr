"use client";

import React from "react";
import type { NextPage } from "next";
import { MagnifyingGlassCircleIcon } from "@heroicons/react/16/solid";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { ErrorDialog, ReceiveDialog, SearchWalletAddressDialog, SendDialog, WalletCard } from "~~/components/import";
import { connectService } from "~~/services/custom/connectService";
import { useGlobalState } from "~~/services/store/store";

const Wallet: NextPage = () => {
  const [pubkey, setPubkey] = React.useState<string | null>(null);
  const [showSkull, setShowSkull] = React.useState(false);
  const [bouncing, setBouncing] = React.useState(false);
  const [isNostrAvalaible, setNostrAvalaible] = React.useState(false);

  const nPubkey = useGlobalState(state => state.nPubkey);

  // Listening to nostr pubkey changes
  React.useEffect(() => {
    const handlePubkeyChange = (event: CustomEvent<string>) => {
      setPubkey(event.detail);
    };

    window.addEventListener("nostr:pubkey", handlePubkeyChange as EventListener);

    // @ts-ignore
    setNostrAvalaible(!!window.nostr);

    if (nPubkey) {
      setPubkey(nPubkey);
    } else {
      setPubkey(null);
    }
    return () => {
      window.removeEventListener("nostr:pubkey", handlePubkeyChange as EventListener);
    };
  }, [nPubkey]);

  const handleConnectButton = async () => {
    const response = await connectService.connect();
    if (!response) {
      const errorDialog = document.getElementById("error-modal") as HTMLDialogElement | null;
      if (errorDialog) {
        errorDialog.showModal();
        const titleElem = errorDialog.querySelector("h3");
        const descElem = errorDialog.querySelector("p");
        if (titleElem) titleElem.textContent = "Connection Error";
        if (descElem) descElem.textContent = "Unable to connect to Nostr extension.";
      }
    }
  };

  const handleOpenModal = (id: string) => {
    const modal = document.getElementById(id) as HTMLDialogElement | null;
    if (modal) {
      modal.showModal();
    }
  };

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        {pubkey ? (
          // Connected State - Wallet Interface
          <div className="px-5 max-w-4xl mx-auto w-full">
            {/* Wallet Header */}
            <div className="text-center mb-12">
              <h1 className="text-center mb-8">
                <span className="block text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent opacity-0 animate-slideIn">
                  Your ETHSTR Wallet
                </span>
                <span className="block text-xl text-base-content/80 font-medium opacity-0 animate-slideIn delay-200">
                  Nostr-powered EVM transactions
                </span>
              </h1>
            </div>

            {/* Wallet Card Section */}
            <div className="flex justify-center mb-12">
              <div className="w-full max-w-md">
                <WalletCard className="opacity-0 animate-slideIn delay-300" />
              </div>
            </div>

            {/* Additional Actions */}
            <div className="text-center">
              <button
                className="btn btn-primary btn-lg opacity-0 animate-slideIn delay-500"
                onClick={() => handleOpenModal("wallet-search-modal")}
              >
                <MagnifyingGlassCircleIcon className="h-6 w-6 mr-2" />
                Get address from npub
              </button>
            </div>
          </div>
        ) : (
          // Disconnected State - Connection Interface
          <>
            {/* Hero Section */}
            <div className="px-5 max-w-4xl mx-auto">
              <h1 className="text-center mb-8">
                <span className="block text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent opacity-0 animate-slideIn">
                  ETHSTR Wallet
                </span>
                <span className="block text-2xl text-base-content/80 font-medium opacity-0 animate-slideIn delay-200">
                  Your Nostr identity, now with EVM superpowers
                </span>
              </h1>

              {/* Greeting Section */}
              <div className="text-center mb-12">
                <p className="text-4xl md:text-5xl font-bold text-base-content mb-6 opacity-0 animate-slideIn delay-300">
                  {showSkull ? "Bye " : "Hello "}
                  <span
                    className={`cursor-pointer inline-block transition-transform duration-200 ${bouncing ? "scale-125" : ""}`}
                    onClick={() => {
                      setShowSkull(true);
                      setBouncing(true);
                      setTimeout(() => setBouncing(false), 300);
                    }}
                  >
                    {showSkull ? "💀" : "👋"}
                  </span>
                </p>

                <p className="text-xl text-base-content/70 max-w-3xl mx-auto mb-8 leading-relaxed opacity-0 animate-slideIn delay-500">
                  To continue, please{" "}
                  <span
                    className="underline decoration-primary decoration-2 hover:no-underline cursor-pointer text-primary hover:text-primary-focus transition-colors font-semibold"
                    onClick={handleConnectButton}
                  >
                    connect
                  </span>{" "}
                  to your Nostr account.
                </p>
              </div>

              {/* Connection Info */}
              <div className="text-center mb-12 opacity-0 animate-slideIn delay-700">
                <p className="text-lg text-base-content/80 mb-4">
                  Any browser extension or mobile app that supports Nostr works out of the box
                </p>
                <div className="flex justify-center gap-3 flex-wrap">
                  <span className="badge badge-primary badge-lg">Alby</span>
                  <span className="badge badge-primary badge-lg">Nos2x</span>
                  <span className="badge badge-primary badge-lg">And more...</span>
                </div>
              </div>

              {/* Connect Button */}
              <div className="text-center mb-16 opacity-0 animate-slideIn delay-1000">
                <button className="btn btn-secondary btn-lg mr-4 group" onClick={handleConnectButton}>
                  Connect to Nostr
                  <ArrowRightIcon className="h-6 w-6 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Alternative Section */}
            <div className="grow bg-base-300 w-full mt-16 px-8 py-16">
              <div className="max-w-6xl mx-auto">
                {isNostrAvalaible ? (
                  <div className="text-center opacity-0 animate-slideIn delay-1200">
                    <div className="bg-base-100 rounded-3xl p-8 shadow-lg max-w-2xl mx-auto">
                      <h3 className="text-2xl font-bold mb-6">Alternative Access</h3>
                      <p className="text-base-content/80 mb-6">Just search for a wallet address using an npub</p>
                      <button
                        className="btn btn-outline btn-primary btn-lg"
                        onClick={() => handleOpenModal("wallet-search-modal")}
                      >
                        <MagnifyingGlassCircleIcon className="h-6 w-6 mr-2" />
                        Search by npub
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center opacity-0 animate-slideIn delay-1200">
                    <div className="bg-base-100 rounded-3xl p-8 shadow-lg max-w-2xl mx-auto">
                      <div className="alert alert-warning">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="stroke-current shrink-0 h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.081 16.5c-.77.833.192 2.5 1.731 2.5z"
                          />
                        </svg>
                        <div>
                          <h3 className="font-bold">No Nostr Extension Detected</h3>
                          <div className="text-sm">Install Alby, Nos2x, or another Nostr-compatible extension</div>
                        </div>
                      </div>
                      <div className="mt-6">
                        <button
                          className="btn btn-outline btn-primary"
                          onClick={() => handleOpenModal("wallet-search-modal")}
                        >
                          <MagnifyingGlassCircleIcon className="h-6 w-6 mr-2" />
                          Search by npub anyway
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 opacity-0 animate-slideIn delay-1500">
                  <div className="flex flex-col bg-base-100 px-6 py-8 text-center items-center rounded-3xl shadow-lg">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                      <span className="text-primary-content font-bold text-xl">🔑</span>
                    </div>
                    <h4 className="font-bold mb-2">One Key</h4>
                    <p className="text-sm text-base-content/70">Use your existing Nostr key for EVM transactions</p>
                  </div>

                  <div className="flex flex-col bg-base-100 px-6 py-8 text-center items-center rounded-3xl shadow-lg">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4">
                      <span className="text-secondary-content font-bold text-xl">⚡</span>
                    </div>
                    <h4 className="font-bold mb-2">No Setup</h4>
                    <p className="text-sm text-base-content/70">No additional wallets or seed phrases needed</p>
                  </div>

                  <div className="flex flex-col bg-base-100 px-6 py-8 text-center items-center rounded-3xl shadow-lg">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4">
                      <span className="text-accent-content font-bold text-xl">🌐</span>
                    </div>
                    <h4 className="font-bold mb-2">Many Chains</h4>
                    <p className="text-sm text-base-content/70">Same address works across all EVM networks</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <ReceiveDialog id="receive-modal" />
      <SendDialog id="send-modal" />
      <ErrorDialog id="error-modal" title="Connection Error" description="Unable to connect to the Nostr extension." />
      <SearchWalletAddressDialog id="wallet-search-modal" />
    </>
  );
};

export default Wallet;
