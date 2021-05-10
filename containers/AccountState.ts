import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import CErc20ImmutableAbi from "../abis/CErc20Immutable.json";
import { SCALE_18_BN } from "../constants/Math";

import { toBn, toBnFixed } from "../utils/bn";
import { weiToNum } from "../utils/ethUnitParser";
import { allObjKeyExists } from "../utils/objectHelper";
import Connection from "./Connection";
import ProtocolState from "./ProtocolState";
import AccountAddress from "./AccountAddress";

interface AccountCTokenState {
  address: string | null;
  supplyBalance: string | null;
  supplyBalanceUsd: string | null;
  borrowBalance: string | null;
  borrowBalanceUsd: string | null;
}

const accountCTokenInitState = {
  address: null,
  supplyBalance: null,
  supplyBalanceUsd: null,
  borrowBalance: null,
  borrowBalanceUsd: null,
};

const useContractState = () => {
  const { block$, signer } = Connection.useContainer();
  const { Comptroller, cTokenStates } = ProtocolState.useContainer();
  const { accountAddress } = AccountAddress.useContainer();

  const [accountCTokenState, setAccountCTokenState] = useState<{
    [address: string]: AccountCTokenState;
  } | null>(null);
  const [accountAssetsIn, setAccountAssetsIn] = useState<string[] | null>(null);

  // get state
  const queryState = async () => {
    if (Comptroller !== null && accountAddress !== null) {
      const accountAssetsIn = await Comptroller.getAssetsIn(accountAddress);
      setAccountAssetsIn(accountAssetsIn);
    }
  };

  const fetchAllCTokenData = () => {
    // Created a copy (deep copy) mechanism to overcome the Closure issue of useState
    if (accountAssetsIn) {
      // temp holder for states
      let copyCTokenStates = {};

      accountAssetsIn.forEach(async (cTokenAddr) => {
        const cTokenData = await fetchCTokenData(cTokenAddr);
        if (cTokenData?.address) {
          // created a deep copy
          const deepCopyCTokenStates = JSON.parse(
            JSON.stringify(copyCTokenStates)
          );
          deepCopyCTokenStates[cTokenData.address] = cTokenData;
          copyCTokenStates = JSON.parse(JSON.stringify(deepCopyCTokenStates));
          setAccountCTokenState(copyCTokenStates);
        }
      });
    }
  };

  const fetchCTokenData = async (cTokenAddr: string) => {
    const cToken: AccountCTokenState = accountCTokenInitState;
    if (
      Comptroller !== null &&
      signer !== null &&
      accountAddress !== null &&
      cTokenStates !== null &&
      cTokenStates[cTokenAddr] !== undefined &&
      allObjKeyExists(cTokenStates[cTokenAddr])
    ) {
      const CTokenI = new ethers.Contract(
        cTokenAddr,
        CErc20ImmutableAbi,
        signer
      );

      const res = await Promise.all([
        CTokenI.balanceOf(accountAddress),
        CTokenI.borrowBalanceStored(accountAddress),
      ]);

      const divBy = SCALE_18_BN.times(
        toBn(10).pow(toBn(cTokenStates[cTokenAddr].underlyingDecimals))
      );
      const supplyBal = toBn(res[0])
        .times(toBn(cTokenStates[cTokenAddr].exchangeRateStored))
        .div(divBy);
      const borrowBal = weiToNum(
        res[1],
        toBn(cTokenStates[cTokenAddr].underlyingDecimals)
      );

      cToken.address = cTokenAddr;
      cToken.supplyBalance = supplyBal.toFixed();
      cToken.supplyBalanceUsd = supplyBal
        .times(toBn(cTokenStates[cTokenAddr].price))
        .toFixed();
      cToken.borrowBalance = borrowBal;
      cToken.borrowBalanceUsd = toBn(borrowBal)
        .times(toBn(cTokenStates[cTokenAddr].price))
        .toFixed();

      return cToken;
    }
  };

  useEffect(() => {
    queryState();
  }, [Comptroller, accountAddress]);

  useEffect(() => {
    fetchAllCTokenData();
  }, [accountAssetsIn, cTokenStates]);

  // get state on each block
  useEffect(() => {
    if (block$) {
      const sub = block$.subscribe(() => queryState());
      return () => sub.unsubscribe();
    }
  }, [block$]);

  return { accountCTokenState };
};

const AccountState = createContainer(useContractState);

export default AccountState;
