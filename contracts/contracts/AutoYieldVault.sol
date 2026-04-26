// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AutoYieldVault {
    struct Allocation {
        address protocol; // Changed from string to address
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

    event Rebalanced(address[] protocols, uint256[] percentages);

    function rebalance(
        address[] memory _protocols, // Changed from string[] to address[]
        uint256[] memory _percentages
    ) external onlyStrategyManager {
        require(_protocols.length == _percentages.length, "Arrays length mismatch");
        
        uint256 totalPercentage = 0;
        for(uint i = 0; i < _percentages.length; i++) {
            totalPercentage += _percentages[i];
        }
        require(totalPercentage == 100, "Total percentage must equal 100");
        
        delete allocations;
        for (uint i = 0; i < _protocols.length; i++) {
            require(_protocols[i] != address(0), "Invalid protocol address");
            allocations.push(Allocation(_protocols[i], _percentages[i]));
        }
        emit Rebalanced(_protocols, _percentages);
    }

    // View functions for frontend
    function getAllocations() external view returns (address[] memory, uint256[] memory) {
        address[] memory protocols = new address[](allocations.length);
        uint256[] memory percentages = new uint256[](allocations.length);
        
        for(uint i = 0; i < allocations.length; i++) {
            protocols[i] = allocations[i].protocol;
            percentages[i] = allocations[i].percentage;
        }
        
        return (protocols, percentages);
    }

    function getUserBalance(address user) external view returns (uint256) {
        return shares[user];
    }

    function getTotalFunds() external view returns (uint256) {
        return totalFunds;
    }

    function getTotalShares() external view returns (uint256) {
        return totalShares;
    }
}
