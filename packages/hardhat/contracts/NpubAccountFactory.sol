// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import "@account-abstraction/contracts/interfaces/ISenderCreator.sol";
import "./NpubAccount.sol";

/**
 * @title INpubAccountFactory
 * @notice Interface for the NpubAccountFactory contract
 * @dev Defines the interface for creating and managing NpubAccount instances
 */
interface INpubAccountFactory {
    /// @notice Creates a new NpubAccount or returns existing one
    /// @param owner The Nostr public key (x-coordinate) that will own the account
    /// @param salt The salt used for deterministic address generation
    /// @return ret The created or existing NpubAccount instance
    function createAccount(uint256 owner, uint256 salt) external returns (NpubAccount ret);

    /// @notice Calculates the counterfactual address of an account
    /// @param owner The Nostr public key (x-coordinate) that will own the account
    /// @param salt The salt used for deterministic address generation
    /// @return The computed address of the account
    function getAddress(uint256 owner, uint256 salt) external view returns (address);

    /// @notice Returns the account implementation address
    /// @return The address of the NpubAccount implementation
    function accountImplementation() external view returns (NpubAccount);
}

/**
 * @title NpubAccountFactory
 * @notice Factory contract for creating NpubAccount instances using deterministic addresses
 * @dev A UserOperations "initCode" holds the address of the factory, and a method call (to createAccount).
 *      The factory's createAccount returns the target account address even if it is already installed.
 *      This way, the entryPoint.getSenderAddress() can be called either before or after the account is created.
 * @author Senior Smart Contract Engineer
 */
contract NpubAccountFactory is INpubAccountFactory {
    // ============ State Variables ============

    /// @notice The immutable account implementation contract
    NpubAccount public immutable override accountImplementation;

    // ============ Custom Errors ============

    /// @notice Thrown when caller is not the authorized sender creator
    error UnauthorizedCaller();

    /// @notice Thrown when account creation fails
    error AccountCreationFailed();

    // ============ Events ============

    /// @notice Emitted when a new account is created
    /// @param account The address of the created account
    /// @param owner The Nostr public key that owns the account
    /// @param salt The salt used for address generation
    /// @param isNew Whether this is a newly created account (true) or existing (false)
    event AccountCreated(address indexed account, uint256 indexed owner, uint256 indexed salt, bool isNew);

    // ============ Constructor ============

    /// @notice Initializes the factory with the EntryPoint contract
    /// @param _entryPoint The EntryPoint contract address
    constructor(IEntryPoint _entryPoint) {
        accountImplementation = new NpubAccount(_entryPoint);
    }

    // ============ External Functions ============

    /// @notice Creates a new NpubAccount or returns existing one
    /// @dev Returns the address even if the account is already deployed.
    ///      Note that during UserOperation execution, this method is called only if the account is not deployed.
    ///      This method returns an existing account address so that entryPoint.getSenderAddress() would work even after account creation
    /// @param owner The Nostr public key (x-coordinate) that will own the account
    /// @param salt The salt used for deterministic address generation
    /// @return ret The created or existing NpubAccount instance
    function createAccount(uint256 owner, uint256 salt) external override returns (NpubAccount ret) {
        address addr = this.getAddress(owner, salt);
        uint256 codeSize = addr.code.length;

        // Return existing account if already deployed
        if (codeSize > 0) {
            emit AccountCreated(addr, owner, salt, false);
            return NpubAccount(payable(addr));
        }

        // Create new account using CREATE2 for deterministic address
        try
            new ERC1967Proxy{ salt: bytes32(salt) }(
                address(accountImplementation),
                abi.encodeCall(NpubAccount.initialize, (owner))
            )
        returns (ERC1967Proxy proxy) {
            ret = NpubAccount(payable(address(proxy)));
            emit AccountCreated(address(ret), owner, salt, true);
        } catch {
            revert AccountCreationFailed();
        }
    }

    /// @notice Calculates the counterfactual address of an account as it would be returned by createAccount()
    /// @dev Uses CREATE2 to compute the deterministic address based on salt and initialization data
    /// @param owner The Nostr public key (x-coordinate) that will own the account
    /// @param salt The salt used for deterministic address generation
    /// @return The computed address of the account
    function getAddress(uint256 owner, uint256 salt) external view override returns (address) {
        return
            Create2.computeAddress(
                bytes32(salt),
                keccak256(
                    abi.encodePacked(
                        type(ERC1967Proxy).creationCode,
                        abi.encode(address(accountImplementation), abi.encodeCall(NpubAccount.initialize, (owner)))
                    )
                )
            );
    }
}
