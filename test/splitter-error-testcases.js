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
    let ZERO_ADDRESS;

    // Runs before all tests in this block.
    before(async () => {
        console.log('set up accounts before all tests');
        
        //Set up accounts for parties. In truffel owner = accounts[0]
        Alice = accounts[1]
        Bob = accounts[2]
        Carol = accounts[3]  
        Dan = accounts[4]

        ZERO_ADDRESS =  '0x0000000000000000000000000000000000000000';

    });

    beforeEach(async () => {
       console.log('create instance before each test case');
       instance = await Splitter.new();
       console.log("instance address",instance.address);


    });
   
    it('should revert when the fallback function is called', async () => {
        await truffleAssert.reverts(
            instance.sendTransaction({
                from: Alice,
                to: instance
            }),
            "Falback function not available"
        );
       
        
    });
    
    it('should not allow a function to be carried out if the contract is paused', async () => {
        await instance.pause();
      
        await truffleAssert.reverts(
            instance.split(Bob, Carol, {from: Alice, value: 5000} ),
            "Pausable: paused"
        );

        
        await truffleAssert.reverts(
            instance.withdrawFunds.sendTransaction({
                from: Alice,
                to: instance
            }),
            "Pausable: paused"
        );
       
        
    });

    it('should not allow a party without a contract balance to withdraw funds', async () => {
        //Make sure Bob, Carol, and Alice have funds
        await instance.split(Bob, Carol, {from: Alice, value: 5001} );

        //someone else tries to withdraw funds
        await truffleAssert.reverts(
            instance.withdrawFunds.sendTransaction({
                from: Dan,
                to: instance
            }),
            "No funds available for withdrawal"
        );
       
        
    });

  

    it('should not allow funds to be sent to invalid receiver addresses', async () => {
        
        
        await truffleAssert.reverts(
            instance.split(ZERO_ADDRESS, ZERO_ADDRESS, {from: Alice, value: 5001} ),
            "Receiver is the zero address"
        );
       
       
    });

    
});//end test contract