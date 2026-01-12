// game/gameTemplate/components/gameScene.jsx
import React, { useMemo } from "react";

import Board from "../../board/board";
import { useGame } from "../../../engine/gameContext/gameContext";
import { getActionConfig } from "../components/actionRegistry";

const GameScene = () => {
  const { gameState } = useGame();
  const activeAction = gameState?.activeAction || null;

  const ActiveComponent = useMemo(() => {
    const kind = activeAction?.kind;
    const cfg = getActionConfig(kind);
    return cfg?.component || null;
  }, [activeAction?.kind]);

  if (ActiveComponent) return <ActiveComponent />;
  return <Board />;
};

export default GameScene;
