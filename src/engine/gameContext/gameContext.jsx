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

    events: [],

    positionIndex: 0,
    currentTileId: "T01",

    // start selection + fainting state
    hasChosenStart: false,
    isChoosingStart: false,
    isFainted: false,
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
  // Fainting state helpers
  // ============================

  const setPlayerFainted = useCallback(
    (playerId, value) => {
      if (!playerId) throw new Error("setPlayerFainted: playerId is required");

      setGameState((prev) => {
        const players = Array.isArray(prev?.players) ? prev.players : [];
        const idx = players.findIndex((p) => p?.id === playerId);
        if (idx === -1) return prev;

        const player = players[idx];
        const nextPlayer = { ...player, isFainted: !!value };
        const nextPlayers = players.slice();
        nextPlayers[idx] = nextPlayer;

        return { ...prev, players: nextPlayers };
      });
    },
    [setGameState]
  );

  // ============================
  // Party healing (versatile)
  // ============================

  const clampNonNegativeInt = (n) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return 0;
    const i = Math.floor(x);
    return i < 0 ? 0 : i;
  };

  const toNumber = (n, fallback = 0) => {
    const x = Number(n);
    return Number.isFinite(x) ? x : fallback;
  };

  const healOnePokemon = (pokemon, { mode, amount }) => {
    if (!pokemon || typeof pokemon !== "object") return pokemon;

    const curHp = toNumber(pokemon.health, 0);
    const maxHpRaw = toNumber(pokemon.maxHealth, curHp);
    const maxHp = maxHpRaw < 0 ? 0 : maxHpRaw;

    if (mode === "MAX") {
      return {
        ...pokemon,
        maxHealth: maxHp,
        health: maxHp,
      };
    }

    const healBy = clampNonNegativeInt(amount);
    if (healBy <= 0) return pokemon;

    const nextHp = Math.min(maxHp, curHp + healBy);
    if (nextHp === curHp) return pokemon;

    return {
      ...pokemon,
      maxHealth: maxHp,
      health: nextHp,
    };
  };

  const normalizeHealSpec = (spec) => {
    const s = spec && typeof spec === "object" ? spec : {};

    const rawAmount = s.amount;

    const mode =
      rawAmount === "MAX" || rawAmount === Infinity || s.mode === "MAX" ? "MAX" : "AMOUNT";

    const amount = mode === "AMOUNT" ? clampNonNegativeInt(rawAmount) : 0;

    const healType = typeof s.healType === "string" ? s.healType.trim() : null;

    const healPokemonIds = Array.isArray(s.healPokemonIds)
      ? s.healPokemonIds.map((x) => String(x || "").trim()).filter(Boolean)
      : [];

    return {
      mode,
      amount,
      healType,
      healPokemonIds,
    };
  };

  const pokemonMatchesType = (pokemon, healType) => {
    if (!healType) return true;
    const t1 = typeof pokemon?.type === "string" ? pokemon.type : null;
    const t2 = typeof pokemon?.type2 === "string" ? pokemon.type2 : null;
    return t1 === healType || t2 === healType;
  };

  const pokemonMatchesId = (pokemon, idSetOrNull) => {
    if (!idSetOrNull) return true;
    const id = typeof pokemon?.id === "string" ? pokemon.id : null;
    return !!id && idSetOrNull.has(id);
  };

  const healPlayerParty = useCallback(
    (playerId, healSpec) => {
      if (!playerId) throw new Error("healPlayerParty: playerId is required");

      const spec = normalizeHealSpec(healSpec);

      setGameState((prev) => {
        const players = Array.isArray(prev?.players) ? prev.players : [];
        const idx = players.findIndex((p) => p?.id === playerId);
        if (idx === -1) return prev;

        const player = players[idx];
        const team = Array.isArray(player?.pokemon) ? player.pokemon : [];

        if (team.length === 0) return prev;

        const hasIds = spec.healPokemonIds.length > 0;
        const idSet = hasIds ? new Set(spec.healPokemonIds) : null;

        const nextTeam = team.map((pk) => {
          // Targeting precedence:
          // 1) healPokemonIds
          // 2) healType
          // 3) all
          if (hasIds) {
            if (!pokemonMatchesId(pk, idSet)) return pk;
            return healOnePokemon(pk, spec);
          }

          if (spec.healType) {
            if (!pokemonMatchesType(pk, spec.healType)) return pk;
            return healOnePokemon(pk, spec);
          }

          return healOnePokemon(pk, spec);
        });

        let changed = false;
        for (let i = 0; i < team.length; i += 1) {
          if (nextTeam[i] !== team[i]) {
            changed = true;
            break;
          }
        }
        if (!changed) return prev;

        const nextPlayer = { ...player, pokemon: nextTeam };
        const nextPlayers = players.slice();
        nextPlayers[idx] = nextPlayer;

        return { ...prev, players: nextPlayers };
      });
    },
    [setGameState]
  );

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

      // Fainting + healing
      setPlayerFainted,
      healPlayerParty,

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
      setPlayerFainted,
      healPlayerParty,
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
