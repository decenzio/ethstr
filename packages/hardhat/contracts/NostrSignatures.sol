// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./BIP340/BIP340Ecrec.sol";
import "./utils/HexStrings.sol";

/**
 * @title NostrSignatures
 * @notice Library for verifying Nostr protocol signatures using BIP340 Schnorr signatures
 * @dev This library provides functionality to verify Nostr signatures by constructing
 *      the appropriate message format and using BIP340 signature verification.
 *      Nostr signatures follow a specific JSON-like format that needs to be constructed
 *      and hashed before verification.
 * @author Senior Smart Contract Engineer
 */
library NostrSignatures {
    // ============ Constants ============
    
    /// @notice Expected signature length for BIP340 signatures (64 bytes: 32 bytes R + 32 bytes s)
    uint256 private constant SIGNATURE_LENGTH = 64;
    
    /// @notice Nostr event kind for authentication (96024 is a common kind for auth events)
    uint256 private constant NOSTR_AUTH_KIND = 96024;
    
    /// @notice Nostr event created_at timestamp (0 for immediate verification)
    uint256 private constant NOSTR_CREATED_AT = 0;
    
    /// @notice Nostr event tags array (empty for auth events)
    string private constant NOSTR_TAGS = "[]";

    // ============ Errors ============
    
    /// @notice Thrown when signature length is invalid
    error InvalidSignatureLength();
    
    /// @notice Thrown when signature verification fails
    error SignatureVerificationFailed();
    
    /// @notice Thrown when owner address is invalid (zero address)
    error InvalidOwnerAddress();

    // ============ Events ============
    
    /// @notice Emitted when a Nostr signature is successfully verified
    /// @param owner The Nostr public key that signed the message
    /// @param userOpHash The hash of the user operation that was signed
    event NostrSignatureVerified(uint256 indexed owner, bytes32 indexed userOpHash);

    // ============ Public Functions ============

    /**
     * @notice Verifies a Nostr signature against a user operation hash
     * @dev Constructs the Nostr event JSON format, hashes it, and verifies the BIP340 signature
     *      The Nostr event format is: [0, "<pubkey>", 0, 96024, [], "<userOpHash>"]
     * @param owner The Nostr public key (x-coordinate) that should have signed the message
     * @param signature The 64-byte BIP340 signature (32 bytes R + 32 bytes s)
     * @param userOpHash The hash of the user operation being verified
     * @return success True if the signature is valid, false otherwise
     * @custom:security This function validates input parameters and uses secure BIP340 verification
     */
    function verifyNostrSignature(
        uint256 owner,
        bytes memory signature,
        bytes32 userOpHash
    ) internal returns (bool success) {
        // Validate input parameters
        if (signature.length != SIGNATURE_LENGTH) {
            revert InvalidSignatureLength();
        }
        
        if (owner == 0) {
            revert InvalidOwnerAddress();
        }

        // Construct the Nostr event message in the required JSON-like format
        // Format: [0, "<pubkey>", 0, 96024, [], "<userOpHash>"]
        bytes memory nostrEventMessage = abi.encodePacked(
            '[',
            _uintToString(NOSTR_CREATED_AT),
            ',"',
            HexStrings.toHexString(owner),
            '",',
            _uintToString(NOSTR_CREATED_AT),
            ',',
            _uintToString(NOSTR_AUTH_KIND),
            ',',
            NOSTR_TAGS,
            ',"',
            HexStrings.toHexString(uint256(userOpHash)),
            '"]'
        );

        // Hash the constructed message using SHA256
        bytes32 messageHash = sha256(nostrEventMessage);

        // Extract signature components using assembly for gas efficiency
        uint256 signatureR;
        uint256 signatureS;
        assembly ("memory-safe") {
            // Load R (first 32 bytes of signature)
            // signature.length is already validated to be 64 bytes
            signatureR := mload(add(signature, 0x20))
            // Load s (second 32 bytes of signature)
            signatureS := mload(add(signature, 0x40))
        }

        // Verify the BIP340 signature
        success = BIP340Ecrec.verify(owner, signatureR, signatureS, messageHash);
        
        // Revert with custom error if verification fails
        if (!success) {
            revert SignatureVerificationFailed();
        }
        
        // Emit event for successful verification
        emit NostrSignatureVerified(owner, userOpHash);
    }

    // ============ Private Helper Functions ============

    /**
     * @notice Converts a uint256 to its string representation
     * @dev Internal helper function for constructing Nostr event messages
     * @param value The uint256 value to convert
     * @return The string representation of the value
     */
    function _uintToString(uint256 value) private pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        
        uint256 temp = value;
        uint256 digits;
        
        // Count digits
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        // Allocate memory for the string
        bytes memory buffer = new bytes(digits);
        
        // Convert to string (right to left)
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }

    /**
     * @notice Verifies a Nostr signature against a user operation hash (non-reverting version)
     * @dev Same as verifyNostrSignature but returns false instead of reverting on failure
     * @param owner The Nostr public key (x-coordinate) that should have signed the message
     * @param signature The 64-byte BIP340 signature (32 bytes R + 32 bytes s)
     * @param userOpHash The hash of the user operation being verified
     * @return success True if the signature is valid, false otherwise
     */
    function tryVerifyNostrSignature(
        uint256 owner,
        bytes memory signature,
        bytes32 userOpHash
    ) internal returns (bool success) {
        // Validate input parameters
        if (signature.length != SIGNATURE_LENGTH || owner == 0) {
            return false;
        }

        // Construct the Nostr event message in the required JSON-like format
        bytes memory nostrEventMessage = abi.encodePacked(
            '[',
            _uintToString(NOSTR_CREATED_AT),
            ',"',
            HexStrings.toHexString(owner),
            '",',
            _uintToString(NOSTR_CREATED_AT),
            ',',
            _uintToString(NOSTR_AUTH_KIND),
            ',',
            NOSTR_TAGS,
            ',"',
            HexStrings.toHexString(uint256(userOpHash)),
            '"]'
        );

        // Hash the constructed message using SHA256
        bytes32 messageHash = sha256(nostrEventMessage);

        // Extract signature components using assembly for gas efficiency
        uint256 signatureR;
        uint256 signatureS;
        assembly ("memory-safe") {
            signatureR := mload(add(signature, 0x20))
            signatureS := mload(add(signature, 0x40))
        }

        // Verify the BIP340 signature
        success = BIP340Ecrec.verify(owner, signatureR, signatureS, messageHash);
        
        // Emit event for successful verification
        if (success) {
            emit NostrSignatureVerified(owner, userOpHash);
        }
    }
}