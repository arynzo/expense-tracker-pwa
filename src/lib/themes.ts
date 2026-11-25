export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  preview: [string, string, string];
  radius: string;
  fontSans: string;
  light: Record<string, string>;
  dark: Record<string, string>;
}

export const THEME_PRESET_KEY = "expense_tracker_theme_preset";
export const CUSTOM_THEME_CSS_KEY = "expense_tracker_custom_theme_css";
export const HEADING_WEIGHT_KEY = "expense_tracker_heading_weight";
export const BODY_WEIGHT_KEY = "expense_tracker_body_weight";
export const FONT_FAMILY_KEY = "expense_tracker_font_family";

export const FONT_FAMILY_OPTIONS = [
  {
    value: "dm-sans",
    label: "DM Sans",
    css: '"DM Sans Variable", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  {
    value: "serif",
    label: "Serif",
    css: '"Lora Variable", Georgia, serif',
  },
  {
    value: "mono",
    label: "Mono",
    css: '"JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
] as const;

export const HEADING_WEIGHT_OPTIONS = [
  { value: "400", label: "Normal" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra Bold" },
] as const;

export const BODY_WEIGHT_OPTIONS = [
  { value: "300", label: "Light" },
  { value: "400", label: "Normal" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
] as const;

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "default",
    name: "Default Zinc",
    description: "Clean neutral monochrome",
    preview: ["#18181b", "#f4f4f5", "#10b981"],
    radius: "0.625rem",
    fontSans: '"DM Sans Variable", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    light: {},
    dark: {},
  },
  {
    id: "emerald",
    name: "Emerald Finance",
    description: "Soft mint cards & rounded corners",
    preview: ["#059669", "#ecfdf5", "#064e3b"],
    radius: "0.875rem",
    fontSans: '"DM Sans Variable", system-ui, -apple-system, sans-serif',
    light: {
      "--background": "oklch(0.985 0.008 160)",
      "--foreground": "oklch(0.18 0.02 165)",
      "--card": "oklch(1 0.004 160)",
      "--card-foreground": "oklch(0.18 0.02 165)",
      "--popover": "oklch(1 0.004 160)",
      "--popover-foreground": "oklch(0.18 0.02 165)",
      "--primary": "oklch(0.55 0.16 160)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--secondary": "oklch(0.94 0.02 160)",
      "--secondary-foreground": "oklch(0.24 0.04 165)",
      "--muted": "oklch(0.95 0.015 160)",
      "--muted-foreground": "oklch(0.48 0.03 165)",
      "--accent": "oklch(0.93 0.03 160)",
      "--accent-foreground": "oklch(0.22 0.04 165)",
      "--border": "oklch(0.89 0.02 160)",
      "--input": "oklch(0.89 0.02 160)",
      "--ring": "oklch(0.55 0.16 160)",
      "--sidebar": "oklch(0.97 0.012 160)",
    },
    dark: {
      "--background": "oklch(0.14 0.015 165)",
      "--foreground": "oklch(0.97 0.008 160)",
      "--card": "oklch(0.19 0.02 165)",
      "--card-foreground": "oklch(0.97 0.008 160)",
      "--popover": "oklch(0.19 0.02 165)",
      "--popover-foreground": "oklch(0.97 0.008 160)",
      "--primary": "oklch(0.65 0.17 160)",
      "--primary-foreground": "oklch(0.13 0.02 165)",
      "--secondary": "oklch(0.24 0.025 165)",
      "--secondary-foreground": "oklch(0.96 0.01 160)",
      "--muted": "oklch(0.24 0.022 165)",
      "--muted-foreground": "oklch(0.70 0.025 160)",
      "--accent": "oklch(0.26 0.03 165)",
      "--accent-foreground": "oklch(0.97 0.008 160)",
      "--border": "oklch(0.30 0.025 165)",
      "--input": "oklch(0.30 0.025 165)",
      "--ring": "oklch(0.65 0.17 160)",
      "--sidebar": "oklch(0.17 0.018 165)",
    },
  },
  {
    id: "indigo",
    name: "Midnight Indigo",
    description: "Deep slate & indigo accents",
    preview: ["#4f46e5", "#eef2ff", "#1e1b4b"],
    radius: "0.75rem",
    fontSans: '"DM Sans Variable", system-ui, -apple-system, sans-serif',
    light: {
      "--background": "oklch(0.985 0.008 265)",
      "--foreground": "oklch(0.18 0.03 265)",
      "--card": "oklch(1 0.004 265)",
      "--card-foreground": "oklch(0.18 0.03 265)",
      "--popover": "oklch(1 0.004 265)",
      "--popover-foreground": "oklch(0.18 0.03 265)",
      "--primary": "oklch(0.51 0.21 265)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--secondary": "oklch(0.94 0.02 265)",
      "--secondary-foreground": "oklch(0.25 0.05 265)",
      "--muted": "oklch(0.95 0.015 265)",
      "--muted-foreground": "oklch(0.50 0.03 265)",
      "--accent": "oklch(0.93 0.025 265)",
      "--accent-foreground": "oklch(0.24 0.05 265)",
      "--border": "oklch(0.90 0.018 265)",
      "--input": "oklch(0.90 0.018 265)",
      "--ring": "oklch(0.51 0.21 265)",
      "--sidebar": "oklch(0.97 0.012 265)",
    },
    dark: {
      "--background": "oklch(0.14 0.022 265)",
      "--foreground": "oklch(0.97 0.008 265)",
      "--card": "oklch(0.19 0.028 265)",
      "--card-foreground": "oklch(0.97 0.008 265)",
      "--popover": "oklch(0.19 0.028 265)",
      "--popover-foreground": "oklch(0.97 0.008 265)",
      "--primary": "oklch(0.64 0.20 265)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--secondary": "oklch(0.25 0.035 265)",
      "--secondary-foreground": "oklch(0.96 0.01 265)",
      "--muted": "oklch(0.24 0.03 265)",
      "--muted-foreground": "oklch(0.71 0.03 265)",
      "--accent": "oklch(0.27 0.04 265)",
      "--accent-foreground": "oklch(0.97 0.008 265)",
      "--border": "oklch(0.31 0.035 265)",
      "--input": "oklch(0.31 0.035 265)",
      "--ring": "oklch(0.64 0.20 265)",
      "--sidebar": "oklch(0.17 0.025 265)",
    },
  },
  {
    id: "amber",
    name: "Warm Amber",
    description: "Cozy stone surfaces & pill-like radius",
    preview: ["#d97706", "#fffbeb", "#451a03"],
    radius: "1rem",
    fontSans: '"Lora Variable", Georgia, serif',
    light: {
      "--background": "oklch(0.985 0.012 80)",
      "--foreground": "oklch(0.20 0.025 55)",
      "--card": "oklch(0.995 0.008 80)",
      "--card-foreground": "oklch(0.20 0.025 55)",
      "--popover": "oklch(0.995 0.008 80)",
      "--popover-foreground": "oklch(0.20 0.025 55)",
      "--primary": "oklch(0.62 0.17 65)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--secondary": "oklch(0.94 0.025 75)",
      "--secondary-foreground": "oklch(0.26 0.04 55)",
      "--muted": "oklch(0.95 0.018 75)",
      "--muted-foreground": "oklch(0.50 0.03 60)",
      "--accent": "oklch(0.93 0.03 75)",
      "--accent-foreground": "oklch(0.24 0.04 55)",
      "--border": "oklch(0.90 0.02 75)",
      "--input": "oklch(0.90 0.02 75)",
      "--ring": "oklch(0.62 0.17 65)",
      "--sidebar": "oklch(0.97 0.015 80)",
    },
    dark: {
      "--background": "oklch(0.15 0.014 55)",
      "--foreground": "oklch(0.97 0.01 75)",
      "--card": "oklch(0.20 0.018 55)",
      "--card-foreground": "oklch(0.97 0.01 75)",
      "--popover": "oklch(0.20 0.018 55)",
      "--popover-foreground": "oklch(0.97 0.01 75)",
      "--primary": "oklch(0.73 0.16 70)",
      "--primary-foreground": "oklch(0.16 0.02 55)",
      "--secondary": "oklch(0.26 0.022 55)",
      "--secondary-foreground": "oklch(0.96 0.01 75)",
      "--muted": "oklch(0.25 0.02 55)",
      "--muted-foreground": "oklch(0.72 0.025 70)",
      "--accent": "oklch(0.28 0.025 55)",
      "--accent-foreground": "oklch(0.97 0.01 75)",
      "--border": "oklch(0.31 0.02 55)",
      "--input": "oklch(0.31 0.02 55)",
      "--ring": "oklch(0.73 0.16 70)",
      "--sidebar": "oklch(0.18 0.016 55)",
    },
  },
  {
    id: "mono",
    name: "Sharp Black",
    description: "Crisp corners & high-contrast monochrome",
    preview: ["#09090b", "#e4e4e7", "#27272a"],
    radius: "0.25rem",
    fontSans: '"JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    light: {
      "--background": "oklch(0.98 0 0)",
      "--foreground": "oklch(0.12 0 0)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.12 0 0)",
      "--primary": "oklch(0.18 0 0)",
      "--primary-foreground": "oklch(0.98 0 0)",
      "--border": "oklch(0.86 0 0)",
      "--input": "oklch(0.86 0 0)",
      "--sidebar": "oklch(0.96 0 0)",
    },
    dark: {
      "--background": "oklch(0.11 0 0)",
      "--foreground": "oklch(0.96 0 0)",
      "--card": "oklch(0.15 0 0)",
      "--card-foreground": "oklch(0.96 0 0)",
      "--primary": "oklch(0.94 0 0)",
      "--primary-foreground": "oklch(0.12 0 0)",
      "--border": "oklch(0.26 0 0)",
      "--input": "oklch(0.26 0 0)",
      "--sidebar": "oklch(0.13 0 0)",
    },
  },
];

function extractCssVars(block: string): Record<string, string> {
  const vars: Record<string, string> = {};
  const regex = /(--[a-z0-9-]+)\s*:\s*([^;}\n]+);?/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(block)) !== null) {
    const key = match[1].trim();
    let val = match[2].trim();
    // Support Shadcn HSL triplets (e.g. "240 10% 3.9%") by wrapping with hsl(...) if bare numbers
    if (/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%(\s*\/\s*[\d.%]+)?$/.test(val)) {
      val = `hsl(${val})`;
    }
    vars[key] = val;
  }
  return vars;
}

export function buildCustomShadcnStyle(rawCss: string): string | null {
  const rootMatch = rawCss.match(/:root\s*\{([\s\S]*?)\}/i);
  const darkMatch = rawCss.match(/\.dark\s*\{([\s\S]*?)\}/i);

  const rootVars = rootMatch
    ? extractCssVars(rootMatch[1])
    : !darkMatch
    ? extractCssVars(rawCss)
    : {};
  const darkVars = darkMatch ? extractCssVars(darkMatch[1]) : {};

  if (Object.keys(rootVars).length === 0 && Object.keys(darkVars).length === 0) {
    return null;
  }

  const formatVars = (v: Record<string, string>) =>
    Object.entries(v)
      .map(([k, val]) => `  ${k}: ${val};`)
      .join("\n");

  const parts: string[] = [];
  if (Object.keys(rootVars).length > 0) {
    parts.push(`:root {\n${formatVars(rootVars)}\n}`);
  }
  if (Object.keys(darkVars).length > 0) {
    parts.push(`.dark {\n${formatVars(darkVars)}\n}`);
  }
  return parts.join("\n");
}

export function getSavedThemePreset(): string {
  try {
    return localStorage.getItem(THEME_PRESET_KEY) || "default";
  } catch {
    return "default";
  }
}

export function getSavedCustomThemeCss(): string {
  try {
    return localStorage.getItem(CUSTOM_THEME_CSS_KEY) || "";
  } catch {
    return "";
  }
}

export function applyThemePreset(presetId: string, customCss?: string): boolean {
  const styleId = "app-theme-preset-style";
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;

  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  if (presetId === "custom") {
    const cssToApply = customCss ?? getSavedCustomThemeCss();
    const compiled = buildCustomShadcnStyle(cssToApply);
    if (!compiled) {
      return false;
    }
    styleEl.textContent = compiled;
    try {
      localStorage.setItem(THEME_PRESET_KEY, "custom");
      if (customCss !== undefined) {
        localStorage.setItem(CUSTOM_THEME_CSS_KEY, customCss);
      }
    } catch {
      // ignore
    }
    return true;
  }

  const preset = THEME_PRESETS.find((p) => p.id === presetId) ?? THEME_PRESETS[0];
  try {
    localStorage.setItem(THEME_PRESET_KEY, preset.id);
  } catch {
    // ignore
  }

  if (preset.id === "default") {
    styleEl.textContent = "";
    return true;
  }

  const lightRules = Object.entries({
    "--radius": preset.radius,
    ...preset.light,
  })
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");

  const darkRules = Object.entries(preset.dark)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");

  styleEl.textContent = `:root {\n${lightRules}\n}\n.dark {\n${darkRules}\n}`;
  return true;
}

export function getSavedHeadingWeight(): string {
  try {
    return localStorage.getItem(HEADING_WEIGHT_KEY) || "600";
  } catch {
    return "600";
  }
}

export function getSavedBodyWeight(): string {
  try {
    return localStorage.getItem(BODY_WEIGHT_KEY) || "400";
  } catch {
    return "400";
  }
}

export function applyTypographyWeights(headingWeight?: string, bodyWeight?: string): void {
  const hWeight = headingWeight ?? getSavedHeadingWeight();
  const bWeight = bodyWeight ?? getSavedBodyWeight();

  try {
    localStorage.setItem(HEADING_WEIGHT_KEY, hWeight);
    localStorage.setItem(BODY_WEIGHT_KEY, bWeight);
  } catch {
    // ignore
  }

  const styleId = "app-typography-weight-style";
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    body {
      font-weight: ${bWeight};
    }
    h1, h2, h3, h4 {
      font-weight: ${hWeight} !important;
    }
  `;
}

export function getSavedFontFamily(): string {
  try {
    return localStorage.getItem(FONT_FAMILY_KEY) || "dm-sans";
  } catch {
    return "dm-sans";
  }
}

export function applyFontFamily(fontId?: string): void {
  const id = fontId ?? getSavedFontFamily();
  const opt = FONT_FAMILY_OPTIONS.find((f) => f.value === id) ?? FONT_FAMILY_OPTIONS[0];

  try {
    localStorage.setItem(FONT_FAMILY_KEY, opt.value);
  } catch {
    // ignore
  }

  const styleId = "app-font-family-style";
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    :root {
      --font-sans: ${opt.css};
      --font-heading: ${opt.css};
    }
    html, body, h1, h2, h3, h4, h5, h6 {
      font-family: ${opt.css} !important;
    }
  `;
}
