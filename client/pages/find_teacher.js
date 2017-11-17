import React from "react";
import withWeb3 from "../lib/withWeb3";

const FindTeacher = ({ web3, accounts, contractInstance }) => (
  <div>
    <h1>Find a Teacher</h1>
    <pre>{JSON.stringify(accounts, null, 4)}</pre>
  </div>
);

export default withWeb3(FindTeacher);
