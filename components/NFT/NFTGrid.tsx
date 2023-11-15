import React, { useState } from "react";
import Skeleton from "../Skeleton/Skeleton";
import NFT from "./NFT";
import styles from "../../styles/Create.module.css";
import { Asset } from "../../lukso/types/asset";

type Props = {
  isLoading: boolean;
  data: Asset[] | undefined;
  overrideOnclickBehavior?: (nft: Asset) => void;
  emptyText?: string;
};

export default function NFTGrid({
  isLoading,
  data,
  overrideOnclickBehavior,
  emptyText = "No NFTs found for this address.",
}: Props) {
  const [selectedNFTs, setSelectedNFTs] = useState<string[]>([]);

  const handleNFTClick = (contractAddress: string) => {
    // Toggle selection
    if (selectedNFTs.includes(contractAddress)) {
      setSelectedNFTs((prevSelected) =>
        prevSelected.filter((address) => address !== contractAddress)
      );
    } else {
      setSelectedNFTs((prevSelected) => [...prevSelected, contractAddress]);
    }
  };

  return (
    <div className={styles.nftGridContainer}>
      {isLoading ? (
        [...Array(20)].map((_, index) => (
          <div key={index} className={styles.nftContainer}>
            <Skeleton key={index} width={"100%"} height="312px" />
          </div>
        ))
      ) : data && data.length > 0 ? (
        data.map((nft) => (
          <div
            key={nft.contractAddress}
            className={`${styles.nftContainer} ${
              selectedNFTs.includes(nft.contractAddress)
                ? styles.nftSelected
                : ""
            }`}
            onClick={() => {
              handleNFTClick(nft.contractAddress);
              if (overrideOnclickBehavior) {
                overrideOnclickBehavior(nft);
              }
            }}
          >
            <NFT nft={nft} />
          </div>
        ))
      ) : (
        <p>{emptyText}</p>
      )}
    </div>
  );
}
