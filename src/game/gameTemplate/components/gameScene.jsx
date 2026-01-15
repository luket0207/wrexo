import React, { useMemo } from "react";

import Board from "../../board/board";
import { useGame } from "../../../engine/gameContext/gameContext";
import { getActionConfig } from "../components/actionRegistry";

const GameScene = () => {
  const { gameState } = useGame();
  const activeAction = gameState?.activeAction || null;

  const cfg = useMemo(() => {
    const kind = activeAction?.kind;
    return getActionConfig(kind);
  }, [activeAction?.kind]);

  const ActiveComponent = useMemo(() => cfg?.component || null, [cfg]);

  if (ActiveComponent) return <ActiveComponent />;

  // If an unknown kind is present, log it once per actionKey for debugging
  // (safe: does not affect runtime behavior)
  if (activeAction?.kind && !cfg) {
    // eslint-disable-next-line no-console
    console.warn("Unknown activeAction.kind; falling back to Board", {
      kind: activeAction.kind,
      activeAction,
    });
  }

  return <Board />;
};

export default GameScene;
