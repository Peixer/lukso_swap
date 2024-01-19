import { DealUser } from "../../lukso/types/deal";
import styles from "./DealModal.module.css";

/**
 * Modal
 */
type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAction: () => void;
  deal: DealUser[];
};

export function DealModal({ isOpen, onClose, onAction, deal }: Props) {
  if (!isOpen) {
    return null;
  }
  
  return (
    <div className={styles.modalContainer}>
      <div className={styles.modalInnerContainer}>
        <h3 className="mt-0">Send your deal</h3>
        <p>You are about to place your deal with <br/>
          <span className={styles.tradeUser}>
            @{deal[0].name}#{deal[0].address.substr(2, 4)}
          </span>
        </p>
        <h4 className={styles.dealTitle}>Your deal</h4>
        <div className={styles.dealContainer}>
          <div className={styles.userInfoContainer}>
            <span>@{deal[1].name}#{deal[1].address.substr(2, 4)}</span><br/>
            <span className={styles.items}>{deal[1].assets.length} item
            {deal[1].assets.length > 1 ? "s" : ""}</span>
          </div>
          <div className={styles.traderUserInfoContainer}>
            <span>@{deal[0].name}#{deal[0].address.substr(2, 4)}</span><br/>
            <span className={styles.items}>{deal[0].assets.length} item
            {deal[0].assets.length > 1 ? "s" : ""}</span>
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <button className={styles.sendDealButton} onClick={onAction}>Send your deal</button>
          <button className={styles.cancelButton} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
