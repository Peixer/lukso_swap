import { ethers } from "hardhat";
import * as dotenv from 'dotenv';
import { SwapToken__factory } from "../typechain-types";

dotenv.config();

async function main() {  
  const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) throw new Error("Invalid RPC URL");
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const lastBlock = await provider.getBlock("latest");
    console.log(`The latest block number is \n`);
    console.log({lastBlock});

    const private_key = process.env.PRIVATE_KEY;
    if (!private_key || private_key.length != 64) throw new Error ("Invalid private key");
    const deployer = new ethers.Wallet(private_key, provider);
    const balance = await provider.getBalance(deployer.address);
    console.log(`The address of the deployer is ${deployer.address}`);
    console.log(`${balance} BASE goerli`);

    const nftFactory = new SwapToken__factory(deployer);
    const nftContract = await nftFactory.deploy();
    const nftContractAddress = await nftContract.address;
    console.log(`The NFT contract address is ${nftContractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
