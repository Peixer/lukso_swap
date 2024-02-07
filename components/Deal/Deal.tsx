import React, { useEffect, useState } from "react";
import styles from "./Deal.module.css";
import Image from 'next/image';
import { DEAL_STATE, Deal, DealUser } from "../../lukso/types/deal";
import { ethers } from "ethers";
import { useConnectWallet } from "@web3-onboard/react";
import { getSwapContractAddress, getWalletProvider } from "../../util/network";
import { checkLSP7AuthorizeOperator, checkLSP8AuthorizeOperator } from "../../util/checkAuthorizeOperator";
import { IPFS_URL } from "../../util/config";
import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner";
import { Asset, Metadata } from "../../lukso/types/asset";
import { fetchLsp8Metadata } from "../../lukso/fetchLsp8Metadata";
import { fetchLsp7Metadata } from "../../lukso/fetchLSP7Metadata";
import { useProfile } from "../../lukso/fetchProfile";

type Props = {
  deal: Deal;
};

export default function DealComponent({ deal }: Props) {
  const getImageUrl = (assetMetadata: Metadata) => {
    let imageURL = "/nodata.png";
    if (assetMetadata?.images && assetMetadata?.images[0]) {
      imageURL = assetMetadata.images[0][0]?.url ?? "/nodata.png";
      if(imageURL.startsWith("ipfs")){
        return `${IPFS_URL}${imageURL.slice(7)}`;
      } 
    }
    return imageURL;
  }

  const [{ wallet }] = useConnectWallet();
  const [user] = useProfile(wallet?.accounts[0].address as string);
  const [tradeUser] = useProfile(deal.users[0].address as string);
  const [iconImageURL, setIconImageURL] = useState<string>("/nodata.png");
  const [loading, setLoading] = useState(false);
  const [leftImage, setLeftImage] = useState<string>(getImageUrl(deal.users[1].assets[0].metadata));
  const [rightImage, setRightImage] = useState<string>(getImageUrl(deal.users[0].assets[0].metadata));
  const contractAddress = getSwapContractAddress(wallet);
  const contractABI = require("../../contract-abi.json");

  useEffect(() => {
    if (deal) {
      setLoading(true);
      // Create an array of promises
      const promises = deal.users.map(async (dealUser: DealUser) => {
        return Promise.all(dealUser.assets.map(async (asset: Asset) => {
          let assetMetadata;
          if(asset.contractStandard){
            assetMetadata = await fetchLsp8Metadata(asset.tokenId, asset.contractAddress, wallet);
          } else {
            assetMetadata = await fetchLsp7Metadata(asset.contractAddress, wallet);
          }
          asset.metadata = (assetMetadata[0] as { LSP4Metadata?: Metadata })?.LSP4Metadata as Metadata;
        }));
      });
  
      // Wait for all promises to resolve
      Promise.all(promises)
        .then(() => {
          // Once all promises are resolved, set the images
          setLeftImage(getImageUrl(deal.users[1].assets[0].metadata));
          setRightImage(getImageUrl(deal.users[0].assets[0].metadata));
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching metadata:", error);
          setLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    if (tradeUser.profileImage.length > 0) {
      setIconImageURL(`${IPFS_URL}${tradeUser.profileImage[0].url.slice(7)}`);
    }
  }, [tradeUser.profileImage]);

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
      getWalletProvider(wallet)
    );

    const targetTokenIds = deal.users[1].assets.map((asset) => asset.tokenId);
    const targetTokens = deal.users[1].assets.map(
      (asset) => asset.contractAddress
    );
    const targetTokenAmount = deal.users[1].assets.map((asset) => asset.amount);
    const targetTokenStandard = deal.users[1].assets.map((asset) => asset.contractStandard);

    for (let i = 0; i < targetTokenIds.length; i++) {
      if (targetTokenStandard[i]) {
        await checkLSP8AuthorizeOperator(
          wallet!,
          targetTokens[i],
          targetTokenIds[i],
          provider
        );
      } else {
        await checkLSP7AuthorizeOperator(
          wallet!,
          targetTokens[i],
          targetTokenAmount[i], 
          provider
        );
      }
    }

    const contract = new ethers.Contract(
      contractAddress!,
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
      getWalletProvider(wallet)
    );
    const contract = new ethers.Contract(
      contractAddress!,
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
    <>
      <div className={styles.dealContainer}>
        <div className={styles.dealDataContainer}>
          <div className={dealStateClass(deal.state)}>
            <span>{deal.state}</span>
          </div>
          <div className={styles.dealDataInnerContainer}>
            <div className={styles.dealImageContainer}>
              <Image src={leftImage} width={50} height={50} className={styles.dealImage} alt={String("/nodata.png")} />
              <Image src={"/swap.png"} width={40} height={35} alt={String("/swap.png")} />
              <Image src={rightImage} width={50} height={50} className={styles.dealImage} alt={String("/nodata.png")} />
            </div>
            <div className={styles.dealUserContainer}>
              <Image src={iconImageURL} width={50} height={50} className={styles.userImage} alt={String("/nodata.png")} />
              <div>
                <span className={styles.dealText}>Deal with <span className={styles.dealUserText}>@{tradeUser.name}#{tradeUser.address.substr(2, 4)}</span></span>
                <div className={styles.dealItemsContainer}>
                  <div>
                    <span>@{user.name}#{user.address.substr(2, 4)}</span>
                    <span className={styles.dealItemNumber}> ({deal.users[1].assets.length} item{deal.users[1].assets.length > 1 ? "s" : ""})</span>
                  </div>
                  <div className={styles.tradeUserText}>
                    <span>@{tradeUser.name}#{tradeUser.address.substr(2, 4)}</span>
                    <span className={styles.dealItemNumber}> ({deal.users[0].assets.length} item{deal.users[0].assets.length > 1 ? "s" : ""})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {deal.state === DEAL_STATE.PENDING ? (
          <div className={styles.dealActionContainer}>
            <button className={styles.acceptDealButton} onClick={() => acceptOffer(deal)}>Accept</button>
            <button className={styles.rejectDealButton} onClick={() => rejectOffer(deal)}>Reject</button>
          </div>
        ) : (
          <></>
        )}
      </div>
      <LoadingSpinner isLoading={loading} />
    </>
  );
}
