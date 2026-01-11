// game/gameTemplate/components/gameScene.jsx
import React, { useMemo } from "react";

import Board from "../../board/board";
import PokemonEncounter from "../../actions/pokemonEncounter/pokemonEncounter";
import EventAction from "../../actions/event/event";

import { useGame } from "../../../engine/gameContext/gameContext";

const GameScene = () => {
  const { gameState } = useGame();

  const activeAction = gameState?.activeAction || null;

  const view = useMemo(() => {
    const kind = activeAction?.kind;
    if (kind === "pokemonEncounter") return "pokemonEncounter";
    if (kind === "event") return "event";
    return "board";
  }, [activeAction]);

  if (view === "pokemonEncounter") return <PokemonEncounter />;
  if (view === "event") return <EventAction />;
  return <Board />;
};

export default GameScene;
