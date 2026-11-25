import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/lora";
import "@fontsource-variable/jetbrains-mono";
import {
  applyThemePreset,
  getSavedThemePreset,
  applyTypographyWeights,
  applyFontFamily,
} from "@/lib/themes";
import "./index.css";
import App from "./App";

applyThemePreset(getSavedThemePreset());
applyTypographyWeights();
applyFontFamily();
registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
