// Mock APY data – replace with real DeFi protocol APIs
export async function fetchAPYData() {
  return [
    { name: 'Aave', apy: 5.0, risk: 20 },
    { name: 'Benqi', apy: 8.1, risk: 40 },
    { name: 'Compound', apy: 4.2, risk: 15 }
  ];
}
