// components/piece.jsx
import React, { useMemo } from "react";
import "./piece.scss";

import pieceBlue from "../../../assets/images/board/pieces/piece-blue.png";
import pieceGreen from "../../../assets/images/board/pieces/piece-green.png";
import pieceRed from "../../../assets/images/board/pieces/piece-red.png";
import pieceYellow from "../../../assets/images/board/pieces/piece-yellow.png";

const PIECE_IMAGE_BY_COLOR = Object.freeze({
  blue: pieceBlue,
  green: pieceGreen,
  red: pieceRed,
  yellow: pieceYellow,
});

const normalizeColorKey = (color) => {
  const c = String(color || "").trim().toLowerCase();

  // Common aliases / hex support (optional but useful)
  if (c === "#ff0000") return "red";
  if (c === "#00ff00") return "green";
  if (c === "#0000ff") return "blue";
  if (c === "#ffff00") return "yellow";

  return c;
};

const Piece = ({ player, isActive = false }) => {
  const initials = useMemo(() => {
    const name = String(player?.name || "").trim();
    if (!name) return "?";
    const parts = name.split(" ").filter(Boolean);
    const first = parts[0]?.[0] || "P";
    const second = parts[1]?.[0] || (parts[0]?.[1] || "");
    return (first + second).toUpperCase();
  }, [player?.name]);

  const imgSrc = useMemo(() => {
    const key = normalizeColorKey(player?.color);
    return PIECE_IMAGE_BY_COLOR[key] || PIECE_IMAGE_BY_COLOR.red;
  }, [player?.color]);

  return (
    <div
      className={`piece ${isActive ? "is-active" : ""}`}
      title={player?.name}
      aria-label={`${player?.name} piece`}
    >
      <img className="pieceImg" src={imgSrc} alt="" draggable="false" />
    </div>
  );
};

export default Piece;
