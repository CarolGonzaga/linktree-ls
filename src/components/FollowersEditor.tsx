import { useId, useRef, useState } from "react";
import {
  followerNetworks,
  followerTotal,
  followerUrl,
  validFollowerCount,
} from "../lib/followers";
import type { FollowerNetwork, Followers } from "../lib/document";
import { SocialIcon } from "./SocialIcon";

const emptyFollowers: Followers = { show: false, profiles: {} };

export function FollowersEditor({
  value = emptyFollowers,
  onChange,
}: {
  value?: Followers;
  onChange: (value: Followers) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useId();
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState<FollowerNetwork | null>(null);
  const total = followerTotal(draft);
  const savedTotal = followerTotal(value);
  const hasIncompleteProfile = followerNetworks.some(([id, , domains]) => {
    const profile = draft.profiles[id];
    return (
      !!profile &&
      (!followerUrl(profile.url, domains) || !validFollowerCount(profile.count))
    );
  });
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setDraft(value);
          setEditing(null);
          dialog.current?.showModal();
        }}
      >
        Exibir total de seguidores
      </button>
      {value.show && savedTotal !== null && (
        <p>
          {savedTotal.toLocaleString("pt-BR")} seguidores exibidos no perfil.
        </p>
      )}
      <dialog
        ref={dialog}
        className="followers-dialog"
        aria-labelledby={heading}
      >
        <header>
          <h2 id={heading}>Total de seguidores</h2>
          <button
            aria-label="Fechar"
            type="button"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </header>
        <p>
          Vincule seus perfis e informe o número de seguidores de cada rede. As
          contagens são atualizadas manualmente.
        </p>
        <div className="follower-networks">
          {followerNetworks.map(([id, name, domains]) => {
            const profile = draft.profiles[id];
            const linked =
              !!profile &&
              !!followerUrl(profile.url, domains) &&
              validFollowerCount(profile.count);
            return (
              <div className="follower-network" key={id}>
                <div className="follower-row">
                  <span className="follower-network-icon" aria-hidden="true">
                    {id === "instagram" || id === "tiktok" || id === "x" ? (
                      <SocialIcon
                        social={{
                          id,
                          title: name,
                          url: "",
                          icon: id,
                          active: true,
                        }}
                      />
                    ) : (
                      name[0]
                    )}
                  </span>
                  <span>
                    {name}
                    {linked && (
                      <small>
                        {profile.count?.toLocaleString("pt-BR")} seguidores
                      </small>
                    )}
                  </span>
                  <button
                    type="button"
                    aria-expanded={editing === id}
                    aria-label={`${linked ? "Editar" : "Vincular"} ${name}`}
                    onClick={() => setEditing(editing === id ? null : id)}
                  >
                    {linked ? "Editar" : "Vincular"}
                  </button>
                </div>
                {editing === id && (
                  <div className="follower-fields">
                    <label>
                      URL do perfil
                      <input
                        type="url"
                        value={profile?.url ?? ""}
                        onChange={(event) => {
                          const url = event.target.value;
                          setDraft((current) => ({
                            ...current,
                            profiles: {
                              ...current.profiles,
                              [id]: { ...current.profiles[id], url },
                            },
                          }));
                        }}
                      />
                    </label>
                    <label>
                      Quantidade de seguidores
                      <input
                        type="number"
                        min="0"
                        max="1000000000"
                        step="1"
                        value={profile?.count ?? ""}
                        onChange={(event) => {
                          const count =
                            event.target.value === ""
                              ? undefined
                              : event.target.valueAsNumber;
                          setDraft((current) => ({
                            ...current,
                            profiles: {
                              ...current.profiles,
                              [id]: {
                                url: current.profiles[id]?.url ?? "",
                                count: Number.isNaN(count) ? undefined : count,
                              },
                            },
                          }));
                        }}
                      />
                    </label>
                    {profile?.url && !followerUrl(profile.url, domains) && (
                      <p>Informe uma URL de {domains.join(" ou ")}.</p>
                    )}
                    {profile?.count !== undefined &&
                      !validFollowerCount(profile.count) && (
                        <p>Informe um número inteiro entre 0 e 1 bilhão.</p>
                      )}
                    {profile && (
                      <button
                        type="button"
                        onClick={() => {
                          const profiles = { ...draft.profiles };
                          delete profiles[id];
                          setDraft({ ...draft, profiles });
                          setEditing(null);
                        }}
                      >
                        Remover perfil
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <label className="follower-toggle">
          <input
            type="checkbox"
            checked={draft.show && total !== null}
            disabled={total === null}
            onChange={(event) =>
              setDraft({ ...draft, show: event.target.checked })
            }
          />{" "}
          Mostrar total na página pública
        </label>
        {hasIncompleteProfile && (
          <p>
            Preencha a URL e a contagem de cada perfil ou remova o perfil
            incompleto.
          </p>
        )}
        <div className="followers-actions">
          <button type="button" onClick={() => dialog.current?.close()}>
            Cancelar
          </button>
          <button
            className="primary"
            type="button"
            disabled={hasIncompleteProfile}
            onClick={() => {
              const profiles = Object.fromEntries(
                followerNetworks.flatMap(([id, , domains]) => {
                  const profile = draft.profiles[id];
                  const url = profile && followerUrl(profile.url, domains);
                  return url && validFollowerCount(profile?.count)
                    ? [[id, { url, count: profile.count }]]
                    : [];
                }),
              );
              onChange({ show: draft.show && total !== null, profiles });
              dialog.current?.close();
            }}
          >
            Aplicar ao rascunho
          </button>
        </div>
      </dialog>
    </>
  );
}
