import { Box, Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

import SubGraph from "../../containers/SubGraph";
import AccountAddress from "../../containers/AccountAddress";
import AccountState from "../../containers/AccountState";

import InvalidAccount from "./InvalidAccount";
import NoAccountData from "./NoAccountData";
import AccountDetails from "./AccountDetails";

const Account = () => {
  const { allAccounts } = SubGraph.useContainer();
  const { accountAddress, setAccountAddress } = AccountAddress.useContainer();
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

    return (
      <>
        <Button onClick={() => setAccountAddress(null)}>
          <ArrowBackIcon />
          Back
        </Button>
        <br />
        <br />
        <AccountDetails />
      </>
    );
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
