import LSP7DigitalAssetContract from '@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json'
import {
  ERC725YDataKeys
} from '@lukso/lsp-smart-contracts'
import ERC725 from '@erc725/erc725.js'
import LSP4DigitalAsset from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json'

import type { ERC725JSONSchema } from '@erc725/erc725.js'
import type { LSP4DigitalAssetMetadataJSON } from '@lukso/lsp-smart-contracts'
import type { URLDataWithHash } from '@erc725/erc725.js/build/main/src/types'
import { resolveUrl } from '../util/urlResolver'
import { getInstance } from './schemas'
import { validateLsp4MetaData } from './validateLSP4Metadata'
import { WalletState } from '@web3-onboard/core'
import { ethers } from 'ethers'
import { getWalletProvider } from '../util/network'
import { IPFS_URL } from '../util/config'

export const fetchLsp7Metadata = async (
  assetAddress: string,
  wallet: WalletState | null
): Promise<[LSP4DigitalAssetMetadataJSON]> => {

  try {
    return [
      await getLsp7Metadata(assetAddress, wallet)
    ]
  } 
   catch (error) {
    console.error(error)
    return [
      {
        LSP4Metadata: {
          description: '',
          links: [],
          images: [[]],
          icon: [],
          assets: [],
        },
      }
    ]
  }
}

/**
 * Get LSP4 metadata from lsp7 token contract 
 *
 * @param assetAddress - token address
 * @param tokenId - token identifier
 * @returns
 */
const getLsp4Metadata = async (assetAddress: string, wallet: WalletState | null) => {
 
    const provider = new ethers.providers.JsonRpcProvider(getWalletProvider(wallet));

    const lsp7Contract = new ethers.Contract(
        assetAddress,
        LSP7DigitalAssetContract.abi,
        provider
    );

    const metadata = await lsp7Contract.getData(ERC725YDataKeys.LSP4.LSP4Metadata);

  return metadata
}

const formatUrl = (url: string) => {

    if(url.startsWith("/")){
        return "https://" + url.slice(1);
    }

    if(url.startsWith("http")){
        return url;
    }

    return IPFS_URL+url;
}

/**
 * Get LSP7 metadata  as json object
 * It first try to check asset LSP4Metadata key and when it's empty we fall back to LSP8TokenMetadataBaseURI key
 *
 * @param assetAddress - token address
 * @param tokenId - token id
 * @returns
 */
const getLsp7Metadata = async (
  assetAddress: string,
  wallet: WalletState | null
) => {
  let getData: URLDataWithHash
  let url: string = '';

  const lsp4metadataForTokenId = await getLsp4Metadata(assetAddress, wallet)

  if (lsp4metadataForTokenId !== "0x") {
    const decode = ERC725.decodeData(
      [
        {
          value: lsp4metadataForTokenId,
          keyName: ERC725YDataKeys.LSP4.LSP4Metadata,
        },
      ],
      LSP4DigitalAsset as ERC725JSONSchema[]
    )
    getData = decode[0].value as URLDataWithHash
    url = resolveUrl(getData.url)
  } 

  console.debug('LSP7 metadata', {
    url,
    assetAddress,
  })

  // fetch json file
  const lsp7Metadata = await fetch(formatUrl(url)).then(async response => {
    if (!response.ok) {
      let text: any = (await response.text()) || response.statusText
      if (text) {
        try {
          text = JSON.parse(text)
          text = text.message || text.error || text
        } catch {
          // Ignore
        }
        throw new Error(text)
      }
    }
    return response.json().catch(error => {
      console.error(url, error, response.status, response.statusText)
      throw new Error('Unable to parse json')
    })
  })

  return lsp7Metadata;
}