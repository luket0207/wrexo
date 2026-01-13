import React, { useMemo } from "react";
import { useActions } from "../../../../engine/gameContext/useActions";
import { useGame } from "../../../../engine/gameContext/gameContext";
import { TURN } from "../battleEngine";

const getWinnerLabel = (winner) => {
  if (winner === TURN.PLAYER) return "Player";
  if (winner === TURN.OPPONENT) return "Opponent";
  return "Unknown";
};

const hasAnyAlivePokemon = (team) => {
  const arr = Array.isArray(team) ? team : [];
  for (let i = 0; i < arr.length; i += 1) {
    const hp = Number(arr[i]?.health) || 0;
    if (hp > 0) return true;
  }
  return false;
};

const BattleResult = ({ winner, playerId = null, playerTeam = [] }) => {
  const { endActiveAction } = useActions();
  const { setPlayerFainted } = useGame();

  const playerWiped = useMemo(() => {
    // Only treat as "player fainted" if the opponent won AND the player has no living Pokemon.
    if (winner !== TURN.OPPONENT) return false;
    return !hasAnyAlivePokemon(playerTeam);
  }, [winner, playerTeam]);

  const bannerText = useMemo(() => {
    if (playerWiped) return "Player has run out of Pokemon. Player fainted.";
    return `Battle Over! Winner: ${getWinnerLabel(winner)}`;
  }, [winner, playerWiped]);

  const onReturn = () => {
    // IMPORTANT: Do not end the active action until the user explicitly clicks.
    if (playerWiped && playerId) {
      setPlayerFainted(playerId, true);
    }

    endActiveAction();
  };

  return (
    <div className="battle__banner">
      <strong>{bannerText}</strong>

      <div style={{ marginTop: "12px" }}>
        <button type="button" onClick={onReturn}>
          Return to Board
        </button>
      </div>
    </div>
  );
};

export default BattleResult;
