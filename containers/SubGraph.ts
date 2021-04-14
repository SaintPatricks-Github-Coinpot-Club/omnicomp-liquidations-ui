import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";

import { UNDERWATER_ACCOUNTS } from "../apollo/omnicomp/queries";

const useSubGraph = () => {
  const {
    loading: accountsLoading,
    error: accountsError,
    data: accountsData,
  } = useQuery(UNDERWATER_ACCOUNTS, {
    context: { clientName: "OMNICOMP" },
    pollInterval: 10000,
  });

  const [accounts, setAccounts] = useState<[] | null>(null);

  const queryAccounts = () => {
    if (accountsData) {
      setAccounts(accountsData.accounts);
    }
  };

  useEffect(() => {
    queryAccounts();
  }, [accountsData]);

  return {
    accounts,
  };
};

const SubGraph = createContainer(useSubGraph);
export default SubGraph;
