import React from "react";
import { useState, useEffect } from "react";
import styled from "styled-components";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import NativeSelect from "@material-ui/core/NativeSelect";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  InputAdornment,
} from "@material-ui/core";

import ProtocolState from "../../containers/ProtocolState";
import AccountState from "../../containers/AccountState";

const Container = styled.div`
  padding: 1rem;
  border: 1px solid #434343;
  width: 100%;
  alignContent="center"
`;

const InputElement = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  margin-top: 0px;
`;

const MaxLink = styled.div`
  text-decoration-line: underline;
`;

const Label = styled.span`
  color: #999999;
`;

const Status = styled(Typography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  })
);

const LiquidateAccount = () => {
  const { cTokenStates } = ProtocolState.useContainer();
  const { accountCTokenState } = AccountState.useContainer();

  const classes = useStyles();
  const [collateralAssetSelect, setCollateralAssetSelect] = useState<string>(
    ""
  );
  const [mintedAssetSelect, setMintedAssetSelect] = useState<string>("");

  const handleCollateralChange = (event: any) => {
    setCollateralAssetSelect(event.target.value);
  };

  const handleMintedChange = (event: any) => {
    setMintedAssetSelect(event.target.value);
  };

  if (accountCTokenState !== null && cTokenStates !== null) {
    return (
      <Box py={4} textAlign="center">
        <Container>
          <Typography variant="h6">Liquidate Account</Typography>

          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="age-native-helper">Collateral</InputLabel>
            <NativeSelect
              value={collateralAssetSelect}
              onChange={handleCollateralChange}
            >
              <option aria-label="None" value="" disabled />
              {Object.keys(accountCTokenState).map(
                (cTokenAddress, index) =>
                  accountCTokenState[cTokenAddress]?.supplyBalance !== "0" && (
                    <option key={cTokenAddress} value={cTokenAddress}>
                      {cTokenStates[cTokenAddress].underlyingSymbol}
                    </option>
                  )
              )}
            </NativeSelect>
            <FormHelperText>To be Liquidated Asset</FormHelperText>
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="age-native-helper">Minted Asset</InputLabel>
            <NativeSelect
              value={mintedAssetSelect}
              onChange={handleMintedChange}
            >
              <option aria-label="None" value="" disabled />
              {Object.keys(accountCTokenState).map(
                (cTokenAddress, index) =>
                  accountCTokenState[cTokenAddress]?.borrowBalance !== "0" && (
                    <option key={cTokenAddress} value={cTokenAddress}>
                      {cTokenStates[cTokenAddress].underlyingSymbol}
                    </option>
                  )
              )}
            </NativeSelect>
            <FormHelperText>To be Repaid Asset</FormHelperText>
          </FormControl>
          <br />
          <br />
          {collateralAssetSelect !== "" && (
            <Status>
              <Label>Collateral Supplied: </Label>
              {accountCTokenState[collateralAssetSelect].supplyBalance}{" "}
              {cTokenStates[collateralAssetSelect].underlyingSymbol}
            </Status>
          )}
          {collateralAssetSelect === "" && (
            <Status>
              <Label>Collateral Supplied: </Label>-
            </Status>
          )}
          {/* <Status>
            <Label>Max Collateral Liquidatable: </Label>
            {`50 SYM`}
          </Status> */}
          <br />
          <Grid container alignItems="center" alignContent="center">
            <Grid item md={6}>
              <InputElement>
                <form style={{ width: "100%" }} noValidate autoComplete="off">
                  <TextField
                    fullWidth
                    type="number"
                    label={
                      mintedAssetSelect !== ""
                        ? cTokenStates[mintedAssetSelect].underlyingSymbol
                        : "Asset"
                    }
                    value="0"
                    // onChange={(e) =>
                    //   handleChange(Number(e.target.value), true, true, true)
                    // }
                    variant="outlined"
                    inputProps={{ min: "0" }}
                    // error={isSynthBalOverflow}
                    // helperText={
                    //   isSynthBalOverflow && `Insufficient Balance`
                    // }
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">
                          <Button>
                            <MaxLink>Max</MaxLink>
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                </form>
              </InputElement>
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  } else {
    return <></>;
  }
};
export default LiquidateAccount;
