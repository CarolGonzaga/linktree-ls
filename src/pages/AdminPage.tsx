import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { client, errorMessage } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { uploadImage } from "../lib/media";
import { validateDocument } from "../lib/validation";
import { PageContent } from "../components/PageContent";
import { socialIconOptions } from "../components/SocialIcon";
import {
  moveItem,
  type LinkItem,
  type PageDocument,
  type Social,
} from "../lib/document";
const tabs = [
  "Visão geral",
  "Links",
  "Seções",
  "Redes sociais",
  "Perfil",
  "Aparência",
  "Publicação",
] as const;
type Tab = (typeof tabs)[number];
function Field({
  title,
  value,
  onChange,
  multiline = false,
  maxLength = 2000,
  type = "text",
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  maxLength?: number;
  type?: string;
}) {
  return (
    <label>
      {title}
      {multiline ? (
        <textarea
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      ) : (
        <input
          value={value}
          type={type}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
function Check({
  children,
  checked,
  onChange,
}: {
  children: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="check">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {children}
    </label>
  );
}
function ItemActions({
  index,
  count,
  name,
  move,
  remove,
}: {
  index: number;
  count: number;
  name: string;
  move: (direction: number) => void;
  remove: () => void;
}) {
  return (
    <div className="item-actions">
      <button
        disabled={index === 0}
        onClick={() => move(-1)}
        aria-label={`Mover ${name} para cima`}
      >
        ↑
      </button>
      <button
        disabled={index === count - 1}
        onClick={() => move(1)}
        aria-label={`Mover ${name} para baixo`}
      >
        ↓
      </button>
      <button
        className="danger"
        onClick={() => {
          if (window.confirm(`Excluir “${name}” do rascunho?`)) remove();
        }}
      >
        Excluir
      </button>
    </div>
  );
}
type Draft = { document: PageDocument; revision: number; updated_at: string };
export default function AdminPage() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data, error } = await client()
          .from("ls_draft")
          .select("document,revision,updated_at")
          .eq("id", true)
          .single();
        if (error) throw error;
        if (!cancelled) setDraft(data as Draft);
      } catch (error) {
        if (!cancelled) setError(errorMessage(error));
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [attempt]);
  if (error)
    return (
      <main className="login-page">
        <h1>Rascunho indisponível</h1>
        <p role="alert">{error}</p>
        <button
          onClick={() => {
            setError("");
            setAttempt((n) => n + 1);
          }}
        >
          Tentar novamente
        </button>
        <Link to="/admin/login">Voltar</Link>
      </main>
    );
  if (!draft)
    return (
      <main className="loading" role="status">
        Carregando rascunho…
      </main>
    );
  return (
    <DraftEditor
      key={attempt}
      initial={draft}
      reload={() => {
        setDraft(null);
        setAttempt((n) => n + 1);
      }}
    />
  );
}
function DraftEditor({
  initial,
  reload,
}: {
  initial: Draft;
  reload: () => void;
}) {
  const auth = useAuth();
  const [revision, setRevision] = useState(initial.revision);
  const [updatedAt, setUpdatedAt] = useState(initial.updated_at);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  async function save() {
    const invalid = validateDocument(document);
    if (invalid) {
      setFailed(true);
      setMessage(invalid);
      return;
    }
    setBusy(true);
    setMessage("");
    setFailed(false);
    try {
      const { data, error } = await client().rpc("ls_save_draft", {
        p_document: document,
        p_revision: revision,
      });
      if (error) throw error;
      setRevision(Number(data));
      setChanged(false);
      setUpdatedAt(new Date().toISOString());
      setMessage(
        "Rascunho salvo. A página pública continua com a última publicação.",
      );
    } catch (error) {
      setFailed(true);
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  async function publish() {
    if (
      changed ||
      !reviewed ||
      !window.confirm(
        "Publicar este rascunho? A página dos visitantes será atualizada.",
      )
    )
      return;
    setBusy(true);
    setMessage("");
    setFailed(false);
    try {
      const { error } = await client().rpc("ls_publish", {
        p_revision: revision,
      });
      if (error) throw error;
      setMessage("Página publicada. Abra a página pública para conferir.");
    } catch (error) {
      setFailed(true);
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  async function upload(file: File, apply: (url: string) => void) {
    setBusy(true);
    setFailed(false);
    setMessage("Enviando imagem…");
    try {
      apply(await uploadImage(file));
      setMessage(
        "Imagem enviada. Salve o rascunho para conservar a alteração.",
      );
    } catch (error) {
      setFailed(true);
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  function uploadControl(apply: (url: string) => void) {
    return (
      <label>
        Enviar imagem
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={busy}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            if (file) void upload(file, apply);
          }}
        />
        <small>
          JPEG, PNG ou WebP até 5 MB. A URL da imagem é pública desde o upload.
        </small>
      </label>
    );
  }
  function openPreview() {
    setPreview(true);
    setReviewed(true);
  }
  async function logout() {
    if (
      changed &&
      !window.confirm("Sair sem salvar as alterações do rascunho?")
    )
      return;
    setBusy(true);
    try {
      const { error } = await client().auth.signOut();
      if (error) throw error;
    } catch (error) {
      setFailed(true);
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  const [tab, setTab] = useState<Tab>("Visão geral");
  const [document, setDocument] = useState<PageDocument>(() =>
    structuredClone(initial.document),
  );
  const [preview, setPreview] = useState(false);
  const [changed, setChanged] = useState(false);
  useEffect(() => {
    if (!changed) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changed]);
  function update(patch: Partial<PageDocument>) {
    setDocument((d) => ({ ...d, ...patch }));
    setChanged(true);
    setReviewed(false);
  }
  function linkUpdate(id: string, patch: Partial<LinkItem>) {
    update({
      links: document.links.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    });
  }
  function socialUpdate(id: string, patch: Partial<Social>) {
    update({
      socials: document.socials.map((l) =>
        l.id === id ? { ...l, ...patch } : l,
      ),
    });
  }
  function mediaField(key: "logo" | "avatar" | "background") {
    const title = {
      logo: "Logo",
      avatar: "Avatar",
      background: "Imagem de fundo",
    }[key];
    return (
      <div className="media-field" key={key}>
        <Field
          title={`${title} · URL HTTPS ou asset da marca`}
          value={document.profile[key]}
          onChange={(value) =>
            update({ profile: { ...document.profile, [key]: value } })
          }
        />
        {uploadControl((url) =>
          update({ profile: { ...document.profile, [key]: url } }),
        )}
      </div>
    );
  }
  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <img src="/logo.png" alt="" width="42" height="42" />
          <span>
            Lendo Sáficos<small>ESPAÇO DE CUIDADO</small>
          </span>
        </Link>
        <p className="nav-label">SEU LINKTREE</p>
        <nav aria-label="Painel administrativo">
          {tabs.map((item, i) => (
            <button
              key={item}
              className={tab === item ? "selected" : ""}
              aria-current={tab === item ? "page" : undefined}
              disabled={busy}
              onClick={() => setTab(item)}
            >
              <span aria-hidden="true">
                {["◫", "↗", "☰", "◎", "♙", "◐", "↑"][i]}
              </span>
              {item}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <p>
            {auth.session?.user.email}
            <br />
            <small>Administradora</small>
          </p>
          <button disabled={busy} onClick={() => void logout()}>
            Sair da conta →
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <span>Seu espaço, suas histórias.</span>
          <div className="toolbar-actions">
            <button disabled={busy || !changed} onClick={() => void save()}>
              Salvar rascunho
            </button>
            <button
              onClick={() => {
                if (preview) setPreview(false);
                else openPreview();
              }}
            >
              {preview ? "Fechar prévia" : "Pré-visualizar"}{" "}
              <span aria-hidden="true">↗</span>
            </button>
            <button disabled={busy} onClick={() => void logout()}>
              Sair
            </button>
          </div>
        </header>
        <div className="local-banner" role="status">
          {changed ? "Alterações não salvas" : "Rascunho salvo"} · Revisão{" "}
          {revision} · {new Date(updatedAt).toLocaleString("pt-BR")}
          <button
            disabled={busy}
            onClick={() => {
              if (
                !changed ||
                window.confirm(
                  "Descartar alterações locais e recarregar o rascunho salvo?",
                )
              )
                reload();
            }}
          >
            Recarregar rascunho salvo
          </button>
        </div>
        {message && (
          <div className="operation-message" role={failed ? "alert" : "status"}>
            {message}
          </div>
        )}
        <div className="workspace">
          <section className="editor">
            <fieldset className="editor-fields" disabled={busy}>
              <div className="page-heading">
                <p className="eyebrow">PAINEL LENDO SÁFICOS</p>
                <h1>{tab}</h1>
                <p>
                  {tab === "Visão geral"
                    ? "Um cantinho para conectar nossas histórias ao mundo."
                    : "Prepare cada detalhe no seu ritmo."}
                </p>
              </div>
              {tab === "Visão geral" && (
                <>
                  <div className="welcome-card">
                    <p className="eyebrow">BEM-VINDA AO SEU ESPAÇO</p>
                    <h2>
                      Histórias merecem
                      <br />
                      bons encontros.
                    </h2>
                    <p>
                      Organize os links, dê o seu toque e veja como tudo fica
                      antes de publicar.
                    </p>
                    <button className="primary" onClick={() => setTab("Links")}>
                      Cuidar dos links ↗
                    </button>
                  </div>
                  <div className="stats">
                    <div>
                      <strong>{document.links.length}</strong>
                      <span>Links no rascunho</span>
                    </div>
                    <div>
                      <strong>{document.sections.length}</strong>
                      <span>Seções</span>
                    </div>
                    <div>
                      <strong>{changed ? "Pendente" : "Salvo"}</strong>
                      <span>Status do rascunho</span>
                    </div>
                  </div>
                  <div className="panel">
                    <h2>Do rascunho ao próximo encontro</h2>
                    <ol className="steps">
                      <li>Edite seus links, perfil e aparência.</li>
                      <li>Confira tudo na pré-visualização.</li>
                      <li>Publique quando estiver pronto.</li>
                    </ol>
                    <p className="muted">
                      Salve o rascunho e confira a prévia antes de publicar.
                    </p>
                  </div>
                </>
              )}
              {tab === "Links" && (
                <>
                  <div className="section-toolbar">
                    <p>
                      {document.links.length}/100 links · use as setas para
                      ordenar
                    </p>
                    <button
                      className="primary"
                      disabled={document.links.length >= 100}
                      onClick={() =>
                        update({
                          links: [
                            ...document.links,
                            {
                              id: crypto.randomUUID(),
                              title: "Novo link",
                              url: "",
                              description: "",
                              image: "",
                              icon: "↗",
                              active: true,
                              featured: false,
                              sectionId: "",
                              style: "card",
                            },
                          ],
                        })
                      }
                    >
                      + Novo link
                    </button>
                  </div>
                  {!document.links.length && (
                    <div className="panel empty-editor">
                      <h2>O próximo encontro começa aqui</h2>
                      <p>Adicione seu primeiro link para começar.</p>
                    </div>
                  )}
                  {document.links.map((item, index) => (
                    <article className="panel" key={item.id}>
                      <div className="item-header">
                        <h2>{item.title || "Novo link"}</h2>
                        <ItemActions
                          index={index}
                          count={document.links.length}
                          name={item.title}
                          move={(direction) =>
                            update({
                              links: moveItem(document.links, index, direction),
                            })
                          }
                          remove={() =>
                            update({
                              links: document.links.filter(
                                (l) => l.id !== item.id,
                              ),
                            })
                          }
                        />
                      </div>
                      <Field
                        title="Título"
                        value={item.title}
                        maxLength={160}
                        onChange={(title) => linkUpdate(item.id, { title })}
                      />
                      <Field
                        title="URL (http ou https)"
                        type="url"
                        value={item.url}
                        maxLength={2048}
                        onChange={(url) => linkUpdate(item.id, { url })}
                      />
                      <Field
                        title="Descrição opcional"
                        value={item.description}
                        maxLength={500}
                        multiline
                        onChange={(description) =>
                          linkUpdate(item.id, { description })
                        }
                      />
                      <div className="field-grid">
                        <label>
                          Seção
                          <select
                            value={item.sectionId}
                            onChange={(e) =>
                              linkUpdate(item.id, { sectionId: e.target.value })
                            }
                          >
                            <option value="">Sem seção</option>
                            {document.sections.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.title}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Formato
                          <select
                            value={item.style}
                            onChange={(e) =>
                              linkUpdate(item.id, {
                                style: e.target.value as LinkItem["style"],
                              })
                            }
                          >
                            <option value="card">Cartão</option>
                            <option value="compact">Compacto</option>
                          </select>
                        </label>
                      </div>
                      <Field
                        title="Ícone (símbolo ou emoji)"
                        value={item.icon}
                        maxLength={40}
                        onChange={(icon) => linkUpdate(item.id, { icon })}
                      />
                      <Field
                        title="Imagem opcional · URL HTTPS"
                        type="url"
                        value={item.image}
                        maxLength={2048}
                        onChange={(image) => linkUpdate(item.id, { image })}
                      />
                      {uploadControl((url) =>
                        linkUpdate(item.id, { image: url }),
                      )}
                      <div className="checks">
                        <Check
                          checked={item.active}
                          onChange={(active) => linkUpdate(item.id, { active })}
                        >
                          Ativo
                        </Check>
                        <Check
                          checked={item.featured}
                          onChange={(featured) =>
                            linkUpdate(item.id, { featured })
                          }
                        >
                          Em destaque
                        </Check>
                      </div>
                    </article>
                  ))}
                </>
              )}
              {tab === "Seções" && (
                <>
                  <div className="section-toolbar">
                    <p>{document.sections.length}/30 seções</p>
                    <button
                      className="primary"
                      disabled={document.sections.length >= 30}
                      onClick={() =>
                        update({
                          sections: [
                            ...document.sections,
                            {
                              id: crypto.randomUUID(),
                              title: "Nova seção",
                              active: true,
                            },
                          ],
                        })
                      }
                    >
                      + Nova seção
                    </button>
                  </div>
                  {!document.sections.length && (
                    <div className="panel">
                      <p>Crie seções para agrupar seus links.</p>
                    </div>
                  )}
                  {document.sections.map((item, index) => (
                    <article className="panel" key={item.id}>
                      <ItemActions
                        index={index}
                        count={document.sections.length}
                        name={item.title}
                        move={(direction) =>
                          update({
                            sections: moveItem(
                              document.sections,
                              index,
                              direction,
                            ),
                          })
                        }
                        remove={() =>
                          update({
                            sections: document.sections.filter(
                              (s) => s.id !== item.id,
                            ),
                            links: document.links.map((l) =>
                              l.sectionId === item.id
                                ? { ...l, sectionId: "" }
                                : l,
                            ),
                          })
                        }
                      />
                      <Field
                        title="Título da seção"
                        maxLength={100}
                        value={item.title}
                        onChange={(title) =>
                          update({
                            sections: document.sections.map((s) =>
                              s.id === item.id ? { ...s, title } : s,
                            ),
                          })
                        }
                      />
                      <Check
                        checked={item.active}
                        onChange={(active) =>
                          update({
                            sections: document.sections.map((s) =>
                              s.id === item.id ? { ...s, active } : s,
                            ),
                          })
                        }
                      >
                        Seção ativa (inclui os links)
                      </Check>
                    </article>
                  ))}
                </>
              )}
              {tab === "Redes sociais" && (
                <>
                  <div className="section-toolbar">
                    <p>{document.socials.length}/20 redes</p>
                    <button
                      className="primary"
                      disabled={document.socials.length >= 20}
                      onClick={() =>
                        update({
                          socials: [
                            ...document.socials,
                            {
                              id: crypto.randomUUID(),
                              title: "Instagram",
                              url: "",
                              icon: "",
                              active: true,
                            },
                          ],
                        })
                      }
                    >
                      + Nova rede
                    </button>
                  </div>
                  {document.socials.map((item, index) => (
                    <article className="panel" key={item.id}>
                      <ItemActions
                        index={index}
                        count={document.socials.length}
                        name={item.title}
                        move={(direction) =>
                          update({
                            socials: moveItem(
                              document.socials,
                              index,
                              direction,
                            ),
                          })
                        }
                        remove={() =>
                          update({
                            socials: document.socials.filter(
                              (s) => s.id !== item.id,
                            ),
                          })
                        }
                      />
                      <Field
                        title="Plataforma / nome acessível"
                        value={item.title}
                        maxLength={160}
                        onChange={(title) => socialUpdate(item.id, { title })}
                      />
                      <Field
                        title="URL"
                        type="url"
                        value={item.url}
                        maxLength={2048}
                        onChange={(url) => socialUpdate(item.id, { url })}
                      />
                      <label>
                        Ícone da rede
                        <select
                          value={
                            socialIconOptions.some(([name]) => name === item.icon)
                              ? item.icon
                              : ""
                          }
                          onChange={(event) =>
                            socialUpdate(item.id, { icon: event.target.value })
                          }
                        >
                          <option value="">Automático pela plataforma</option>
                          {socialIconOptions.map(([name, label]) => (
                            <option key={name} value={name}>{label}</option>
                          ))}
                        </select>
                      </label>
                      <Check
                        checked={item.active}
                        onChange={(active) => socialUpdate(item.id, { active })}
                      >
                        Ativa
                      </Check>
                    </article>
                  ))}
                </>
              )}
              {tab === "Perfil" && (
                <div className="panel">
                  <h2>A essência da sua página</h2>
                  <Field
                    title="Nome da marca"
                    value={document.profile.name}
                    maxLength={100}
                    onChange={(name) =>
                      update({ profile: { ...document.profile, name } })
                    }
                  />
                  <Field
                    title="Descrição"
                    value={document.profile.description}
                    multiline
                    onChange={(description) =>
                      update({ profile: { ...document.profile, description } })
                    }
                  />
                  <Field
                    title="Rodapé"
                    value={document.profile.footer}
                    onChange={(footer) =>
                      update({ profile: { ...document.profile, footer } })
                    }
                  />
                  {mediaField("avatar")}
                </div>
              )}
              {tab === "Aparência" && (
                <div className="panel">
                  <h2>Um toque de Lendo Sáficos</h2>
                  <fieldset>
                    <legend>Paleta</legend>
                    <div className="palette-options">
                      {(["rose", "wine", "neutral"] as const).map(
                        (palette, index) => (
                          <label key={palette}>
                            <input
                              type="radio"
                              name="palette"
                              checked={document.appearance.palette === palette}
                              onChange={() =>
                                update({
                                  appearance: {
                                    ...document.appearance,
                                    palette,
                                  },
                                })
                              }
                            />
                            <span className={`swatch ${palette}`} />
                            {["Rosa suave", "Vinho", "Neutros"][index]}
                          </label>
                        ),
                      )}
                    </div>
                  </fieldset>
                  <label>
                    Estilo dos botões
                    <select
                      value={document.appearance.buttons}
                      onChange={(e) =>
                        update({
                          appearance: {
                            ...document.appearance,
                            buttons: e.target
                              .value as PageDocument["appearance"]["buttons"],
                          },
                        })
                      }
                    >
                      <option value="rounded">Arredondado</option>
                      <option value="soft">Cantos suaves</option>
                      <option value="outline">Contorno</option>
                    </select>
                  </label>
                  {mediaField("logo")}
                  {mediaField("avatar")}
                  {mediaField("background")}
                </div>
              )}
              {tab === "Publicação" && (
                <div className="panel">
                  <p className="eyebrow">EDITAR → PRÉ-VISUALIZAR → PUBLICAR</p>
                  <h2>Pronto para compartilhar?</h2>
                  <p>
                    Confira a página como seus visitantes vão vê-la. Links e
                    seções inativos ficam fora da prévia.
                  </p>
                  <button onClick={openPreview}>Abrir pré-visualização</button>
                  <hr />
                  <p className="notice">
                    {changed
                      ? "Salve as alterações antes de publicar."
                      : reviewed
                        ? "Prévia conferida. Você pode publicar a revisão salva."
                        : "Abra a pré-visualização antes de publicar."}
                  </p>
                  <button
                    className="primary"
                    disabled={busy || changed || !reviewed}
                    onClick={() => void publish()}
                  >
                    Publicar página
                  </button>
                </div>
              )}
            </fieldset>
          </section>
          {preview && (
            <aside
              className="preview-pane"
              aria-label="Pré-visualização do rascunho"
            >
              <div className="preview-heading">
                <span>Sua página · rascunho</span>
                <button
                  onClick={() => setPreview(false)}
                  aria-label="Fechar pré-visualização"
                >
                  ×
                </button>
              </div>
              <PageContent document={document} preview />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
