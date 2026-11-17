import { useState } from "react";
import { designColors } from "../lib/appearance";
import { followerTotal } from "../lib/followers";
import {
  initialDocument,
  safeUrl,
  type LinkItem,
  type PageDocument,
} from "../lib/document";
import { SocialIcon } from "./SocialIcon";
import { ShareLink } from "./ShareLink";
import "./appearance.css";

export function PageContent({
  document = initialDocument,
  preview = false,
}: {
  document?: PageDocument;
  preview?: boolean;
}) {
  const { profile, appearance } = document;
  const followers =
    appearance.followers?.show === true
      ? followerTotal(appearance.followers)
      : null;
  const logo = safeUrl(profile.logo, true);
  const avatar = safeUrl(profile.avatar, true) || logo;
  const background = safeUrl(profile.background, true);
  const wallpaper = appearance.wallpaper ?? "image";
  const style = designColors(appearance);
  if (wallpaper === "image" && background) {
    style.backgroundImage = `linear-gradient(#ffffff47, #ffffff47), url(${JSON.stringify(background)})`;
  }
  const [share, setShare] = useState<{
    title: string;
    url: string;
    trigger: HTMLButtonElement;
  } | null>(null);
  const links = document.links.filter(
    (link) =>
      link.active &&
      (!link.sectionId ||
        document.sections.some((s) => s.id === link.sectionId && s.active)),
  );
  function card(link: LinkItem) {
    const url = safeUrl(link.url);
    return (
      <div className="link-row" key={link.id}>
        <a
          className={`link-card ${link.featured ? "featured" : ""} ${link.style}`}
          href={url || undefined}
          aria-disabled={!url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="link-media" aria-hidden="true">
            {safeUrl(link.image, true) ? (
              <img
                src={safeUrl(link.image, true)}
                alt=""
                loading="lazy"
                width="40"
                height="40"
              />
            ) : link.icon ? (
              <span className="link-icon">{link.icon}</span>
            ) : null}
          </span>
          <span className="link-copy">
            <strong>{link.title}</strong>
            {link.description && <small>{link.description}</small>}
          </span>
        </a>
        {url && (
          <button
            className="card-share-button"
            type="button"
            aria-haspopup="dialog"
            aria-label={`Compartilhar ${link.title}`}
            onClick={(event) =>
              setShare({ title: link.title, url, trigger: event.currentTarget })
            }
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="12" cy="5" r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="12" cy="19" r="1.6" />
            </svg>
          </button>
        )}
      </div>
    );
  }
  const socials = (
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
            title={s.title}
          >
            <SocialIcon social={s} />
          </a>
        ))}
    </nav>
  );
  return (
    <div
      className={`public-surface palette-${appearance.palette} buttons-${appearance.buttons}`}
      data-wallpaper={wallpaper}
      data-page-font={appearance.font}
      data-title-font={appearance.titleFont}
      style={style}
    >
      <main className="public-page">
        {preview && (
          <p className="preview-label">PRÉ-VISUALIZAÇÃO · RASCUNHO</p>
        )}
        <header className="profile" data-layout={appearance.header}>
          {appearance.header === "banner" && (background || avatar) && (
            <img className="profile-banner" src={background || avatar} alt="" />
          )}
          {avatar && (
            <img
              className="avatar"
              src={avatar}
              alt={`Logo de ${profile.name}`}
              width="104"
              height="104"
            />
          )}
          <h1>
            {appearance.heading === "logo" && logo ? (
              <img
                className="profile-title-logo"
                src={logo}
                alt={profile.name}
              />
            ) : (
              profile.name
            )}
          </h1>
          <p className="bio">{profile.description}</p>
          {followers !== null && (
            <p className="follower-total">
              {followers.toLocaleString("pt-BR")}{" "}
              {followers === 1 ? "seguidor" : "seguidores"}
            </p>
          )}
        </header>
        {appearance.socialPlacement !== "bottom" && socials}
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
        {appearance.socialPlacement === "bottom" && (
          <div className="socials-bottom">{socials}</div>
        )}
        <footer className="public-footer">
          {logo && logo !== avatar && appearance.heading !== "logo" && (
            <img src={logo} alt="" width="40" height="40" />
          )}
          <p>{profile.footer}</p>
        </footer>
      </main>
      {share && (
        <ShareLink
          title={share.title}
          url={share.url}
          onClose={() => {
            setShare(null);
            share.trigger.focus();
          }}
        />
      )}
    </div>
  );
}
