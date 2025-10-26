// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { BIP340Ecrec } from "../BIP340/Bip340Ecrec.sol";

contract BIP340EcrecTest {
    function verify(
        uint256 px,
        uint256 rx,
        uint256 s,
        bytes32 m
    ) external pure returns (bool) {
        return BIP340Ecrec.verify(px, rx, s, m);
    }
}


