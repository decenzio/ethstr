import { expect } from "chai";
import { NpubAccountFactory } from "../typechain-types";

describe("NpubAccountFactory", function () {
  let npubAccountFactory: NpubAccountFactory;

  // Mock EntryPoint address (v0.7.0)
  const ENTRY_POINT_V07 = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";

  before(async () => {
    // Deploy NpubAccountFactory
    const NpubAccountFactoryFactory = await hre.ethers.getContractFactory("NpubAccountFactory");
    npubAccountFactory = (await NpubAccountFactoryFactory.deploy(ENTRY_POINT_V07)) as NpubAccountFactory;
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
      expect(await implementation.entryPoint()).to.equal(ENTRY_POINT_V07);
    });
  });

  describe("createAccount", function () {
    it("Should create new account with valid parameters", async function () {
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const salt = 0;

      const tx = await npubAccountFactory.createAccount(ownerPubKey, salt);
      const account = await tx.wait();

      void expect(account).to.not.be.undefined;
    });

    it("Should emit AccountCreated event for new account", async function () {
      const ownerPubKey = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const salt = 1;

      await expect(npubAccountFactory.createAccount(ownerPubKey, salt))
        .to.emit(npubAccountFactory, "AccountCreated")
        .withArgs(await npubAccountFactory.getAddress(ownerPubKey, salt), ownerPubKey, salt, true);
    });

    it("Should return existing account if already deployed", async function () {
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const salt = 2;

      // Create account first time
      const account1 = await npubAccountFactory.createAccount(ownerPubKey, salt);
      await account1.waitForDeployment();

      // Create account second time (should return existing)
      const account2 = await npubAccountFactory.createAccount(ownerPubKey, salt);

      // Both should have the same address
      expect(await account1.getAddress()).to.equal(await account2.getAddress());
    });

    it("Should emit AccountCreated event for existing account", async function () {
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const salt = 3;

      // Create account first time
      await npubAccountFactory.createAccount(ownerPubKey, salt);

      // Create account second time (should return existing)
      await expect(npubAccountFactory.createAccount(ownerPubKey, salt))
        .to.emit(npubAccountFactory, "AccountCreated")
        .withArgs(await npubAccountFactory.getAddress(ownerPubKey, salt), ownerPubKey, salt, false);
    });

    it("Should create accounts with different owners", async function () {
      const ownerPubKey1 = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const ownerPubKey2 = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const salt = 4;

      const account1 = await npubAccountFactory.createAccount(ownerPubKey1, salt);
      const account2 = await npubAccountFactory.createAccount(ownerPubKey2, salt);

      // Should have different addresses
      expect(await account1.getAddress()).to.not.equal(await account2.getAddress());

      // Should have different owners
      expect(await account1.owner()).to.equal(ownerPubKey1);
      expect(await account2.owner()).to.equal(ownerPubKey2);
    });

    it("Should create accounts with different salts", async function () {
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const salt1 = 5;
      const salt2 = 6;

      const account1 = await npubAccountFactory.createAccount(ownerPubKey, salt1);
      const account2 = await npubAccountFactory.createAccount(ownerPubKey, salt2);

      // Should have different addresses
      expect(await account1.getAddress()).to.not.equal(await account2.getAddress());

      // Should have same owner
      expect(await account1.owner()).to.equal(ownerPubKey);
      expect(await account2.owner()).to.equal(ownerPubKey);
    });
  });

  describe("getAddress", function () {
    it("Should return deterministic address", async function () {
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const salt = 7;

      const computedAddress = await npubAccountFactory.getAddress(ownerPubKey, salt);
      const createdAccount = await npubAccountFactory.createAccount(ownerPubKey, salt);

      expect(computedAddress).to.equal(await createdAccount.getAddress());
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
      expect(await implementation.entryPoint()).to.equal(ENTRY_POINT_V07);
    });

    it("Should create accounts that inherit from implementation", async function () {
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const salt = 12;

      const account = await npubAccountFactory.createAccount(ownerPubKey, salt);

      // Check that the account has the expected interface
      expect(await account.owner()).to.equal(ownerPubKey);
      expect(await account.entryPoint()).to.equal(ENTRY_POINT_V07);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero salt", async function () {
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const salt = 0;

      const account = await npubAccountFactory.createAccount(ownerPubKey, salt);
      expect(await account.owner()).to.equal(ownerPubKey);
    });

    it("Should handle maximum salt value", async function () {
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const salt = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";

      const account = await npubAccountFactory.createAccount(ownerPubKey, salt);
      expect(await account.owner()).to.equal(ownerPubKey);
    });

    it("Should handle maximum owner value", async function () {
      const ownerPubKey = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2E"; // p - 1
      const salt = 13;

      const account = await npubAccountFactory.createAccount(ownerPubKey, salt);
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

      const tx = await npubAccountFactory.getAddress(ownerPubKey, salt);

      // Address computation should be very efficient
      expect(tx).to.be.a("string");
    });
  });

  describe("Integration", function () {
    it("Should work with EntryPoint integration", async function () {
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const salt = 16;

      const account = await npubAccountFactory.createAccount(ownerPubKey, salt);

      // Check that the account can interact with EntryPoint
      expect(await account.entryPoint()).to.equal(ENTRY_POINT_V07);

      // Check that the account can receive deposits
      const depositAmount = hre.ethers.parseEther("0.1");
      await account.addDeposit({ value: depositAmount });

      const balance = await account.getDeposit();
      expect(balance).to.equal(depositAmount);
    });
  });
});
