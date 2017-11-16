/* globals alert */
import React from "react";
import withWeb3 from "../lib/withWeb3";

class Example extends React.Component {
  state = { balance: null };

  // Get the value from the contract to prove it worked.
  getValue = async () => {
    const { accounts, contractInstance } = this.props;
    const response = await contractInstance.get.call({ from: accounts[0] });

    // Update state with the result.
    this.setState({ balance: response.toNumber() });
  };

  // Stores a given value, 5 by default.
  storeValue = async () => {
    const { accounts, contractInstance } = this.props;
    await contractInstance.set(5, { from: accounts[0] });
    alert(`Stored 5 into account`);
  };

  render() {
    const { balance } = this.state;
    return (
      <div>
        <h2>Ready!</h2>
        <button onClick={this.storeValue}>Store 5 into account balance</button>
        <button onClick={this.getValue}>Get account balance</button>
        <div>Balance: {balance || `N/A`}</div>
      </div>
    );
  }
}

export default withWeb3(Example);
