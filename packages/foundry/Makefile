# Nostr Account Abstraction - Multi-Chain Deployment with Shared Config
# Converts Nostr keys to Account Abstraction wallets using ERC-4337

.PHONY: help clean build test deploy setup

# Load environment variables from .env if it exists
ifneq (,$(wildcard .env))
include .env
export
endif

# Default values
PRIVATE_KEY ?=

# Deployment tracking
DEPLOYMENTS_DIR = deployments

help:
	@echo "🔑 Nostr Account Abstraction - Multi-Chain Deployment"
	@echo ""
	@echo "Available commands:"
	@echo "  make setup                    - Install dependencies and build"
	@echo "  make test                     - Run tests"
	@echo "  make deploy-sepolia          - Deploy to Sepolia testnet"
	@echo "  make deploy-base             - Deploy to Base mainnet"
	@echo "  make deploy-coredao          - Deploy to CoreDAO testnet"
	@echo "  make deploy-rootstock        - Deploy to Rootstock testnet"
	@echo "  make deploy-all              - Deploy to all supported chains"
	@echo "  make clean                   - Clean build artifacts"
	@echo "  make info                    - Show deployed contracts"
	@echo ""
	@echo "Required environment:"
	@echo "  PRIVATE_KEY=0x...            - Your deployment private key"
	@echo ""
	@echo "Example:"
	@echo "  PRIVATE_KEY=0x123... make deploy-sepolia"

setup:
	@echo "📦 Setting up Nostr Account Abstraction..."
	@forge install --no-git
	@forge build
	@echo "✅ Ready to deploy!"

build:
	@forge build

test:
	@echo "🧪 Testing Nostr signature verification..."
	@forge test -vvv

clean:
	@forge clean
	@rm -rf $(DEPLOYMENTS_DIR)

# Create deployments directory
$(DEPLOYMENTS_DIR):
	@mkdir -p $(DEPLOYMENTS_DIR)

# Check environment
check-env:
	@if [ -z "$(PRIVATE_KEY)" ]; then \
		echo "❌ PRIVATE_KEY required"; \
		echo "Usage: PRIVATE_KEY=0x... make deploy-sepolia"; \
		exit 1; \
	fi

# Deploy to all chains
deploy-all: check-env build $(DEPLOYMENTS_DIR)
	@echo "🚀 Starting multi-chain deployment..."
	@$(MAKE) deploy-sepolia
	@$(MAKE) deploy-base  
	@$(MAKE) deploy-coredao
	@$(MAKE) deploy-rootstock
	@echo "✅ Multi-chain deployment completed!"

# Deploy to specific chains using Deploy.s.sol script
deploy-sepolia: check-env build $(DEPLOYMENTS_DIR)
	@echo "🚀 Deploying to Sepolia testnet..."
	@$(call deploy_with_script,sepolia)

deploy-base: check-env build $(DEPLOYMENTS_DIR)
	@echo "🚀 Deploying to Base mainnet..."
	@$(call deploy_with_script,base)

deploy-coredao: check-env build $(DEPLOYMENTS_DIR)
	@echo "🚀 Deploying to CoreDAO testnet..."
	@$(call deploy_with_script,coredao)

deploy-rootstock: check-env build $(DEPLOYMENTS_DIR)
	@echo "🚀 Deploying to Rootstock testnet..."
	@$(call deploy_with_script,rootstock)

# Simple deployment function using Deploy.s.sol
define deploy_with_script
	@echo "Deploying to $(1)..."
	@RPC_URL=$$(jq -r '.chains.$(1).rpcUrl' ../../chains.config.json); \
	echo "Using RPC URL: $$RPC_URL"; \
	if [ "$(1)" = "coredao" ]; then \
		forge script script/Deploy.s.sol:DeployScript \
			--rpc-url "$$RPC_URL" \
			--private-key $(PRIVATE_KEY) \
			--gas-price 10000000000 \
			--legacy \
			--broadcast; \
	else \
		forge script script/Deploy.s.sol:DeployScript \
			--rpc-url "$$RPC_URL" \
			--private-key $(PRIVATE_KEY) \
			--broadcast; \
	fi
	@if [ $$? -eq 0 ]; then \
		echo "✅ Successfully deployed to $(1)!"; \
		echo "📝 Adding RPC URL to deployment file..."; \
		RPC_URL=$$(jq -r '.chains.$(1).rpcUrl' ../../chains.config.json); \
		jq --arg rpc "$$RPC_URL" '. + {"rpcUrl": $$rpc}' $(DEPLOYMENTS_DIR)/$(1).json > $(DEPLOYMENTS_DIR)/$(1).json.tmp && \
		mv $(DEPLOYMENTS_DIR)/$(1).json.tmp $(DEPLOYMENTS_DIR)/$(1).json; \
		echo "📋 Deployment file saved to: $(DEPLOYMENTS_DIR)/$(1).json"; \
		echo "🔄 Updating chains.config.json with deployed contract addresses..."; \
		FACTORY_ADDR=$$(jq -r '.factoryAddress' $(DEPLOYMENTS_DIR)/$(1).json); \
		IMPL_ADDR=$$(jq -r '.implementationAddress' $(DEPLOYMENTS_DIR)/$(1).json); \
		jq --arg factory "$$FACTORY_ADDR" --arg impl "$$IMPL_ADDR" \
		'.chains.$(1).contracts.npubAccountFactory = $$factory | .chains.$(1).contracts.npubAccountImplementation = $$impl' \
		../../chains.config.json > ../../chains.config.json.tmp && \
		mv ../../chains.config.json.tmp ../../chains.config.json; \
		echo "✅ Updated chains.config.json with contract addresses"; \
	else \
		echo "❌ Deployment to $(1) failed"; \
		exit 1; \
	fi
endef

# Show deployment info
info:
	@echo "📋 Deployed Contracts:"
	@for file in $(DEPLOYMENTS_DIR)/*.json; do \
		if [ -f "$$file" ]; then \
			echo ""; \
			echo "🔗 $$(basename $$file .json):"; \
			cat "$$file" | jq -r '"Factory: " + .factoryAddress'; \
			cat "$$file" | jq -r '"Implementation: " + .implementationAddress'; \
		fi; \
	done
