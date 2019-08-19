pragma solidity 0.5.0;


import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/lifecycle/Pausable.sol';
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Splitter is Ownable, Pausable {
    using SafeMath for uint256;
 
    
    mapping(address => uint256) public balances;

    event LogFundsSplit(address indexed sender, address receiver1, address receiver2,  uint256 amountReceived, uint256 remainingAmountToSender);
    event LogFundsWithdrawn(address indexed party, uint256 balanceWithdrawn);
   
    constructor() public {}

    function() external {
        revert("Falback function not available");
     }


    function split(address receiver1, address receiver2) public payable whenNotPaused {
        require(receiver1 != address(0) && receiver2 != address(0), "Receiver is the zero address");

        uint256 half = msg.value.div(2);
        uint256 remainder = msg.value.mod(2);

        balances[receiver1] = balances[receiver1].add(half);
        balances[receiver2] = balances[receiver2].add(half);
        balances[msg.sender] = balances[msg.sender].add(remainder);
        emit LogFundsSplit(msg.sender, receiver1, receiver2, half, remainder);
    }

    function withdrawFunds() public whenNotPaused {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No funds available for withdrawal");
        balances[msg.sender] = 0;
        emit LogFundsWithdrawn(msg.sender,amount);
        msg.sender.transfer(amount);
    }
}