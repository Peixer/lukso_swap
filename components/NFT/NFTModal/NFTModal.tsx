import React, { useEffect, useState } from "react";
import Image from 'next/image';
import styles from "./NFTModal.module.css";
import { NETWORKS } from "../../../util/config";
import { Asset } from "../../../lukso/types/asset";
import { NFTModalInfoCard } from "./NFTModalInfoCard";
import { useConnectWallet } from "@web3-onboard/react";
import { getBlockchainName } from "../../../util/network";
import { LoadingSpinner } from "../../LoadingSpinner/LoadingSpinner";

type Props = {
  nft: Asset;
  onClose: () => void;
};

export default function NFTModal({ nft, onClose }: Props) {
    // State to store the image and icon URLs
    const [imageURL, setImageURL] = useState<string>('/nodata.png');
    const [iconURL, setIconURL] = useState<string>('/nodata.png');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const [{ wallet }] = useConnectWallet();

    const closeModal = () => {
      setIsModalOpen(false);
      onClose(); 
    };

    useEffect(() => {
        // Open the modal by default
        setIsModalOpen(true);
    }, []);
  
    useEffect(() => {
      setLoading(true);
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

      setLoading(false);
    }, [nft]);

    if (!isModalOpen) {
        return null;
    }

    return (
      <>
        <div className={styles.modalContainer}>
          <div className={styles.modalInnerContainer}>  
            <button className={styles.closeButton} onClick={closeModal}>
                <span className={styles.cross}>&#10005;</span>
            </button>
            <div className={styles.modalDataContainer}>
                <div className={styles.nftImageContainer}>
                    {/* Display the image using next/image component */}
                    {imageURL && (
                        <div>
                        <Image className={styles.nftImage} src={imageURL} alt="Asset Image" width={300} height={300} />
                        </div>
                    )}
                </div>
                <div className={styles.dataContainer}>
                  <div className={styles.dataGeneralContainer}>
                    <p className={styles.nftName}>{nft.name}</p>
                    {nft.metadata?.name ? (<p className={styles.nftMetadataName}>{nft.metadata?.name && nft.metadata?.name.length > 60 ? `${nft.metadata?.name.slice(0, 60)}...` : nft.metadata?.name}</p>) : (<p>No name available.</p>)}
                    {nft.metadata?.description ? (<span className={styles.nftMetadataDescription}>{nft.metadata?.description && nft.metadata?.description.length > 60 ? `${nft.metadata?.description.slice(0, 60)}...` : nft.metadata?.description}</span>) : (<span>No description available.</span>)}
                  </div>
                  <div className={styles.dataAttributesContainer}>
                    <div>
                      <span className={styles.dataAttributesTitle}>Attributes ({nft.metadata?.attributes ? nft.metadata?.attributes.length : '0'})</span>
                    </div>
                    <div className={styles.dataAttributesInnerContainer}>
                      {nft.metadata?.attributes ? (nft.metadata.attributes.map((_, index) => (
                        <div key={index} className={styles.dataAttribute}>
                          <p className={styles.p}>{nft.metadata.attributes[index].key}</p>
                          <span>{nft.metadata.attributes[index].value}</span>
                        </div>
                      ))) : (
                        <span>No attributes to show</span>
                      )}
                    </div>
                  </div>
                  <NFTModalInfoCard
                    title="Asset details"
                    tokenId={nft.tokenId}
                    blockchain={getBlockchainName(wallet)}
                    tokenStandard={nft.contractStandard!.toString()}
                    contractAddress={nft.contractAddress}
                  />
                </div>
            </div>
          </div>   
        </div>
        <LoadingSpinner isLoading={loading} />
      </>
    );
}
