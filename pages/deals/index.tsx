// pages/deals
import React, { useEffect, useState } from "react";
import Container from "../../components/Container/Container";
import styles from "./Deals.module.css";
import {
  Deal,
  DealUser,
  getEnumState,
} from "../../lukso/types/deal";
import DealComponent from "../../components/Deal/Deal";
import { useContract, useContractRead } from "@thirdweb-dev/react";
import { useConnectWallet } from "@web3-onboard/react";
import { Asset } from "../../lukso/types/asset";
import { getSwapContractAddress } from "../../util/network";
import { useRouter } from "next/navigation";

export default function Deals() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [{ wallet }] = useConnectWallet();
  const { contract } = useContract(getSwapContractAddress(wallet));
  const { data, isLoading, error } = useContractRead(
    contract,
    "getSwaps",
    [wallet?.accounts[0].address]
  );

  useEffect(() => {
    if (isLoading) return;
    if (error) return;
    if (!wallet) return;
    if (data) {
      let deals = data.map((deal: any) => {
        const assetsTarget = deal.targetAccountTokenIds.map((tokenId: any, index: any) => {
          return {
            contractAddress: deal.targetAccountTokens[index],
            tokenId: tokenId,
          } as Asset;
        })
        const assetsOwner = deal.ownerTokenIds.map((tokenId: any, index: any) => {
          return {
            contractAddress: deal.ownerTokens[index],
            tokenId: tokenId,
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
  }, [data, error, isLoading, wallet]);

  useEffect(() => {
    if(wallet === null){
      router.push("/");
    }
  }, [wallet]);

  return (
    <Container maxWidth="lg">
      <div className={styles.dealsContainer}>
        <h1 className="mb-0">See your deals</h1>
        <p className="mt-0">
          You can see your pending, accepted and rejected deals.
        </p>
        {deals.length > 0 ? (
          deals.map((deal) => {
            return (
              <div key={String(deal)} className={styles.dealContainer}>
                <DealComponent deal={deal} />
              </div>
            );
          })
        ) : (
          <>
            <h2>You have no deals to review.</h2>
          </>
        )}
      </div>
    </Container>
  );
}
