// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

/// ============ Imports ============
import "@openzeppelin/contracts/access/Ownable.sol"; // OZ: Ownership
import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; // OZ: ERC721
//import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

///@title LifeOutGenesis
///@author jeissoni
contract LifeOutGenesis is Ownable, ERC721 {

    using Counters for Counters.Counter;


    /// ===========================================
    /// ============ Immutable storage ============

    /// @notice Available NFT supply    
    uint256 public immutable AVAILABLE_SUPPLY;



    /// ===========================================
    /// ============ Mutable storage ==============
    
    /// @notice Number of NFTs minted    
    uint256 public nftCount = 0;

    /// @notice owner activates the mint
    bool public proceedsMint = false;

    /// @notice Cost to mint each NFT (in wei)    
    uint256 public mintCost;

    /// @notice if for 
    Counters.Counter private tokenIdCounter;

    ///@notice string with the base for the tokenURI 
    string private baseURI;

   


    mapping(address => bool) private whiteListFirstStageClaimed;




    
    
    /// ===========================================
    /// ============ Events =======================
    
    /// @notice Emitted after owner set mint price
    /// @param owner Address of owner
    /// @param amount in wei per NFT
    event SetMintCost(address indexed owner, uint256 amount);

    /// @notice Emitted after owner set baseURI
    /// @param user Address of owner
    /// @param baseURI string whit baseURI
    event SetBaseURI(address indexed user, string baseURI);

    /// @notice Emitted after owner set root merk
    /// @param owner Address of owner
    /// @param merkleRoot xxxxxx
    event SetMerkleRoot(address indexed owner, bytes32 merkleRoot);


    /// ===========================================
    /// ============ Constructor ==================

    constructor() ERC721("Life Out Genesis", "LOG") {
        AVAILABLE_SUPPLY = 999;
        tokenIdCounter.increment();
        mintCost = 0.1 ether;
    }

    /// ===========================================
    /// ============ Functions ====================

    ///@notice Allows set price mint by owner 
    ///@param _mintCost value price mint
    function setMintCost(uint256 _mintCost) external onlyOwner {
        mintCost = _mintCost;
        emit SetMintCost(msg.sender, _mintCost);
    }

    ///@notice return string of baseURI
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    ///@notice Sets baseURI of NFT
    ///@param _setBaseUri string whit baseURI 
    function setBaseURI(string memory _setBaseUri) external onlyOwner {
        baseURI = _setBaseUri;
        emit SetBaseURI(msg.sender, _setBaseUri);
    }



  
    function whiteListMint(bytes32[] calldata _merkleProof) external payable {

        require(!whiteListFirstStageClaimed[msg.sender], "Address has already claimed.");

        // Ensure sufficient raffle ticket payment
        require(msg.value == mintCost, "Incorrect payment");

        // Mint NFT to caller
        _safeMint(msg.sender, tokenIdCounter.current());

        tokenIdCounter.increment();

        whiteListFirstStageClaimed[msg.sender] = true ;


    }


    

}