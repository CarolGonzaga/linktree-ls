import type { PageDocument } from "./document";
import { safeUrl } from "./document";
export function validateDocument(d: PageDocument): string | null {
  if (!d.profile.name.trim()) return "Informe o nome da marca.";
  for (const section of d.sections)
    if (!section.title.trim()) return "Informe um título para cada seção.";
  for (const item of [...d.links, ...d.socials]) {
    if (!item.title.trim())
      return "Informe um título para cada link e rede social.";
    if (!safeUrl(item.url))
      return `Informe uma URL HTTP ou HTTPS válida para “${item.title}”.`;
  }
  for (const item of d.links) {
    if (item.image && !safeUrl(item.image, true))
      return `Revise a imagem de “${item.title}”.`;
    if (item.sectionId && !d.sections.some((s) => s.id === item.sectionId))
      return "Um link está associado a uma seção que não existe.";
  }
  for (const key of ["logo", "avatar", "background"] as const)
    if (d.profile[key] && !safeUrl(d.profile[key], true))
      return "Use uma URL HTTPS válida para as imagens do perfil.";
  return null;
}
