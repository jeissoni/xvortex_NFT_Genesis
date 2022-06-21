// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.4;

/// ============ Imports ============
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; 
import "@openzeppelin/contracts/access/Ownable.sol"; 

///@title LifeOutGenesis
///@notice Token ERC721 for the life Out 
contract LifeOutGenesis is ERC721, Ownable {
    ///============================================
    ///============= Errors =======================
    
    ///@notice NFT per address limit exceeded
    ///@param user Caller address 
    ///@param balanceOf User NFT balance
    error NftLimitPerDirection(address user, uint256 balanceOf); 

    ///@notice The sent value of ETH is not correct to make the purchase
    ///@param user Caller address 
    ///@param amountSent Amount sent by the user 
    error IncorrectPayment(address user, uint256 amountSent);
   
    ///@notice No funds to transfer
    ///@param owner Caller address
    error NotFondsToTranfer(address owner);

    ///@notice Error transferring funds to account
    ///@param owner Caller address
    error UnsuccessfulPayout(address owner);

    ///@notice Invoked token number does not exist    
    error TokenDoesNotExist();
    
    ///@notice The sale not started
    ///@param user Caller address
    error SaleNotStarted(address user);

    ///@notice No token available for sale
    ///@param user Caller address
    error NftSoldOut(address user);

    /// ===========================================
    /// ============ Immutable storage ============
    /// @notice Available NFT supply
    uint256 public immutable AVAILABLE_SUPPLY;

    /// ===========================================
    /// ============ Mutable storage ==============  
    ///@notice Type of variable used for handling numeric sequences
    using Counters for Counters.Counter;

    ///@notice String with the base for the tokenURI
    string public baseURI;   

    ///@notice Used to know if the goal is revealed or not
    bool public revelate;  

    /// @notice Number of NFTs minted
    Counters.Counter public tokenIdCounter;   

    /// @notice Cost to mint each NFT (in wei)
    uint256 public mintCost;

    ///@notice Maximum number of nft to buy per address
    uint256 public limitNftByAddress;

    ///@notice used to know if the sale of NFT has started
    bool public startSale;
    
    /// ======================================================
    /// ============ Constructor =============================
    constructor() ERC721("Life Out Genesis", "LOG") {
        AVAILABLE_SUPPLY = 999;  
        limitNftByAddress = 3;     
        tokenIdCounter.increment();
        mintCost = 0.3 ether;    
        baseURI = "ipfs://QmVy37A4BSoBjz3AMgZCaSE2JZMGoNuo4LebP7pZTSUBMT";   
    }

    /// ========================================================
    /// ============= Event ====================================
    /// @notice Emitted after a successful Withdraw Proceeds
    /// @param owner Address of owner 
    /// @param amount Amount of proceeds claimed by owner
    event WithdrawProceeds(address indexed owner, uint256 amount );

    /// @notice Emitted after a successful Mint Nft
    /// @param user Address of the user Mint
    /// @param tokenId Number token Mint
    event MintLifeOutGenesis(address indexed user, uint256 tokenId); 

    /// @notice Emitted after a successful change starSale variable
    /// @param owner Address of owner
    /// @param date Date when change 
    event SetStartSale(address indexed owner, uint256 date);
   
    /// =========================================================
    /// ============ Functions ==================================
  

    //****************************************************** */
    // ************* functions set parameter *************** */
    ///@notice start public sale
    ///@param value value in bowling for sale
    function setStartSale(bool value) external onlyOwner {
        startSale = value;
        emit SetStartSale(msg.sender, block.timestamp);
    }
  
    ///@notice Sets baseURI of NFT
    ///@param setBaseUri string whit baseURI
    function setBaseURI(string memory setBaseUri) external onlyOwner {
        baseURI = setBaseUri;
    }

    ///@notice start the sale of NFTs
    ///@param value boolean value for sale
    function setRevelate(bool value) external onlyOwner{
        revelate = value;
    }

    ///@notice return tokenURI for each token
    ///@param tokenId the id of the token you want the tokenURI
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {   
        if (!_exists(tokenId)){
            revert TokenDoesNotExist();
        }
        if(!revelate){
            return baseURI;
        }
        return string(abi.encodePacked(baseURI, Strings.toString(tokenId), ".json"));
    }
      
  
    //************************************************* */
    //************** mint function********************* */  
    ///@notice buy from NFT
    ///@param amountNft number of NFTs you want to buy
    function mintLifeOutGenesis(uint256 amountNft) external payable {

        if(!startSale){
            revert SaleNotStarted(msg.sender);
        }

        if (msg.value != mintCost * amountNft) {
            revert IncorrectPayment(msg.sender, msg.value);
        }

        if(amountNft > (limitNftByAddress - balanceOf(msg.sender))){
            revert NftLimitPerDirection(
                msg.sender,
                balanceOf(msg.sender));
                
        }                

        for(uint i; i < amountNft ; i++){
            
            if(tokenIdCounter.current() > AVAILABLE_SUPPLY){
                revert NftSoldOut(msg.sender);
            }   
            _safeMint(msg.sender, tokenIdCounter.current());        
            tokenIdCounter.increment();
            emit MintLifeOutGenesis(msg.sender, tokenIdCounter.current() - 1);
        }          
   
    }

    //****************************************************** */
    //***************** withdraw function******************* */
    ///@notice withdraw funds by owner
    function withdrawProceeds() external onlyOwner {
        uint256 balance = address(this).balance;        
        if (balance == 0){ revert NotFondsToTranfer(msg.sender);}        
        (bool sent, ) = payable(msg.sender).call{value: balance}("");
        if (!sent){revert UnsuccessfulPayout(msg.sender);}        
        emit WithdrawProceeds(msg.sender, balance);
    }    
}