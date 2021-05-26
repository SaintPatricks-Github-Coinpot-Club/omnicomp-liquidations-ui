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
  TextField,
  Button,
  InputAdornment,
} from "@material-ui/core";

import { ethers } from "ethers";
import erc20 from "@studydefi/money-legos/erc20";

import CErc20ImmutableAbi from "../../abis/CErc20Immutable.json";
import { SCALE_18_BN } from "../../constants/Math";
import { createTxError } from "../../utils/ethTxErrorHandler";
import { numToWei, weiToNum } from "../../utils/ethUnitParser";
import { toBn } from "../../utils/bn";

import ProtocolState from "../../containers/ProtocolState";
import AccountAddress from "../../containers/AccountAddress";
import AccountState from "../../containers/AccountState";
import Connection from "../../containers/Connection";
import UserState from "../../containers/UserState";

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
  letter-spacing: 1.3px;
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
  const { signer } = Connection.useContainer();
  const {
    Comptroller,
    protocolState,
    cTokenStates,
  } = ProtocolState.useContainer();
  const { accountAddress } = AccountAddress.useContainer();
  const { accountCTokenState } = AccountState.useContainer();
  const { userState } = UserState.useContainer();

  const classes = useStyles();
  const [collateralAssetSelect, setCollateralAssetSelect] = useState<string>(
    ""
  );
  const [mintedAssetSelect, setMintedAssetSelect] = useState<string>("");
  const [inputRepayAmt, setInputRepayAmt] = useState<string>("0");
  const [outputCollateralAmt, setOutputCollateralAmt] = useState<string>("0");
  const [error, setError] = useState<Error | null>(null);

  const handleCollateralChange = (event: any) => {
    setCollateralAssetSelect(event.target.value);
  };

  const handleMintedChange = (event: any) => {
    setMintedAssetSelect(event.target.value);
  };

  if (
    accountCTokenState !== null &&
    protocolState !== null &&
    cTokenStates !== null &&
    userState !== null &&
    signer !== null &&
    accountAddress !== null
  ) {
    const isInputOverflow =
      mintedAssetSelect !== "" &&
      Number(inputRepayAmt) >
        Number(userState[mintedAssetSelect].underlyingBalance)
        ? true
        : false;

    const outputCollateralAmtUsd =
      collateralAssetSelect !== ""
        ? toBn(outputCollateralAmt)
            .times(toBn(cTokenStates[collateralAssetSelect].price))
            .toFixed(2)
        : "0";

    const handleInputChange = async (input: string) => {
      setError(null);
      setInputRepayAmt(input);

      const outputCollateral = await getCalcSeizeTokens(
        collateralAssetSelect,
        mintedAssetSelect,
        input
      );
      setOutputCollateralAmt(toBn(outputCollateral).toFixed(3, 1));
    };

    const getCalcSeizeTokens = async (
      collateralAsset: string,
      mintedAsset: string,
      amount: string
    ) => {
      if (
        Comptroller !== null &&
        collateralAsset !== "" &&
        mintedAsset !== "" &&
        amount !== ""
      ) {
        const amountInWei = numToWei(
          amount,
          toBn(cTokenStates[mintedAsset].underlyingDecimals)
        );

        const seizedKTokens = await Comptroller.liquidateCalculateSeizeTokens(
          mintedAsset,
          collateralAsset,
          amountInWei
        );

        const divBy = SCALE_18_BN.times(
          toBn(10).pow(toBn(cTokenStates[collateralAsset].underlyingDecimals))
        );
        const collateralAmount = toBn(seizedKTokens[1])
          .times(toBn(cTokenStates[collateralAsset].exchangeRateStored))
          .div(divBy);

        return collateralAmount.toFixed();
      }
      return "0";
    };

    const getMaxLiquidatableValueBN = (
      collateralAsset: string,
      mintedAsset: string
    ) => {
      let maxAllowed = toBn("0");
      const closeFac = weiToNum(toBn(protocolState.closeFactor), 18);
      const liqIncn = weiToNum(toBn(protocolState.liquidationIncentive), 18);

      if (collateralAsset !== "" && mintedAsset !== "") {
        // (Minted(Borrowed) asset USD value * close factor)
        const calcAllowedFromMinted = toBn(
          accountCTokenState[mintedAsset].borrowBalanceUsd
        ).times(toBn(closeFac));

        // this is a rare case but still needs to be handled
        // (Collateral asset USD value / liquidation incentive)
        const calcAllowedFromSupplied = toBn(
          accountCTokenState[collateralAsset].supplyBalanceUsd
        ).div(toBn(liqIncn));

        // Get MIN of above calculated value (in underlying tokens)
        if (
          calcAllowedFromMinted.isLessThanOrEqualTo(calcAllowedFromSupplied)
        ) {
          maxAllowed = calcAllowedFromMinted.div(
            toBn(cTokenStates[mintedAsset].price)
          );
        } else {
          maxAllowed = calcAllowedFromSupplied.div(
            toBn(cTokenStates[collateralAsset].price)
          );
        }
      }
      // retuning 10% less amount for safe side
      return maxAllowed.times(0.9);
    };

    const handleMax = () => {
      setInputRepayAmt("0");
      const maxAllowed = getMaxLiquidatableValueBN(
        collateralAssetSelect,
        mintedAssetSelect
      );
      handleInputChange(maxAllowed.toFixed());
    };

    const setAllowance = async (cTokenAddress: string) => {
      setError(null);
      try {
        const underlyingAddr = cTokenStates[cTokenAddress].underlyingAddress;
        if (underlyingAddr) {
          const instance = new ethers.Contract(
            underlyingAddr,
            erc20.abi,
            signer
          );
          const tx = await instance.approve(
            cTokenAddress,
            ethers.constants.MaxUint256
          );
          await tx.wait();
        }
      } catch (error) {
        console.error(error);
        setError(createTxError(error));
      }
    };

    const liquidateAcount = async () => {
      setError(null);
      try {
        if (collateralAssetSelect !== "" && mintedAssetSelect !== "") {
          const amount = numToWei(
            inputRepayAmt,
            toBn(cTokenStates[mintedAssetSelect].underlyingDecimals)
          );
          const CTokenI = new ethers.Contract(
            mintedAssetSelect,
            CErc20ImmutableAbi,
            signer
          );
          const tx = await CTokenI.liquidateBorrow(
            accountAddress,
            amount,
            collateralAssetSelect
          );
          await tx.wait(5);
        }
      } catch (error) {
        console.error(error);
        setError(createTxError(error));
      }
    };

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
          <Status>
            <Label>Collateral Supplied by Account: </Label>
            {collateralAssetSelect !== ""
              ? `${accountCTokenState[collateralAssetSelect].supplyBalance} 
              ${cTokenStates[collateralAssetSelect].underlyingSymbol}`
              : "-"}
          </Status>
          {mintedAssetSelect !== "" && (
            <Status>
              <Label>
                Your {cTokenStates[mintedAssetSelect].underlyingSymbol} Balance:{" "}
              </Label>
              {userState[mintedAssetSelect].underlyingBalance}{" "}
              {cTokenStates[mintedAssetSelect].underlyingSymbol}
            </Status>
          )}
          <br />
          <Box alignItems="center" alignContent="center">
            <Box>
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
                    value={inputRepayAmt}
                    onChange={(e) => handleInputChange(e.target.value)}
                    variant="outlined"
                    inputProps={{ min: "0" }}
                    error={isInputOverflow}
                    helperText={isInputOverflow && `Insufficient Balance`}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">
                          <Button onClick={() => handleMax()}>
                            <MaxLink>Max</MaxLink>
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                </form>
              </InputElement>
              <Status>
                <Label>You will receive kTokens equivalent to </Label>
                {inputRepayAmt !== "0"
                  ? `~${outputCollateralAmt} ${cTokenStates[collateralAssetSelect].underlyingSymbol} ($${outputCollateralAmtUsd})`
                  : "-"}
              </Status>
              {mintedAssetSelect !== "" &&
                userState[mintedAssetSelect].needAllowance && (
                  <Button
                    type="submit"
                    variant="contained"
                    style={{ marginTop: "0.6rem" }}
                    onClick={() => setAllowance(mintedAssetSelect)}
                  >
                    Unlock {cTokenStates[mintedAssetSelect].underlyingSymbol}
                  </Button>
                )}
              <Button
                type="submit"
                variant="contained"
                style={{ marginTop: "0.6rem" }}
                onClick={() => liquidateAcount()}
                disabled={
                  mintedAssetSelect === "" ||
                  collateralAssetSelect === "" ||
                  inputRepayAmt === "" ||
                  inputRepayAmt === "0" ||
                  isInputOverflow
                }
              >
                Liquidate
              </Button>
            </Box>
          </Box>
          {error && (
            <Box py={2}>
              <Typography>
                <span style={{ color: "red" }}>{error.message}</span>
              </Typography>
            </Box>
          )}
        </Container>
      </Box>
    );
  } else {
    return <></>;
  }
};
export default LiquidateAccount;
