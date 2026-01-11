// components/tile.jsx
import React, { useMemo } from "react";
import "./tile.scss";

const safeClass = (v) => String(v || "").trim().toLowerCase();

const Tile = ({ tile, children, isActive = false }) => {
  const zoneCode = useMemo(() => safeClass(tile?.zone?.code), [tile?.zone?.code]);
  const type = useMemo(() => safeClass(tile?.type), [tile?.type]);

  // Examples produced:
  //  tile--zone-hc
  //  tile--type-pokemoncentre
  //  tile--type-pokemart
  //  tile--type-trainer
  //  tile--type-npc
  //  tile--type-feature
  //  tile--type-grass
  const zoneClass = zoneCode ? `tile--zone-${zoneCode}` : "";
  const typeClass = type ? `tile--type-${type}` : "";

  return (
    <div
      className={`tile ${isActive ? "is-active" : ""} ${zoneClass} ${typeClass}`}
      role="gridcell"
      aria-label={tile?.id || "Tile"}
      data-tile-id={tile?.id || ""}
      data-zone={tile?.zone?.code || ""}
      data-type={tile?.type || ""}
    >
      <div className="tileHeader">
        <span className="tileId">{tile?.id}</span>
      </div>

      <div className="tileBody">{children}</div>
    </div>
  );
};

export default Tile;
