import React from "react";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { stateProperty } from "../../forms";
import { LabelColumn } from "./LabelColumn";
import { WideValueColumn } from "./WideValueColumn";
import { EffectiveValue } from "./EffectiveValue";

export function ActionRowMode(component, action) {
  return (
    <Row>
      <LabelColumn
        name="Modo do comando"
        help="Essencial (precisa ter sucesso; padrão), opcional (falhas são toleradas) ou assíncrono (o JD Cloud Backup inicia a ação mas não espera terminar)"
      />
      <WideValueColumn>
        <Form.Control
          as="select"
          size="sm"
          name={"policy." + action}
          onChange={component.handleChange}
          value={stateProperty(component, "policy." + action)}
        >
          <option value="essential">precisa ter sucesso</option>
          <option value="optional">ignorar falhas</option>
          <option value="async">executar em segundo plano, ignorar falhas</option>
        </Form.Control>
      </WideValueColumn>
      {EffectiveValue(component, action)}
    </Row>
  );
}
