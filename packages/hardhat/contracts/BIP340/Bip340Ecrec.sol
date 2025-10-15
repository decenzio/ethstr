// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./EllipticCurve.sol";
import "./Secp256k1.sol";

/**
 * @title BIP340 Schnorr Signature Utilities
 * @notice Library providing utility functions for BIP340 Schnorr signature operations
 * @dev This library implements BIP340 (Schnorr signatures for secp256k1) utility functions
 *      including challenge computation, point lifting, and coordinate conversions.
 * @author Based on https://hackmd.io/@nZ-twauPRISEa6G9zg3XRw/SyjJzSLt9
 */
library BIP340Util {
    // ============ Constants ============
    
    /// @notice Precomputed SHA256 hash of "BIP0340/challenge" tag
    /// @dev Saves ~10k gas compared to computing SHA256 at runtime
    bytes32 private constant BIP340_CHALLENGE_TAG = 0x7bb52d7a9fef58323eb1bf7a407db382d2f3f2d81bb1224f49fe518f6d48d37c;

    // ============ Errors ============
    
    /// @notice Thrown when attempting to lift an x-coordinate that is out of range
    error InvalidXCoordinate();
    
    /// @notice Thrown when a point lifting operation fails
    error PointLiftingFailed();

    // ============ Public Functions ============

    /**
     * @notice Computes the BIP340 challenge hash
     * @dev Implements the BIP340 challenge function: e = int(hashBIP0340/challenge(bytes(r) || bytes(P) || m)) mod n
     * @param rx The x-coordinate of the signature point R
     * @param px The x-coordinate of the public key P
     * @param m The message hash being signed
     * @return The challenge value e (mod n)
     */
    function computeChallenge(
        bytes32 rx,
        bytes32 px,
        bytes32 m
    ) internal pure returns (uint256) {
        // Concatenate tag twice, then rx, px, and message
        // This follows BIP340 specification for challenge computation
        return uint256(sha256(abi.encodePacked(BIP340_CHALLENGE_TAG, BIP340_CHALLENGE_TAG, rx, px, m))) % Secp256k1.NN;
    }

    /**
     * @notice Lifts an x-coordinate to find the corresponding even y-coordinate on secp256k1
     * @dev Given an x-coordinate, computes the y-coordinate of the even point on the curve
     *      This is used to reconstruct the full public key from just the x-coordinate
     * @param x The x-coordinate to lift
     * @return y The corresponding even y-coordinate
     * @return success True if the lifting was successful, false otherwise
     */
    function liftX(uint256 x) internal pure returns (uint256 y, bool success) {
        uint256 pp = Secp256k1.PP;
        uint256 aa = Secp256k1.AA;
        uint256 bb = Secp256k1.BB;

        // Validate input range
        if (x >= pp) {
            return (0, false);
        }

        // Compute y^2 = x^3 + ax + b (mod p)
        // For secp256k1: a = 0, b = 7, so y^2 = x^3 + 7 (mod p)
        uint256 ySquared = addmod(
            mulmod(x, mulmod(x, x, pp), pp), // x^3
            addmod(mulmod(x, aa, pp), bb, pp), // ax + b
            pp
        );

        // Compute y = ySquared^((p+1)/4) (mod p)
        // This is the square root in the finite field
        ySquared = EllipticCurve.expMod(ySquared, (pp + 1) / 4, pp);

        // Ensure we get the even y-coordinate
        y = (ySquared & 1) == 0 ? ySquared : pp - ySquared;

        return (y, true);
    }

    /**
     * @notice Converts projective coordinates to affine coordinates (x-coordinate only)
     * @dev Internal utility for coordinate system conversion
     * @param x The x-coordinate in projective form
     * @param z The z-coordinate in projective form
     * @param pp The prime modulus
     * @return The x-coordinate in affine form
     */
    function xToAffine(
        uint256 x,
        uint256 z,
        uint256 pp
    ) internal pure returns (uint256) {
        uint256 zInv = EllipticCurve.invMod(z, pp);
        uint256 zInvSquared = mulmod(zInv, zInv, pp);
        return mulmod(x, zInvSquared, pp);
    }

    /**
     * @notice Converts a BIP340 public key x-coordinate to a fake Ethereum address
     * @dev This is used in the ecrecover hack for efficient signature verification
     *      The "fake" address represents the point (px, py) where py is the even y-coordinate
     * @param px The x-coordinate of the public key
     * @return addr The computed fake Ethereum address
     * @return success True if the conversion was successful, false otherwise
     */
    function convToFakeAddr(uint256 px) internal pure returns (address addr, bool success) {
        (uint256 py, bool liftSuccess) = liftX(px);
        if (!liftSuccess) {
            return (address(0), false);
        }

        // Compute keccak256(px || py) and take the last 20 bytes as address
        bytes32 hash = keccak256(abi.encodePacked(bytes32(px), bytes32(py)));
        return (address(uint160(uint256(hash))), true);
    }
}

/**
 * @title BIP340 Schnorr Signature Verification
 * @notice Library for verifying BIP340 Schnorr signatures using the ecrecover optimization
 * @dev This library implements an efficient method to verify BIP340 Schnorr signatures
 *      by leveraging Ethereum's built-in ecrecover function through a clever mathematical trick.
 *      Based on: https://hackmd.io/@nZ-twauPRISEa6G9zg3XRw/SyjJzSLt9
 * @author Optimized implementation for gas efficiency
 */
library BIP340Ecrec {
    // ============ Errors ============
    
    /// @notice Thrown when signature parameters are out of valid range
    error InvalidSignatureParameters();
    
    /// @notice Thrown when public key conversion fails
    error PublicKeyConversionFailed();

    // ============ Public Functions ============

    /**
     * @notice Verifies a BIP340 Schnorr signature using the ecrecover optimization
     * @dev This function uses a mathematical trick to verify Schnorr signatures by
     *      converting the verification problem into an ECDSA recovery problem that
     *      can be solved using ecrecover, which is more gas-efficient than manual
     *      elliptic curve operations.
     * @param px The x-coordinate of the public key
     * @param rx The x-coordinate of the signature point R
     * @param s The signature scalar value
     * @param m The message hash being verified
     * @return valid True if the signature is valid, false otherwise
     */
    function verify(
        uint256 px,
        uint256 rx,
        uint256 s,
        bytes32 m
    ) internal pure returns (bool valid) {
        // Validate input parameters are within valid ranges
        if (px >= Secp256k1.PP || rx >= Secp256k1.PP || s >= Secp256k1.NN) {
            return false;
        }

        // Convert the signature point R to a fake Ethereum address
        (address expectedAddr, bool conversionSuccess) = Bip340Util.convToFakeAddr(rx);
        if (!conversionSuccess) {
            return false;
        }

        // Compute the BIP340 challenge
        uint256 e = Bip340Util.computeChallenge(bytes32(rx), bytes32(px), m);

        // Prepare parameters for ecrecover
        // The mathematical transformation converts the Schnorr verification
        // into an ECDSA recovery problem
        bytes32 sp = bytes32(Secp256k1.NN - mulmod(s, px, Secp256k1.NN));
        bytes32 ep = bytes32(Secp256k1.NN - mulmod(e, px, Secp256k1.NN));

        // Use ecrecover with recovery ID 27 (indicating even parity)
        // This is the core of the optimization - using Ethereum's built-in
        // ecrecover instead of manual elliptic curve operations
        address recoveredAddr = ecrecover(sp, 27, bytes32(px), ep);

        // The signature is valid if the recovered address matches our expected address
        return recoveredAddr == expectedAddr;
    }
}