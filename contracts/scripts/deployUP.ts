import hre from "hardhat";
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as LSP0ABI from "@lukso/lsp-smart-contracts/artifacts/LSP0ERC725Account.json";

// load env vars
dotenv.config();

async function main() {
  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl) throw new Error("Invalid RPC URL");
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
  console.log("Deploying contracts with EOA: ", signer.address);

  // load the associated UP
  const UP = new ethers.Contract(
    process.env.UP_ADDR as string,
    LSP0ABI.abi,
    signer
  );

  /**
   * Custom LSP7 Token
   */
  const CustomTokenBytecode =
    hre.artifacts.readArtifactSync("SwapToken").bytecode;
  const [owner, addr1, addr2] = await ethers.getSigners();
  // get the address of the contract that will be created
  const CustomTokenAddress = await UP.connect(signer)
    .getFunction("execute")
    .staticCall(1, owner, 0, CustomTokenBytecode);

  // deploy CustomLSP7 as the UP (signed by the browser extension controller)
  const tx1 = await UP.connect(signer).getFunction("execute")(
    1,
    owner,
    0,
    CustomTokenBytecode
  );

  await tx1.wait();

  console.log("Custom token address: ", CustomTokenAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
