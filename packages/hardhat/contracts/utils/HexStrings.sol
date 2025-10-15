// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title HexStrings
 * @dev Library for efficient hexadecimal string operations
 * @notice Provides gas-optimized functions for converting uint256 to hex strings
 */
library HexStrings {
    /// @dev Hexadecimal symbols for conversion
    bytes16 private constant _SYMBOLS = "0123456789abcdef";

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation with fixed length.
     * @param value The uint256 value to convert
     * @return A 64-character hexadecimal string (32 bytes = 64 hex chars)
     * @notice Always returns a string with leading zeros if value is less than 2^256-1
     */
    function toHexString(uint256 value) internal pure returns (string memory) {
        // Use assembly for maximum gas optimization
        assembly {
            // Allocate memory: 32 bytes (length) + 64 bytes (data) = 96 bytes total
            let ptr := mload(0x40)
            mstore(0x40, add(ptr, 0x60)) // Update free memory pointer
            
            // Store string length (64 characters)
            mstore(ptr, 0x40)
            
            // Calculate data pointer (skip 32-byte length field)
            let dataPtr := add(ptr, 0x20)
            
            // Process all 64 nibbles (4 bits each) from right to left
            for { let i := 0x40 } gt(i, 0) { i := sub(i, 1) } {
                // Extract the lowest 4 bits (nibble)
                let nibble := and(value, 0xf)
                
                // Convert nibble to ASCII character
                let char := add(0x30, nibble) // Start with '0' (0x30)
                if gt(nibble, 9) {
                    // For values 10-15, convert to 'a'-'f' (0x61-0x66)
                    char := add(0x57, nibble) // 0x61 - 0xa = 0x57
                }
                
                // Store character at correct position (right-to-left)
                mstore8(add(dataPtr, sub(i, 1)), char)
                
                // Shift value right by 4 bits for next nibble
                value := shr(4, value)
            }
            
            // Return the complete string (ptr + length)
            return(ptr, 0x60)
        }
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation without leading zeros.
     * @param value The uint256 value to convert
     * @return A hexadecimal string without leading zeros
     * @notice More gas-efficient for smaller numbers as it doesn't include leading zeros
     */
    function toHexStringNoPrefix(uint256 value) internal pure returns (string memory) {
        // Handle zero case efficiently
        if (value == 0) {
            return "0";
        }
        
        // Calculate the number of hex digits needed
        uint256 length = 0;
        uint256 temp = value;
        while (temp != 0) {
            unchecked {
                length++;
                temp >>= 4;
            }
        }
        
        // Allocate memory for the result
        bytes memory buffer = new bytes(length);
        
        // Convert to hex using the symbols lookup table
        for (uint256 i = length; i > 0; ) {
            unchecked {
                buffer[i - 1] = _SYMBOLS[value & 0xf];
                value >>= 4;
                --i;
            }
        }
        
        return string(buffer);
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation with "0x" prefix.
     * @param value The uint256 value to convert
     * @return A hexadecimal string with "0x" prefix
     */
    function toHexStringWithPrefix(uint256 value) internal pure returns (string memory) {
        return string(abi.encodePacked("0x", toHexStringNoPrefix(value)));
    }
}