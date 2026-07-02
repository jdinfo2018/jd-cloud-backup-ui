import React from "react";
import Row from "react-bootstrap/Row";
import { OptionalNumberField } from "../../forms/OptionalNumberField";
import { LabelColumn } from "./LabelColumn";
import { WideValueColumn } from "./WideValueColumn";
import { EffectiveValue } from "./EffectiveValue";

export function ActionRowTimeout(component, action) {
  return (
    <Row>
      <LabelColumn name="Tempo limite" help="Tempo limite em segundos antes de o JD Cloud Backup encerrar o processo" />
      <WideValueColumn>{OptionalNumberField(component, "", "policy." + action, {})}</WideValueColumn>
      {EffectiveValue(component, action)}
    </Row>
  );
}
