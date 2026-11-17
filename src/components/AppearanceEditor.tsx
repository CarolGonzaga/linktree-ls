import { useState, type ReactNode } from "react";
import { themes, type Appearance, type ColorKey } from "../lib/appearance";
import { FollowersEditor } from "./FollowersEditor";

const groups = [
  ["Tema", "◐"],
  ["Cabeçalho", "▣"],
  ["Fundo", "▧"],
  ["Botões", "▰"],
  ["Texto", "Aa"],
  ["Redes sociais", "◎"],
] as const;

function Choices<T extends string>({
  label,
  value,
  options,
  onChange,
  render,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<readonly [T, string]>;
  onChange: (value: T) => void;
  render?: (value: T) => ReactNode;
}) {
  return (
    <fieldset className="design-field">
      <legend>{label}</legend>
      <div className="design-choices">
        {options.map(([id, name]) => (
          <label key={id} className="design-choice">
            <input
              type="radio"
              name={label}
              checked={value === id}
              onChange={() => onChange(id)}
            />
            {render?.(id)}
            <span>{name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function AppearanceEditor({
  appearance,
  update,
  headerFields,
  backgroundField,
}: {
  appearance: Appearance;
  update: (patch: Partial<Appearance>) => void;
  headerFields: ReactNode;
  backgroundField: ReactNode;
}) {
  const [group, setGroup] = useState<(typeof groups)[number][0]>("Tema");
  const theme = themes[appearance.palette];
  function color(key: ColorKey, label: string, fallback: string) {
    const custom = appearance.colors?.[key];
    const value =
      typeof custom === "string" && /^#[\da-f]{6}$/i.test(custom)
        ? custom
        : fallback;
    return (
      <div className="design-color">
        <label>
          <input
            type="color"
            value={value}
            onChange={(event) =>
              update({
                colors: { ...appearance.colors, [key]: event.target.value },
              })
            }
          />
          <span>
            {label}
            <small>{value.toUpperCase()}</small>
          </span>
        </label>
        {custom && (
          <button
            type="button"
            aria-label={`Restaurar ${label.toLowerCase()}`}
            onClick={() => {
              const colors = { ...appearance.colors };
              delete colors[key];
              update({ colors });
            }}
          >
            Restaurar
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="design-editor">
      <nav className="design-nav" aria-label="Opções de design">
        {groups.map(([name, icon]) => (
          <button
            type="button"
            key={name}
            aria-pressed={group === name}
            onClick={() => setGroup(name)}
          >
            <span aria-hidden="true">{icon}</span>
            {name}
          </button>
        ))}
      </nav>
      <div className="panel design-panel">
        <h2>{group}</h2>
        {group === "Tema" && (
          <>
            <p>
              Escolha uma base para a página. As cores que você personalizou
              continuam aplicadas.
            </p>
            <Choices
              label="Paleta do tema"
              value={appearance.palette}
              options={[
                ["rose", "Rosa suave"],
                ["wine", "Vinho"],
                ["neutral", "Neutros"],
              ]}
              onChange={(palette) => update({ palette })}
              render={(palette) => (
                <span
                  className="design-theme-sample"
                  style={{
                    background: themes[palette].page,
                    color: themes[palette].accent,
                  }}
                  aria-hidden="true"
                >
                  <i />
                  <b>LS</b>
                  <span style={{ background: themes[palette].button }} />
                  <span style={{ background: themes[palette].button }} />
                </span>
              )}
            />
          </>
        )}
        {group === "Cabeçalho" && (
          <>
            <Choices
              label="Layout do cabeçalho"
              value={appearance.header ?? "classic"}
              options={[
                ["classic", "Clássico"],
                ["hero", "Foto ampla"],
                ["banner", "Banner"],
                ["cutout", "Recorte"],
                ["shape", "Forma"],
              ]}
              onChange={(header) => update({ header })}
              render={(header) => (
                <span
                  className={`design-header-sample sample-${header}`}
                  aria-hidden="true"
                >
                  <i />
                  <b />
                </span>
              )}
            />
            <Choices
              label="Exibição do título"
              value={appearance.heading ?? "text"}
              options={[
                ["text", "Nome"],
                ["logo", "Logo"],
              ]}
              onChange={(heading) => update({ heading })}
            />
            <p>Para o layout Recorte, use uma imagem com fundo transparente.</p>
            {headerFields}
          </>
        )}
        {group === "Fundo" && (
          <>
            <Choices
              label="Estilo do fundo"
              value={appearance.wallpaper ?? "image"}
              options={[
                ["solid", "Cor sólida"],
                ["gradient", "Degradê"],
                ["image", "Imagem"],
              ]}
              onChange={(wallpaper) => update({ wallpaper })}
            />
            {color("page", "Cor do fundo", theme.page)}
            {(appearance.wallpaper ?? "image") === "image" && backgroundField}
          </>
        )}
        {group === "Botões" && (
          <>
            <Choices
              label="Estilo dos botões"
              value={appearance.buttons}
              options={[
                ["rounded", "Arredondado"],
                ["soft", "Cantos suaves"],
                ["outline", "Contorno"],
              ]}
              onChange={(buttons) => update({ buttons })}
              render={(style) => (
                <span
                  className={`design-button-sample sample-${style}`}
                  aria-hidden="true"
                />
              )}
            />
            {color(
              "button",
              "Cor dos botões",
              appearance.buttons === "outline" ? theme.accent : theme.button,
            )}
            {color(
              "buttonText",
              "Cor do texto dos botões",
              appearance.colors?.text ?? theme.text,
            )}
          </>
        )}
        {group === "Texto" && (
          <>
            <Choices
              label="Fonte da página"
              value={appearance.font ?? "dm-sans"}
              options={[
                ["dm-sans", "DM Sans"],
                ["georgia", "Georgia"],
                ["system", "Sistema"],
              ]}
              onChange={(font) => update({ font })}
            />
            <Choices
              label="Fonte do título"
              value={appearance.titleFont ?? "playfair"}
              options={[
                ["playfair", "Playfair Display"],
                ["body", "Igual à página"],
              ]}
              onChange={(titleFont) => update({ titleFont })}
            />
            {color("text", "Cor do texto da página", theme.text)}
            {color(
              "title",
              "Cor do título",
              appearance.colors?.text ?? theme.text,
            )}
          </>
        )}
        {group === "Redes sociais" && (
          <>
            <Choices
              label="Posição dos ícones sociais"
              value={appearance.socialPlacement ?? "top"}
              options={[
                ["top", "Abaixo da descrição"],
                ["bottom", "Acima do rodapé"],
              ]}
              onChange={(socialPlacement) => update({ socialPlacement })}
            />
            <FollowersEditor
              value={appearance.followers}
              onChange={(followers) => update({ followers })}
            />
          </>
        )}
      </div>
    </div>
  );
}
