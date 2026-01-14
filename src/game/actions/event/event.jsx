// src/game/actions/event/event.jsx

import React from "react";
import { useActions } from "../../../engine/gameContext/useActions";
import { useGame } from "../../../engine/gameContext/gameContext";

const EventAction = () => {
  const { endActiveAction } = useActions();
  const { gameState } = useGame();

  const tileType = String(gameState?.activeAction?.tileType || "Unknown");

  return (
    <div style={{ padding: "16px" }}>
      <h1>Event</h1>
      <div style={{ marginBottom: "12px" }}>Tile type: <strong>{tileType}</strong></div>

      <button type="button" onClick={endActiveAction}>
        Back to Board
      </button>
    </div>
  );
};

export default EventAction;
