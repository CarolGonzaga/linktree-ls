import { safeUrl, type Social } from "../lib/document";

export const socialIconOptions = [
  ["instagram", "Instagram"],
  ["tiktok", "TikTok"],
  ["x", "X (Twitter)"],
  ["whatsapp", "WhatsApp"],
  ["link", "Link genérico"],
] as const;

type SocialIconName = (typeof socialIconOptions)[number][0];

function matchesHost(hostname: string, domain: string) {
  return hostname === domain || hostname.endsWith("." + domain);
}

function iconFor(social: Social): SocialIconName {
  const selected = socialIconOptions.find(([name]) => name === social.icon);
  if (selected) return selected[0];

  // Os registros antigos guardam símbolos. Detecte a rede sem regravar o documento.
  const url = safeUrl(social.url);
  const hostname = url ? new URL(url).hostname : "";
  if (matchesHost(hostname, "instagram.com")) return "instagram";
  if (matchesHost(hostname, "tiktok.com")) return "tiktok";
  if (matchesHost(hostname, "x.com") || matchesHost(hostname, "twitter.com"))
    return "x";
  if (matchesHost(hostname, "whatsapp.com") || hostname === "wa.me")
    return "whatsapp";
  const title = social.title.trim().toLowerCase();
  if (title === "twitter") return "x";
  return (
    socialIconOptions.find(
      ([name, label]) => title === name || title === label.toLowerCase(),
    )?.[0] ?? "link"
  );
}

// Mesmos desenhos do rodapé da home do Lendo Sáficos.
const shapes = {
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </>
  ),
  tiktok: (
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.41a8.16 8.16 0 0 0 4.77 1.52V7.48a4.85 4.85 0 0 1-1-.79z" />
  ),
  x: (
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.735-8.85L1.254 2.25H8.08l4.257 5.626L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  ),
  whatsapp: (
    <>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.012 22l4.946-1.412A9.934 9.934 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.952 7.952 0 0 1-4.054-1.108l-.291-.173-3.01.86.876-2.944-.19-.301A7.949 7.949 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
    </>
  ),
  link: <path d="M7 17 17 7M7 7h10v10" />,
};

export function SocialIcon({ social }: { social: Social }) {
  const name = iconFor(social);
  const outline = name === "instagram" || name === "link";
  return (
    <svg
      className="social-icon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill={outline ? "none" : "currentColor"}
      stroke={outline ? "currentColor" : undefined}
      strokeWidth={outline ? 2 : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {shapes[name]}
    </svg>
  );
}
