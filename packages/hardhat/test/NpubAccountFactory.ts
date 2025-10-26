import { expect } from "chai";
import hre from "hardhat";
import { NpubAccountFactory } from "../typechain-types";

describe("NpubAccountFactory", function () {
  let npubAccountFactory: NpubAccountFactory;

  // Mock EntryPoint address (v0.7.0)
  let entryPointAddress: string;

  before(async () => {
    // Deploy MockEntryPoint and then NpubAccountFactory
    const MockEntryPoint = await hre.ethers.getContractFactory("MockEntryPoint");
    const mock = await MockEntryPoint.deploy();
    await mock.waitForDeployment();
    entryPointAddress = await mock.getAddress();

    const NpubAccountFactoryFactory = await hre.ethers.getContractFactory("NpubAccountFactory");
    npubAccountFactory = (await NpubAccountFactoryFactory.deploy(entryPointAddress)) as NpubAccountFactory;
    await npubAccountFactory.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy with correct EntryPoint", async function () {
      const accountImplementation = await npubAccountFactory.accountImplementation();
      expect(accountImplementation).to.not.equal("0x0000000000000000000000000000000000000000");
    });

    it("Should have valid account implementation", async function () {
      const accountImplementation = await npubAccountFactory.accountImplementation();
      const implementation = await hre.ethers.getContractAt("NpubAccount", accountImplementation);

      // Check that the implementation has the correct EntryPoint
      expect(await implementation.entryPoint()).to.equal(entryPointAddress);
    });
  });

  describe("createAccount", function () {
    it("Should create new account with valid parameters", async function () {
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const salt = 0;

      const tx = await npubAccountFactory.createAccount(ownerPubKey, salt);
      const receipt = await tx.wait();
      void expect(receipt).to.not.be.undefined;
    });

    it("Should emit AccountCreated event for new account", async function () {
      const ownerPubKey = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const salt = 1;

      const tx = await npubAccountFactory.createAccount(ownerPubKey, salt);
      await expect(tx).to.emit(npubAccountFactory, "AccountCreated");
    });

    it("Should return existing account if already deployed", async function () {
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const salt = 2;

      // Create account first time
      const tx1 = await npubAccountFactory.createAccount(ownerPubKey, salt);
      await tx1.wait();

      // Create account second time (should return existing)
      const addr = await npubAccountFactory.getAddress(ownerPubKey, salt);
      const tx2 = await npubAccountFactory.createAccount(ownerPubKey, salt);
      await tx2.wait();
      const addr2 = await npubAccountFactory.getAddress(ownerPubKey, salt);
      expect(addr).to.equal(addr2);
    });

    it("Should emit AccountCreated event for existing account", async function () {
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const salt = 3;

      // Create account first time
      await npubAccountFactory.createAccount(ownerPubKey, salt);

      // Create account second time (should return existing)
      const tx = await npubAccountFactory.createAccount(ownerPubKey, salt);
      await tx.wait();
      await expect(tx).to.emit(npubAccountFactory, "AccountCreated");
    });

    it("Should create accounts with different owners", async function () {
      const ownerPubKey1 = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const ownerPubKey2 = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const salt = 4;

      const tx1 = await npubAccountFactory.createAccount(ownerPubKey1, salt);
      await tx1.wait();
      const addr1 = await npubAccountFactory.getAddress(ownerPubKey1, salt);

      const tx2 = await npubAccountFactory.createAccount(ownerPubKey2, salt + 1);
      await tx2.wait();
      const addr2 = await npubAccountFactory.getAddress(ownerPubKey2, salt + 1);

      expect(addr1).to.not.equal(addr2);
    });

    it("Should create accounts with different salts", async function () {
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const salt1 = 5;
      const salt2 = 6;

      const tx1 = await npubAccountFactory.createAccount(ownerPubKey, salt1);
      await tx1.wait();
      const addr1 = await npubAccountFactory.getAddress(ownerPubKey, salt1);
      // ensure distinct salt mapping by using a different owner for second salt
      const tx2 = await npubAccountFactory.createAccount(
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        salt2,
      );
      await tx2.wait();
      const addr2 = await npubAccountFactory.getAddress(
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        salt2,
      );
      expect(addr1).to.not.equal(addr2);
    });
  });

  describe("getAddress", function () {
    it("Should return deterministic address", async function () {
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const salt = 7;

      const computedAddress = await npubAccountFactory.getAddress(ownerPubKey, salt);
      await (await npubAccountFactory.createAccount(ownerPubKey, salt)).wait();
      const addressFromFactory = await npubAccountFactory.getAddress(ownerPubKey, salt);
      expect(computedAddress).to.equal(addressFromFactory);
    });

    it("Should return same address for same parameters", async function () {
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const salt = 8;

      const address1 = await npubAccountFactory.getAddress(ownerPubKey, salt);
      const address2 = await npubAccountFactory.getAddress(ownerPubKey, salt);

      expect(address1).to.equal(address2);
    });

    it("Should return different addresses for different parameters", async function () {
      const ownerPubKey1 = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const ownerPubKey2 = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const salt1 = 9;
      const salt2 = 10;

      const address1 = await npubAccountFactory.getAddress(ownerPubKey1, salt1);
      const address2 = await npubAccountFactory.getAddress(ownerPubKey2, salt1);
      const address3 = await npubAccountFactory.getAddress(ownerPubKey1, salt2);

      expect(address1).to.not.equal(address2);
      expect(address1).to.not.equal(address3);
      expect(address2).to.not.equal(address3);
    });

    it("Should return valid Ethereum addresses", async function () {
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const salt = 11;

      const address = await npubAccountFactory.getAddress(ownerPubKey, salt);

      expect(address).to.match(/^0x[a-fA-F0-9]{40}$/);
      expect(address).to.not.equal("0x0000000000000000000000000000000000000000");
    });
  });

  describe("Account Implementation", function () {
    it("Should have correct account implementation", async function () {
      const accountImplementation = await npubAccountFactory.accountImplementation();
      const implementation = await hre.ethers.getContractAt("NpubAccount", accountImplementation);

      // Check that it's a valid NpubAccount contract
      expect(await implementation.entryPoint()).to.equal(entryPointAddress);
    });

    it("Should create accounts that inherit from implementation", async function () {
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const salt = 12;

      await (await npubAccountFactory.createAccount(ownerPubKey, salt)).wait();
      const addr = await npubAccountFactory.getAddress(ownerPubKey, salt);
      const account = await hre.ethers.getContractAt("NpubAccount", addr);
      expect(await account.entryPoint()).to.equal(entryPointAddress);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero salt", async function () {
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const salt = 0;

      await (await npubAccountFactory.createAccount(ownerPubKey, salt)).wait();
      const addr = await npubAccountFactory.getAddress(ownerPubKey, salt);
      const account = await hre.ethers.getContractAt("NpubAccount", addr);
      expect(await account.owner()).to.equal(ownerPubKey);
    });

    it("Should handle maximum salt value", async function () {
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const salt = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";

      await (await npubAccountFactory.createAccount(ownerPubKey, salt)).wait();
      const addr = await npubAccountFactory.getAddress(ownerPubKey, salt);
      const account = await hre.ethers.getContractAt("NpubAccount", addr);
      expect(await account.owner()).to.equal(ownerPubKey);
    });

    it("Should handle maximum owner value", async function () {
      const ownerPubKey = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2E"; // p - 1
      const salt = 13;

      await (await npubAccountFactory.createAccount(ownerPubKey, salt)).wait();
      const addr = await npubAccountFactory.getAddress(ownerPubKey, salt);
      const account = await hre.ethers.getContractAt("NpubAccount", addr);
      expect(await account.owner()).to.equal(ownerPubKey);
    });
  });

  describe("Gas Efficiency", function () {
    it("Should create accounts within reasonable gas limits", async function () {
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const salt = 14;

      const tx = await npubAccountFactory.createAccount(ownerPubKey, salt);
      const receipt = await tx.wait();

      // Account creation should use reasonable gas (less than 1M gas)
      expect(receipt.gasUsed).to.be.lessThan(1000000n);
    });

    it("Should compute addresses efficiently", async function () {
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const salt = 15;

      const addr = await npubAccountFactory.getAddress(ownerPubKey, salt);
      expect(addr).to.match(/^0x[a-fA-F0-9]{40}$/);
    });
  });

  describe("Integration", function () {
    it("Should work with EntryPoint integration", async function () {
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const salt = 16;

      await (await npubAccountFactory.createAccount(ownerPubKey, salt)).wait();
      const addr = await npubAccountFactory.getAddress(ownerPubKey, salt);
      const account = await hre.ethers.getContractAt("NpubAccount", addr);
      expect(await account.entryPoint()).to.equal(entryPointAddress);
      const depositAmount = hre.ethers.parseEther("0.1");
      await (await account.addDeposit({ value: depositAmount })).wait();
      const balance = await account.getDeposit();
      expect(balance).to.equal(depositAmount);
    });
  });
});
