import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import { handleChange, validateRequiredFields } from "../forms";
import { OptionalField } from "../forms/OptionalField";
import { RequiredField } from "../forms/RequiredField";
import PropTypes from "prop-types";

export class SetupRepositoryRclone extends Component {
  constructor(props) {
    super();

    this.state = {
      ...props.initial,
    };
    this.handleChange = handleChange.bind(this);
  }

  validate() {
    return validateRequiredFields(this, ["remotePath"]);
  }

  render() {
    return (
      <>
        <Row>
          {RequiredField(this, "Caminho remoto do Rclone", "remotePath", {
            autoFocus: true,
            placeholder: "digite <nome-do-remoto-rclone>:<caminho>",
          })}
        </Row>
        <Row>
          {OptionalField(this, "Caminho do executável do Rclone", "rcloneExe", {
            placeholder: "digite o caminho do executável do rclone",
          })}
        </Row>
      </>
    );
  }
}

SetupRepositoryRclone.propTypes = {
  initial: PropTypes.object,
};
