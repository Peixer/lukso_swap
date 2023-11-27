import React from "react";
import styles from "./Deal.module.css";
import { DEAL_STATE, Deal } from "../../lukso/types/deal";
import { ethers } from "ethers";
import { useConnectWallet } from "@web3-onboard/react";
import LSP8Mintable from "@lukso/lsp-smart-contracts/artifacts/LSP8Mintable.json";

type Props = {
  deal: Deal;
};

export default function DealComponent({ deal }: Props) {
  const [{ wallet }] = useConnectWallet();
  const contractAddress = "0x581ad93A9FEA22c81e763Be8b3bE88bb7793ce4B"!;
  const contractABI = require("../../contract-abi.json");

  const dealStateClass = (state: DEAL_STATE) => {
    switch (state) {
      case DEAL_STATE.PENDING:
        return `${styles.dealState} ${styles.dealStatePending}`;
      case DEAL_STATE.ACCEPTED:
        return `${styles.dealState} ${styles.dealStateAccepted}`;
      case DEAL_STATE.REJECTED:
        return `${styles.dealState} ${styles.dealStateRejected}`;
      default:
        return styles.dealState; // Default class when state doesn't match any case
    }
  };

  async function acceptOffer(deal: Deal) {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_LUKSO_RPC_URL
    );

    const targetTokenIds = deal.users[1].assets.map((asset) => asset.tokenId);
    const targetTokens = deal.users[1].assets.map(
      (asset) => asset.contractAddress
    );

    for (let i = 0; i < targetTokenIds.length; i++) {
      const myToken = new ethers.Contract(
        targetTokens[i],
        LSP8Mintable.abi,
        provider
      );
      const encodedDataApprove = myToken.interface.encodeFunctionData(
        "authorizeOperator",
        [contractAddress, targetTokenIds[i], "0x"]
      );

      const hash: any = await wallet!.provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: wallet!.accounts[0].address,
            to: targetTokens[i],
            data: encodedDataApprove,
          },
        ],
      });

      await provider.waitForTransaction(hash);
    }

    const contract = new ethers.Contract(
      contractAddress,
      contractABI.abi,
      provider
    );

    const encodedData = contract.interface.encodeFunctionData("acceptOffer", [
      parseInt(deal.id!),
    ]);
    await wallet!.provider.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: wallet!.accounts[0].address,
          to: contractAddress,
          data: encodedData,
        },
      ],
    });
  }

  async function rejectOffer(deal: Deal) {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_LUKSO_RPC_URL
    );
    const contract = new ethers.Contract(
      contractAddress,
      contractABI.abi,
      provider
    );
    const encodedData = contract.interface.encodeFunctionData("cancelOffer", [
      deal.id,
    ]);
    await wallet!.provider.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: wallet!.accounts[0].address,
          to: contractAddress,
          data: encodedData,
        },
      ],
    });
  }

  return (
    <div className={styles.dealContainer}>
      <div className={styles.dealDataContainer}>
        <div className={dealStateClass(deal.state)}>
          <span>{deal.state}</span>
        </div>
        <p className={styles.nftName}>
          {deal.users[0].name} ({deal.users[0].assets.length} item
          {deal.users[0].assets.length > 0 ? "s" : ""})
        </p>
        <p className={styles.nftName}>
          {deal.users[1].name} ({deal.users[1].assets.length} item
          {deal.users[1].assets.length > 0 ? "s" : ""})
        </p>
      </div>
      {deal.state === DEAL_STATE.PENDING ? (
        <div className={styles.dealActionContainer}>
          <button onClick={() => acceptOffer(deal)}>Accept</button>
          <button onClick={() => rejectOffer(deal)}>Reject</button>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
