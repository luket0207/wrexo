import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./gameTemplate.scss";

import GameUi from "./components/gameUi";
import GameScene from "./components/gameScene";

import { GameProvider, buildNewGameState } from "../../engine/gameContext/gameContext";
import { useGame } from "../../engine/gameContext/gameContext";

import { getActionConfig } from "./components/actionRegistry";

import boardBgImg from "../../assets/images/board/board.png";
import mountWrexoBgImg from "../../assets/images/board/mount-wrexo-board.png";

import { getActionBackgroundStyle } from "./utils/actionBackground";

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

  const actionCfg = useMemo(() => {
    const kind = activeAction?.kind;
    return getActionConfig(kind);
  }, [activeAction?.kind]);

  const hideUi = useMemo(() => {
    return !!actionCfg?.hideUi;
  }, [actionCfg?.hideUi]);

  const actionBgStyle = useMemo(() => {
    // Only attempt action background if the action kind is registered
    if (!actionCfg) return null;

    try {
      return getActionBackgroundStyle(activeAction);
    } catch (e) {
      console.error("getActionBackgroundStyle crashed; falling back to board background", e, {
        kind: activeAction?.kind,
        activeAction,
      });
      return null;
    }
  }, [actionCfg, activeAction]);

  const view = useMemo(() => {
    // IMPORTANT: treat "action view" only when the kind is registered
    return actionCfg ? "action" : "board";
  }, [actionCfg]);

  const players = Array.isArray(gameState?.players) ? gameState.players : [];
  const safeTurnIndex = Math.min(
    Math.max(Number(gameState?.turnIndex) || 0, 0),
    Math.max(players.length - 1, 0)
  );
  const activePlayer = players[safeTurnIndex] || null;

  const isWrexoView = activePlayer?.climbingMountWrexo === true;

  const boardBgStyle = useMemo(() => {
    const img = isWrexoView ? mountWrexoBgImg : boardBgImg;
    return {
      backgroundImage: `url(${img})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }, [isWrexoView]);

  const containerStyle = useMemo(() => {
    if (view === "board") return boardBgStyle;
    return actionBgStyle || undefined;
  }, [view, boardBgStyle, actionBgStyle]);

  return (
    <div className="gameTemplateRoot">
      {!hideUi ? <GameUi onNewGame={onNewGame} /> : null}

      <main
        className={`gameTemplateContent ${view === "board" ? "is-board" : ""}`}
        style={containerStyle}
      >
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
