// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "hardhat/console.sol";


/// ============ Imports ============
import "@openzeppelin/contracts/access/Ownable.sol"; // OZ: Ownership
import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; // OZ: ERC721
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
    Counters.Counter private nftCountMint;

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

    uint256 private startDatePublicSale;
    uint256 private endDatePublicSale;

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

    event AddWhiteListFirstStage(address indexed owner, address indexed user);

    event AddWhiteListSecondStage(address indexed owner, address indexed user);

    // event AddWhiteListThirdStage(address indexed user);

    event DeleteWhiteListFirstStage(address indexed owner, address indexed user);

    event DeleteWhiteListSecondStage(address indexed owner,address indexed user);

    event DeleteWhiteListThirdStage(address indexed user);

    event SetNftFirts(address indexed owner, uint256 supply);

    event SetNftSecond(address indexed owner, uint256 supply);

    event SetNftThird(address indexed owner, uint256 supply);

    event SetStartFirstStage(address indexed owner);

    event SetStartSecondStage(address indexed owner);

    event SetStartThirdStage(address indexed owner);

    event SetStartPublicSale(address indexed owner, uint256 startDate, uint256 endDate);

    event Received(address indexed user, uint256 amount);

    event MintNftFirtsStage(address indexed user, uint256 tokenId);

    ///============= Errors  ======================
    ///============================================
    error StageFirtsNotOpen(address user);

    error AddressAlreadyClaimedFirstStage(address user);

    error AddressIsNotWhitleListFirstStage(address user);

    error IncorrectPayment(address user, uint256 available, uint256 required);

    error NftAmountExceededFirstStage(address user, uint256 available, uint256 required);



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

    function  getCurrentTokenId() external view returns(uint256) {
        return tokenIdCounter.current();
    }
    function isStartFirstStage() public view returns (bool) {
        return startFirstStage;
    }
    function isStartSecondStage() external view returns (bool) {
        return startSecondStage;
    }
    function isStartThirdStage() external view returns (bool) {
        return startThirdStage;
    }
    function getStartPublicSale() external view returns (uint256){
        return startDatePublicSale;
    }

    function getEndPublicSale() external view returns (uint256){
        return endDatePublicSale;
    }
    function getAvailabeSupply() external view returns (uint256) {
        return AVAILABLE_SUPPLY;
    }

    function getMintCost() external view returns (uint256){
        return mintCost;
    }

    function getNftCount() external view returns (uint256) {
        return nftCountMint.current();
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



    //****************************************************** */
    // ************* functions set parameter *************** */
    ///@notice Allows set price mint by owner
    ///@param _mintCost value price mint
    function setMintCost(uint256 _mintCost) external onlyOwner {
        mintCost = _mintCost;
        emit SetMintCost(msg.sender, _mintCost);
    }

    function setNftFirts(uint256 _supply) external onlyOwner {

        require(_supply < (AVAILABLE_SUPPLY - nftCountMint.current()), "The new value is not valid");
        nftFirts = _supply;
        emit SetNftFirts(msg.sender, _supply);
    }

    function setNftSecond(uint256 _supply) external onlyOwner {

        require(_supply < (AVAILABLE_SUPPLY - nftCountMint.current()), "The new value is not valid");
        nftSecond = _supply;
        emit SetNftSecond(msg.sender, _supply);
    }

    function setNftThird(uint256 _supply) external onlyOwner {

        require(_supply < (AVAILABLE_SUPPLY - nftCountMint.current()), "The new value is not valid");
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

    function setPublicSale(uint256 _stardDate, uint256 _endDate) external onlyOwner{

        require(_stardDate > block.timestamp , "start time must be greater than current time");
        require(_endDate > _stardDate, "end time must be greater than start time" );

        startDatePublicSale = _stardDate;
        endDatePublicSale = _endDate;
        emit SetStartPublicSale(msg.sender, _stardDate, _endDate);
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
    function addWhiteListFirstStage(address _address) internal returns (bool){
        whiteListFirst[_address] = true;
        return true;       
    }

    function addWhiteListSecondStage( address _address) internal returns (bool) {
        whiteListSecond[_address] = true;
        return true;        
    }

    ///@notice Add white list for the first phase
    ///@param _witheList list of allowed addresses
    function addListWhiteListFirstStage(address[] calldata _witheList)
        external
        onlyOwner
    {
        require (_witheList.length <= nftFirts, "the number of addresses must be less than the amount of nft of stage");
        for (uint i; i < _witheList.length; i++) {
            require(addWhiteListFirstStage(_witheList[i]), "it was not possible to enter the address");
            emit AddWhiteListFirstStage(msg.sender , _witheList[i]);
        }
    }

    ///@notice Add white list for the Second phase
    ///@param _witheList list of allowed addresses
    function addListWhiteListSecondStage(address[] calldata _witheList)
        external
        onlyOwner
    {
        require (_witheList.length <= nftFirts, "the number of addresses must be less than the amount of nft of stage");
        for (uint i; i < _witheList.length; i++) {
            require(addWhiteListSecondStage(_witheList[i]), "it was not possible to enter the address");
            emit AddWhiteListSecondStage(msg.sender , _witheList[i]);
        }
    }

    

 
    //**************************************************/
    //*************** delete withe list  ***************/
    function delteWhiteListFirstStage(address _address) internal returns (bool) {
        whiteListFirst[_address] = false;
        return true;
       
    }

    function delteWhiteListSecondStage(address _address) internal returns (bool) {
        whiteListSecond[_address] = false;
        return true;        
    }

    function deleteListWhiteListFirstStage(address[] calldata _witheList)
        external
        onlyOwner
    {
        for (uint i; i < _witheList.length; i++) {
            
            require(isWhiteListFirstStage(_witheList[i]), 
                "the address is not in the whitelist");
                //string(abi.encodePacked('the address',' is not in the whitelist')));
            
            require(delteWhiteListFirstStage(_witheList[i]), 
                "the address could not delete");
            //string(abi.encodePacked("the address ", _witheList[i], " could not delete")));
             
            emit DeleteWhiteListFirstStage(msg.sender, _witheList[i]);
        }
    }    

    function deleteListWhiteListSecondStage(address[] calldata _witheList)
        external
        onlyOwner
    {

        for (uint i; i < _witheList.length; i++) {
            require(isWhiteListSecondStage(_witheList[i]), 
                "the address is not in the whitelist");
            //    string(abi.encodePacked("the address ", _witheList[i], " is not in the whitelist")));

             require(delteWhiteListSecondStage(_witheList[i]), 
                "the address could not delete");

            emit DeleteWhiteListSecondStage(msg.sender, _witheList[i]);
        }
    }



    //************************************************* */
    //************** mint function********************* */
    function whiteListMintFirstStage() external payable {

        if(!isStartFirstStage()){
            revert StageFirtsNotOpen(msg.sender);
        }

        if(!isWhiteListFirstStage(msg.sender)){
            revert AddressIsNotWhitleListFirstStage(msg.sender);
        }

        if (tokenIdCounter.current() > nftFirts){
            revert NftAmountExceededFirstStage(msg.sender, tokenIdCounter.current(), nftFirts);
        }      

        if(!whiteListFirstStageClaimed[msg.sender]){
            revert AddressAlreadyClaimedFirstStage(msg.sender);
        }

        if(msg.value != mintCost){
            revert IncorrectPayment(msg.sender, msg.value, mintCost);
        }

        // Mint NFT to caller
        _safeMint(msg.sender, tokenIdCounter.current());

        emit MintNftFirtsStage(msg.sender, tokenIdCounter.current());

        tokenIdCounter.increment();

        whiteListFirstStageClaimed[msg.sender] = true;

    }

    function whiteListMintSecondtStage() external payable {

        if(!isStartFirstStage()){
            revert StageFirtsNotOpen(msg.sender);
        }
    }

    function whiteListMintThirdStage() external payable {}

    //****************************************************** */
    //***************** withdraw function******************* */
    function withdrawProceeds() external onlyOwner {
        uint256 balace = address(this).balance;
        require(balace>0, "No funds to transfer");
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
