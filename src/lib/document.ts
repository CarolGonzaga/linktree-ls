export type Section = { id: string; title: string; active: boolean };
export type LinkItem = {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  image: string;
  sectionId: string;
  active: boolean;
  featured: boolean;
  style: "card" | "compact";
};
export type Social = {
  id: string;
  title: string;
  url: string;
  icon: string;
  active: boolean;
};
export type FollowerNetwork =
  "instagram" | "tiktok" | "x" | "youtube" | "facebook";
export type Followers = {
  show: boolean;
  profiles: Partial<Record<FollowerNetwork, { url: string; count?: number }>>;
};
export type PageDocument = {
  profile: {
    name: string;
    description: string;
    footer: string;
    logo: string;
    avatar: string;
    background: string;
  };
  appearance: {
    palette: "rose" | "wine" | "neutral";
    buttons: "rounded" | "soft" | "outline";
    header?: "classic" | "hero" | "banner" | "cutout" | "shape";
    heading?: "text" | "logo";
    wallpaper?: "solid" | "gradient" | "image";
    font?: "dm-sans" | "georgia" | "system";
    titleFont?: "playfair" | "body";
    socialPlacement?: "top" | "bottom";
    colors?: Partial<
      Record<"page" | "text" | "title" | "button" | "buttonText", string>
    >;
    followers?: Followers;
  };
  sections: Section[];
  links: LinkItem[];
  socials: Social[];
};
export const initialDocument: PageDocument = {
  profile: {
    name: "Lendo Sáficos",
    description:
      "Um espaço para descobrir, celebrar e compartilhar histórias sáficas.",
    footer: "Lendo Sáficos · Literatura e comunidade",
    logo: "/logo.png",
    avatar: "/logo.png",
    background: "",
  },
  appearance: { palette: "rose", buttons: "rounded" },
  sections: [],
  links: [],
  socials: [],
};
export function safeUrl(value: string, image = false) {
  if (image && ["/logo.png", "/og.png"].includes(value)) return value;
  try {
    const url = new URL(value);
    return (image
      ? url.protocol === "https:"
      : ["https:", "http:"].includes(url.protocol)) &&
      !url.username &&
      !url.password
      ? url.href
      : "";
  } catch {
    return "";
  }
}
export function moveItem<T>(items: T[], index: number, direction: number): T[] {
  const next = [...items];
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
