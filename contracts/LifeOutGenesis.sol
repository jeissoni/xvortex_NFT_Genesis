// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "hardhat/console.sol";

/// ============ Imports ============
import "@openzeppelin/contracts/utils/Counters.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; 

import "@openzeppelin/contracts/access/Ownable.sol"; // OZ: Ownership



///@title LifeOutGenesis
///@author jeissoni
contract LifeOutGenesis is ERC721, Ownable {

    //using Counters for Counters.Counter;

    /// ===========================================
    /// ============ Immutable storage ============

    /// @notice Available NFT supply
    uint256 private immutable AVAILABLE_SUPPLY;

    /// ===========================================
    /// ============ Mutable storage ==============  

    ///@notice string with the base for the tokenURI
    string private baseURI;   

    bool private startPublicSaleFirstSatge;
    bool private startPublicSaleSecondSatge;

    uint256 private endDatePublicSaleFirstStage;

    uint256 private endDatePublicSaleSecondStage;

    using Counters for Counters.Counter;

    /// @notice Number of NFTs minted
    Counters.Counter private tokenIdCounter;

    uint256 private nftFirts;

    uint256 private nftSecond;

    uint256 private nftThird;

    /// @notice Cost to mint each NFT (in wei)
    uint256 private mintCost;


    mapping(address => bool) private whiteListFirst;
    Counters.Counter private lengtWhiteListFirst;

    mapping(address => bool) private whiteListSecond;
    Counters.Counter private lengtWhiteListSecond;


    mapping(address => bool) private whiteListFirstStageClaimed;

    mapping(address => bool) private whiteListSecondStageClaimed;

    bool private startFirstStage;
    bool private startSecondStage;
    bool private startThirdStage;


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

    event DeleteWhiteListThirdStage(address indexed user);

    event SetNftFirts(address indexed owner, uint256 supply);

    event SetNftSecond(address indexed owner, uint256 supply);

    event SetNftThird(address indexed owner, uint256 supply);

    event SetStartFirstStage(address indexed owner);

    event SetStartSecondStage(address indexed owner);

    event SetStartThirdStage(address indexed owner);

    event SetStartPublicSaleFirstStage(
        address indexed owner,
        bool value,
        uint256 endDate
    );

    event SetStartPublicSaleSecondStage(
        address indexed owner,
        bool value,
        uint256 endDate
    );

    event Received(address indexed user, uint256 amount);

    event MintNftFirtsStage(address indexed user, uint256 tokenId);

    event MintNftThirdStage(address indexed user, uint256 tokenId);

    event MintPublicSaleFirstStage(address indexed user, uint256 tokenId);

    event MintPublicSaleSecondStage(address indexed user, uint256 tokenId);

    event MintPublicSaleThirdSatge(address indexed user, uint256 tokenId);

    event AddWhiteListFirstStage(address indexed owner, address indexed user);

    event AddWhiteListSecondStage(address indexed owner, address indexed user);

    event DeleteWhiteListFirstStage(
        address indexed owner,
        address indexed user
    );

    event DeleteWhiteListSecondStage(
        address indexed owner,
        address indexed user
    );

    event MintNftSecondStage(address indexed user, uint256 tokenId);



    ///============= Errors  ======================
    ///============================================
    
    error TimePublicSaleOver(address user, uint256 available, uint256 required); 

    error DateInvalid(address user, uint256 date);

    error ListToAddInWhiteListFirstIsInvalid(address user, uint256 available ,uint256 required);

    error WhiteListFirstIsFull(address user ,uint256 available ,uint256 required);

    error IsNotWhiteList(address user);

    error ListToAddInWhiteListSecondIsInvalid(address user, uint256 available ,uint256 required);

    error WhiteListSecondIsFull(address user ,uint256 available ,uint256 required);

    error AddressAlreadyClaimed(address user);
    
    error AddressIsNotWhitleList(address user);

    error IncorrectPayment(address user, uint256 available, uint256 required);

    error StageNotOpen(address user);
    
    error NftCountExceededStage(
        address user,
        uint256 available,
        uint256 required
    );

    /// ======================================================
    /// ============ Constructor =============================

    constructor() ERC721("Life Out Genesis", "LOG") {
        AVAILABLE_SUPPLY = 999;       
        tokenIdCounter.increment();
        mintCost = 0.1 ether;
        nftFirts = 333;
        nftSecond = 333;
        nftThird = 333;
    }

    /// ======================================================
    /// ============ Functions ===============================

    //****************************************************** */
    //********** functions only reed *********************** */

    function getCurrentTokenId() external view returns (uint256) {
        return tokenIdCounter.current();
    }
    function getAvailabeSupply() external view returns (uint256) {
        return AVAILABLE_SUPPLY;
    }
    function isStartPublicSaleFirstSatge() public view returns (bool){
        return startPublicSaleFirstSatge;
    }

    function isStartPublicSaleSecondSatge() public view returns (bool){
        return startPublicSaleSecondSatge;
    }

    
    function isStartFirstStage() public view returns (bool) {
        return startFirstStage;
    }  

    function getMintCost() external view returns (uint256) {
        return mintCost;
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
     function isWhiteListFirstStage(address _user) public view returns (bool) {
        return whiteListFirst[_user];
    }

    function isWhiteListSecondStage(address _user) public view returns (bool) {
        return whiteListSecond[_user];
    }

    function isWhiteListFirstStageClaimed(address _user) public view returns (bool){
        return whiteListFirstStageClaimed[_user];
    }

    
    function isWhiteListSecondStageClaimed(address _user) public view returns (bool){
        return whiteListSecondStageClaimed[_user];
    }

    function isStartSecondStage() public view returns (bool) {
        return startSecondStage;
    }

    function isStartThirdStage() external view returns (bool) {
        return startThirdStage;
    }

     function setNftSecond(uint256 _supply) external onlyOwner {
        require(
            _supply < (AVAILABLE_SUPPLY - tokenIdCounter.current()),
            "The new value is not valid"
        );
        nftSecond = _supply;
        emit SetNftSecond(msg.sender, _supply);
    }

    function setNftThird(uint256 _supply) external onlyOwner {
        require(
            _supply < (AVAILABLE_SUPPLY - tokenIdCounter.current()),
            "The new value is not valid"
        );
        nftThird = _supply;
        emit SetNftThird(msg.sender, _supply);
    }

    function setStartFirstStage() external onlyOwner {
        startFirstStage = true;
        startSecondStage = false;
        startThirdStage = false;
        emit SetStartFirstStage(msg.sender);
    }

    function setStartSecondStage() external onlyOwner {
        startFirstStage = false;
        startSecondStage = true;
        startThirdStage = false;
        emit SetStartSecondStage(msg.sender);
    }

    function setStartThirdStage() external onlyOwner {
        startFirstStage = false;
        startSecondStage = false;
        startThirdStage = true;
        emit SetStartThirdStage(msg.sender);
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
        require(
            _supply < (AVAILABLE_SUPPLY - tokenIdCounter.current()),
            "The new value is not valid"
        );
        nftFirts = _supply;
        emit SetNftFirts(msg.sender, _supply);
    }

    

   
    function setPublicSaleFirstStage(bool _value,uint256 _endDate)
        external
        onlyOwner
    {
      
        if(_endDate >  block.timestamp){
            revert DateInvalid(msg.sender, _endDate);
        }

        startPublicSaleFirstSatge = _value;
        endDatePublicSaleFirstStage = _endDate;
        
        emit SetStartPublicSaleFirstStage(msg.sender, _value, _endDate);
    }

    function setPublicSaleSecondStage(bool _value, uint256 _endDate)
        external
        onlyOwner
    {
      
        if(_endDate >  block.timestamp){
            revert DateInvalid(msg.sender, _endDate);
        }

        startPublicSaleSecondSatge = _value;
        endDatePublicSaleSecondStage = _endDate;
        
        emit SetStartPublicSaleFirstStage(msg.sender, _value, _endDate);
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
    function addWhiteListFirstStage(address _address) internal returns (bool) {
        whiteListFirst[_address] = true;
        return true;
    }

    function addWhiteListSecondStage(address _address) internal returns (bool) {
        whiteListSecond[_address] = true;
        return true;
    }

    ///@notice Add white list for the first phase
    ///@param _witheList list of allowed addresses
    function addListWhiteListFirstStage(address[] calldata _witheList)
        external
        onlyOwner
    {
        if(_witheList.length > nftFirts){
            revert ListToAddInWhiteListFirstIsInvalid(msg.sender, _witheList.length , nftFirts);
        }

        if (lengtWhiteListFirst.current() >= nftFirts) {
            revert WhiteListFirstIsFull(msg.sender, lengtWhiteListFirst.current(), nftFirts);
        }

        for (uint i; i < _witheList.length; i++) {
            require(
                addWhiteListFirstStage(_witheList[i]),
                "it was not possible to enter the address"
            );
            lengtWhiteListFirst.increment();
            emit AddWhiteListFirstStage(msg.sender, _witheList[i]);
        }
    }

    ///@notice Add white list for the Second phase
    ///@param _witheList list of allowed addresses
    function addListWhiteListSecondStage(address[] calldata _witheList)
        external
        onlyOwner
    {
         if(_witheList.length > nftSecond){
            revert ListToAddInWhiteListSecondIsInvalid(msg.sender, _witheList.length , nftSecond);
        }

        if (lengtWhiteListSecond.current() >= nftSecond) {
            revert WhiteListSecondIsFull(msg.sender, lengtWhiteListSecond.current(), nftSecond);
        }

        for (uint i; i < _witheList.length; i++) {
            require(
                addWhiteListSecondStage(_witheList[i]),
                "it was not possible to enter the address"
            );
            lengtWhiteListSecond.increment();
            emit AddWhiteListSecondStage(msg.sender, _witheList[i]);
        }
    }

    //**************************************************/
    //*************** delete withe list  ***************/
    function delteWhiteListFirstStage(address _address)
        internal
        returns (bool)
    {
        whiteListFirst[_address] = false;
        return true;
    }

    function delteWhiteListSecondStage(address _address)
        internal
        returns (bool)
    {
        whiteListSecond[_address] = false;
        return true;
    }

    function deleteListWhiteListFirstStage(address[] calldata _witheList)
        external
        onlyOwner
    {
        for (uint i; i < _witheList.length; i++) {

            if(!isWhiteListFirstStage(_witheList[i])){
                revert IsNotWhiteList(_witheList[i]);
            }

            if(isWhiteListFirstStageClaimed(_witheList[i])){
                revert AddressAlreadyClaimed(_witheList[i]);
            }
         
            require(
                delteWhiteListFirstStage(_witheList[i]),
                "the address could not delete"
            );

            lengtWhiteListFirst.decrement();

            emit DeleteWhiteListFirstStage(msg.sender, _witheList[i]);
        }
    }

    function deleteListWhiteListSecondStage(address[] calldata _witheList)
        external
        onlyOwner
    {
        for (uint i; i < _witheList.length; i++) {
            
            if(!isWhiteListSecondStage(_witheList[i])){
                revert IsNotWhiteList(_witheList[i]);
            }

            if(isWhiteListSecondStageClaimed(_witheList[i])){
                revert AddressAlreadyClaimed(_witheList[i]);
            }

            require(
                delteWhiteListSecondStage(_witheList[i]),
                "the address could not delete"
            );

            lengtWhiteListSecond.decrement();

            emit DeleteWhiteListSecondStage(msg.sender, _witheList[i]);
        }
    }

  



    //************************************************* */
    //************** mint function********************* */
    function whiteListMintFirstStage() external payable {
        if (!isStartFirstStage()) {
            revert StageNotOpen(msg.sender);
        }

        if (!isWhiteListFirstStage(msg.sender)) {
            revert AddressIsNotWhitleList(msg.sender);
        }

        if (msg.value != mintCost) {
            revert IncorrectPayment(msg.sender, msg.value, mintCost);
        }

        if (isWhiteListFirstStageClaimed(msg.sender)) {
            revert AddressAlreadyClaimed(msg.sender);
        }

        if (tokenIdCounter.current() > nftFirts) {
            revert NftCountExceededStage(
                msg.sender,
                tokenIdCounter.current(),
                nftFirts
            );
        }

        // Mint NFT to caller
        _safeMint(msg.sender, tokenIdCounter.current());
        
        whiteListFirstStageClaimed[msg.sender] = true;        
        
        tokenIdCounter.increment();

        emit MintNftFirtsStage(msg.sender, tokenIdCounter.current() - 1);

    }

      function whiteListMintSecondStage() external payable {
        
        if (!isStartSecondStage()) {
            revert StageNotOpen(msg.sender);
        }

        if (!isWhiteListSecondStage(msg.sender)) {
            revert AddressIsNotWhitleList(msg.sender);
        }

        if (msg.value != mintCost) {
            revert IncorrectPayment(msg.sender, msg.value, mintCost);
        }

        if (isWhiteListSecondStageClaimed(msg.sender)) {
            revert AddressAlreadyClaimed(msg.sender);
        }

        if (tokenIdCounter.current() > nftFirts) {
            revert NftCountExceededStage(
                msg.sender,
                tokenIdCounter.current(),
                nftFirts
            );
        }

        // Mint NFT to caller
        _safeMint(msg.sender, tokenIdCounter.current());
        
        whiteListSecondStageClaimed[msg.sender] = true;        
        
        tokenIdCounter.increment();

        emit MintNftSecondStage(msg.sender, tokenIdCounter.current() - 1);
    }

    

    function firstStagePublicSale() external payable{

        if (!isStartPublicSaleFirstSatge()){
            revert StageNotOpen(msg.sender);
        }

        if (msg.value != mintCost) {
            revert IncorrectPayment(msg.sender, msg.value, mintCost);
        }

        if (block.timestamp > endDatePublicSaleFirstStage){
            revert TimePublicSaleOver(
                msg.sender,
                block.timestamp,
                endDatePublicSaleFirstStage
            );
        }

        if(tokenIdCounter.current() > nftFirts ){
            revert NftCountExceededStage(
                msg.sender,
                tokenIdCounter.current(),
                nftFirts
            );
        }

         _safeMint(msg.sender, tokenIdCounter.current());

         tokenIdCounter.increment();

         emit MintPublicSaleFirstStage(msg.sender, tokenIdCounter.current() - 1);
         
    }

    function SecondtStagePublicSale() external payable{

        if (!isStartPublicSaleSecondSatge()){
            revert StageNotOpen(msg.sender);
        }

        if (msg.value != mintCost) {
            revert IncorrectPayment(msg.sender, msg.value, mintCost);
        }

        if (block.timestamp > endDatePublicSaleSecondStage){
            revert TimePublicSaleOver(
                msg.sender,
                block.timestamp,
                endDatePublicSaleSecondStage
            );
        }

        if(tokenIdCounter.current() > nftSecond ){
            revert NftCountExceededStage(
                msg.sender,
                tokenIdCounter.current(),
                nftSecond
            );
        }

        _safeMint(msg.sender, tokenIdCounter.current());

        tokenIdCounter.increment();

        emit MintPublicSaleSecondStage(msg.sender, tokenIdCounter.current() - 1);
         
    }

    function ThirdtStagePublicSale() external payable{

        if (!isStartPublicSaleSecondSatge()){
            revert StageNotOpen(msg.sender);
        }

        if (msg.value != mintCost) {
            revert IncorrectPayment(msg.sender, msg.value, mintCost);
        }       

        if(tokenIdCounter.current() > nftThird ){
            revert NftCountExceededStage(
                msg.sender,
                tokenIdCounter.current(),
                nftThird
            );
        }

        _safeMint(msg.sender, tokenIdCounter.current());

        tokenIdCounter.increment();

        emit MintPublicSaleThirdSatge(msg.sender, tokenIdCounter.current() - 1);
         
    }





    //****************************************************** */
    //***************** withdraw function******************* */
    function withdrawProceeds() external onlyOwner {
        uint256 balace = address(this).balance;
        require(balace > 0, "No funds to transfer");
        (bool sent, ) = payable(msg.sender).call{value: balace}("");
        require(sent, "Unsuccessful in payout");
        emit WithdrawProceeds(msg.sender, balace);
    }

    //******************************************************* */
    //**************** Fallback Functions ******************* */
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
