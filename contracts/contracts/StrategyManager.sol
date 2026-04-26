// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVault {
    function rebalance(string[] memory, uint256[] memory) external;
}

interface IAgentRegistry {
    function isAgent(address) external view returns (bool);
}

contract StrategyManager {
    address public vault;
    address public agentRegistry;
    address public owner;

    uint256 public lastRebalance;
    uint256 public cooldown = 1 minutes;

    event StrategyExecuted(address indexed agent, uint256 apy, uint256 risk);

    constructor(address _vault, address _registry) {
        vault = _vault;
        agentRegistry = _registry;
        owner = msg.sender;
    }

    function executeStrategy(
        string[] memory protocols,
        uint256[] memory percentages,
        uint256 apy,
        uint256 risk
    ) external {
        require(IAgentRegistry(agentRegistry).isAgent(msg.sender), "Not authorized agent");
        require(block.timestamp > lastRebalance + cooldown, "Cooldown active");

        // Simple safety guardrails
        require(apy >= 3 && risk <= 80, "Strategy out of bounds");

        IVault(vault).rebalance(protocols, percentages);

        lastRebalance = block.timestamp;
        emit StrategyExecuted(msg.sender, apy, risk);
    }
}
