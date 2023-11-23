// pages/deals
import React, { useEffect, useState } from "react";
import Container from "../../components/Container/Container";
import styles from "./Deals.module.css";
import {
  DEAL_STATE,
  Deal,
  DealUser,
  getEnumState,
} from "../../lukso/types/deal";
import DealComponent from "../../components/Deal/Deal";
import { useContract, useContractRead } from "@thirdweb-dev/react";
import { useConnectWallet } from "@web3-onboard/react";

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [{ wallet }] = useConnectWallet();
  const { contract } = useContract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
  const { data, isLoading, error, refetch } = useContractRead(
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
        return new Deal(
          deal.swapId,
          [
            new DealUser(deal.owner, deal.ownerTokens, deal.owner),
            new DealUser(deal.target, deal.targetAccountTokens, deal.target),
          ],
          getEnumState(deal.status),
          new Date()
        );
      });
      setDeals(deals);
    }
  }, [data, error, isLoading, wallet]);

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
