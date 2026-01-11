// game/actions/pokemonEncounter/hooks/useBallInventory.jsx
import { useCallback, useMemo } from "react";

export const BALL_ITEM_IDS = Object.freeze({
  GREAT: "ITEM22",
  ULTRA: "ITEM23",
  MASTER: "ITEM24",
});

const getItemId = (item) => {
  if (typeof item === "string") return item;
  if (item && typeof item === "object" && typeof item.id === "string") return item.id;
  return null;
};

const countItemId = (items, itemId) => {
  const arr = Array.isArray(items) ? items : [];
  let n = 0;
  for (let i = 0; i < arr.length; i += 1) {
    if (getItemId(arr[i]) === itemId) n += 1;
  }
  return n;
};

export const useBallInventory = ({ playerId, items, setGameState }) => {
  const greatCount = useMemo(() => countItemId(items, BALL_ITEM_IDS.GREAT), [items]);
  const ultraCount = useMemo(() => countItemId(items, BALL_ITEM_IDS.ULTRA), [items]);
  const masterCount = useMemo(() => countItemId(items, BALL_ITEM_IDS.MASTER), [items]);

  const consumeOneById = useCallback(
    (itemId) => {
      if (!playerId || !itemId) return null;

      let removed = null;

      setGameState((prev) => {
        const players = Array.isArray(prev?.players) ? prev.players : [];
        const pIndex = players.findIndex((p) => p?.id === playerId);
        if (pIndex === -1) return prev;

        const p = players[pIndex];
        const pItems = Array.isArray(p?.items) ? p.items : [];

        const removeIndex = pItems.findIndex((it) => getItemId(it) === itemId);
        if (removeIndex === -1) return prev;

        removed = pItems[removeIndex];

        const nextItems = pItems.filter((_, i) => i !== removeIndex);
        const nextPlayer = { ...p, items: nextItems };
        const nextPlayers = [...players];
        nextPlayers[pIndex] = nextPlayer;

        return { ...prev, players: nextPlayers };
      });

      return removed;
    },
    [playerId, setGameState]
  );

  const refund = useCallback(
    (itemObjOrId) => {
      if (!playerId || !itemObjOrId) return;

      setGameState((prev) => {
        const players = Array.isArray(prev?.players) ? prev.players : [];
        const pIndex = players.findIndex((p) => p?.id === playerId);
        if (pIndex === -1) return prev;

        const p = players[pIndex];
        const pItems = Array.isArray(p?.items) ? p.items : [];

        const nextItems = [...pItems, itemObjOrId];
        const nextPlayer = { ...p, items: nextItems };
        const nextPlayers = [...players];
        nextPlayers[pIndex] = nextPlayer;

        return { ...prev, players: nextPlayers };
      });
    },
    [playerId, setGameState]
  );

  const canUseGreat = greatCount > 0;
  const canUseUltra = ultraCount > 0;
  const canUseMaster = masterCount > 0;

  const consumeGreat = useCallback(() => consumeOneById(BALL_ITEM_IDS.GREAT), [consumeOneById]);
  const consumeUltra = useCallback(() => consumeOneById(BALL_ITEM_IDS.ULTRA), [consumeOneById]);
  const consumeMaster = useCallback(() => consumeOneById(BALL_ITEM_IDS.MASTER), [consumeOneById]);

  return {
    counts: {
      great: greatCount,
      ultra: ultraCount,
      master: masterCount,
    },
    canUse: {
      great: canUseGreat,
      ultra: canUseUltra,
      master: canUseMaster,
    },
    consume: {
      great: consumeGreat,
      ultra: consumeUltra,
      master: consumeMaster,
    },
    refund,
  };
};
