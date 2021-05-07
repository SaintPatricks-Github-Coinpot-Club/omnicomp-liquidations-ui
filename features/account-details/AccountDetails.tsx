import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

import ProtocolState from "../../containers/ProtocolState";
import UserState from "../../containers/UserState";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const AccountDetails = () => {
  const classes = useStyles();

  const { cTokenStates } = ProtocolState.useContainer();
  const { userCTokenState, userGlobalState } = UserState.useContainer();

  if (
    cTokenStates !== null &&
    userCTokenState !== null &&
    userGlobalState !== null
  ) {
    return (
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Collateral Assets</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Amount&nbsp;($)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(userCTokenState).map(
              (state, index) =>
                userCTokenState[state].supplyBalance !== "0" && (
                  <TableRow key={state}>
                    <TableCell component="th" scope="row">
                      {cTokenStates[state].underlyingSymbol}
                    </TableCell>
                    <TableCell align="right">
                      {userCTokenState[state].supplyBalance}
                    </TableCell>
                    <TableCell align="right">
                      {userCTokenState[state].supplyBalanceUsd}
                    </TableCell>
                  </TableRow>
                )
            )}
          </TableBody>
        </Table>
        <br />
        <br />
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Minted Assets</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Amount&nbsp;($)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(userCTokenState).map(
              (state, index) =>
                userCTokenState[state].borrowBalance !== "0" && (
                  <TableRow key={state}>
                    <TableCell component="th" scope="row">
                      {cTokenStates[state].underlyingSymbol}
                    </TableCell>
                    <TableCell align="right">
                      {userCTokenState[state].borrowBalance}
                    </TableCell>
                    <TableCell align="right">
                      {userCTokenState[state].borrowBalanceUsd}
                    </TableCell>
                  </TableRow>
                )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  } else {
    return <></>;
  }
};

export default AccountDetails;
