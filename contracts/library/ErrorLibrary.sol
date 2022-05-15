// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;
library  Error {
    
    error NftLimitAddress(address user, uint256 available, uint256 required); 

    error IncorrectPayment(address user, uint256 available, uint256 required);

    error SetNumberNftInvalid(address user,uint256 available ,uint256 required );
    
    error NotFondsToTranfer(address owner);

    error UnsuccessfulPayout(address owner);

    error TokenDoesNotExist(address user, uint256 tokenId);

}