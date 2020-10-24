// Import the page's CSS. Webpack will know what to do with it.
import "../styles/app.css";

const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");
const $ = require("jquery");
// Not to forget our built contract
const splitter = require("../../build/contracts/Splitter.json");
require("file-loader?name=../index.html!../index.html");

// Supports Metamask, and other wallets that provide / inject 'ethereum' or 'web3'.
if (typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined') {
    // Use the Mist/wallet/Metamask provider.
    window.web3 = new Web3(window.ethereum || window.web3.currentProvider);
} else {
    // Your preferred fallback.
   window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
}

const Splitter = truffleContract(splitter);
Splitter.setProvider(web3.currentProvider);


let alice;
let bill;
let carol;


window.addEventListener('load', async function() {
    try {
        const accounts = await (/*window.ethereum ?
            window.enable() ||*/
            web3.eth.getAccounts());
        if (accounts.length == 0) {
            throw new Error("No account with which to transact");
        }
      
        const network = await web3.eth.net.getId();
        const deployed = await Splitter.deployed();

        //Set up Alice
        alice = accounts[1];
        let balanceAlice = await deployed.balances(alice, { from: alice });
        $("#balanceAlice").html(balanceAlice.toString(10));
        $("#addressAlice").html(alice);

        //Set up Bill
        bill = accounts[2];
        let balanceBill = await deployed.balances(bill, { from: bill });
        $("#balanceBill").html(balanceBill.toString(10));
        $("#addressBill").html(bill);

        //Set up Carol
        carol = accounts[3];
        let balanceCarol = await deployed.balances(carol, { from: carol });
        $("#balanceCarol").html(balanceCarol.toString(10));
        $("#addressCarol").html(carol);
        

        //Show Contract balance
        let balanceContract = await window.web3.eth.getBalance(deployed.address);
        $("#balanceContract").html(balanceContract.toString(10));
       
        // We wire it when the system looks in order.
        $("#split").click(split);
        $("#withdraw").click(withdrawFunds);
       
    } catch(err) {
        // Never let an error go unlogged.
        console.error(err);
    }
});

const split = async function() {
    // Sometimes you have to force the gas amount to a value you know is enough because
    // `web3.eth.estimateGas` may get it wrong.
   
    const gas = 300000;
    try {
        const accounts = await (/*window.ethereum ?
            window.enable() ||*/
            web3.eth.getAccounts());
        if (accounts.length == 0) {
            $("#balance").html("N/A");
            throw new Error("No account with which to transact");
        }

        const deployed = await Splitter.deployed();

        // We simulate the real call and see whether this is likely to work.
        // No point in wasting gas if we have a likely failure.
        const success = await deployed.split.call(
            bill,
            carol,
            // Giving a string is fine
            { from: alice, value: $("input[name='amount']").val(), gas: gas });

        if (!success) {
            throw new Error("The transaction will fail anyway, not sending");
        }

        // Ok, we move onto the proper action.
        const txObj = await deployed.split(
            bill,
            carol,
            // Giving a string is fine
            { from: alice, value: $("input[name='amount']").val(), gas: gas })
            //split takes time in real life, so we get the txHash immediately while it 
            // is mined.
            .on(
                "transactionHash",
                txHash => $("#status").html("Transaction on the way " + txHash)
            );
        // Now we got the mined tx.
        const receipt = txObj.receipt;
        
        if (!receipt.status) {
            console.error("Wrong status");
            console.error(receipt);
            $("#status").html("There was an error in the tx execution, status not 1");
        } else if (receipt.logs.length == 0) {
            console.error("Empty logs");
            console.error(receipt);
            $("#status").html("There was an error in the tx execution, missing expected event");
        } else {
            console.log(receipt.logs[0]);
            $("#status").html("Transfer executed");
        }
        // Make sure we update the UI.
        let balanceAlice = await deployed.balances(alice, { from: alice });
        $("#balanceAlice").html(balanceAlice.toString(10));

        let balanceBill = await deployed.balances(bill, { from: bill });
        $("#balanceBill").html(balanceBill.toString(10));

        let balanceCarol = await deployed.balances(carol, { from: carol });
        $("#balanceCarol").html(balanceCarol.toString(10));

        let balanceContract = await window.web3.eth.getBalance(deployed.address);
        $("#balanceContract").html(balanceContract.toString(10));
       
    } catch(err) {
        $("#status").html(err.toString());
        console.error(err);
    }
};

const withdrawFunds = async function() {
    // Sometimes you have to force the gas amount to a value you know is enough because
    // `web3.eth.estimateGas` may get it wrong.
    
    const gas = 300000;
    try {
        const accounts = await (/*window.ethereum ?
            window.enable() ||*/
            web3.eth.getAccounts());
        if (accounts.length == 0) {
            $("#balance").html("N/A");
            throw new Error("No account with which to transact");
        }

        const deployed = await Splitter.deployed();

        // We simulate the real call and see whether this is likely to work.
        // No point in wasting gas if we have a likely failure.
        const success = await deployed.withdrawFunds.call(
            // Giving a string is fine
            { from: $("input[name='account']").val(), gas: gas });

        if (!success) {
            throw new Error("The transaction will fail anyway, not sending");
        }

        // Ok, we move onto the proper action.
        const txObj = await deployed.withdrawFunds(
            { from: $("input[name='account']").val(), gas: gas })
            // withdrawFunds takes time in real life, so we get the txHash immediately while it 
            // is mined.
            .on(
                "transactionHash",
                txHash => $("#status").html("Transaction on the way " + txHash)
            );
        // Now we got the mined tx.
        const receipt = txObj.receipt;
       
        if (!receipt.status) {
            console.error("Wrong status");
            console.error(receipt);
            $("#status").html("There was an error in the tx execution, status not 1");
        } else if (receipt.logs.length == 0) {
            console.error("Empty logs");
            console.error(receipt);
            $("#status").html("There was an error in the tx execution, missing expected event");
        } else {
            console.log(receipt.logs[0]);
            $("#status").html("Transfer executed");
        }

        // Make sure we update the UI.
        let balanceAlice = await deployed.balances(alice, { from: alice });
        $("#balanceAlice").html(balanceAlice.toString(10));

        let balanceBill = await deployed.balances(bill, { from: bill });
        $("#balanceBill").html(balanceBill.toString(10));

        let balanceCarol = await deployed.balances(carol, { from: carol });
        $("#balanceCarol").html(balanceCarol.toString(10));

        let balanceContract = await window.web3.eth.getBalance(deployed.address);
        $("#balanceContract").html(balanceContract.toString(10));
        
    } catch(err) {
        $("#status").html(err.toString());
        console.error(err);
    }
};