import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import { handleChange, validateRequiredFields } from "../forms";
import { OptionalField } from "../forms/OptionalField";
import { RequiredField } from "../forms/RequiredField";
import PropTypes from "prop-types";

export class SetupRepositoryWebDAV extends Component {
  constructor(props) {
    super();

    this.state = {
      ...props.initial,
    };
    this.handleChange = handleChange.bind(this);
  }

  validate() {
    return validateRequiredFields(this, ["url"]);
  }

  render() {
    return (
      <>
        <Row>
          {RequiredField(this, "URL do servidor WebDAV", "url", {
            autoFocus: true,
            placeholder: "http[s]://servidor:porta/caminho",
          })}
        </Row>
        <Row>
          {OptionalField(this, "Usuário", "username", {
            placeholder: "digite o usuário",
          })}
          {OptionalField(this, "Senha", "password", {
            placeholder: "digite a senha",
            type: "password",
          })}
        </Row>
      </>
    );
  }
}

SetupRepositoryWebDAV.propTypes = {
  initial: PropTypes.object,
};
