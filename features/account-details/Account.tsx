import { useState, useEffect } from "react";
import { Box, Typography } from "@material-ui/core";

import SubGraph from "../../containers/SubGraph";
import AccountAddress from "../../containers/AccountAddress";

import InvalidAccount from "./InvalidAccount";

const Account = () => {
  const { allAccounts } = SubGraph.useContainer();
  const { accountAddress } = AccountAddress.useContainer();

  if (allAccounts !== null && accountAddress !== null) {
    const account = allAccounts.find(
      (account: any) => account.id === accountAddress.toLowerCase()
    );

    if (account === undefined) {
      return <InvalidAccount />;
    }
    return <i>Account Component {accountAddress}</i>;
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
