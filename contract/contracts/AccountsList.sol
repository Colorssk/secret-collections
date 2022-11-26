// SPDX-License-Identifier: UNLICENSED
import "@openzeppelin/contracts/access/Ownable.sol";
pragma solidity ^0.8.9;


contract AccountsList is Ownable{
    uint public listCount;
    uint public registerLimit;
    event IncreaseMember(address indexed member, string message);
    event DecreaseMember(address indexed member, string message);
    mapping(address=>bool) public accounts;


    constructor(uint _limit){
        registerLimit = _limit;
    }

    function addMember() public {
        require(address(msg.sender) != address(0), "invalid address");
        require(!accounts[msg.sender],"has existed");
        require(registerLimit>listCount, "no position for you");
        accounts[msg.sender] = true;
        listCount++;
        emit IncreaseMember(msg.sender, "increase success");
    }

    function ownerAddress() public view returns(address) {
        address _owner = owner();
        return _owner;
    }

    function delMember() public {
        require(address(msg.sender) != address(0), "invalid address");
        require(accounts[msg.sender],"not existed");
        accounts[msg.sender] = false;
        listCount--;
        emit DecreaseMember(msg.sender, "delete success");
    }

    receive() external payable {}
}