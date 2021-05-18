import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import erc20 from "@studydefi/money-legos/erc20";
import CErc20ImmutableAbi from "../abis/CErc20Immutable.json";

import { weiToNum } from "../utils/ethUnitParser";
import Connection from "./Connection";
import ProtocolState from "./ProtocolState";
import { toBn } from "../utils/bn";

interface UserState {
  cTokenAddress: string | null;
  underlyingBalance: string | null;
  needAllowance: boolean | null;
}

const userInitState = {
  cTokenAddress: null,
  underlyingBalance: null,
  needAllowance: null,
};

const useUserState = () => {
  const { block$, signer, userAddress } = Connection.useContainer();
  const { cTokenAddresses } = ProtocolState.useContainer();

  const [userState, setUserState] = useState<{
    [address: string]: UserState;
  } | null>(null);

  const queryState = () => {
    // Created a copy (deep copy) mechanism to overcome the Closure issue of useState
    if (cTokenAddresses) {
      // temp holder for states
      let copyUserStates = {};

      cTokenAddresses.forEach(async (cTokenAddr) => {
        const data = await fetchUserData(cTokenAddr);
        if (data?.cTokenAddress) {
          // created a deep copy
          const deepCopyUserStates = JSON.parse(JSON.stringify(copyUserStates));
          deepCopyUserStates[data.cTokenAddress] = data;
          copyUserStates = JSON.parse(JSON.stringify(deepCopyUserStates));
          setUserState(copyUserStates);
        }
      });
    }
  };

  const fetchUserData = async (cTokenAddr: string) => {
    const state: UserState = userInitState;
    if (signer !== null && userAddress !== null) {
      const CTokenI = new ethers.Contract(
        cTokenAddr,
        CErc20ImmutableAbi,
        signer
      );
      const underlyingAddr = await CTokenI.underlying();

      const UnderlyingI = new ethers.Contract(
        underlyingAddr,
        erc20.abi,
        signer
      );

      const res = await Promise.all([
        UnderlyingI.decimals(),
        UnderlyingI.balanceOf(userAddress),
        UnderlyingI.allowance(userAddress, cTokenAddr),
      ]);

      state.cTokenAddress = cTokenAddr;
      state.underlyingBalance = weiToNum(res[1], res[0]);
      state.needAllowance = toBn(res[2]).isGreaterThan(0) ? false : true;

      return state;
    }
  };

  // reset on user change
  useEffect(() => {
    setUserState(null);
  }, [userAddress]);

  useEffect(() => {
    queryState();
  }, [userAddress, cTokenAddresses]);

  // get state on each block
  useEffect(() => {
    if (block$) {
      const sub = block$.subscribe(() => queryState());
      return () => sub.unsubscribe();
    }
  }, [block$, userAddress, cTokenAddresses]);

  return { userState };
};

const UserState_ = createContainer(useUserState);

export default UserState_;
