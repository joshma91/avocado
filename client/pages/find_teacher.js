import React from "react";
import getWeb3 from "../lib/web3";
import { getAccounts, getContractInstance } from "../lib/utils";

// export default () => <div>Find a Teacher</div>

export default class FindTeacher extends React.Component {
  state = { web3: null, accounts: null, contractInstance: null };

  async componentDidMount() {
    try {
      console.log('attempting to load web3')
      const web3 = await getWeb3();
      const accounts = await getAccounts(web3);
      const contractInstance = await getContractInstance(web3);
      this.setState({ web3, accounts, contractInstance });
    } catch (error) {
      alert(
        "Failed to load web3, accounts, and contract. Check console for details."
      );
      console.log(error);
    }
  }

  render() {
    const { web3, accounts, contractInstance } = this.state;
    const appReady = web3 && accounts && contractInstance;
    // App is still loading
    if (!appReady) {
      return <div>Loading web3, accounts, and contract instance.</div>;
    }
    return (
      <div>
        <h1>Find a Teacher</h1>
        <pre>{JSON.stringify(accounts, null, 4)}</pre>
      </div>
    );
  }
}
