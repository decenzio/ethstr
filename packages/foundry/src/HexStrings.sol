// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @dev String operations.
 */
library HexStrings {
    bytes16 private constant _SYMBOLS = "0123456789abcdef";

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation with fixed length.
     */
    function toHexString(uint256 value) internal pure returns (string memory) {
        bytes memory buffer = new bytes(64);
        for (uint256 i = 64; i > 0; --i) {
            buffer[i-1] = _SYMBOLS[value & 0xf];
            value >>= 4;
        }
        return string(buffer);
    }

}