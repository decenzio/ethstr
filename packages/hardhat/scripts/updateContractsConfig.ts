import * as fs from "fs";
import * as path from "path";

const ENTRY_POINT_ADDRESS = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";

const NETWORK_CONFIG: Record<string, { chainId: number; name: string }> = {
  sepolia: { chainId: 11155111, name: "sepolia" },
  zircuit: { chainId: 48898, name: "zircuit" },
  baseSepolia: { chainId: 84532, name: "baseSepolia" },
};

interface NetworkConfig {
  chainId: number;
  NpubAccountFactory: string;
  NpubAccountImplementation: string;
  EntryPoint: string;
}

interface ConfigFile {
  contracts: Record<string, NetworkConfig>;
  metadata: {
    lastUpdated: string;
    version: string;
  };
}

/**
 * Updates the contracts.json configuration file with deployment addresses
 */
async function updateContractsConfig() {
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const configPath = path.join(deploymentsDir, "contracts.json");

  // Read existing config or create new one
  let config: ConfigFile;
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } else {
    config = {
      contracts: {},
      metadata: {
        lastUpdated: new Date().toISOString(),
        version: "1.0.0",
      },
    };
  }

  // Update each network's contracts
  for (const [networkKey, networkInfo] of Object.entries(NETWORK_CONFIG)) {
    const networkDir = path.join(deploymentsDir, networkKey);

    if (!fs.existsSync(networkDir)) {
      // Network not deployed yet, create empty entry
      if (!config.contracts[networkInfo.name]) {
        config.contracts[networkInfo.name] = {
          chainId: networkInfo.chainId,
          NpubAccountFactory: "",
          NpubAccountImplementation: "",
          EntryPoint: ENTRY_POINT_ADDRESS,
        };
      }
      continue;
    }

    // Read deployment files
    const factoryPath = path.join(networkDir, "NpubAccountFactory.json");

    if (fs.existsSync(factoryPath)) {
      const factoryDeployment = JSON.parse(fs.readFileSync(factoryPath, "utf8"));

      // Get implementation address by reading the factory's accountImplementation() value
      // For now, we'll leave it empty and get it from logs or set manually
      // The implementation address should be retrieved after deployment
      const implementationAddress = "";

      config.contracts[networkInfo.name] = {
        chainId: networkInfo.chainId,
        NpubAccountFactory: factoryDeployment.address,
        NpubAccountImplementation: implementationAddress,
        EntryPoint: ENTRY_POINT_ADDRESS,
      };

      console.log(`✅ Updated ${networkInfo.name} contracts`);
      console.log(`   Factory: ${factoryDeployment.address}`);
    }
  }

  // Update metadata
  config.metadata.lastUpdated = new Date().toISOString();

  // Write back to file
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`\n📝 Updated contracts configuration at: ${configPath}`);

  // Also copy to frontend if it exists
  const frontendConfigPath = path.join(__dirname, "..", "..", "nextjs", "config", "contracts.json");
  const frontendConfigDir = path.dirname(frontendConfigPath);

  if (fs.existsSync(path.join(__dirname, "..", "..", "nextjs"))) {
    if (!fs.existsSync(frontendConfigDir)) {
      fs.mkdirSync(frontendConfigDir, { recursive: true });
    }
    fs.writeFileSync(frontendConfigPath, JSON.stringify(config, null, 2));
    console.log(`📝 Copied to frontend: ${frontendConfigPath}`);
  }

  return config;
}

updateContractsConfig()
  .then(() => {
    console.log("\n🎉 Contract configuration updated successfully!");
    process.exit(0);
  })
  .catch(error => {
    console.error("❌ Error updating contract configuration:", error);
    process.exit(1);
  });
