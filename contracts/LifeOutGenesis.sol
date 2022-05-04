// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "hardhat/console.sol";


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
    uint256 private immutable AVAILABLE_SUPPLY;

    /// ===========================================
    /// ============ Mutable storage ==============

    /// @notice Number of NFTs minted
    uint256 private nftCount;

    uint256 private nftFirts;

    uint256 private nftSecond;

    uint256 private nftThird;


    /// @notice owner activates the mint
    bool private proceedsMint = false;

    /// @notice Cost to mint each NFT (in wei)
    uint256 private mintCost;

    /// @notice if for
    Counters.Counter private tokenIdCounter;

    ///@notice string with the base for the tokenURI
    string private baseURI;

    bool private startFirstStage ;
    bool private startSecondStage ;
    bool private startThirdStage ;
    bool private startPublicSale ;

    mapping(address => bool) private whiteListFirst;

    mapping(address => bool) private whiteListSecond;

    mapping(address => bool) private whiteListThird;

    mapping(address => bool) private whiteListFirstStageClaimed;

    mapping(address => bool) private whiteListSecondStageClaimed;

    mapping(address => bool) private whiteListThirdStageClaimed;

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

    event WithdrawProceeds(address indexed owner, uint256 balance);

    event AddWhiteListFirst(address indexed user);

    event AddWhiteListSecond(address indexed user);

    event AddWhiteListThird(address indexed user);

    event DeleteWhiteListFirst(address indexed user);

    event DeleteWhiteListSecond(address indexed user);

    event DeleteWhiteListThird(address indexed user);

    event SetNftFirts(address indexed owner, uint256 supply);

    event SetNftSecond(address indexed owner, uint256 supply);

    event SetNftThird(address indexed owner, uint256 supply);

    event SetStartSecondStage (address indexed owner);

    event SetStartThirdStage (address indexed owner);

    event SetStartPublicSale (address indexed owner, bool state);


    /// ===========================================
    /// ============ Constructor ==================

    constructor() ERC721("Life Out Genesis", "LOG") {
        AVAILABLE_SUPPLY = 999;
        tokenIdCounter.increment();
        mintCost = 0.1 ether;
        startFirstStage = true;
        nftFirts = 333;
        nftSecond = 333;
        nftThird = 333;
    }

    /// ===========================================
    /// ============ Functions ====================

    //****************************************************** */
    //********** functions only reed *********************** */

    function  getCurrentTokenId() external view returns(uint256) {
        return tokenIdCounter.current();
    }
    function isStartFirstStage() external view returns (bool) {
        return startFirstStage;
    }
    function isStartSecondStage() external view returns (bool) {
        return startSecondStage;
    }
    function isStartThirdStage() external view returns (bool) {
        return startThirdStage;
    }
    function isStartPublicSale() external view returns (bool){
        return startPublicSale;
    }
    function getAvailabeSupply() external view returns (uint256) {
        return AVAILABLE_SUPPLY;
    }

    function getMintCost() external view returns (uint256){
        return mintCost;
    }

    function getNftCount() external view returns (uint256) {
        return nftCount;
    }
    function getNftFirts() external view returns (uint256) {
        return nftFirts;
    }
    function getNftSecond() external view returns (uint256) {
        return nftSecond;
    }
    function getnftThird() external view returns (uint256) {
        return nftThird;
    }





    //****************************************************** */
    // ************* functions set parameter *************** */
    ///@notice Allows set price mint by owner
    ///@param _mintCost value price mint
    function setMintCost(uint256 _mintCost) external onlyOwner {
        mintCost = _mintCost;
        emit SetMintCost(msg.sender, _mintCost);
    }

    function setNftFirts(uint256 _supply) external onlyOwner {

        require(_supply < (AVAILABLE_SUPPLY - nftCount), "The new value is not valid");
        nftFirts = _supply;
        emit SetNftFirts(msg.sender, _supply);
    }

    function setNftSecond(uint256 _supply) external onlyOwner {

        require(_supply < (AVAILABLE_SUPPLY - nftCount), "The new value is not valid");
        nftSecond = _supply;
        emit SetNftSecond(msg.sender, _supply);
    }

    function setNftThird(uint256 _supply) external onlyOwner {

        require(_supply < (AVAILABLE_SUPPLY - nftCount), "The new value is not valid");
        nftThird = _supply;
        emit SetNftThird(msg.sender, _supply);
    }
    
    function setStartSecondStage() external onlyOwner {
        startFirstStage = false;
        startSecondStage = true;
        emit SetStartSecondStage(msg.sender);        
    }
    function setStartThirdStage() external onlyOwner {
        startSecondStage = false;
        startThirdStage = true;
        emit SetStartThirdStage(msg.sender);
    }
    function setPublicSale(bool _state) external onlyOwner{
        startPublicSale = _state;
        emit SetStartPublicSale(msg.sender, _state);
    }


    //****************************************************** */
    //******************funcition URI ********************** */
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

    //************************************************ */
    //*********** add withe list **********************/
    function addWhiteListFirst(address _address) internal {
        whiteListFirst[_address] = true;
        emit AddWhiteListFirst(_address);
    }

    function addWhiteListThird(address _address) internal {
        whiteListThird[_address] = true;
        emit AddWhiteListThird(_address);
    }

    function addWhiteListSecond(address _address) internal {
        whiteListSecond[_address] = true;
        emit AddWhiteListSecond(_address);
    }

    ///@notice Add white list for the first phase
    ///@param _witheList list of allowed addresses
    function setWhiteListFirst(address[] calldata _witheList)
        external
        onlyOwner
    {
        for (uint i; i < _witheList.length; i++) {
            addWhiteListFirst(_witheList[i]);
        }
    }

    ///@notice Add white list for the Second phase
    ///@param _witheList list of allowed addresses
    function setWhiteListSecond(address[] calldata _witheList)
        external
        onlyOwner
    {
        for (uint i; i < _witheList.length; i++) {
            addWhiteListSecond(_witheList[i]);
        }
    }

    ///@notice Add white list for the Third phase
    ///@param _witheList list of allowed addresses
    function setWhiteListThird(address[] calldata _witheList)
        external
        onlyOwner
    {
        for (uint i; i < _witheList.length; i++) {
            addWhiteListThird(_witheList[i]);
        }
    }

    //**************************************************/
    //*************** delete withe list  ***************/
    function delteWhiteListFirst(address _address) internal {
        whiteListFirst[_address] = false;
        emit DeleteWhiteListFirst(_address);
    }

    function delteWhiteListSecond(address _address) internal {
        whiteListSecond[_address] = false;
        emit DeleteWhiteListSecond(_address);
    }

    function delteWhiteListThird(address _address) internal {
        whiteListThird[_address] = false;
        emit DeleteWhiteListThird(_address);
    }

    function deleteWhiteListFirst(address[] calldata _witheList)
        external
        onlyOwner
    {
        for (uint i; i < _witheList.length; i++) {
            delteWhiteListFirst(_witheList[i]);
        }
    }

    function deleteWhiteListThird(address[] calldata _witheList)
        external
        onlyOwner
    {
        for (uint i; i < _witheList.length; i++) {
            delteWhiteListThird(_witheList[i]);
        }
    }

    function deleteWhiteListSecond(address[] calldata _witheList)
        external
        onlyOwner
    {
        for (uint i; i < _witheList.length; i++) {
            delteWhiteListSecond(_witheList[i]);
        }
    }



    //************************************************* */
    //************** mint function********************* */
    function whiteListMint() external payable {
        require(
            !whiteListFirstStageClaimed[msg.sender],
            "Address has already claimed."
        );

        // Ensure sufficient raffle ticket payment
        require(msg.value == mintCost, "Incorrect payment");

        // Mint NFT to caller
        _safeMint(msg.sender, tokenIdCounter.current());

        tokenIdCounter.increment();

        whiteListFirstStageClaimed[msg.sender] = true;
    }

    //****************************************************** */
    //***************** withdraw function******************* */

    function withdrawProceeds() external onlyOwner {
        uint256 balace = address(this).balance;
        require(balace>0, "No funds to transfer");
        (bool sent, ) = payable(msg.sender).call{value: balace}(""); 
        require(sent, "Unsuccessful in payout");
        emit WithdrawProceeds(msg.sender, balace);
    }


}
