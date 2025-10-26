// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MockEntryPoint {
    mapping(address => uint256) private _balances;

    function depositTo(address account) external payable {
        _balances[account] += msg.value;
    }

    function withdrawTo(address payable withdrawAddress, uint256 amount) external {
        uint256 bal = _balances[msg.sender];
        require(withdrawAddress != address(0), "ZERO_ADDR");
        require(bal >= amount, "INSUFFICIENT");
        unchecked {
            _balances[msg.sender] = bal - amount;
        }
        (bool ok, ) = withdrawAddress.call{ value: amount }("");
        require(ok, "SEND_FAIL");
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }
}


