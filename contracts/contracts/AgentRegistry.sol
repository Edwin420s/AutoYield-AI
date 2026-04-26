// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AgentRegistry {
    mapping(address => bool) public approvedAgents;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function addAgent(address agent) external onlyOwner {
        approvedAgents[agent] = true;
    }

    function isAgent(address agent) external view returns (bool) {
        return approvedAgents[agent];
    }
}
