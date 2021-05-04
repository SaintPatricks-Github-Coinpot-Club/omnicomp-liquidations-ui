import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";

function useAccountAddress() {
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);

  // set Account address from query string (if it exists and is not the same)
  useEffect(() => {
    const queryAddress = router.query.account;
    const isNewAddress = queryAddress !== address;

    if (queryAddress && isNewAddress && typeof queryAddress === "string") {
      setAccountAddress(queryAddress.toLowerCase());
    }
  }, [router]);

  // set Account address and also push to query string in URL (if valid)
  const setAccountAddress = (value: string | null) => {
    setAddress(value);
    const noValidAddress = value === null || value.trim() === "";
    router.push({
      pathname: "/",
      query: noValidAddress ? {} : { account: value },
    });
  };

  return {
    accountAddress: address ? ethers.utils.getAddress(address) : null,
    setAccountAddress,
    isValid: ethers.utils.isAddress(address || ""),
  };
}

const AccountAddress = createContainer(useAccountAddress);

export default AccountAddress;
