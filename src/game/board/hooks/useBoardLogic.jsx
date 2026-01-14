// game/board/hooks/useBoardLogic.jsx
import React, { useCallback, useEffect, useMemo } from "react";

import { useDiceRoll } from "../../../engine/components/diceRoll/diceRoll";
import { useGame } from "../../../engine/gameContext/gameContext";
import { useTurnTransition } from "../../../engine/gameContext/useTurnTransition";
import { TILE_TYPE_TO_ACTION_KIND } from "../../gameTemplate/components/actionRegistry";

import { buildTiles, movePlayerBySteps } from "../boardMovement";

import Button, { BUTTON_VARIANT } from "../../../engine/ui/button/button";
import { MODAL_BUTTONS, useModal } from "../../../engine/ui/modal/modalContext";

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

const START_ZONE_OPTIONS = Object.freeze([
  { label: "Horseshoe Coast (HC)", zoneCode: "HC", tileId: "T06" },
  { label: "Earths End (EE)", zoneCode: "EE", tileId: "T18" },
  { label: "Frith (F)", zoneCode: "F", tileId: "T30" },
  { label: "Basham (B)", zoneCode: "B", tileId: "T42" },
  { label: "Erdig (E)", zoneCode: "E", tileId: "T54" },
  { label: "Dinasran (D)", zoneCode: "D", tileId: "T66" },
]);

const tileIdToIndex = (tileId) => {
  const s = String(tileId || "").trim();
  const m = /^T(\d{2})$/.exec(s);
  if (!m) return 0;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.max(0, n - 1);
};

export const useBoardLogic = () => {
  const { rollDice } = useDiceRoll();
  const { endTurn } = useTurnTransition();
  const { openModal, closeModal } = useModal();

  const { gameState, setGameState, triggerEventsForLanding, healPlayerParty } = useGame();

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

  const setPlayerChoosingStart = useCallback(
    ({ playerId, value }) => {
      if (!playerId) return;

      setGameState((prev) => ({
        ...prev,
        players: (prev.players || []).map((p) => {
          if (p.id !== playerId) return p;
          return { ...p, isChoosingStart: !!value };
        }),
      }));
    },
    [setGameState]
  );

  const placePlayerWithoutTriggeringTile = useCallback(
    ({ playerId, tileId }) => {
      const idx = tileIdToIndex(tileId);

      setGameState((prev) => ({
        ...prev,
        pendingMove: null,
        isAnimating: false,
        activeAction: null,
        players: (prev.players || []).map((p) => {
          if (p.id !== playerId) return p;
          return {
            ...p,
            positionIndex: idx,
            currentTileId: String(tileId || "T01"),
            hasChosenStart: true,
            isChoosingStart: false,
          };
        }),
      }));
    },
    [setGameState]
  );

  const promptChooseStartingZone = useCallback(
    ({ playerId }) => {
      if (!playerId) return;

      const player = players.find((p) => p?.id === playerId) || null;
      const playerName = player?.name ? String(player.name) : "Player";

      // This is the key: mark as choosing in GAME STATE so we never rely on a ref gate.
      setPlayerChoosingStart({ playerId, value: true });

      const content = (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {START_ZONE_OPTIONS.map((opt) => (
            <Button
              key={opt.tileId}
              variant={BUTTON_VARIANT.PRIMARY}
              onClick={() => {
                closeModal();
                placePlayerWithoutTriggeringTile({ playerId, tileId: opt.tileId });
              }}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      );

      openModal({
        title: `Choose Starting Zone - ${playerName}`,
        content,
        buttons: MODAL_BUTTONS.NONE,
        locked: true,
      });
    },
    [players, setPlayerChoosingStart, openModal, closeModal, placePlayerWithoutTriggeringTile]
  );

  // === START-SELECTION (FIXED) ===
  // Each player will be prompted on their first active turn.
  // We gate ONLY on per-player game state:
  // - hasChosenStart: done
  // - isChoosingStart: modal already active for them
  useEffect(() => {
    if (!activePlayer?.id) return;

    // Board must be idle
    if (activeAction || pendingMove || isAnimating) return;

    // If already done, nothing to do
    if (activePlayer.hasChosenStart === true) return;

    // If already choosing (modal active), do not reopen
    if (activePlayer.isChoosingStart === true) return;

    promptChooseStartingZone({ playerId: activePlayer.id });
  }, [
    activePlayer?.id,
    activePlayer?.hasChosenStart,
    activePlayer?.isChoosingStart,
    activeAction,
    pendingMove,
    isAnimating,
    promptChooseStartingZone,
  ]);

  // === FAINTING FLOW ===
  // On the player's next turn, heal and force them to choose start again.
  useEffect(() => {
    if (!activePlayer?.id) return;

    // Board must be idle
    if (activeAction || pendingMove || isAnimating) return;

    if (activePlayer.isFainted !== true) return;

    const playerId = activePlayer.id;

    // Heal (best-effort)
    if (typeof healPlayerParty === "function") {
      healPlayerParty(playerId, { amount: "MAX" });
    }

    // Reset faint + require new start selection.
    // Important: set isChoosingStart false first; the start-selection effect above will open the modal
    // and set isChoosingStart true in a clean, single path.
    setGameState((prev) => ({
      ...prev,
      players: (prev.players || []).map((p) => {
        if (p.id !== playerId) return p;
        return {
          ...p,
          isFainted: false,
          hasChosenStart: false,
          isChoosingStart: false,
        };
      }),
    }));
  }, [
    activePlayer?.id,
    activePlayer?.isFainted,
    activeAction,
    pendingMove,
    isAnimating,
    healPlayerParty,
    setGameState,
  ]);

  const startTileAction = useCallback(
    ({ playerId, landedTileId, landedTile }) => {
      const tileType = String(landedTile?.type || "");

      let kind = TILE_TYPE_TO_ACTION_KIND[tileType] || null;

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

      const locationType =
        tileType === "Feature" ? "feature" : tileType === "Trainer" ? "trainer" : "grass";

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

      if (!landedTile) {
        endTurn({ endingPlayerId: playerId });
        return;
      }

      const tileType = String(landedTile?.type || "");

      if (
        tileType === "Grass" ||
        tileType === "Feature" ||
        tileType === "NPC" ||
        tileType === "PokemonCentre" ||
        tileType === "PokeMart" ||
        tileType === "Trainer"
      ) {
        startTileAction({
          playerId,
          landedTileId: finalTileId || landedTile.id,
          landedTile,
        });
        return;
      }

      if (typeof triggerEventsForLanding === "function") {
        triggerEventsForLanding({
          playerId,
          tileId: finalTileId,
          tileType: landedTile.type,
          zoneId: landedTile.zone?.code || null,
        });
      }

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

    promptChooseStartingZone,
  };
};
