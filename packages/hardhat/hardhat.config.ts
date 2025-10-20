import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Helper function to ensure private key has 0x prefix
const getPrivateKey = (): string[] => {
  const key = process.env.DEPLOYER_PRIVATE_KEY;
  if (!key) return [];
  return [key.startsWith("0x") ? key : `0x${key}`];
};

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthers],

  solidity: {
    compilers: [
      {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.23",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },

  networks: {
    // Local development network
    hardhat: {
      type: "edr-simulated",
      chainType: "l1",
      forking: {
        url: process.env.ALCHEMY_API_KEY
          ? `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
          : "https://eth-mainnet.g.alchemy.com/v2/demo",
        enabled: process.env.MAINNET_FORKING_ENABLED === "true",
      },
    },

    // Ethereum Mainnet & Testnet
    mainnet: {
      type: "http",
      chainType: "l1",
      url: process.env.ALCHEMY_API_KEY
        ? `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        : "https://eth-mainnet.g.alchemy.com/v2/demo",
      accounts: getPrivateKey(),
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: getPrivateKey(),
    },

    // Arbitrum
    arbitrum: {
      type: "http",
      chainType: "generic",
      url: process.env.ALCHEMY_API_KEY
        ? `https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        : "https://arb1.arbitrum.io/rpc",
      accounts: getPrivateKey(),
    },
    arbitrumSepolia: {
      type: "http",
      chainType: "generic",
      url: process.env.ALCHEMY_API_KEY
        ? `https://arb-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        : "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: getPrivateKey(),
    },

    // Optimism
    optimism: {
      type: "http",
      chainType: "op",
      url: process.env.ALCHEMY_API_KEY
        ? `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        : "https://mainnet.optimism.io",
      accounts: getPrivateKey(),
    },
    optimismSepolia: {
      type: "http",
      chainType: "op",
      url: process.env.ALCHEMY_API_KEY
        ? `https://opt-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        : "https://sepolia.optimism.io",
      accounts: getPrivateKey(),
    },

    // Base
    base: {
      type: "http",
      chainType: "op",
      url: "https://mainnet.base.org",
      accounts: getPrivateKey(),
    },
    baseSepolia: {
      type: "http",
      chainType: "op",
      url: "https://sepolia.base.org",
      accounts: getPrivateKey(),
    },

    // Polygon
    polygon: {
      type: "http",
      chainType: "generic",
      url: process.env.ALCHEMY_API_KEY
        ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        : "https://polygon-rpc.com",
      accounts: getPrivateKey(),
    },
    polygonAmoy: {
      type: "http",
      chainType: "generic",
      url: process.env.ALCHEMY_API_KEY
        ? `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        : "https://rpc-amoy.polygon.technology",
      accounts: getPrivateKey(),
    },

    // Polygon ZK EVM
    polygonZkEvm: {
      type: "http",
      chainType: "generic",
      url: process.env.ALCHEMY_API_KEY
        ? `https://polygonzkevm-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        : "https://zkevm-rpc.com",
      accounts: getPrivateKey(),
    },
    polygonZkEvmCardona: {
      type: "http",
      chainType: "generic",
      url: process.env.ALCHEMY_API_KEY
        ? `https://polygonzkevm-cardona.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        : "https://rpc.cardona.zkevm-rpc.com",
      accounts: getPrivateKey(),
    },

    // Other Networks
    gnosis: {
      type: "http",
      chainType: "generic",
      url: "https://rpc.gnosischain.com",
      accounts: getPrivateKey(),
    },
    chiado: {
      type: "http",
      chainType: "generic",
      url: "https://rpc.chiadochain.net",
      accounts: getPrivateKey(),
    },
    zircuit: {
      type: "http",
      chainType: "generic",
      url: "https://zircuit1-testnet.p2pify.com",
      accounts: getPrivateKey(),
    },
    scroll: {
      type: "http",
      chainType: "generic",
      url: "https://rpc.scroll.io",
      accounts: getPrivateKey(),
    },
    scrollSepolia: {
      type: "http",
      chainType: "generic",
      url: "https://sepolia-rpc.scroll.io",
      accounts: getPrivateKey(),
    },
    celo: {
      type: "http",
      chainType: "generic",
      url: "https://forno.celo.org",
      accounts: getPrivateKey(),
    },
    celoSepolia: {
      type: "http",
      chainType: "generic",
      url: "https://forno.celo-sepolia.celo-testnet.org",
      accounts: getPrivateKey(),
    },
  },

  // Contract verification configuration
  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY || "",
    },
  },
};

export default config;
