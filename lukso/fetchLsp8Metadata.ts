import LSP8IdentifiableDigitalAssetSchema from '@erc725/erc725.js/schemas/LSP8IdentifiableDigitalAsset.json'
import LSP8IdentifiableDigitalAssetContract from '@lukso/lsp-smart-contracts/artifacts/LSP8IdentifiableDigitalAsset.json'
import { hexToUtf8, hexToNumber } from 'web3-utils'
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
import { LSP8_TOKEN_ID_FORMAT } from './types/Lsp8TokenIdType'
import { IPFS_URL } from '../util/config'

export const fetchLsp8Metadata = async (
  tokenId: string,
  assetAddress: string,
  wallet: WalletState | null
): Promise<[LSP4DigitalAssetMetadataJSON, number]> => {

  const erc725 = getInstance(
    LSP8IdentifiableDigitalAssetSchema as ERC725JSONSchema[],
    assetAddress,
    wallet
  )
  const supportedTokenIdFormats = Object.values(LSP8_TOKEN_ID_FORMAT)

  try {
    const lsp8DigitalAsset = await erc725.fetchData('LSP8TokenIdFormat')
    const tokenIdFormat = Number(lsp8DigitalAsset.value)

    if (supportedTokenIdFormats.includes(tokenIdFormat)) {
      return [
        await getLsp8Metadata(assetAddress, tokenId, tokenIdFormat, wallet),
        tokenIdFormat,
      ]
    } else {
      throw new Error(
        `Unsupported LSP8 tokenIdFormat '${tokenIdFormat}' for '${assetAddress}' asset`
      )
    }
  } catch (error) {
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
      },
      -1,
    ]
  }
}

function hexToString(hex: string) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  }

/**
 * Get the base URI of LSP8 token
 * https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8tokenmetadatabaseuri
 *
 * @param assetAddress - token address
 * @returns
 */
export const getLsp8TokenMetadataBaseUri = async (assetAddress: string, wallet: WalletState | null) => {
  const erc725 = getInstance(
    LSP8IdentifiableDigitalAssetSchema as ERC725JSONSchema[],
    assetAddress,
    wallet
  );

  const lsp8metadataBaseURI = await erc725.getData('LSP8TokenMetadataBaseURI') as any;
  
  const hexValue = lsp8metadataBaseURI?.value?.verification.data;
  const stringValue = hexToString(hexValue.slice(2)).slice(7);

  return stringValue+lsp8metadataBaseURI?.value?.url;
}

/**
 * Get LSP4 metadata from token contract based on tokenId
 *
 * @param assetAddress - token address
 * @param tokenId - token identifier
 * @returns
 */
const getLsp4Metadata = async (assetAddress: string, tokenId: string, wallet: WalletState | null) => {
 
    const provider = new ethers.providers.JsonRpcProvider(getWalletProvider(wallet));

    const lsp8Contract = new ethers.Contract(
        assetAddress,
        LSP8IdentifiableDigitalAssetContract.abi,
        provider
    );

    const metadata = await lsp8Contract.getDataForTokenId(tokenId, ERC725YDataKeys.LSP4.LSP4Metadata);

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
 * Get LSP8 metadata  as json object
 * It first try to check asset LSP4Metadata key and when it's empty we fall back to LSP8TokenMetadataBaseURI key
 *
 * @param assetAddress - token address
 * @param tokenId - token id
 * @returns
 */
const getLsp8Metadata = async (
  assetAddress: string,
  tokenId: string,
  tokenIdFormat: number,
  wallet: WalletState | null
) => {
  let getData: URLDataWithHash
  let url: string

  const lsp4metadataForTokenId = await getLsp4Metadata(assetAddress, tokenId, wallet)

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
  } else {
    let uri = await getLsp8TokenMetadataBaseUri(assetAddress, wallet)

    if (!uri) {
      throw new Error('LSP8TokenMetadataBaseURI is empty');
    }

    // TODO add support for mixed formats

    // decode token Id based on format
    const tokenIdParsed = (tokenId: string, tokenIdFormat: number) => {
      switch (tokenIdFormat) {
        case LSP8_TOKEN_ID_FORMAT.STRING:
          return hexToUtf8(tokenId) // decode hex value to string
        case LSP8_TOKEN_ID_FORMAT.NUMBER:
          return hexToNumber(tokenId).toString() // convert hex value to number
        case LSP8_TOKEN_ID_FORMAT.UNIQUE_ID:
        case LSP8_TOKEN_ID_FORMAT.HASH:
          return tokenId.slice(2) // remove 0x from uid/hash token ids
        default:
          return tokenId
      }
    }

    // in order to get full url we combine URI it with tokenId (must be lowercased)
    // we also resolve url as uri might be ipfs link
    url = resolveUrl(uri + tokenIdParsed(tokenId, tokenIdFormat).toLowerCase());
  }

  console.debug('LSP8 metadata', {
    url,
    tokenId,
    tokenIdFormat,
    assetAddress,
  })

  // fetch json file
  const lsp8Metadata = await fetch(formatUrl(url)).then(async response => {
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

  return lsp8Metadata;
}