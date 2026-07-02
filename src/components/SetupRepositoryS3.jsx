import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import { handleChange, validateRequiredFields } from "../forms";
import { OptionalField } from "../forms/OptionalField";
import { RequiredBoolean } from "../forms/RequiredBoolean";
import { RequiredField } from "../forms/RequiredField";
import PropTypes from "prop-types";

export class SetupRepositoryS3 extends Component {
  constructor(props) {
    super();

    this.state = {
      doNotUseTLS: false,
      doNotVerifyTLS: false,
      ...props.initial,
    };
    this.handleChange = handleChange.bind(this);
  }

  validate() {
    return validateRequiredFields(this, ["bucket", "endpoint", "accessKeyID", "secretAccessKey"]);
  }

  render() {
    return (
      <>
        <Row>
          {RequiredField(this, "Bucket", "bucket", {
            autoFocus: true,
            placeholder: "digite o nome do bucket",
          })}
          {RequiredField(this, "Endereço do servidor", "endpoint", {
            placeholder: "digite o endereço do servidor (ex.: s3.amazonaws.com)",
          })}
          {OptionalField(this, "Sobrescrever região", "region", {
            placeholder: "digite uma região específica (ex.: us-west-1) ou deixe vazio",
          })}
        </Row>
        <Row>
          {RequiredBoolean(this, "Usar conexão HTTP (insegura)", "doNotUseTLS")}
          {RequiredBoolean(this, "Não verificar o certificado TLS", "doNotVerifyTLS")}
        </Row>
        <Row>
          {RequiredField(this, "ID da chave de acesso", "accessKeyID", {
            placeholder: "digite o ID da chave de acesso",
          })}
          {RequiredField(this, "Chave de acesso secreta", "secretAccessKey", {
            placeholder: "digite a chave de acesso secreta",
            type: "password",
          })}
          {OptionalField(this, "Token de sessão", "sessionToken", {
            placeholder: "digite o token de sessão ou deixe vazio",
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

SetupRepositoryS3.propTypes = {
  initial: PropTypes.object,
};
