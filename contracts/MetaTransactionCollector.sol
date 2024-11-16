// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract MetaTransactionCollector is ERC20 {
    using ECDSA for bytes32;

    address public admin;

    event TransferExecuted(address indexed user, uint256 amount, address indexed admin);

    constructor(address _admin) {
        admin = _admin;
    }

    function executeTransfers(
        address token,
        address[] calldata users,
        uint256[] calldata amounts,
        bytes[] calldata signatures
    ) external {
        require(users.length == amounts.length, "Users and amounts length mismatch");
        require(users.length == signatures.length, "Users and signatures length mismatch");

        for (uint256 i = 0; i < users.length; i++) {
            bytes32 messageHash = keccak256(abi.encodePacked(users[i], amounts[i]));
            bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash); // Получение хеша сообщения Ethereum

            address recovered = ECDSA.recover(
                ethSignedMessageHash,
                signatures[i]
            );
            
            require(recovered == users[i], "Invalid signature");

            IERC20(token).transferFrom(users[i], admin, amounts[i]);

            emit TransferExecuted(users[i], amounts[i], admin);
        }
    }
}