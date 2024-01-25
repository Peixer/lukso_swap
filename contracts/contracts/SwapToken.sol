// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/presets/LSP7Mintable.sol";
import "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/presets/LSP8Mintable.sol";

// SwapToken contract
// Swap LSP7 and LSP8 tokens on Lukso
// Made by LuksoSwap in January 2024

contract SwapToken {
    struct Swap {
        Status status;
        string description;
        address owner;
        address target;
        address[] ownerTokens;
        bytes32[] ownerTokenIds;
        uint256[] ownerTokenAmounts;
        bool[] ownerTokenTypes;
        address[] targetAccountTokens;
        bytes32[] targetAccountTokenIds;
        uint256[] targetAccountTokenAmounts;
        bool[] targetAccountTokenTypes;
        uint256 swapId;
    }

    uint256 public swapCount;
    mapping(uint256 => Swap) public swaps;
    mapping(address => uint256[]) public userSwaps; 
    mapping(address => uint256) public userSwapCount;

    event SwapCreated(uint256 swapId, address owner);
    event SwapCancelled(uint256 swapId);
    event SwapAccepted(uint256 swapId);

    enum Status {
        CREATED,
        ACCEPTED,
        CANCELLED
    }

    modifier onlyTarget(uint256 _swapId) {
        require(swaps[_swapId].target == msg.sender, "Only target Allowed");
        _;
    }

    modifier isApproved(address _tokenContract, uint256 _tokenId) {
        // add Approval
        require(
            IERC721(_tokenContract).getApproved(_tokenId) == address(this),
            "!approved"
        );
        _;
    }

    /**
     * @dev Initialize the contract settings, and owner to the deployer.
     */
    constructor() {}

    /**
     * @dev Creates a new order with status : `CREATED` and sets the escrow contract settings : token address and token id.
     * Can only be called is contract state is BLANK
     */
    function createSwap(
        string memory _description,
        address targetAddress,
        address[] memory _ownerTokens,
        bytes32[] memory _ownerTokenIds,
        uint256[] memory _ownerTokenAmounts,
        bool[] memory _ownerTokenTypes,
        address[] memory _targetAccountTokens,
        bytes32[] memory _targetAccountTokenIds,
        uint256[] memory _targetAccountTokenAmounts,
        bool[] memory _targetAccountTokenTypes
    ) public returns (uint256){

        // should validate all the tokens if the owner has approved the contract to transfer
        // should validate all the tokens if the target has approved the contract to transfer
        // should validate if the owner has the token
        
        // checks lengths
        require(_ownerTokens.length == _ownerTokenIds.length, "_ownerTokens and _ownerTokenIds should have the same length");
        require(_ownerTokens.length == _ownerTokenAmounts.length, "_ownerTokens and _ownerTokenAmounts should have the same length");
        require(_ownerTokens.length == _ownerTokenTypes.length, "_ownerTokens and _ownerTokenTypes should have the same length");
        require(_ownerTokens.length != 0, "_ownerTokens should not be empty");
        require(_targetAccountTokens.length == _targetAccountTokenIds.length, "_targetAccountTokens and _targetAccountTokenIds should have the same length");
        require(_targetAccountTokens.length == _targetAccountTokenAmounts.length, "_targetAccountTokens and _targetAccountTokenAmounts should have the same length");
        require(_targetAccountTokens.length == _targetAccountTokenTypes.length, "_targetAccountTokens and _targetAccountTokenTypes should have the same length");
        require(_targetAccountTokens.length != 0, "_targetAccountTokens should not be empty");

        // create swap
        uint256 swapId = swapCount;
        Swap memory swap_ = Swap(
            Status.CREATED, 
            _description, 
            msg.sender,
            targetAddress,
            _ownerTokens,
            _ownerTokenIds,
            _ownerTokenAmounts,
            _ownerTokenTypes,
            _targetAccountTokens,
            _targetAccountTokenIds,
            _targetAccountTokenAmounts,
            _targetAccountTokenTypes,
            swapId
        );

        // populate mappings/arrays
        swaps[swapId] = swap_;
        userSwaps[targetAddress].push(swapId);
        swapCount++;
        userSwapCount[targetAddress]++;

        emit SwapCreated(swapId, msg.sender);
        return swapId;
    }

    function cancelOffer(uint256 _swapId)
        public
        onlyTarget(_swapId)
    {
        require(
            swaps[_swapId].status == Status.CREATED,
            "Can't cancel now"
        );

        swaps[_swapId].status = Status.CANCELLED;
        emit SwapCancelled(_swapId);
    }

    function acceptOffer(uint256 _swapId)
        public
        onlyTarget(_swapId)
    {
        require(
            swaps[_swapId].status == Status.CREATED,
            "Can't accept now"
        );
        // addresses
        address target = swaps[_swapId].target;
        address owner = swaps[_swapId].owner;

        // swap seller token
        address[] memory swapTokens = swaps[_swapId].targetAccountTokens;
        bytes32[] memory swapTokenIds = swaps[_swapId].targetAccountTokenIds;
        uint256[] memory swapTokenAmounts = swaps[_swapId].targetAccountTokenAmounts;
        bool[] memory swapTokenTypes = swaps[_swapId].targetAccountTokenTypes;
        for (uint256 i = 0; i < swapTokens.length; i++) {
            if(swapTokenTypes[i]){
                LSP8Mintable(payable(swapTokens[i])).transfer(
                    target,
                    owner,
                    swapTokenIds[i],
                    true,
                    '0x'
                );
            } else{
                LSP7Mintable(payable(swapTokens[i])).transfer(
                    target,
                    owner,
                    swapTokenAmounts[i],
                    true,
                    '0x'
                );
            }
        }

        // swap buyer token
        address[] memory offerTokens = swaps[_swapId].ownerTokens;
        bytes32[] memory offerTokenIds = swaps[_swapId].ownerTokenIds;
        uint256[] memory offerTokenAmounts = swaps[_swapId].ownerTokenAmounts;
        bool[] memory offerTokenTypes = swaps[_swapId].ownerTokenTypes;
        if (offerTokens.length != 0) {
            for (uint256 i = 0; i < offerTokens.length; i++) {
                if(offerTokenTypes[i]){
                    LSP8Mintable(payable(offerTokens[i])).transfer(
                        owner,
                        target,
                        offerTokenIds[i],
                        true,
                        '0x'
                    );
                } else{
                    LSP7Mintable(payable(offerTokens[i])).transfer(
                        owner,
                        target,
                        offerTokenAmounts[i],
                        true,
                        '0x'
                    );
                }
            }
        }

        // update some mappings
        swaps[_swapId].status = Status.ACCEPTED;

        // emit event
        emit SwapAccepted(_swapId);
    }

    function getSwaps(address _user) public view returns (Swap[] memory) {
        Swap[] memory _swaps = new Swap[](userSwapCount[_user]);
        for (uint256 i = 0; i < userSwapCount[_user]; i++) {
            _swaps[i] = swaps[userSwaps[_user][i]];
        }   
        return _swaps;
    }
}