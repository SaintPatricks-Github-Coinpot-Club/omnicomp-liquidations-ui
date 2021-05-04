import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";

import { ALL_ACCOUNTS, ALL_BORROWERS } from "../apollo/omnicomp/queries";

const MIN_HEALTH = 0.001;
const MAX_HEALTH = 0.999;

const useSubGraph = () => {
  const {
    loading: accountsLoading,
    error: accountsError,
    data: accountsData,
  } = useQuery(ALL_BORROWERS, {
    context: { clientName: "OMNICOMP" },
    pollInterval: 10000,
  });

  const {
    loading: allAccountsLoading,
    error: allAccountsError,
    data: allAccountsData,
  } = useQuery(ALL_ACCOUNTS, {
    context: { clientName: "OMNICOMP" },
    pollInterval: 10000,
  });

  const [allAccounts, setAllAccounts] = useState<[] | null>(
    null
  );
  const [allBorrowers, setAllBorrowers] = useState<[] | null>(
    null
  );
  const [filteredUnhealthyAccounts, setFilteredUnhealthyAccounts] = useState<
    [] | null
  >(null);

  const queryAccounts = () => {
    if (allAccountsData) {
      setAllAccounts(allAccountsData.accounts);
    }

    if (accountsData) {
      setAllBorrowers(accountsData.accounts);
    }
  };

  const filterAccounts = () => {
    if (allBorrowers) {
      const filtered: any = allBorrowers.filter(
        (acc: any) => acc.health > MIN_HEALTH && acc.health < MAX_HEALTH
      );
      const sorted = filtered.sort((a: any, b: any) => a.health - b.health);
      setFilteredUnhealthyAccounts(sorted);
    }
  };

  useEffect(() => {
    queryAccounts();
  }, [accountsData]);

  useEffect(() => {
    filterAccounts();
  }, [allBorrowers]);

  return {
    allAccounts,
    allBorrowers,
    filteredUnhealthyAccounts,
  };
};

const SubGraph = createContainer(useSubGraph);
export default SubGraph;
