// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;
library  Error {
    
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

    error SetNumberNftInvalid(address user,uint256 available ,uint256 required );
    
    error NftCountExceededStage(address user, uint256 available, uint256 required);

    error FailAddWhiteList(address owner, address user);    

    error FailDeleteWhiteList(address owner, address user);

    error NotFondsToTranfer(address owner);

    error UnsuccessfulPayout(address owner);

}