import React from "react";
import styles from "./Deal.module.css";
import { DEAL_STATE, Deal } from "../../lukso/types/deal";
import { Web3Button, useContract, useContractWrite } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { useConnectWallet } from "@web3-onboard/react";

type Props = {
  deal: Deal;
};

export default function DealComponent({ deal }: Props) {
  const [{ wallet }] = useConnectWallet();
  const contractAddress = "0x9A3eD23d58F73881c39B860Da75969e709A68cF7"!;
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
    debugger;
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_LUKSO_RPC_URL
    );
    const contract = new ethers.Contract(
      contractAddress,
      contractABI.abi,
      provider
    );
    const encodedData = contract.interface.encodeFunctionData("acceptOffer", [
      0,
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
    debugger;
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
