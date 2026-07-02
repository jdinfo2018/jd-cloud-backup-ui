import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import { handleChange, validateRequiredFields } from "../forms";
import { OptionalField } from "../forms/OptionalField";
import { RequiredField } from "../forms/RequiredField";
import PropTypes from "prop-types";
export class SetupRepositoryAzure extends Component {
  constructor(props) {
    super();

    this.state = {
      ...props.initial,
    };
    this.handleChange = handleChange.bind(this);
  }

  validate() {
    return validateRequiredFields(this, ["container", "storageAccount"]);
  }

  render() {
    return (
      <>
        <Row>
          {RequiredField(this, "Container", "container", {
            autoFocus: true,
            placeholder: "digite o nome do container",
          })}
          {OptionalField(this, "Prefixo do nome do objeto", "prefix", {
            placeholder: "digite o prefixo do nome do objeto ou deixe vazio",
          })}
        </Row>
        <Row>
          {RequiredField(this, "Conta de armazenamento", "storageAccount", {
            placeholder: "digite o nome da conta de armazenamento",
          })}
          {OptionalField(this, "Chave de acesso", "storageKey", {
            placeholder: "digite a chave de acesso secreta",
            type: "password",
          })}
        </Row>
        <Row>
          {OptionalField(this, "Domínio do Azure Storage", "storageDomain", {
            placeholder: "digite o domínio ou deixe vazio para o padrão 'blob.core.windows.net'",
          })}
          {OptionalField(this, "Token SAS", "sasToken", {
            placeholder: "digite o Token SAS secreto",
            type: "password",
          })}
        </Row>
      </>
    );
  }
}

SetupRepositoryAzure.propTypes = {
  initial: PropTypes.object,
};
