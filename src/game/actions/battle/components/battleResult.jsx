// game/actions/battle/components/battleResult.jsx
import React from "react";
import { useActions } from "../../../../engine/gameContext/useActions";
import { TURN } from "../battleEngine";

const getWinnerLabel = (winner) => {
  if (winner === TURN.PLAYER) return "Player";
  if (winner === TURN.OPPONENT) return "Opponent";
  return "Unknown";
};

const BattleResult = ({ winner }) => {
  const { endActiveAction } = useActions();

  return (
    <div className="battle__banner">
      <strong>Battle Over! Winner: {getWinnerLabel(winner)}</strong>

      <div style={{ marginTop: "12px" }}>
        <button type="button" onClick={endActiveAction}>
          Return to Board
        </button>
      </div>
    </div>
  );
};

export default BattleResult;
