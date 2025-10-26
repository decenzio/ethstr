import { expect } from "chai";
import { HexStringsTest } from "../typechain-types";

describe("HexStrings Library", function () {
  let hexStringsTest: HexStringsTest;

  before(async () => {
    const HexStringsTestFactory = await hre.ethers.getContractFactory("HexStringsTest");
    hexStringsTest = (await HexStringsTestFactory.deploy()) as HexStringsTest;
    await hexStringsTest.waitForDeployment();
  });

  describe("toHexString", function () {
    it("Should convert zero to 64-character hex string", async function () {
      const result = await hexStringsTest.toHexString(0);
      expect(result).to.equal("0000000000000000000000000000000000000000000000000000000000000000");
      expect(result.length).to.equal(64);
    });

    it("Should convert small numbers with leading zeros", async function () {
      const result = await hexStringsTest.toHexString(1);
      expect(result).to.equal("0000000000000000000000000000000000000000000000000000000000000001");
      expect(result.length).to.equal(64);
    });

    it("Should convert larger numbers correctly", async function () {
      const result = await hexStringsTest.toHexString(0x1234567890abcdef);
      expect(result).to.equal("0000000000000000000000000000000000000000000000001234567890abcdef");
      expect(result.length).to.equal(64);
    });

    it("Should convert maximum uint256 value", async function () {
      const maxUint256 = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
      const result = await hexStringsTest.toHexString(maxUint256);
      expect(result).to.equal("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
      expect(result.length).to.equal(64);
    });

    it("Should always return 64 characters", async function () {
      const testValues = [
        0,
        1,
        0xff,
        0xffff,
        0xffffffff,
        0x1234567890abcdef,
        "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
      ];

      for (const value of testValues) {
        const result = await hexStringsTest.toHexString(value);
        expect(result.length).to.equal(64);
      }
    });

    it("Should use lowercase hex characters", async function () {
      const result = await hexStringsTest.toHexString(0xabcdef);
      expect(result).to.equal("0000000000000000000000000000000000000000000000000000000000abcdef");
      expect(result).to.not.include("ABCDEF");
    });
  });

  describe("toHexStringNoPrefix", function () {
    it("Should convert zero to single character", async function () {
      const result = await hexStringsTest.toHexStringNoPrefix(0);
      expect(result).to.equal("0");
    });

    it("Should convert small numbers without leading zeros", async function () {
      const result = await hexStringsTest.toHexStringNoPrefix(1);
      expect(result).to.equal("1");
    });

    it("Should convert larger numbers without leading zeros", async function () {
      const result = await hexStringsTest.toHexStringNoPrefix(0x1234567890abcdef);
      expect(result).to.equal("1234567890abcdef");
    });

    it("Should convert maximum uint256 value", async function () {
      const maxUint256 = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
      const result = await hexStringsTest.toHexStringNoPrefix(maxUint256);
      expect(result).to.equal("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
      expect(result.length).to.equal(64);
    });

    it("Should not include leading zeros", async function () {
      const result = await hexStringsTest.toHexStringNoPrefix(0x123);
      expect(result).to.equal("123");
      expect(result).to.not.startWith("0");
    });

    it("Should use lowercase hex characters", async function () {
      const result = await hexStringsTest.toHexStringNoPrefix(0xabcdef);
      expect(result).to.equal("abcdef");
      expect(result).to.not.include("ABCDEF");
    });
  });

  describe("toHexStringWithPrefix", function () {
    it("Should convert zero with 0x prefix", async function () {
      const result = await hexStringsTest.toHexStringWithPrefix(0);
      expect(result).to.equal("0x0");
    });

    it("Should convert small numbers with 0x prefix", async function () {
      const result = await hexStringsTest.toHexStringWithPrefix(1);
      expect(result).to.equal("0x1");
    });

    it("Should convert larger numbers with 0x prefix", async function () {
      const result = await hexStringsTest.toHexStringWithPrefix(0x1234567890abcdef);
      expect(result).to.equal("0x1234567890abcdef");
    });

    it("Should convert maximum uint256 value with prefix", async function () {
      const maxUint256 = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
      const result = await hexStringsTest.toHexStringWithPrefix(maxUint256);
      expect(result).to.equal("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
      expect(result).to.startWith("0x");
      expect(result.length).to.equal(66); // 0x + 64 characters
    });

    it("Should always start with 0x", async function () {
      const testValues = [0, 1, 0xff, 0xffff, 0x1234567890abcdef];

      for (const value of testValues) {
        const result = await hexStringsTest.toHexStringWithPrefix(value);
        expect(result).to.startWith("0x");
      }
    });

    it("Should not include leading zeros after prefix", async function () {
      const result = await hexStringsTest.toHexStringWithPrefix(0x123);
      expect(result).to.equal("0x123");
      expect(result).to.not.include("0x0123");
    });
  });

  describe("Edge cases", function () {
    it("Should handle boundary values correctly", async function () {
      const boundaryValues = [
        0,
        1,
        0xff,
        0xffff,
        0xffffffff,
        0xffffffffffffffff,
        "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
      ];

      for (const value of boundaryValues) {
        const hexString = await hexStringsTest.toHexString(value);
        const hexStringNoPrefix = await hexStringsTest.toHexStringNoPrefix(value);
        const hexStringWithPrefix = await hexStringsTest.toHexStringWithPrefix(value);

        expect(hexString.length).to.equal(64);
        expect(hexStringNoPrefix.length).to.be.greaterThan(0);
        expect(hexStringWithPrefix).to.startWith("0x");
      }
    });

    it("Should be consistent across different functions", async function () {
      const value = 0x1234567890abcdef;

      const hexString = await hexStringsTest.toHexString(value);
      const hexStringNoPrefix = await hexStringsTest.toHexStringNoPrefix(value);
      const hexStringWithPrefix = await hexStringsTest.toHexStringWithPrefix(value);

      // The no-prefix version should be the suffix of the full version
      expect(hexString).to.endWith(hexStringNoPrefix);

      // The with-prefix version should be 0x + no-prefix version
      expect(hexStringWithPrefix).to.equal("0x" + hexStringNoPrefix);
    });
  });

  describe("Gas efficiency", function () {
    it("Should complete conversion within reasonable gas limit", async function () {
      const value = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";

      const tx1 = await hexStringsTest.toHexString(value);
      const tx2 = await hexStringsTest.toHexStringNoPrefix(value);
      const tx3 = await hexStringsTest.toHexStringWithPrefix(value);

      // All transactions should complete without running out of gas
      expect(tx1).to.be.a("string");
      expect(tx2).to.be.a("string");
      expect(tx3).to.be.a("string");
    });
  });
});
