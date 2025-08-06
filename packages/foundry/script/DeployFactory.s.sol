// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "../lib/forge-std/src/Script.sol";
import "../src/NpubAccountFactory.sol";

contract DeployFactory is Script {
    function run() external returns (address) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address entryPoint = 0x0000000071727De22E5E9d8BAf0edAc6f37da032;

        vm.startBroadcast(deployerPrivateKey);

        NpubAccountFactory factory = new NpubAccountFactory(
            IEntryPoint(entryPoint)
        );

        vm.stopBroadcast();

        console.log("Factory deployed at:", address(factory));
        console.log(
            "Implementation at:",
            address(factory.accountImplementation())
        );

        return address(factory);
    }
}
