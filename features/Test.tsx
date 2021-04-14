
import { useState, useEffect } from "react";

import Connection from "../containers/Connection" 
import SubGraph from "../containers/SubGraph" 

const Test = () => {

  const { block$, provider, userAddress, network } = Connection.useContainer();
  const { accounts } = SubGraph.useContainer();

  return (
    <i>Test Component</i>
  );
};

export default Test;