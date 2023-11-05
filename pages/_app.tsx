import type { AppProps } from "next/app";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Navbar } from "../components/Navbar/Navbar";
import NextNProgress from "nextjs-progressbar";
import { NETWORK } from "../const/contractAddresses";
import "../styles/globals.css";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import { Web3OnboardProvider, init } from "@web3-onboard/react";
import injectedModule from '@web3-onboard/injected-wallets'
import luksoModule from "../lukso/luksoModule";
import { ConnectModalOptions } from '@web3-onboard/core/dist/types';
import LuksoSwapLogo from '../public/logo';
import chains from '../const/chains';

const lukso = luksoModule();

const injected = injectedModule({
  custom: [lukso],
  sort: (wallets) => {
    const sorted = wallets.reduce<any[]>((sorted, wallet) => {
      if (wallet.label === "Universal Profiles") {
        sorted.unshift(wallet);
      } else {
        sorted.push(wallet);
      }
      return sorted;
    }, []);
    return sorted;
  },
  displayUnavailable: ["Universal Profiles"],
});

const wallets = [injected]

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
  connect
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider
      clientId={process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
      activeChain={NETWORK}
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

        {/* Render the navigation menu above each component */}
        <Navbar />
        {/* Render the actual component (page) */}
        <Component {...pageProps} />
        <ToastContainer />
      </Web3OnboardProvider>
    </ThirdwebProvider>
  );
}

export default MyApp;
