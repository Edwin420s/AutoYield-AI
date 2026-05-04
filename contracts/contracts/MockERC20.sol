// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
  constructor() ERC20("Mock USDC", "mUSDC") {
    // Mint 1M tokens to deployer for testing
    // FIXED: Use 6 decimals like real USDC to prevent decimal mismatch
    _mint(msg.sender, 1000000 * 10**6);
  }
  
  /**
   * @dev Override decimals to return 6 like real USDC
   * This prevents the 1000x magnitude error in production
   */
  function decimals() public view virtual override returns (uint8) {
    return 6;
  }
}
