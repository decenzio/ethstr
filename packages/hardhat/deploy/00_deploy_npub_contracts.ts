import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import * as fs from "fs";
import * as path from "path";

/**
 * Deploys the Nostr Account Abstraction contracts
 *
 * Deployment order:
 * 1. NpubAccountFactory (which internally deploys NpubAccount implementation)
 *x
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployNpubContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n📦 Deploying Nostr Account Abstraction contracts...");
  console.log("🔑 Deployer address:", deployer);

  // Get the EntryPoint address (v0.7.0)
  // This is the canonical EntryPoint address deployed on most networks
  const ENTRY_POINT_V07 = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";

  console.log("\n1️⃣ Deploying NpubAccountFactory...");
  const factory = await deploy("NpubAccountFactory", {
    from: deployer,
    args: [ENTRY_POINT_V07],
    log: true,
    autoMine: true,
  });

  console.log("✅ NpubAccountFactory deployed at:", factory.address);

  // Get the deployed factory contract
  const factoryContract = await hre.ethers.getContractAt("NpubAccountFactory", factory.address);

  // Get the account implementation address from the factory
  const accountImplementation = await factoryContract.accountImplementation();
  console.log("✅ NpubAccount implementation deployed at:", accountImplementation);

  console.log("\n🎉 Deployment complete!");
  console.log("────────────────────────────────────────");
  console.log("NpubAccountFactory:", factory.address);
  console.log("NpubAccount Implementation:", accountImplementation);
  console.log("EntryPoint:", ENTRY_POINT_V07);
  console.log("────────────────────────────────────────\n");

  // Save addresses to a simple JSON file for easy frontend access
  const network = hre.network.name;
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const configPath = path.join(deploymentsDir, "addresses.json");

  // Read existing addresses
  let addresses: any = {};
  if (fs.existsSync(configPath)) {
    addresses = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }

  // Update this network's addresses
  addresses[network] = {
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    NpubAccountFactory: factory.address,
    NpubAccountImplementation: accountImplementation.toString(),
    EntryPoint: ENTRY_POINT_V07,
    deployedAt: new Date().toISOString(),
  };

  // Keep only the 3 most recent networks (sorted by deployment time)
  const networks = Object.keys(addresses);
  if (networks.length > 3) {
    const sorted = networks
      .map(net => ({ name: net, time: addresses[net].deployedAt || "0" }))
      .sort((a, b) => b.time.localeCompare(a.time));

    const toKeep = sorted.slice(0, 3).map(n => n.name);
    const filtered: any = {};
    toKeep.forEach(net => {
      filtered[net] = addresses[net];
    });
    addresses = filtered;
  }

  // Save to hardhat deployments
  fs.writeFileSync(configPath, JSON.stringify(addresses, null, 2));
  console.log(`📝 Saved to: ${configPath}`);

  // Copy to frontend
  const frontendConfigDir = path.join(__dirname, "..", "..", "nextjs", "config");
  const frontendConfigPath = path.join(frontendConfigDir, "addresses.json");

  if (!fs.existsSync(frontendConfigDir)) {
    fs.mkdirSync(frontendConfigDir, { recursive: true });
  }

  fs.writeFileSync(frontendConfigPath, JSON.stringify(addresses, null, 2));
  console.log(`📝 Copied to frontend: ${frontendConfigPath}`);

  console.log(`\n✅ Config updated! (keeping max 3 latest networks)\n`);
};

export default deployNpubContracts;

deployNpubContracts.tags = ["NpubContracts", "NpubAccountFactory"];
