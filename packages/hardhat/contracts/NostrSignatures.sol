// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./bip340/Bip340Ecrec.sol";
import "./HexStrings.sol";

library NostrSignatures {

    function verifyNostrSignature(uint256 owner, bytes memory signature, bytes32 userOpHash) pure internal returns (bool success) {
        require(signature.length==64, "account: Invalid sig len");

        uint256 _owner = owner;

        bytes memory signMessage = abi.encodePacked(
            '[0,"',
            HexStrings.toHexString(_owner),
            '",0,96024,[],"',
            HexStrings.toHexString(uint256(userOpHash)),
            '"]'
        );
        bytes32 sigHash = sha256(signMessage);

        uint256 Rx;
        uint256 s;
        assembly ("memory-safe") {
            Rx := mload(add(signature, 32))
            s := mload(add(signature, 64))
        }

        success = Bip340Ecrec.verify(_owner, Rx, s, sigHash);
    }

}