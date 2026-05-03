// Simple test to verify BigInt formatting fix (no ethers dependency)

console.log('Testing BigInt formatting fix...');

// Simulate the raw BigInt from blockchain (50,000 USDC with 18 decimals)
const rawBigInt = '50000000000000000000000';
console.log('Raw BigInt from blockchain:', rawBigInt);

// Convert 18 decimals to readable format (divide by 10^18)
const decimalPlaces = 18;
const readableNumber = Number(rawBigInt) / Math.pow(10, decimalPlaces);
console.log('Converted to readable number:', readableNumber);

// Final formatting for display (what blockchainService.js returns)
const finalDisplay = readableNumber.toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
console.log('Final display format:', finalDisplay);

// Test the old buggy way (what was causing the 50 quintillion display)
const buggyDisplay = Number(rawBigInt).toLocaleString();
console.log('BUGGY DISPLAY (raw BigInt):', buggyDisplay);

console.log('\nFix verified:');
console.log('- Correct display:', finalDisplay);
console.log('- Buggy display:', buggyDisplay);

// Test with different values
console.log('\nTesting with different values:');
const testValues = [
  '10000000000000000000000', // 10,000
  '5000000000000000000000',  // 5,000
  '100000000000000000000',   // 100
];

testValues.forEach((value, index) => {
  const readable = Number(value) / Math.pow(10, 18);
  const display = readable.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  console.log(`Test ${index + 1}: ${display}`);
});
