// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgentRegistry
 * @dev Registry for authorized AI agents that can call strategy functions
 * 
 * Key Features:
 * - Agent authorization management
 * - Role-based access control
 * - Agent status tracking
 * - Ownership transfer capability
 * 
 * @contract AgentRegistry
 * @author AutoYield AI Team
 * @version 1.0.0
 */
contract AgentRegistry {
    // ========================================
    // STATE VARIABLES
    // ========================================
    
    /// @dev Owner of the registry (can add/remove agents)
    address public owner;
    
    /// @dev Mapping of authorized agent addresses
    mapping(address => bool) public approvedAgents;
    
    // ========================================
    // EVENTS
    // ========================================
    
    /// @dev Emitted when a new agent is authorized
    /// @param agent Address of the added agent
    event AgentAdded(address indexed agent);
    
    /// @dev Emitted when an agent is de-authorized
    /// @param agent Address of the removed agent
    event AgentRemoved(address indexed agent);
    
    // ========================================
    // CONSTRUCTOR
    // ========================================
    
    /**
     * @dev Initialize the registry with the deployer as owner
     */
    constructor() {
        owner = msg.sender;
    }
    
    // ========================================
    // MODIFIERS
    // ========================================
    
    /**
     * @dev Restricts function access to contract owner only
     * Prevents unauthorized agent management
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    // ========================================
    // AGENT MANAGEMENT FUNCTIONS
    // ========================================
    
    /**
     * @dev Add an authorized AI agent to the registry
     * @param _agent Address of the AI agent to authorize
     */
    function addAgent(address _agent) external onlyOwner {
        require(_agent != address(0), "Invalid agent address");
        require(!approvedAgents[_agent], "Agent already approved");
        
        approvedAgents[_agent] = true;
        emit AgentAdded(_agent);
    }
    
    /**
     * @dev Remove an authorized AI agent from the registry
     * @param _agent Address of the AI agent to de-authorize
     */
    function removeAgent(address _agent) external onlyOwner {
        require(approvedAgents[_agent], "Agent not approved");
        
        approvedAgents[_agent] = false;
        emit AgentRemoved(_agent);
    }
    
    // ========================================
    // VIEW FUNCTIONS
    // ========================================
    
    /**
     * @dev Check if an address is an authorized AI agent
     * @param _agent Address to check authorization status for
     * @return True if agent is authorized, false otherwise
     */
    function isAgent(address _agent) external view returns (bool) {
        return approvedAgents[_agent];
    }
    
    // ========================================
    // OWNER MANAGEMENT
    // ========================================
    
    /**
     * @dev Transfer ownership of the registry to a new address
     * @param _newOwner Address of the new owner
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
}
