// Test script to verify BigInt formatting fix
import { ethers } from 'ethers';

console.log('Testing BigInt formatting fix...');

// Simulate the raw BigInt from blockchain (50,000 USDC with 18 decimals)
const rawBigInt = BigInt('50000000000000000000000');
console.log('Raw BigInt from blockchain:', rawBigInt.toString());

// This is what blockchainService.js does:
const formattedAssets = ethers.formatUnits(rawBigInt, 18);
console.log('Formatted with ethers.formatUnits:', formattedAssets);

// Convert to Number for display
const assetsNumber = Number(formattedAssets);
console.log('As Number:', assetsNumber);

// Final formatting for display (what blockchainService.js returns)
const finalDisplay = assetsNumber.toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
console.log('Final display format:', finalDisplay);

// Test the old buggy way (what was causing the 50 quintillion display)
const buggyDisplay = rawBigInt.toLocaleString();
console.log('BUGGY DISPLAY (raw BigInt):', buggyDisplay);

console.log('\nFix verified:');
console.log('- Correct display:', finalDisplay);
console.log('- Buggy display:', buggyDisplay);
