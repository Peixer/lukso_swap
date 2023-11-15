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