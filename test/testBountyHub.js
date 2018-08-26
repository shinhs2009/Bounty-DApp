const BountyHub = artifacts.require("BountyHub");
const catchRevert = require("./exceptions.js").catchRevert;

contract("BountyHub", function(accounts) {
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

    /*
    Check the state variables of Bounty Contract.
    And Test getAllBountyAddress function and getBountyInfo function.
    First, Create the Bounty.
    Second, And get bounty address from bounty address array(It'll be in first element).
    Third, Get Bounty Information.
    */
    it("Create Bounty", async () => {
        const bountyHub = await BountyHub.deployed();

        await bountyHub.createBounty("Cutting Grass", "Cutting Grass and Clean up my yard", 10);
        await bountyHub.createBounty("Cooking Meal", "Make my morning meal", 20);

        let bountyAddress;
        await bountyHub.getAllBountyAddress().then(function(result) {
            bountyAddress = result[0];
        });

        let bountyOwner;
        let title;
        let description;
        let reward;
        let status;
        await bountyHub.getBountyInfo(bountyAddress).then(function(result) {
            bountyOwner = result[0];
            title = result[1];
            description = result[2];
            reward = result[3];
            status = result[4];
        });

        assert.equal(bountyOwner, accounts[0], "Bounty Owner mismatch");
        assert.equal(title, "Cutting Grass", "Title mismatch");
        assert.equal(description, "Cutting Grass and Clean up my yard", "Description mismatch");
        assert.equal(reward, 10, "Reward mismatch");
        assert.equal(status, 0, "Title mismatch");
    });

    /*
    Test "Get Bounty Address By Owner" function.
    First, Get Bounties that owned by accounts[0].
    Second, Get bountyOwner address and check if it matches to accounts[0].
    */
    it("Test getBountyAddressByOwner function", async() => {
        const bountyHub = await BountyHub.deployed();
        await bountyHub.getBountyAddressByOwner(accounts[0]).then(function(result) {
            for(i=0; i<result.length; i++) {
                bountyHub.getBountyInfo(result[i]).then(function(result) {
                    var bountyOwner = result[0];
                    assert.equal(bountyOwner, accounts[0], "BountyOwner mistmatch");
                });
            }
        });
    });

    /*
    Test "Finish Bounty" function.
    I have created 2 bounties. And created bounty's Owner is accounts[0].
    Only Owner can change state to Finish.
    */
    it("Test Finish Bounty Test", async () => {
        const bountyHub = await BountyHub.deployed();

        let bountyAddress1;
        let bountyAddress2;
        await bountyHub.getBountyAddressByOwner(accounts[0]).then(function(result) {
            bountyAddress1 = result[0];
            bountyAddress2 = result[1];
        });

        await bountyHub.finishBounty(bountyAddress1);

        await bountyHub.getBountyInfo(bountyAddress1).then(function(result) {
            assert.equal(result[4], 1, "Finish Bounty Function not working");
        })

        await catchRevert(bountyHub.finishBounty(bountyAddress2, {from: accounts[1]}));

        await bountyHub.getBountyInfo(bountyAddress2, {from: accounts[1]}).then(function(result) {
            assert.equal(result[4].toNumber(), 1, "It works well! Finish Bounty on other accounts should have not work");
        })
    });

    /*
    Test "Add Work", "Get Work" function.
    First, Bounty Owner can't submit work.
    Second, Bounty State have to be Posted.
    Third, Check the struct variables
    */
    it("Check submit and read Work", async () => {
        const bountyHub = await BountyHub.deployed();

        let bountyAddress1;
        let bountyAddress2;
        await bountyHub.getBountyAddressByOwner(accounts[0]).then(function(result) {
            bountyAddress1 = result[0];
            bountyAddress2 = result[1];
        });

        // Test Finished state
        await catchRevert(bountyHub.submitWork(bountyAddress1, "check my work please!", {from: accounts[1]}));

        await bountyHub.getParticipationStatus(bountyAddress1).then(function(result) {
            assert.equal(result, false, "It is submitted in Finished state");
        });

        // Test owner submit
        await catchRevert(bountyHub.submitWork(bountyAddress2, "check my work please!"));

        await bountyHub.getParticipationStatus(bountyAddress2).then(function(result) {
            assert.equal(result, false, "It is submitted by owner");
        });

        // Test submit work
        await bountyHub.submitWork(bountyAddress2, "check my work for bounty2", {from: accounts[1]});

        await bountyHub.getParticipationStatus(bountyAddress2, {from: accounts[1]}).then(function(result) {
            assert.equal(result, true, "It is not submitted");
        });

        await bountyHub.getWork(bountyAddress2, accounts[1]).then(function(result) {
            assert.equal(result[0], "check my work for bounty2", "comments is wrong");
            assert.equal(result[1], false, "accept state is wrong");
        });
    });

    /*
    Test Get All Hunter Address function
    accounts[1] submitted work on bounty number 2 by accounts[0]
    I'll check this
    */
    it("Test Get All Hunter", async () => {
        const bountyHub = await BountyHub.deployed();

        let bountyAddress;
        await bountyHub.getBountyAddressByOwner(accounts[0]).then(function(result) {
            bountyAddress = result[1];
        });

        await bountyHub.getHunterAddress(bountyAddress).then(function(result) {
            assert.equal(result[0], accounts[1], "getAllHunter functions works wrong");
        });
    });

    /*
    Test Review Work function

    */
    it("Test Review Work", async() => {
        const bountyHub = await BountyHub.deployed();

        let bountyAddress;
        await bountyHub.getBountyAddressByOwner(accounts[0]).then(function(result) {
            bountyAddress = result[1];
        });

        await bountyHub.reviewWork(bountyAddress, accounts[1]);

        await bountyHub.getWork(bountyAddress, accounts[1]).then(function(result) {
            assert.equal(result[1], true, "Review Work function works wrong");
        });
    });

    /*
    Test BountyHub stop Contract(Circuit Breaker Design Pattern).
    First, Get bountyAddress to test other function.
    Second, Run stopBountyHub function(Circuit Breaker).
    Third, if getBountyInfo function is reverted, Test is success.
    */
    it("Stop Contract(Circuit Breaker test)", async () => {
        const bountyHub = await BountyHub.deployed();

        let bountyAddress;
        await bountyHub.getAllBountyAddress().then(function(result) {
            bountyAddress = result[0];
        });

        await bountyHub.stopBountyHub();

        let bountyOwner;
        await catchRevert(bountyHub.getBountyInfo(bountyAddress).then(function(result) {
            bountyOwner = result[0];
        }));

        assert.equal(bountyOwner, accounts[0], "If it makes error, Circuit Breaker works well");

    });

    /*
    Test BountyHub restart Contract(Circuit Breaker Design Pattern).
    For Test, restart BountyHub.
    And Test two funtions and get bounty owner address.
    */
    it("Restart Contract(Circuit Breaker test)", async() => {
        const bountyHub = await BountyHub.deployed();

        await bountyHub.restartBountyHub();

        let bountyAddress;
        await bountyHub.getAllBountyAddress().then(function(result) {
            bountyAddress = result[0];
        });

        let bountyOwner;
        await bountyHub.getBountyInfo(bountyAddress).then(function(result) {
            bountyOwner = result[0];
        });

        assert.equal(bountyOwner, accounts[0], "Circuit Breaker not work");
    });

    /*
    */
    it("Test transfer money to accpeted work owners", async () => {
        const bountyHub = await BountyHub.deployed();
        let previousBalance = web3.eth.getBalance(accounts[1]);
        
        let bountyAddress;
        await bountyHub.getAllBountyAddress().then(function(result) {
            bountyAddress = result[1];
        });

        let reward;
        await bountyHub.getBountyInfo(bountyAddress).then(function(result) {
            reward = result[3];
        });
        
        await bountyHub.getAcceptedHunter(bountyAddress).then(function(result) {
            for(var i=0; i<result.length; i++) {
                bountyHub.payBounty(bountyAddress, result[i], {value : reward * 1000000000000000000});
            }
        });

        await bountyHub.finishBounty(bountyAddress);

        //await bountyHub.testTransfer(accounts[1], {value : 1000000000000000000});
        let currentBalance = web3.eth.getBalance(accounts[1]);

        var expected = previousBalance.toNumber() + (reward * 1000000000000000000);

        assert.equal(currentBalance.toNumber(), expected, "balance mismatch");
    });
});