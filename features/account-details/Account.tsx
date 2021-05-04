import { useState, useEffect } from "react";

import AccountAddress from "../../containers/AccountAddress" 

const Account = () => {

  const { accountAddress } = AccountAddress.useContainer();

  return (
    <i>Account Component {accountAddress}</i>
  );
};
export default Account;