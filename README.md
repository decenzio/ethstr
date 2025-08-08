# ETHSTR

**One Key. Many Worlds.**
ETHSTR is a lightweight wallet technology that lets **any existing Nostr identity instantly work across the entire EVM-compatible ecosystem** — without creating new wallets, seed phrases, or installing extra apps.

If you already use Nostr (e.g. with Alby or Nos2x), you can send transactions, interact with DeFi, and use NFTs directly from your existing account. Your Nostr key becomes your blockchain key — same identity, verifiable security, zero extra setup.

---

## 🚀 Overview

ETHSTR removes the barrier between the social layer (Nostr) and the financial layer (EVM-compatible blockchains), making adoption faster, cheaper, and easier.

**Why it matters:**

* **No onboarding friction** — every Nostr user already has an address on all EVM-compatible chains.
* **No extra key management** — fewer risks of lost wallets or hacked seed phrases.
* **Works with tools people already use** — browser extensions and mobile apps that support Nostr work out of the box.
* **Opens new markets instantly** — millions of Nostr users can now access EVM-based applications in seconds.

---

## 🔑 Key Features

### Deterministic Addresses from any `npub`

* Nostr public key (`npub…`) deterministically maps to a checksummed EVM address.
* Same result every time, for every chain, verifiable by anyone.
* Chain-agnostic — works across all EVM-compatible blockchains.

If you have a Nostr account, you already have an EVM account — just unlock it with the same private key you use for Nostr events.

### Powered by ERC-4337 (Account Abstraction)

* Smart wallet features (planned): batched actions, sponsored gas, and social recovery.
* Your Nostr key stays the **single source of truth**; the smart account manages on-chain execution.

### Decentralized Bundler over Nostr

* We reimagined the ERC-4337 bundler as a **permissionless Nostr relay service**.
* Any relay can bundle user operations and push them on-chain.
* Keeps the mempool open, censorship-resistant, and without central control.

### Plug-and-Play API for Developers

* REST/Relay endpoint to fetch `npub → EVM address`.
* Simple TypeScript snippet for client-side calculation.
* 100% open — no proprietary SDKs.

---

## 🏗 Architecture

```
Nostr Identity Layer
        ↓
Deterministic Address Generation
        ↓
ERC-4337 Account Abstraction
        ↓
Decentralized Bundler (Nostr Relays)
        ↓
EVM-Compatible Blockchain Network
```

---

## 📦 Getting Started

### Prerequisites

* **Node.js** 18+
* A Nostr-compatible browser extension (e.g. Alby, Nos2x)
* Basic understanding of Nostr and EVM-compatible chains

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

---

## 🖥 Usage

1. **Connect your Nostr identity**
   Use any Nostr-compatible extension in your browser.
2. **Generate your EVM address**
   Your `npub` automatically maps to an EVM-compatible address.
3. **Start transacting**
   Use your Nostr key to sign transactions on any EVM-compatible blockchain.

---

## 📡 API Reference

### REST Endpoint

```
GET /api/v1/EVMAddress/npub123...
```

**Response:**

```json
{
    "EVM-address":"0x123..."
}
```

### Nostr Events

The service uses standard Nostr events for communication between relays and bundlers.

---

## 🛠 Development

This project is built with:

* **Next.js** — React framework
* **TypeScript** — Type safety
* **Tailwind CSS** — Styling
* **ERC-4337** — Account abstraction
* **Nostr Protocol** — Identity layer

---

## 🤝 Contributing

We welcome contributions! Please fork the repo and submit PRs or write us on hello@decenzio.com

---

## 🌍 Community

* [Nostr Profile](https://njump.me/nprofile1qqsyk69pchtd6g8yrj40u2a39599mftlymyxwn4tmpw7m4k5cczjhjgu54awh)
* [Telegram](https://t.me/+4eWtevhEqHg5N2Q0)
* Twitter: *Coming Soon*
