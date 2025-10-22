"use client";

import React from "react";
import Link from "next/link";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const handleKeyDownActivate: React.KeyboardEventHandler<HTMLElement> = event => {
    if (event.key === "Enter" || event.key === " ") {
      (event.currentTarget as HTMLElement).click();
      event.preventDefault();
    }
  };

  return (
    <>
      {/* Skip to content for keyboard/screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-base-100 focus:px-4 focus:py-2 focus:shadow-lg"
      >
        Skip to content
      </a>
      <main id="main-content" role="main" aria-label="Homepage" className="container mx-auto px-4 py-12 md:py-16">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-base-300 bg-gradient-to-br from-base-200/60 to-base-100/40 p-8 md:p-12 text-center shadow-sm mb-12">
          <div
            className="pointer-events-none absolute -inset-32 bg-[radial-gradient(ellipse_at_center,theme(colors.primary/15),transparent_60%)]"
            aria-hidden="true"
          />
          <h1
            className="text-5xl md:text-6xl font-bold mb-4 tracking-tight"
            tabIndex={0}
            aria-label="One Key. Many Worlds."
          >
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent dark:hidden">
              One Key. Many Worlds.
            </span>
            <span className="hidden dark:inline text-white drop-shadow-md">One Key. Many Worlds.</span>
          </h1>
          <p className="text-base md:text-lg opacity-80 max-w-3xl mx-auto">
            We sit directly on top of the Nostr identity layer, so the key that already signs your notes can now sign
            Ethereum transactions too. Any browser extension or mobile app that supports Nostr (Alby, Nos2x, etc.) works
            out of the box—no extra wallet, seed phrase, or plug-in required.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
          <Link
            href="/explorer"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-base font-medium text-primary-content shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Open Explorer"
            tabIndex={0}
            onKeyDown={handleKeyDownActivate}
          >
            Open Explorer
          </Link>
          <Link
            href="/wallet"
            className="inline-flex items-center justify-center rounded-lg bg-secondary px-5 py-2.5 text-base font-medium text-secondary-content shadow-sm transition-colors hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
            aria-label="Open Wallet"
            tabIndex={0}
            onKeyDown={handleKeyDownActivate}
          >
            Open Wallet
          </Link>
        </div>

        {/* Deterministic Addresses + Account Abstraction */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <section
            className="rounded-xl bg-base-200/60 border border-base-300 p-6 shadow-sm"
            aria-labelledby="deterministic-addresses"
          >
            <h2 id="deterministic-addresses" className="text-2xl font-semibold mb-2">
              Deterministic Addresses from any <code>npub</code>
            </h2>
            <p className="opacity-80">
              Your Nostr public key (<code>npub…</code>) deterministically maps to a checksummed EVM address. It’s the
              same every time, for every chain, and anyone can verify the math. If you have a Nostr account, you already
              have an Ethereum account—just unlock it with the key you’re using today.
            </p>
          </section>

          <section
            className="rounded-xl bg-base-200/60 border border-base-300 p-6 shadow-sm"
            aria-labelledby="account-abstraction"
          >
            <h2 id="account-abstraction" className="text-2xl font-semibold mb-2">
              Powered by Account Abstraction
            </h2>
            <p className="opacity-80 mb-3">The project is built on ERC-4337 account abstraction. That means:</p>
            <ul className="list-disc list-inside opacity-90 space-y-1">
              <li>Smart-wallet features like batched actions, sponsored gas, and social recovery (future).</li>
              <li>Your Nostr key remains the single source of truth, while the smart account handles on-chain work.</li>
            </ul>
          </section>
        </div>

        {/* Bundler */}
        <section
          className="rounded-xl bg-base-200/60 border border-base-300 p-6 mb-12 shadow-sm"
          aria-labelledby="nostr-bundler"
        >
          <h2 id="nostr-bundler" className="text-2xl font-semibold mb-2">
            A Decentralized Bundler—over Nostr
          </h2>
          <p className="opacity-80">
            We’ve re-imagined the ERC-4337 bundler as a Nostr relay service. Instead of a single operator, any relay can
            pick up user operations, bundle them, and push them on-chain—keeping the mempool open, permissionless, and
            censorship-resistant.
          </p>
        </section>

        {/* API */}
        <section className="rounded-xl bg-base-200/60 border border-base-300 p-6 mb-12 shadow-sm" aria-labelledby="api">
          <h2 id="api" className="text-2xl font-semibold mb-2">
            Plug-and-Play API
          </h2>
          <p className="opacity-80">
            Developers can hit our REST/Relay endpoint to fetch <code>npub</code> → EVM addresses. No vendor lock-in, no
            proprietary SDK—just open JSON over familiar Nostr events.
          </p>
        </section>

        {/* Vision */}
        <section className="rounded-xl bg-base-200/60 border border-base-300 p-6 mb-12 text-center shadow-sm">
          <p className="text-lg font-semibold">
            Every Nostr user is now an Ethereum user—instantly, securely, and without changing their daily workflow.
          </p>
          <p className="text-lg font-semibold">One identity, infinite possibilities.</p>
        </section>
      </main>
    </>
  );
};

export default Home;
