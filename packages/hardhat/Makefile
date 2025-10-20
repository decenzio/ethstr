.PHONY: help install test clean deploy-sepolia deploy-zircuit deploy-base-sepolia deploy-all

help:
	@echo "Nostr Account Abstraction"
	@echo ""
	@echo "Commands:"
	@echo "  make install    - Install dependencies"
	@echo "  make test       - Run tests"
	@echo "  make clean      - Clean build artifacts"
	@echo "  make deploy-sepolia"
	@echo "  make deploy-zircuit"
	@echo "  make deploy-base-sepolia"
	@echo "  make deploy-all"

install:
	@yarn install

test:
	@yarn test

clean:
	@rm -rf artifacts cache typechain-types ignition/deployments

deploy-sepolia:
	@yarn hardhat ignition deploy ./ignition/modules/NpubContracts.ts --network sepolia

deploy-zircuit:
	@yarn hardhat ignition deploy ./ignition/modules/NpubContracts.ts --network zircuit

deploy-base-sepolia:
	@yarn hardhat ignition deploy ./ignition/modules/NpubContracts.ts --network baseSepolia

deploy-all:
	@$(MAKE) deploy-sepolia
	@$(MAKE) deploy-zircuit
	@$(MAKE) deploy-base-sepolia
