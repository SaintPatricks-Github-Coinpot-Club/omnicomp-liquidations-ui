import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { API as OnboardApi, Wallet } from "bnc-onboard/dist/src/interfaces";
import Onboard from "bnc-onboard";
import { Observable } from "rxjs";
import { debounceTime } from "rxjs/operators";

import { config } from "./Config";

type Provider = ethers.providers.Web3Provider;
type Block = ethers.providers.Block;
type Network = ethers.providers.Network;
type Signer = ethers.Signer;

const SUPPORTED_NETWORK_IDS: number[] = [56, 137];

function useConnection() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [onboard, setOnboard] = useState<OnboardApi | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [network, setNetwork] = useState<Network | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [block$, setBlock$] = useState<Observable<Block> | null>(null);

  const attemptConnection = async () => {
    // if (_network.chainId === 56 && _network.name === "unknown") {
    //   _network.name = "BSC";
    // }
    // else if (_network.chainId === 137 && _network.name === "unknown") {
    //   _network.name = "POLYGON";
    // }
    const onboardInstance = Onboard({
      dappId: config(network).onboardConfig.apiKey,
      hideBranding: true,
      networkId: 56, // Default to BSC Mainnet. If on a different network will change with the subscription.
      networkName: "Binance Mainnet or Polygon",
      darkMode: true,
      subscriptions: {
        address: (address: string | null) => {
          setUserAddress(address);
        },
        network: async (networkId: any) => {
          if (!SUPPORTED_NETWORK_IDS.includes(networkId)) {
            alert("This dApp will work only with BSC or Polygon network");
          }
          onboard?.config({ networkId: networkId });
        },
        wallet: async (wallet: Wallet) => {
          if (wallet.provider && wallet.name) {
            const ethersProvider = new ethers.providers.Web3Provider(
              wallet.provider,
              "any"
            );
            setProvider(ethersProvider);
            ethersProvider.on("network", (newNetwork, oldNetwork) => {
              // When a Provider makes its initial connection, it emits a "network"
              // event with a null oldNetwork along with the newNetwork. So, if the
              // oldNetwork exists, it represents a changing network
              if (oldNetwork) {
                window.location.reload();
              }
            });

            const _network = await ethersProvider.getNetwork();
            if (_network.chainId === 56 && _network.name === "unknown") {
              _network.name = "BSC";
            } else if (
              _network.chainId === 137 &&
              _network.name === "unknown"
            ) {
              _network.name = "POLYGON";
            }
            setNetwork(_network);
            window.localStorage.setItem("selectedWallet", wallet.name);
          } else {
            setProvider(null);
            setNetwork(null);
            window.localStorage.removeItem("selectedWallet");
          }
        },
      },
      walletSelect: config(network).onboardConfig.onboardWalletSelect,
      walletCheck: config(network).onboardConfig.walletCheck,
    });

    const previouslySelectedWallet = window.localStorage.getItem(
      "selectedWallet"
    );
    if (previouslySelectedWallet != null) {
      await onboardInstance.walletSelect(previouslySelectedWallet);
    } else {
      await onboardInstance.walletSelect();
    }
    await onboardInstance.walletCheck();
    setOnboard(onboardInstance);
  };

  const connect = async () => {
    try {
      setError(null);
      await attemptConnection();
    } catch (error) {
      setError(error);
      alert(error.message);
    }
  };

  const disconnect = () => {
    if (onboard) {
      onboard.walletReset();
      window.localStorage.removeItem("selectedWallet");
      window.location.reload();
    }
  };

  // autoselect wallet on load
  useEffect(() => {
    console.log("NETWORK NAME: ", network);
    const previouslySelectedWallet = window.localStorage.getItem(
      "selectedWallet"
    );
    if (previouslySelectedWallet != null) {
      connect();
    }
  }, []);

  // create observable to stream new blocks
  useEffect(() => {
    if (provider) {
      const observable = new Observable<Block>((subscriber) => {
        provider.on("block", (blockNumber: number) => {
          provider
            .getBlock(blockNumber)
            .then((block) => subscriber.next(block));
        });
      });
      // debounce to prevent subscribers making unnecessary calls
      const block$ = observable.pipe(debounceTime(1000));
      setBlock$(block$);
    }

    if (provider && userAddress) {
      setSigner(provider.getSigner());
    }
  }, [provider, userAddress]);

  return {
    provider,
    onboard,
    signer,
    network,
    userAddress,
    connect,
    disconnect,
    error,
    block$,
    SUPPORTED_NETWORK_IDS,
  };
}

const Connection = createContainer(useConnection);

export default Connection;
