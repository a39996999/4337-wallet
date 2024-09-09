// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@account-abstraction/contracts/core/EntryPoint.sol";
import "@account-abstraction/contracts/interfaces/IAccount.sol";

contract Account is IAccount {
    address public owner;
    uint256 public count = 0;

    event Execute(uint256 count);

    constructor(address _owner) {
        owner = _owner;
    }

    function validateUserOp(
        PackedUserOperation calldata,
        bytes32,
        uint256
    ) external pure returns (uint256 validationData) {
        return 0;
    }

    function execute() public {
        count++;
        emit Execute(count);
    }
}

contract AccountFactory {
    function createAccount(address _owner) external returns (address) {
        Account account = new Account(_owner);
        return address(account);
    }
}