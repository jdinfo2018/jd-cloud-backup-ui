import React from "react";
import Row from "react-bootstrap/Row";
import { LabelColumn } from "./LabelColumn";
import { ValueColumn } from "./ValueColumn";
import { EffectiveValueColumn } from "./EffectiveValueColumn";

export function SectionHeaderRow() {
  return (
    <Row>
      <LabelColumn />
      <ValueColumn>
        <div className="policyEditorHeader">Definido</div>
      </ValueColumn>
      <EffectiveValueColumn>
        <div className="policyEditorHeader">Em vigor</div>
      </EffectiveValueColumn>
    </Row>
  );
}
