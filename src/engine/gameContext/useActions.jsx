// engine/gameContext/useActions.jsx
import { useCallback } from "react";
import { useGame } from "./gameContext";
import { useTurnTransition } from "./useTurnTransition";

const computeNextTurnIndex = (prevTurnIndex, playerCount) => {
  const count = Math.max(1, Number(playerCount) || 1);
  const idx = Number(prevTurnIndex) || 0;
  return (idx + 1) % count;
};

const getSafeTurnIndex = (turnIndex, playerCount) => {
  const idx = Number(turnIndex) || 0;
  const maxIdx = Math.max(0, (Number(playerCount) || 0) - 1);
  return Math.min(Math.max(idx, 0), maxIdx);
};

export const useActions = () => {
  const { gameState } = useGame();
  const { endTurn } = useTurnTransition();

  const endActiveAction = useCallback(() => {
    const action = gameState?.activeAction || null;

    const players = Array.isArray(gameState?.players) ? gameState.players : [];
    const safeIdx = getSafeTurnIndex(gameState?.turnIndex, players.length);
    const fallbackPlayerId = players?.[safeIdx]?.id || null;

    const endingPlayerId = action?.playerId || fallbackPlayerId;

    const fallbackNextTurnIndex = computeNextTurnIndex(gameState?.turnIndex, players.length);

    const nextTurnIndex =
      typeof action?.afterTurnIndex === "number" ? action.afterTurnIndex : fallbackNextTurnIndex;

    console.log("[useActions.endActiveAction] activeAction", action);

    endTurn({
      endingPlayerId,
      nextTurnIndex,
      clearActiveAction: true,
    });
  }, [gameState, endTurn]);

  return { endActiveAction };
};
