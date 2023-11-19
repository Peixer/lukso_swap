// pages/deals
import React, { useEffect, useState } from 'react';
import Container from '../../components/Container/Container';
import styles from './Deals.module.css';
import { useConnectWallet } from '@web3-onboard/react';
import { DEAL_STATE, Deal, DealUser } from '../../lukso/types/deal';
import DealComponent from '../../components/Deal/Deal';

export default function Deals(){
  // Get wallet
  const [{ wallet }] = useConnectWallet();
  const [deals, setDeals] = useState<Deal[]>([]);
 
  useEffect(() => {
    let deal = new Deal([new DealUser('',[],'shams#8D66'), new DealUser('',[], 'vlad#37Fa')], DEAL_STATE.PENDING, new Date());
    let deal2 = new Deal([new DealUser('',[],'peixer#F715'), new DealUser('',[], 'Frozeman#e63b')], DEAL_STATE.ACCEPTED, new Date(), new Date());
    let deal3 = new Deal([new DealUser('',[],'livai#a823'), new DealUser('',[], 'dwight#c709')], DEAL_STATE.REJECTED, new Date(), new Date());

    setDeals([deal, deal2, deal3]);
  }, []);

  return (
    <Container maxWidth="lg">
        <div className={styles.dealsContainer}>
            <h1 className="mb-0">See your deals</h1>
            <p className="mt-0">You can see your pending, accepted and rejected deals.</p>
            {deals.length > 0 ? 
            (
                deals.map((deal) => {
                    return (
                    <div
                        key={String(deal)}
                        className={styles.dealContainer}
                    >
                        <DealComponent deal={deal} />
                    </div>
                    );
                })
            ) : 
            (<>
                <h2>You have no deals to review.</h2>
            </>)}
        </div>
    </Container>
  );
};

