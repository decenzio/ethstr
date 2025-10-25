// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@account-abstraction/contracts/core/BaseAccount.sol";
import "@account-abstraction/contracts/core/Helpers.sol";
import "@account-abstraction/contracts/accounts/callback/TokenCallbackHandler.sol";

import "./NostrSignatures.sol";

/**
 * @title NpubAccount
 * @notice A minimal smart account implementation that uses Nostr signatures for authentication
 * @dev This contract implements ERC-4337 account abstraction with Nostr protocol integration.
 *      It allows users to control their account using Nostr private keys instead of Ethereum private keys.
 *      The account supports execution of arbitrary transactions, ETH handling, and deposit management.
 * @author Senior Smart Contract Engineer
 */
contract NpubAccount is BaseAccount, TokenCallbackHandler, UUPSUpgradeable, Initializable, ReentrancyGuard {
    // ============ State Variables ============

    /// @notice The Nostr public key (x-coordinate) that owns this account
    uint256 public owner;

    /// @notice The EntryPoint contract for account abstraction operations
    IEntryPoint private immutable _entryPoint;

    // ============ Events ============

    /// @notice Emitted when the account is initialized with a new owner
    /// @param entryPoint The EntryPoint contract address
    /// @param owner The Nostr public key that owns this account
    event AccountInitialized(IEntryPoint indexed entryPoint, uint256 indexed owner);

    /// @notice Emitted when ETH is deposited to the EntryPoint
    /// @param amount The amount of ETH deposited
    /// @param newBalance The new deposit balance in EntryPoint
    event DepositAdded(uint256 indexed amount, uint256 indexed newBalance);

    /// @notice Emitted when ETH is withdrawn from the EntryPoint
    /// @param to The address that received the withdrawn funds
    /// @param amount The amount of ETH withdrawn
    /// @param newBalance The new deposit balance in EntryPoint
    event DepositWithdrawn(address indexed to, uint256 indexed amount, uint256 indexed newBalance);

    /// @notice Emitted when the account implementation is upgraded
    /// @param newImplementation The address of the new implementation
    event AccountUpgraded(address indexed newImplementation);

    // ============ Errors ============

    /// @notice Thrown when a function is called by an unauthorized address
    error UnauthorizedCaller();

    /// @notice Thrown when the owner address is invalid (zero)
    error InvalidOwner();

    /// @notice Thrown when attempting to withdraw more than available deposit
    error InsufficientDeposit();

    /// @notice Thrown when attempting to withdraw to zero address
    error InvalidWithdrawAddress();

    /// @notice Thrown when attempting to deposit zero amount
    error ZeroDepositAmount();

    /// @notice Thrown when EntryPoint address is invalid
    error InvalidEntryPoint();

    // ============ Modifiers ============

    /// @notice Restricts function access to the account owner only
    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    // ============ View Functions ============

    /// @notice Returns the EntryPoint contract address
    /// @return The EntryPoint contract instance
    function entryPoint() public view virtual override returns (IEntryPoint) {
        return _entryPoint;
    }

    // ============ Receive Function ============

    /// @notice Allows the contract to receive ETH
    /// @dev This function enables the contract to accept ETH transfers
    receive() external payable {
        // Intentionally empty - allows contract to receive ETH
    }

    // ============ Constructor ============

    /// @notice Initializes the contract with the EntryPoint address
    /// @dev Disables initializers to prevent direct initialization
    /// @param anEntryPoint The EntryPoint contract address for account abstraction
    constructor(IEntryPoint anEntryPoint) {
        if (address(anEntryPoint) == address(0)) {
            revert InvalidEntryPoint();
        }
        _entryPoint = anEntryPoint;
        _disableInitializers();
    }

    // ============ Internal Functions ============

    /// @notice Internal function to check if the caller is the owner
    /// @dev The account itself (which gets redirected through execute()) is considered the owner
    function _onlyOwner() internal view {
        if (msg.sender != address(this)) {
            revert UnauthorizedCaller();
        }
    }

    // ============ Initialization Functions ============

    /// @notice Initializes the account with a Nostr public key owner
    /// @dev The EntryPoint member is immutable to reduce gas consumption. To upgrade EntryPoint,
    ///      a new implementation must be deployed with the new EntryPoint address, then upgrading
    ///      the implementation by calling `upgradeTo()`
    /// @param anOwner The Nostr public key (x-coordinate) that will own this account
    function initialize(uint256 anOwner) public virtual initializer {
        _initialize(anOwner);
    }

    /// @notice Internal initialization function
    /// @dev Sets the owner and emits initialization event
    /// @param anOwner The Nostr public key (x-coordinate) that will own this account
    function _initialize(uint256 anOwner) internal virtual {
        if (anOwner == 0) {
            revert InvalidOwner();
        }
        owner = anOwner;
        emit AccountInitialized(_entryPoint, owner);
    }

    // ============ Execution Functions ============

    /// @notice Validates that the function call went through EntryPoint
    /// @dev Override from BaseAccount to ensure proper execution context
    function _requireForExecute() internal view virtual override {
        if (msg.sender != address(entryPoint()) && msg.sender != address(this)) {
            revert UnauthorizedCaller();
        }
    }

    /// @notice Validates a user operation signature using Nostr protocol
    /// @dev Implements the template method from BaseAccount for signature validation
    /// @param userOp The packed user operation containing the signature
    /// @param userOpHash The hash of the user operation to validate against
    /// @return validationData The validation result (SIG_VALIDATION_SUCCESS or SIG_VALIDATION_FAILED)
    function _validateSignature(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash
    ) internal virtual override returns (uint256 validationData) {
        // UserOpHash can be generated using eth_signTypedData_v4
        if (NostrSignatures.verifyNostrSignature(owner, userOp.signature, userOpHash)) {
            return SIG_VALIDATION_SUCCESS;
        }
        return SIG_VALIDATION_FAILED;
    }

    // ============ Deposit Management Functions ============

    /// @notice Returns the current account deposit balance in the EntryPoint
    /// @return The current deposit balance in wei
    function getDeposit() public view returns (uint256) {
        return entryPoint().balanceOf(address(this));
    }

    /// @notice Deposits ETH to the EntryPoint for this account
    /// @dev The deposited ETH is used to pay for gas fees during user operations
    function addDeposit() public payable nonReentrant {
        if (msg.value == 0) {
            revert ZeroDepositAmount();
        }

        // Checks-Effects-Interactions pattern
        uint256 amount = msg.value;
        entryPoint().depositTo{ value: amount }(address(this));
        uint256 newBalance = entryPoint().balanceOf(address(this));

        emit DepositAdded(amount, newBalance);
    }

    /// @notice Withdraws ETH from the account's EntryPoint deposit
    /// @dev Only the account owner can withdraw funds
    /// @param withdrawAddress The address to send the withdrawn funds to
    /// @param amount The amount of ETH to withdraw in wei
    function withdrawDepositTo(address payable withdrawAddress, uint256 amount) public onlyOwner nonReentrant {
        if (withdrawAddress == address(0)) {
            revert InvalidWithdrawAddress();
        }

        // Checks-Effects-Interactions pattern
        uint256 currentDeposit = entryPoint().balanceOf(address(this));
        if (amount > currentDeposit) {
            revert InsufficientDeposit();
        }

        entryPoint().withdrawTo(withdrawAddress, amount);
        uint256 newBalance = entryPoint().balanceOf(address(this));

        emit DepositWithdrawn(withdrawAddress, amount, newBalance);
    }

    // ============ Upgrade Functions ============

    /// @notice Authorizes the upgrade to a new implementation
    /// @dev Only the account owner can authorize upgrades
    /// @param newImplementation The address of the new implementation contract
    function _authorizeUpgrade(address newImplementation) internal view override {
        if (newImplementation == address(0)) {
            revert InvalidEntryPoint();
        }
        _onlyOwner();
    }
}
