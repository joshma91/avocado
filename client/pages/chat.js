import React from "react";
import withWeb3 from "../lib/withWeb3";

const Chat = ({ web3, accounts, contractInstance }) => (
  <div>
    <h1>Page for teacher-student chat</h1>
    <pre>{JSON.stringify(accounts, null, 4)}</pre>
  </div>
);

export default withWeb3(Chat);
