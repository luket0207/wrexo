import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../../engine/gameContext/gameContext";

const End = () => {
  const navigate = useNavigate();
  const { gameState } = useGame();

  const winnerId = String(gameState?.activeAction?.winnerPlayerId || "").trim() || null;

  const winnerName = useMemo(() => {
    const players = Array.isArray(gameState?.players) ? gameState.players : [];
    const p = players.find((x) => x?.id === winnerId) || null;
    return String(p?.name || "Unknown Winner");
  }, [gameState?.players, winnerId]);

  const onNewGame = () => {
    navigate("/");
    // Ensure fresh state even if you have any lingering refs
    window.location.reload();
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1>Game Over</h1>
      <p>
        Winner: <strong>{winnerName}</strong>
      </p>

      <div style={{ marginTop: "16px" }}>
        <button type="button" onClick={onNewGame}>
          Start New Game
        </button>
      </div>
    </div>
  );
};

export default End;
