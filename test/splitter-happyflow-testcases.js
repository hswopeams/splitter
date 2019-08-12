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

        Dan = accounts[4]
        Ed = accounts[5]
        Frank = accounts[6]
      
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


    it('should allow all parties to get their balances', async () => {
        let balanceAlice = await instance._balances(Alice, {from: Alice});
        assert.equal(balanceAlice, 0),"Alice's contract balance isn't 0";

        let balanceBob = await instance._balances(Bob, {from: Bob});
        assert.equal(balanceAlice, 0),"Bob's contract balance isn't 0";

        let balanceCarol = await instance._balances(Carol, {from: Carol});
        assert.equal(balanceCarol, 0),"Carol's contract balance isn't 0";
    });

    
    it('should allow Alice to split even funds and all parties to get their balances', async () => {
        let startingBalanceAlice = await instance._balances(Alice, {from: Alice});
        let startingBalanceBob = await instance._balances(Bob, {from: Bob});
        let startingBalanceCarol = await instance._balances(Carol, {from: Carol});

        let expectedAlice = startingBalanceAlice;
        let expectedBob = startingBalanceBob.add(new BN(2500));
        let expectedCarol = startingBalanceCarol.add(new BN(2500));
    
        await instance.split(Bob, Carol, {from: Alice, value: 5000} );

        let newBalanceAlice = await instance._balances(Alice, {from: Alice});
        let newBalanceBob = await instance._balances(Bob, {from: Bob});
        let newBalanceCarol = await instance._balances(Carol, {from: Carol});
 
        expect(newBalanceAlice.eq(expectedAlice)).to.be.true;  
        expect(newBalanceBob.eq(expectedBob)).to.be.true;  
        expect(newBalanceCarol.eq(newBalanceCarol)).to.be.true;  

        let events = await instance.getPastEvents("FundsSplit");
        assert.equal(events[0].event, "FundsSplit");
        assert.equal(events[0].returnValues.sender, Alice);
        assert.equal(events[0].returnValues.receiver1, Bob);
        assert.equal(events[0].returnValues.receiver2, Carol);
        assert.equal(events[0].returnValues.amountReceived, 2500);
              
    });

  
    it('should allow Alice to split odd funds and all parties to get their balances', async () => {
        let startingBalanceAlice = await instance._balances(Alice, {from: Alice});
        let startingBalanceBob = await instance._balances(Bob, {from: Bob});
        let startingBalanceCarol = await instance._balances(Carol, {from: Carol});

       
        let expectedAlice = startingBalanceAlice.add(new BN(5001%2));  //remainder will be 1
        let expectedBob = startingBalanceBob.add(new BN(2500)); 
        let expectedCarol = startingBalanceCarol.add(new BN(2500)); 

    
        await instance.split(Bob, Carol, {from: Alice, value: 5001} );

        let newBalanceAlice = await instance._balances(Alice, {from: Alice});
        let newBalanceBob = await instance._balances(Bob, {from: Bob});
        let newBalanceCarol = await instance._balances(Carol, {from: Carol});

        
        expect(newBalanceAlice.eq(expectedAlice)).to.be.true;  
        expect(newBalanceBob.eq(expectedBob)).to.be.true;  
        expect(newBalanceCarol.eq(newBalanceCarol)).to.be.true;  

        let events = await instance.getPastEvents("FundsSplit");
        assert.equal(events[0].event, "FundsSplit");
        assert.equal(events[0].returnValues.sender, Alice);
        assert.equal(events[0].returnValues.receiver1, Bob);
        assert.equal(events[0].returnValues.receiver2, Carol);
        assert.equal(events[0].returnValues.amountReceived, 2500);
              
    });

    it('should allow other parties to split and receive funds and all parties to get their balances', async () => {
        let startingBalanceDan = await instance._balances(Dan, {from: Dan});
        let startingBalanceEd = await instance._balances(Ed, {from: Ed});
        let startingBalanceFrank = await instance._balances(Frank, {from: Frank});

       
        let expecteddDan = startingBalanceDan.add(new BN(5001%2));  //remainder will be 1
        let expectedEd = startingBalanceDan.add(new BN(2500)); 
        let expectedFrank = startingBalanceFrank.add(new BN(2500)); 

        await instance.split(Ed, Frank, {from: Dan, value: 5001} );

        let newBalanceDan = await instance._balances(Dan, {from: Dan});
        let newBalanceEd = await instance._balances(Ed, {from: Ed});
        let newBalanceFrank = await instance._balances(Frank, {from: Frank});

  
        expect(newBalanceDan.eq(expecteddDan)).to.be.true;  
        expect(newBalanceEd.eq(newBalanceEd)).to.be.true;  
        expect(expectedFrank.eq(newBalanceFrank)).to.be.true;  

        let events = await instance.getPastEvents("FundsSplit");
        assert.equal(events[0].event, "FundsSplit");
        assert.equal(events[0].returnValues.sender, Dan);
        assert.equal(events[0].returnValues.receiver1, Ed);
        assert.equal(events[0].returnValues.receiver2, Frank);
        assert.equal(events[0].returnValues.amountReceived, 2500);
              
    });

   
    it('should allow Alice to withdraw her funds', async () => {
        let withdrawGasPrice;
        let withdrawTxPrice;
        let withdrawTxReceipt;
        
        let expectedSplitterBalance = new BN(0);
       
        //add some funds to Alice's splitter balance first
        await instance.split(Bob, Carol, {from: Alice, value: 5001} );
        
        let startingAccountBalanceAlice = await web3.eth.getBalance(Alice);

        // using promise events
        instance.withdrawFunds.sendTransaction({
            from: Alice,
            to: instance
        })
        .on('transactionHash', function(hash){
          
            return web3.eth.getTransaction(hash)
            .then(transaction => transaction.gasPrice)
            .then(txGasPrice => {
                withdrawGasPrice = txGasPrice;
            });
           
        })
        .on('receipt', function(receipt){
            withdrawTxReceipt = receipt;

            truffleAssert.eventEmitted(withdrawTxReceipt, 'FundsWithdrawn', (ev) => {
                return ev.party == Alice && ev.balanceWithdrawn == 1 && ev.newBalance == 0;
            });
        })
        .then( async () => {
            withdrawTxPrice = withdrawGasPrice * withdrawTxReceipt.gasUsed;

            let newSplitterBalanceAlice = await instance._balances(Alice, {from: Alice});
            expect(newSplitterBalanceAlice.eq(expectedSplitterBalance)).to.be.true; 

           
            let newAccountBalanceAlice;
            return web3.eth.getBalance(Alice)
            .then( balance => {

                startingAccountBalanceAlice = web3.utils.toBN(startingAccountBalanceAlice);
                newAccountBalanceAlice = web3.utils.toBN(balance);
                withdrawTxPrice = web3.utils.toBN(withdrawTxPrice);
                let expectedAccountBalance;    
    
                //Alice balance after calling withdrawFunds() = Alice balance before calling withdrawFunds() plus amount withdrawn minus price of calling withdrawFunds()
                expectedAccountBalance = startingAccountBalanceAlice.add(web3.utils.toBN(1)).sub(withdrawTxPrice);
                expect(new BN(newAccountBalanceAlice).eq(new BN(expectedAccountBalance))).to.be.true; 
            });

        }); 
    });
    
    it('should allow Bob to withdraw his funds', async () => {
        let withdrawGasPrice;
        let withdrawTxPrice;
        let withdrawTxReceipt;
        
        let expectedSplitterBalance = new BN(0);
       
        //add some funds to Bob's splitter balance first
        await instance.split(Bob, Carol, {from: Alice, value: 5001} );
        
        let startingAccountBalanceBob = await web3.eth.getBalance(Bob);
        
        // using promise events
        instance.withdrawFunds.sendTransaction({
            from: Bob,
            to: instance
        })
        .on('transactionHash', function(hash){
            return web3.eth.getTransaction(hash)
            .then(transaction => transaction.gasPrice)
            .then(txGasPrice => {
                withdrawGasPrice = txGasPrice;
            });
           
        })
        .on('receipt', function(receipt){
            withdrawTxReceipt = receipt;
           
            truffleAssert.eventEmitted(withdrawTxReceipt, 'FundsWithdrawn', (ev) => {
                return ev.party == Bob && ev.balanceWithdrawn == 2500 && ev.newBalance == 0;
            });
        })
        .then( async () => {
            withdrawTxPrice = withdrawGasPrice * withdrawTxReceipt.gasUsed;

            let newSplitterBalanceBob = await instance._balances(Bob, {from: Bob});
            expect(newSplitterBalanceBob.eq(expectedSplitterBalance)).to.be.true; 

           
            let newAccountBalanceBob;
            return web3.eth.getBalance(Bob)
            .then( balance => {

                startingAccountBalanceBob = web3.utils.toBN(startingAccountBalanceBob);
                newAccountBalanceBob = web3.utils.toBN(balance);
                withdrawTxPrice = web3.utils.toBN(withdrawTxPrice);

                let expectedAccountBalance;    
    
                //Bob balance after calling withdrawFunds() = Bob balance before calling withdrawFunds() plus amount withdrawn minus price of calling withdrawFunds()
                expectedAccountBalance = startingAccountBalanceBob.add(web3.utils.toBN(2500)).sub(withdrawTxPrice);
               
                expect(new BN(newAccountBalanceBob).eq(new BN(expectedAccountBalance))).to.be.true; 
            });

        }); 
    });
 

});//end test contract