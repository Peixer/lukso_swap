// pages/create/[ADDRESS].tsx
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Container from "../../components/Container/Container";
import NFTGrid from "../../components/NFT/NFTGrid";
import { useAssets } from "../../lukso/fetchAssets";
import { Asset } from "../../lukso/types/asset";
import styles from "./Create.module.css";
import { useConnectWallet } from "@web3-onboard/react";
import { DealUser } from "../../lukso/types/deal";
import { useProfile } from "../../lukso/fetchProfile";
import { useContract, useContractWrite } from "@thirdweb-dev/react";
import { Lukso } from "@thirdweb-dev/chains";

export default function Create() {
  // Get wallet
  const [{ wallet }] = useConnectWallet();

  const router = useRouter();
  const [address, setAddress] = useState<string>("");

  const [user] = useProfile(wallet?.accounts[0].address as string);
  const [tradeUserAddress, setTradeUserAddress] = useState<string>("");
  const [tradeUser] = useProfile(tradeUserAddress);
  const { contract } = useContract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
  const {
    mutateAsync: createSwapAsync,
    isLoading,
    error,
  } = useContractWrite(contract, "createSwap");

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
  const [assets] = useAssets(address as string);
  const [deal, setDeal] = useState<DealUser[]>([]);
  const [step, setStep] = useState<number>(0);
  const [selectedNFTs, setSelectedNFTs] = useState<Asset[]>([]);

  const selectNFT = (nft: Asset) => {
    // Check if the NFT is already selected based on contractAddress
    const isSelected = selectedNFTs.some(
      (selectedNFT) => selectedNFT.contractAddress === nft.contractAddress
    );

    // Update the selectedNFTs list
    if (!isSelected) {
      // NFT is not selected, add it to the list
      setSelectedNFTs((prevSelectedNFTs) => [...prevSelectedNFTs, nft]);
    } else {
      // NFT is already selected, remove it from the list
      setSelectedNFTs((prevSelectedNFTs) =>
        prevSelectedNFTs.filter(
          (selectedNFT) => selectedNFT.contractAddress !== nft.contractAddress
        )
      );
    }

    // Force a re-render by updating the state
    setSelectedNFTs((prevSelectedNFTs) => [...prevSelectedNFTs]);
  };

  const handleBack = () => {
    let dealUser = new DealUser(address, selectedNFTs);

    if (wallet) {
      if (step === 0) {
        router.push("/");
      }
      if (step === 1) {
        deal[1] = dealUser;
        setSelectedNFTs(deal[0].assets);
        setAddress(deal[0].address);
      }
    }

    setStep(step - 1);
  };

  const handleNext = async () => {
    let dealUser = new DealUser(address, selectedNFTs);

    if (wallet) {
      if (step === 0) {
        deal[0] = dealUser;
        setAddress(wallet?.accounts[0].address);

        if (deal.length > 1) {
          setSelectedNFTs(deal[1].assets);
        } else {
          setSelectedNFTs([]);
        }
      }

      if (step === 1) {
        deal[1] = dealUser;
      }

      if (step === 2) {
        debugger;
        await createSwapAsync({
          args: [
            "Swap",
            deal[0].address,
            deal[0].assets.map((asset) => asset.contractAddress),
            [1],
            // deal[0].assets.map((asset) => asset.contractAddress),
            deal[1].assets.map((asset) => asset.contractAddress),
            // deal[1].assets.map((asset) => asset.tokenId),
            [2],
          ],
        });
        router.push("/");
      }
    }

    setStep(step + 1);
  };

  return (
    <Container maxWidth="lg">
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
            <h1>
              Deal to {tradeUser.name}#{tradeUser.address.substr(2, 4)}
            </h1>
          </div>
          <div className={styles.dealBottomContainer}>
            <div className={styles.dealBottomLeftContainer}>
              <div>
                <h2 className="mb-0">
                  {user.name}#{user.address.substr(2, 4)}
                </h2>
                <span className="mt-0">
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
              <div>
                <h2 className="mb-0">
                  {tradeUser.name}#{tradeUser.address.substr(2, 4)}
                </h2>
                <span className="mt-0">
                  {deal[0].assets.length} item
                  {deal[1].assets.length > 1 ? "s" : ""}
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
        <button onClick={handleBack} className={styles.navBackButton}>
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={selectedNFTs.length === 0}
          className={styles.navNextButton}
        >
          {step < 2 ? "Next" : "Create"}
        </button>
      </div>
    </Container>
  );
}
