import React from "react";
import styles from "./LoadingSpinner.module.css";

/**
 * LoadingSpinner
 */
type Props = {
  isLoading: boolean;
};

export function LoadingSpinner({ isLoading }: Props) {
  if (!isLoading) {
    return null;
  }
  
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.loader}></div>
    </div>
  );
}
