
import { useState, useEffect } from "react";

import Connection from "../containers/Connection" 

const Test = () => {

  const { block$, provider, userAddress, network } = Connection.useContainer();

  const print = () => {
    console.log(network)
    console.log(provider)
  }


  // get token info on each new block
  // DO NOT USE IN COMPONENT (TSX) FILE
  useEffect(() => {
    if (block$) {
      const sub = block$.subscribe(() => print());
      return () => sub.unsubscribe();
    }
  }, [block$, userAddress, provider, network]);

  return (
    <i>Test Component</i>
  );
};

export default Test;