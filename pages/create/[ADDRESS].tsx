// pages/create/[ADDRESS].tsx

import { useRouter } from 'next/router';
import React from 'react';
import Container from '../../components/Container/Container';
import NFTGrid from '../../components/NFT/NFTGrid';
import { NFT_COLLECTION_ADDRESS } from '../../const/contractAddresses';
import { useContract, useNFTs } from '@thirdweb-dev/react';
import { useAssets } from '../../lukso/fetchAssets';

export default function Create(){
  const router = useRouter();
  const { ADDRESS } = router.query;

  // Load all of the NFTs from the NFT Collection
  const { contract } = useContract(NFT_COLLECTION_ADDRESS);
  const { data, isLoading } = useNFTs(contract);

  const [assets] = useAssets(ADDRESS as string);

  return (
    <Container maxWidth="lg">
      <h1>Buy NFTs</h1>
      <p>Browse which NFTs are available from the collection.</p>
      <NFTGrid
        data={data}
        isLoading={isLoading}
        emptyText={
          "Looks like there are no NFTs in this collection. Did you import your contract on the thirdweb dashboard? https://thirdweb.com/dashboard"
        }
      />
    </Container>
  );
};

