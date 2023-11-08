import type { NetworkInfo, NetworkType } from './network';

export const DEFAULT_GAS = 5_000_000;
export const DEFAULT_GAS_PRICE = '1000000000';

export const DEFAULT_NETWORK: NetworkType = 'l16';

export const NETWORKS: { [K in NetworkType]: NetworkInfo } = {
  l16: {
    name: 'l16',
    rpc: {
      url: 'https://rpc.l16.lukso.network',
    },
    cache: {
      url: 'https://erc725cache.l16.lukso.network/graphql',
    },
    ipfs: {
      url: 'https://2eff.lukso.dev/ipfs/',
    },
    blockscout: {
      url: 'https://explorer.execution.l16.lukso.network/tx',
    },
    chainId: 2828,
  },
};

export const DEFAULT_NETWORK_CONFIG = NETWORKS[DEFAULT_NETWORK];

export const LYX_ADDRESS = '0x0000000000000000000000000000000000000000';