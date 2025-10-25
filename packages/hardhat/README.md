# Nostr Account Abstraction

ERC-4337 smart accounts controlled by Nostr keys instead of Ethereum private keys.

## Quick Start

```bash
# 1. Install
make install

# 2. Add your private key to .env
echo "__RUNTIME_DEPLOYER_PRIVATE_KEY=0xYourKey" >> .env

# 3. Deploy
make deploy-sepolia
```

## What This Does

Use your Nostr identity to control Ethereum accounts. Sign transactions with Nostr keys (BIP340 Schnorr) instead of managing separate Ethereum keys.

## Smart Contracts

- **NpubAccount** - Main account contract using Nostr authentication
- **NpubAccountFactory** - Creates accounts at deterministic addresses
- **NostrSignatures** - Verifies BIP340 Schnorr signatures

## Commands

```bash
make install              # Install dependencies
make test                 # Run tests
make clean                # Clean build artifacts

make deploy-sepolia       # Deploy to Sepolia
make deploy-zircuit       # Deploy to Zircuit
make deploy-base-sepolia  # Deploy to Base Sepolia
make deploy-all           # Deploy to all networks
```

## Networks

- Sepolia (Chain ID: 11155111)
- Zircuit Testnet (Chain ID: 48898)
- Base Sepolia (Chain ID: 84532)

## After Deployment

Contract addresses saved to:

- `deployments/addresses.json`
- `../nextjs/config/addresses.json` (auto-copied for frontend)

Max 3 networks kept automatically.

## Get Testnet ETH

- Sepolia: https://sepoliafaucet.com
- Base Sepolia: https://bridge.base.org
- Zircuit: https://bridge.garfield-testnet.zircuit.com/

---

**Built for Nostr + Ethereum**
