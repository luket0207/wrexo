// engine/gameContext/gameContext.jsx
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import useItems from "./useItems";
import useEvents from "./useEvent";

const GameContext = createContext(null);

const DEFAULT_PLAYERS_FALLBACK = Object.freeze([
  { name: "Player 1", color: "red" },
  { name: "Player 2", color: "blue" },
]);

const DEFAULT_GAME_STATE = Object.freeze({
  players: [],
  turnIndex: 0,

  isAnimating: false,
  lastRoll: null,
  pendingMove: null,

  activeAction: null,

  pendingItemDecision: null,
});

const setByPath = (obj, path, value) => {
  const keys = path.split(".");
  const next = { ...obj };

  let cursor = next;
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];

    if (i === keys.length - 1) {
      cursor[key] = value;
    } else {
      const current = cursor[key];
      cursor[key] = typeof current === "object" && current !== null ? { ...current } : {};
      cursor = cursor[key];
    }
  }

  return next;
};

const normalizePlayersToGamePlayers = (playersInput) => {
  const arr = Array.isArray(playersInput) ? playersInput : [];
  const trimmed = arr.slice(0, 4);
  const ensured = trimmed.length < 2 ? DEFAULT_PLAYERS_FALLBACK : trimmed;

  return ensured.map((p, i) => ({
    id: `P${i + 1}`,
    name: String(p?.name || `Player ${i + 1}`).trim() || `Player ${i + 1}`,
    color: String(p?.color || "red").trim() || "red",

    level: 1,
    pokemon: [],

    items: [],
    itemLimit: 6,

    autoItems: [],

    // Events log
    events: [],

    positionIndex: 0,
    currentTileId: "T01",
  }));
};

export const buildNewGameState = (playersInput) => ({
  ...DEFAULT_GAME_STATE,
  players: normalizePlayersToGamePlayers(playersInput),
  turnIndex: 0,
  isAnimating: false,
  lastRoll: null,
  pendingMove: null,
  activeAction: null,
  pendingItemDecision: null,
});

export const GameProvider = ({ children, initialState = null }) => {
  const [gameState, setGameState] = useState(() => {
    if (initialState && typeof initialState === "object") return initialState;
    return DEFAULT_GAME_STATE;
  });

  const setGameValue = useCallback((path, value) => {
    setGameState((prev) => setByPath(prev, path, value));
  }, []);

  const loadGameState = useCallback((nextState) => {
    if (nextState == null || typeof nextState !== "object") {
      throw new Error("loadGameState: nextState must be an object");
    }
    setGameState(nextState);
  }, []);

  // ============================
  // Pokemon team management
  // ============================

  const TEAM_MAX = 3;
  const SHINY_HP_BONUS = 10;

  const applyShinyHpBonus = (pokemon) => {
    if (!pokemon || typeof pokemon !== "object") return pokemon;
    if (!pokemon.shiny) return pokemon;

    const baseHealth = Number(pokemon.health);
    const baseMaxHealth = Number(pokemon.maxHealth);

    const safeHealth = Number.isFinite(baseHealth)
      ? baseHealth
      : Number.isFinite(baseMaxHealth)
        ? baseMaxHealth
        : 0;

    const safeMaxHealth = Number.isFinite(baseMaxHealth)
      ? baseMaxHealth
      : Number.isFinite(baseHealth)
        ? baseHealth
        : 0;

    return {
      ...pokemon,
      health: safeHealth + SHINY_HP_BONUS,
      maxHealth: safeMaxHealth + SHINY_HP_BONUS,
    };
  };

  const addPokemonToTeam = useCallback((playerId, pokemonToAdd, opts = {}) => {
    const { mode = "replace", replaceIndex = 0 } = opts || {};

    if (!playerId) throw new Error("addPokemonToTeam: playerId is required");
    if (!pokemonToAdd || typeof pokemonToAdd !== "object") {
      throw new Error("addPokemonToTeam: pokemonToAdd must be an object");
    }

    // Apply shiny HP bonus at the point of adding to party.
    // Clone to avoid mutating caller objects (e.g. encounter selection).
    const pokemonWithBonuses = applyShinyHpBonus({ ...pokemonToAdd });

    let result = { ok: false, reason: "unknown" };

    setGameState((prev) => {
      const players = Array.isArray(prev?.players) ? prev.players : [];
      const playerIndex = players.findIndex((p) => p?.id === playerId);
      if (playerIndex === -1) {
        result = { ok: false, reason: "player_not_found" };
        return prev;
      }

      const player = players[playerIndex];
      const currentTeam = Array.isArray(player?.pokemon) ? player.pokemon : [];

      if (currentTeam.length < TEAM_MAX) {
        const nextTeam = [...currentTeam, pokemonWithBonuses];
        const nextPlayer = { ...player, pokemon: nextTeam };
        const nextPlayers = [...players];
        nextPlayers[playerIndex] = nextPlayer;

        result = { ok: true, action: "added", teamSize: nextTeam.length };
        return { ...prev, players: nextPlayers };
      }

      if (mode === "discard") {
        result = { ok: true, action: "discarded_new", teamSize: currentTeam.length };
        return prev;
      }

      const safeIndex =
        typeof replaceIndex === "number" && replaceIndex >= 0 && replaceIndex < TEAM_MAX
          ? replaceIndex
          : 0;

      const nextTeam = currentTeam.slice(0, TEAM_MAX);
      nextTeam[safeIndex] = pokemonWithBonuses;

      const nextPlayer = { ...player, pokemon: nextTeam };
      const nextPlayers = [...players];
      nextPlayers[playerIndex] = nextPlayer;

      result = {
        ok: true,
        action: "replaced",
        replacedIndex: safeIndex,
        teamSize: nextTeam.length,
      };
      return { ...prev, players: nextPlayers };
    });

    return result;
  }, []);

  const removePokemonFromTeam = useCallback((playerId, removeIndex) => {
    if (!playerId) throw new Error("removePokemonFromTeam: playerId is required");

    setGameState((prev) => {
      const players = Array.isArray(prev?.players) ? prev.players : [];
      const playerIndex = players.findIndex((p) => p?.id === playerId);
      if (playerIndex === -1) return prev;

      const player = players[playerIndex];
      const currentTeam = Array.isArray(player?.pokemon) ? player.pokemon : [];

      if (typeof removeIndex !== "number" || removeIndex < 0 || removeIndex >= currentTeam.length) {
        return prev;
      }

      const nextTeam = currentTeam.filter((_, i) => i !== removeIndex);
      const nextPlayer = { ...player, pokemon: nextTeam };
      const nextPlayers = [...players];
      nextPlayers[playerIndex] = nextPlayer;

      return { ...prev, players: nextPlayers };
    });
  }, []);

  // ============================
  // Items (hook)
  // ============================

  const { addItemToInventory, resolvePendingItemDecision, clearPendingItemDecision } = useItems({
    setGameState,
  });

  // ============================
  // Events (hook)
  // ============================

  const {
    addEventToPlayer,
    addGlobalEventToAllPlayers,
    removeEventFromPlayer,
    triggerEventsForLanding,
    tickEventsEndTurn,
  } = useEvents({
    setGameState,
  });

  const value = useMemo(
    () => ({
      gameState,
      setGameState,
      setGameValue,
      loadGameState,

      addPokemonToTeam,
      removePokemonFromTeam,

      addItemToInventory,
      resolvePendingItemDecision,
      clearPendingItemDecision,

      // Events
      addEventToPlayer,
      addGlobalEventToAllPlayers,
      removeEventFromPlayer,
      triggerEventsForLanding,
      tickEventsEndTurn,
    }),
    [
      gameState,
      setGameValue,
      loadGameState,
      addPokemonToTeam,
      removePokemonFromTeam,
      addItemToInventory,
      resolvePendingItemDecision,
      clearPendingItemDecision,
      addEventToPlayer,
      addGlobalEventToAllPlayers,
      removeEventFromPlayer,
      triggerEventsForLanding,
      tickEventsEndTurn,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return ctx;
};
