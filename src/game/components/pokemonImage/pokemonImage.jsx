// game/components/pokemonImage/pokemonImage.jsx
import React, { useMemo } from "react";
import "./PokemonImage.scss";

const SPRITE_SLUG_OVERRIDES = Object.freeze({
  // Your internal names -> PokemonDB sprite slugs
  "nidoran(m)": "nidoran-m",
  "nidoran(f)": "nidoran-f",

  // Optional: if you ever store the gender symbols instead
  "nidoran♂": "nidoran-m",
  "nidoran♀": "nidoran-f",
});

const normalizeKey = (name) =>
  typeof name === "string" ? name.trim().toLowerCase() : "";

const toSpriteSlug = (name) => {
  const key = normalizeKey(name);
  if (!key) return "";

  const override = SPRITE_SLUG_OVERRIDES[key];
  if (override) return override;

  return key
    .replace(/[.:'’]/g, "")
    .replace(/\s+/g, "-");
};

const PokemonImage = ({
  pokemon,
  animate = false,
  shiny,
  back = false,
  className = "",
  alt = null,
  ...imgProps
}) => {
  const name = typeof pokemon?.name === "string" ? pokemon.name : "";

  const resolvedShiny =
    typeof shiny === "boolean" ? shiny : Boolean(pokemon?.shiny);

  const src = useMemo(() => {
    const slug = toSpriteSlug(name);
    if (!slug) return "";

    const base = "https://img.pokemondb.net/sprites/black-white";
    const isAnim = Boolean(animate);
    const isShiny = Boolean(resolvedShiny);
    const isBack = Boolean(back);

    if (isBack) {
      if (isAnim && isShiny) return `${base}/anim/back-shiny/${slug}.gif`;
      if (isAnim && !isShiny) return `${base}/anim/back-normal/${slug}.gif`;
      if (!isAnim && isShiny) return `${base}/back-shiny/${slug}.gif`;
      return `${base}/back-normal/${slug}.gif`;
    }

    if (isAnim && isShiny) return `${base}/anim/shiny/${slug}.gif`;
    if (isAnim && !isShiny) return `${base}/anim/normal/${slug}.gif`;
    if (!isAnim && isShiny) return `${base}/shiny/${slug}.png`;
    return `${base}/normal/${slug}.png`;
  }, [name, animate, resolvedShiny, back]);

  const computedAlt = alt ?? name ?? "Pokemon";
  if (!src) return null;

  const wrapperClass =
    "pokemon-image-wrapper" +
    (resolvedShiny ? " shiny" : "") +
    (className ? ` ${className}` : "");

  return (
    <span className={wrapperClass}>
      <img
        src={src}
        alt={computedAlt}
        loading="lazy"
        decoding="async"
        {...imgProps}
      />
    </span>
  );
};

export default PokemonImage;
