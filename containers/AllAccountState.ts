import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";

import { toBn, toBnFixed } from "../utils/bn";
import Connection from "./Connection";
import ProtocolState from "./ProtocolState";
import SubGraph from "./SubGraph";

interface AccountGlobalState {
  accountLiquidity: string | null;
  address: string | null;
}

const accountGlobalInitState = {
  accountLiquidity: null,
  address: null,
};

const useAllAccountState = () => {
  const { block$ } = Connection.useContainer();
  const { Comptroller } = ProtocolState.useContainer();
  const { allAccounts } = SubGraph.useContainer();

  const [accountGlobalStates, setAccountGlobalStates] = useState<{
    [address: string]: AccountGlobalState;
  } | null>(null);

  const queryState = async () => {
    if (Comptroller !== null && allAccounts !== null) {
      // temp holder for states
      let copyAccountGlobalStates = {};

      allAccounts.forEach(async (account: any) => {
        const accountData = await fetchAccountGlobalState(account.id);
        if (accountData?.address) {
          // created a deep copy
          const deepCopyAccountGlobalStates = JSON.parse(
            JSON.stringify(copyAccountGlobalStates)
          );
          deepCopyAccountGlobalStates[accountData.address] = accountData;
          copyAccountGlobalStates = JSON.parse(
            JSON.stringify(deepCopyAccountGlobalStates)
          );
          setAccountGlobalStates(copyAccountGlobalStates);
        }
      });
    }
  };

  const fetchAccountGlobalState = async (accountAddr: string) => {
    const newAccountGlobalState: AccountGlobalState = accountGlobalInitState;
    if (Comptroller !== null) {
      const liquidityData = await Comptroller.getAccountLiquidity(accountAddr);
      if (toBn(liquidityData[0]).isZero()) {
        if (toBn(liquidityData[1]).isGreaterThan(0)) {
          newAccountGlobalState.accountLiquidity = toBnFixed(liquidityData[1]);
        } else if (toBn(liquidityData[2]).isGreaterThan(0)) {
          newAccountGlobalState.accountLiquidity = toBn(liquidityData[2])
            .negated()
            .toFixed();
        } else {
          newAccountGlobalState.accountLiquidity = toBnFixed("0");
        }
      }

      newAccountGlobalState.address = accountAddr;
      return newAccountGlobalState;
    }
  };

  useEffect(() => {
    queryState();
  }, [Comptroller, allAccounts]);

  // get state on each block
  useEffect(() => {
    if (block$) {
      const sub = block$.subscribe(() => queryState());
      return () => sub.unsubscribe();
    }
  }, [block$, Comptroller, allAccounts]);

  return { accountGlobalStates };
};

const AllAccountState = createContainer(useAllAccountState);

export default AllAccountState;
