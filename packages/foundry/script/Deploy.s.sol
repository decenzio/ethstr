// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/NpubAccountFactory.sol";
import "../src/NpubAccount.sol";

contract DeployScript is Script {
    function run() external {
        // Get the entry point address from environment or use default
        address entryPoint = vm.envOr(
            "ENTRY_POINT",
            address(0x0000000071727De22E5E9d8BAf0edAc6f37da032)
        );

        console.log("========================================");
        console.log("Deploying Nostr Account Contracts");
        console.log("========================================");
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
        console.log("NpubAccountFactory:", address(factory));
        console.log("NpubAccount Implementation:", address(implementation));
        console.log("Entry Point:", entryPoint);
        console.log("");

        console.log("Next steps:");
        console.log("1. Verify contracts on block explorer");
        console.log("2. Update frontend with factory address");
        console.log("3. Test account creation");
        console.log("");

        // Save deployment info to a file
        string memory json = string(
            abi.encodePacked(
                "{\n",
                '  "entryPoint": "',
                vm.toString(entryPoint),
                '",\n',
                '  "npubAccountFactory": "',
                vm.toString(address(factory)),
                '",\n',
                '  "npubAccountImplementation": "',
                vm.toString(address(implementation)),
                '",\n',
                '  "deployedAt": "',
                vm.toString(block.timestamp),
                '"\n',
                "}"
            )
        );

        vm.writeFile("./deployments/latest.json", json);
        console.log("Deployment info saved to: ./deployments/latest.json");
    }
}
