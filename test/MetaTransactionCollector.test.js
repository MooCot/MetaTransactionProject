import { expect } from 'chai'; 
import hardhat from 'hardhat';  

const { ethers } = hardhat; 

describe("MetaTransactionCollector", function () {
    let metaTransactionCollector;
    let token;
    let admin;
    let user1;
    let user2;
    let user3;

    const initialSupply = ethers.utils.parseUnits("1000000", 6); 

    before(async function () {

        [admin, user1, user2, user3] = await ethers.getSigners();


        const Token = await ethers.getContractFactory("MyToken"); 
        token = await Token.deploy(initialSupply);
        await token.deployed();


        await token.transfer(user1.address, ethers.utils.parseUnits("100", 6));
        await token.transfer(user2.address, ethers.utils.parseUnits("200", 6));
        await token.transfer(user3.address, ethers.utils.parseUnits("300", 6));

        await token.connect(admin).burn(await token.balanceOf(admin.address));

 
        const MetaTransactionCollector = await ethers.getContractFactory("MetaTransactionCollector");
        metaTransactionCollector = await MetaTransactionCollector.deploy(admin.address);
        await metaTransactionCollector.deployed();


        await token.connect(user1).approve(metaTransactionCollector.address, ethers.utils.parseUnits("100", 6));
        await token.connect(user2).approve(metaTransactionCollector.address, ethers.utils.parseUnits("200", 6));
        await token.connect(user3).approve(metaTransactionCollector.address, ethers.utils.parseUnits("300", 6));
    });

    it("should execute transfers correctly", async function () {
        const amounts = [
            ethers.utils.parseUnits("100", 6),
            ethers.utils.parseUnits("200", 6),
            ethers.utils.parseUnits("300", 6)
        ];


        const signatures = await Promise.all([user1, user2, user3].map(async (user, index) => {
            const messageHash = ethers.utils.solidityKeccak256(["address", "uint256"], [user.address, amounts[index]]);
            const ethSignedMessageHash = ethers.utils.hashMessage(ethers.utils.arrayify(messageHash));
            const signature = await user.signMessage(ethers.utils.arrayify(messageHash));
            return signature;
        }));

        await metaTransactionCollector.executeTransfers(token.address, [user1.address, user2.address, user3.address], amounts, signatures);

        const totalReceived = ethers.utils.parseUnits("600", 6);
        const adminBalance = await token.balanceOf(admin.address);
        const balanceUser1 = await token.balanceOf(user1.address);
        const balanceUser2 = await token.balanceOf(user2.address);
        const balanceUser3 = await token.balanceOf(user3.address);

        expect(adminBalance.eq(totalReceived));
        
        expect(balanceUser1.eq(ethers.utils.parseUnits("0", 6))).to.be.true;
        expect(balanceUser2.eq(ethers.utils.parseUnits("0", 6))).to.be.true;
        expect(balanceUser3.eq(ethers.utils.parseUnits("0", 6))).to.be.true;
    });
});
