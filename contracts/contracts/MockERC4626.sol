// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockERC4626
 * @dev Mock ERC-4626 vault for hackathon demo on 0G network
 * Simulates Aave/Compound vault behavior for testing
 */
contract MockERC4626 is ERC20 {
    IERC20 public immutable asset;
    uint256 private _totalAssets;
    uint256 private constant PRECISION = 1e18;
    
    event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
    
    constructor(
        IERC20 _asset,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) {
        asset = _asset;
    }
    
    function totalAssets() external view returns (uint256) {
        return _totalAssets;
    }
    
    function convertToShares(uint256 assets) public pure returns (uint256) {
        return assets; // 1:1 conversion for simplicity
    }
    
    function convertToAssets(uint256 shares) public pure returns (uint256) {
        return shares; // 1:1 conversion for simplicity
    }
    
    function maxDeposit(address) external pure returns (uint256) {
        return type(uint256).max;
    }
    
    function maxMint(address) external pure returns (uint256) {
        return type(uint256).max;
    }
    
    function maxWithdraw(address owner) external view returns (uint256) {
        return balanceOf(owner);
    }
    
    function maxRedeem(address owner) external view returns (uint256) {
        return balanceOf(owner);
    }
    
    function previewDeposit(uint256 assets) public pure returns (uint256) {
        return convertToShares(assets);
    }
    
    function previewMint(uint256 shares) public pure returns (uint256) {
        return convertToAssets(shares);
    }
    
    function previewWithdraw(uint256 assets) public pure returns (uint256) {
        return convertToShares(assets);
    }
    
    function previewRedeem(uint256 shares) public pure returns (uint256) {
        return convertToAssets(shares);
    }
    
    function deposit(uint256 assets, address receiver) external returns (uint256) {
        require(assets > 0, "ZERO_ASSETS");
        
        uint256 shares = previewDeposit(assets);
        _mint(receiver, shares);
        
        // Transfer assets from caller to this vault
        asset.transferFrom(msg.sender, address(this), assets);
        _totalAssets += assets;
        
        emit Deposit(msg.sender, receiver, assets, shares);
        return shares;
    }
    
    function mint(uint256 shares, address receiver) external returns (uint256) {
        require(shares > 0, "ZERO_SHARES");
        
        uint256 assets = previewMint(shares);
        _mint(receiver, shares);
        
        // Transfer assets from caller to this vault
        asset.transferFrom(msg.sender, address(this), assets);
        _totalAssets += assets;
        
        emit Deposit(msg.sender, receiver, assets, shares);
        return assets;
    }
    
    function withdraw(uint256 assets, address receiver, address owner) external returns (uint256) {
        require(assets > 0, "ZERO_ASSETS");
        
        uint256 shares = previewWithdraw(assets);
        _burn(owner, shares);
        
        _totalAssets -= assets;
        
        // Transfer assets to receiver
        asset.transfer(receiver, assets);
        
        emit Withdraw(msg.sender, receiver, owner, assets, shares);
        return shares;
    }
    
    function redeem(uint256 shares, address receiver, address owner) external returns (uint256) {
        require(shares > 0, "ZERO_SHARES");
        
        uint256 assets = previewRedeem(shares);
        _burn(owner, shares);
        
        _totalAssets -= assets;
        
        // Transfer assets to receiver
        asset.transfer(receiver, assets);
        
        emit Withdraw(msg.sender, receiver, owner, assets, shares);
        return assets;
    }
}
