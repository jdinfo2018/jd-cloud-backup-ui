import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import { handleChange, validateRequiredFields } from "../forms";
import { OptionalField } from "../forms/OptionalField";
import { RequiredField } from "../forms/RequiredField";
import PropTypes from "prop-types";

export class SetupRepositoryGCS extends Component {
  constructor(props) {
    super();

    this.state = {
      ...props.initial,
    };
    this.handleChange = handleChange.bind(this);
  }

  validate() {
    return validateRequiredFields(this, ["bucket"]);
  }

  render() {
    return (
      <>
        <Row>
          {RequiredField(this, "Bucket GCS", "bucket", {
            autoFocus: true,
            placeholder: "digite o nome do bucket",
          })}
          {OptionalField(this, "Prefixo do nome do objeto", "prefix", {
            placeholder: "digite o prefixo do nome do objeto ou deixe vazio",
            type: "password",
          })}
        </Row>
        <Row>
          {OptionalField(this, "Arquivo de credenciais", "credentialsFile", {
            placeholder: "digite o nome do arquivo JSON de credenciais",
          })}
        </Row>
        <Row>
          {OptionalField(this, "Credenciais JSON", "credentials", {
            placeholder: "cole aqui as credenciais JSON",
            as: "textarea",
            rows: 5,
          })}
        </Row>
      </>
    );
  }
}

SetupRepositoryGCS.propTypes = {
  initial: PropTypes.object,
};
