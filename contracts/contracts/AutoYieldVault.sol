// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AutoYieldVault {
    struct Allocation {
        string protocol;
        uint256 percentage;
    }

    mapping(address => uint256) public shares;
    uint256 public totalShares;
    uint256 public totalFunds;

    Allocation[] public allocations;
    address public strategyManager;

    modifier onlyStrategyManager() {
        require(msg.sender == strategyManager, "Not authorized");
        _;
    }

    function setStrategyManager(address _manager) external {
        require(strategyManager == address(0), "Already set");
        strategyManager = _manager;
    }

    function deposit() external payable {
        uint256 sharesToMint;
        if (totalShares == 0) {
            sharesToMint = msg.value;
        } else {
            sharesToMint = (msg.value * totalShares) / totalFunds;
        }

        shares[msg.sender] += sharesToMint;
        totalShares += sharesToMint;
        totalFunds += msg.value;
    }

    function withdraw(uint256 shareAmount) external {
        require(shares[msg.sender] >= shareAmount, "Insufficient shares");
        uint256 amount = (shareAmount * totalFunds) / totalShares;

        shares[msg.sender] -= shareAmount;
        totalShares -= shareAmount;
        totalFunds -= amount;

        payable(msg.sender).transfer(amount);
    }

    event Rebalanced(string[] protocols, uint256[] percentages);

    function rebalance(
        string[] memory _protocols,
        uint256[] memory _percentages
    ) external onlyStrategyManager {
        delete allocations;
        for (uint i = 0; i < _protocols.length; i++) {
            allocations.push(Allocation(_protocols[i], _percentages[i]));
        }
        emit Rebalanced(_protocols, _percentages);
    }
}
