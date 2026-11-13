import {
  initialDocument,
  safeUrl,
  type LinkItem,
  type PageDocument,
} from "../lib/document";

export function PageContent({
  document = initialDocument,
  preview = false,
}: {
  document?: PageDocument;
  preview?: boolean;
}) {
  const { profile, appearance } = document;
  const links = document.links.filter(
    (link) =>
      link.active &&
      (!link.sectionId ||
        document.sections.some((s) => s.id === link.sectionId && s.active)),
  );
  function card(link: LinkItem) {
    const url = safeUrl(link.url);
    return (
      <a
        key={link.id}
        className={`link-card ${link.featured ? "featured" : ""} ${link.style}`}
        href={url || undefined}
        aria-disabled={!url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {safeUrl(link.image, true) ? (
          <img
            src={safeUrl(link.image, true)}
            alt=""
            loading="lazy"
            width="48"
            height="48"
          />
        ) : (
          <span className="link-icon" aria-hidden="true">
            {link.icon || "↗"}
          </span>
        )}
        <span>
          <strong>{link.title}</strong>
          {link.description && <small>{link.description}</small>}
        </span>
        <span className="arrow" aria-hidden="true">
          ↗
        </span>
      </a>
    );
  }
  return (
    <div
      className={`public-surface palette-${appearance.palette} buttons-${appearance.buttons}`}
      style={
        safeUrl(profile.background, true)
          ? {
              backgroundImage: `linear-gradient(#fcf6f5e8, #fcf6f5f5), url("${safeUrl(profile.background, true)}")`,
            }
          : undefined
      }
    >
      <main className="public-page">
        {preview && (
          <p className="preview-label">PRÉ-VISUALIZAÇÃO · RASCUNHO</p>
        )}
        <header className="profile">
          {safeUrl(profile.avatar || profile.logo, true) && (
            <img
              className="avatar"
              src={safeUrl(profile.avatar || profile.logo, true)}
              alt={`Logo de ${profile.name}`}
              width="104"
              height="104"
            />
          )}
          <p className="eyebrow">LITERATURA & COMUNIDADE</p>
          <h1>{profile.name}</h1>
          <p className="bio">{profile.description}</p>
          <span className="divider" aria-hidden="true" />
        </header>
        {links.filter((l) => !l.sectionId).map(card)}
        {document.sections
          .filter((s) => s.active)
          .map((section) => {
            const children = links.filter((l) => l.sectionId === section.id);
            return children.length ? (
              <section className="link-section" key={section.id}>
                <h2>{section.title}</h2>
                {children.map(card)}
              </section>
            ) : null;
          })}
        {!links.length && (
          <section className="empty-public">
            <span aria-hidden="true">❧</span>
            <h2>Novos encontros em breve</h2>
            <p>
              Nossos links estão sendo preparados com carinho.
              <br />
              Logo, mais histórias para compartilhar.
            </p>
          </section>
        )}
        <nav className="socials" aria-label="Redes sociais">
          {document.socials
            .filter((s) => s.active && safeUrl(s.url))
            .map((s) => (
              <a
                key={s.id}
                href={safeUrl(s.url)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.title}
              >
                <span aria-hidden="true">{s.icon || "↗"}</span>
                <span>{s.title}</span>
              </a>
            ))}
        </nav>
        <footer>
          {profile.logo &&
            profile.logo !== profile.avatar &&
            safeUrl(profile.logo, true) && (
              <img
                src={safeUrl(profile.logo, true)}
                alt=""
                width="40"
                height="40"
              />
            )}
          <p>{profile.footer}</p>
        </footer>
      </main>
    </div>
  );
}
