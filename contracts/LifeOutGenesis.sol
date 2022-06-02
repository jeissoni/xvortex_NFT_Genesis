// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.4;
//@audit establecer una versión de solidity

//@audit hay muchas variables private con getter, si no se hereda de este contrato podrían hacerse public
//@audit los nombres de los errores tienen algunos errores de tipeo

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
    string public baseURI;   
    bool private revelate;  

    /// @notice Number of NFTs minted
    Counters.Counter private tokenIdCounter;   

    /// @notice Cost to mint each NFT (in wei)
    uint256 public mintCost;
    uint256 public limitNftByAddress;
    bool public startSale;
    
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

    event SetStartSale(address indexed owner, uint256 date);
   
    /// =========================================================
    /// ============ Functions ==================================
   
    //******************************************************* */
    //********** functions reed only  *********************** */  
    function getCurrentTokenId() external view returns (uint256) {
        return tokenIdCounter.current();
    }        
    function getAvailableSupply() external view returns (uint256) {
        return AVAILABLE_SUPPLY;
    }
  

    //****************************************************** */
    // ************* functions set parameter *************** */ 
    function setStartSale(bool _value) external onlyOwner {
        startSale = _value;
        emit SetStartSale(msg.sender, block.timestamp);
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
        //@audit de acuerdo a la función mintLifeOutGenesis todos los tokenId son consecutivos
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
            revert Error.SaleNotStarted(msg.sender);
        }

        if (msg.value != mintCost * _amountNft) {
            revert Error.IncorrectPayment(msg.sender, msg.value, mintCost);
        }

        //@audit esto hace que cada address pueda mintear como máximo limitNftByAddress pero cada vez que se llama a la función
        //@audit nada me impide llamar nuevamente a la función y mintear limitNftByAddress nuevamente
        if(_amountNft > (limitNftByAddress - balanceOf(msg.sender))){
            revert Error.NftLimitPerDirection(
                msg.sender,
                balanceOf(msg.sender),
                limitNftByAddress);
        }                

        for(uint i; i < _amountNft ; i++){
            // Mint NFT to caller
            //@audit para qué sirve el mapping nftByAddress? acá se sobreescribe en cada ciclo del for (esto es caro en cuanto a gas)
            //nftByAddress[msg.sender].push(tokenIdCounter.current());
            //@audit hay reentrancy acá. _safeMint() llama a _checkOnERC721Received() y dado que tokenIdCounter se incrementa después de esta línea
            //@audit pueden mintearse más que el AVAILABLE_SUPPLY. Usar check-effects-interactions
            if(tokenIdCounter.current() > AVAILABLE_SUPPLY){
                revert Error.NftSoldOut(msg.sender);
            }   
            _safeMint(msg.sender, tokenIdCounter.current());        
            tokenIdCounter.increment();
            emit MintLifeOutGenesis(msg.sender, tokenIdCounter.current() - 1);
        }          
   
    }

    //****************************************************** */
    //***************** withdraw function******************* */
    function withdrawProceeds() external onlyOwner {
        uint256 balance = address(this).balance;        
        if (balance == 0){ revert Error.NotFondsToTranfer(msg.sender);}        
        (bool sent, ) = payable(msg.sender).call{value: balance}("");
        if (!sent){revert Error.UnsuccessfulPayout(msg.sender);}        
        emit WithdrawProceeds(msg.sender, balance);
    }    
}