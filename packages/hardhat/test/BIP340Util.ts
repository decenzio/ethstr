import { expect } from "chai";
import hre from "hardhat";
import { BIP340UtilTest } from "../typechain-types";

describe("BIP340Util Library", function () {
  let bip340UtilTest: BIP340UtilTest;

  before(async () => {
    const BIP340UtilTestFactory = await hre.ethers.getContractFactory("BIP340UtilTest");
    bip340UtilTest = (await BIP340UtilTestFactory.deploy()) as BIP340UtilTest;
    await bip340UtilTest.waitForDeployment();
  });

  describe("computeChallenge", function () {
    it("Should compute challenge hash correctly", async function () {
      const rx = hre.ethers.hexlify(hre.ethers.randomBytes(32));
      const px = hre.ethers.hexlify(hre.ethers.randomBytes(32));
      const m = hre.ethers.hexlify(hre.ethers.randomBytes(32));

      const challenge = await bip340UtilTest.computeChallenge(rx, px, m);

      // Challenge should be a valid uint256
      expect(challenge).to.be.a("bigint");
      expect(challenge).to.be.greaterThan(0n);
    });

    it("Should produce deterministic results for same inputs", async function () {
      const rx = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const px = "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321";
      const m = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";

      const challenge1 = await bip340UtilTest.computeChallenge(rx, px, m);
      const challenge2 = await bip340UtilTest.computeChallenge(rx, px, m);

      expect(challenge1).to.equal(challenge2);
    });

    it("Should produce different results for different inputs", async function () {
      const rx1 = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const rx2 = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdee";
      const px = "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321";
      const m = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";

      const challenge1 = await bip340UtilTest.computeChallenge(rx1, px, m);
      const challenge2 = await bip340UtilTest.computeChallenge(rx2, px, m);

      expect(challenge1).to.not.equal(challenge2);
    });
  });

  describe("liftX", function () {
    it("Should lift valid x-coordinate successfully", async function () {
      // Use a known valid x-coordinate on secp256k1
      const x = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798"; // Generator point x-coordinate

      const result = await bip340UtilTest.liftX(x);

      void expect(result.success).to.be.true;
      expect(result.y).to.be.a("bigint");
      expect(result.y).to.be.greaterThan(0n);
    });

    it("Should fail for x-coordinate out of range", async function () {
      // Use x-coordinate >= p (field modulus)
      const x = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F"; // p

      const result = await bip340UtilTest.liftX(x);

      void expect(result.success).to.be.false;
      expect(result.y).to.equal(0n);
    });

    it("Should fail for x-coordinate that doesn't have valid y", async function () {
      // Find a small x that yields a non-residue for y^2 = x^3 + 7 (mod p)
      const P = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn;

      const modPow = (base: bigint, exp: bigint, mod: bigint): bigint => {
        let result = 1n;
        let b = base % mod;
        let e = exp;
        while (e > 0n) {
          if ((e & 1n) === 1n) result = (result * b) % mod;
          b = (b * b) % mod;
          e >>= 1n;
        }
        return result;
      };

      const isResidue = (a: bigint): boolean => modPow(a % P, (P - 1n) / 2n, P) === 1n;

      let xCandidate = 2n;
      // search a few candidates deterministically
      for (let i = 0; i < 128; i++) {
        const rhs = (((xCandidate * xCandidate) % P) * xCandidate + 7n) % P;
        if (!isResidue(rhs)) break;
        xCandidate++;
      }

      const x = `0x${xCandidate.toString(16).padStart(64, "0")}`;
      const result = await bip340UtilTest.liftX(x);

      void expect(result.success).to.be.false;
      expect(result.y).to.equal(0n);
    });

    it("Should return even y-coordinate", async function () {
      const x = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";

      const result = await bip340UtilTest.liftX(x);

      void expect(result.success).to.be.true;
      // Check that y is even (y & 1 == 0)
      expect(result.y & 1n).to.equal(0n);
    });
  });

  describe("convToFakeAddr", function () {
    it("Should convert valid public key to fake address", async function () {
      const px = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";

      const result = await bip340UtilTest.convToFakeAddr(px);

      void expect(result.success).to.be.true;
      expect(result.addr).to.be.a("string");
      expect(result.addr).to.match(/^0x[a-fA-F0-9]{40}$/); // Valid Ethereum address format
    });

    it("Should fail for invalid public key", async function () {
      const px = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F"; // p

      const result = await bip340UtilTest.convToFakeAddr(px);

      void expect(result.success).to.be.false;
      expect(result.addr).to.equal("0x0000000000000000000000000000000000000000");
    });

    it("Should produce deterministic addresses for same input", async function () {
      const px = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";

      const result1 = await bip340UtilTest.convToFakeAddr(px);
      const result2 = await bip340UtilTest.convToFakeAddr(px);

      expect(result1.success).to.be.true;
      expect(result2.success).to.be.true;
      expect(result1.addr).to.equal(result2.addr);
    });

    it("Should produce different addresses for different inputs", async function () {
      const px1 = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const px2 = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81799";

      const result1 = await bip340UtilTest.convToFakeAddr(px1);
      const result2 = await bip340UtilTest.convToFakeAddr(px2);

      expect(result1.success).to.be.true;
      expect(result2.success).to.be.true;
      expect(result1.addr).to.not.equal(result2.addr);
    });
  });

  describe("xToAffine", function () {
    it("Should convert projective coordinates to affine", async function () {
      const x = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const z = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

      const result = await bip340UtilTest.xToAffine(x, z);

      expect(result).to.be.a("bigint");
      expect(result).to.be.greaterThan(0n);
    });

    it("Should handle z = 1 case", async function () {
      const x = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const z = "0x1";

      const result = await bip340UtilTest.xToAffine(x, z);

      expect(result).to.equal(BigInt(x));
    });
  });
});
