const Splitter = artifacts.require("Splitter");


const chai = require('chai');
const BN = require('bn.js');
const bnChai = require('bn-chai');
chai.use(bnChai(BN));
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');


contract("Splitter Error Test", async accounts => {
    let instance;
    let owner,alice,bob,carol,dan;
    let ZERO_ADDRESS;

    // Runs before all tests in this block.
    before("setting up test data", async () => {
        //Set up accounts for parties.
        [owner,alice,bob,carol,dan] = accounts; 
        ZERO_ADDRESS =  '0x0000000000000000000000000000000000000000';

        assert.isAtLeast(accounts.length,5);

    });

    beforeEach("deploying new instance", async () => {
       instance = await Splitter.new({ from: owner });
    });
   
    it('should revert when the fallback function is called', async () => {
        await truffleAssert.reverts(
            instance.sendTransaction({
                from: alice,
                to: instance
            }),
            "Falback function not available"
        );   
    });
    
    it('should not allow a function to be carried out if the contract is paused', async () => {
        await instance.pause({ from: owner });
      
        await truffleAssert.reverts(
            instance.split(bob, carol, { from: alice, value: 5000 } ),
            "Pausable: paused"
        );

        
        await truffleAssert.reverts(
            instance.withdrawFunds.sendTransaction({
                from: alice,
                to: instance
            }),
            "Pausable: paused"
        );  
        
    });

    it('should not allow a party without a contract balance to withdraw funds', async () => {
        //Make sure bob, carol, and alice have funds
        await instance.split(bob, carol, { from: alice, value: 5001}  );

        //someone else tries to withdraw funds
        await truffleAssert.reverts(
            instance.withdrawFunds.sendTransaction({
                from: dan,
                to: instance
            }),
            "No funds available for withdrawal"
        );    
    });

  

    it('should not allow funds to be sent to invalid receiver addresses', async () => {
        await truffleAssert.reverts(
            instance.split(ZERO_ADDRESS, ZERO_ADDRESS, { from: alice, value: 5001 } ),
            "Receiver is the zero address"
        ); 
    });

    
});//end test contract