# splitter
B9lab Academy Project 1

This was the first project I developed for the B9lab Academy Ethereum Developer Course. It consists of a simple Splitter contract that allows Alice to split funds between Bill and Carol.
Bill and Carol can then withdraw their funds from the Splitter contract. Alic gets an error if she tries to withdraw funds because she doesn't have any funds in the contract. All her funds get split between Bill and Carol.
Alice, Bill, and Carol's addresses and balances are displayed at the top of the page, along with the Splitter contract balance.
This dApp is not integrated with MetaMask. Alice,Bill, and Carol's addresses are items 1,2, and 3 in ganaceh's accounts array.

I'm not a front-end developer, so the GUI is very simple. It serves only to show that I can wire a front-end to a smart contract.

## Functional Requirements
1. There are 3 people: Alice, Bob and Carol.
2. We can see the balance of the Splitter contract on the Web page.
3. Whenever Alice sends ether to the contract for it to be split, half of it goes to Bob and the other half to Carol.
4. We can see the balances of Alice, Bob and Carol on the Web page.
5. Alice can use the Web page to split her ether.
6. Bob and Carol can withdraw their balances.

## How to Run
1. Clone this respository
2. CD to the `splitter` directory
3. Run `npm install`
4. In a separate terminal,  run `ganache-cli --host 0.0.0.0`. Assumes ganache-cli is installed globally (https://www.npmjs.com/package/ganache-cli)
5. Take note of the addresses, if desired
6. In the first terminal, run `./node_modules/.bin/truffle migrate` to migrate contracts
7. Run `npm run build`
8. Run `npm run dev`
9. Go to <http://127.0.0.1:8000/> in your browser
10. Fill in a Wei amount and click `Split`
11. Notice the balances increasing
12. To withdraw funds, fill in Bill or Alice's address anc click `Withdraw`

