import React from "react";
import { createRoot } from "react-dom/client";
import moment from "moment";
import "moment/dist/locale/pt-br";
import App from "./App";
import "./css/index.css";

// datas/horas relativas em português (ex.: "há 12 minutos", "em 2 horas")
moment.locale("pt-br");

const root = createRoot(document.getElementById("root"));
root.render(<App />);
