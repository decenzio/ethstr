# Nostr Account Abstraction - Simple Deployment
# Converts Nostr accounts to EVM wallets using ERC-4337

.PHONY: help clean build test deploy setup

# Load environment variables from .env if it exists
ifneq (,$(wildcard .env))
include .env
export
endif

# Default values
PRIVATE_KEY ?= 
ENTRY_POINT = 0x0000000071727De22E5E9d8BAf0edAc6f37da032

# Supported chains
BASE_RPC = https://mainnet.base.org
SEPOLIA_RPC = https://sepolia.gateway.tenderly.co
COREDAO_RPC = https://rpc.coredao.org

# Deployment tracking
DEPLOYMENTS_DIR = deployments

help:
	@echo "🔑 Nostr Account Abstraction Deployment"
	@echo ""
	@echo "Available commands:"
	@echo "  make setup                    - Install dependencies and build"
	@echo "  make test                     - Run tests"
	@echo "  make deploy-sepolia          - Deploy to Sepolia testnet"
	@echo "  make deploy-base             - Deploy to Base mainnet"
	@echo "  make deploy-coredao          - Deploy to CoreDAO mainnet"
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

# Deploy to specific chains
deploy-sepolia: check-env build $(DEPLOYMENTS_DIR)
	@echo "🚀 Deploying to Sepolia testnet..."
	@$(call deploy_to_chain,sepolia,$(SEPOLIA_RPC))

deploy-base: check-env build $(DEPLOYMENTS_DIR)
	@echo "🚀 Deploying to Base mainnet..."
	@$(call deploy_to_chain,base,$(BASE_RPC))

deploy-coredao: check-env build $(DEPLOYMENTS_DIR)
	@echo "🚀 Deploying to CoreDAO mainnet..."
	@$(call deploy_to_chain,coredao,$(COREDAO_RPC))

# Deployment function
define deploy_to_chain
	@echo "Deploying with RPC: $(2)"; \
	DEPLOYMENT_OUTPUT=$$(forge script script/DeployFactory.s.sol:DeployFactory \
		--rpc-url $(2) \
		--private-key $(PRIVATE_KEY) \
		--broadcast \
		2>&1 | tee /tmp/forge_deploy.log); \
	\
	FACTORY_ADDRESS=$$(echo "$$DEPLOYMENT_OUTPUT" | grep "Factory deployed at:" | sed 's/.*Factory deployed at: //'); \
	IMPL_ADDRESS=$$(echo "$$DEPLOYMENT_OUTPUT" | grep "Implementation at:" | sed 's/.*Implementation at: //'); \
	\
	if [ -z "$$FACTORY_ADDRESS" ] || [ "$$FACTORY_ADDRESS" = "null" ]; then \
		echo "❌ Deployment failed"; \
		echo "Full output:"; \
		cat /tmp/forge_deploy.log; \
		exit 1; \
	fi; \
	\
	echo "{ \
		\"chain\": \"$(1)\", \
		\"factoryAddress\": \"$$FACTORY_ADDRESS\", \
		\"implementationAddress\": \"$$IMPL_ADDRESS\", \
		\"entryPoint\": \"$(ENTRY_POINT)\", \
		\"rpcUrl\": \"$(2)\", \
		\"deployedAt\": \"$$(date -u +%Y-%m-%dT%H:%M:%SZ)\" \
	}" | jq '.' > $(DEPLOYMENTS_DIR)/$(1).json; \
	\
	echo "✅ Deployed to $(1)!"; \
	echo "Factory: $$FACTORY_ADDRESS"; \
	echo "Implementation: $$IMPL_ADDRESS"; \
	echo "📁 Saved to: $(DEPLOYMENTS_DIR)/$(1).json"
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
