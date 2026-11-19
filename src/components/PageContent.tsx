import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  designColors,
  getButtonStyle,
  useAlternativeTitle,
} from "../lib/appearance";
import { fontStack, googleFontStylesheet } from "../lib/fonts";
import { followerLabel, followerTotal } from "../lib/followers";
import {
  initialDocument,
  safeUrl,
  type LinkItem,
  type PageDocument,
} from "../lib/document";
import { SocialIcon } from "./SocialIcon";
import { ShareLink } from "./ShareLink";
import "./appearance.css";

function FooterText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]\n]+\]\(https?:\/\/[^\s)]+\))/gi);
  return (
    <p>
      {parts.map((part, index) => {
        if (index % 2 === 0) return part;
        const match = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        const url = match && safeUrl(match[2]);
        return url ? (
          <a key={index} href={url} target="_blank" rel="noopener noreferrer">
            {match[1]}
          </a>
        ) : (
          part
        );
      })}
    </p>
  );
}

function WallpaperVideo({ source }: { source: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const element = video.current;
    function syncMotion() {
      if (preference.matches) element?.pause();
      else void element?.play().catch(() => {});
    }
    syncMotion();
    preference.addEventListener("change", syncMotion);
    return () => preference.removeEventListener("change", syncMotion);
  }, []);
  return (
    <>
      <video
        ref={video}
        className="wallpaper-layer"
        src={source}
        loop
        muted
        playsInline
        aria-hidden="true"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        className="wallpaper-video-control"
        type="button"
        onClick={() => {
          if (playing) video.current?.pause();
          else void video.current?.play().catch(() => {});
        }}
      >
        {playing ? "Pausar fundo" : "Reproduzir fundo"}
      </button>
    </>
  );
}

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
  const video =
    wallpaper === "video" ? safeUrl(appearance.wallpaperVideo ?? "", true) : "";
  const titleFont = useAlternativeTitle(appearance)
    ? appearance.titleFont === "body"
      ? "playfair"
      : (appearance.titleFont ?? "playfair")
    : undefined;
  const style = designColors(appearance) as CSSProperties & {
    "--page-font"?: string;
    "--title-font"?: string;
  };
  style["--page-font"] = fontStack(appearance.font);
  style["--title-font"] = titleFont
    ? fontStack(titleFont)
    : 'var(--page-font, "DM Sans", sans-serif)';
  const fontStylesheet = googleFontStylesheet(
    appearance.heading === "logo" && logo
      ? [appearance.font]
      : [appearance.font, titleFont],
  );
  useEffect(() => {
    if (!fontStylesheet) return;
    const stylesheet = window.document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = fontStylesheet;
    window.document.head.append(stylesheet);
    return () => stylesheet.remove();
  }, [fontStylesheet]);
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
      data-gradient-direction={appearance.gradientDirection}
      data-wallpaper-noise={appearance.wallpaperNoise === true || undefined}
      data-button-style={getButtonStyle(appearance)}
      data-legacy-outline={
        (appearance.buttons === "outline" && !appearance.buttonStyle) ||
        undefined
      }
      data-button-radius={appearance.buttonRadius}
      data-button-shadow={appearance.buttonShadow}
      style={style}
    >
      {wallpaper === "blur" && background && (
        <div
          className="wallpaper-layer wallpaper-blurred"
          aria-hidden="true"
          style={{
            backgroundImage: `linear-gradient(#ffffff66, #ffffff66), url(${JSON.stringify(background)})`,
          }}
        />
      )}
      {video.startsWith("https://") && (
        <WallpaperVideo key={video} source={video} />
      )}
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
              alt={`Imagem de perfil de ${profile.name}`}
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
            <p className="follower-total">{followerLabel(followers)}</p>
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
          <FooterText text={profile.footer} />
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
