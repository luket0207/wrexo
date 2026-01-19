// game/board/components/tile.jsx
import React, { useMemo } from "react";
import "./tile.scss";

import { useGame } from "../../../engine/gameContext/gameContext";

const safeClass = (v) => String(v || "").trim().toLowerCase();

const Tile = ({ tile, children, isActive = false }) => {
  const { gameState } = useGame();

  const zoneCode = useMemo(() => safeClass(tile?.zone?.code), [tile?.zone?.code]);
  const type = useMemo(() => safeClass(tile?.type), [tile?.type]);

  const zoneClass = zoneCode ? `tile--zone-${zoneCode}` : "";
  const typeClass = type ? `tile--type-${type}` : "";

  const eliteTrainerName = useMemo(() => {
    if (type !== "elitebattle") return null;

    const map = gameState?.eliteTrainerByTileId || null;
    const tileId = String(tile?.id || "").trim();
    if (!map || !tileId) return null;

    const entry = map[tileId];
    const name = entry?.name ? String(entry.name).trim() : "";
    return name || null;
  }, [type, tile?.id, gameState?.eliteTrainerByTileId]);

  return (
    <div
      className={`tile ${isActive ? "is-active" : ""} ${zoneClass} ${typeClass}`}
      role="gridcell"
      aria-label={tile?.id || "Tile"}
      data-tile-id={tile?.id || ""}
      data-zone={tile?.zone?.code || ""}
      data-type={tile?.type || ""}
    >
      {children}

      {eliteTrainerName ? (
        <div className="tileEliteTrainerName" aria-label={`Elite trainer: ${eliteTrainerName}`}>
          {eliteTrainerName}
        </div>
      ) : null}

      {/* {tile?.id || ""} */}
    </div>
  );
};

export default Tile;
