// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/NpubAccountFactory.sol";
import "../src/NpubAccount.sol";
import "../src/NostrSignatures.sol";

contract TestDeployment is Script {
    function run() external view {
        // Use the deployed contracts
        address factoryAddress = vm.envAddress("FACTORY_ADDRESS");

        console.log("========================================");
        console.log("Testing Deployed Contracts");
        console.log("========================================");
        console.log("Factory Address:", factoryAddress);

        NpubAccountFactory factory = NpubAccountFactory(factoryAddress);

        // Test parameters from your test file
        uint256 testOwner = 0x2e7b0e5aae374d0ed1fab6cc877a969716ea48a710176a035398635e5d660dc1;
        uint256 testSalt = 123456789;

        console.log("Test Owner (npub):", vm.toString(testOwner));
        console.log("Test Salt:", testSalt);

        // Get predicted account address
        address predictedAccount = factory.getAddress(testOwner, testSalt);
        console.log("Predicted Account Address:", predictedAccount);

        // Check if account is already deployed
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(predictedAccount)
        }

        if (codeSize > 0) {
            console.log("[OK] Account already deployed!");
        } else {
            console.log("[NOT DEPLOYED] Account not yet deployed");
            console.log(
                "To deploy, call factory.createAccount with owner and salt"
            );
        }

        // Get implementation
        address implementation = address(factory.accountImplementation());
        console.log("Implementation Address:", implementation);

        console.log("========================================");
        console.log("Test signature verification");
        console.log("========================================");

        // Test signature from your test file
        bytes
            memory testSignature = hex"a35749d6174451de16fb286096858cb33d7b66c9583024fd2a5cd7b57a763ec85d99ddb0711044498c362be7c82e524a9845e09f634bbf11d87fccc2bcfe2202";
        bytes32 testHash = 0x0000000000000000000000000000000000000000000000000000000000000000;

        bool isValid = NostrSignatures.verifyNostrSignature(
            testOwner,
            testSignature,
            testHash
        );
        console.log(
            "Signature verification:",
            isValid ? "[VALID]" : "[INVALID]"
        );

        console.log("========================================");
        console.log("Test completed!");
        console.log("========================================");
    }
}
