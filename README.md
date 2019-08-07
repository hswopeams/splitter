# splitter
B9Lab Splitter Project

## Functional Requirements
1. there are 3 people: Alice, Bob and Carol.
2. we can see the balance of the Splitter contract on the Web page.
3. whenever Alice sends ether to the contract for it to be split, half of it goes to Bob and the other half to Carol.
4. we can see the balances of Alice, Bob and Carol on the Web page.
5. Alice can use the Web page to split her ether.

## Notes
* Contract only. Does not include web page. I will do Module 6 first and then build the web page, as mentioned in the instructions.
* Simplified Splitter.sol as per comments
* Alice, Bob, and Carol are used as test accounts, but as per comments it is possible for anyone to split or receive.
* The Split function is also tested with Dan, Ed, and Frank
* The withdrawFunds test is not working correctly. I managed to calculate transactionFee, but Alice's ending balance is not as expected (old balance - withdraw function call transaction fee + withdrawn amount). I'm not sure why. I only added assertions for Alice at this point because I know something is wrong. If I can get help figuring out what is wrong, I can then add assertions to check Bob and Carol's balances too.
