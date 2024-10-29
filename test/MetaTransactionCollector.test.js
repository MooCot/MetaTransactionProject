const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MetaTransactionCollector", function () {
    let metaTransactionCollector;
    let token;
    let admin;
    let user1;
    let user2;
    let user3;

    const initialSupply = ethers.utils.parseUnits("1000000", 6); // Предположим, 1,000,000 USDT с 6 десятичными знаками

    before(async function () {
        // Получаем аккаунты
        [admin, user1, user2, user3] = await ethers.getSigners();

        // Создаем тестовый токен
        const Token = await ethers.getContractFactory("MyToken");
        token = await Token.deploy(initialSupply);
        await token.deployed();

        // Раздаем токены пользователям
        await token.transfer(user1.address, ethers.utils.parseUnits("100", 6));
        await token.transfer(user2.address, ethers.utils.parseUnits("200", 6));
        await token.transfer(user3.address, ethers.utils.parseUnits("300", 6));

        // Разворачиваем контракт MetaTransactionCollector
        const MetaTransactionCollector = await ethers.getContractFactory("MetaTransactionCollector");
        metaTransactionCollector = await MetaTransactionCollector.deploy(admin.address);
        await metaTransactionCollector.deployed();
    });

    it("should execute transfers correctly", async function () {
        const amounts = [
            ethers.utils.parseUnits("100", 6),
            ethers.utils.parseUnits("200", 6),
            ethers.utils.parseUnits("300", 6)
        ];

        // Подписываем мета-транзакции
        const signatures = await Promise.all([user1, user2, user3].map(async (user, index) => {
            const messageHash = ethers.utils.solidityKeccak256(["address", "uint256"], [user.address, amounts[index]]);
            const signature = await user.signMessage(ethers.utils.arrayify(messageHash));
            return signature;
        }));

        // Выполняем мета-транзакцию
        await metaTransactionCollector.executeTransfers(token.address, [user1.address, user2.address, user3.address], amounts, signatures);

        // Проверяем балансы
        expect(await token.balanceOf(admin.address)).to.equal(ethers.utils.parseUnits("600", 6));
        expect(await token.balanceOf(user1.address)).to.equal(ethers.utils.parseUnits("0", 6));
        expect(await token.balanceOf(user2.address)).to.equal(ethers.utils.parseUnits("0", 6));
        expect(await token.balanceOf(user3.address)).to.equal(ethers.utils.parseUnits("0", 6));
    });
});
