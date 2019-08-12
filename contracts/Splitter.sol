pragma solidity 0.5.0;


import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/lifecycle/Pausable.sol';
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Splitter is Ownable, Pausable {
    using SafeMath for uint256;
 
    
    mapping(address => uint256) public _balances;

    event DepositReceived(address indexed depositor, uint256 amount);
    event FundsSplit(address indexed sender, address receiver1, address receiver2,  uint256 amountReceived);
    event FundsWithdrawn(address indexed party, uint256 balanceWithdrawn, uint256 newBalance);
   
    constructor() public {}

    function() external {
        revert("Falback function not available");
     }


    function split(address receiver1, address receiver2) public payable whenNotPaused {
        require(receiver1 != address(0) && receiver2 != address(0), "Receiver is the zero address");

        uint256 half = SafeMath.div(msg.value,2);
        uint256 remainder = SafeMath.mod(msg.value,2);
        _balances[receiver1] = SafeMath.add(_balances[receiver1], half);
        _balances[receiver2] = SafeMath.add(_balances[receiver2], half);
        _balances[msg.sender] = SafeMath.add(_balances[msg.sender],remainder);
        emit FundsSplit(msg.sender, receiver1, receiver2, half);
    }

    function withdrawFunds() public whenNotPaused {
        require(_balances[msg.sender] > 0, "No funds available for withdrawal");
        uint256 amount = _balances[msg.sender];
        _balances[msg.sender] = 0;
        emit FundsWithdrawn(msg.sender,amount,_balances[msg.sender]);
        msg.sender.transfer(amount);
        
    }
 
}