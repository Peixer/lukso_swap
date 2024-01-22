import { WalletState } from "@web3-onboard/core";

export type NetworkType = 'l16';

export type NetworkInfo = {
  name: string;
  rpc: { url: string };
  cache: { url: string };
  iconIpfs: { url: string };
  imageIpfs: { url: string };
  blockscout: { url: string };
  chainId: number;
};

export const getWalletProvider = (wallet: WalletState | null) => {
  return wallet?.chains[0].id === '0x2a' ? process.env.NEXT_PUBLIC_MAINNET_LUKSO_RPC_URL : process.env.NEXT_PUBLIC_TESTNET_LUKSO_RPC_URL;
}

export const getAlgoliaAppId = (wallet: WalletState | null) => {
  return wallet?.chains[0].id === '0x2a' ? process.env.NEXT_PUBLIC_MAINNET_ALGOLIA_APP_ID : process.env.NEXT_PUBLIC_TESTNET_ALGOLIA_APP_ID;
}

export const getAlgoliaAPIKey = (wallet: WalletState | null) => {
  return wallet?.chains[0].id === '0x2a' ? process.env.NEXT_PUBLIC_MAINNET_ALGOLIA_API_KEY : process.env.NEXT_PUBLIC_TESTNET_ALGOLIA_API_KEY;
}

export const getAlgoliaEndpoint = (wallet: WalletState | null) => {
  return wallet?.chains[0].id === '0x2a' ? process.env.NEXT_PUBLIC_MAINNET_ALGOLIA_ENDPOINT : process.env.NEXT_PUBLIC_TESTNET_ALGOLIA_ENDPOINT;
}

export const getAlgoliaLocalEndpoint = (wallet: WalletState | null) => {
  return wallet?.chains[0].id === '0x2a' ? process.env.NEXT_PUBLIC_MAINNET_ALGOLIA_LOCAL_ENDPOINT : process.env.NEXT_PUBLIC_TESTNET_ALGOLIA_LOCAL_ENDPOINT;
}

export const getSwapContractAddress = (wallet: WalletState | null) => {
  return wallet?.chains[0].id === '0x2a' ? process.env.NEXT_PUBLIC_MAINNET_CONTRACT_ADDRESS : process.env.NEXT_PUBLIC_TESTNET_CONTRACT_ADDRESS;
}
