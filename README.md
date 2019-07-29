# splitter
B9Lab Splitter Project

## Functional Requirements
1. there are 3 people: Alice, Bob and Carol.
2. we can see the balance of the Splitter contract on the Web page.
3. whenever Alice sends ether to the contract for it to be split, half of it goes to Bob and the other half to Carol.
4. we can see the balances of Alice, Bob and Carol on the Web page.
5. Alice can use the Web page to split her ether.

##Notes
* Contract only. Does not include web page. I will do Module 6 first and then build the web page, as mentioned in the instructions.
* Since parties are supposed to be able to interact with eacht other anonymously on the blockchain, I assumed the idea of 
  identifying "Alice", "Bob", "Carol" was a red herring. I implemented this using roles. Alice can have the sender role. 
  Bob and Carol can have receiver roles.
