import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import { handleChange, validateRequiredFields } from "../forms";
import { OptionalField } from "../forms/OptionalField";
import { RequiredField } from "../forms/RequiredField";
import PropTypes from "prop-types";
export class SetupRepositoryServer extends Component {
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
          {RequiredField(this, "Endereço do servidor", "url", {
            autoFocus: true,
            placeholder: "digite a URL do servidor (https://<host>:porta)",
          })}
        </Row>
        <Row>
          {OptionalField(this, "Impressão digital do certificado confiável (SHA256)", "serverCertFingerprint", {
            placeholder: "cole a impressão digital do certificado exibida ao iniciar o servidor",
          })}
        </Row>
      </>
    );
  }
}

SetupRepositoryServer.propTypes = {
  initial: PropTypes.object,
};
