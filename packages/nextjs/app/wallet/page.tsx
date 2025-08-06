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
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto flex-grow">
        <div className="flex flex-col gap-5 min-h-[calc(100vh-200px)]">
          {pubkey ? (
            <div className="flex flex-col gap-8 items-center justify-center pb-10 grow h-fill">
              <div className="w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-8 opacity-0 animate-slideIn">Your ETHSTR Wallet</h1>
                <WalletCard className="opacity-0 animate-slideIn delay-200" />
              </div>
              <button
                className="btn btn-lg btn-primary animate-slideIn delay-400"
                onClick={() => handleOpenModal("wallet-search-modal")}
              >
                <MagnifyingGlassCircleIcon className="h-6 w-6 mr-2 inline" />
                Get address from npub
              </button>
            </div>
          ) : (
            <div className="px-6 md:px-20 flex flex-col gap-4 m-auto w-fit justify-center items-start grow h-fill text-2xl md:text-4xl">
              <div className="flex flex-col gap-4 animate-fadeIn items-start max-w-2xl">
                <div className="text-center w-full mb-4">
                  <h1 className="text-3xl md:text-5xl font-bold mb-4 opacity-0 animate-slideIn">ETHSTR Wallet</h1>
                  <p className="text-lg text-base-content/70 opacity-0 animate-slideIn delay-200">
                    Your Nostr identity, now with EVM superpowers
                  </p>
                </div>

                <p className="text-3xl md:text-5xl m-0 opacity-0 animate-slideIn delay-300">
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

                <p className="m-0 opacity-0 animate-slideIn delay-500 text-xl md:text-4xl leading-relaxed">
                  to continue, <br />
                  please{" "}
                  <u
                    className="hover:no-underline cursor-pointer text-primary hover:text-primary-focus transition-colors"
                    onClick={handleConnectButton}
                  >
                    connect
                  </u>{" "}
                  to your Nostr account.
                </p>

                <div className="opacity-0 animate-slideIn delay-1000 w-full">
                  <button
                    className="btn btn-lg btn-secondary mt-5 hover:gap-4 transition-all w-fit group"
                    onClick={handleConnectButton}
                  >
                    Connect
                    <ArrowRightIcon className="h-6 w-6 ml-2 inline group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className={`w-full ${isNostrAvalaible ? "opacity-0 animate-slideIn delay-1500" : "opacity-0"}`}>
                  <hr className="opacity-20 mt-8 mb-6" />
                  <div className="opacity-70 text-base hover:opacity-100 transition-all">
                    <div className="mb-4 text-lg">Or just search for a wallet address using an npub.</div>
                    <button
                      className="btn btn-outline hover:btn-primary transition-all"
                      onClick={() => handleOpenModal("wallet-search-modal")}
                    >
                      <MagnifyingGlassCircleIcon className="h-6 w-6 mr-2 inline" />
                      Get address from npub
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ReceiveDialog id="receive-modal" />
      <SendDialog id="send-modal" />
      <ErrorDialog id="error-modal" title="Connection Error" description="Unable to connect to the Nostr extension." />
      <SearchWalletAddressDialog id="wallet-search-modal" />
    </div>
  );
};

export default Wallet;
