import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import erc20 from "@studydefi/money-legos/erc20";
import ComptrollerAbi from "../abis/Comptroller.json";
import PriceOracleOTLAbi from "../abis/PriceOracleOTL.json";
import CErc20ImmutableAbi from "../abis/CErc20Immutable.json";
import { ContractAddresses } from "../constants/ContractAddresses";

import { toBn, toBnFixed } from "../utils/bn";
import Connection from "./Connection";

interface IProtocolState {
  closeFactor: string | null;
  liquidationIncentive: string | null;
}

interface CTokenState {
  address: string | null;
  colFac: string | null;
  cTokenDecimals: string | null;
  underlyingDecimals: string | null;
  price: string | null;
  underlyingSymbol: string | null;
  exchangeRateStored: string | null;
  underlyingAddress: string | null;
}

const cTokenInitState = {
  address: null,
  colFac: null,
  cTokenDecimals: null,
  underlyingDecimals: null,
  price: null,
  underlyingSymbol: null,
  exchangeRateStored: null,
  underlyingAddress: null,
};

const useProtocolState = () => {
  const { network, signer, SUPPORTED_NETWORK_IDS } = Connection.useContainer();

  const [Comptroller, setComptroller] = useState<ethers.Contract | null>(null);
  const [Oracle, setOracle] = useState<ethers.Contract | null>(null);
  const [cTokenStates, setCTokenStates] = useState<{
    [address: string]: CTokenState;
  } | null>(null);
  const [cTokenAddresses, setCTokenAddresses] = useState<string[] | null>(null);
  const [protocolState, setProtocolState] = useState<IProtocolState | null>(
    null
  );

  // get state
  const queryState = async () => {
    if (Comptroller !== null && signer !== null) {
      // have to do this ugly thing because we want to call in parallel
      const res = await Promise.all([
        Comptroller.oracle(),
        Comptroller.getAllMarkets(),
        Comptroller.closeFactorMantissa(),
        Comptroller.liquidationIncentiveMantissa(),
      ]);

      const oracleIns = new ethers.Contract(res[0], PriceOracleOTLAbi, signer);
      setOracle(oracleIns);

      const markets = res[1];
      setCTokenAddresses(markets);

      const newState: IProtocolState = {
        closeFactor: toBnFixed(res[2]),
        liquidationIncentive: toBnFixed(res[3]),
      };
      setProtocolState(newState);
    }
  };

  const fetchAllCTokenData = () => {
    if (cTokenAddresses) {
      cTokenAddresses.forEach(async (cTokenAddr) => {
        const cTokenData = await fetchCTokenData(cTokenAddr);
        if (cTokenData && cTokenData.address) {
          setCTokenStates((prevState) => {
            return {
              ...prevState,
              [cTokenData.address as string]: JSON.parse(
                JSON.stringify(cTokenData)
              ),
            };
          });
        }
      });
    }
  };

  const fetchCTokenData = async (cTokenAddr: string) => {
    const cToken: CTokenState = cTokenInitState;
    if (Comptroller !== null && Oracle !== null && signer !== null) {
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
        Comptroller.markets(cTokenAddr),
        Oracle.getUnderlyingPrice(cTokenAddr),
        UnderlyingI.decimals(),
        CTokenI.decimals(),
        UnderlyingI.symbol(),
        CTokenI.exchangeRateStored(),
      ]);

      cToken.address = cTokenAddr;
      cToken.colFac = toBnFixed(res[0].collateralFactorMantissa);
      const priceRaw = res[1];
      cToken.underlyingDecimals = toBnFixed(res[2]);
      cToken.cTokenDecimals = toBnFixed(res[3]);
      cToken.underlyingSymbol = res[4];
      cToken.exchangeRateStored = toBnFixed(res[5]);

      const decimalDiff = 36 - parseFloat(cToken.underlyingDecimals as string);
      cToken.price = toBn(priceRaw).div(toBn(10).pow(decimalDiff)).toFixed();
      cToken.underlyingAddress = underlyingAddr;

      return cToken;
    }
  };

  useEffect(() => {
    // console.log("Network name Container: ", network);
    if (signer && network && SUPPORTED_NETWORK_IDS.includes(network.chainId)) {
      // let chainId = parseInt(network.chainId);
      // let comptrollerAddresses: any = {...ContractAddresses[network.chainId]};
      // let comptroller = comptrollerAddresses['Comptroller'];
      const addresses: any = ContractAddresses[network.chainId];
      const ComptrollerAddr = addresses["Comptroller"];
      console.log(addresses, " address of Comptroller");
      const instance = new ethers.Contract(
        ComptrollerAddr,
        ComptrollerAbi,
        signer
      );
      setComptroller(instance);
    }
  }, [signer, network]);

  // get state on setting of contract
  useEffect(() => {
    queryState();
  }, [Comptroller]);

  useEffect(() => {
    fetchAllCTokenData();
  }, [cTokenAddresses]);

  // get state on each block
  // useEffect(() => {
  //   if (block$) {
  //     const sub = block$.subscribe(() => {
  //       queryState();
  //       fetchAllCTokenData();
  //     });
  //     return () => sub.unsubscribe();
  //   }
  // }, [block$, Comptroller]);

  return { Comptroller, cTokenAddresses, cTokenStates, protocolState };
};

const ProtocolState = createContainer(useProtocolState);

export default ProtocolState;
