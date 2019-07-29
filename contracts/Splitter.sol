pragma solidity 0.5.0;

import 'openzeppelin-solidity/contracts/access/Roles.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/lifecycle/Pausable.sol';
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Splitter is Ownable, Pausable {
    using SafeMath for uint256;
    using Roles for Roles.Role;
  
    Roles.Role private _authorizedSenders;
    Roles.Role private _authorizedReceivers;
    address[] private _receivers;
    uint256 private senderCount;
    mapping(address => uint256) private _balances;

    event DepositReceived(address indexed depositor, uint256 amount);
    event SenderAuthorized(address indexed sender);
    event ReceiverAuthorized(address indexed receiver);
    event SenderAuthoriizationRevoked(address indexed sender);
    event ReceiverAuthorizizationRevoked(address indexed receiver);
    event FundsSplit(address indexed sender, address indexed receiver, uint256 amountSplit, uint256 amountReceived);
    event FundsToppedUp(address indexed sender, uint256 amount, uint256 startingBalance, uint256 newBalance);
    event FundsWithdrawn(address indexed party, uint256 balanceWithdrawn, uint256 newBalance);
    

    constructor() public {
	}

    function() external payable whenNotPaused {
        require(Roles.has(_authorizedSenders,msg.sender), "Not authorized to deposit funds");
        require(msg.data.length == 0, "Fallback function cal only be used to deposit ether");
        _balances[msg.sender] = msg.value;
        emit DepositReceived(msg.sender, msg.value);
     }

    //Only Alice can split (send) funds
    function authorizeSender(address payable senderAddress) public onlyOwner whenNotPaused {
        require(!Roles.has(_authorizedSenders, senderAddress),"This party is already authorized as a sender");
        
        //Only one authorized sender at a time ("Alice")
        assert(senderCount < 1);
        _balances[senderAddress] = 0;
        Roles.add(_authorizedSenders, senderAddress);
        senderCount++;
        emit SenderAuthorized(senderAddress);
    }

    //Only Bob and Carol can receive funds
    function authorizeReceiver(address payable receiverAddress) public onlyOwner whenNotPaused {
        //make sure this receiver has not alreadybeen added
        require(!Roles.has(_authorizedReceivers, receiverAddress),"This party is already authorized as a receiver");

        //Only two authorized receivers at a time ("Bob" and "Carol")
        assert(_receivers.length < 2);
        _receivers.push(receiverAddress);
        _balances[receiverAddress] = 0;
        Roles.add(_authorizedReceivers, receiverAddress);
        assert(Roles.has(_authorizedReceivers, receiverAddress));
        emit ReceiverAuthorized(receiverAddress);
    }

    function revokeSenderAuthorization(address senderAddress) public onlyOwner whenNotPaused {
        require(Roles.has(_authorizedSenders, senderAddress),"This party is not an authorized sender");
        require(_balances[senderAddress] == 0,"Funds must first be withdrawn");

        Roles.remove(_authorizedSenders, senderAddress);
        delete(_balances[senderAddress]);
        senderCount--;
        emit SenderAuthoriizationRevoked(senderAddress);
    }
       
    function revokeReceiverAuthorization(address receiverAddress) public onlyOwner whenNotPaused {
        require(Roles.has(_authorizedReceivers, receiverAddress),"This party is not an authorized receiver");
        require(_balances[receiverAddress] == 0,"Funds must first be withdrawn");
       
        for (uint i = 0; i < _receivers.length; i++) {
            if (_receivers[i] == receiverAddress) {
                _receivers[i] = _receivers[_receivers.length - 1];
                delete _receivers[_receivers.length - 1];
                _receivers.length--;
                delete(_balances[receiverAddress]);
            }
          
        }
       
        Roles.remove(_authorizedReceivers, receiverAddress);
        emit ReceiverAuthorizizationRevoked(receiverAddress);
    }

    function getPartyBalance() public view whenNotPaused returns(uint256)  {
        require(Roles.has(_authorizedSenders,msg.sender) || Roles.has(_authorizedReceivers,msg.sender), "Not authorized to get balance");
        return _balances[msg.sender];
    }


    function split(uint256 amount) public payable whenNotPaused {
        require(Roles.has(_authorizedSenders,msg.sender), "Does not have sender role");
        require(_balances[msg.sender] > amount,"Balance too low");
        require(SafeMath.mod(amount,2) == 0, "Amount must be evenly disivisble by 2");

        uint256 half = SafeMath.div(amount,2);
        _balances[msg.sender] = SafeMath.sub(_balances[msg.sender],amount);

        for (uint256 i = 0; i < _receivers.length; i++) {
            assert(Roles.has(_authorizedReceivers, _receivers[i]));
            _balances[_receivers[i]] = SafeMath.add(_balances[_receivers[i]],half);
            emit FundsSplit(msg.sender,_receivers[i], amount, half);
        }
    }

    function withdrawFunds() public whenNotPaused {
        require(Roles.has(_authorizedSenders,msg.sender) || Roles.has(_authorizedReceivers,msg.sender), "Not authorized to withdraw funds");
        require(_balances[msg.sender] > 0, "No funds available for withdrawal");
        uint256 amount = _balances[msg.sender];
        _balances[msg.sender] = 0;
        msg.sender.transfer(amount);
        emit FundsWithdrawn(msg.sender,amount,_balances[msg.sender]);
    }

    
}