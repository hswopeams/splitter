const Splitter = artifacts.require("Splitter");
const chai = require('chai');
const BN = require('bn.js');
const bnChai = require('bn-chai');
chai.use(bnChai(BN));
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');


contract("Splitter Happy Flow Test", async accounts => {
    let instance;
    let Alice;
    let Bob;
    let Carol;
  

  
    // Runs before all tests in this block.
    before(async () => {
        console.log('set up parties before all tests');
        
        //Set up accounts for parties. In truffel owner = accounts[0]
        Alice = accounts[1]
        Bob = accounts[2]
        Carol = accounts[3]
      
    });

    //Run before each test case
    beforeEach(async () => {
        console.log('create instance before each test case');
        instance = await Splitter.new();
        console.log("instance address",instance.address);
    });
    
   
   
   it('should have starting balance of 0', async () => {
        let contractBalance = await web3.eth.getBalance(instance.address);
        assert.equal(contractBalance, 0),"contract balance isn't 0";
    });

    it('should have balance of 10000 wei after deposit and Alice should have 10000 balance', async () => {
        let balance_wei = await web3.eth.getBalance(instance.address);
        assert.equal(balance_wei.valueOf(), 0, "contract balance isn't 0");

        const expected = new BN(10000);

        await instance.authorizeSender(Alice);
        await instance.send(10000, {from: Alice});
        let newContractBalance = await web3.eth.getBalance(instance.address); 
        let balanceAlice = await instance.getPartyBalance({from: Alice});

        expect(new BN(newContractBalance).eq(expected)).to.be.true;  
        expect(new BN(balanceAlice).eq(expected)).to.be.true;        
       
        let event = await instance.getPastEvents("DepositReceived");
        assert.equal(event.length,1);
        assert.equal(event[0].event, "DepositReceived");
        assert.equal(event[0].returnValues.depositor, Alice);
    });
 

    it('should allow owner to authorize Alice as sender', async () => {
        await instance.authorizeSender(Alice);
        let event = await instance.getPastEvents("SenderAuthorized");
        assert.equal(event.length,1);
        assert.equal(event[0].event, "SenderAuthorized");
        assert.equal(event[0].returnValues.sender, Alice);
        
    });

    it('should allow owner to revoke sender authorization from Alice', async () => {
        await instance.authorizeSender(Alice);
        await instance.send(10000, {from: Alice});
        await instance.withdrawFunds({from: Alice});
        await instance.revokeSenderAuthorization(Alice);
        let event = await instance.getPastEvents("SenderAuthoriizationRevoked");
        assert.equal(event.length,1);
        assert.equal(event[0].event, "SenderAuthoriizationRevoked");
        assert.equal(event[0].returnValues.sender, Alice);
        
    });
    
    it('should allow owner to re-authorize Alice as sender after revoking her sender authorization', async () => {
        await instance.authorizeSender(Alice);
        await instance.revokeSenderAuthorization(Alice);
        await instance.authorizeSender(Alice);
        let event = await instance.getPastEvents("SenderAuthorized");
        assert.equal(event.length,1);
        assert.equal(event[0].event, "SenderAuthorized");
        assert.equal(event[0].returnValues.sender, Alice);
    });

    it('should allow owner to authorize Bob and Carol as receivers', async () => {
        await instance.authorizeReceiver(Bob);
     
        let event = await instance.getPastEvents("ReceiverAuthorized");
        assert.equal(event.length,1);
        assert.equal(event[0].event, "ReceiverAuthorized");
        assert.equal(event[0].returnValues.receiver, Bob);
    

        await instance.authorizeReceiver(Carol);
        event2 = await instance.getPastEvents("ReceiverAuthorized");
        assert.equal(event2.length,1);
        assert.equal(event2[0].event, "ReceiverAuthorized");
        assert.equal(event2[0].returnValues.receiver, Carol);
       
        
    });
    
    it('should allow owner to revoke receiver authorization from Bob and Carol', async () => {
        await instance.authorizeSender(Alice);
        await instance.authorizeReceiver(Bob);
        await instance.authorizeReceiver(Carol);
        await instance.send(10000, {from: Alice});
        await instance.split(5000, {from: Alice});
        await instance.withdrawFunds({from: Bob});
        await instance.withdrawFunds({from: Carol});

        await instance.revokeReceiverAuthorization(Bob);

        let event = await instance.getPastEvents("ReceiverAuthorizizationRevoked");
        assert.equal(event.length,1);
        assert.equal(event[0].event, "ReceiverAuthorizizationRevoked");
        assert.equal(event[0].returnValues.receiver, Bob);
       
        
        await instance.revokeReceiverAuthorization(Carol);
        let event2 = await instance.getPastEvents("ReceiverAuthorizizationRevoked");
        assert.equal(event2.length,1);
        assert.equal(event2[0].event, "ReceiverAuthorizizationRevoked");
        assert.equal(event2[0].returnValues.receiver, Carol);
        
        
    });

 
    it('should allow owner to re-authorize Bob and Carol after receiver authorization has been revoked', async () => {
        await instance.authorizeReceiver(Bob);
        await instance.authorizeReceiver(Carol);
        await instance.revokeReceiverAuthorization(Bob);
        await instance.revokeReceiverAuthorization(Carol);

        await instance.authorizeReceiver(Bob);
        let event = await instance.getPastEvents("ReceiverAuthorized");
      
        assert.equal(event.length,1);
        assert.equal(event[0].event, "ReceiverAuthorized");
        assert.equal(event[0].returnValues.receiver, Bob);
   
        await instance.authorizeReceiver(Carol);
        let event2 = await instance.getPastEvents("ReceiverAuthorized");
        assert.equal(event2.length,1);
        assert.equal(event2[0].event, "ReceiverAuthorized");
        assert.equal(event2[0].returnValues.receiver, Carol);  
    });
  
    


    it('should allow Alice to split her funds and all parties to get their balances', async () => {
        await instance.authorizeSender(Alice);
        await instance.authorizeReceiver(Bob);
        await instance.authorizeReceiver(Carol);
        await instance.send(10000, {from: Alice});

      
        let startingBalanceAlice = await instance.getPartyBalance({from: Alice});
        let startingBalanceBob = await instance.getPartyBalance({from: Bob});
        let startingBalanceCarol = await instance.getPartyBalance({from: Carol}); 
      
       
        let expectedAlice = startingBalanceAlice.sub(new BN(5000));
        let expectedBob = startingBalanceBob.add(new BN(2500));
        let expectedCarol = startingBalanceCarol.add(new BN(2500));
    
        await instance.split(5000, {from: Alice});

        let newBalanceAlice = await instance.getPartyBalance({from: Alice});
        let newBalanceBob = await instance.getPartyBalance({from: Bob});
        let newBalanceCarol = await instance.getPartyBalance({from: Carol});
        
        expect(newBalanceAlice.eq(expectedAlice)).to.be.true;  
        expect(newBalanceBob.eq(expectedBob)).to.be.true;  
        expect(newBalanceCarol.eq(newBalanceCarol)).to.be.true;  

        let events = await instance.getPastEvents("FundsSplit");
        
        assert.equal(events.length,2);
        assert.equal(events[0].event, "FundsSplit");
        assert.equal(events[0].returnValues.sender, Alice);
        assert.equal(events[0].returnValues.receiver, Bob);
        assert.equal(events[0].returnValues.amountSplit, 5000);
        assert.equal(events[0].returnValues.amountReceived, 2500);

        assert.equal(events[1].event, "FundsSplit");
        assert.equal(events[1].returnValues.sender, Alice);
        assert.equal(events[1].returnValues.receiver, Carol);
        assert.equal(events[1].returnValues.amountSplit, 5000);
        assert.equal(events[1].returnValues.amountReceived, 2500);
              
    });

   
    
    it('should allow Alice, Bob, and Carol to withdraw their funds', async () => {
        let contractBalance = await web3.eth.getBalance(instance.address);

        await instance.authorizeSender(Alice);
        await instance.authorizeReceiver(Bob);
        await instance.authorizeReceiver(Carol);
        await instance.send(10000, {from: Alice});

        let newContractBalance = await web3.eth.getBalance(instance.address);
        let startingBalanceAlice = await instance.getPartyBalance({from: Alice});
        let startingBalanceBob = await instance.getPartyBalance({from: Bob});
        let startingBalanceCarol = await instance.getPartyBalance({from: Carol}); 
      
        await instance.split(5000, {from: Alice});

        let expected = new BN(0);

        await instance.withdrawFunds({from: Alice});
        let event = await instance.getPastEvents("FundsWithdrawn");
        assert.equal(event.length,1);
        assert.equal(event[0].event, "FundsWithdrawn");
        assert.equal(event[0].returnValues.party, Alice);
        assert.equal(event[0].returnValues.balanceWithdrawn, 5000);
        assert.equal(event[0].returnValues.newBalance, 0);

        await instance.withdrawFunds({from: Bob});
        event = await instance.getPastEvents("FundsWithdrawn");
        assert.equal(event.length,1);
        assert.equal(event[0].event, "FundsWithdrawn");
        assert.equal(event[0].returnValues.party, Bob);
        assert.equal(event[0].returnValues.balanceWithdrawn, 2500);
        assert.equal(event[0].returnValues.newBalance, 0);

        await instance.withdrawFunds({from: Carol});
        event = await instance.getPastEvents("FundsWithdrawn");
        assert.equal(event.length,1);
        assert.equal(event[0].event, "FundsWithdrawn");
        assert.equal(event[0].returnValues.party, Carol);
        assert.equal(event[0].returnValues.balanceWithdrawn, 2500);
        assert.equal(event[0].returnValues.newBalance, 0);
      
        let newBalanceAlice = await instance.getPartyBalance({from: Alice});
        let newBalanceBob = await instance.getPartyBalance({from: Bob});
        let newBalanceCarol = await instance.getPartyBalance({from: Carol});  
      
        expect(newBalanceAlice.eq(expected)).to.be.true;  
        expect(newBalanceBob.eq(expected)).to.be.true;  
        expect(newBalanceCarol.eq(expected)).to.be.true;  
    });

    it('should allow owner to pause and unpause the contract', async () => {
        await instance.pause();
        let paused = await instance.paused();
        assert.isTrue(paused, 'the contract is paused');

        let event = await instance.getPastEvents("Paused");
        assert.equal(event.length,1);
        assert.equal(event[0].event, "Paused");
        assert.equal(event[0].returnValues.account, accounts[0]);

        await instance.unpause();
        paused = await instance.paused();
        assert.isFalse(paused, 'the contract is nnot paused');

        event = await instance.getPastEvents("Unpaused");
        assert.equal(event.length,1);
        assert.equal(event[0].event, "Unpaused");
        assert.equal(event[0].returnValues.account, accounts[0]);

    });
 

});//end test contract