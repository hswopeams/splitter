const Splitter = artifacts.require("Splitter");
const chai = require('chai');
//const BN = require('bn.js');
const BN = web3.utils.BN;
const bnChai = require('bn-chai');
chai.use(bnChai(BN));
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');


contract("Splitter Happy Flow Test", async accounts => {
    let instance;
    let owner,alice,bob,carol,dan,ed,frank;
  
  
    // Runs before all tests in this block.
    before(async () => {
        console.log('set up parties before all tests');

        //Set up accounts for parties. In truffel owner = owner
        [owner,alice,bob,carol,dan,ed,frank] = accounts; 
    });

    //Run before each test case
    beforeEach(async () => {
        console.log('create instance before each test case');
        instance = await Splitter.new({from: owner});
        console.log("instance address",instance.address);
    });
    
  
   
   it('should have starting balance of 0', async () => {
        const contractBalance = await web3.eth.getBalance(instance.address);
        assert.equal(contractBalance, 0),"contract balance isn't 0";
    });

    it('should allow owner to pause and unpause the contract', async () => {
        const txObj = await instance.pause();
        let paused = await instance.paused();
        assert.isTrue(paused, 'the contract is paused');

        truffleAssert.eventEmitted(txObj.receipt, 'Paused', (ev) => {
            return ev.account == owner;
        });
       
        await instance.unpause({from: owner});
        paused = await instance.paused();
        assert.isFalse(paused, 'the contract is nnot paused');

        truffleAssert.eventEmitted(txObj.receipt, 'Paused', (ev) => {
            return ev.account == owner;
        });
    });


    it('should allow all parties to get their balances', async () => {
        const balanceAlice = await instance._balances(alice, {from: alice});
        assert.equal(balanceAlice, 0),"alice's contract balance isn't 0";

        const balanceBob = await instance._balances(bob, {from: bob});
        assert.equal(balanceBob, 0),"bob's contract balance isn't 0";

        const balanceCarol = await instance._balances(carol, {from: carol});
        assert.equal(balanceCarol, 0),"carol's contract balance isn't 0";
    });

    it('should allow a party to get another party\'s balance', async () => {
        const balanceAlice = await instance._balances(alice, {from: bob});
        assert.equal(balanceAlice, 0),"alice's contract balance isn't 0";
    });

    
    it('should allow alice to split even funds and all parties to get their balances', async () => {
        const startingBalanceAlice = await instance._balances(alice, {from: alice});
        const startingBalanceBob = await instance._balances(bob, {from: bob});
        const startingBalanceCarol = await instance._balances(carol, {from: carol});

        const expectedAlice = startingBalanceAlice;
        const expectedBob = startingBalanceBob.add(new BN(2500));
        const expectedCarol = startingBalanceCarol.add(new BN(2500));
    
        const txObj = await instance.split(bob, carol, {from: alice, value: 5000} );

        const newBalanceAlice = await instance._balances(alice, {from: alice});
        const newBalanceBob = await instance._balances(bob, {from: bob});
        const newBalanceCarol = await instance._balances(carol, {from: carol});
 
        expect(newBalanceAlice.eq(expectedAlice)).to.be.true;  
        expect(newBalanceBob.eq(expectedBob)).to.be.true;  
        expect(newBalanceCarol.eq(expectedCarol)).to.be.true;  

        truffleAssert.eventEmitted(txObj.receipt, 'FundsSplit', (ev) => {
            return ev.sender == alice && ev.receiver1 == bob && ev.receiver2 == carol && ev.amountReceived == 2500 && ev.remainingAmountToSender == 0;
        });  
    });

  
    it('should allow alice to split odd funds and all parties to get their balances', async () => {
        const startingBalanceAlice = await instance._balances(alice, {from: alice});
        const startingBalanceBob = await instance._balances(bob, {from: bob});
        const startingBalanceCarol = await instance._balances(carol, {from: carol});

       
        const expectedAlice = startingBalanceAlice.add(new BN(1));  //remainder will be 1
        const expectedBob = startingBalanceBob.add(new BN(2500)); 
        const expectedcCarol = startingBalanceCarol.add(new BN(2500)); 

    
        const txObj = await instance.split(bob, carol, {from: alice, value: 5001} );

        const newBalanceAlice = await instance._balances(alice, {from: alice});
        const newBalanceBob = await instance._balances(bob, {from: bob});
        const newBalanceCarol = await instance._balances(carol, {from: carol});

        
        expect(newBalanceAlice.eq(expectedAlice)).to.be.true;  
        expect(newBalanceBob.eq(expectedBob)).to.be.true;  
        expect(newBalanceCarol.eq(expectedcCarol)).to.be.true;  

        truffleAssert.eventEmitted(txObj.receipt, 'FundsSplit', (ev) => {
            return ev.sender == alice && ev.receiver1 == bob && ev.receiver2 == carol && ev.amountReceived == 2500 && ev.remainingAmountToSender == 1;
        });    
              
    });

    it('should allow other parties to split and receive funds and all parties to get their balances', async () => {
        const startingBalanceDan = await instance._balances(dan, {from: dan});
        const startingBalanceEd = await instance._balances(ed, {from: ed});
        const startingBalanceFrank = await instance._balances(frank, {from: frank});

       
        const expecteddDan = startingBalanceDan.add(new BN(1));  //remainder will be 1
        const expectedEd = startingBalanceEd.add(new BN(2500)); 
        const expectedFrank = startingBalanceFrank.add(new BN(2500)); 

        const txObj = await instance.split(ed, frank, {from: dan, value: 5001} );

        const newBalanceDan = await instance._balances(dan, {from: dan});
        const newBalanceEd = await instance._balances(ed, {from: ed});
        const newBalanceFrank = await instance._balances(frank, {from: frank});

  
        expect(newBalanceDan.eq(expecteddDan)).to.be.true;  
        expect(newBalanceEd.eq(expectedEd)).to.be.true;  
        expect(newBalanceFrank.eq(expectedFrank)).to.be.true;  

        truffleAssert.eventEmitted(txObj.receipt, 'FundsSplit', (ev) => {
            return ev.sender == dan && ev.receiver1 == ed && ev.receiver2 == frank && ev.amountReceived == 2500;
        });         
    });

   
    it('should allow alice to withdraw her funds', async () => {
        const expectedSplitterBalance = new BN(0);
       
        //add some funds to bob's splitter balance first
        await instance.split(bob, carol, {from: alice, value: 5001} );
        
        const startingAccountBalanceAlice = new BN(await web3.eth.getBalance(alice));
        const txObj = await instance.withdrawFunds({ from: alice });
        const withdrawGasPrice = (await web3.eth.getTransaction(txObj.tx)).gasPrice;
        const withdrawTxPrice = withdrawGasPrice * txObj.receipt.gasUsed;
        newAccountBalanceAlice = new BN(await web3.eth.getBalance(alice));

        //Alice's balance after calling withdrawFunds() = Alice's balance before calling withdrawFunds() plus amount withdrawn minus price of calling withdrawFunds()
        const expectedAccountBalance = startingAccountBalanceAlice.add(new BN(1)).sub(new BN(withdrawTxPrice));      
        expect(new BN(newAccountBalanceAlice).eq(new BN(expectedAccountBalance))).to.be.true; 

        const newSplitterBalanceAlice = await instance._balances(alice, {from: alice});
        expect(newSplitterBalanceAlice.eq(expectedSplitterBalance)).to.be.true; 
    });
    
    it('should allow bob to withdraw his funds', async () => {
        const expectedSplitterBalance = new BN(0);
       
        //add some funds to Bob's splitter balance first
        await instance.split(bob, carol, {from: alice, value: 5001} );
        
        const startingAccountBalanceBob = new BN(await web3.eth.getBalance(bob));
        const txObj = await instance.withdrawFunds({ from: bob });
        const withdrawGasPrice = (await web3.eth.getTransaction(txObj.tx)).gasPrice;
        const withdrawTxPrice = withdrawGasPrice * txObj.receipt.gasUsed;
        newAccountBalanceBob = new BN(await web3.eth.getBalance(bob));

        //Bob's balance after calling withdrawFunds() = Bob's balance before calling withdrawFunds() plus amount withdrawn minus price of calling withdrawFunds()
        const expectedAccountBalance = startingAccountBalanceBob.add(new BN(2500)).sub(new BN(withdrawTxPrice));       
        expect(new BN(newAccountBalanceBob).eq(new BN(expectedAccountBalance))).to.be.true; 

        const newSplitterBalanceBob = await instance._balances(bob, {from: bob});
        expect(newSplitterBalanceBob.eq(expectedSplitterBalance)).to.be.true; 
    });
    
});//end test contract