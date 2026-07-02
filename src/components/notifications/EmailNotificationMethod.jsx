import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import { handleChange, validateRequiredFields } from "../../forms";
import { RequiredField } from "../../forms/RequiredField";
import { RequiredNumberField } from "../../forms/RequiredNumberField";
import { OptionalField } from "../../forms/OptionalField";
import { NotificationFormatSelector } from "./NotificationFormatSelector";
import PropTypes from "prop-types";

export class EmailNotificationMethod extends Component {
  constructor(props) {
    super();

    this.state = {
      smtpPort: 587,
      format: "txt",
      ...props.initial,
    };
    this.handleChange = handleChange.bind(this);
  }

  validate() {
    if (!validateRequiredFields(this, ["smtpServer", "smtpPort", "from", "to"])) {
      return false;
    }

    return true;
  }

  render() {
    return (
      <>
        <Row>
          {RequiredField(this, "Servidor SMTP", "smtpServer", {
            autoFocus: true,
            placeholder: "nome DNS do servidor SMTP, ex.: smtp.gmail.com",
          })}
          {RequiredNumberField(this, "Porta SMTP", "smtpPort", {})}
        </Row>
        <Row>
          {OptionalField(this, "Usuário SMTP", "smtpUsername", {
            placeholder: "usuário do servidor SMTP, normalmente o e-mail",
          })}
          {OptionalField(this, "Senha SMTP", "smtpPassword", {
            placeholder: "senha do servidor SMTP",
            type: "password",
          })}
          {OptionalField(this, "Identidade SMTP (opcional)", "smtpIdentity", {
            placeholder: "identidade do servidor SMTP (normalmente vazio)",
          })}
        </Row>
        <Row>
          {RequiredField(this, "Remetente", "from", {
            placeholder: "e-mail do remetente",
          })}
          {RequiredField(this, "Destinatário", "to", {
            placeholder: "e-mails dos destinatários, separados por vírgula",
          })}
          {OptionalField(this, "Cc", "cc", {
            placeholder: "endereços em cópia (separados por vírgula)",
          })}
          {NotificationFormatSelector(this, "format")}
        </Row>
      </>
    );
  }
}

EmailNotificationMethod.propTypes = {
  initial: PropTypes.object,
};
