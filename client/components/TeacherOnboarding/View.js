import React from "react";
import AddTags from "./AddTags";
import Form from "./Form";

export default ({
  searchStr,
  setStateProp,
  tags,
  selectedTags,
  name,
  description,
  ethPerHour,
  onSubmit,
}) => (
  <div>
    <h1>Teacher onboarding page</h1>
    <AddTags
      searchStr={searchStr}
      tags={tags}
      selectedTags={selectedTags}
      setSearchStr={setStateProp(`searchStr`)}
      setSelectedTags={setStateProp(`selectedTags`)}
    />
    <Form
      name={name}
      description={description}
      ethPerHour={ethPerHour}
      setName={setStateProp(`name`)}
      setDescription={setStateProp(`description`)}
      setEthPerHour={setStateProp(`ethPerHour`)}
    />
    <button onClick={onSubmit}>Submit</button>
  </div>
);
