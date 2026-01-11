// engine/gameContext/useActions.jsx
import { useCallback } from "react";
import { useGame } from "./gameContext";

export const useActions = () => {
  const { setGameState, tickEventsEndTurn } = useGame();

  const endActiveAction = useCallback(() => {
    // Tick expiry for the player whose turn is ending (includes global ticking too)
    setGameState((prev) => {
      const action = prev?.activeAction || null;
      const endingPlayerId = action?.playerId || null;

      // If we can tick, do it via the helper which also uses setGameState.
      // We queue this first so it runs before the turnIndex advance below.
      if (endingPlayerId && typeof tickEventsEndTurn === "function") {
        // Note: this schedules another setGameState update, which React applies in order.
        tickEventsEndTurn(endingPlayerId);
      }

      const nextTurnIndex =
        typeof action?.afterTurnIndex === "number"
          ? action.afterTurnIndex
          : (prev?.turnIndex || 0);

      return {
        ...prev,
        activeAction: null,
        pendingMove: null,
        isAnimating: false,
        turnIndex: nextTurnIndex,
      };
    });
  }, [setGameState, tickEventsEndTurn]);

  return { endActiveAction };
};
