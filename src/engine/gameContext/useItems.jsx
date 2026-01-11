// engine/gameContext/useItems.jsx
import { useCallback } from "react";

// This hook encapsulates all item/inventory logic.
// It expects a setGameState setter (from useState) and returns item actions.
const useItems = ({ setGameState }) => {
  if (typeof setGameState !== "function") {
    throw new Error("useItems: setGameState must be a function");
  }

  const applyAutoItemEffect = useCallback((player, item) => {
    const currentAuto = Array.isArray(player?.autoItems) ? player.autoItems : [];
    const nextAuto = [...currentAuto, item];

    let nextItemLimit = Number(player?.itemLimit) || 6;

    // Small Bag / Rucksack increase item slots.
    if (item?.id === "ITEM31") nextItemLimit += 2; // Small Bag
    if (item?.id === "ITEM32") nextItemLimit += 4; // Rucksack

    return { ...player, autoItems: nextAuto, itemLimit: nextItemLimit };
  }, []);

  const addItemToInventory = useCallback(
    (playerId, itemToAdd, opts = {}) => {
      const { mode = null, replaceIndex = 0 } = opts || {};

      if (!playerId) throw new Error("addItemToInventory: playerId is required");
      if (!itemToAdd || typeof itemToAdd !== "object") {
        throw new Error("addItemToInventory: itemToAdd must be an object");
      }

      let result = { ok: false, reason: "unknown" };

      setGameState((prev) => {
        const players = Array.isArray(prev?.players) ? prev.players : [];
        const playerIndex = players.findIndex((p) => p?.id === playerId);
        if (playerIndex === -1) {
          result = { ok: false, reason: "player_not_found" };
          return prev;
        }

        // If there is already a pending decision, do not stack more choices.
        if (prev?.pendingItemDecision) {
          result = { ok: false, reason: "decision_in_progress" };
          return prev;
        }

        const player = players[playerIndex];

        // Auto apply items do not consume a slot.
        if (itemToAdd?.autoApply === true) {
          const nextPlayer = applyAutoItemEffect(player, itemToAdd);
          const nextPlayers = [...players];
          nextPlayers[playerIndex] = nextPlayer;

          result = { ok: true, action: "auto_applied" };
          return { ...prev, players: nextPlayers };
        }

        const limit = Number(player?.itemLimit) || 6;
        const currentItems = Array.isArray(player?.items) ? player.items : [];
        const nextItems = currentItems.slice(0, limit);

        // Space available -> append
        if (nextItems.length < limit) {
          const appended = [...nextItems, itemToAdd];
          const nextPlayer = { ...player, items: appended };
          const nextPlayers = [...players];
          nextPlayers[playerIndex] = nextPlayer;

          result = { ok: true, action: "added", itemCount: appended.length, itemLimit: limit };
          return { ...prev, players: nextPlayers };
        }

        // Full inventory
        if (mode === "discard") {
          result = {
            ok: true,
            action: "discarded_new",
            itemCount: nextItems.length,
            itemLimit: limit,
          };
          return prev;
        }

        if (mode === "replace") {
          const safeIndex =
            typeof replaceIndex === "number" &&
            replaceIndex >= 0 &&
            replaceIndex < nextItems.length
              ? replaceIndex
              : 0;

          const replaced = [...nextItems];
          replaced[safeIndex] = itemToAdd;

          const nextPlayer = { ...player, items: replaced };
          const nextPlayers = [...players];
          nextPlayers[playerIndex] = nextPlayer;

          result = {
            ok: true,
            action: "replaced",
            replacedIndex: safeIndex,
            itemCount: replaced.length,
            itemLimit: limit,
          };
          return { ...prev, players: nextPlayers };
        }

        // No override provided -> require user choice
        result = { ok: false, reason: "inventory_full_needs_choice", itemLimit: limit };

        return {
          ...prev,
          pendingItemDecision: {
            playerId,
            item: itemToAdd,
            createdAt: Date.now(),
          },
        };
      });

      return result;
    },
    [applyAutoItemEffect, setGameState]
  );

  const resolvePendingItemDecision = useCallback(
    (action, replaceIndex = 0) => {
      setGameState((prev) => {
        const decision = prev?.pendingItemDecision;
        if (!decision) return prev;

        const { playerId, item } = decision;
        const players = Array.isArray(prev?.players) ? prev.players : [];
        const playerIndex = players.findIndex((p) => p?.id === playerId);

        if (playerIndex === -1) {
          return { ...prev, pendingItemDecision: null };
        }

        const player = players[playerIndex];

        // Defensive: auto apply should not create pending decision, but handle safely.
        if (item?.autoApply === true) {
          const nextPlayer = applyAutoItemEffect(player, item);
          const nextPlayers = [...players];
          nextPlayers[playerIndex] = nextPlayer;

          return { ...prev, players: nextPlayers, pendingItemDecision: null };
        }

        const limit = Number(player?.itemLimit) || 6;
        const currentItems = Array.isArray(player?.items) ? player.items : [];
        const nextItems = currentItems.slice(0, limit);

        if (action === "discard") {
          return { ...prev, pendingItemDecision: null };
        }

        const safeIndex =
          typeof replaceIndex === "number" && replaceIndex >= 0 && replaceIndex < nextItems.length
            ? replaceIndex
            : 0;

        const replaced = [...nextItems];
        replaced[safeIndex] = item;

        const nextPlayer = { ...player, items: replaced };
        const nextPlayers = [...players];
        nextPlayers[playerIndex] = nextPlayer;

        return { ...prev, players: nextPlayers, pendingItemDecision: null };
      });
    },
    [applyAutoItemEffect, setGameState]
  );

  const clearPendingItemDecision = useCallback(() => {
    setGameState((prev) => {
      if (!prev?.pendingItemDecision) return prev;
      return { ...prev, pendingItemDecision: null };
    });
  }, [setGameState]);

  return {
    addItemToInventory,
    resolvePendingItemDecision,
    clearPendingItemDecision,
  };
};

export default useItems;
