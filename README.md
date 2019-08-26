# splitter
B9Lab Splitter Project

## Functional Requirements
1. there are 3 people: Alice, Bob and Carol.
2. we can see the balance of the Splitter contract on the Web page.
3. whenever Alice sends ether to the contract for it to be split, half of it goes to Bob and the other half to Carol.
4. we can see the balances of Alice, Bob and Carol on the Web page.
5. Alice can use the Web page to split her ether.

## Notes
* Simplified Splitter.sol as per comments
* Alice, Bob, and Carol are used as test accounts, but as per comments it is possible for anyone to split or receive.
* The split function is also tested with Dan, Ed, and Frank
* Added a require to split function to chedk for 0 address;
* The test case 'should allow Alice to withdraw her funds' now correctly checks Alice's account balance as well as her splitter balance after withdrawing funds
* The test case 'should allow Bob to withdraw his funds' now correctly checks Bob's account balance as well as his splitter balance after withdrawing funds
* Made changes according to Xavier's comments
*Added GUI
