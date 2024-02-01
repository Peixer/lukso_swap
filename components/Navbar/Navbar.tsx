import Image from "next/image";
import Link from "next/link";
import styles from "./Navbar.module.css";
import { useState } from "react";
import { useConnectWallet } from "@web3-onboard/react";

/**
 * Navigation bar that shows up on all pages.
 * Rendered in _app.tsx file above the page content.
 */
export function Navbar() {

  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [loading, setLoading] = useState(false); // Initialize loading state

  const loadingConnect = async () => {
    setLoading(true);
    connect();
    setLoading(false);
  };
  
  return (
    <div className={styles.navContainer}>
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <Link href="/" className={`${styles.homeLink} ${styles.navLeft}`}>
            <Image
              src="/logo.png"
              width={45.73}
              height={42}
              alt="NFT marketplace sample logo"
            />
          </Link>
          <Link href="/">
            <h2 className={styles.title}>
              <span>
                  LUKSOSWAP
              </span>
            </h2>
          </Link>
          <div className={styles.navMiddle}>
            <h4 style={{ marginBottom: 'revert' }}>
              <Link href="/deals">
                  Deals
              </Link>
            </h4>
          </div>
        </div>
        <div className={styles.navRight}>
          <h4 className={styles.hideLink}>
            <Link href="/faq">
              How it works
            </Link>
          </h4>
          <h4>
            <button
              className={styles.connectButton}
              disabled={connecting}
              onClick={() =>
                wallet ? disconnect(wallet) : loadingConnect()
              }
            >
              {connecting
                ? "LOADING"
                : wallet
                ? "DISCONNECT"
                : "CONNECT"}
            </button>
          </h4>
        </div>
      </nav>
    </div>
  );
}
