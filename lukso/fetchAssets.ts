import { useEffect, useState } from 'react';
import { getInstance, LSP4Schema, LSP8IdentifiableDigitalAssetSchema, UniversalProfileSchema } from './schemas';
import { Asset, ASSET_STANDARD, Metadata } from './types/asset';

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

        const useLSP4 = await assetInstance.fetchData('SupportedStandards:LSP4DigitalAsset');

        if(useLSP4){
          const assetData = await assetInstance.fetchData(['LSP4TokenName', 'LSP4TokenSymbol', 'LSP4Metadata', 'LSP8TokenIdType']);

          let creators;
          try{
            creators = await assetInstance.fetchData('LSP4Creators[]');
          } catch(error){
            console.log('Could not fetch creators for asset: ', address);
          }

          let assetStandard = assetData[3].value ? ASSET_STANDARD.LSP8 : ASSET_STANDARD.LSP7;

          const asset = new Asset(address, //contract address
                                  assetStandard, // standard LSP7 : LSP8
                                  assetData[0].value as string, // token name
                                  assetData[1].value as string, // token symbol
                                  creators ? creators.value as string[] : [], // creators
                                  (assetData[2].value as { LSP4Metadata?: Metadata })?.LSP4Metadata // metadata // metadata
                                );

          return asset;
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
            ).filter((asset) => asset !== false) as Asset[];
    
            console.log(filteredAssets);
    
            setAssets(filteredAssets);
        } catch (e) {
          console.log('error', e);
        }
    }};
    fetchAssets();
  }, [profileAddress]);

  return [assets];
};
