/**
 * @dev List of LSP8 Token ID Formats that can be used to create different types of NFTs and represent each NFT identifiers (= tokenIds) differently.
 * @see For details see: https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-8-IdentifiableDigitalAsset.md#lsp8tokenidformat
 */
export const LSP8_TOKEN_ID_FORMAT = {
  NUMBER: 0,
  STRING: 1,
  ADDRESS: 2,
  UNIQUE_ID: 3,
  HASH: 4,
  MIXED_DEFAULT_NUMBER: 100,
  MIXED_DEFAULT_STRING: 101,
  MIXED_DEFAULT_ADDRESS: 102,
  MIXED_DEFAULT_UNIQUE_ID: 103,
  MIXED_DEFAULT_HASH: 104,
};