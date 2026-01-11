// game/gameTemplate/gameTemplate.jsx
import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./gameTemplate.scss";

import GameUi from "./components/gameUi";
import GameScene from "./components/gameScene";

import { GameProvider, buildNewGameState } from "../../engine/gameContext/gameContext";
import { useGame } from "../../engine/gameContext/gameContext";

const DEFAULT_PLAYERS = [
  { name: "Player 1", color: "red" },
  { name: "Player 2", color: "blue" },
];

const normalizePlayersForStart = (input) => {
  const arr = Array.isArray(input) ? input.slice(0, 4) : DEFAULT_PLAYERS;
  if (arr.length < 2) return DEFAULT_PLAYERS;

  return arr.map((p, i) => ({
    name: String(p?.name || `Player ${i + 1}`).trim() || `Player ${i + 1}`,
    color: String(p?.color || "red").trim() || "red",
  }));
};

// Small helper component so we can read gameState inside provider
const GameLayout = ({ onNewGame }) => {
  const { gameState } = useGame();
  const activeAction = gameState?.activeAction || null;

  const view = useMemo(() => {
    const kind = activeAction?.kind;
    if (kind === "pokemonEncounter") return "pokemonEncounter";
    if (kind === "event") return "event";
    return "board";
  }, [activeAction]);

  const hideUi = view === "pokemonEncounter";

  return (
    <div className="gameTemplateRoot">
      {!hideUi ? <GameUi onNewGame={onNewGame} /> : null}

      <main className="gameTemplateContent">
        <GameScene />
      </main>
    </div>
  );
};

const GameTemplate = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const startPlayers = useMemo(
    () => normalizePlayersForStart(location?.state?.players),
    [location?.state?.players]
  );

  const initialGameState = useMemo(() => buildNewGameState(startPlayers), [startPlayers]);

  return (
    <GameProvider initialState={initialGameState}>
      <GameLayout onNewGame={() => navigate("/")} />
    </GameProvider>
  );
};

export default GameTemplate;
