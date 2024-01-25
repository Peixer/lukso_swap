import { HardhatUserConfig } from "hardhat/types";
import { config as LoadEnv } from "dotenv";
import "@nomicfoundation/hardhat-toolbox";

LoadEnv();

const config: HardhatUserConfig = {
  networks: {
    luksoTestnet: {
      url: "https://rpc.testnet.lukso.network",
      chainId: 4201,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    hardhat: {},
    localhost: {
      url: process.env.RPC_URL,
    },
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
    // no API is required to verify contracts
    // via the Blockscout instance of LUKSO Testnet
    apiKey: "no-api-key-needed",
    customChains: [
      {
        network: "luksoTestnet",
        chainId: 4201,
        urls: {
          apiURL: "https://explorer.execution.testnet.lukso.network/api",
          browserURL: "https://explorer.execution.testnet.lukso.network",
        },
      },
    ],
  },
};

export default config;
