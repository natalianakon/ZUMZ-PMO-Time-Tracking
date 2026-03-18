import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./pmo-time-tracker";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
