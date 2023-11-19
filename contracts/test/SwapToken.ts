import { expect } from "chai";
import { ethers } from "hardhat";
import { SwapToken, MyToken } from "../typechain-types";

describe("SwapToken", function () {
  let swapContractDeployed: SwapToken;
  let tokenContractDeployed: MyToken;

  beforeEach(async () => {
    const [owner, seller, buyer] = await ethers.getSigners();
    tokenContractDeployed = await ethers.deployContract("MyToken", {
      signer: owner,
    });
    swapContractDeployed = await ethers.deployContract("SwapToken", {
      signer: owner,
    });

    // seller acquire token 0
    await tokenContractDeployed.safeMint(seller.address, 0);
    // buyer acquire token 1 and 2
    await tokenContractDeployed.safeMint(buyer.address, 1);
    await tokenContractDeployed.safeMint(buyer.address, 2);

    // Approve swapify to spend token 0
    await tokenContractDeployed
      .connect(seller)
      .approve(swapContractDeployed.getAddress(), 0);
    //  Approve swapify to spend token 0
    await tokenContractDeployed
      .connect(buyer)
      .approve(swapContractDeployed.getAddress(), 1);
    await tokenContractDeployed
      .connect(buyer)
      .approve(swapContractDeployed.getAddress(), 2);
  });

  it("Should swap NFTs between accounts", async function () {
    const [owner, seller, buyer] = await ethers.getSigners();
    const contractAddress = await tokenContractDeployed.getAddress();
    const tx = await swapContractDeployed
      .connect(seller)
      .createSwap(
        "My swap",
        buyer.address,
        [contractAddress],
        [0],
        [contractAddress, contractAddress],
        [1, 2]
      );

    await expect(tx)
      .to.emit(swapContractDeployed, "SwapCreated")
      .withArgs(
        0,
        seller.address,
        [contractAddress],
        [0],
        buyer.address,
        [contractAddress, contractAddress],
        [1, 2]
      );

    await swapContractDeployed.connect(buyer).acceptOffer(0);

    expect(await tokenContractDeployed.ownerOf(0)).to.equal(buyer.address);
    expect(await tokenContractDeployed.ownerOf(1)).to.equal(seller.address);
    expect(await tokenContractDeployed.ownerOf(2)).to.equal(seller.address);
  });

  // it("Should not be able to swap if not owner of token", async function () {
  //   const [owner, seller, buyer] = await ethers.getSigners();
  //   const contractAddress = await tokenContractDeployed.getAddress();
  //   const tx = await swapContractDeployed
  //     .connect(seller)
  //     .createSwap(
  //       "My swap",
  //       buyer.address,
  //       [contractAddress, contractAddress],
  //       [0, 2],
  //       [contractAddress, contractAddress],
  //       [1, 2]
  //     );
  // });
  // should not be able to swap if not owner of token
  // should not be able to swap if not approved
});
