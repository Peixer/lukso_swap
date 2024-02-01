import { WalletState } from "@web3-onboard/core";
import LSP7Mintable from "@lukso/lsp-smart-contracts/artifacts/LSP7Mintable.json";
import LSP8Mintable from "@lukso/lsp-smart-contracts/artifacts/LSP8Mintable.json";
import { ethers } from "ethers";
import { getSwapContractAddress } from "./network";
import { Uint256 } from "web3";

export const checkLSP8AuthorizeOperator = async (
    wallet: WalletState,
    token: any,
    tokenId: any,
    provider: any
  ) => {
    const contractAddress = getSwapContractAddress(wallet);
    const LSP8Token = new ethers.Contract(token, LSP8Mintable.abi, provider);

    const isOperatorFor = await LSP8Token.functions.isOperatorFor(
      contractAddress,
      tokenId
    );
    if (!isOperatorFor[0]) {
      const encodedDataApprove = LSP8Token.interface.encodeFunctionData(
        "authorizeOperator",
        [contractAddress, tokenId, "0x"]
      );

      const hash: any = await wallet!.provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: wallet!.accounts[0].address,
            to: token,
            data: encodedDataApprove,
          },
        ],
      });
      await provider.waitForTransaction(hash);
    }
};

export const checkLSP7AuthorizeOperator = async (
    wallet: WalletState,
    token: any,
    amount: Uint256,
    provider: any
  ) => {
    const contractAddress = getSwapContractAddress(wallet);
    const LSP7Token = new ethers.Contract(token, LSP7Mintable.abi, provider);

    const authorizedAmountFor = await LSP7Token.functions.authorizedAmountFor(
      contractAddress,
      wallet.accounts[0].address
    );
    if (Number(authorizedAmountFor[0]._hex) < 1) {
      const encodedDataApprove = LSP7Token.interface.encodeFunctionData(
        "authorizeOperator",
        [contractAddress, amount, "0x"]
      );

      const hash: any = await wallet!.provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: wallet!.accounts[0].address,
            to: token,
            data: encodedDataApprove,
          },
        ],
      });
      await provider.waitForTransaction(hash);
    }
  };