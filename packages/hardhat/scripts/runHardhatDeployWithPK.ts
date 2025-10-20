import "dotenv/config";
import { spawn } from "child_process";

async function main() {
  const deployerKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!deployerKey) {
    console.error("❌ DEPLOYER_PRIVATE_KEY not found in .env file");
    process.exit(1);
  }

  // Run hardhat ignition deploy with all passed arguments
  const hardhat = spawn("hardhat", process.argv.slice(2), {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });

  hardhat.on("exit", code => {
    process.exit(code || 0);
  });
}

main().catch(console.error);
