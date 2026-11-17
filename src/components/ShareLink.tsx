import { useEffect, useId, useRef, useState } from "react";
import { SocialIcon } from "./SocialIcon";

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 7V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M5 8h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function ShareLink({
  title,
  url,
  onClose,
}: {
  title: string;
  url: string;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const address = useRef<HTMLInputElement>(null);
  const heading = useId();
  const [status, setStatus] = useState("");
  const message = encodeURIComponent(`${title}\n${url}`);
  const destinations = [
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${message}`,
      icon: "x",
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`,
      icon: "whatsapp",
    },
  ] as const;

  useEffect(() => {
    const modal = dialog.current;
    if (modal && !modal.open) modal.showModal();
  }, []);

  function selectAddress() {
    address.current?.focus();
    address.current?.select();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Link copiado.");
    } catch {
      selectAddress();
      setStatus("Link selecionado. Copie o endereço acima.");
    }
  }

  return (
    <dialog
      className="share-dialog"
      ref={dialog}
      aria-labelledby={heading}
      onClose={onClose}
    >
      <header className="share-heading">
        <h2 id={heading}>Compartilhar link</h2>
        <form method="dialog">
          <button
            className="share-close"
            type="submit"
            aria-label="Fechar compartilhamento"
          >
            ×
          </button>
        </form>
      </header>
      <div className="share-summary">
        <strong>{title}</strong>
        <input
          ref={address}
          aria-label="Endereço do link"
          value={url}
          readOnly
        />
      </div>
      <div className="share-options">
        <button type="button" onClick={() => void copyLink()}>
          <span className="share-option-icon">
            <CopyIcon />
          </span>
          Copiar link
        </button>
        {destinations.map(({ label, href, icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="share-option-icon" aria-hidden="true">
              <SocialIcon
                social={{ id: icon, title: label, url: href, icon, active: true }}
              />
            </span>
            {label}
          </a>
        ))}
        <a href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`}>
          <span className="share-option-icon">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 5h18v14H3zM3 6l9 7 9-7" />
            </svg>
          </span>
          E-mail
        </a>
      </div>
      <p className="share-status" role="status">
        {status}
      </p>
    </dialog>
  );
}
