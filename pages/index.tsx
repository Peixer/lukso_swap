import type { NextPage } from "next";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import loader from "../styles/Loader.module.css";
import { useConnectWallet } from "@web3-onboard/react";
import { useState } from "react";
import Carousel from "../components/Carousel/Carousel";
import { useProfile } from "../lukso/fetchProfile";
import SearchBar, { Suggestion } from "../components/Searchbar/Searchbar";

const Home: NextPage = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const fetchData = async (searchTerm: string) => {
    const apiUrl = '/api/proxy';
    try {
      const response = await fetch(`${apiUrl}/prod_testnet_universal_profiles/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchTerm,
          hitsPerPage: 100,
          page: 0,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      const suggestions: Suggestion[] = data.hits.map((item: any) => {
        const { LSP3Profile, address, profileImageUrl, backgroundImageUrl } = item;
        const name = LSP3Profile?.name || ''; 

        return {
          name,
          address,
          profileImageUrl,
          backgroundImageUrl,
        };
      });
      
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSearch = (inputValue: string) => {
    fetchData(inputValue);
  };

  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [loading, setLoading] = useState(false); // Initialize loading state
  const [profile] = useProfile();

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
                  Discover <span className={styles.gradient}>LuksoSwap</span>
                </h1>

                <h2 className={styles.heroDescription}>
                  Trade your NFTs for their NFTs.{" "}
                  <b className={styles.white}>Easily.</b>
                </h2>

                {/* Conditionally render the searchbar */}
                {wallet ? (
                  <SearchBar onSearch={handleSearch} suggestions={suggestions} />
                ) : (
                  <div className={styles.heroCtaContainer}>
                  <div className={styles.connect}>
                    <button
                      className={styles.connectButton}
                      disabled={connecting}
                      onClick={() =>
                        wallet ? disconnect(wallet) : loadingConnect()
                      }
                    >
                      {connecting
                        ? "Connecting"
                        : wallet
                        ? "Disconnect"
                        : "Connect wallet"}
                    </button>
                  </div>
                </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
