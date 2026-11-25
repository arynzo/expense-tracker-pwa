import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "@fontsource-variable/dm-sans";
import {
  applyThemePreset,
  getSavedThemePreset,
  applyTypographyWeights,
} from "@/lib/themes";
import "./index.css";
import App from "./App";

applyThemePreset(getSavedThemePreset());
applyTypographyWeights();
registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
