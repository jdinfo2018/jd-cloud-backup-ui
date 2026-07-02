import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import { handleChange, validateRequiredFields } from "../forms";
import { RequiredField } from "../forms/RequiredField";
import { OptionalField } from "../forms/OptionalField";
import PropTypes from "prop-types";

export class SetupRepositoryB2 extends Component {
  constructor(props) {
    super();

    this.state = {
      ...props.initial,
    };
    this.handleChange = handleChange.bind(this);
  }

  validate() {
    return validateRequiredFields(this, ["bucket", "keyId", "key"]);
  }

  render() {
    return (
      <>
        <Row>
          {RequiredField(this, "Bucket B2", "bucket", {
            autoFocus: true,
            placeholder: "digite o nome do bucket",
          })}
        </Row>
        <Row>
          {RequiredField(this, "ID da chave", "keyId", {
            placeholder: "digite o ID da chave de aplicação ou da conta",
          })}
          {RequiredField(this, "Chave", "key", {
            placeholder: "digite a chave secreta de aplicação ou da conta",
            type: "password",
          })}
        </Row>
        <Row>
          {OptionalField(this, "Prefixo do nome do objeto", "prefix", {
            placeholder: "digite o prefixo do nome do objeto ou deixe vazio",
          })}
        </Row>
      </>
    );
  }
}

SetupRepositoryB2.propTypes = {
  initial: PropTypes.object,
};
