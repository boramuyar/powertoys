import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { RelayProvider } from "@powertoys/relay";
import { relay } from "./relay/setup";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RelayProvider relay={relay}>
      <App />
    </RelayProvider>
  </StrictMode>
);
