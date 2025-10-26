# ethstr

A monorepo containing Ethereum smart contracts (Hardhat) and a Next.js frontend plus a Nostr bundler/relay component. This project collects tooling and example apps used during development and testing.

About this project
ethstr2 demonstrates identity-first account abstraction by integrating the Nostr protocol with ERC-4337 smart accounts. Users can control on-chain smart accounts using Nostr keys (npub) via a Next.js UI, while a Bundler/Relay component helps package and relay transactions. Built as a compact ETHGlobal submission showcasing Nostr-based authentication for Ethereum.

Quick and simple instructions

Prerequisites

- Node.js (LTS, e.g. v18+)

Package manager

- This repo is set up to use Yarn. There's a `yarn.lock` at the repo root and the root `package.json` declares `packageManager: "yarn"`.

Install dependencies (preferred)

Run these from the repository root:

```bash
yarn install
```

Install per-package (if needed):

```bash
cd packages/hardhat && yarn install
cd ../nextjs && yarn install
```

Common tasks

- Compile & test contracts (Hardhat):

```bash
cd packages/hardhat
npx hardhat compile
npx hardhat test
```

-- Run the frontend locally:

```bash
cd packages/nextjs
yarn dev
```

Notes

- See `packages/hardhat` and `packages/nextjs` for package-specific scripts and configuration.
- Note: `packages/nostr-bundler-relay` contains a `package-lock.json` (created by an `npm install` at some point). The canonical project setup uses Yarn — you can safely remove that `package-lock.json` if you want to avoid confusion.
