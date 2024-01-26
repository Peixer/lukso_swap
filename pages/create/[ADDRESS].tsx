// pages/create/[ADDRESS].tsx
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Container from "../../components/Container/Container";
import NFTGrid from "../../components/NFT/NFTGrid";
import { useAssets } from "../../lukso/fetchAssets";
import { ASSET_STANDARD, Asset } from "../../lukso/types/asset";
import styles from "./Create.module.css";
import { useConnectWallet } from "@web3-onboard/react";
import { DealUser } from "../../lukso/types/deal";
import { useProfile } from "../../lukso/fetchProfile";
import { ethers } from "ethers";
import Image from 'next/image';
import { ProfileBanner } from "../../components/ProfileBanner/ProfileBanner";
import { IPFS_URL } from "../../util/config";
import { DealModal } from "../../components/DealModal/DealModal";
import { getWalletProvider } from "../../util/network";
import { LoadingSpinner } from "../../components/LoadingSpinner/LoadingSpinner";
import { checkLSP7AuthorizeOperator, checkLSP8AuthorizeOperator } from "../../util/checkAuthorizeOperator";

export default function Create() {
  // Get wallet
  const [{ wallet }] = useConnectWallet();

  const router = useRouter();
  const [address, setAddress] = useState<string>("");

  const [user] = useProfile(wallet?.accounts[0].address as string);
  const [userInfoImageError, setUserInfoImageError] = useState(false);
  const [tradeUserAddress, setTradeUserAddress] = useState<string>("");
  const [tradeUserInfoImageError, setTradeUserInfoImageError] = useState(false);
  const [tradeUser] = useProfile(tradeUserAddress);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleAction = async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      getWalletProvider(wallet)
    );
    const contract = new ethers.Contract(
      contractAddress,
      contractABI.abi,
      provider
    );

    const ownerTokenIds = deal[1].assets.map((asset) => asset.tokenId);
    const ownerTokens = deal[1].assets.map((asset) => asset.contractAddress);
    const ownerTokenAmount = deal[1].assets.map((asset) => asset.amount);
    const ownerTokenStandard = deal[1].assets.map((asset) =>
      asset.contractStandard === ASSET_STANDARD.LSP8 ? true : false
    );

    const targetAccountTokenIds = deal[0].assets.map((asset) => asset.tokenId);
    const targetAccountTokens = deal[0].assets.map((asset) => asset.contractAddress);
    const targetAccountTokenAmount = deal[0].assets.map((asset) => asset.amount);
    const targetAccountTokenStandard = deal[0].assets.map((asset) =>
      asset.contractStandard === ASSET_STANDARD.LSP8 ? true : false
    );
    
    // Ensure all arrays have the same length
    if (
      ownerTokenIds.length !== ownerTokens.length ||
      ownerTokenIds.length !== ownerTokenAmount.length ||
      ownerTokenIds.length !== ownerTokenStandard.length
    ) {
      throw new Error("Arrays must have the same length");
    }

    if (
      targetAccountTokenIds.length !== targetAccountTokens.length ||
      targetAccountTokenIds.length !== targetAccountTokenAmount.length ||
      targetAccountTokenIds.length !== targetAccountTokenStandard.length
    ) {
      throw new Error("Arrays must have the same length");
    }
    
    for (let i = 0; i < ownerTokens.length; i++) {
      if (ownerTokenStandard[i]) {
        await checkLSP8AuthorizeOperator(
          wallet!,
          ownerTokens[i],
          ownerTokenIds[i],
          provider
        );
      } else {
        await checkLSP7AuthorizeOperator(
          wallet!,
          ownerTokens[i],
          ownerTokenAmount[i], // amount of LSP7 tokens selected
          provider
        );
      }
    }
    
    const encodedData = contract.interface.encodeFunctionData(
      "createSwap",
      [
        "Swap",
        deal[0].address,
        ownerTokens,
        ownerTokenIds,
        ownerTokenAmount,
        ownerTokenStandard,
        targetAccountTokens,
        targetAccountTokenIds,
        targetAccountTokenAmount,
        targetAccountTokenStandard,
      ]
    );
    
    if(wallet){
      await wallet.provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: wallet.accounts[0].address,
            to: contractAddress,
            data: encodedData,
          },
        ],
      });
    }

    router.push("/");
    closeModal();
  };

  const imageIpfsGateway = IPFS_URL;

  const contractABI = require("../../contract-abi.json");
  const contractAddress = String(process.env.NEXT_PUBLIC_TESTNET_CONTRACT_ADDRESS);

  useEffect(() => {
    if (router.query) {
      const { ADDRESS } = router.query;

      if (wallet && wallet.accounts[0].address !== (ADDRESS as string)) {
        setAddress(ADDRESS as string);
        setTradeUserAddress(ADDRESS as string);
      } else {
        router.push("/");
      }
    }
  }, [router, router.query, wallet]);

  // Load all of the NFTs from the given address
  const [assets, loading] = useAssets(address as string);
  const [deal, setDeal] = useState<DealUser[]>([]);
  const [step, setStep] = useState<number>(0);
  const [selectedNFTs, setSelectedNFTs] = useState<Asset[]>([]);

  const selectNFT = (nft: Asset) => {
    // Check if the NFT is already selected based on contractAddress
    const isSelected = selectedNFTs.some(
      (selectedNFT) =>
        selectedNFT.contractAddress === nft.contractAddress &&
        selectedNFT.tokenId === nft.tokenId
    );

    // Update the selectedNFTs list
    if (!isSelected) {
      // NFT is not selected, add it to the list
      setSelectedNFTs((prevSelectedNFTs) => [...prevSelectedNFTs, nft]);
    } else {
      // NFT is already selected, remove it from the list
      setSelectedNFTs((prevSelectedNFTs) =>
        prevSelectedNFTs.filter(
          (selectedNFT) =>
            selectedNFT.contractAddress !== nft.contractAddress ||
            (selectedNFT.contractAddress === nft.contractAddress &&
              selectedNFT.tokenId !== nft.tokenId)
        )
      );
    }

    // Force a re-render by updating the state
    setSelectedNFTs((prevSelectedNFTs) => [...prevSelectedNFTs]);
  };

  const handleNext = async () => {
    let dealUser = new DealUser(address, selectedNFTs);

    if (wallet) {
      if (step === 0) {
        deal[0] = dealUser;
        deal[0].name = tradeUser.name;
        setAddress(wallet?.accounts[0].address);

        if (deal.length > 1) {
          setSelectedNFTs(deal[1].assets);
        } else {
          setSelectedNFTs([]);
        }
      }

      if (step === 1) {
        deal[1] = dealUser;
        deal[1].name = user.name;
      }
    }

    setStep(step + 1);
  };

  return (
    <>
      <LoadingSpinner isLoading={loading} />
      <Container maxWidth="lg">
        <ProfileBanner address={address} />
        {step < 2 ? (
          <>
            <h1 className="mb-0">
              {step === 0 ? "Select their items" : "Select your items"}
            </h1>
            <p className="mt-0">
              You can only select items on the same chain. Not all items are
              eligible.
            </p>
            <NFTGrid
              data={assets}
              overrideOnclickBehavior={selectNFT}
              emptyText={"No NFTs found for this address."}
              selectedNFTs={selectedNFTs}
            />
          </>
        ) : (
          <>
            <div className={styles.dealTopContainer}>
              <h1 className="mb-0">
                Deal with <span className={styles.userName}>@{tradeUser.name}#{tradeUser.address.substr(2, 4)}</span>
              </h1>
              <span className={styles.tradeUserAddress}>{tradeUser.address}</span>
            </div>
            <div className={styles.dealBottomContainer}>
              <div className={styles.dealBottomLeftContainer}>
                <div className={styles.userInfoContainer}>
                  <Image 
                    className={styles.userInfoImage} 
                    src={userInfoImageError ? '/nodata.png' : `${imageIpfsGateway}${user.profileImage[0].url.slice(7)}`}
                    width={35} 
                    height={35} 
                    alt={String("userInfoImage")} 
                    onError={(event) => setUserInfoImageError(true)}
                  />
                  <h2>
                    {user.name}#{user.address.substr(2, 4)}
                  </h2>
                </div>
                <div className={styles.itemNumberContainer}>
                  <span className={styles.itemNumberText}>
                    {deal[1].assets.length} item
                    {deal[1].assets.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className={styles.dealNftContainer}>
                  <NFTGrid
                    data={deal[1].assets}
                    emptyText={"No NFTs found for this address."}
                  />
                </div>
              </div>
              <div className={styles.dealBottomRightContainer}>
                <div className={styles.userInfoContainer}>
                  <Image 
                    className={styles.userInfoImage} 
                    src={tradeUserInfoImageError ? '/nodata.png' : `${imageIpfsGateway}${tradeUser.profileImage[0].url.slice(7)}`}
                    width={35} 
                    height={35} 
                    alt={String("tradeUserInfoImage")} 
                    onError={(event) => setTradeUserInfoImageError(true)}
                  />
                  <h2>
                    {tradeUser.name}#{tradeUser.address.substr(2, 4)}
                  </h2>
                </div>
                <div className={styles.itemNumberContainer}>
                  <span className={styles.itemNumberText}>
                    {deal[0].assets.length} item
                    {deal[0].assets.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className={styles.dealNftContainer}>
                  <NFTGrid
                    data={deal[0].assets}
                    emptyText={"No NFTs found for this address."}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <div className={styles.createNavbar}>
          <button
            onClick={step < 2 ? handleNext : openModal}
            disabled={selectedNFTs.length === 0}
            className={styles.navNextButton}
          >
            <span></span>
            <span className={styles.nextButton}>{step < 2 ? "NEXT" : "CREATE"}</span>
            <div className={styles.nextArrowButton}>
              <Image src={"/arrow-button.png"} width={35} height={35} className={styles.img} alt={String("/arrow-button.png")} />
            </div>
          </button>
        </div>
        <DealModal isOpen={isModalOpen} onClose={closeModal} onAction={handleAction} deal={[deal[0], deal[1]]}/>
      </Container>
    </>
  );
}
