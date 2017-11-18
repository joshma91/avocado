import React from "react";
import withWeb3 from "../lib/withWeb3";
import View from "../components/TeacherOnboarding/View";

class TeacherOnboarding extends React.Component {
  state = {
    searchStr: ``,
    tags: [`japanese`, `english`, `klingon`],
    selectedTags: [],
    name: ``,
    description: ``,
    ethPerHour: 0,
  };

  componentDidMount() {
    // TODO - fetch tags
  }

  setStateProp = stateKey => value => this.setState({ [stateKey]: value });

  handleSubmit = () => {
    console.log(`Submit Info!`);
    console.log(this.state);
  };

  render() {
    return (
      <View
        searchStr={this.state.searchStr}
        tags={this.state.tags}
        selectedTags={this.state.selectedTags}
        name={this.state.name}
        description={this.state.description}
        ethPerHour={this.state.ethPerHour}
        setStateProp={this.setStateProp}
        onSubmit={this.handleSubmit}
      />
    );
  }
}

export default withWeb3(TeacherOnboarding);
