import { useEffect, useState } from 'react';
import { getInstance } from './schemas';
import { Asset, ASSET_STANDARD, Metadata } from './types/asset';
import LSP8IdentifiableDigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP8IdentifiableDigitalAsset.json';
import LSP7DigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json'
import LSP4Schema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';
import LSP8IdentifiableDigitalAssetSchema from '@erc725/erc725.js/schemas/LSP8IdentifiableDigitalAsset.json';
import UniversalProfileSchema from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json';
import { ethers } from 'ethers';
import { FetchDataOutput } from '@erc725/erc725.js/build/main/src/types/decodeData';
import { ERC725JSONSchema } from '@erc725/erc725.js/build/main/src/types/ERC725JSONSchema';
import { useConnectWallet } from '@web3-onboard/react';
import { getWalletProvider } from '../util/network';
import { fetchLsp8Metadata } from './fetchLSP8Metadata';
import { INTERFACE_IDS } from '@lukso/lsp-smart-contracts';
import { BigNumber } from 'ethers';
import { fetchLsp7Metadata } from './fetchLSP7Metadata';

// Fetch LSP7 and LSP8 assets from a user UP address  
export const useAssets = (profileAddress: string): [Asset[], boolean] => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [{ wallet }] = useConnectWallet();

  useEffect(() => {
    const fetchAssetData = async (address: string) => {
      try {
        const assetInstance = getInstance(
          LSP4Schema.concat(LSP8IdentifiableDigitalAssetSchema) as ERC725JSONSchema[],
          address as string,
          wallet
        );

        let lspAssets: Asset[] = [];

        const useLSP4 = await assetInstance.fetchData('SupportedStandards:LSP4DigitalAsset');

        if(useLSP4){
          const isLSP7 = await assetInstance.supportsInterface(INTERFACE_IDS.LSP7DigitalAsset);
          const isLSP8 = await assetInstance.supportsInterface(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);

          let assetData = await assetInstance.fetchData(['LSP4TokenName', 'LSP4TokenSymbol', 'LSP4Metadata']);
          let creators: FetchDataOutput | undefined;
          let standard: ASSET_STANDARD;

          try{
            creators = await assetInstance.fetchData('LSP4Creators[]');
          } catch(error){
            console.log('Could not fetch creators for asset: ', address);
          }

          const provider = new ethers.providers.JsonRpcProvider(getWalletProvider(wallet));

          // Assuming the asset is LSP8
          if(isLSP8){
            standard = ASSET_STANDARD.LSP8;

            // need to fetch tokenIds from contract address
            const contract = new ethers.Contract(address, LSP8IdentifiableDigitalAsset.abi, provider);
            let tokenIds = await contract.tokenIdsOf(profileAddress);

            // for each tokenId , fetch the associated LSP4Metadata
            const tokenMetadataPromises = tokenIds.map(async (tokenId: string) => {
              return fetchLsp8Metadata(tokenId, address, wallet);
            });
  
            const tokenMetadataArray = await Promise.all(tokenMetadataPromises);
  
            // Process tokenMetadataArray and create lspAssets array
            tokenMetadataArray.forEach((tokenMetadata, index) => {  
              lspAssets.push(new Asset(
                address,
                standard,
                assetData[0].value as string,
                assetData[1].value as string,
                tokenIds[index],
                BigNumber.from(1)._hex,
                creators ? creators.value as string[] : [],
                (tokenMetadata[0] as { LSP4Metadata?: Metadata })?.LSP4Metadata
              ));
            });

          } else if(isLSP7){ // Assuming the asset is LSP7
            standard = ASSET_STANDARD.LSP7;

            const contract = new ethers.Contract(address, LSP7DigitalAsset.abi, provider);
            // need to fetch how many LSP7 tokens ones have
            let balanceOf = await contract.balanceOf(profileAddress) as BigNumber;

            let lsp7Metadata = await fetchLsp7Metadata(address, wallet);
  
            lspAssets.push(new Asset(address, //contract address
                              standard, // asset standard 
                              assetData[0].value as string, // token name
                              assetData[1].value as string, // token symbol
                              '0x0000000000000000000000000000000000000000000000000000000000000001', // random token id (it doesnt matter as it is a LSP7 token),
                              BigNumber.from(1)._hex, // amount
                              creators ? creators.value as string[] : [], // creators
                              (lsp7Metadata[0] as { LSP4Metadata?: Metadata })?.LSP4Metadata, // token metadata
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
      if (profileAddress) {
        try {
          setLoading(true);
          const profileInstance = getInstance(
            UniversalProfileSchema as ERC725JSONSchema[],
            profileAddress as string,
            wallet
          );

          const result = await profileInstance.fetchData('LSP5ReceivedAssets[]');

          const resultValue = Array.isArray(result.value) ? result.value : [result.value];

          const assetPromises = resultValue.map(async (address: string) => {
            const assets = await fetchAssetData(address);
            return assets;
          });

          // Wait for all promises in assetPromises array to resolve
          const assetsArray = await Promise.all(assetPromises);

          const filteredAssets = assetsArray.flat().filter((asset): asset is Asset => !!asset);

          setAssets(filteredAssets);

          console.log("filteredAssets: ", filteredAssets);
          setLoading(false);
        } catch (e) {
          setLoading(false);
          console.log('error', e);
        }
      }};
    fetchAssets();
  }, [profileAddress]);

  return [assets, loading];
};
