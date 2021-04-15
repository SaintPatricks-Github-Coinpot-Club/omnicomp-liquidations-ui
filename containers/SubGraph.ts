import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";

import { UNDERWATER_ACCOUNTS } from "../apollo/omnicomp/queries";

const MIN_HEALTH = 0.001;
const MAX_HEALTH = 0.999;

const useSubGraph = () => {
  const {
    loading: accountsLoading,
    error: accountsError,
    data: accountsData,
  } = useQuery(UNDERWATER_ACCOUNTS, {
    context: { clientName: "OMNICOMP" },
    pollInterval: 10000,
  });

  const [allUnhealthyAccounts, setAllUnhealthyAccounts] = useState<[] | null>(
    null
  );
  const [filteredUnhealthyAccounts, setFilteredUnhealthyAccounts] = useState<
    [] | null
  >(null);

  const queryAccounts = () => {
    if (accountsData) {
      setAllUnhealthyAccounts(accountsData.accounts);
    }
  };

  const filterAccounts = () => {
    if (allUnhealthyAccounts) {
      const filtered: any = allUnhealthyAccounts.filter(
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
  }, [allUnhealthyAccounts]);

  return {
    allUnhealthyAccounts,
    filteredUnhealthyAccounts,
  };
};

const SubGraph = createContainer(useSubGraph);
export default SubGraph;
