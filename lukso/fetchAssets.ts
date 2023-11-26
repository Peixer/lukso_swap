import { useEffect, useState } from 'react';
import { getInstance, LSP4Schema, LSP8IdentifiableDigitalAssetSchema, TESTNET_RPC_ENDPOINT, UniversalProfileSchema } from './schemas';
import { Asset, ASSET_STANDARD, Metadata } from './types/asset';
import LSP8IdentifiableDigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP8IdentifiableDigitalAsset.json'
import LSP7DigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json'
import { ethers } from 'ethers';
import { fetchLsp8Metadata } from './fetchLsp8Metadata';
import { BigNumber } from 'bignumber.js';
import { FetchDataOutput } from '@erc725/erc725.js/build/main/src/types/decodeData';

// Fetch LSP7 and LSP8 assets from a user UP address  
export const useAssets = (profileAddress: string): [Asset[]] => {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const fetchAssetData = async (address: string) => {
      try {
        const assetInstance = getInstance(
          LSP8IdentifiableDigitalAssetSchema.concat(LSP4Schema),
          address as string
        );

        let lspAssets: Asset[] = [];

        const useLSP4 = await assetInstance.fetchData('SupportedStandards:LSP4DigitalAsset');

        if(useLSP4){
          const useLSP8 = await assetInstance.fetchData('LSP8TokenIdType');

          let assetData = await assetInstance.fetchData(['LSP4TokenName', 'LSP4TokenSymbol', 'LSP4Metadata']);
          let creators: FetchDataOutput | undefined;
          let standard: ASSET_STANDARD;

          try{
            creators = await assetInstance.fetchData('LSP4Creators[]');
          } catch(error){
            console.log('Could not fetch creators for asset: ', address);
          }

          const provider = new ethers.providers.JsonRpcProvider(TESTNET_RPC_ENDPOINT);

          // Assuming the asset is LSP8
          if(useLSP8.value !== null){
            standard = ASSET_STANDARD.LSP8;

            // need to fetch tokenIds from contract address
            const contract = new ethers.Contract(address, LSP8IdentifiableDigitalAsset.abi, provider);
            let tokenIds = await contract.tokenIdsOf(profileAddress);

            // for each tokenId , fetch the associated LSP4Metadata
            tokenIds.map(async (tokenId: string) => {
              // const [collectionMetadata] = await fetchLsp8Metadata(
              //   tokenId,
              //   address
              // );
              lspAssets.push(new Asset(address, //contract address
                                standard, // asset standard 
                                assetData[0].value as string, // token name
                                assetData[1].value as string, // token symbol
                                tokenId, // token id
                                creators ? creators.value as string[] : [], // creators
                                (assetData[2].value as { LSP4Metadata?: Metadata })?.LSP4Metadata // metadata 
                              ));
            });

          } else{ // Assuming the asset is LSP7
            standard = ASSET_STANDARD.LSP7;

            const contract = new ethers.Contract(address, LSP7DigitalAsset.abi, provider);
            // need to fetch how many LSP7 tokens ones have
            let balanceOf = await contract.balanceOf(profileAddress) as BigNumber;
  
            lspAssets.push(new Asset(address, //contract address
                              standard, // asset standard 
                              assetData[0].value as string, // token name
                              assetData[1].value as string, // token symbol
                              '', // token id
                              creators ? creators.value as string[] : [], // creators
                              (assetData[2].value as { LSP4Metadata?: Metadata })?.LSP4Metadata, // metadata
                              Number(balanceOf)
                            ));
          }

          return lspAssets;
        } 

        return false;

      } catch (error) {
        console.log('Could not fetch asset data: ', error);
      }
    }

    const fetchAssets = async () => {
      if(profileAddress){
        try {
            const profileInstance = getInstance(
              UniversalProfileSchema,
              profileAddress as string
            );
    
            const result = await profileInstance.fetchData('LSP5ReceivedAssets[]');
    
            const resultValue = Array.isArray(result.value) ? result.value : [result.value];
    
            const filteredAssets = (
              await Promise.all(
                resultValue.map(async (address: string) => await fetchAssetData(address))
              )
            ).flat().filter((asset): asset is Asset => !!asset) as Asset[];            
    
            setAssets(filteredAssets);

            console.log(filteredAssets);
        } catch (e) {
          console.log('error', e);
        }
    }};
    fetchAssets();
  }, [profileAddress]);

  return [assets];
};
