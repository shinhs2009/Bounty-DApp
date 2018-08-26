const Ownable = artifacts.require("BountyHub");
const catchRevert = require("./exceptions.js").catchRevert;

contract("Ownable", function(accounts) {
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

    /*
    Check the owner of the Ownable contract to check who deployed contract.
    accounts[0] deployed the contract. So accounts[0] should be an owner.
    */
    it("Check Owner", async () => {
        const ownable = await Ownable.deployed();
        let expected = await ownable.owner()

        assert.equal(accounts[0], expected, "owner is wrong");
    });

    /*
    Check "onlyOwner" modifier works well.
    accounts[0] is owner of the Ownable contract.
    But for test, I send transaction from accounts[1];
    */
    it("onlyOwner Modifier", async() => {
        const ownable = await Ownable.deployed();
        
        await catchRevert(ownable.renounceOwnership({from: accounts[1]}));
    });
    
    /*
    Check transferOwnership function works well.
    Transfer ownership of contract to accounts[1].
    If the previous owner and new owner is different, it works well.
    */
    it("Transfer Ownership", async() => {
        const ownable = await Ownable.deployed();
        let owner = await ownable.owner();

        await ownable.transferOwnership(accounts[1]);
        let newOwner = await ownable.owner();

        assert.equal(accounts[1], newOwner, "transfer Ownership works well!");
        assert.equal(owner, newOwner, "If it fails, Transfer Ownership works well!");
    });

    /*
    Check transferOwnership require statement works well.
    Transfer ownership from accounts[1] because owner is chanaged by above test.
    require statement needs _newOwner is not a address(0).
    So if it reverted, it works well.
    */
    it("Transfer Ownership from address(0)", async() => {
        const ownable = await Ownable.deployed();
        let owner = await ownable.owner();

        await catchRevert(ownable.transferOwnership(ZERO_ADDRESS, {from: accounts[1]}));
    });

    /*
    Check renounceOwnership function works well.
    If it works, owner and ZERO_ADDRESS should be equal.
    */
    it("Renounce Ownership", async() => {
        const ownable = await Ownable.deployed();

        await ownable.renounceOwnership({from: accounts[1]});
        let owner = await ownable.owner();

        assert.equal(owner, ZERO_ADDRESS, "Renouncing failed");
    });
});