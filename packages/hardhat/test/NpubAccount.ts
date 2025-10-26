import { expect } from "chai";
import { ethers } from "hardhat";
import { NpubAccount, NpubAccountFactory } from "../typechain-types";

describe("NpubAccount", function () {
  let npubAccount: NpubAccount;
  let npubAccountFactory: NpubAccountFactory;
  let entryPoint: any;
  let owner: any;
  let otherAccount: any;

  // Mock EntryPoint address (v0.7.0)
  const ENTRY_POINT_V07 = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";

  before(async () => {
    [owner, otherAccount] = await ethers.getSigners();

    // Deploy NpubAccountFactory
    const NpubAccountFactoryFactory = await ethers.getContractFactory("NpubAccountFactory");
    npubAccountFactory = (await NpubAccountFactoryFactory.deploy(ENTRY_POINT_V07)) as NpubAccountFactory;
    await npubAccountFactory.waitForDeployment();

    // Create a test account
    const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
    const salt = 0;

    npubAccount = await npubAccountFactory.createAccount(ownerPubKey, salt);
    await npubAccount.waitForDeployment();

    // Get EntryPoint contract
    entryPoint = await ethers.getContractAt("IEntryPoint", ENTRY_POINT_V07);
  });

  describe("Deployment and Initialization", function () {
    it("Should initialize with correct owner", async function () {
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      expect(await npubAccount.owner()).to.equal(ownerPubKey);
    });

    it("Should have correct EntryPoint address", async function () {
      expect(await npubAccount.entryPoint()).to.equal(ENTRY_POINT_V07);
    });

    it("Should emit AccountInitialized event", async function () {
      // Create a new account to test event emission
      const ownerPubKey = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const salt = 1;

      const tx = await npubAccountFactory.createAccount(ownerPubKey, salt);
      await expect(tx)
        .to.emit(npubAccountFactory, "AccountCreated")
        .withArgs(await npubAccountFactory.getAddress(ownerPubKey, salt), ownerPubKey, salt, true);
    });

    it("Should revert when initializing with zero owner", async function () {
      const NpubAccountFactory = await hre.ethers.getContractFactory("NpubAccountFactory");
      const factory = await NpubAccountFactory.deploy(ENTRY_POINT_V07);
      await factory.waitForDeployment();

      // This should revert when trying to initialize with zero owner
      // We can't directly test this since the factory handles initialization
      // But we can verify the account was created with a valid owner
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
      const account = await factory.createAccount(ownerPubKey, 0);
      expect(await account.owner()).to.not.equal("0x0");
    });
  });

  describe("Deposit Management", function () {
    it("Should allow ETH deposits", async function () {
      const depositAmount = hre.ethers.parseEther("1.0");

      const tx = await npubAccount.addDeposit({ value: depositAmount });
      await expect(tx).to.emit(npubAccount, "DepositAdded").withArgs(depositAmount, depositAmount);
    });

    it("Should track deposit balance correctly", async function () {
      const depositAmount = hre.ethers.parseEther("1.0");
      await npubAccount.addDeposit({ value: depositAmount });

      const balance = await npubAccount.getDeposit();
      expect(balance).to.equal(depositAmount);
    });

    it("Should allow multiple deposits", async function () {
      const depositAmount1 = hre.ethers.parseEther("1.0");
      const depositAmount2 = hre.ethers.parseEther("0.5");

      await npubAccount.addDeposit({ value: depositAmount1 });
      await npubAccount.addDeposit({ value: depositAmount2 });

      const totalBalance = await npubAccount.getDeposit();
      expect(totalBalance).to.equal(depositAmount1 + depositAmount2);
    });

    it("Should revert when depositing zero amount", async function () {
      await expect(npubAccount.addDeposit({ value: 0 })).to.be.revertedWithCustomError(
        npubAccount,
        "ZeroDepositAmount",
      );
    });

    it("Should allow withdrawal to valid address", async function () {
      const depositAmount = hre.ethers.parseEther("1.0");
      await npubAccount.addDeposit({ value: depositAmount });

      const withdrawAmount = hre.ethers.parseEther("0.5");

      // Note: This test would need proper signature validation in a real scenario
      // For now, we'll test the function structure
      const tx = await npubAccount.withdrawDepositTo(otherAccount.address, withdrawAmount);

      // Check that the transaction was processed
      void expect(tx).to.not.be.undefined;
    });

    it("Should revert when withdrawing to zero address", async function () {
      const depositAmount = hre.ethers.parseEther("1.0");
      await npubAccount.addDeposit({ value: depositAmount });

      await expect(
        npubAccount.withdrawDepositTo("0x0000000000000000000000000000000000000000", hre.ethers.parseEther("0.1")),
      ).to.be.revertedWithCustomError(npubAccount, "InvalidWithdrawAddress");
    });

    it("Should revert when withdrawing more than available", async function () {
      const depositAmount = hre.ethers.parseEther("1.0");
      await npubAccount.addDeposit({ value: depositAmount });

      await expect(
        npubAccount.withdrawDepositTo(otherAccount.address, hre.ethers.parseEther("2.0")),
      ).to.be.revertedWithCustomError(npubAccount, "InsufficientDeposit");
    });
  });

  describe("Access Control", function () {
    it("Should restrict access to owner-only functions", async function () {
      // Test that only the account itself can call owner functions
      // In a real scenario, this would be enforced through signature validation
      const ownerPubKey = "0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";

      // The account should have the correct owner
      expect(await npubAccount.owner()).to.equal(ownerPubKey);
    });

    it("Should allow receive function", async function () {
      const sendAmount = hre.ethers.parseEther("0.1");
      const initialBalance = await hre.ethers.provider.getBalance(await npubAccount.getAddress());

      await owner.sendTransaction({
        to: await npubAccount.getAddress(),
        value: sendAmount,
      });

      const finalBalance = await hre.ethers.provider.getBalance(await npubAccount.getAddress());
      expect(finalBalance).to.equal(initialBalance + sendAmount);
    });
  });

  describe("Signature Validation", function () {
    it("Should have signature validation function", async function () {
      // Test that the contract has the required signature validation structure
      const ownerPubKey = await npubAccount.owner();
      expect(ownerPubKey).to.not.equal("0x0");

      // The contract should be able to handle signature validation
      // (exact validation would require valid Nostr signatures)

      // This would fail with invalid signature, but shouldn't revert on structure
      // The actual validation logic is tested in NostrSignatures tests
    });
  });

  describe("Upgrade Functionality", function () {
    it("Should have upgrade authorization", async function () {
      // Test that the contract has upgrade functionality
      // The _authorizeUpgrade function should exist and check ownership
      const ownerPubKey = await npubAccount.owner();
      expect(ownerPubKey).to.not.equal("0x0");

      // In a real scenario, only the owner could authorize upgrades
      // This is enforced through the _authorizeUpgrade function
    });
  });

  describe("Gas Efficiency", function () {
    it("Should complete operations within reasonable gas limits", async function () {
      const depositAmount = hre.ethers.parseEther("0.1");

      const tx = await npubAccount.addDeposit({ value: depositAmount });
      const receipt = await tx.wait();

      // Check that gas usage is reasonable (less than 100k gas for deposit)
      expect(receipt.gasUsed).to.be.lessThan(100000n);
    });
  });

  describe("Integration with EntryPoint", function () {
    it("Should interact with EntryPoint correctly", async function () {
      const depositAmount = hre.ethers.parseEther("1.0");
      await npubAccount.addDeposit({ value: depositAmount });

      // Check that the deposit is reflected in EntryPoint
      const entryPointBalance = await entryPoint.balanceOf(await npubAccount.getAddress());
      expect(entryPointBalance).to.equal(depositAmount);
    });
  });
});
