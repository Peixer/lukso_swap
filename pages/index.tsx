import type { NextPage } from "next";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import loader from "../styles/Loader.module.css";
import { useConnectWallet } from "@web3-onboard/react";
import { useEffect, useState } from "react";
import Carousel from "../components/Carousel/Carousel";

const buttonStyles = {
  borderRadius: '8px',
  background: '#7448db',
  border: 'none',
  fontSize: '18px',
  fontWeight: '600',
  cursor: 'pointer',
  color: 'white',
  padding: '14px 16px',
  marginTop: '15px',
  fontFamily: 'inherit'
}

const Home: NextPage = () => {

  useEffect(() => {
    // Apply overflow: hidden to the body element when the Home component mounts
    document.body.style.overflow = 'hidden';
    return () => {
      // Clean up when the component unmounts
      document.body.style.overflow = 'visible'; // Reset overflow to its default value
    };
  }, []);

  const [
    { wallet, connecting },
    connect,
    disconnect
  ] = useConnectWallet();

  const [loading, setLoading] = useState(false); // Initialize loading state

  // setup ethers required params
  let provider;
  let signer;

  const loadingConnect = async () => {
    setLoading(true);
    connect();
    setLoading(false);
  };

  return (
    <main className={styles.main}>
      {/* Conditionally render the loader */}
        {loading && (
        <div className={loader.loaderContainer}>
          <div className={loader.loader}></div>
        </div>
      )}
      <div className={styles.container}>
        <Carousel />
        <div className={styles.content}>
          <div className={styles.hero}>
            <div className={styles.heroBackground}>
              <div className={styles.heroBackgroundInner}>
                <Image
                  src="/hero-gradient.png"
                  width={1390}
                  height={1390}
                  alt="Background gradient from red to blue"
                  quality={100}
                  className={styles.gradient}
                />
              </div>
            </div>
            <div className={styles.heroBodyContainer}>
              <div className={styles.heroBody}>
                <h1 className={styles.heroTitle}>
                  Discover{" "}
                  <span className={styles.gradient}>
                      LuksoSwap
                  </span>
                </h1>

                <h2 className={styles.heroDescription}>
                  Trade your NFTs for their NFTs. <b className={styles.white}>Easily.</b>
                </h2>

                <div className={styles.heroCtaContainer}>
                  <div className={styles.connect}>
                    <button
                      style={buttonStyles}
                      disabled={connecting}
                      onClick={() => (wallet ? disconnect(wallet) : loadingConnect())}
                    >
                      {connecting ? 'Connecting' : wallet ? 'Disconnect' : 'Connect wallet'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
