import { Uint256 } from "web3";

export type LinkJson = {
    title: string;
    url: string;
};
  
export type ImageJson = {
  width: number;
  height: number;
  hashFunction: string;
  hash: string;
  url: string;
};
  
export type Metadata = {
  description: string;
  attributes: any[];
  links: LinkJson[];
  icon: ImageJson[];
  images: ImageJson[][];
  assets: {
    hashFunction: string;
    hash: string;
    url: string;
    fileType: string;
  }[];
  name: string;
};

export enum ASSET_STANDARD{
  LSP7 = 'LSP7',
  LSP8 = 'LSP8'
}
  
export class Asset {
  contractAddress: string;

  contractStandard: ASSET_STANDARD | undefined;

  name: string;

  symbol: string;

  tokenId: string;

  creators: string[];

  metadata: Metadata;

  amount: Uint256;

  constructor(contractAddress: string, 
              contractStandard: ASSET_STANDARD,
              name: string,
              symbol: string,
              tokenId: string,
              amount: Uint256,
              creators?: string[],
              metadata?: any) {
    this.contractAddress = contractAddress ?? '';
    this.contractStandard = contractStandard ?? undefined;
    this.name = name ?? '';
    this.symbol = symbol ?? '';
    this.tokenId = tokenId ?? '';
    this.creators = creators ?? [];
    this.metadata = metadata ?? [];
    this.amount = amount;
  }
};
  