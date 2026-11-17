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
} as const;

const colorVariables = {
  page: "--page",
  text: "--ink",
  title: "--profile-title",
  button: "--button-fill",
  buttonText: "--button-ink",
} as const satisfies Record<ColorKey, string>;

export function designColors(appearance: Appearance) {
  const properties: Record<string, string> = {};
  for (const key of Object.keys(colorVariables) as ColorKey[]) {
    const value = appearance.colors?.[key];
    if (typeof value === "string" && /^#[\da-f]{6}$/i.test(value)) {
      properties[colorVariables[key]] = value;
    }
  }
  return properties as CSSProperties;
}
