// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVault {
    function rebalance(address[] memory, uint256[] memory) external;
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
    uint256 public timeLockDuration = 24 hours;
    uint256 public maxPortfolioRisk = 75;
    
    struct ProtocolInfo {
        bool isWhitelisted;
        uint256 riskScore; // 0 (safest) to 100 (riskiest)
        string name;
        string zeroGStorageHash; // CID for audit reports
        uint256 lastUpdated;
    }
    
    struct Proposal {
        address[] protocols;
        uint256[] percentages;
        uint256 executionTime;
        bool executed;
        bool canceled;
        address proposedBy;
        uint256 totalApy;
        uint256 portfolioRisk;
    }
    
    // State variables
    mapping(address => ProtocolInfo) public protocolRegistry;
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    // Events
    event ProtocolUpdated(address indexed protocol, bool status, uint256 riskScore, string zeroGHash);
    event StrategyProposed(uint256 indexed proposalId, uint256 executeAfter, address indexed proposer);
    event StrategyExecuted(address indexed agent, uint256 proposalId, uint256 totalApy, uint256 portfolioRisk);
    event ProposalCanceled(uint256 indexed proposalId, address indexed canceler);
    
    constructor(address _vault, address _registry) {
        vault = _vault;
        agentRegistry = _registry;
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    /**
     * @dev Admin or DAO adds/updates a protocol in the registry.
     * This is the "Source of Truth" that the AI cannot bypass.
     */
    function updateProtocol(
        address _protocol, 
        bool _status, 
        uint256 _riskScore, 
        string calldata _name,
        string calldata _zeroGHash
    ) external onlyOwner {
        require(_protocol != address(0), "Invalid protocol address");
        require(_riskScore <= 100, "Invalid risk score");
        
        protocolRegistry[_protocol] = ProtocolInfo({
            isWhitelisted: _status,
            riskScore: _riskScore,
            name: _name,
            zeroGStorageHash: _zeroGHash,
            lastUpdated: block.timestamp
        });
        
        emit ProtocolUpdated(_protocol, _status, _riskScore, _zeroGHash);
    }
    
    /**
     * @dev Batch update protocols for efficiency
     */
    function batchUpdateProtocols(
        address[] calldata _protocols,
        bool[] calldata _statuses,
        uint256[] calldata _riskScores,
        string[] calldata _names,
        string[] calldata _zeroGHashes
    ) external onlyOwner {
        require(_protocols.length == _statuses.length, "Arrays length mismatch");
        require(_protocols.length == _riskScores.length, "Arrays length mismatch");
        require(_protocols.length == _names.length, "Arrays length mismatch");
        require(_protocols.length == _zeroGHashes.length, "Arrays length mismatch");
        
        for(uint i = 0; i < _protocols.length; i++) {
            updateProtocol(_protocols[i], _statuses[i], _riskScores[i], _names[i], _zeroGHashes[i]);
        }
    }
    
    /**
     * @dev The AI agent calls this to PROPOSE a strategy (Time-Lock version)
     */
    function proposeStrategy(
        address[] calldata _protocols,
        uint256[] calldata _percentages,
        uint256 _reportedApy
    ) external {
        require(IAgentRegistry(agentRegistry).isAgent(msg.sender), "Not authorized agent");
        require(_protocols.length == _percentages.length, "Arrays length mismatch");
        require(_protocols.length > 0, "No protocols specified");
        
        uint256 totalPercentage = 0;
        uint256 portfolioRisk = 0;
        
        // Security checks for all protocols
        for(uint i = 0; i < _protocols.length; i++) {
            require(_percentages[i] > 0, "Invalid percentage");
            totalPercentage += _percentages[i];
            
            ProtocolInfo memory info = protocolRegistry[_protocols[i]];
            require(info.isWhitelisted, "Security Breach: Protocol not whitelisted");
            require(block.timestamp <= info.lastUpdated + 365 days, "Protocol info expired");
            
            // Calculate weighted portfolio risk
            portfolioRisk += (info.riskScore * _percentages[i]) / 100;
        }
        
        require(totalPercentage == 100, "Total percentage must equal 100");
        require(portfolioRisk <= maxPortfolioRisk, "Risk Threshold Exceeded");
        
        uint256 executeAfter = block.timestamp + timeLockDuration;
        
        proposals[proposalCount] = Proposal({
            protocols: _protocols,
            percentages: _percentages,
            executionTime: executeAfter,
            executed: false,
            canceled: false,
            proposedBy: msg.sender,
            totalApy: _reportedApy,
            portfolioRisk: portfolioRisk
        });
        
        emit StrategyProposed(proposalCount, executeAfter, msg.sender);
        proposalCount++;
    }
    
    /**
     * @dev Emergency stop - Admin can cancel any proposal
     */
    function cancelProposal(uint256 _proposalId) external onlyOwner {
        Proposal storage p = proposals[_proposalId];
        require(!p.executed, "Already executed");
        require(!p.canceled, "Already canceled");
        
        p.canceled = true;
        emit ProposalCanceled(_proposalId, msg.sender);
    }
    
    /**
     * @dev Execute proposal after time-lock expires
     */
    function executeProposedStrategy(uint256 _proposalId) external {
        Proposal storage p = proposals[_proposalId];
        require(!p.executed, "Already executed");
        require(!p.canceled, "Proposal was canceled");
        require(block.timestamp >= p.executionTime, "Time-lock is still active");
        
        p.executed = true;
        
        // Final security check before execution
        for(uint i = 0; i < p.protocols.length; i++) {
            require(protocolRegistry[p.protocols[i]].isWhitelisted, "Protocol delisted since proposal");
        }
        
        IVault(vault).rebalance(p.protocols, p.percentages);
        lastRebalance = block.timestamp;
        
        emit StrategyExecuted(msg.sender, _proposalId, p.totalApy, p.portfolioRisk);
    }
    
    /**
     * @dev Legacy immediate execution (for emergencies only)
     */
    function executeStrategy(
        address[] calldata protocols,
        uint256[] calldata percentages,
        uint256 apy,
        uint256 risk
    ) external {
        require(IAgentRegistry(agentRegistry).isAgent(msg.sender), "Not authorized agent");
        require(block.timestamp > lastRebalance + cooldown, "Cooldown active");
        
        uint256 portfolioRisk = 0;
        uint256 totalPercentage = 0;
        
        for(uint i = 0; i < protocols.length; i++) {
            ProtocolInfo memory info = protocolRegistry[protocols[i]];
            require(info.isWhitelisted, "Security Breach: Protocol not whitelisted");
            portfolioRisk += (info.riskScore * percentages[i]) / 100;
            totalPercentage += percentages[i];
        }
        
        require(totalPercentage == 100, "Total percentage must equal 100");
        require(apy >= 3 && portfolioRisk <= 80, "Strategy out of bounds");
        
        IVault(vault).rebalance(protocols, percentages);
        lastRebalance = block.timestamp;
        emit StrategyExecuted(msg.sender, 0, apy, portfolioRisk);
    }
    
    /**
     * @dev View functions for frontend
     */
    function getProposal(uint256 _proposalId) external view returns (
        address[] memory protocols,
        uint256[] memory percentages,
        uint256 executionTime,
        bool executed,
        bool canceled,
        address proposedBy,
        uint256 totalApy,
        uint256 portfolioRisk
    ) {
        Proposal storage p = proposals[_proposalId];
        return (
            p.protocols,
            p.percentages,
            p.executionTime,
            p.executed,
            p.canceled,
            p.proposedBy,
            p.totalApy,
            p.portfolioRisk
        );
    }
    
    function getProtocolInfo(address _protocol) external view returns (
        bool isWhitelisted,
        uint256 riskScore,
        string memory name,
        string memory zeroGStorageHash,
        uint256 lastUpdated
    ) {
        ProtocolInfo storage info = protocolRegistry[_protocol];
        return (
            info.isWhitelisted,
            info.riskScore,
            info.name,
            info.zeroGStorageHash,
            info.lastUpdated
        );
    }
    
    /**
     * @dev Admin functions
     */
    function setTimeLockDuration(uint256 _duration) external onlyOwner {
        require(_duration >= 1 hours && _duration <= 7 days, "Invalid duration");
        timeLockDuration = _duration;
    }
    
    function setMaxPortfolioRisk(uint256 _maxRisk) external onlyOwner {
        require(_maxRisk <= 100, "Invalid risk level");
        maxPortfolioRisk = _maxRisk;
    }
    
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
}
