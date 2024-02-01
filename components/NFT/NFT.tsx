import React, { useEffect, useState } from "react";
import Image from 'next/image';
import styles from "./NFT.module.css";
import { ASSET_STANDARD, Asset } from "../../lukso/types/asset";
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
        const imageURL = nft.metadata.images[0][0]?.url ?? '/nodata.png';
        if(imageURL.startsWith("ipfs")){
          setImageURL(`${imageIpfsGateway}${imageURL.slice(7)}`);
        } else{
          setImageURL(imageURL);
        }
      } 
  
      // Set the icon URL
      if (nft?.metadata?.icon && nft?.metadata?.icon[0]) {
        const iconURL = nft.metadata.icon[0].url;
        if(iconURL.startsWith("ipfs")){
          setIconURL(`${iconIpfsGateway}${iconURL.slice(7)}`);
        } else{
          setIconURL(iconURL);
        }
      }
    }, [nft]);

  return (
    <div className={styles.nftImageContainer}>

      {/* Display the image using next/image component */}
      {imageURL && (
        <div>
          <Image className={styles.nftImage} src={imageURL} alt="Asset Image" width={184} height={184} />
        </div>
      )}

      <div className={styles.dataContainer}>
        <div>
          <p className={styles.nftName}>{nft.name} 
            <span className={styles.nftTokenId}>
              <span className={styles.nftTokenInfo}>{nft.contractStandard === ASSET_STANDARD.LSP7 ? `${parseInt(nft.amount, 16)} owned` : (Number(nft.tokenId) < 10000000000000 ? `#${Number(nft.tokenId)}` : nft.tokenId.slice(0,3)+".."+nft.tokenId.slice(-2))}</span>
            </span>
          </p>
          <span className={styles.nftSymbol}>${nft.symbol}</span>
          <p className={styles.nftTokenId}>
          </p>
        </div>
        {nft.metadata?.description ? (<span>{nft.metadata?.description && nft.metadata?.description.length > 60 ? `${nft.metadata?.description.slice(0, 60)}...` : nft.metadata?.description}</span>) : (<span>No description available.</span>)}
      </div>

    </div>
  );
}
