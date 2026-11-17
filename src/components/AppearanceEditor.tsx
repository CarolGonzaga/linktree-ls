import { useId, useState, type ReactNode } from "react";
import {
  getButtonStyle,
  getGradientPreset,
  getTheme,
  gradientEnd,
  gradients,
  hexColor,
  themePresets,
  themes,
  useAlternativeTitle,
  type Appearance,
  type ColorKey,
} from "../lib/appearance";
import { googleFonts, type GoogleFont, type PageFont } from "../lib/fonts";
import { FollowersEditor } from "./FollowersEditor";

const groups = [
  ["Tema", "◐"],
  ["Fundo", "▧"],
  ["Botões", "▰"],
  ["Texto", "Aa"],
  ["Cores", "◈"],
  ["Rodapé", "—"],
  ["Redes sociais", "◎"],
] as const;
const wallpapers = [
  ["solid", "Cor sólida"],
  ["gradient", "Degradê"],
  ["blur", "Desfoque"],
  ["pattern", "Padrão"],
  ["image", "Imagem"],
  ["video", "Vídeo"],
] as const;
const buttonStyles = [
  ["solid", "Sólido"],
  ["glass", "Vidro"],
  ["outline", "Contorno"],
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
  const name = useId();
  return (
    <fieldset className="design-field">
      <legend>{label}</legend>
      <div className="design-choices">
        {options.map(([id, text]) => (
          <label key={id} className="design-choice">
            <input
              type="radio"
              name={name}
              checked={value === id}
              onChange={() => onChange(id)}
            />
            {render?.(id)}
            <span>{text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function FontSelect<T extends PageFont>({
  label,
  value,
  onChange,
  systemOptions = false,
}: {
  label: string;
  value: T;
  onChange: (font: T) => void;
  systemOptions?: boolean;
}) {
  return (
    <label className="design-inline">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        <optgroup label="Google Fonts">
          {googleFonts.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </optgroup>
        {systemOptions && (
          <optgroup label="Fontes do dispositivo">
            <option value="georgia">Georgia</option>
            <option value="system">Sistema</option>
          </optgroup>
        )}
      </select>
    </label>
  );
}

type AppearanceControl = {
  appearance: Appearance;
  update: (patch: Partial<Appearance>) => void;
};

function ThemePicker({ appearance, update }: AppearanceControl) {
  const [curated, setCurated] = useState(
    () => getTheme(appearance.themePreset)?.curated === true,
  );
  const presets = themePresets.filter(
    (preset) => Boolean(preset.curated) === curated,
  );
  function choose(id: string) {
    const preset = getTheme(id);
    if (preset)
      update({
        themePreset: id,
        wallpaper: preset.gradient ? "gradient" : "solid",
        gradient: "custom",
        gradientColor: undefined,
      });
  }
  return (
    <>
      <div className="theme-toolbar">
        <div
          className="theme-filters"
          role="group"
          aria-label="Galerias de temas"
        >
          <button
            type="button"
            aria-pressed={!curated}
            onClick={() => setCurated(false)}
          >
            Personalizáveis
          </button>
          <button
            type="button"
            aria-pressed={curated}
            onClick={() => setCurated(true)}
          >
            Curados
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            const available = presets.filter(
              ({ id }) => id !== appearance.themePreset,
            );
            choose(available[Math.floor(Math.random() * available.length)].id);
          }}
        >
          Sortear tema
        </button>
      </div>
      <div className="theme-grid" role="group" aria-label="Temas disponíveis">
        {!curated && (
          <button
            type="button"
            aria-pressed={!appearance.themePreset}
            onClick={() => update({ themePreset: undefined })}
          >
            <span className="theme-thumbnail theme-custom" aria-hidden="true">
              ✦
            </span>
            Personalizado
          </button>
        )}
        {presets.map((preset) => (
          <button
            type="button"
            key={preset.id}
            aria-pressed={appearance.themePreset === preset.id}
            onClick={() => choose(preset.id)}
          >
            <span
              className="theme-thumbnail"
              aria-hidden="true"
              style={{
                background: preset.gradient
                  ? `linear-gradient(${preset.page}, ${preset.gradient})`
                  : preset.page,
                color: preset.text,
              }}
            >
              Aa
              <span style={{ background: preset.button }} />
            </span>
            {preset.name}
          </button>
        ))}
      </div>
    </>
  );
}

export function AppearanceEditor({
  appearance,
  update,
  section,
  headerFields,
  logoField,
  backgroundField,
  footerField,
}: AppearanceControl & {
  section: "header" | "design";
  headerFields?: ReactNode;
  logoField?: ReactNode;
  backgroundField?: ReactNode;
  footerField?: ReactNode;
}) {
  const [group, setGroup] = useState<(typeof groups)[number][0] | null>(null);
  const preset = getTheme(appearance.themePreset);
  const theme = preset ?? themes[appearance.palette] ?? themes.rose;
  const wallpaper = appearance.wallpaper ?? "image";
  const buttonStyle = getButtonStyle(appearance);
  const hasTitleFont = useAlternativeTitle(appearance);
  const textColor = hexColor(appearance.colors?.text)
    ? appearance.colors.text
    : theme.text;
  const buttonColor = buttonStyle === "outline" ? theme.accent : theme.button;
  const baseColor =
    (wallpaper === "gradient" && getGradientPreset(appearance.gradient)?.[0]) ||
    theme.page;

  function color(key: ColorKey, label: string, fallback: string) {
    const custom = appearance.colors?.[key];
    const value = hexColor(custom) ? custom : fallback;
    return (
      <div className="design-color">
        <span>{label}</span>
        <label>
          <input
            type="color"
            aria-label={label}
            value={value}
            onChange={(event) =>
              update({
                colors: { ...appearance.colors, [key]: event.target.value },
              })
            }
          />
          <small aria-hidden="true">{value.toUpperCase()}</small>
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

  const alternativeTitle = (
    <>
      <label className="check">
        <input
          type="checkbox"
          checked={hasTitleFont}
          onChange={(event) => update({ useTitleFont: event.target.checked })}
        />
        Fonte alternativa do título
      </label>
      {hasTitleFont && (
        <FontSelect<GoogleFont>
          label="Fonte do título"
          value={
            appearance.titleFont === "body"
              ? "playfair"
              : (appearance.titleFont ?? "playfair")
          }
          onChange={(titleFont) => update({ titleFont })}
        />
      )}
      {color("title", "Cor do título", textColor)}
    </>
  );

  if (section === "header") {
    return (
      <div className="panel design-panel" aria-label="Personalizar cabeçalho">
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
        {headerFields}
        <Choices
          label="Estilo do título"
          value={appearance.heading ?? "text"}
          options={[
            ["text", "Texto"],
            ["logo", "Logo"],
          ]}
          onChange={(heading) => update({ heading })}
        />
        {appearance.heading === "logo" && logoField}
        {alternativeTitle}
        {appearance.header === "cutout" && (
          <p>Use uma imagem de perfil com fundo transparente para o recorte.</p>
        )}
      </div>
    );
  }

  if (group === null) {
    const labels = {
      Tema: preset?.name ?? "Personalizado",
      Fundo: wallpapers.find(([id]) => id === wallpaper)?.[1],
      Botões: buttonStyles.find(([id]) => id === buttonStyle)?.[1],
      Texto:
        googleFonts.find(
          ([id]) => id === (appearance.font ?? "dm-sans"),
        )?.[1] ?? (appearance.font === "georgia" ? "Georgia" : "Sistema"),
      Cores: Object.keys(appearance.colors ?? {}).length
        ? "Personalizadas"
        : "Da paleta",
      Rodapé: "Texto e hiperlinks",
      "Redes sociais":
        appearance.socialPlacement === "bottom"
          ? "No fim da página"
          : "No cabeçalho",
    };
    return (
      <nav className="design-menu" aria-label="Opções de design">
        {groups.map(([name, icon]) => (
          <button type="button" key={name} onClick={() => setGroup(name)}>
            <span className="design-menu-icon" aria-hidden="true">
              {icon}
            </span>
            <span>{name}</span>
            <small>{labels[name]}</small>
            <span aria-hidden="true">›</span>
          </button>
        ))}
      </nav>
    );
  }

  return (
    <div className="design-editor">
      <button
        type="button"
        className="design-back"
        onClick={() => setGroup(null)}
      >
        ← Voltar ao design
      </button>
      <div className="panel design-panel">
        <h2>{group}</h2>
        {group === "Tema" && (
          <ThemePicker appearance={appearance} update={update} />
        )}
        {group === "Fundo" && (
          <>
            <Choices
              label="Estilo do fundo"
              value={wallpaper}
              options={wallpapers}
              onChange={(wallpaper) => update({ wallpaper })}
              render={(mode) => (
                <span
                  className={`wallpaper-sample wallpaper-${mode}`}
                  aria-hidden="true"
                />
              )}
            />
            {color("page", "Cor do fundo", baseColor)}
            {wallpaper === "gradient" && (
              <>
                <Choices
                  label="Estilo do degradê"
                  value={
                    !appearance.gradient || appearance.gradient === "custom"
                      ? "custom"
                      : "preset"
                  }
                  options={[
                    ["custom", "Personalizado"],
                    ["preset", "Predefinido"],
                  ]}
                  onChange={(value) =>
                    update({ gradient: value === "preset" ? "rose" : "custom" })
                  }
                />
                {appearance.gradient && appearance.gradient !== "custom" ? (
                  <Choices
                    label="Degradê predefinido"
                    value={appearance.gradient}
                    options={[
                      ["rose", "Rosa"],
                      ["wine", "Vinho"],
                      ["warm", "Pêssego"],
                    ]}
                    onChange={(gradient) => update({ gradient })}
                    render={(id) => (
                      <span
                        className="wallpaper-sample"
                        style={{
                          background: `linear-gradient(${gradients[id].join(",")})`,
                        }}
                      />
                    )}
                  />
                ) : (
                  <label className="design-inline">
                    Segunda cor do degradê
                    <input
                      type="color"
                      value={gradientEnd(appearance)}
                      onChange={(event) =>
                        update({ gradientColor: event.target.value })
                      }
                    />
                  </label>
                )}
                <Choices
                  label="Direção do degradê"
                  value={appearance.gradientDirection ?? "down"}
                  options={[
                    ["up", "Para cima"],
                    ["down", "Para baixo"],
                    ["radial", "Radial"],
                  ]}
                  onChange={(gradientDirection) =>
                    update({ gradientDirection })
                  }
                />
              </>
            )}
            {(wallpaper === "image" || wallpaper === "blur") && backgroundField}
            {wallpaper === "video" && (
              <label>
                URL direta do vídeo (HTTPS)
                <input
                  type="url"
                  value={appearance.wallpaperVideo ?? ""}
                  placeholder="https://exemplo.com/fundo.mp4"
                  onChange={(event) =>
                    update({ wallpaperVideo: event.target.value })
                  }
                />
              </label>
            )}
            <label className="check">
              <input
                type="checkbox"
                checked={appearance.wallpaperNoise === true}
                onChange={(event) =>
                  update({ wallpaperNoise: event.target.checked })
                }
              />
              Aplicar textura granulada
            </label>
          </>
        )}
        {group === "Botões" && (
          <>
            <Choices
              label="Estilo dos botões"
              value={buttonStyle}
              options={buttonStyles}
              onChange={(buttonStyle) => update({ buttonStyle })}
              render={(style) => (
                <span
                  className={`design-button-sample sample-${style}`}
                  aria-hidden="true"
                />
              )}
            />
            <Choices
              label="Formato dos cantos"
              value={
                appearance.buttonRadius ??
                (appearance.buttons === "soft" ? "soft" : "rounded")
              }
              options={[
                ["square", "Reto"],
                ["soft", "Suave"],
                ["rounded", "Arredondado"],
                ["pill", "Cápsula"],
              ]}
              onChange={(buttonRadius) => update({ buttonRadius })}
            />
            <Choices
              label="Sombra dos botões"
              value={appearance.buttonShadow ?? "none"}
              options={[
                ["none", "Sem sombra"],
                ["soft", "Suave"],
                ["strong", "Forte"],
                ["hard", "Marcada"],
              ]}
              onChange={(buttonShadow) => update({ buttonShadow })}
            />
            {color("button", "Cor dos botões", buttonColor)}
            {color("buttonText", "Cor do texto dos botões", textColor)}
          </>
        )}
        {group === "Texto" && (
          <>
            <FontSelect<PageFont>
              label="Fonte da página"
              value={appearance.font ?? "dm-sans"}
              onChange={(font) => update({ font })}
              systemOptions
            />
            {color("text", "Cor do texto da página", theme.text)}
            {alternativeTitle}
          </>
        )}
        {group === "Cores" && (
          <>
            {color("page", "Cor do fundo", baseColor)}
            {color("button", "Cor dos botões", buttonColor)}
            {color("buttonText", "Cor do texto dos botões", textColor)}
            {color("text", "Cor do texto da página", theme.text)}
            {color("title", "Cor do título", textColor)}
          </>
        )}
        {group === "Rodapé" && footerField}
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
