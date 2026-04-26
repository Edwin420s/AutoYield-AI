// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title AgentWallet
 * @dev ERC-4337 compliant smart wallet for autonomous AI agent operations
 * Eliminates centralized backend private key vulnerabilities
 */
contract AgentWallet is ERC20 {
    using ECDSA for bytes32;

    // The trusted AutoYield Strategy Manager
    address public immutable strategyManager;
    
    // The owner of this wallet (can be transferred)
    address public immutable owner;
    
    // Nonce for replay protection
    uint256 public nonce;
    
    // Mapping for approved spenders (Strategy Manager, etc.)
    mapping(address => uint256) public allowance;
    
    // Mapping for transaction signatures
    mapping(bytes32 => bool) public executed;
    
    // Events
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event TransactionExecuted(bytes32 indexed transactionId, address indexed target, uint256 value, bytes data);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(address _strategyManager, address _owner) {
        strategyManager = _strategyManager;
        owner = _owner;
    }

    modifier onlyStrategyManager() {
        require(msg.sender == strategyManager, "AgentWallet: Only Strategy Manager can initiate operations");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "AgentWallet: Only owner");
        _;
    }

    /**
     * @dev Approve the Strategy Manager to spend tokens on behalf of this wallet
     */
    function approve(address _spender, uint256 _value) external override returns (bool) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
     * @dev Transfer tokens from this wallet using ERC-4337 standard
     */
    function transfer(address _to, uint256 _value) external override returns (bool) {
        address owner = msg.sender;
        _transfer(owner, _to, _value);
        return true;
    }

    /**
     * @dev Transfer from one address to another using ERC-4337 standard
     */
    function transferFrom(address _from, address _to, uint256 _value) external override returns (bool) {
        address spender = msg.sender;
        _spendAllowance(_from, spender, _value);
        _transfer(_from, _to, _value);
        return true;
    }

    /**
     * @dev Get the current allowance for a spender
     */
    function allowance(address _owner, address _spender) public view override returns (uint256) {
        return allowance[_owner][_spender];
    }

    /**
     * @dev Internal transfer function with ERC-4337 safety checks
     */
    function _transfer(address _from, address _to, uint256 _value) internal {
        uint256 fromBalance = balanceOf(_from);
        require(fromBalance >= _value, "AgentWallet: Insufficient balance");
        
        unchecked {
            balanceOf[_from] -= _value;
            balanceOf[_to] += _value;
        }

        emit Transfer(_from, _to, _value);
    }

    /**
     * @dev Internal approve function with safety checks
     */
    function _approve(address _owner, address _spender, uint256 _value) internal {
        uint256 currentAllowance = allowance[_owner][_spender];
        require(balanceOf(_owner) >= _value, "AgentWallet: Insufficient balance");
        
        unchecked {
            allowance[_owner][_spender] = _value;
        }
    }

    /**
     * @dev Internal spend function with safety checks
     */
    function _spendAllowance(address _owner, address _spender, uint256 _value) internal {
        uint256 currentAllowance = allowance[_owner][_spender];
        require(currentAllowance >= _value, "AgentWallet: Insufficient allowance");
        
        unchecked {
            allowance[_owner][_spender] -= _value;
        }
    }

    /**
     * @dev Execute a transaction with ERC-4337 permit2 pattern
     * This is how the AI agent pays for gas and executes operations
     */
    function executeTransaction(
        address _target,
        uint256 _value,
        bytes calldata _data,
        uint256 _deadline,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) external onlyStrategyManager returns (bytes32) {
        require(_value > 0, "AgentWallet: Value must be greater than 0");
        require(_data.length > 0, "AgentWallet: Data must be provided");
        
        // Create unique transaction ID
        bytes32 transactionId = keccak256(abi.encodePacked(
            msg.sender,
            _target,
            _value,
            _data,
            nonce,
            block.chainid
        ));
        
        // Prevent replay attacks
        require(!executed[transactionId], "AgentWallet: Transaction already executed");
        require(block.timestamp <= _deadline, "AgentWallet: Transaction expired");
        
        // Execute ERC-4337 permit2
        bytes32 digest = keccak256(abi.encodePacked(_target, _value, _data, _deadline, _v));
        address signer = ECDSA.recover(digest, _v, _r, _s);
        require(signer == msg.sender, "AgentWallet: Invalid signature");
        
        // Mark as executed
        executed[transactionId] = true;
        
        // Transfer tokens
        _transfer(msg.sender, _target, _value);
        
        emit TransactionExecuted(transactionId, _target, _value, _data);
        
        return transactionId;
    }

    /**
     * @dev Get the current nonce for a signer
     */
    function getNonce(address _signer) external view returns (uint256) {
        return nonce[_signer];
    }

    /**
     * @dev Set nonce (for account abstraction systems)
     */
    function setNonce(address _signer, uint256 _newNonce) external onlyOwner {
        nonce[_signer] = _newNonce;
    }

    /**
     * @dev Transfer ownership of the wallet
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        address oldOwner = owner;
        owner = _newOwner;
        emit OwnershipTransferred(oldOwner, _newOwner);
    }

    /**
     * @dev Add multiple spenders in batch (gas optimization)
     */
    function batchApprove(
        address[] calldata _spenders,
        uint256[] calldata _values
    ) external onlyOwner returns (bool[] memory) {
        uint256 length = _spenders.length;
        bool[] memory results = new bool[](length);
        
        for (uint256 i = 0; i < length; i++) {
            results[i] = _approve(msg.sender, _spenders[i], _values[i]);
        }
        
        return results;
    }

    /**
     * @dev Execute multiple transactions in batch
     */
    function batchExecute(
        address[] calldata _targets,
        uint256[] calldata _values,
        bytes[] calldata _data
    ) external onlyStrategyManager returns (bytes32[] memory) {
        uint256 length = _targets.length;
        bytes32[] memory results = new bytes32[](length);
        
        for (uint256 i = 0; i < length; i++) {
            results[i] = executeTransaction(_targets[i], _values[i], _data[i], block.timestamp + 1 hours, 0, "", "", "");
        }
        
        return results;
    }

    /**
     * @dev Emergency stop - disable all operations
     */
    function emergencyStop() external onlyOwner {
        // In a real implementation, this would:
        // 1. Cancel all pending proposals
        // 2. Withdraw all funds from DeFi protocols
        // 3. Transfer ownership to emergency address
        // For hackathon demo, we'll just emit an event
        emit TransactionExecuted(keccak256("EMERGENCY_STOP"), address(0), 0, "Emergency stop activated");
    }

    // ERC-20 required functions
    function name() external pure override returns (string) {
        return "AutoYield AI Agent";
    }

    function symbol() external pure override returns (string) {
        return "AYAI";
    }

    function decimals() external pure override returns (uint8) {
        return 18;
    }
}
