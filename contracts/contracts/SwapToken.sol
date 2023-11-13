// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SwapToken {
    struct Swap {
        Status status;
        string description;
        address owner;
        address target;
        address[] ownerTokens;
        uint256[] ownerTokenIds;
        address[] targetAccountTokens;
        uint256[] targetAccountTokenIds;
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
        uint256[] ownerTokenIds,
        address target,
        address[] targetAccountTokens,
        uint256[] targetAccountTokenIds);
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
        uint256[] memory _ownerTokenIds,
        address[] memory _targetAccountTokens,
        uint256[] memory _targetAccountTokenIds
    ) public {
        // checks lenghts
        require(_ownerTokens.length == _ownerTokenIds.length, "!length");
        require(_ownerTokens.length != 0, "length");

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
        uint256[] memory swapTokenIds = swaps[_swapId].targetAccountTokenIds;
        for (uint256 i = 0; i < swapTokens.length; i++) {
            IERC721(swapTokens[i]).safeTransferFrom(
                target,
                owner,
                swapTokenIds[i]
            );
        }

        // swap buyer token
        address[] memory offerTokens = swaps[_swapId].ownerTokens;
        uint256[] memory offerTokenIds = swaps[_swapId].ownerTokenIds;
        if (offerTokens.length != 0) {
            for (uint256 i = 0; i < offerTokens.length; i++) {
                IERC721(offerTokens[i]).safeTransferFrom(
                    owner,
                    target,
                    offerTokenIds[i]
                );
            }
        }

        // update some mappings
        swaps[_swapId].status = Status.ACCEPTED;

        // emit event
        emit SwapAccepted(_swapId);
    }
}