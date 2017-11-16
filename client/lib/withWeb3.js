/* globals alert */
import React from "react";
import getWeb3 from "./getWeb3";
import { getAccounts, getContractInstance } from "./utils";

const withWeb3 = PassedComponent => class extends React.Component {
  state = { web3: null, accounts: null, contractInstance: null };

  async componentDidMount() {
    try {
      const web3 = await getWeb3();
      const accounts = await getAccounts(web3);
      const contractInstance = await getContractInstance(web3);
      this.setState({ web3, accounts, contractInstance });
    } catch (error) {
      alert(`Failed to load web3, accounts, and contract. Check console for details.`);
      console.log(error);
    }
  }

  render() {
    const { web3, accounts, contractInstance } = this.state;
    const appReady = web3 && accounts && contractInstance;
    // Web3 is still loading
    if (!appReady) {
      return <div>Loading web3, accounts, and contract instance.</div>;
    }
    // Web3 is ready
    return (
      <PassedComponent
        web3={web3}
        accounts={accounts}
        contractInstance={contractInstance}
      />
    );
  }
};

export default withWeb3;
