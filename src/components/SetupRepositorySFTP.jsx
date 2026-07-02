import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import { handleChange, validateRequiredFields, stateProperty } from "../forms";
import { OptionalField } from "../forms/OptionalField";
import { OptionalNumberField } from "../forms/OptionalNumberField";
import { RequiredBoolean } from "../forms/RequiredBoolean";
import { RequiredField } from "../forms/RequiredField";
import PropTypes from "prop-types";

function hasExactlyOneOf(component, names) {
  let count = 0;

  for (let i = 0; i < names.length; i++) {
    if (stateProperty(component, names[i])) {
      count++;
    }
  }

  return count === 1;
}

export class SetupRepositorySFTP extends Component {
  constructor(props) {
    super();

    this.state = {
      port: 22,
      validated: false,
      ...props.initial,
    };
    this.handleChange = handleChange.bind(this);
  }

  validate() {
    this.setState({
      validated: true,
    });

    if (!validateRequiredFields(this, ["host", "port", "username", "path"])) {
      return false;
    }

    if (this.state.externalSSH) {
      return true;
    }

    if (!hasExactlyOneOf(this, ["password", "keyfile", "keyData"])) {
      return false;
    }

    if (!hasExactlyOneOf(this, ["knownHostsFile", "knownHostsData"])) {
      return false;
    }

    return true;
  }

  render() {
    return (
      <>
        <Row>
          {RequiredField(this, "Host", "host", {
            autoFocus: true,
            placeholder: "nome do host SSH (ex.: example.com)",
          })}
          {RequiredField(this, "Usuário", "username", {
            placeholder: "nome de usuário",
          })}
          {OptionalNumberField(this, "Porta", "port", {
            placeholder: "número da porta (ex.: 22)",
          })}
        </Row>
        <Row>
          {RequiredField(this, "Caminho", "path", {
            placeholder: "digite o caminho remoto do repositório, ex.: '/mnt/data/repository'",
          })}
        </Row>
        {!this.state.externalSSH && (
          <>
            <Row>
              {OptionalField(this, "Senha", "password", {
                type: "password",
                placeholder: "senha",
              })}
            </Row>
            <Row>
              {OptionalField(this, "Caminho do arquivo de chave", "keyfile", {
                placeholder: "digite o caminho do arquivo de chave",
              })}
              {OptionalField(this, "Caminho do arquivo known_hosts", "knownHostsFile", {
                placeholder: "digite o caminho do arquivo known_hosts",
              })}
            </Row>
            <Row>
              {OptionalField(
                this,
                "Conteúdo da chave",
                "keyData",
                {
                  placeholder: "cole o conteúdo do arquivo de chave",
                  as: "textarea",
                  rows: 5,
                  isInvalid:
                    this.state.validated &&
                    !this.state.externalSSH &&
                    !hasExactlyOneOf(this, ["password", "keyfile", "keyData"]),
                },
                null,
                <>
                  É obrigatório um entre <b>Senha</b>, <b>Arquivo de chave</b> ou <b>Conteúdo da chave</b>.
                </>,
              )}
              {OptionalField(
                this,
                "Conteúdo do known_hosts",
                "knownHostsData",
                {
                  placeholder: "cole o conteúdo do arquivo known_hosts",
                  as: "textarea",
                  rows: 5,
                  isInvalid:
                    this.state.validated &&
                    !this.state.externalSSH &&
                    !hasExactlyOneOf(this, ["knownHostsFile", "knownHostsData"]),
                },
                null,
                <>
                  É obrigatório o <b>Arquivo known_hosts</b> ou o <b>Conteúdo do known_hosts</b>, mas não os dois.
                </>,
              )}
            </Row>
            <hr />
          </>
        )}
        {RequiredBoolean(
          this,
          "Executar comando SSH externo sem senha",
          "externalSSH",
          "Por padrão o JD Cloud Backup conecta ao servidor usando o cliente SSH interno, que tem opções limitadas. Como alternativa, pode executar um comando SSH externo sem senha, que suporta mais opções, mas em geral é menos eficiente que o cliente interno.",
        )}
        {this.state.externalSSH && (
          <>
            <Row>
              {OptionalField(this, "Comando SSH", "sshCommand", {
                placeholder: "informe o comando SSH sem senha a executar (normalmente 'ssh')",
              })}
              {OptionalField(this, "Argumentos do SSH", "sshArguments", {
                placeholder: "digite os argumentos do SSH ('user@host -s sftp' é anexado automaticamente)",
              })}
            </Row>
          </>
        )}
      </>
    );
  }
}

SetupRepositorySFTP.propTypes = {
  initial: PropTypes.object,
};
