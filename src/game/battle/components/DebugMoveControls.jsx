// DebugMoveControls.jsx
import React, { useMemo } from "react";
import { getActivePokemon } from "../battleEngine";

const DebugMoveControls = ({
  side,
  isMyTurn,
  disabled,
  sideState,
  onManualSlot,
}) => {
  const active = useMemo(() => getActivePokemon(sideState), [sideState]);

  const moves = Array.isArray(active?.battleMoves)
    ? active.battleMoves
    : new Array(6).fill(null);

  return (
    <div className="battle__manualPanel">
      <div className="battle__manualTitle">
        {side === "PLAYER" ? "Player debug moves" : "Opponent debug moves"}
      </div>

      <div className="battle__manualGrid">
        {moves.map((moveName, idx) => {
          const slot = idx + 1;
          const isLocked = moveName === null;

          return (
            <button
              key={`debug-${side}-${slot}`}
              type="button"
              className={`battle__manualBtn ${isLocked ? "is-locked" : ""}`}
              disabled={!isMyTurn || disabled}
              onClick={() => onManualSlot(slot)}
            >
              {slot}: {isLocked ? "Locked" : moveName}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DebugMoveControls;
