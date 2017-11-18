import React from "react";
import styled from "styled-components";

const Container = styled.div`
  border: 1px solid black;
`;

const Label = styled.label`
  display: block;
`;

const Input = styled.input`
  margin-bottom: 12px;
`;

export default class Form extends React.Component {
  handleNameChange = e => this.props.setName(e.target.value);
  handleDescriptionChange = e => this.props.setDescription(e.target.value);
  handleEthPerHourChange = e => this.props.setEthPerHour(e.target.value);

  render() {
    const { name, description, ethPerHour } = this.props;
    return (
      <Container>
        <h2>Some Info</h2>
        <Label>Name</Label>
        <Input value={name} onChange={this.handleNameChange} />
        <Label>Description</Label>
        <Input value={description} onChange={this.handleDescriptionChange} />
        <Label>Eth / Hour</Label>
        <Input
          type="number"
          value={ethPerHour}
          onChange={this.handleEthPerHourChange}
        />
      </Container>
    );
  }
}
