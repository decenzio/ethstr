// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/NpubAccountFactory.sol";
import "../src/NpubAccount.sol";

contract DeployScript is Script {
    function run() external {
        // Get chain info
        string memory chainName = getChainName(block.chainid);

        // Get the entry point address from environment or use default
        address entryPoint = vm.envOr(
            "ENTRY_POINT",
            address(0x0000000071727De22E5E9d8BAf0edAc6f37da032)
        );

        console.log("========================================");
        console.log("Deploying Nostr Account Contracts");
        console.log("========================================");
        console.log("Chain:", chainName);
        console.log("Chain ID:", block.chainid);
        console.log("Entry Point:", entryPoint);
        console.log("Deployer:", vm.envAddress("DEPLOYER_ADDRESS"));
        console.log("");

        vm.startBroadcast();

        // Deploy NpubAccountFactory (this will also deploy the implementation)
        console.log("1. Deploying NpubAccountFactory...");
        NpubAccountFactory factory = new NpubAccountFactory(
            IEntryPoint(entryPoint)
        );

        // Get the implementation address
        NpubAccount implementation = factory.accountImplementation();

        vm.stopBroadcast();

        console.log("========================================");
        console.log("Deployment Completed Successfully!");
        console.log("========================================");
        console.log("Chain:", chainName);
        console.log("Chain ID:", block.chainid);
        console.log("NpubAccountFactory:", address(factory));
        console.log("NpubAccount Implementation:", address(implementation));
        console.log("Entry Point:", entryPoint);
        console.log("");

        console.log("Next steps:");
        console.log("1. Test account creation");
        console.log("2. Use contracts in your frontend");
        console.log("");

        // Save deployment info to chain-specific file
        string memory json = string(
            abi.encodePacked(
                "{\n",
                '  "chain": "',
                chainName,
                '",\n',
                '  "chainId": ',
                vm.toString(block.chainid),
                ",\n",
                '  "entryPoint": "',
                vm.toString(entryPoint),
                '",\n',
                '  "factoryAddress": "',
                vm.toString(address(factory)),
                '",\n',
                '  "implementationAddress": "',
                vm.toString(address(implementation)),
                '",\n',
                '  "deployedAt": "',
                getCurrentTimestamp(),
                '"\n',
                "}"
            )
        );

        string memory filename = string(
            abi.encodePacked("./deployments/", chainName, ".json")
        );
        vm.writeFile(filename, json);
        console.log("Deployment info saved to:", filename);
    }

    function getChainName(
        uint256 chainId
    ) internal pure returns (string memory) {
        if (chainId == 11155111) return "sepolia";
        if (chainId == 8453) return "base";
        if (chainId == 1116) return "coredao";
        return "unknown";
    }

    function getCurrentTimestamp() internal view returns (string memory) {
        return vm.toString(block.timestamp);
    }
}
