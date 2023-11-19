import React from "react";
import styles from "./Deal.module.css";
import { DEAL_STATE, Deal } from "../../lukso/types/deal";

type Props = {
  deal: Deal;
};

export default function DealComponent({ deal }: Props) {

    const dealStateClass = (state: DEAL_STATE) => {
        switch (state) {
            case DEAL_STATE.PENDING:
            return `${styles.dealState} ${styles.dealStatePending}`;
            case DEAL_STATE.ACCEPTED:
            return `${styles.dealState} ${styles.dealStateAccepted}`;
            case DEAL_STATE.REJECTED:
            return `${styles.dealState} ${styles.dealStateRejected}`;
            default:
            return styles.dealState; // Default class when state doesn't match any case
        }
    };
      
  return (
    <div className={styles.dealContainer}>
        <div className={styles.dealDataContainer}>
            <div className={dealStateClass(deal.state)}>
                <span>{deal.state}</span>
            </div>
            <p className={styles.nftName}>{deal.users[0].name} ({deal.users[0].assets.length} item{deal.users[0].assets.length > 0 ? 's' : ''})</p>
            <p className={styles.nftName}>{deal.users[1].name} ({deal.users[1].assets.length} item{deal.users[1].assets.length > 0 ? 's' : ''})</p>
        </div>
        {deal.state === DEAL_STATE.PENDING ? (
        <div className={styles.dealActionContainer}>
            <button>Accept</button>
            <button>Reject</button>
        </div>
        ) : (<></>)}
    </div>
  );
}
