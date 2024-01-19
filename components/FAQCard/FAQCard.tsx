import { useState } from "react";
import styles from "./FAQCard.module.css";

/**
 * FAQCard
 */
type Props = {
  title: string;
  description: string;
};

export function FAQCard({ title, description }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`${styles.faqContainer} ${isExpanded ? styles.expanded : ''}`}>
      <div className={styles.faqHeader} onClick={toggleExpansion}>
        <h3 className={styles.faqTitle}>{title}</h3>
        <div className={`${styles.arrow} ${isExpanded ? styles.up : styles.down}`}></div>
      </div>
      {isExpanded && <p className={styles.description}>{description}</p>}
    </div>
  );
}
