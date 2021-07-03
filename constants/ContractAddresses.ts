// export const ContractAddresses = {
//   Comptroller: "0x0aBBAba95439dAbc12a6bA59E0713a722a05cB31",
// };

export const ContractAddresses: {
  [networkId: number]: { Comptroller: string };
} = {
  // BSC
  56: {
    Comptroller: "0x0aBBAba95439dAbc12a6bA59E0713a722a05cB31",
  },
  // POLYGON
  137: {
    Comptroller: "0x06941b64a339f282cE2B501617EA06a9f80191E4",
  },
};
