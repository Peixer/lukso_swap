// pages/create/[ADDRESS].tsx

import { useRouter } from 'next/router';
import React, { useState } from 'react';
import Container from '../../components/Container/Container';
import NFTGrid from '../../components/NFT/NFTGrid';
import { NFT_COLLECTION_ADDRESS } from '../../const/contractAddresses';
import { useContract, useNFTs } from '@thirdweb-dev/react';
import { useAssets } from '../../lukso/fetchAssets';
import { Asset } from '../../lukso/types/asset';

export default function Create(){
  const router = useRouter();
  const { ADDRESS } = router.query;

  // Load all of the NFTs from the NFT Collection
  const { contract } = useContract(NFT_COLLECTION_ADDRESS);
  const isLoading = false;

  const [assets] = useAssets(ADDRESS as string);
  const [selectedNFTs, setSelectedNFTs] = useState<Asset[]>([]);

  const selectNft = (nft: Asset) => {
    if(!selectedNFTs.includes(nft)){
        // add the selected NFT to the list
        selectedNFTs.push(nft);
    } else{
        // remove selected NFT of the list
        let index = selectedNFTs.indexOf(nft);
        selectedNFTs.splice(index, 1);
    }
  }

  return (
    <Container maxWidth="lg">
      <h1 className="mb-0">Select their items</h1>
      <p className="mt-0">You can only select items on the same chain. Not all items are eligible.</p>
      <NFTGrid
        data={assets}
        isLoading={isLoading}
        overrideOnclickBehavior={selectNft}
        emptyText={
            "No NFTs found for this address."
        }
      />
    </Container>
  );
};

