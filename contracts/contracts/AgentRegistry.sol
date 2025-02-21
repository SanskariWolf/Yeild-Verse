// contracts/AgentRegistry.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AgentRegistry {
    mapping(address => bool) public isAgent;
    address public owner;

    event AgentRegistered(address indexed agent);
    event AgentDeregistered(address indexed agent);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function registerAgent(address _agent) external onlyOwner {
        isAgent[_agent] = true;
        emit AgentRegistered(_agent);
    }

    function deregisterAgent(address _agent) external onlyOwner {
        isAgent[_agent] = false;
        emit AgentDeregistered(_agent);
    }
}