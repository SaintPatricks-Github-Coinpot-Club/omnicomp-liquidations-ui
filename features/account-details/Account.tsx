import { useState, useEffect } from "react";
import { Box, Typography } from "@material-ui/core";

import SubGraph from "../../containers/SubGraph";
import AccountAddress from "../../containers/AccountAddress";
import AccountState from "../../containers/AccountState";

import InvalidAccount from "./InvalidAccount";
import NoAccountData from "./NoAccountData";
import AccountDetails from "./AccountDetails";

const Account = () => {
  const { allAccounts } = SubGraph.useContainer();
  const { accountAddress } = AccountAddress.useContainer();
  const { accountAssetsIn } = AccountState.useContainer();

  if (
    allAccounts !== null &&
    accountAddress !== null &&
    accountAssetsIn !== null
  ) {
    const account = allAccounts.find(
      (account: any) => account.id === accountAddress.toLowerCase()
    );

    if (account === undefined) {
      return <InvalidAccount />;
    }

    if (accountAssetsIn.length === 0) {
      return <NoAccountData />;
    }
    return <AccountDetails />;
  } else {
    return (
      <Box py={2} textAlign="center">
        <Typography>
          <i>Loading...</i>
        </Typography>
      </Box>
    );
  }
};
export default Account;
