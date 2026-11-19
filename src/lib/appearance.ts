import type { CSSProperties } from "react";
import type { PageDocument } from "./document";

export type Appearance = PageDocument["appearance"];
export type ColorKey = keyof NonNullable<Appearance["colors"]>;

export const themes = {
  rose: {
    name: "Rosa suave",
    page: "#fcf5f6",
    text: "#693149",
    button: "#fffdfb",
    accent: "#8b4160",
  },
  wine: {
    name: "Vinho",
    page: "#f3e8eb",
    text: "#542139",
    button: "#fff9f5",
    accent: "#722341",
  },
  neutral: {
    name: "Neutros",
    page: "#f7f3ec",
    text: "#51433e",
    button: "#fffefa",
    accent: "#786358",
  },
};

export const themePresets = [
  { id: "rose", ...themes.rose },
  { id: "wine", ...themes.wine },
  { id: "neutral", ...themes.neutral },
  {
    id: "lilac",
    name: "Lilás",
    page: "#ede4f6",
    text: "#45295f",
    button: "#faf5ff",
    accent: "#694484",
  },
  {
    id: "terracotta",
    name: "Terracota",
    page: "#f7e3d9",
    text: "#642d26",
    button: "#fff5e8",
    accent: "#944337",
  },
  {
    id: "sage",
    name: "Sálvia",
    page: "#e5ebdf",
    text: "#344635",
    button: "#f6faed",
    accent: "#4d654a",
  },
  {
    id: "dawn",
    name: "Aurora",
    page: "#f8dce4",
    text: "#5a263c",
    button: "#fff3ef",
    accent: "#7d3757",
    gradient: "#f6d5be",
    curated: true,
  },
  {
    id: "velvet",
    name: "Veludo",
    page: "#321320",
    text: "#ffedf4",
    button: "#53253b",
    accent: "#ec9abb",
    gradient: "#6b3050",
    curated: true,
    featuredText: "#321320",
  },
  {
    id: "paper",
    name: "Entre páginas",
    page: "#fff9ec",
    text: "#50382b",
    button: "#f9e9d4",
    accent: "#825541",
    gradient: "#ead5c0",
    curated: true,
  },
  {
    id: "night",
    name: "Noite violeta",
    page: "#241c36",
    text: "#faf0ff",
    button: "#3c3059",
    accent: "#d2b4ed",
    gradient: "#553558",
    curated: true,
    featuredText: "#241c36",
  },
] satisfies Array<
  (typeof themes)[keyof typeof themes] & {
    id: string;
    gradient?: string;
    curated?: boolean;
    featuredText?: string;
  }
>;

export const gradients = {
  rose: ["#fcf5f6", "#e4b9cb"],
  wine: ["#f3e8eb", "#bd7796"],
  warm: ["#fff4e6", "#ecc9bc"],
} as const;

export function getTheme(id: Appearance["themePreset"]) {
  return themePresets.find((preset) => preset.id === id);
}

export function applyTheme(id: string): Partial<Appearance> {
  const preset = getTheme(id);
  if (!preset) return {};
  return {
    themePreset: id,
    themeCustomized: false,
    palette: id === "wine" || id === "neutral" ? id : "rose",
    colors: undefined,
    header: "classic",
    heading: "text",
    wallpaper: preset.gradient ? "gradient" : "solid",
    wallpaperVideo: undefined,
    gradient: "custom",
    gradientColor: undefined,
    gradientDirection: "down",
    wallpaperNoise: false,
    buttons: "rounded",
    buttonStyle: "solid",
    buttonRadius: "rounded",
    buttonShadow: "none",
    font: "dm-sans",
    titleFont: "playfair",
    useTitleFont: true,
    socialPlacement: "top",
  };
}

export function getGradientPreset(gradient: Appearance["gradient"]) {
  return Object.entries(gradients).find(([id]) => id === gradient)?.[1];
}

export function gradientEnd(appearance: Appearance) {
  if (hexColor(appearance.gradientColor)) return appearance.gradientColor;
  const preset = getTheme(appearance.themePreset);
  if (preset?.gradient) return preset.gradient;
  const theme = preset ?? themes[appearance.palette] ?? themes.rose;
  const page = hexColor(appearance.colors?.page)
    ? appearance.colors.page
    : theme.page;
  const mixed = [1, 3, 5].map((index) => {
    const base = parseInt(page.slice(index, index + 2), 16);
    const accent = parseInt(theme.accent.slice(index, index + 2), 16);
    return Math.round(base * 0.75 + accent * 0.25)
      .toString(16)
      .padStart(2, "0");
  });
  return `#${mixed.join("")}`;
}

export function useAlternativeTitle(appearance: Appearance) {
  return appearance.useTitleFont ?? appearance.titleFont !== "body";
}

export function getButtonStyle(appearance: Appearance) {
  return (
    appearance.buttonStyle ??
    (appearance.buttons === "outline" ? "outline" : "solid")
  );
}

const colorVariables = {
  page: "--page",
  text: "--ink",
  title: "--profile-title",
  button: "--button-fill",
  buttonText: "--button-ink",
} satisfies Record<ColorKey, string>;

export function hexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[\da-f]{6}$/i.test(value);
}

export function designColors(appearance: Appearance) {
  const theme = getTheme(appearance.themePreset);
  const properties: Record<string, string> = theme
    ? {
        "--page": theme.page,
        "--surface": theme.button,
        "--ink": theme.text,
        "--accent": theme.accent,
        "--featured-ink": theme.featuredText ?? "white",
        "--line": `color-mix(in srgb, ${theme.text} 20%, ${theme.button})`,
      }
    : {};
  for (const key of Object.keys(colorVariables) as ColorKey[]) {
    const value = appearance.colors?.[key];
    if (hexColor(value)) properties[colorVariables[key]] = value;
  }
  if (appearance.wallpaper === "gradient") {
    const pair = getGradientPreset(appearance.gradient);
    if (pair && !hexColor(appearance.colors?.page))
      properties["--gradient-start"] = pair[0];
    properties["--gradient-end"] = pair?.[1] ?? gradientEnd(appearance);
  }
  return properties as CSSProperties;
}
