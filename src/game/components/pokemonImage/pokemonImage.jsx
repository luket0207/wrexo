// game/components/pokemonImage/pokemonImage.jsx
import React, { useMemo } from "react";

const toSpriteSlug = (name) => {
  if (typeof name !== "string") return "";
  return name
    .trim()
    .toLowerCase()
    // PokemonDB uses hyphenated names for certain forms/punctuation
    .replace(/[.:'’]/g, "")
    .replace(/\s+/g, "-");
};

const PokemonImage = ({
  pokemon,
  animate = false,
  shiny = false,
  back = false,
  className = "",
  alt = null,
  ...imgProps
}) => {
  const name = typeof pokemon?.name === "string" ? pokemon.name : "";

  const src = useMemo(() => {
    const slug = toSpriteSlug(name);
    if (!slug) return "";

    const base = "https://img.pokemondb.net/sprites/black-white";
    const isAnim = Boolean(animate);
    const isShiny = Boolean(shiny);
    const isBack = Boolean(back);

    // BACK sprites
    if (isBack) {
      if (isAnim && isShiny) return `${base}/anim/back-shiny/${slug}.gif`;
      if (isAnim && !isShiny) return `${base}/anim/back-normal/${slug}.gif`;
      if (!isAnim && isShiny) return `${base}/back-shiny/${slug}.gif`;
      return `${base}/back-normal/${slug}.gif`;
    }

    // FRONT sprites
    if (isAnim && isShiny) return `${base}/anim/shiny/${slug}.gif`;
    if (isAnim && !isShiny) return `${base}/anim/normal/${slug}.gif`;
    if (!isAnim && isShiny) return `${base}/shiny/${slug}.png`;
    return `${base}/normal/${slug}.png`;
  }, [name, animate, shiny, back]);

  const computedAlt = alt ?? name ?? "Pokemon";

  if (!src) return null;

  return (
    <img
      src={src}
      alt={computedAlt}
      className={className}
      loading="lazy"
      decoding="async"
      {...imgProps}
    />
  );
};

export default PokemonImage;
