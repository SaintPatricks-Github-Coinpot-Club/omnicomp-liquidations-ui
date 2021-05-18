import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";

import { ALL_ACCOUNTS } from "../apollo/omnicomp/queries";

const useSubGraph = () => {
  const {
    loading: allAccountsLoading,
    error: allAccountsError,
    data: allAccountsData,
  } = useQuery(ALL_ACCOUNTS, {
    context: { clientName: "OMNICOMP" },
    pollInterval: 10000,
  });

  const [allAccounts, setAllAccounts] = useState<[] | null>(null);

  const queryAccounts = () => {
    if (allAccountsData) {
      setAllAccounts(allAccountsData.accounts);
    }
  };

  useEffect(() => {
    queryAccounts();
  }, [allAccountsData]);

  return {
    allAccounts,
  };
};

const SubGraph = createContainer(useSubGraph);
export default SubGraph;
