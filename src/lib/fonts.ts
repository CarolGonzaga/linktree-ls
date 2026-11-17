export const googleFonts = [
  ["dm-sans", "DM Sans", "sans-serif"],
  ["inter", "Inter", "sans-serif"],
  ["roboto", "Roboto", "sans-serif"],
  ["open-sans", "Open Sans", "sans-serif"],
  ["lato", "Lato", "sans-serif"],
  ["montserrat", "Montserrat", "sans-serif"],
  ["poppins", "Poppins", "sans-serif"],
  ["nunito", "Nunito", "sans-serif"],
  ["raleway", "Raleway", "sans-serif"],
  ["work-sans", "Work Sans", "sans-serif"],
  ["source-sans", "Source Sans 3", "sans-serif"],
  ["noto-sans", "Noto Sans", "sans-serif"],
  ["oswald", "Oswald", "sans-serif"],
  ["quicksand", "Quicksand", "sans-serif"],
  ["geist", "Geist", "sans-serif"],
  ["playfair", "Playfair Display", "serif"],
  ["merriweather", "Merriweather", "serif"],
  ["lora", "Lora", "serif"],
  ["libre-baskerville", "Libre Baskerville", "serif"],
  ["cormorant-garamond", "Cormorant Garamond", "serif"],
  ["dm-serif-display", "DM Serif Display", "serif"],
  ["fraunces", "Fraunces", "serif"],
  ["bitter", "Bitter", "serif"],
  ["ibm-plex-mono", "IBM Plex Mono", "monospace"],
] as const;

export type GoogleFont = (typeof googleFonts)[number][0];
export type PageFont = GoogleFont | "georgia" | "system";
export type TitleFont = GoogleFont | "body";

export function fontStack(id: PageFont | undefined) {
  if (id === "georgia") return "Georgia, serif";
  if (id === "system") return "system-ui, sans-serif";
  const font = googleFonts.find(([key]) => key === id);
  return font ? `"${font[1]}", ${font[2]}` : undefined;
}

export function googleFontStylesheet(
  ids: readonly (PageFont | TitleFont | undefined)[],
) {
  const families = googleFonts
    .filter(([id]) => ids.includes(id) && id !== "dm-sans" && id !== "playfair")
    .map(([id, name]) => {
      const family = encodeURIComponent(name).replaceAll("%20", "+");
      return `family=${family}${id === "dm-serif-display" ? "" : ":wght@400;700"}`;
    });
  return families.length
    ? `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`
    : "";
}
