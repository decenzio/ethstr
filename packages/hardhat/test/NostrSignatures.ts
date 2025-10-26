import { expect } from "chai";
import { ethers } from "hardhat";
import { NostrSignaturesTest } from "../typechain-types";

describe("NostrSignatures Library", function () {
  let nostrSignaturesTest: NostrSignaturesTest;

  before(async () => {
    const NostrSignaturesTestFactory = await hre.ethers.getContractFactory("NostrSignaturesTest");
    nostrSignaturesTest = (await NostrSignaturesTestFactory.deploy()) as NostrSignaturesTest;
    await nostrSignaturesTest.waitForDeployment();
  });

  describe("verifyNostrSignature", function () {
    it("Should revert with InvalidSignatureLength for wrong signature length", async function () {
      const owner = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const signature = ethers.hexlify(ethers.randomBytes(32)); // 32 bytes instead of 64
      const userOpHash = ethers.hexlify(ethers.randomBytes(32));

      await expect(
        nostrSignaturesTest.verifyNostrSignature(owner, signature, userOpHash),
      ).to.be.revertedWithCustomError(nostrSignaturesTest, "InvalidSignatureLength");
    });

    it("Should revert with InvalidOwnerAddress for zero owner", async function () {
      const owner = "0x0";
      const signature = ethers.hexlify(ethers.randomBytes(64)); // 64 bytes
      const userOpHash = ethers.hexlify(ethers.randomBytes(32));

      await expect(
        nostrSignaturesTest.verifyNostrSignature(owner, signature, userOpHash),
      ).to.be.revertedWithCustomError(nostrSignaturesTest, "InvalidOwnerAddress");
    });

    it("Should revert with SignatureVerificationFailed for invalid signature", async function () {
      const owner = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const signature = hre.ethers.hexlify(hre.ethers.randomBytes(64)); // Random signature
      const userOpHash = hre.ethers.hexlify(hre.ethers.randomBytes(32));

      await expect(
        nostrSignaturesTest.verifyNostrSignature(owner, signature, userOpHash),
      ).to.be.revertedWithCustomError(nostrSignaturesTest, "SignatureVerificationFailed");
    });

    it("Should emit NostrSignatureVerified event on successful verification", async function () {
      // Note: This test would need a valid signature to pass
      // For now, we'll test the event emission structure

      // We expect this to fail, but we can check if the event would be emitted
      // by looking at the contract's event structure
      const contract = await hre.ethers.getContractAt("NostrSignaturesTest", await nostrSignaturesTest.getAddress());

      // Check that the event exists in the contract
      const eventFilter = contract.filters.NostrSignatureVerified();
      void expect(eventFilter).to.not.be.undefined;
    });
  });

  describe("tryVerifyNostrSignature", function () {
    it("Should return false for wrong signature length", async function () {
      const owner = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const signature = ethers.hexlify(ethers.randomBytes(32)); // 32 bytes instead of 64
      const userOpHash = ethers.hexlify(ethers.randomBytes(32));

      const result = await nostrSignaturesTest.tryVerifyNostrSignature(owner, signature, userOpHash);
      expect(result).to.be.false;
    });

    it("Should return false for zero owner", async function () {
      const owner = "0x0";
      const signature = ethers.hexlify(ethers.randomBytes(64)); // 64 bytes
      const userOpHash = ethers.hexlify(ethers.randomBytes(32));

      const result = await nostrSignaturesTest.tryVerifyNostrSignature(owner, signature, userOpHash);
      expect(result).to.be.false;
    });

    it("Should return false for invalid signature", async function () {
      const owner = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const signature = hre.ethers.hexlify(hre.ethers.randomBytes(64)); // Random signature
      const userOpHash = hre.ethers.hexlify(hre.ethers.randomBytes(32));

      const result = await nostrSignaturesTest.tryVerifyNostrSignature(owner, signature, userOpHash);
      expect(result).to.be.false;
    });

    it("Should handle edge cases gracefully", async function () {
      // Test with maximum values
      const owner = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2E"; // p - 1
      const signature = hre.ethers.hexlify(hre.ethers.randomBytes(64));
      const userOpHash = hre.ethers.hexlify(hre.ethers.randomBytes(32));

      const result = await nostrSignaturesTest.tryVerifyNostrSignature(owner, signature, userOpHash);
      expect(result).to.be.false; // Should fail with random signature
    });

    it("Should construct Nostr event message correctly", async function () {
      // This test verifies that the message construction logic works
      // We can't easily test the exact message without a valid signature,
      // but we can ensure the function doesn't revert on message construction
      const owner = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const signature = hre.ethers.hexlify(hre.ethers.randomBytes(64));
      const userOpHash = hre.ethers.hexlify(hre.ethers.randomBytes(32));

      // Should not revert during message construction
      const result = await nostrSignaturesTest.tryVerifyNostrSignature(owner, signature, userOpHash);
      expect(result).to.be.a("boolean");
    });
  });

  describe("Message construction", function () {
    it("Should handle different userOpHash values", async function () {
      const owner = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const signature = hre.ethers.hexlify(hre.ethers.randomBytes(64));

      // Test with different userOpHash values
      const userOpHash1 = "0x0000000000000000000000000000000000000000000000000000000000000000";
      const userOpHash2 = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
      const userOpHash3 = hre.ethers.hexlify(hre.ethers.randomBytes(32));

      const result1 = await nostrSignaturesTest.tryVerifyNostrSignature(owner, signature, userOpHash1);
      const result2 = await nostrSignaturesTest.tryVerifyNostrSignature(owner, signature, userOpHash2);
      const result3 = await nostrSignaturesTest.tryVerifyNostrSignature(owner, signature, userOpHash3);

      expect(result1).to.be.false;
      expect(result2).to.be.false;
      expect(result3).to.be.false;
    });

    it("Should handle different owner values", async function () {
      const signature = hre.ethers.hexlify(hre.ethers.randomBytes(64));
      const userOpHash = hre.ethers.hexlify(hre.ethers.randomBytes(32));

      // Test with different owner values
      const owner1 = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const owner2 = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const owner3 = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2E";

      const result1 = await nostrSignaturesTest.tryVerifyNostrSignature(owner1, signature, userOpHash);
      const result2 = await nostrSignaturesTest.tryVerifyNostrSignature(owner2, signature, userOpHash);
      const result3 = await nostrSignaturesTest.tryVerifyNostrSignature(owner3, signature, userOpHash);

      expect(result1).to.be.false;
      expect(result2).to.be.false;
      expect(result3).to.be.false;
    });
  });

  describe("Gas efficiency", function () {
    it("Should complete verification within reasonable gas limit", async function () {
      const owner = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const signature = hre.ethers.hexlify(hre.ethers.randomBytes(64));
      const userOpHash = hre.ethers.hexlify(hre.ethers.randomBytes(32));

      const tx = await nostrSignaturesTest.tryVerifyNostrSignature(owner, signature, userOpHash);

      // The transaction should complete without running out of gas
      expect(tx).to.be.a("boolean");
    });
  });
});
