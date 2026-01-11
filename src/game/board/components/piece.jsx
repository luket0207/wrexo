// components/piece.jsx
import React, { useMemo } from "react";

const Piece = ({ player, isActive = false }) => {
  const initials = useMemo(() => {
    const name = String(player?.name || "").trim();
    if (!name) return "?";
    const parts = name.split(" ").filter(Boolean);
    const first = parts[0]?.[0] || "P";
    const second = parts[1]?.[0] || (parts[0]?.[1] || "");
    return (first + second).toUpperCase();
  }, [player?.name]);

  return (
    <div
      className={`piece ${isActive ? "is-active" : ""}`}
      title={player?.name}
      aria-label={`${player?.name} piece`}
      style={{
        backgroundColor: player?.color || "gray",
      }}
    >
      <span className="pieceLabel">{initials}</span>
    </div>
  );
};

export default Piece;
