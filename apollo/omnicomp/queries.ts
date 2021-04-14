import { gql } from "@apollo/client";

export const UNDERWATER_ACCOUNTS = gql`
  query underwaterAcounts {
    accounts (
      first: 1000,
      where: {
        hasBorrowed: true
      }
    )
    {
      id
      hasBorrowed
      health
      totalCollateralValueInEth
      totalBorrowValueInEth
      tokens {
        symbol
        cTokenBalance
        totalUnderlyingSupplied
        totalUnderlyingRedeemed
        totalUnderlyingBorrowed
        totalUnderlyingRepaid
        storedBorrowBalance
        supplyBalanceUnderlying
        borrowBalanceUnderlying
        lifetimeSupplyInterestAccrued
        lifetimeBorrowInterestAccrued
      }
    } 
  }
`;
