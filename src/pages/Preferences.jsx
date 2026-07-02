import { useContext, React } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { NotificationEditor } from "../components/notifications/NotificationEditor";
import { UIPreferencesContext } from "../contexts/UIPreferencesContext";

/**
 * Class that exports preferences
 */
export function Preferences() {
  const { theme, bytesStringBase2, fontSize, setByteStringBase, setTheme, setFontSize } =
    useContext(UIPreferencesContext);

  return (
    <Tabs defaultActiveKey="appearance" id="preferences" className="mb-3">
      <Tab eventKey="appearance" title="Aparência" id="tab-appearance">
        <Container fluid>
          <Row>
            <Form.Group as={Col} controlId="theme">
              <Form.Label className="required">Tema</Form.Label>
              <select
                className="form-select form-select-sm"
                title="Selecionar tema"
                id="themeSelector"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="light">claro</option>
                <option value="dark">escuro</option>
                <option value="pastel">pastel</option>
                <option value="ocean">oceano</option>
              </select>
            </Form.Group>
            <Form.Group as={Col} controlId="appearance">
              <Form.Label className="required">Tamanho da fonte</Form.Label>
              <select
                className="form-select form-select-sm"
                title="Selecionar tamanho da fonte"
                id="fontSizeInput"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
              >
                <option value="fs-6">pequeno</option>
                <option value="fs-5">médio</option>
                <option value="fs-4">grande</option>
              </select>
            </Form.Group>
            <Form.Group as={Col} controlId="byteRepresentation">
              <Form.Label className="required">Representação de bytes</Form.Label>
              <select
                className="form-select form-select-sm"
                title="Selecionar representação de bytes"
                id="bytesBaseInput"
                value={bytesStringBase2}
                onChange={(e) => setByteStringBase(e.target.value)}
              >
                <option value="true">Base-2 (KiB, MiB, GiB, TiB)</option>
                <option value="false">Base-10 (KB, MB, GB, TB)</option>
              </select>
            </Form.Group>
          </Row>
        </Container>
      </Tab>
      <Tab eventKey="notifications" title="Notificações" id="tab-notifications">
        <div className="tab-content-fix">
          <Container fluid>
            <NotificationEditor />
          </Container>
        </div>
      </Tab>
    </Tabs>
  );
}
