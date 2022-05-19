import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./index.css";
import { sampleFormData } from "./utils/example";

const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App sampleFormData={sampleFormData} />
  </React.StrictMode>
);
