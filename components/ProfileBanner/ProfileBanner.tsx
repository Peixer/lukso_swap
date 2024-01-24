import Image from "next/image";
import styles from "./ProfileBanner.module.css";
import { useProfile } from "../../lukso/fetchProfile";
import { useEffect, useState } from "react";
import { IPFS_URL } from "../../util/config";

/**
 * Profile banner showed during the deal creation process.
 */
type Props = {
  address: string;
};

export function ProfileBanner({address}: Props) {

  const [bannerImageURL, setBannerImageURL] = useState<string>('/nodata.png');
  const [iconImageURL, setIconImageURL] = useState<string>('/nodata.png');
  const [bannerImageError, setBannerImageError] = useState(false);
  const [iconImageError, setIconImageError] = useState(false);
  const [userAddress, setUserAddress] = useState<string>("");
  const [user] = useProfile(userAddress);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(user.address);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const imageIpfsGateway = IPFS_URL;

  useEffect(() => {
    if (address) {
      if(address !== userAddress){
        setBannerImageError(false);
        setIconImageError(false);
      }
      setUserAddress(address);
    }
  }, [address]);

  useEffect(() => {
    if (user.backgroundImage.length > 0) {
      setBannerImageURL(`${imageIpfsGateway}${user.backgroundImage[0].url.slice(7)}`);
    }
    if (user.profileImage.length > 0) {
      setIconImageURL(`${imageIpfsGateway}${user.profileImage[0].url.slice(7)}`);
    }
  }, [user.backgroundImage, user.profileImage]);
  
  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileInnerContainer}>
        {/* Banner Image */}
        <Image
          src={bannerImageError ? '/nodata.png' : bannerImageURL}
          alt="Profile Banner"
          fill
          style={{
            objectFit: 'fill',
          }}
          onError={(event) => setBannerImageError(true)}
        />

        {/* Profile Icon (Overlay) */}
        <div className={styles.profileIconContainer}>
          <Image
            src={iconImageError ? '/nodata.png' : iconImageURL}
            alt="Profile Icon"
            width={150}
            height={150}
            className={styles.profileIconImage}
            onError={(event) => setIconImageError(true)}
          />
        </div>
      </div>
      <div className={styles.userInfoContainer}>
        <span className={styles.userName}>@{user.name}#{user.address.substr(2, 4)}</span><br/>
        <span>{user.address.slice(0, 6)}...{user.address.slice(-6)}</span>
        <Image
            className={styles.copyclipIcon}
            onClick={copyToClipboard}
            src={'/copyclip.svg'}
            alt="CopyClip Icons"
            width={15}
            height={15}
          />
      </div>
    </div>
  );
}
