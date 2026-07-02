import React from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import { stateProperty } from "../../forms";

export function NotificationFormatSelector(component, name) {
  return (
    <Form.Group as={Col}>
      <Form.Label className="required">Formato da notificação</Form.Label>
      <Form.Control
        as="select"
        size="sm"
        name={name}
        onChange={(e) => component.handleChange(e)}
        value={stateProperty(component, name)}
      >
        <option value="txt">Texto simples</option>
        <option value="html">Formato HTML</option>
      </Form.Control>
    </Form.Group>
  );
}
