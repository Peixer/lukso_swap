// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/ILSP8IdentifiableDigitalAsset.sol";

contract SwapToken {
    struct Swap {
        Status status;
        string description;
        address owner;
        address target;
        address[] ownerTokens;
        bytes32[] ownerTokenIds;
        address[] targetAccountTokens;
        bytes32[] targetAccountTokenIds;
        uint256 swapId;
    }

    uint256 public swapCount;
    mapping(uint256 => Swap) public swaps;
    mapping(address => Swap[]) public userSwaps; 
    mapping(address => uint256) public userSwapCount;

    event SwapCreated(
        uint256 swapId,
        address owner,
        address[] ownerTokens,
        bytes32[] ownerTokenIds,
        address target,
        address[] targetAccountTokens,
        bytes32[] targetAccountTokenIds);
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
        address[] memory _targetAccountTokens,
        bytes32[] memory _targetAccountTokenIds
    ) public returns (uint256){
        // should validate all the tokens if the owner has approved the contract to transfer
        // should validate all the tokens if the target has approved the contract to transfer
        // should validate if the owner has the token
        
        // checks lenghts
        require(_ownerTokens.length == _ownerTokenIds.length, "_ownerTokens should be equal to _ownerTokenIds");
        require(_ownerTokens.length != 0, "_ownerTokens should not be empty");
        require(_targetAccountTokens.length == _targetAccountTokenIds.length, "_targetAccountTokens should be equal to _targetAccountTokenIds");
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
            _targetAccountTokens,
            _targetAccountTokenIds,
            swapId
        );

        // populate mappings/arrays
        swaps[swapId] = swap_;
        userSwaps[msg.sender].push(swap_);
        swapCount++;
        userSwapCount[msg.sender]++;

        emit SwapCreated(swapId, msg.sender, _ownerTokens, _ownerTokenIds, targetAddress, _targetAccountTokens, _targetAccountTokenIds);
        return swapId;
    }

    function cancelOffer(uint256 _swapId)
        public
        onlyTarget(_swapId)
    {
        require(
            swaps[_swapId].status == Status.CREATED,
            "Can't Cancell now"
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
            "Can't Accept now"
        );
        // addresses
        address target = swaps[_swapId].target;
        address owner = swaps[_swapId].owner;

        // swap seller token
        address[] memory swapTokens = swaps[_swapId].targetAccountTokens;
        bytes32[] memory swapTokenIds = swaps[_swapId].targetAccountTokenIds;
        for (uint256 i = 0; i < swapTokens.length; i++) {
            ILSP8IdentifiableDigitalAsset(swapTokens[i]).transfer(
                target,
                owner,
                swapTokenIds[i],
                true,
                ""
            );
        }

        // swap buyer token
        address[] memory offerTokens = swaps[_swapId].ownerTokens;
        bytes32[] memory offerTokenIds = swaps[_swapId].ownerTokenIds;
        if (offerTokens.length != 0) {
            for (uint256 i = 0; i < offerTokens.length; i++) {
                ILSP8IdentifiableDigitalAsset(offerTokens[i]).transfer(
                    owner,
                    target,
                    offerTokenIds[i],
                    true,
                    ""
                );
            }
        }

        // update some mappings
        swaps[_swapId].status = Status.ACCEPTED;

        // emit event
        emit SwapAccepted(_swapId);
    }

    function getSwaps(address _user) public view returns (Swap[] memory) {
        return userSwaps[_user];
    }
}