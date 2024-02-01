import type { AppProps } from "next/app";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Navbar } from "../components/Navbar/Navbar";
import NextNProgress from "nextjs-progressbar";
import "../styles/globals.css";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import { Web3OnboardProvider, init } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";
import luksoModule from "../lukso/luksoModule";
import { ConnectModalOptions } from "@web3-onboard/core/dist/types";
import LuksoSwapLogo from "../public/logo";
import chains from "../const/chains";
import { LuksoTestnet } from "@thirdweb-dev/chains";
import { DM_Sans } from 'next/font/google'
import { NetworkModal } from "../components/NetworkModal/NetworkModal";

const lukso = luksoModule();
const dmsans = DM_Sans({
  weight: '400',
  subsets: ['latin'],
});

const injected = injectedModule({
  custom: [lukso],
  sort: (wallets) => {
    const sorted = wallets.reduce<any[]>((sorted, wallet) => {
      if (wallet.label === "Universal Profiles") {
        sorted.unshift(wallet);
      } 
      return sorted;
    }, []);
    return sorted;
  },
  displayUnavailable: ["Universal Profiles"],
});

const wallets = [injected];

const connect: ConnectModalOptions = {
  iDontHaveAWalletLink:
    "https://chrome.google.com/webstore/detail/universal-profiles/abpickdkkbnbcoepogfhkhennhfhehfn?hl=en",
  removeWhereIsMyWalletWarning: true,
};

const LOGO = LuksoSwapLogo;
const appMetadata = {
  name: "LuksoSwap",
  icon: LOGO,
  logo: LOGO,
  description: "Swap NFTs on Lukso",
  recommendedInjectedWallets: [
    {
      name: "Universal Profiles",
      url: "https://chrome.google.com/webstore/detail/universal-profiles/abpickdkkbnbcoepogfhkhennhfhehfn?hl=en",
    },
  ],
};

const web3Onboard = init({
  wallets,
  chains,
  appMetadata,
  connect,
});

function MyApp({ Component, pageProps }: AppProps) {  
  return (
    <ThirdwebProvider
      clientId={process.env.NEXT_PUBLIC_CLIENT_ID}
      activeChain={LuksoTestnet}
    >
      <Web3OnboardProvider web3Onboard={web3Onboard}>
        <Head>
          <title>LuksoSwap - Trade NFTs Easily</title>
        </Head>
        {/* Progress bar when navigating between pages */}
        <NextNProgress
          color="var(--color-tertiary)"
          startPosition={0.3}
          stopDelayMs={200}
          height={3}
          showOnShallow={true}
        />
        <main className={dmsans.className}>
          <Navbar />
          <Component {...pageProps} />
          <ToastContainer />
          <NetworkModal />
        </main>
      </Web3OnboardProvider>
    </ThirdwebProvider>
  );
}

export default MyApp;
