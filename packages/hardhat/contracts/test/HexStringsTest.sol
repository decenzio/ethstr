// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { HexStrings } from "../utils/HexStrings.sol";

contract HexStringsTest {
    function toHexString(uint256 value) external pure returns (string memory) {
        return HexStrings.toHexString(value);
    }

    function toHexStringNoPrefix(uint256 value) external pure returns (string memory) {
        return HexStrings.toHexStringNoPrefix(value);
    }

    function toHexStringWithPrefix(uint256 value) external pure returns (string memory) {
        return HexStrings.toHexStringWithPrefix(value);
    }
}


