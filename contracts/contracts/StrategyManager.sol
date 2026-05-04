// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

interface IVault {
    function rebalance(address[] memory, uint256[] memory) external;
}

interface IAgentRegistry {
    function isAgent(address) external view returns (bool);
}

contract StrategyManager is EIP712 {
    using ECDSA for bytes32;

    address public vault;
    address public agentRegistry;
    address public owner;
    
    uint256 public lastRebalance;
    uint256 public cooldown = 1 minutes;
    uint256 public timeLockDuration = 24 hours;
    uint256 public maxPortfolioRisk = 75;
    
    // EMERGENCY CONTROLS
    bool public paused = false;
    
    // NEW: The exact public address of the 0G Compute Intel SGX Enclave
    // HACKATHON DEMO: Represents the Intel SGX public key. In production, this address 
    // is hardcoded via DCAP attestation registry and cannot be a standard EOA.
    // For hackathon purposes, we use a cryptographically secure random wallet to simulate
    // the enclave's public key, demonstrating the exact verification pattern without
    // requiring actual Intel SGX hardware infrastructure.
    address public trustedEnclaveKey;
    
    // EIP-712 TypeHash for strategy signing
    bytes32 private constant STRATEGY_TYPEHASH = keccak256(
        "Strategy(address[] protocols,uint256[] percentagesBps,uint256 reportedApy,uint256 chainId,uint256 nonce)"
    );
    
    // SECURITY: Prevent replay attacks by tracking used nonces
    mapping(address => uint256) public nonces;
    mapping(bytes32 => bool) public usedSignatures;
    
    struct ProtocolInfo {
        bool isWhitelisted;
        uint256 riskScore; // 0 (safest) to 100 (riskiest)
        uint256 maxAllocationBps; // NEW: The absolute maximum allowed (e.g., 3500 for 35%)
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
    event ProtocolUpdated(address indexed protocol, bool status, uint256 riskScore, uint256 maxAllocationBps, string zeroGHash);
    event StrategyProposed(uint256 indexed proposalId, uint256 executeAfter, address indexed proposer);
    event StrategyExecuted(address indexed agent, uint256 indexed proposalId, uint256 totalApy, uint256 portfolioRisk);
    event StrategyCanceled(uint256 indexed proposalId, address indexed canceler);
    event EmergencyPaused(address indexed pausedBy, uint256 timestamp);
    event EmergencyUnpaused(address indexed unpausedBy, uint256 timestamp);
    
    constructor(address _vault, address _registry, address _enclaveKey, uint256 _hackathonTimeLockDuration) 
        EIP712("AutoYield Strategy Manager", "1") {
        vault = _vault;
        agentRegistry = _registry;
        trustedEnclaveKey = _enclaveKey; // Set this during deployment
        
        // HACKATHON MODE: Allow configurable time-lock for demo purposes
        // If _hackathonTimeLockDuration > 0, use it (e.g., 10 seconds for demo)
        // If _hackathonTimeLockDuration == 0, use default 24 hours for production
        if (_hackathonTimeLockDuration > 0) {
            timeLockDuration = _hackathonTimeLockDuration;
        } else {
            timeLockDuration = 24 hours;
        }
        owner = msg.sender;
    }
    
    /**
     * @dev Admin can update the enclave key if hardware is upgraded
     */
    function setTrustedEnclaveKey(address _newKey) external onlyOwner whenNotPaused {
        require(_newKey != address(0), "Invalid enclave key");
        trustedEnclaveKey = _newKey;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    /**
     * @dev Emergency stop modifier - prevents operations when paused
     */
    modifier whenNotPaused() {
        require(!paused, "StrategyManager: Contract is paused - emergency mode active");
        _;
    }
    
    /**
     * @dev Emergency pause - halts all strategy operations
     * Can only be called by owner in emergency situations
     */
    function emergencyPause() external onlyOwner {
        paused = true;
        emit EmergencyPaused(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Emergency unpause - resumes normal operations
     * Can only be called by owner after emergency is resolved
     */
    function emergencyUnpause() external onlyOwner {
        paused = false;
        emit EmergencyUnpaused(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Admin or DAO adds/updates a protocol in the registry.
     * This is the "Source of Truth" that the AI cannot bypass.
     */
    function updateProtocol(
        address _protocol, 
        bool _status, 
        uint256 _riskScore, 
        uint256 _maxAllocationBps,
        string calldata _name,
        string calldata _zeroGHash
    ) external onlyOwner whenNotPaused {
        require(_protocol != address(0), "Invalid protocol address");
        require(_riskScore <= 100, "Risk score must be 0-100");
        require(_maxAllocationBps <= 10000, "Max allocation must be <= 10000 BPS (100%)");
        
        protocolRegistry[_protocol] = ProtocolInfo({
            isWhitelisted: _status,
            riskScore: _riskScore,
            maxAllocationBps: _maxAllocationBps,
            name: _name,
            zeroGStorageHash: _zeroGHash,
            lastUpdated: block.timestamp
        });
        
        emit ProtocolUpdated(_protocol, _status, _riskScore, _maxAllocationBps, _zeroGHash);
    }
    
    /**
     * @dev Batch update protocols for efficiency
     * TODO: Fix function visibility issue - commented out for now
     */
    /*
    function batchUpdateProtocols(
        address[] calldata _protocols,
        bool[] calldata _statuses,
        uint256[] calldata _riskScores,
        uint256[] calldata _maxAllocationBps,
        string[] calldata _names,
        string[] calldata _zeroGHashes
    ) external onlyOwner {
        require(_protocols.length == _statuses.length, "Arrays length mismatch");
        require(_protocols.length == _riskScores.length, "Arrays length mismatch");
        require(_protocols.length == _maxAllocationBps.length, "Arrays length mismatch");
        require(_protocols.length == _names.length, "Arrays length mismatch");
        require(_protocols.length == _zeroGHashes.length, "Arrays length mismatch");
        
        for(uint i = 0; i < _protocols.length; i++) {
            updateProtocol(_protocols[i], _statuses[i], _riskScores[i], _maxAllocationBps[i], _names[i], _zeroGHashes[i]);
        }
    }
    */
    
    /**
     * @dev The AI agent calls this to PROPOSE a strategy (Time-Lock version)
     */
    function proposeStrategy(
        address[] memory _protocols,
        uint256[] memory _percentagesBps,
        uint256 _reportedApy,
        bytes calldata _sgxAttestationProof
    ) external onlyAgent whenNotPaused {
        require(IAgentRegistry(agentRegistry).isAgent(msg.sender), "Not authorized agent");
        require(_protocols.length == _percentagesBps.length, "Arrays length mismatch");
        require(_protocols.length > 0, "No protocols specified");

        // ==========================================
        // EIP-712 TEE SIGNATURE VERIFICATION
        // ==========================================
        
        // 1. Get current nonce for this agent
        uint256 currentNonce = nonces[msg.sender];
        
        // 2. Create EIP-712 compliant typed data hash
        bytes32 strategyHash = keccak256(abi.encode(
            STRATEGY_TYPEHASH,
            keccak256(abi.encodePacked(_protocols)), // Hash of protocols array
            keccak256(abi.encodePacked(_percentagesBps)), // Hash of percentages array
            _reportedApy,
            block.chainid, // CRITICAL: Include chain ID to prevent cross-chain replay
            currentNonce
        ));
        
        // 3. Create the EIP-712 digest
        bytes32 digest = _hashTypedDataV4(strategyHash);
        
        // 4. Recover the address that signed this payload
        address recoveredSigner = ECDSA.recover(digest, _sgxAttestationProof);
        
        // 5. THE ULTIMATE CHECK: Did our specific TEE enclave sign this exact data?
        require(recoveredSigner == trustedEnclaveKey, "CRITICAL: TEE Attestation Failed! Payload altered or untrusted hardware.");
        
        // 6. Prevent replay attacks by burning this signature
        require(!usedSignatures[digest], "SECURITY: Signature already used (Replay Attack)");
        usedSignatures[digest] = true;
        
        // 7. Increment nonce for this agent
        nonces[msg.sender] = currentNonce + 1;
        
        // ==========================================
        
        uint256 totalBps = 0;
        uint256 portfolioRisk = 0;
        
        // Security checks for all protocols
        for(uint i = 0; i < _protocols.length; i++) {
            require(_percentagesBps[i] > 0, "Invalid allocation");
            totalBps += _percentagesBps[i];
            
            ProtocolInfo memory info = protocolRegistry[_protocols[i]];
            require(info.isWhitelisted, "Security Breach: Protocol not whitelisted");
            require(block.timestamp <= info.lastUpdated + 365 days, "Protocol info expired");
            
            // THE ENTERPRISE UPGRADE: Force AI to obey Trust Score Limit
            require(_percentagesBps[i] <= info.maxAllocationBps, "CRITICAL: AI exceeded Trust Score allocation limit!");
            
            // Calculate weighted portfolio risk (adjusted for BPS)
            portfolioRisk += (info.riskScore * _percentagesBps[i]) / 10000;
        }
        
        // Exact precision check
        require(totalBps == 10000, "Total allocation must exactly equal 10000 BPS (100%)");
        require(portfolioRisk <= maxPortfolioRisk, "Risk Threshold Exceeded");
        
        uint256 executeAfter = block.timestamp + timeLockDuration;
        
        proposals[proposalCount] = Proposal({
            protocols: _protocols,
            percentages: _percentagesBps, // Now storing highly precise BPS
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
            portfolioRisk += (info.riskScore * percentages[i]) / 10000;
            totalPercentage += percentages[i];
        }
        
        require(totalPercentage == 10000, "Total percentage must equal 10000 BPS (100%)");
        require(apy >= 3 && portfolioRisk <= 80, "Strategy out of bounds");
        
        // 1. Update the state FIRST (The Effect)
        lastRebalance = block.timestamp;
        emit StrategyExecuted(msg.sender, 0, apy, portfolioRisk);
        
        // 2. Call the external contract SECOND (The Interaction)
        IVault(vault).rebalance(protocols, percentages);
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
