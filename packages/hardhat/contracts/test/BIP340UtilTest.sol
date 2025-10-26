// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { BIP340Util } from "../BIP340/Bip340Ecrec.sol";
import { Secp256k1 } from "../BIP340/Secp256k1.sol";

contract BIP340UtilTest {
    function computeChallenge(
        bytes32 rx,
        bytes32 px,
        bytes32 m
    ) external pure returns (uint256) {
        return BIP340Util.computeChallenge(rx, px, m);
    }

    function liftX(uint256 x) external pure returns (bool success, uint256 y) {
        (uint256 yCoord, bool ok) = BIP340Util.liftX(x);
        return (ok, yCoord);
    }

    function convToFakeAddr(uint256 px) external pure returns (bool success, address addr) {
        (address a, bool ok) = BIP340Util.convToFakeAddr(px);
        return (ok, a);
    }

    function xToAffine(uint256 x, uint256 z) external pure returns (uint256) {
        return BIP340Util.xToAffine(x, z, Secp256k1.PP);
    }
}


