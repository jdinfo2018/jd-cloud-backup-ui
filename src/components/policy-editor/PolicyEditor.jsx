import {
  faCalendarTimes,
  faClock,
  faExclamationTriangle,
  faFileAlt,
  faFileArchive,
  faFolderOpen,
  faMagic,
  faCog,
  faCogs,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import Accordion from "react-bootstrap/Accordion";
import { handleChange, stateProperty, valueToNumber } from "../../forms";
import { StringList } from "../../forms/StringList";
import { LogDetailSelector } from "../../forms/LogDetailSelector";
import { OptionalBoolean } from "../../forms/OptionalBoolean";
import { OptionalNumberField } from "../../forms/OptionalNumberField";
import { RequiredBoolean } from "../../forms/RequiredBoolean";
import { TimesOfDayList } from "../../forms/TimesOfDayList";
import { errorAlert, toAlgorithmOption } from "../../utils/uiutil";
import { sourceQueryStringParams } from "../../utils/policyutil";
import { PolicyEditorLink } from "../PolicyEditorLink";
import { LabelColumn } from "./LabelColumn";
import { ValueColumn } from "./ValueColumn";
import { WideValueColumn } from "./WideValueColumn";
import { EffectiveValue } from "./EffectiveValue";
import { EffectiveListValue } from "./EffectiveListValue";
import { EffectiveTextAreaValue } from "./EffectiveTextAreaValue";
import { EffectiveTimesOfDayValue } from "./EffectiveTimesOfDayValue";
import { EffectiveBooleanValue } from "./EffectiveBooleanValue";
import { EffectiveValueColumn } from "./EffectiveValueColumn";
import { UpcomingSnapshotTimes } from "./UpcomingSnapshotTimes";
import { SectionHeaderRow } from "./SectionHeaderRow";
import { ActionRowScript } from "./ActionRowScript";
import { ActionRowTimeout } from "./ActionRowTimeout";
import { ActionRowMode } from "./ActionRowMode";
import PropTypes from "prop-types";

export class PolicyEditor extends Component {
  constructor() {
    super();
    this.state = {
      items: [],
      isLoading: false,
      error: null,
    };

    this.fetchPolicy = this.fetchPolicy.bind(this);
    this.handleChange = handleChange.bind(this);
    this.saveChanges = this.saveChanges.bind(this);
    this.isGlobal = this.isGlobal.bind(this);
    this.deletePolicy = this.deletePolicy.bind(this);
    this.policyURL = this.policyURL.bind(this);
    this.resolvePolicy = this.resolvePolicy.bind(this);
    this.PolicyDefinitionPoint = this.PolicyDefinitionPoint.bind(this);
    this.getAndValidatePolicy = this.getAndValidatePolicy.bind(this);
  }

  componentDidMount() {
    axios.get("/api/v1/repo/algorithms").then((result) => {
      this.setState({
        algorithms: result.data,
      });

      this.fetchPolicy(this.props);
    });
  }

  componentDidUpdate(prevProps) {
    if (sourceQueryStringParams(this.props) !== sourceQueryStringParams(prevProps)) {
      this.fetchPolicy(this.props);
    }

    const pjs = JSON.stringify(this.state.policy);
    if (pjs !== this.lastResolvedPolicy) {
      this.resolvePolicy(this.props);
      this.lastResolvedPolicy = pjs;
    }
  }

  fetchPolicy(props) {
    axios
      .get(this.policyURL(props))
      .then((result) => {
        this.setState({
          isLoading: false,
          policy: result.data,
        });
      })
      .catch((error) => {
        if (error.response && error.response.data.code !== "NOT_FOUND") {
          this.setState({
            error: error,
            isLoading: false,
          });
        } else {
          this.setState({
            policy: {},
            isNew: true,
            isLoading: false,
          });
        }
      });
  }

  resolvePolicy(props) {
    const u = "/api/v1/policy/resolve?" + sourceQueryStringParams(props);

    try {
      axios
        .post(u, {
          updates: this.getAndValidatePolicy(),
          numUpcomingSnapshotTimes: 5,
        })
        .then((result) => {
          this.setState({ resolved: result.data });
        })
        .catch((error) => {
          this.setState({ resolvedError: error });
        });
    } catch (e) {
      console.log("Error resolving policy: ", e);
    }
  }

  PolicyDefinitionPoint(p) {
    if (!p) {
      return "";
    }

    if (p.userName === this.props.userName && p.host === this.props.host && p.path === this.props.path) {
      return "(Definido por esta política)";
    }

    return <>Definido por {PolicyEditorLink(p)}</>;
  }

  getAndValidatePolicy() {
    function removeEmpty(l) {
      if (!l) {
        return l;
      }

      let result = [];
      for (let i = 0; i < l.length; i++) {
        const s = l[i];
        if (s === "") {
          continue;
        }

        result.push(s);
      }

      return result;
    }

    function validateTimesOfDay(l) {
      for (const tod of l) {
        if (typeof tod !== "object") {
          // unparsed
          throw Error("invalid time of day: '" + tod + "'");
        }
      }

      return l;
    }

    // clone and clean up policy before saving
    let policy = JSON.parse(JSON.stringify(this.state.policy));
    if (policy.files) {
      if (policy.files.ignore) {
        policy.files.ignore = removeEmpty(policy.files.ignore);
      }
      if (policy.files.ignoreDotFiles) {
        policy.files.ignoreDotFiles = removeEmpty(policy.files.ignoreDotFiles);
      }
    }

    if (policy.compression) {
      if (policy.compression.onlyCompress) {
        policy.compression.onlyCompress = removeEmpty(policy.compression.onlyCompress);
      }
      if (policy.compression.neverCompress) {
        policy.compression.neverCompress = removeEmpty(policy.compression.neverCompress);
      }
    }

    if (policy.scheduling) {
      if (policy.scheduling.timeOfDay) {
        policy.scheduling.timeOfDay = validateTimesOfDay(removeEmpty(policy.scheduling.timeOfDay));
      }
    }

    if (policy.actions) {
      policy.actions = this.sanitizeActions(policy.actions, [
        "beforeSnapshotRoot",
        "afterSnapshotRoot",
        "beforeFolder",
        "afterFolder",
      ]);
    }

    return policy;
  }

  sanitizeActions(actions, actionTypes) {
    actionTypes.forEach((actionType) => {
      if (actions[actionType]) {
        if (actions[actionType].script === undefined || actions[actionType].script === "") {
          actions[actionType] = undefined;
        } else {
          if (actions[actionType].timeout === undefined) {
            actions[actionType].timeout = 300;
          }
        }
      }
    });
    return actions;
  }

  saveChanges(e) {
    e.preventDefault();

    try {
      const policy = this.getAndValidatePolicy();

      this.setState({ saving: true });
      axios
        .put(this.policyURL(this.props), policy)
        .then((_result) => {
          this.props.close();
        })
        .catch((error) => {
          this.setState({ saving: false });
          errorAlert(error, "Erro ao salvar a política");
        });
    } catch (e) {
      errorAlert(e);
      return;
    }
  }

  deletePolicy() {
    if (window.confirm("Tem certeza de que deseja excluir esta política?")) {
      this.setState({ saving: true });

      axios
        .delete(this.policyURL(this.props))
        .then((_result) => {
          this.props.close();
        })
        .catch((error) => {
          this.setState({ saving: false });
          errorAlert(error, "Erro ao excluir a política");
        });
    }
  }

  policyURL(props) {
    return "/api/v1/policy?" + sourceQueryStringParams(props);
  }

  isGlobal() {
    return !this.props.host && !this.props.userName && !this.props.path;
  }

  render() {
    const { isLoading, error } = this.state;
    if (error) {
      return <p>{error.message}</p>;
    }

    if (isLoading) {
      return <p>Carregando ...</p>;
    }

    return (
      <>
        <Form className="policy-editor" onSubmit={this.saveChanges}>
          <Accordion defaultActiveKey="scheduling">
            <Accordion.Item eventKey="retention">
              <Accordion.Header>
                <FontAwesomeIcon icon={faCalendarTimes} />
                &nbsp;Retenção de cópias
              </Accordion.Header>
              <Accordion.Body>
                <SectionHeaderRow />
                <Row>
                  <LabelColumn
                    name="Cópias mais recentes"
                    help="Quantidade das cópias mais recentes a manter por origem"
                  />
                  <ValueColumn>
                    {OptionalNumberField(this, null, "policy.retention.keepLatest", {
                      placeholder: "nº de cópias recentes",
                    })}
                  </ValueColumn>
                  {EffectiveValue(this, "retention.keepLatest")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Por hora"
                    help="Quantas cópias por hora manter por origem. A última cópia de cada hora é mantida"
                  />
                  <ValueColumn>
                    {OptionalNumberField(this, null, "policy.retention.keepHourly", {
                      placeholder: "nº de cópias por hora",
                    })}
                  </ValueColumn>
                  {EffectiveValue(this, "retention.keepHourly")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Diária"
                    help="Quantas cópias diárias manter por origem. A última cópia de cada dia é mantida"
                  />
                  <ValueColumn>
                    {OptionalNumberField(this, null, "policy.retention.keepDaily", {
                      placeholder: "nº de cópias diárias",
                    })}
                  </ValueColumn>
                  {EffectiveValue(this, "retention.keepDaily")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Semanal"
                    help="Quantas cópias semanais manter por origem. A última cópia de cada semana é mantida"
                  />
                  <ValueColumn>
                    {OptionalNumberField(this, null, "policy.retention.keepWeekly", {
                      placeholder: "nº de cópias semanais",
                    })}
                  </ValueColumn>
                  {EffectiveValue(this, "retention.keepWeekly")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Mensal"
                    help="Quantas cópias mensais manter por origem. A última cópia de cada mês do calendário é mantida"
                  />
                  <ValueColumn>
                    {OptionalNumberField(this, null, "policy.retention.keepMonthly", {
                      placeholder: "nº de cópias mensais",
                    })}
                  </ValueColumn>
                  {EffectiveValue(this, "retention.keepMonthly")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Anual"
                    help="Quantas cópias anuais manter por origem. A última cópia de cada ano do calendário é mantida"
                  />
                  <ValueColumn>
                    {OptionalNumberField(this, null, "policy.retention.keepAnnual", {
                      placeholder: "nº de cópias anuais",
                    })}
                  </ValueColumn>
                  {EffectiveValue(this, "retention.keepAnnual")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Ignorar cópias idênticas"
                    help="NÃO salvar uma cópia quando nenhum arquivo foi alterado"
                  />
                  <ValueColumn>
                    {OptionalBoolean(this, null, "policy.retention.ignoreIdenticalSnapshots", "herdar do nível acima")}
                  </ValueColumn>
                  {EffectiveValue(this, "retention.ignoreIdenticalSnapshots")}
                </Row>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="files">
              <Accordion.Header>
                <FontAwesomeIcon icon={faFolderOpen} />
                &nbsp;Arquivos
              </Accordion.Header>
              <Accordion.Body>
                <SectionHeaderRow />
                <Row>
                  <LabelColumn
                    name="Ignorar arquivos"
                    help={
                      <>
                        {" "}
                        Lista de nomes de arquivos e pastas a ignorar. <br /> (Veja a{" "}
                        <a target="_blank" rel="noreferrer" href="https://kopia.io/docs/advanced/kopiaignore/">
                          documentação sobre ignorar arquivos
                        </a>
                        ).
                      </>
                    }
                  />
                  <WideValueColumn>
                    {StringList(this, "policy.files.ignore", {
                      placeholder: "ex.: /arquivo.txt",
                    })}
                  </WideValueColumn>
                  {EffectiveTextAreaValue(this, "files.ignore")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Ignorar regras das pastas acima"
                    help="Quando ativado, as regras de ignorar da pasta acima são desconsideradas"
                  />
                  <ValueColumn>{RequiredBoolean(this, "", "policy.files.noParentIgnore")}</ValueColumn>
                  <EffectiveValueColumn />
                </Row>
                <Row>
                  <LabelColumn
                    name="Arquivos de regras de ignorar"
                    help="Lista de arquivos adicionais com regras de ignorar (cada arquivo define as regras para a pasta e suas subpastas)"
                  />
                  <ValueColumn>
                    {StringList(this, "policy.files.ignoreDotFiles", {
                      placeholder: "ex.: .kopiaignore",
                    })}
                  </ValueColumn>
                  {EffectiveTextAreaValue(this, "files.ignoreDotFiles")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Arquivos de regras das pastas acima"
                    help="Quando ativado, os arquivos de regras de ignorar (.kopiaignore, etc.) da pasta acima são desconsiderados"
                  />
                  <ValueColumn>{RequiredBoolean(this, "", "policy.files.noParentDotFiles")}</ValueColumn>
                  <EffectiveValueColumn />
                </Row>
                <Row>
                  <LabelColumn
                    name="Ignorar pastas de cache conhecidas"
                    help="Ignora pastas que contêm CACHEDIR.TAG e similares"
                  />
                  <ValueColumn>
                    {OptionalBoolean(this, null, "policy.files.ignoreCacheDirs", "herdar do nível acima")}
                  </ValueColumn>
                  {EffectiveBooleanValue(this, "files.ignoreCacheDirs")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Ignorar arquivos maiores que"
                    help="Quando definido, arquivos maiores que o tamanho informado são ignorados (em bytes)"
                  />
                  <ValueColumn>{OptionalNumberField(this, "", "policy.files.maxFileSize")}</ValueColumn>
                  {EffectiveValue(this, "files.maxFileSize")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Ler apenas um sistema de arquivos"
                    help="Não atravessar limites de sistema de arquivos ao criar uma cópia"
                  />
                  <ValueColumn>
                    {OptionalBoolean(this, null, "policy.files.oneFileSystem", "herdar do nível acima")}
                  </ValueColumn>
                  {EffectiveBooleanValue(this, "files.oneFileSystem")}
                </Row>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="errors">
              <Accordion.Header>
                <FontAwesomeIcon icon={faExclamationTriangle} />
                &nbsp;Tratamento de erros
              </Accordion.Header>
              <Accordion.Body>
                <SectionHeaderRow />
                <Row>
                  <LabelColumn name="Ignorar erros de pasta" help="Tratar erros de leitura de pasta como não-fatais." />
                  <ValueColumn>
                    {OptionalBoolean(this, null, "policy.errorHandling.ignoreDirectoryErrors", "herdar do nível acima")}
                  </ValueColumn>
                  {EffectiveBooleanValue(this, "errorHandling.ignoreDirectoryErrors")}
                </Row>
                <Row>
                  <LabelColumn name="Ignorar erros de arquivo" help="Tratar erros de leitura de arquivo como não-fatais." />
                  <ValueColumn>
                    {OptionalBoolean(this, null, "policy.errorHandling.ignoreFileErrors", "herdar do nível acima")}
                  </ValueColumn>
                  {EffectiveBooleanValue(this, "errorHandling.ignoreFileErrors")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Ignorar entradas de pasta desconhecidas"
                    help="Tratar entradas de pasta não reconhecidas/sem suporte como erros não-fatais."
                  />
                  <ValueColumn>
                    {OptionalBoolean(this, null, "policy.errorHandling.ignoreUnknownTypes", "herdar do nível acima")}
                  </ValueColumn>
                  {EffectiveBooleanValue(this, "errorHandling.ignoreUnknownTypes")}
                </Row>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="compression">
              <Accordion.Header>
                <FontAwesomeIcon icon={faFileArchive} />
                &nbsp;Compressão
              </Accordion.Header>
              <Accordion.Body>
                <SectionHeaderRow />
                <Row>
                  <LabelColumn
                    name="Algoritmo de compressão"
                    help="Define o algoritmo de compressão ao copiar os arquivos desta pasta e subpastas"
                  />
                  <WideValueColumn>
                    <Form.Control
                      as="select"
                      size="sm"
                      name="policy.compression.compressorName"
                      onChange={this.handleChange}
                      value={stateProperty(this, "policy.compression.compressorName")}
                    >
                      <option value="">(nenhum)</option>
                      {this.state.algorithms && this.state.algorithms.compression.map((x) => toAlgorithmOption(x, ""))}
                    </Form.Control>
                  </WideValueColumn>
                  {EffectiveValue(this, "compression.compressorName")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Tamanho mínimo de arquivo"
                    help="Arquivos menores que o valor informado não serão comprimidos"
                  />
                  <ValueColumn>
                    {OptionalNumberField(this, "", "policy.compression.minSize", {
                      placeholder: "tamanho mínimo do arquivo em bytes",
                    })}
                  </ValueColumn>
                  {EffectiveValue(this, "compression.minSize")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Tamanho máximo de arquivo"
                    help="Arquivos cujo tamanho exceda o valor informado não serão comprimidos"
                  />
                  <ValueColumn>
                    {OptionalNumberField(this, "", "policy.compression.maxSize", {
                      placeholder: "tamanho máximo do arquivo em bytes",
                    })}
                  </ValueColumn>
                  {EffectiveValue(this, "compression.maxSize")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Comprimir só estas extensões"
                    help="Comprimir apenas arquivos com as extensões a seguir (uma por linha)"
                  />
                  <WideValueColumn>
                    {StringList(this, "policy.compression.onlyCompress", {
                      placeholder: "ex.: .txt",
                    })}
                  </WideValueColumn>
                  {EffectiveTextAreaValue(this, "compression.onlyCompress")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Nunca comprimir estas extensões"
                    help="Nunca comprimir os arquivos com as extensões a seguir (uma por linha)"
                  />
                  <WideValueColumn>
                    {StringList(this, "policy.compression.neverCompress", {
                      placeholder: "ex.: .mp4",
                    })}
                  </WideValueColumn>
                  {EffectiveTextAreaValue(this, "compression.neverCompress")}
                </Row>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="scheduling">
              <Accordion.Header>
                <FontAwesomeIcon icon={faClock} />
                &nbsp;Agendamento
              </Accordion.Header>
              <Accordion.Body>
                <SectionHeaderRow />
                <Row>
                  <LabelColumn
                    name="Frequência das cópias"
                    help="Com que frequência criar cópias no JD Cloud Backup ou no servidor (sem efeito fora do modo servidor)"
                  />
                  <WideValueColumn>
                    <Form.Control
                      as="select"
                      size="sm"
                      name="policy.scheduling.intervalSeconds"
                      onChange={(e) => this.handleChange(e, valueToNumber)}
                      value={stateProperty(this, "policy.scheduling.intervalSeconds")}
                    >
                      <option value="">(nenhuma)</option>
                      <option value="600">a cada 10 minutos</option>
                      <option value="900">a cada 15 minutos</option>
                      <option value="1200">a cada 20 minutos</option>
                      <option value="1800">a cada 30 minutos</option>
                      <option value="3600">a cada hora</option>
                      <option value="10800">a cada 3 horas</option>
                      <option value="21600">a cada 6 horas</option>
                      <option value="43200">a cada 12 horas</option>
                    </Form.Control>
                  </WideValueColumn>
                  {EffectiveValue(this, "scheduling.intervalSeconds")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Horários do dia"
                    help="Criar cópias nos horários especificados (formato 24h)"
                  />
                  <ValueColumn>
                    {TimesOfDayList(this, "policy.scheduling.timeOfDay", {
                      placeholder: "ex.: 17:00",
                    })}
                  </ValueColumn>
                  {EffectiveTimesOfDayValue(this, "scheduling.timeOfDay")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Expressões Cron"
                    help={
                      <>
                        Agendamentos usando a sintaxe do crontab UNIX (uma por linha):
                        <br /> Veja os{" "}
                        <a target="_blank" rel="noreferrer" href="https://github.com/hashicorp/cronexpr#implementation">
                          detalhes do formato suportado
                        </a>
                        .
                      </>
                    }
                  />
                  <ValueColumn>
                    {StringList(this, "policy.scheduling.cron", {
                      placeholder: "minuto hora dia mês dia-da-semana #comentário",
                    })}
                  </ValueColumn>
                  {EffectiveListValue(this, "scheduling.cron")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Rodar cópias perdidas ao iniciar"
                    help="Executar imediatamente as cópias perdidas quando o JD Cloud Backup inicia (só vale para cópias por horário do dia)"
                  />
                  <ValueColumn>
                    {OptionalBoolean(this, "", "policy.scheduling.runMissed", "herdar do nível acima")}
                  </ValueColumn>
                  {EffectiveBooleanValue(this, "scheduling.runMissed")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Somente cópias manuais"
                    help="Criar cópias apenas manualmente (desativa as cópias agendadas)"
                  />
                  <ValueColumn>
                    {OptionalBoolean(this, "", "policy.scheduling.manual", "herdar do nível acima")}
                  </ValueColumn>
                  {EffectiveBooleanValue(this, "scheduling.manual")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Próximas cópias"
                    help="Horários das próximas cópias, calculados com base nos parâmetros da política"
                  />
                  <ValueColumn></ValueColumn>
                  <EffectiveValueColumn>{UpcomingSnapshotTimes(this.state?.resolved)}</EffectiveValueColumn>
                </Row>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="upload">
              <Accordion.Header>
                <FontAwesomeIcon icon={faUpload} />
                &nbsp;Envio
              </Accordion.Header>
              <Accordion.Body>
                <SectionHeaderRow />
                <Row>
                  <LabelColumn
                    name="Máximo de cópias em paralelo"
                    help="Número máximo de cópias que podem ser enviadas ao mesmo tempo"
                  />
                  <ValueColumn>
                    {OptionalNumberField(this, "", "policy.upload.maxParallelSnapshots", {
                      placeholder: !this.props.path
                        ? "nº máximo de cópias em paralelo"
                        : "precisa ser definido em política global, de usuário ou de máquina",
                      disabled: !!this.props.path,
                    })}
                  </ValueColumn>
                  {EffectiveValue(this, "upload.maxParallelSnapshots")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Máximo de leituras de arquivo em paralelo"
                    help="Número máximo de arquivos lidos em paralelo (padrão = número de processadores lógicos)"
                  />
                  <ValueColumn>
                    {OptionalNumberField(this, "", "policy.upload.maxParallelFileReads", {
                      placeholder: "nº máximo de leituras de arquivo em paralelo",
                    })}
                  </ValueColumn>
                  {EffectiveValue(this, "upload.maxParallelFileReads")}
                </Row>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="snapshot-actions">
              <Accordion.Header>
                <FontAwesomeIcon icon={faCogs} />
                &nbsp;Ações da cópia
              </Accordion.Header>
              <Accordion.Body>
                <SectionHeaderRow />
                {ActionRowScript(
                  this,
                  "actions.beforeSnapshotRoot.script",
                  "Antes da cópia",
                  "Script a executar antes da cópia",
                )}
                {ActionRowTimeout(this, "actions.beforeSnapshotRoot.timeout")}
                {ActionRowMode(this, "actions.beforeSnapshotRoot.mode")}
                <hr />
                {ActionRowScript(
                  this,
                  "actions.afterSnapshotRoot.script",
                  "Depois da cópia",
                  "Script a executar depois da cópia",
                )}
                {ActionRowTimeout(this, "actions.afterSnapshotRoot.timeout")}
                {ActionRowMode(this, "actions.afterSnapshotRoot.mode")}
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="folder-actions">
              <Accordion.Header>
                <FontAwesomeIcon icon={faCog} />
                &nbsp;Ações de pasta
              </Accordion.Header>
              <Accordion.Body>
                <SectionHeaderRow />
                {ActionRowScript(this, "actions.beforeFolder.script", "Antes da pasta", "Script a executar antes da pasta")}
                {ActionRowTimeout(this, "actions.beforeFolder.timeout")}
                {ActionRowMode(this, "actions.beforeFolder.mode")}
                <hr />
                {ActionRowScript(this, "actions.afterFolder.script", "Depois da pasta", "Script a executar depois da pasta")}
                {ActionRowTimeout(this, "actions.afterFolder.timeout")}
                {ActionRowMode(this, "actions.afterFolder.mode")}
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="logging">
              <Accordion.Header>
                <FontAwesomeIcon icon={faFileAlt} />
                &nbsp;Registros
              </Accordion.Header>
              <Accordion.Body>
                <SectionHeaderRow />
                <Row>
                  <LabelColumn name="Pasta copiada" help="Nível de detalhe do registro quando uma pasta é copiada" />
                  <WideValueColumn>{LogDetailSelector(this, "policy.logging.directories.snapshotted")}</WideValueColumn>
                  {EffectiveValue(this, "logging.directories.snapshotted")}
                </Row>
                <Row>
                  <LabelColumn name="Pasta ignorada" help="Nível de detalhe do registro quando uma pasta é ignorada" />
                  <WideValueColumn>{LogDetailSelector(this, "policy.logging.directories.ignored")}</WideValueColumn>
                  {EffectiveValue(this, "logging.directories.ignored")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Arquivo copiado"
                    help="Nível de detalhe do registro quando um arquivo, atalho, etc. é copiado"
                  />
                  <WideValueColumn>{LogDetailSelector(this, "policy.logging.entries.snapshotted")}</WideValueColumn>
                  {EffectiveValue(this, "logging.entries.snapshotted")}
                </Row>
                <Row>
                  <LabelColumn name="Arquivo ignorado" help="Nível de detalhe do registro quando um arquivo, atalho, etc. é ignorado" />
                  <WideValueColumn>{LogDetailSelector(this, "policy.logging.entries.ignored")}</WideValueColumn>
                  {EffectiveValue(this, "logging.entries.ignored")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Cache aproveitado"
                    help="Nível de detalhe do registro quando o cache é usado em vez de reenviar o arquivo"
                  />
                  <WideValueColumn>{LogDetailSelector(this, "policy.logging.entries.cacheHit")}</WideValueColumn>
                  {EffectiveValue(this, "logging.entries.cacheHit")}
                </Row>
                <Row>
                  <LabelColumn
                    name="Cache não aproveitado"
                    help="Nível de detalhe do registro quando o cache não pode ser usado e o arquivo precisa ser recalculado"
                  />
                  <WideValueColumn>{LogDetailSelector(this, "policy.logging.entries.cacheMiss")}</WideValueColumn>
                  {EffectiveValue(this, "logging.entries.cacheMiss")}
                </Row>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="other">
              <Accordion.Header>
                <FontAwesomeIcon icon={faMagic} />
                &nbsp;Outros
              </Accordion.Header>
              <Accordion.Body>
                <Row>
                  <LabelColumn
                    name="Desativar avaliação das políticas acima"
                    help="Impede que qualquer política de nível acima afete esta pasta e suas subpastas"
                  />
                  <ValueColumn>{RequiredBoolean(this, "", "policy.noParent")}</ValueColumn>
                </Row>
                <Row>
                  <LabelColumn name="Representação em JSON" help="Esta é a representação interna de uma política" />
                  <WideValueColumn>
                    <pre className="debug-json">{JSON.stringify(this.state.policy, null, 4)}</pre>
                  </WideValueColumn>
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          {!this.props.embedded && (
            <Button
              size="sm"
              variant="success"
              onClick={this.saveChanges}
              data-testid="button-save"
              disabled={this.state.saving}
            >
              Salvar política
            </Button>
          )}
          {!this.state.isNew && !this.props.embedded && (
            <>
              &nbsp;
              <Button
                size="sm"
                variant="danger"
                disabled={this.isGlobal() || this.state.saving}
                onClick={this.deletePolicy}
              >
                Excluir política
              </Button>
            </>
          )}
          {this.state.saving && (
            <>
              &nbsp;
              <Spinner animation="border" variant="primary" size="sm" />
            </>
          )}
        </Form>
      </>
    );
  }
}

PolicyEditor.propTypes = {
  path: PropTypes.string,
  close: PropTypes.func,
  embedded: PropTypes.bool,
  isNew: PropTypes.bool,
  params: PropTypes.object.isRequired,
  navigate: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  userName: PropTypes.string,
  host: PropTypes.string,
};
