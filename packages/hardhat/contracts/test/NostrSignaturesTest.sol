// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { NostrSignatures } from "../NostrSignatures.sol";

contract NostrSignaturesTest {
    function verifyNostrSignature(
        uint256 owner,
        bytes calldata signature,
        bytes32 userOpHash
    ) external returns (bool) {
        return NostrSignatures.verifyNostrSignature(owner, signature, userOpHash);
    }

    function tryVerifyNostrSignature(
        uint256 owner,
        bytes calldata signature,
        bytes32 userOpHash
    ) external returns (bool) {
        return NostrSignatures.tryVerifyNostrSignature(owner, signature, userOpHash);
    }
}


