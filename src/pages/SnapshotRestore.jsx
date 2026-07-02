import axios from "axios";
import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { handleChange, validateRequiredFields } from "../forms";
import { RequiredBoolean } from "../forms/RequiredBoolean";
import { RequiredField } from "../forms/RequiredField";
import { RequiredNumberField } from "../forms/RequiredNumberField";
import { errorAlert } from "../utils/uiutil";
import { GoBackButton } from "../components/GoBackButton";
import PropTypes from "prop-types";

export class SnapshotRestoreInternal extends Component {
  constructor() {
    super();

    this.state = {
      incremental: true,
      continueOnErrors: false,
      restoreOwnership: true,
      restorePermissions: true,
      restoreModTimes: true,
      uncompressedZip: true,
      overwriteFiles: false,
      overwriteDirectories: false,
      overwriteSymlinks: false,
      ignorePermissionErrors: true,
      writeFilesAtomically: false,
      writeSparseFiles: false,
      restoreDirEntryAtDepth: 1000,
      minSizeForPlaceholder: 0,
      restoreTask: "",
    };

    this.handleChange = handleChange.bind(this);
    this.start = this.start.bind(this);
  }

  start(e) {
    e.preventDefault();

    if (!validateRequiredFields(this, ["destination"])) {
      return;
    }

    const dst = this.state.destination + "";

    let req = {
      root: this.props.params.oid,
      options: {
        incremental: this.state.incremental,
        ignoreErrors: this.state.continueOnErrors,
        restoreDirEntryAtDepth: this.state.restoreDirEntryAtDepth,
        minSizeForPlaceholder: this.state.minSizeForPlaceholder,
      },
    };

    if (dst.endsWith(".zip")) {
      req.zipFile = dst;
      req.uncompressedZip = this.state.uncompressedZip;
    } else if (dst.endsWith(".tar")) {
      req.tarFile = dst;
    } else {
      req.fsOutput = {
        targetPath: dst,
        skipOwners: !this.state.restoreOwnership,
        skipPermissions: !this.state.restorePermissions,
        skipTimes: !this.state.restoreModTimes,

        ignorePermissionErrors: this.state.ignorePermissionErrors,
        overwriteFiles: this.state.overwriteFiles,
        overwriteDirectories: this.state.overwriteDirectories,
        overwriteSymlinks: this.state.overwriteSymlinks,
        writeFilesAtomically: this.state.writeFilesAtomically,
        writeSparseFiles: this.state.writeSparseFiles,
      };
    }

    axios
      .post("/api/v1/restore", req)
      .then((result) => {
        this.setState({
          restoreTask: result.data.id,
        });
      })
      .catch((error) => {
        errorAlert(error);
      });
  }

  render() {
    if (this.state.restoreTask) {
      return (
        <p>
          <GoBackButton />
          <Link replace={true} to={"/tasks/" + this.state.restoreTask}>
            Ir para a tarefa de restauração
          </Link>
          .
        </p>
      );
    }

    return (
      <div className="padded-top">
        <GoBackButton />
        &nbsp;<span className="page-title">Restaurar</span>
        <hr />
        <Form onSubmit={this.start}>
          <Row>
            {RequiredField(
              this,
              "Destino",
              "destination",
              {
                autoFocus: true,
                placeholder: "digite o caminho de destino",
              },
              "Você também pode restaurar para um arquivo .zip ou .tar, informando a extensão apropriada.",
            )}
          </Row>
          <Row>{RequiredBoolean(this, "Pular arquivos e atalhos já restaurados", "incremental")}</Row>
          <Row>
            {RequiredBoolean(
              this,
              "Continuar mesmo com erros",
              "continueOnErrors",
              "Se ocorrer um erro na restauração, tentar continuar em vez de parar na hora.",
            )}
          </Row>
          <Row>{RequiredBoolean(this, "Restaurar dono do arquivo", "restoreOwnership")}</Row>
          <Row>{RequiredBoolean(this, "Restaurar permissões do arquivo", "restorePermissions")}</Row>
          <Row>{RequiredBoolean(this, "Restaurar data de modificação", "restoreModTimes")}</Row>
          <Row>{RequiredBoolean(this, "Sobrescrever arquivos", "overwriteFiles")}</Row>
          <Row>{RequiredBoolean(this, "Sobrescrever pastas", "overwriteDirectories")}</Row>
          <Row>{RequiredBoolean(this, "Sobrescrever atalhos (symlinks)", "overwriteSymlinks")}</Row>
          <Row>{RequiredBoolean(this, "Gravar arquivos de forma atômica", "writeFilesAtomically")}</Row>
          <Row>{RequiredBoolean(this, "Gravar arquivos esparsos", "writeSparseFiles")}</Row>
          <Row>
            <Col>
              <hr />
            </Col>
          </Row>
          <Row>
            {RequiredNumberField(this, "Restauração superficial a partir da profundidade", "restoreDirEntryAtDepth")}
            {RequiredNumberField(this, "Tamanho mínimo de arquivo p/ restauração superficial", "minSizeForPlaceholder")}
          </Row>
          <Row>
            <Col>
              <hr />
            </Col>
          </Row>
          <Row>
            {RequiredBoolean(
              this,
              "Desativar compressão ZIP",
              "uncompressedZip",
              "Não comprimir ao restaurar para um arquivo ZIP (mais rápido).",
            )}
          </Row>
          <Row>
            <Col>
              <hr />
            </Col>
          </Row>
          <Row>
            <Col>
              <Button variant="primary" type="submit" data-testid="submit-button">
                Iniciar restauração
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

SnapshotRestoreInternal.propTypes = {
  params: PropTypes.object.isRequired,
  navigate: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
};

export function SnapshotRestore(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  return <SnapshotRestoreInternal navigate={navigate} location={location} params={params} {...props} />;
}
