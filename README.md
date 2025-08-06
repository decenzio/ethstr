# ETHSTR

**One Key. Many Worlds.** A revolutionary service that bridges Nostr identity with EVM functionality, allowing users to leverage their existing Nostr keys for EVM transactions without additional setup.

## Overview

We sit directly on top of the Nostr identity layer, enabling the key that already signs your notes to sign EVM transactions too. Any browser extension or mobile app that supports Nostr (Alby, Nos2x, etc.) works out of the box - no extra wallet, seed phrase, or plug-in required.

## Key Features

### 🔑 Deterministic Addresses from any `npub`

Your Nostr public key (`npub…`) deterministically maps to a checksummed EVM address. It's the same every time, for every chain, and anyone can verify the math. If you have a Nostr account, you already have an Ethereum account—just unlock it with the key you're using today.

### 🔒 Powered by Account Abstraction

The project is built on ERC-4337 account abstraction, providing:

- Smart-wallet features like batched actions, sponsored gas, and social recovery (coming soon)
- Your Nostr key remains the single source of truth, while the smart account handles the heavy lifting on-chain

### 🌐 Decentralized Bundler—over Nostr

We've re-imagined the ERC-4337 bundler as a Nostr relay service. Instead of a single operator, any relay can pick up user operations, bundle them, and push them on-chain—keeping the mempool open, permissionless, and censorship-resistant.

### 🔌 Plug-and-Play API

Developers can hit our REST/Relay endpoint to fetch `npub` → EVM addresses. No vendor lock-in, no proprietary SDK—just open JSON over familiar Nostr events.

## Getting Started

### Prerequisites

- Node.js 18+
- A Nostr-compatible browser extension (Alby, Nos2x, etc.)
- Basic understanding of Nostr and Ethereum

### Installation

```bash
# Clone the repository
git clone https://github.com/decenzio/ethstr.git

# Navigate to the project directory
cd ethstr

# Install dependencies
yarn install

# Start the development server
yarn run dev
```

### Usage

1. **Connect your Nostr identity**: Use any Nostr-compatible extension
2. **Generate your EVM address**: Your `npub` automatically maps to an EVM address
3. **Start transacting**: Use your existing Nostr key to sign EVM transactions

## Architecture

```
Nostr Identity Layer
        ↓
Deterministic Address Generation
        ↓
ERC-4337 Account Abstraction
        ↓
Decentralized Bundler (Nostr Relays)
        ↓
Ethereum (or other EVM) Network
```

## API Reference

### REST Endpoint

```
GET /api/address/:npub
```

Returns the corresponding EVM address for a given Nostr public key.

### Nostr Events

The service uses standard Nostr events for communication between relays and bundlers.

## Development

This project is built with:

- **Next.js** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **ERC-4337** - Account abstraction
- **Nostr Protocol** - Identity layer

## Contributing

We welcome contributions!

## Community

- [Nostr](https://njump.me/nprofile1qqsyk69pchtd6g8yrj40u2a39599mftlymyxwn4tmpw7m4k5cczjhjgu54awh)
- [Telegram](https://t.me/+4eWtevhEqHg5N2Q0)
- Twitter: [Coming Soon]
