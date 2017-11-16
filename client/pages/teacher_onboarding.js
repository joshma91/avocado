import React from "react";
import withWeb3 from "../lib/withWeb3";

const TeacherOnboarding = ({ web3, accounts, contractInstance }) => (
  <div>
    <h1>Teacher onboarding page</h1>
    <pre>{JSON.stringify(accounts, null, 4)}</pre>
  </div>
);

export default withWeb3(TeacherOnboarding);
