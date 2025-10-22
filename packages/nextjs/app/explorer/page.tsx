"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { NextPage } from "next";
import type { Address as ViemAddress } from "viem";
import { Address as AddressDisplay, Balance } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getEvmAddressFromNpub } from "~~/services/evmAddressService";

const ExplorerPage: NextPage = () => {
  const [npubInput, setNpubInput] = useState("");
  const [resolvedAddress, setResolvedAddress] = useState<ViemAddress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { targetNetwork } = useTargetNetwork();

  const isSubmitDisabled = useMemo(() => {
    if (isLoading) return true;
    return npubInput.trim().length === 0;
  }, [isLoading, npubInput]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const value = npubInput.trim();
    if (!value) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setErrorMessage(null);
    setResolvedAddress(null);

    try {
      const address = await getEvmAddressFromNpub(value, { signal: controller.signal });
      setResolvedAddress(address);
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      setErrorMessage((err as Error)?.message || "Failed to resolve address");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) return;
    abortControllerRef.current?.abort();
    setIsLoading(false);
  };

  const handleReset = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setResolvedAddress(null);
    setErrorMessage(null);
    setNpubInput("");
  };

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="w-full max-w-xl px-4">
          <h1 className="text-2xl font-semibold mb-4">EVM Address Explorer</h1>

          <form onSubmit={handleSubmit} className="space-y-3" aria-label="Resolve EVM address from npub">
            <label htmlFor="npub" className="label">
              <span className="label-text">npub</span>
            </label>
            <input
              id="npub"
              name="npub"
              type="text"
              value={npubInput}
              onChange={e => setNpubInput(e.target.value)}
              placeholder="Enter nostr npub..."
              className="input input-bordered w-full"
              aria-required="true"
              aria-invalid={Boolean(errorMessage)}
            />

            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={isSubmitDisabled} aria-busy={isLoading}>
                {isLoading ? "Resolving..." : "Resolve"}
              </button>
              <button type="button" className="btn" onClick={handleCancel} disabled={!isLoading}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleReset}
                disabled={!npubInput && !resolvedAddress && !errorMessage}
              >
                Reset
              </button>
            </div>
          </form>

          <div className="mt-6 min-h-[4rem]" aria-live="polite" aria-atomic="true">
            {errorMessage && (
              <div className="alert alert-error">
                <span className="text-sm">{errorMessage}</span>
              </div>
            )}
            {!errorMessage && isLoading && (
              <div className="flex items-center gap-2 text-sm">
                <span className="loading loading-spinner loading-sm" aria-hidden="true"></span>
                <span>Resolving address...</span>
              </div>
            )}
            {!errorMessage && !isLoading && resolvedAddress && (
              <div className="card bg-base-200">
                <div className="card-body p-4">
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm mb-1 block">Resolved Address</span>
                      <AddressDisplay address={resolvedAddress} format="long" size="lg" />
                    </div>
                    <div className="divider my-2"></div>
                    <div>
                      <span className="text-sm mb-2 block">Balance on {targetNetwork.name}</span>
                      <Balance address={resolvedAddress} className="text-lg" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ExplorerPage;
