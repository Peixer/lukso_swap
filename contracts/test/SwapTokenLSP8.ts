import { expect } from "chai";
import { ethers } from "hardhat";
import { SwapToken, BasicNFTCollection } from "../typechain-types";

describe("SwapToken", function () {
  let swapContractDeployed: SwapToken;
  let tokenContractDeployed: BasicNFTCollection;

  beforeEach(async () => {
    const [owner, seller, buyer] = await ethers.getSigners();

    const tokenContractFactory = await ethers.getContractFactory(
      "BasicNFTCollection"
    );
    tokenContractDeployed = await tokenContractFactory.deploy(
      "nftCollectionName",
      "nftCollectionSymbol",
      owner.address
    );
    const swapContractFactory = await ethers.getContractFactory("SwapToken");
    swapContractDeployed = await swapContractFactory.deploy();

    // seller acquire token 0
    await tokenContractDeployed.mint(
      seller.address,
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      true,
      "0x"
    );
    // buyer acquire token 1 and 2
    await tokenContractDeployed.mint(
      buyer.address,
      "0x0000000000000000000000000000000000000000000000000000000000000001",
      true,
      "0x"
    );
    await tokenContractDeployed.mint(
      buyer.address,
      "0x0000000000000000000000000000000000000000000000000000000000000002",
      true,
      "0x"
    );

    // Approve swapify to spend token 0
    await tokenContractDeployed
      .connect(seller)
      .authorizeOperator(
        await swapContractDeployed.getAddress(),
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x"
      );

    //  Approve swapify to spend token 0
    await tokenContractDeployed
      .connect(buyer)
      .authorizeOperator(
        await swapContractDeployed.getAddress(),
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        "0x"
      );
    await tokenContractDeployed
      .connect(buyer)
      .authorizeOperator(
        await swapContractDeployed.getAddress(),
        "0x0000000000000000000000000000000000000000000000000000000000000002",
        "0x"
      );
  });

  it("Should swap NFTs between accounts", async function () {
    const [owner, seller, buyer] = await ethers.getSigners();
    const contractAddress = await tokenContractDeployed.getAddress();
    const contractAddress2 = await swapContractDeployed.getAddress();

    console.log("seller", seller.address);
    console.log("buyer", buyer.address);
    console.log("contractAddress", contractAddress);
    console.log("contractAddress2", contractAddress2);
    const tx = await swapContractDeployed
      .connect(seller)
      .createSwap(
        "My swap",
        buyer.address,
        [contractAddress],
        ["0x0000000000000000000000000000000000000000000000000000000000000000"],
        [contractAddress, contractAddress],
        [
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          "0x0000000000000000000000000000000000000000000000000000000000000002",
        ]
      );

    await expect(tx)
      .to.emit(swapContractDeployed, "SwapCreated")
      .withArgs(0, seller.address);

    await swapContractDeployed.connect(buyer).acceptOffer(0);

    expect(
      await tokenContractDeployed.tokenOwnerOf(
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      )
    ).to.equal(buyer.address);
    expect(
      await tokenContractDeployed.tokenOwnerOf(
        "0x0000000000000000000000000000000000000000000000000000000000000001"
      )
    ).to.equal(seller.address);
    expect(
      await tokenContractDeployed.tokenOwnerOf(
        "0x0000000000000000000000000000000000000000000000000000000000000002"
      )
    ).to.equal(seller.address);
  });
});
