// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgentRegistry
 * @dev Registry for authorized AI agents that can call strategy functions
 */
contract AgentRegistry {
    address public owner;
    mapping(address => bool) public approvedAgents;
    
    event AgentAdded(address indexed agent);
    event AgentRemoved(address indexed agent);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    /**
     * @dev Add an authorized AI agent
     */
    function addAgent(address _agent) external onlyOwner {
        require(_agent != address(0), "Invalid agent address");
        require(!approvedAgents[_agent], "Agent already approved");
        
        approvedAgents[_agent] = true;
        emit AgentAdded(_agent);
    }
    
    /**
     * @dev Remove an authorized AI agent
     */
    function removeAgent(address _agent) external onlyOwner {
        require(approvedAgents[_agent], "Agent not approved");
        
        approvedAgents[_agent] = false;
        emit AgentRemoved(_agent);
    }
    
    /**
     * @dev Check if an address is an authorized agent
     */
    function isAgent(address _agent) external view returns (bool) {
        return approvedAgents[_agent];
    }
    
    /**
     * @dev Transfer ownership
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
}
