import React, { useState } from "react";
import Skeleton from "../Skeleton/Skeleton";
import NFT from "./NFT";
import styles from "../../styles/NFTGrid.module.css";
import { Asset } from "../../lukso/types/asset";
import Link from "next/link";
import NFTModal from "./NFTModal/NFTModal";

type Props = {
  data: any;
  overrideOnclickBehavior?: (nft: Asset) => void;
  emptyText?: string;
  selectedNFTs?: Asset[];
};

export default function NFTGrid({
  data,
  overrideOnclickBehavior,
  emptyText = "No NFTs found for this address.",
  selectedNFTs,
}: Props) {
  const [selectedNFT, setSelectedNFT] = useState(null);
  
  return (
    <div className={styles.nftGridContainer}>
      {data === undefined ? (
        [...Array(20)].map((_, index) => (
          <div key={index} className={styles.nftContainer}>
            <Skeleton key={index} width={"100%"} height="312px" />
          </div>
        ))
      ) : data && data.length > 0 ? (
        data.map((nft: any) => {
          const isSelected = selectedNFTs?.some((selectedNFT) => (selectedNFT.contractAddress === nft.contractAddress) && (selectedNFT.tokenId === nft.tokenId));
          return (<>
              <div
                key={nft.contractAddress+nft.tokenId}
                className={`${styles.nftContainer} ${isSelected ? styles.nftSelected : ""}`}
              >
                <div onClick={() => {
                  if (overrideOnclickBehavior) {
                    overrideOnclickBehavior(nft);
                  }
                }}>
                  <NFT nft={nft} />
                </div>
                <button className={styles.showInfoButton} onClick={() => setSelectedNFT(nft)}>Show Info</button>
              </div>
            </>
          );
        })
      ) : (
        <>              
          <span>{emptyText}</span>
            <Link href="/" className={styles.nftGridEmpty}>
                Navigate back to home screen.
            </Link>
        </>
      )}
    {selectedNFT && <NFTModal nft={selectedNFT} onClose={() => setSelectedNFT(null)} />}
    </div>
  );
}
