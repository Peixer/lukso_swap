import { useState } from "react";
import styles from "./NFTModalInfoCard.module.css";
import { getExplorerLink } from "../../../util/network";

/**
 * NFTModalInfoCard
 */
type Props = {
  title: string;
  tokenId: string;
  blockchain: string;
  tokenStandard: string;
  contractAddress: string;
};

export function NFTModalInfoCard({ title, tokenId, blockchain, tokenStandard, contractAddress  }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`${styles.nftModalContainer} ${isExpanded ? styles.expanded : ''}`}>
      <div className={styles.nftModalHeader} onClick={toggleExpansion}>
        <h4 className={styles.nftModalTitle}>{title}</h4>
        <div className={`${styles.arrow} ${isExpanded ? styles.up : styles.down}`}></div>
      </div>
      {isExpanded ? (<div className={styles.assetDetailsContainer}>
        <div className={styles.assetDetailsLeft}>
            <p><b>Token ID</b></p>
            <p>Blockchain</p>
            <p>Token Standard</p>
            <p>Contract Address</p>
        </div>
        <div className={styles.assetDetailsRight}>
            <p><b>{`${tokenId.slice(0, 4)}...${tokenId.slice(62)}`}</b></p>
            <p>{blockchain}</p>
            <p>{tokenStandard}</p>
            <p>
                <a  href={getExplorerLink(contractAddress, blockchain)} 
                    target="_blank"
                    className={styles.contractAddressLink}>
                    {`${contractAddress.slice(0, 4)}...${contractAddress.slice(38)}`}
                </a>
            </p>
        </div>
      </div>) : (<></>)}
    </div>
  );
}
