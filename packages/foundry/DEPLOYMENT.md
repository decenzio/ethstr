# Nostr Account Abstraction - Deployment

Simple deployment for Nostr-to-EVM account abstraction using ERC-4337.

## Quick Start

### 1. Setup

```bash
# Install and build
make setup

# Set your private key
export PRIVATE_KEY=0x...
```

### 2. Deploy

```bash
# Deploy to Sepolia testnet (recommended first)
make deploy-sepolia

# Deploy to Base mainnet
make deploy-base

# Deploy to CoreDAO mainnet
make deploy-coredao
```

## What it does

- Deploys `NpubAccountFactory` - creates Nostr-based EVM accounts
- Deploys `NpubAccount` implementation - the actual account logic
- Uses ERC-4337 v0.7 EntryPoint: `0x0000000071727De22E5E9d8BAf0edAc6f37da032`

## Deployment info

Contract addresses are saved to `deployments/{chain}.json`:

```json
{
  "chain": "sepolia",
  "factoryAddress": "0x...",
  "implementationAddress": "0x...",
  "entryPoint": "0x0000000071727De22E5E9d8BAf0edAc6f37da032"
}
```

## Supported Chains

- **Sepolia** - Ethereum testnet (free, for testing)
- **Base** - Layer 2 mainnet (low fees)
- **CoreDAO** - Bitcoin-aligned EVM chain

## View deployments

```bash
make info
```

## Manual verification

You can verify contracts manually on block explorers using the saved addresses.

That's it! 🎉
