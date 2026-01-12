// game/components/pokemonImage/pokemonImage.jsx
import React, { useMemo } from "react";
import "./PokemonImage.scss";

const toSpriteSlug = (name) => {
  if (typeof name !== "string") return "";
  return name
    .trim()
    .toLowerCase()
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
