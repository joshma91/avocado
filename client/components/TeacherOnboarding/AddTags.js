import React from "react";

const AvailableTag = ({ tag, addTag }) => {
  const addThisTag = () => addTag(tag);
  return <div onClick={addThisTag}>{tag}</div>;
};

const SelectedTag = ({ tag, removeTag }) => {
  const removeThisTag = () => removeTag(tag);
  return <div>{tag} <span onClick={removeThisTag}>X</span></div>;
};

export default class AddTags extends React.Component {
  handleChange = e => this.props.setSearchStr(e.target.value);

  handleKeyDown = (e) => {
    const { searchStr, setSearchStr } = this.props;
    if (e.keyCode === 13) {
      this.addTag(searchStr);
      setSearchStr(``);
    }
  };

  addTag = (tag) => {
    const { selectedTags, setSelectedTags } = this.props;
    const alreadySelected = selectedTags
      .map(x => x.toUpperCase())
      .includes(tag.toUpperCase());
    if (!alreadySelected) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  removeTag = (tag) => {
    const { selectedTags, setSelectedTags } = this.props;
    const newSelectedTags = selectedTags.filter(selectedTag => selectedTag !== tag);
    setSelectedTags(newSelectedTags);
  };

  render() {
    const { searchStr, tags, selectedTags } = this.props;
    const matchingTags = tags.filter(tag =>
      tag.toUpperCase().includes(searchStr.toUpperCase()));
    return (
      <div>
        <input
          type="search"
          value={searchStr}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
        />
        <div>
          <h2>Available Tags</h2>
          {matchingTags.map(tag => (
            <AvailableTag key={tag} tag={tag} addTag={this.addTag} />
          ))}
        </div>
        <div>
          <h2>Selected Tags</h2>
          {selectedTags.map(tag => (
            <SelectedTag key={tag} tag={tag} removeTag={this.removeTag} />
          ))}
        </div>
      </div>
    );
  }
}
