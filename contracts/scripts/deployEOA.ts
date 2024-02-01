import { ethers, run } from "hardhat";
import * as dotenv from 'dotenv';
import { SwapToken__factory } from "../typechain-types";

dotenv.config();

async function main() {  
  const rpcUrl = process.env.LUKSO_RPC_URL;
    if (!rpcUrl) throw new Error("Invalid RPC URL");
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const private_key = process.env.PRIVATE_KEY;
    if (!private_key || private_key.length != 64) throw new Error ("Invalid private key");
    const deployer = new ethers.Wallet(private_key, provider);
    console.log(`The address of the deployer is ${deployer.address}`);

    const nftFactory = new SwapToken__factory(deployer);
    const nftContract = await nftFactory.deploy();
    const nftContractAddress = await nftContract.getAddress();
    console.log(`The NFT contract address is ${nftContractAddress}`);

    console.log(`Verifying contract on Etherscan...`);

    await run(`verify:verify`, {
      address: nftContractAddress,
      constructorArguments: [],
    });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
