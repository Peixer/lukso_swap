// pages/deals
import React, { useCallback, useEffect, useState } from "react";
import Container from "../../components/Container/Container";
import styles from "./Deals.module.css";
import {
  Deal,
  DealUser,
  getEnumState,
} from "../../lukso/types/deal";
import DealComponent from "../../components/Deal/Deal";
import { useConnectWallet } from "@web3-onboard/react";
import { Asset } from "../../lukso/types/asset";
import { getSwapContractAddress, getWalletProvider } from "../../util/network";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { ProfileBanner } from "../../components/ProfileBanner/ProfileBanner";

export default function Deals() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [swaps, setSwaps] = useState<any[]>([]);
  const [{ wallet }] = useConnectWallet();


  useEffect(() => {
    if(wallet === null){
      router.push("/");
    }
  }, [wallet]);

  useEffect(() => {
    if (swaps) {
      let deals = swaps.map((deal: any) => {
        const assetsTarget = deal.targetAccountTokenIds.map((tokenId: any, index: any) => {
          return {
            contractAddress: deal.targetAccountTokens[index],
            tokenId: tokenId,
            amount: deal.targetAccountTokenAmounts[index],
            contractStandard: deal.targetAccountTokenTypes[index],
          } as Asset;
        })
        const assetsOwner = deal.ownerTokenIds.map((tokenId: any, index: any) => {
          return {
            contractAddress: deal.ownerTokens[index],
            tokenId: tokenId,
            amount: deal.ownerTokenAmounts[index],
            contractStandard: deal.ownerTokenTypes[index],
          } as Asset;
        })
        return new Deal(
          deal.swapId,
          [
            new DealUser(deal.owner, assetsOwner, deal.owner),
            new DealUser(deal.target, assetsTarget, deal.target),
          ],
          getEnumState(deal.status),
          new Date()
        );
      });
      setDeals(deals);
    }
  }, [swaps]);

  const fetchContract = async () => {
    if(wallet){
      const provider = new ethers.providers.JsonRpcProvider(
        getWalletProvider(wallet)
      );
      const contractAddress = getSwapContractAddress(wallet);
      const contractABI = require("../../contract-abi.json");
      const contract = new ethers.Contract(contractAddress!, contractABI.abi, provider);

      let swapData = await contract.getSwaps(wallet?.accounts[0].address);

      setSwaps(swapData);
    }
  }

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);
  return (
    <>
      <Container maxWidth="lg">
        <ProfileBanner address={wallet?.accounts[0]?.address!} />
        <div className={styles.dealsContainer}>
          <h1 className="mb-0">See your deals</h1>
          <p className="mt-0">
            You can see your pending, accepted and rejected deals.
          </p>
          {deals.length > 0 ? (
            deals.map((deal) => {
              return (
                <div key={String(deal.id)} className={styles.dealContainer}>
                  <DealComponent deal={deal} />
                </div>
              );
            })
          ) : (
            <>
              <h2>You have no deals to review.</h2>
              <button onClick={fetchContract}>fetch contract</button>
            </>
          )}
        </div>
      </Container>
    </>
  );
}
