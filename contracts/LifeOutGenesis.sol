// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;


/// ============ Imports ============
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; 
import "@openzeppelin/contracts/access/Ownable.sol"; 
import { Error } from "../contracts/library/ErrorLibrary.sol";

///@title LifeOutGenesis
///@author jeissoni
contract LifeOutGenesis is ERC721, Ownable {

    using Counters for Counters.Counter;

    /// ===========================================
    /// ============ Immutable storage ============

    /// @notice Available NFT supply
    uint256 private immutable AVAILABLE_SUPPLY;

    /// ===========================================
    /// ============ Mutable storage ==============  

    ///@notice string with the base for the tokenURI
    string private baseURI;   
    bool private revelate;  

    /// @notice Number of NFTs minted
    Counters.Counter private tokenIdCounter;   

    /// @notice Cost to mint each NFT (in wei)
    uint256 private mintCost;
    mapping(address => uint256[]) private nftByAddress;
    uint256 private limitNftByAddress;
    bool private startSale;
    
    /// ======================================================
    /// ============ Constructor =============================
    constructor() ERC721("Life Out Genesis", "LOG") {
        AVAILABLE_SUPPLY = 999;  
        limitNftByAddress = 5;     
        tokenIdCounter.increment();
        mintCost = 0.3 ether;       
    }

    /// ========================================================
    /// ============= Event ====================================

    event WithdrawProceeds(address indexed owner, uint256 balance);

    event Received(address indexed user, uint256 amount);

    event MintLifeOutGenesis(address indexed user, uint256 tokenId);

    event SetStartSale(address indexed owner, bool value);
   

    /// ======================================================
    /// ============ Functions ===============================
   
    //****************************************************** */
    //********** functions reed only  *********************** */

    function getBaseURI() external view returns(string memory){
        return baseURI;
    }
    function getCurrentTokenId() external view returns (uint256) {
        return tokenIdCounter.current();
    }       
    function getMintCost() external view returns (uint256) {
        return mintCost;
    }  
    function getAvailabeSupply() external view returns (uint256) {
        return AVAILABLE_SUPPLY;
    }
    function getLimitNftByAddress() external view returns (uint256){
        return limitNftByAddress;
    }
    function isRevelated() external view returns (bool){
        return revelate;
    }
    function isStartSale() external view returns (bool) {
        return startSale;
    }
    function isValueSendInvalid (uint256 _value, address _sender) internal view {
         if (_value != mintCost) {
            revert Error.IncorrectPayment(_sender, _value, mintCost);
        }  
    }

    //****************************************************** */
    // ************* functions set parameter *************** */
    function setStartSale(bool _value) external onlyOwner {
        startSale = _value;
    }

    //****************************************************** */
    //******************funcition URI ********************** */
   
    ///@notice Sets baseURI of NFT
    ///@param _setBaseUri string whit baseURI
    function setBaseURI(string memory _setBaseUri) external onlyOwner {
        baseURI = _setBaseUri;
    }
    function setRevelate(bool _value) external onlyOwner{
        revelate = _value;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {    
        if (!_exists(tokenId)){
            revert Error.TokenDoesNotExist(msg.sender, tokenId);
        }
        if(!revelate){
            return baseURI;
        }
        return string(abi.encodePacked(baseURI, Strings.toString(tokenId), ".json"));
    }    
      
    //************************************************* */
    //************** mint function********************* */  
    function mintLifeOutGenesis(uint256 _amountNft) external payable {

        if(!startSale){
            revert Error.NotStarSale(msg.sender);
        }

        if (msg.value != mintCost * _amountNft) {
            revert Error.IncorrectPayment(msg.sender, msg.value, mintCost);
        }

        if(_amountNft > (limitNftByAddress - nftByAddress[msg.sender].length)){
            revert Error.NftLimitAddress(
                msg.sender,
                nftByAddress[msg.sender].length,
                limitNftByAddress);
        }

        if(tokenIdCounter.current() > AVAILABLE_SUPPLY){
            revert Error.NftSoldOut(msg.sender);
        }           

        for(uint i; i < _amountNft ; i++){
            // Mint NFT to caller
            nftByAddress[msg.sender].push(tokenIdCounter.current());
            _safeMint(msg.sender, tokenIdCounter.current());        
            tokenIdCounter.increment();
            emit MintLifeOutGenesis(msg.sender, tokenIdCounter.current() - 1);
        }          
   
    }

    //****************************************************** */
    //***************** withdraw function******************* */
    function withdrawProceeds() external onlyOwner {
        uint256 balace = address(this).balance;        
        if (balace == 0){ revert Error.NotFondsToTranfer(msg.sender);}        
        (bool sent, ) = payable(msg.sender).call{value: balace}("");
        if (!sent){revert Error.UnsuccessfulPayout(msg.sender);}        
        emit WithdrawProceeds(msg.sender, balace);
    }

    //******************************************************* */
    //**************** Fallback Functions ******************* */
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }   
}
