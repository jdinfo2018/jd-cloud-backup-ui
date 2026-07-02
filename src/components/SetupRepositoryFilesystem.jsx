import React, { Component } from "react";
import { handleChange, validateRequiredFields } from "../forms";
import { RequiredDirectory } from "../forms/RequiredDirectory";
import PropTypes from "prop-types";

export class SetupRepositoryFilesystem extends Component {
  constructor(props) {
    super();

    this.state = {
      ...props.initial,
    };
    this.handleChange = handleChange.bind(this);
  }

  validate() {
    return validateRequiredFields(this, ["path"]);
  }

  render() {
    return (
      <>
        {RequiredDirectory(this, "Caminho da pasta", "path", {
          autoFocus: true,
          placeholder: "digite o caminho da pasta onde os arquivos do repositório serão guardados",
        })}
      </>
    );
  }
}

SetupRepositoryFilesystem.propTypes = {
  initial: PropTypes.object,
};
