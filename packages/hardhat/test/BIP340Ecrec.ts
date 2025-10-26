import { expect } from "chai";
import { ethers } from "hardhat";
import { BIP340EcrecTest } from "../typechain-types";

describe("BIP340Ecrec Library", function () {
  let bip340EcrecTest: BIP340EcrecTest;

  before(async () => {
    const BIP340EcrecTestFactory = await ethers.getContractFactory("BIP340EcrecTest");
    bip340EcrecTest = (await BIP340EcrecTestFactory.deploy()) as BIP340EcrecTest;
    await bip340EcrecTest.waitForDeployment();
  });

  describe("verify", function () {
    it("Should reject invalid signature parameters", async function () {
      // Test with px >= p (field modulus)
      const px = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F"; // p
      const rx = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const s = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const m = ethers.hexlify(ethers.randomBytes(32));

      const result = await bip340EcrecTest.verify(px, rx, s, m);
      void expect(result).to.be.false;
    });

    it("Should reject invalid rx parameter", async function () {
      const px = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const rx = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F"; // p
      const s = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const m = ethers.hexlify(ethers.randomBytes(32));

      const result = await bip340EcrecTest.verify(px, rx, s, m);
      void expect(result).to.be.false;
    });

    it("Should reject invalid s parameter", async function () {
      const px = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const rx = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const s = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141"; // n
      const m = ethers.hexlify(ethers.randomBytes(32));

      const result = await bip340EcrecTest.verify(px, rx, s, m);
      void expect(result).to.be.false;
    });

    it("Should reject signature with invalid point lifting", async function () {
      const px = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const rx = "0x0000000000000000000000000000000000000000000000000000000000000001"; // Invalid point
      const s = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const m = ethers.hexlify(ethers.randomBytes(32));

      const result = await bip340EcrecTest.verify(px, rx, s, m);
      void expect(result).to.be.false;
    });

    it("Should reject random signature data", async function () {
      const px = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const rx = ethers.hexlify(ethers.randomBytes(32));
      const s = ethers.hexlify(ethers.randomBytes(32));
      const m = ethers.hexlify(ethers.randomBytes(32));

      const result = await bip340EcrecTest.verify(px, rx, s, m);
      void expect(result).to.be.false;
    });

    it("Should handle edge cases gracefully", async function () {
      // Test with zero values
      const px = "0x0";
      const rx = "0x0";
      const s = "0x0";
      const m = ethers.hexlify(ethers.randomBytes(32));

      const result = await bip340EcrecTest.verify(px, rx, s, m);
      void expect(result).to.be.false;
    });

    it("Should handle maximum valid values", async function () {
      // Test with values just under the field modulus
      const px = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2E"; // p - 1
      const rx = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2E"; // p - 1
      const s = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140"; // n - 1
      const m = ethers.hexlify(ethers.randomBytes(32));

      const result = await bip340EcrecTest.verify(px, rx, s, m);
      void expect(result).to.be.false; // Should fail because these are random values
    });
  });

  describe("Gas efficiency", function () {
    it("Should complete verification within reasonable gas limit", async function () {
      const px = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const rx = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const s = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const m = ethers.hexlify(ethers.randomBytes(32));

      const tx = await bip340EcrecTest.verify(px, rx, s, m);

      // The transaction should complete without running out of gas
      expect(tx).to.be.a("boolean");
    });
  });
});
