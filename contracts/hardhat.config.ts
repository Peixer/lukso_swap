import { HardhatUserConfig } from "hardhat/config";
import { config as LoadEnv } from "dotenv";
import "@nomicfoundation/hardhat-toolbox";

LoadEnv();

const config: HardhatUserConfig = {
  networks: {
    luksoTestnet: {
      url: "https://rpc.testnet.lukso.gateway.fm",
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
};

export default config;
