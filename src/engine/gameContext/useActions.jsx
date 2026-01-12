// engine/gameContext/useActions.jsx
import { useCallback } from "react";
import { useGame } from "./gameContext";
import { useTurnTransition } from "./useTurnTransition";

export const useActions = () => {
  const { gameState } = useGame();
  const { endTurn } = useTurnTransition();

  const endActiveAction = useCallback(() => {
    const action = gameState?.activeAction || null;

    console.log("[useActions.endActiveAction] activeAction", action);

    endTurn({
      endingPlayerId: action?.playerId || null,
      nextTurnIndex: typeof action?.afterTurnIndex === "number" ? action.afterTurnIndex : null,
      clearActiveAction: true,
    });
  }, [gameState?.activeAction, endTurn]);

  return { endActiveAction };
};
