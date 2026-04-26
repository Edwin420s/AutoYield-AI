require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgradeable");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    og: {
      url: process.env.ZERO_G_RPC_URL || "https://rpc.0g.ai",
      chainId: 1666600000,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    },
  },
  etherscan: {
    apiKey: process.env.ZERO_G_API_KEY,
    customChains: [
      {
        network: "og",
        chainId: 1666600000,
        urls: {
          apiURL: "https://explorer.0g.ai/api",
          browserURL: "https://explorer.0g.ai",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};
