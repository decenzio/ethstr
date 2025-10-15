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
    
    /// @dev Error thrown when input value is invalid
    error InvalidValue();

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation with fixed length.
     * @param value The uint256 value to convert
     * @return A 64-character hexadecimal string (32 bytes = 64 hex chars)
     * @notice Always returns a string with leading zeros if value is less than 2^256-1
     */
    function toHexString(uint256 value) internal pure returns (string memory) {
        // Use assembly for gas optimization
        assembly {
            // Allocate memory for 64 characters + 32 bytes for string length
            let ptr := mload(0x40)
            mstore(0x40, add(ptr, 0x60)) // 64 + 32 = 96 bytes
            
            // Store string length (64)
            mstore(ptr, 0x40)
            
            // Move to data section
            let dataPtr := add(ptr, 0x20)
            
            // Process 64 nibbles (4 bits each)
            for { let i := 0x40 } gt(i, 0) { i := sub(i, 1) } {
                // Extract lowest 4 bits
                let nibble := and(value, 0xf)
                
                // Convert to ASCII character
                let char := add(0x30, nibble) // '0' = 0x30
                if gt(nibble, 9) {
                    char := add(0x57, nibble) // 'a' = 0x61, so 0x61 - 0xa = 0x57
                }
                
                // Store character (little-endian, so we write from end)
                mstore8(add(dataPtr, sub(i, 1)), char)
                
                // Shift right by 4 bits
                value := shr(4, value)
            }
            
            // Return the string
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
        if (value == 0) {
            return "0";
        }
        
        // Calculate the number of hex digits needed
        uint256 length = 0;
        uint256 temp = value;
        while (temp != 0) {
            length++;
            temp >>= 4;
        }
        
        // Allocate memory
        bytes memory buffer = new bytes(length);
        
        // Convert to hex
        for (uint256 i = length; i > 0; --i) {
            buffer[i - 1] = _SYMBOLS[value & 0xf];
            value >>= 4;
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