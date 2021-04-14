// Onboard.js requires API keys for some providers. These keys provided below
// Enable the dapp to work out of the box without any custom configs.
// You can choose to specify these env variables if you wish to get analytics
// over user interactions. Otherwise, defaults are used.
import { ethers } from "ethers";
type Network = ethers.providers.Network;
export const config = (network: Network | null) => {
  return {
    onboardConfig: {
      apiKey:
        process.env.NEXT_PUBLIC_ONBOARD_API_KEY ||
        "2b8f4310-f2de-455d-b608-dd49cab1ebc3",
      onboardWalletSelect: {
        wallets: [
          { walletName: "metamask", preferred: true },
        ],
      },
      walletCheck: [
        { checkName: "connect" },
        { checkName: "accounts" },
        { checkName: "network" },
        { checkName: "balance", minimumBalance: "0" },
      ],
    },
  };
};
