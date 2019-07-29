const Splitter = artifacts.require("Splitter");


const chai = require('chai');
const BN = require('bn.js');
const bnChai = require('bn-chai');
chai.use(bnChai(BN));
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');


contract("Splitter Error Test", async accounts => {
    let instance;
    let Alice;
    let Bob;
    let Carol;
    let upFrontCost = 134439500000000000;

    // Runs before all tests in this block.
    before(async () => {
        console.log('set up accounts before all tests');
        
        //Set up accounts for parties. In truffel owner = accounts[0]
        Alice = accounts[1]
        Bob = accounts[2]
        Carol = accounts[3]

       
        
    });

    beforeEach(async () => {
       console.log('create instance before each test case');
       instance = await Splitter.new();
       console.log("instance address",instance.address);


    });
    
    it('should only allow owner to authorize a sender', async () => {
        await truffleAssert.reverts(
            instance.authorizeSender(Alice, {from: accounts[4]}),
            "Ownable: caller is not the owner"
        );
        
    });

    it('should not allow party (Alice) to be authorized as sender more than once', async () => {
        await instance.authorizeSender(Alice);
        await truffleAssert.reverts(
            instance.authorizeSender(Alice),
            "This party is already authorized as a sender"
        );
        
    });

    it('should only allow owner to revoke sender authorizaiton', async () => {
        await truffleAssert.reverts(
            instance.revokeSenderAuthorization(Alice, {from: accounts[4]}),
            "Ownable: caller is not the owner"
        );
        
    });

    it('should not allow revocation of sender authorization before Alice has withdrawn her funds', async () => {
        await instance.authorizeSender(Alice);
        await instance.send(10000, {from: Alice});
        await truffleAssert.reverts(
            instance.revokeSenderAuthorization(Alice),
            "Funds must first be withdrawn"
        );
        
    });

    it('should only allow owner to authorize receivers', async () => {
        await truffleAssert.reverts(
            instance.authorizeReceiver(Bob, {from: accounts[4]}),
            "Ownable: caller is not the owner"
        );
        
    });

    it('should not allow a receiver to be authorized more than once', async () => {
        await instance.authorizeReceiver(Bob);
        await instance.authorizeReceiver(Carol);
        await truffleAssert.reverts(
            instance.authorizeReceiver(Carol),
            "This party is already authorized as a receiver"
        );
        
    });

    it('should only allow owner to revoke receiver authorization', async () => {
        await truffleAssert.reverts(
            instance.revokeReceiverAuthorization(Bob, {from: accounts[4]}),
            "Ownable: caller is not the owner"
        );
        
    });

    it('should not allow revocation of receiver authorization before Carol and Bob have withdrawn their funds', async () => {
        await instance.authorizeSender(Alice);
        await instance.authorizeReceiver(Carol);
        await instance.authorizeReceiver(Bob);
        await instance.send(10000, {from: Alice});
        await instance.split(5000, {from: Alice});
        await truffleAssert.reverts(
            instance.revokeReceiverAuthorization(Carol),
            "Funds must first be withdrawn"
        );

        await truffleAssert.reverts(
            instance.revokeReceiverAuthorization(Bob),
            "Funds must first be withdrawn"
        );
        
    });

    it('should not allow Alice to split her funds if her balance can cover it', async () => {
        await instance.authorizeSender(Alice);
        await instance.send(10000, {from: Alice});
        await truffleAssert.reverts(
            instance.split(200000, {from: Alice}),
            "Balance too low"
        ); 
        
    });

    it('should only allow a party not authorized as sender to split funds', async () => {
        await instance.authorizeReceiver(Carol);
        await truffleAssert.reverts(
            instance.split(10000, {from: Carol}),
            "Does not have sender role"
        ); 

        await truffleAssert.reverts(
            instance.split(10000, {from: accounts[4]}),
            "Does not have sender role"
        );
        
    });

    it('should only allow authorized sender to send funds to contract', async () => {
        await truffleAssert.reverts(
            instance.send(10000, {from: Carol}),
            "Not authorized to deposit funds"
        );
       
        
    });

    it('should not allow unathorized sender or receivers to  withdrawn funds', async () => {
        await truffleAssert.reverts(
            instance.withdrawFunds({from: Alice}),
            "Not authorized to withdraw funds"
        );

        await truffleAssert.reverts(
            instance.withdrawFunds({from: Bob}),
            "Not authorized to withdraw funds"
        );

        await truffleAssert.reverts(
            instance.withdrawFunds({from: Carol}),
            "Not authorized to withdraw funds"
        );
        
    });

    it('should not allow unathorized sender or receivers to get Balance', async () => {
        await truffleAssert.reverts(
            instance.getPartyBalance({from: Alice}),
            "Not authorized to get balance"
        );

        await truffleAssert.reverts(
            instance.getPartyBalance({from: Bob}),
            "Not authorized to get balance"
        );

        await truffleAssert.reverts(
            instance.getPartyBalance({from: Carol}),
            "Not authorized to get balance"
        );
        
    });

    it('should not allow a function to be carried out if the contract is paused', async () => {
        //checking the most important functions
        await instance.pause();
       
        await truffleAssert.reverts(
            instance.send(10000, {from: Alice}),
            "Pausable: paused"
        );
        await truffleAssert.reverts(
            instance.getPartyBalance({from: Alice}),
            "Pausable: paused"
        );

       
        await truffleAssert.reverts(
            instance.split(10000, {from: Alice}),
            "Pausable: paused"
        );

        await truffleAssert.reverts(
            instance.withdrawFunds({from: Alice}),
            "Pausable: paused"
        );
       
        
    });

   
});//end test contract