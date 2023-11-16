import React, { useEffect, useState } from "react";
import Image from 'next/image';
import styles from "./NFT.module.css";
import { Asset } from "../../lukso/types/asset";
import { NETWORKS } from "../../util/config";

type Props = {
  nft: Asset;
};

export default function NFTComponent({ nft }: Props) {

    // State to store the image and icon URLs
    const [imageURL, setImageURL] = useState<string>('/nodata.png');
    const [iconURL, setIconURL] = useState<string>('/nodata.png');
  
    useEffect(() => {
      // Getting the ipfs gateway
      const iconIpfsGateway = NETWORKS.l16.iconIpfs.url;
      const imageIpfsGateway = NETWORKS.l16.imageIpfs.url;
  
      // Set the image URL
      if (nft?.metadata?.images && nft?.metadata?.images[0]) {
        const imageURL = nft.metadata.images[0][0].url;
        setImageURL(`${imageIpfsGateway}${imageURL.slice(7)}`);
      } 
  
      // Set the icon URL
      if (nft?.metadata?.icon && nft?.metadata?.icon[0]) {
        const iconURL = nft.metadata.icon[0].url;
        setIconURL(`${iconIpfsGateway}${iconURL.slice(7)}`);
      }
    }, [nft]);

  return (
    <div className={styles.nftImage}>

      {/* Display the image using next/image component */}
      {imageURL && (
        <div>
          <Image src={imageURL} alt="Asset Image" width={184} height={184} />
        </div>
      )}

      <div className={styles.dataContainer}>
        <p className={styles.nftTokenId}>${nft.symbol}</p>
        <p className={styles.nftName}>{nft.name}</p>
      </div>

    </div>
  );
}
