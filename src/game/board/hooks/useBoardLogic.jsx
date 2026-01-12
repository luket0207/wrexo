// game/board/hooks/useBoardLogic.jsx
import { useCallback, useMemo } from "react";

import { useDiceRoll } from "../../../engine/components/diceRoll/diceRoll";
import { useGame } from "../../../engine/gameContext/gameContext";
import { useTurnTransition } from "../../../engine/gameContext/useTurnTransition";
import { TILE_TYPE_TO_ACTION_KIND } from "../../gameTemplate/components/actionRegistry";

import { buildTiles, movePlayerBySteps } from "../boardMovement";

const computeNextTurnIndex = (prevTurnIndex, playerCount) => {
  const count = Math.max(1, Number(playerCount) || 1);
  const idx = Number(prevTurnIndex) || 0;
  return (idx + 1) % count;
};

const clampInt = (n, min, max) => Math.max(min, Math.min(max, n));

const makeActionKey = () => {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch (e) {
    // ignore
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const useBoardLogic = () => {
  const { rollDice } = useDiceRoll();
  const { endTurn } = useTurnTransition();

  const { gameState, setGameState, triggerEventsForLanding } = useGame();

  const tiles = useMemo(() => buildTiles(72), []);

  const players = useMemo(
    () => (Array.isArray(gameState?.players) ? gameState.players : []),
    [gameState?.players]
  );

  const safeTurnIndex = useMemo(() => {
    const idx = Number(gameState?.turnIndex) || 0;
    const maxIdx = Math.max(0, players.length - 1);
    return Math.min(idx, maxIdx);
  }, [gameState?.turnIndex, players.length]);

  const pendingMove = gameState?.pendingMove || null;
  const lastRoll = gameState?.lastRoll || null;
  const isAnimating = !!gameState?.isAnimating;
  const activeAction = gameState?.activeAction || null;

  const activePlayer = useMemo(() => players[safeTurnIndex] || null, [players, safeTurnIndex]);

  const piecesByTileIndex = useMemo(() => {
    const map = new Map();
    players.forEach((p) => {
      const pos = Number(p.positionIndex) || 0;
      const arr = map.get(pos) || [];
      arr.push(p);
      map.set(pos, arr);
    });
    return map;
  }, [players]);

  const canRoll = useMemo(
    () => !isAnimating && !pendingMove && !activeAction,
    [isAnimating, pendingMove, activeAction]
  );

  const canChooseDirection = useMemo(
    () => !isAnimating && !!pendingMove && !activeAction,
    [isAnimating, pendingMove, activeAction]
  );

  const setAnimating = useCallback(
    (value) => {
      setGameState((prev) => ({
        ...prev,
        isAnimating: !!value,
      }));
    },
    [setGameState]
  );

  const updatePlayerPosition = useCallback(
    ({ playerId, nextIndex, nextTileId }) => {
      setGameState((prev) => ({
        ...prev,
        players: (prev.players || []).map((p) => {
          if (p.id !== playerId) return p;
          return {
            ...p,
            positionIndex: nextIndex,
            currentTileId: nextTileId,
          };
        }),
      }));
    },
    [setGameState]
  );

  const startTileAction = useCallback(
    ({ playerId, landedTileId, landedTile }) => {
      const tileType = String(landedTile?.type || "");

      let kind = TILE_TYPE_TO_ACTION_KIND[tileType] || null;

      // Per-tile odds for encounter tiles
      const ENCOUNTER_CHANCE_BY_TILE = Object.freeze({
        Grass: 0.8,
        Feature: 0.5,
      });

      if (tileType === "Grass" || tileType === "Feature") {
        const encounterChance = ENCOUNTER_CHANCE_BY_TILE[tileType] ?? 0.8;
        kind = Math.random() < encounterChance ? "pokemonEncounter" : "event";
      }

      if (!kind) return;

      const zoneRaw = landedTile?.zoneId ?? landedTile?.zone ?? null;
      const zoneId =
        typeof zoneRaw === "string"
          ? zoneRaw
          : (zoneRaw && typeof zoneRaw === "object" ? zoneRaw.code : null) || "EE";

      const locationType = tileType === "Feature" ? "feature" : "grass";
      const actionKey = makeActionKey();

      setGameState((prev) => ({
        ...prev,
        activeAction: {
          kind,
          playerId,
          tileId: landedTileId,
          tileType,
          afterTurnIndex: computeNextTurnIndex(prev.turnIndex, (prev.players || []).length),
          zoneId,
          locationType,
          actionKey,
        },
        pendingMove: null,
        isAnimating: false,
      }));
    },
    [setGameState]
  );

  const onRoll = useCallback(async () => {
    if (!canRoll) return;
    if (!activePlayer) return;

    setAnimating(true);

    const result = await rollDice({
      min: 1,
      max: 6,
      sides: 6,
      title: `${activePlayer.name} - Roll`,
    });

    setGameState((prev) => ({
      ...prev,
      lastRoll: { playerId: activePlayer.id, value: result },
      pendingMove: { playerId: activePlayer.id, steps: result },
      isAnimating: false,
    }));
  }, [canRoll, activePlayer, rollDice, setAnimating, setGameState]);

  const onDebugRoll = useCallback(
    (forcedValue) => {
      if (!canRoll) return;
      if (!activePlayer) return;

      const v = clampInt(Number(forcedValue) || 1, 1, 6);

      setGameState((prev) => ({
        ...prev,
        lastRoll: { playerId: activePlayer.id, value: v },
        pendingMove: { playerId: activePlayer.id, steps: v },
        isAnimating: false,
      }));
    },
    [canRoll, activePlayer, setGameState]
  );

  const commitMove = useCallback(
    async (direction) => {
      if (!canChooseDirection) return;

      const move = pendingMove;
      const playerId = move?.playerId || null;
      const steps = Number(move?.steps);

      if (!playerId || !Number.isFinite(steps) || steps <= 0) {
        setGameState((prev) => ({
          ...prev,
          pendingMove: null,
          isAnimating: false,
        }));
        return;
      }

      const mover = players.find((p) => p.id === playerId);
      if (!mover) {
        setGameState((prev) => ({
          ...prev,
          pendingMove: null,
          isAnimating: false,
        }));
        return;
      }

      const startIndexRaw = Number(mover.positionIndex);
      const startIndex = Number.isFinite(startIndexRaw) ? startIndexRaw : 0;

      const tileCount = Array.isArray(tiles) ? tiles.length : 0;
      if (tileCount <= 0) {
        setGameState((prev) => ({
          ...prev,
          pendingMove: null,
          isAnimating: false,
        }));
        return;
      }

      setAnimating(true);

      let finalIndex = startIndex;
      let finalTileId = mover.currentTileId || "T01";

      try {
        const res = await movePlayerBySteps({
          steps,
          direction,
          tiles,
          playerId,
          startIndex,
          setPlayerPosition: updatePlayerPosition,
          stepDelayMs: 220,
        });

        finalIndex = Number.isFinite(res?.finalIndex) ? res.finalIndex : startIndex;
        finalTileId = String(res?.finalTileId || finalTileId);

        setAnimating(false);
      } catch (err) {
        console.error(err);
        setAnimating(false);
        setGameState((prev) => ({
          ...prev,
          pendingMove: null,
          isAnimating: false,
        }));
        return;
      }

      const landedTile = tiles?.[finalIndex] || null;

      // If we cannot resolve a landing tile, end the turn immediately
      if (!landedTile) {
        endTurn({ endingPlayerId: playerId });
        return;
      }

      const tileType = String(landedTile?.type || "");

      // Encounter / action tiles: action resolves later and ends the turn via endActiveAction.
      if (tileType === "Grass" || tileType === "Feature" || tileType === "PokeMart") {
        startTileAction({
          playerId,
          landedTileId: finalTileId || landedTile.id,
          landedTile,
        });
        return;
      }

      // trigger landing events for non-encounter tiles
      if (typeof triggerEventsForLanding === "function") {
        const zoneCode =
          (landedTile?.zone && typeof landedTile.zone === "object" ? landedTile.zone.code : null) ||
          (typeof landedTile?.zone === "string" ? landedTile.zone : null) ||
          (typeof landedTile?.zoneId === "string" ? landedTile.zoneId : null) ||
          "EE";

        const res = triggerEventsForLanding({
          playerId,
          tileId: finalTileId,
          tileType: landedTile.type,
          zoneId: landedTile.zone?.code || null,
        });

        console.log("[LandingEvents]", {
          tileId: landedTile.id,
          type: landedTile.type,
          zone: zoneCode,
          res,
        });
      }

      // Normal end of board turn
      endTurn({ endingPlayerId: playerId });
    },
    [
      canChooseDirection,
      pendingMove,
      players,
      tiles,
      setAnimating,
      updatePlayerPosition,
      setGameState,
      startTileAction,
      triggerEventsForLanding,
      endTurn,
    ]
  );

  const onClockwise = useCallback(() => commitMove("clockwise"), [commitMove]);
  const onAnticlockwise = useCallback(() => commitMove("anticlockwise"), [commitMove]);

  return {
    tiles,
    players,
    piecesByTileIndex,
    activePlayer,
    isAnimating,
    lastRoll,
    pendingMove,
    canRoll,
    canChooseDirection,
    onRoll,
    onDebugRoll,
    onClockwise,
    onAnticlockwise,
  };
};
