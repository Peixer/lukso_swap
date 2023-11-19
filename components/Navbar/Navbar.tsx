import { useAddress } from "@thirdweb-dev/react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Navbar.module.css";

/**
 * Navigation bar that shows up on all pages.
 * Rendered in _app.tsx file above the page content.
 */
export function Navbar() {
  const address = useAddress();

  return (
    <div className={styles.navContainer}>
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <Link href="/" className={`${styles.homeLink} ${styles.navLeft}`}>
            <Image
              src="/logo.png"
              width={48}
              height={48}
              alt="NFT marketplace sample logo"
            />
          </Link>
          <h2 className={styles.title}>
            <span>
                LuksoSwap
            </span>
          </h2>
          <div className={styles.navMiddle}>
            <Link href="/deals" className={styles.link}>
              Deals
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
