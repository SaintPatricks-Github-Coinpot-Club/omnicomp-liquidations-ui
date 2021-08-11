import { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import { Box, Typography } from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import SearchBar from "material-ui-search-bar";
import { ethers } from "ethers";

import { toBn, toBnFixed } from "../../utils/bn";
import SubGraph from "../../containers/SubGraph";
import AllAccountState from "../../containers/AllAccountState";
import AccountAddress from "../../containers/AccountAddress";

interface Column {
  id: "id" | "totalCollateralValueInEth" | "totalBorrowValueInEth" | "health";
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: string) => string;
}

const columns: Column[] = [
  { id: "id", label: "Address", minWidth: 170 },
  {
    id: "health",
    label: "Health Status",
    minWidth: 170,
    align: "right",
    format: (value: string) => toBn(value).toFixed(2),
  },
];

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
  container: {
    maxHeight: 650,
  },
});

const AllAccounts = () => {
  const classes = useStyles();

  const { allAccounts: accounts } = SubGraph.useContainer();
  const { accountGlobalStates } = AllAccountState.useContainer();
  const { setAccountAddress } = AccountAddress.useContainer();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [searchStr, setSearchStr] = useState("");
  const [checked, setChecked] = useState(false);

  if (accounts !== null && accountGlobalStates !== null) {
    const toBeShownAccountsAll = [...accounts].filter(
      (a: any) =>
        a.id != "0xdb21617ddcceed28568af2f8fc6549887712a011" &&
        a.id != "0x744d761cee18a3d7810524d3c6ce5150a49e00d9" &&
        a.id != "0x7e0bbff9687fdc81d666fc4d070846b994e8ba5e"
    );
    const filteredAccounts = [...toBeShownAccountsAll].filter(
      (a: any) => Number(accountGlobalStates[a.id]?.accountLiquidity) < 0
    );
    const sortedAccounts = [...filteredAccounts].sort(
      (a: any, b: any) =>
        Number(accountGlobalStates[a.id]?.accountLiquidity) -
        Number(accountGlobalStates[b.id]?.accountLiquidity)
    );

    const toBeShownAccounts = checked ? sortedAccounts : toBeShownAccountsAll;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setChecked(event.target.checked);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
      setPage(newPage);
    };

    const handleChangeRowsPerPage = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      setRowsPerPage(+event.target.value);
      setPage(0);
    };

    const handleClick = (value: string) => {
      setAccountAddress(value === "" ? null : (value as string));
    };

    const handleSearch = () => {
      if (ethers.utils.isAddress(searchStr)) {
        setAccountAddress(searchStr);
      }
    };

    return (
      <Paper className={classes.root}>
        <SearchBar
          value={searchStr}
          onChange={(newValue) => setSearchStr(newValue)}
          onRequestSearch={handleSearch}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={checked}
              onChange={handleChange}
              name="checked"
              color="primary"
            />
          }
          style={{ marginLeft: "1em" }}
          label="Show Unhealthy Accounts Only"
          labelPlacement="end"
        />
        <TableContainer className={classes.container}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {toBeShownAccounts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((account: any) => {
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={account.id}
                      onClick={() => handleClick(account.id)}
                    >
                      <TableCell
                        component="th"
                        scope="row"
                        style={{ letterSpacing: "1.25px" }}
                      >
                        {account.id}
                      </TableCell>
                      <TableCell align="right">
                        {Number(
                          accountGlobalStates[account.id]?.accountLiquidity
                        ) < 0
                          ? "Unsafe"
                          : "Safe"}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[50, 100, 200]}
          component="div"
          count={toBeShownAccounts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
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

export default AllAccounts;
