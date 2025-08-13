"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ArrowRightIcon, CpuChipIcon, GlobeAltIcon, KeyIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { DetailedChainSelector } from "~~/components/custom/ChainSelector";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        {/* Hero Section */}
        <div className="px-5 max-w-4xl mx-auto">
          <h1 className="text-center mb-8">
            <span className="block text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ETHSTR
            </span>
            <span className="block text-2xl text-base-content/80 font-medium">One Key. Many Worlds.</span>
          </h1>

          <p className="text-center text-xl text-base-content/70 max-w-3xl mx-auto mb-8 leading-relaxed">
            A revolutionary service that bridges <strong>Nostr identity</strong> with <strong>EVM functionality</strong>
            , allowing you to leverage your existing Nostr keys for EVM transactions without additional setup.
          </p>

          {connectedAddress && (
            <div className="flex justify-center items-center space-x-2 flex-col mb-8 p-6 bg-base-200 rounded-2xl">
              <p className="my-2 font-medium text-lg">Your EVM Address:</p>
              <Address address={connectedAddress} />
              <p className="text-sm text-base-content/60 mt-2">Deterministically generated from your Nostr identity</p>
            </div>
          )}

          <div className="text-center mb-12">
            <p className="text-lg text-base-content/80 mb-4">
              Any browser extension or mobile app that supports Nostr works out of the box
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <span className="badge badge-primary badge-lg">Alby</span>
              <span className="badge badge-primary badge-lg">Nos2x</span>
              <span className="badge badge-primary badge-lg">And more...</span>
            </div>
          </div>
        </div>

        {/* Chain Selection Section */}
        <div className="w-full px-5 mb-8">
          <div className="max-w-md mx-auto">
            <DetailedChainSelector />
          </div>
        </div>

        {/* Features Section */}
        <div className="grow bg-base-300 w-full mt-16 px-8 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
              {/* Deterministic Addresses */}
              <div className="flex flex-col bg-base-100 px-8 py-10 text-center items-center rounded-3xl shadow-lg">
                <KeyIcon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-4">🔑 Deterministic Addresses</h3>
                <p className="text-base-content/80 leading-relaxed">
                  Your Nostr public key (<code className="text-primary">npub…</code>) deterministically maps to a
                  checksummed EVM address. Same every time, for every chain. If you have a Nostr account, you already
                  have an Ethereum account.
                </p>
              </div>

              {/* Account Abstraction */}
              <div className="flex flex-col bg-base-100 px-8 py-10 text-center items-center rounded-3xl shadow-lg">
                <ShieldCheckIcon className="h-12 w-12 text-secondary mb-4" />
                <h3 className="text-xl font-bold mb-4">🔒 Account Abstraction</h3>
                <p className="text-base-content/80 leading-relaxed">
                  Built on ERC-4337 account abstraction with smart-wallet features like batched actions, sponsored gas,
                  and social recovery. Your Nostr key remains the source of truth.
                </p>
              </div>

              {/* Decentralized Bundler */}
              <div className="flex flex-col bg-base-100 px-8 py-10 text-center items-center rounded-3xl shadow-lg">
                <GlobeAltIcon className="h-12 w-12 text-accent mb-4" />
                <h3 className="text-xl font-bold mb-4">🌐 Decentralized Bundler</h3>
                <p className="text-base-content/80 leading-relaxed">
                  ERC-4337 bundler reimagined as a Nostr relay service. Any relay can pick up user operations, keeping
                  the mempool open, permissionless, and censorship-resistant.
                </p>
              </div>

              {/* Plug-and-Play API */}
              <div className="flex flex-col bg-base-100 px-8 py-10 text-center items-center rounded-3xl shadow-lg">
                <CpuChipIcon className="h-12 w-12 text-info mb-4" />
                <h3 className="text-xl font-bold mb-4">🔌 Plug-and-Play API</h3>
                <p className="text-base-content/80 leading-relaxed">
                  Hit our REST/Relay endpoint to fetch <code className="text-primary">npub</code> → EVM addresses. No
                  vendor lock-in, no proprietary SDK—just open JSON over familiar Nostr events.
                </p>
              </div>
            </div>

            {/* Architecture Flow */}
            <div className="bg-base-100 rounded-3xl p-8 mb-12">
              <h3 className="text-2xl font-bold text-center mb-8">How It Works</h3>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-2">
                    <span className="text-primary-content font-bold">1</span>
                  </div>
                  <span className="text-sm font-medium">Nostr Identity</span>
                </div>
                <ArrowRightIcon className="h-6 w-6 text-base-content/50 rotate-90 md:rotate-0" />
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-2">
                    <span className="text-secondary-content font-bold">2</span>
                  </div>
                  <span className="text-sm font-medium">Address Generation</span>
                </div>
                <ArrowRightIcon className="h-6 w-6 text-base-content/50 rotate-90 md:rotate-0" />
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-2">
                    <span className="text-accent-content font-bold">3</span>
                  </div>
                  <span className="text-sm font-medium">Account Abstraction</span>
                </div>
                <ArrowRightIcon className="h-6 w-6 text-base-content/50 rotate-90 md:rotate-0" />
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-info rounded-full flex items-center justify-center mb-2">
                    <span className="text-info-content font-bold">4</span>
                  </div>
                  <span className="text-sm font-medium">EVM Network</span>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-6">Ready to Get Started?</h3>
              <div className="flex justify-center gap-4 flex-wrap">
                <Link href="/debug" className="btn btn-primary btn-lg">
                  Try Debug Contracts
                </Link>
                <Link href="/blockexplorer" className="btn btn-outline btn-lg">
                  Explore Transactions
                </Link>
              </div>
              <p className="mt-6 text-base-content/60">
                Connect with any Nostr-compatible extension and start using your existing identity for EVM transactions
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
