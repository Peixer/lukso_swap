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
  links: LinkJson[];
  icon: ImageJson[];
  images: ImageJson[][];
  assets: {
    hashFunction: string;
    hash: string;
    url: string;
    fileType: string;
  }[];
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

  amount: number | undefined;

  constructor(contractAddress: string, 
              contractStandard?: ASSET_STANDARD,
              name?: string,
              symbol?: string,
              tokenId?: string,
              creators?: string[],
              metadata?: any,
              amount?: number) {
    this.contractAddress = contractAddress ?? '';
    this.contractStandard = contractStandard ?? undefined;
    this.name = name ?? '';
    this.symbol = symbol ?? '';
    this.tokenId = tokenId ?? '';
    this.creators = creators ?? [];
    this.metadata = metadata ?? [];
    this.amount = amount ?? undefined;
  }
};
  
export class Lsp7Asset extends Asset {
  balance: string;

  constructor(contractAddress: string, rawAsset: any, balance: string) {
    super(contractAddress);

    this.balance = balance;
  }
};
  
export class Lsp8Asset extends Asset {
  id: string;

  lsp8Metadata: Metadata;

  constructor(
    contractAddress: string,
    rawAsset: any,
    id: string,
    lsp8Metadata: any
  ) {
    super(contractAddress);

    this.id = id;
    this.lsp8Metadata = lsp8Metadata?.[0]?.value?.LSP4Metadata;
  }
};
  
export type AssetMap = {
  lsp7: Lsp7Asset[];
  lsp8: Lsp8Asset[];
};
  
export type CreatedAssetMap = {
  lsp7: Asset[];
  lsp8: Asset[];
};