import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useActions } from "../../../engine/gameContext/useActions";
import { useGame } from "../../../engine/gameContext/gameContext";
import { randomInt } from "../../../engine/utils/rng/rng";
import { useTurnTransition } from "../../../engine/gameContext/useTurnTransition";

import itemsDex from "../../../assets/gameContent/items.jsx";

import ItemCard from "../../components/itemCard/itemCard";

import "./pokeMart.scss";

const PHASE = Object.freeze({
  REVEAL: "REVEAL", // show the 3 items face-up
  SHUFFLE: "SHUFFLE", // hide + mix animation
  CHOOSE: "CHOOSE", // show face-down, user picks 1
  FINDER_REVEAL_ONE: "FINDER_REVEAL_ONE", // reveal only chosen card, ask keep/switch
  FINDER_SWITCH: "FINDER_SWITCH", // keep revealed card up, let user pick 1 of remaining 2 face-down
  RESULT: "RESULT", // reveal all, show OK
});

const RARITIES = Object.freeze(["Common", "Rare", "Epic", "Legendary"]);

const SLOT_WEIGHTS = Object.freeze([
  { Common: 0, Rare: 50, Epic: 40, Legendary: 10 },
  { Common: 60, Rare: 25, Epic: 10, Legendary: 5 },
  { Common: 70, Rare: 25, Epic: 5, Legendary: 0 },
]);

const ITEM_FINDER_ID = "ITEM7";

const normalizeItemsDex = (maybeDex) => {
  if (Array.isArray(maybeDex)) return maybeDex;
  if (maybeDex && Array.isArray(maybeDex.items)) return maybeDex.items;
  return [];
};

const clampInt = (n, min, max) => Math.max(min, Math.min(max, n));

const pickWeightedKey = (weightsObj) => {
  const entries = Object.entries(weightsObj || {}).filter(([, w]) => (Number(w) || 0) > 0);
  if (entries.length === 0) return null;

  const total = entries.reduce((sum, [, w]) => sum + (Number(w) || 0), 0);
  if (total <= 0) return entries[0][0];

  const rollMax = Math.max(1, Math.floor(total * 1000));
  const roll = randomInt(1, rollMax);

  let acc = 0;
  for (let i = 0; i < entries.length; i += 1) {
    const [key, w] = entries[i];
    acc += Math.floor((Number(w) || 0) * 1000);
    if (roll <= acc) return key;
  }

  return entries[entries.length - 1][0];
};

const shuffleArray = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
};

const pickItemByRarity = (items, rarity, excludedIds) => {
  const ex = excludedIds || new Set();
  const pool = items.filter((it) => it && it.rarity === rarity && !ex.has(it.id));
  if (pool.length > 0) return pool[randomInt(0, pool.length - 1)];

  const poolAny = items.filter((it) => it && !ex.has(it.id));
  if (poolAny.length > 0) return poolAny[randomInt(0, poolAny.length - 1)];

  return null;
};

const buildThreeMartItems = (items) => {
  const all = Array.isArray(items) ? items : [];
  const chosen = [];
  const excluded = new Set();

  for (let slot = 0; slot < 3; slot += 1) {
    const weights = SLOT_WEIGHTS[slot] || SLOT_WEIGHTS[2];
    const rarity = pickWeightedKey(weights);

    let item = null;

    if (rarity && RARITIES.includes(rarity)) {
      item = pickItemByRarity(all, rarity, excluded);
    }

    if (!item) {
      item = pickItemByRarity(all, "Common", excluded);
    }

    if (item) {
      chosen.push(item);
      if (item.id != null) excluded.add(item.id);
    } else {
      chosen.push(null);
    }
  }

  while (chosen.length < 3) chosen.push(null);
  return chosen;
};

const PokeMartAction = () => {
  const { endActiveAction } = useActions();
  const { gameState, addItemToInventory, setGameState } = useGame();

  const activeAction = gameState?.activeAction || null;
  const playerId = activeAction?.playerId || null;
  const actionKey = activeAction?.actionKey || "pokeMart";

  const player = useMemo(() => {
    const players = Array.isArray(gameState?.players) ? gameState.players : [];
    return players.find((p) => p?.id === playerId) || null;
  }, [gameState?.players, playerId]);

  const pokemonCount = useMemo(() => {
    const arr = Array.isArray(player?.pokemon) ? player.pokemon : [];
    return arr.length;
  }, [player?.pokemon]);

  const hasItemFinder = useMemo(() => {
    const inv = Array.isArray(player?.items) ? player.items : [];
    return inv.some((it) => it?.id === ITEM_FINDER_ID);
  }, [player?.items]);

  const items = useMemo(() => normalizeItemsDex(itemsDex), []);
  const [phase, setPhase] = useState(PHASE.REVEAL);

  const [displayItems, setDisplayItems] = useState([null, null, null]);
  const [chosenIndex, setChosenIndex] = useState(null);

  // Item Finder flow: which card was revealed first
  const [revealedIndex, setRevealedIndex] = useState(null);

  const lastActionKeyRef = useRef(null);
  const shuffledItemsRef = useRef(null);

  useEffect(() => {
    if (!actionKey) return;

    if (lastActionKeyRef.current !== actionKey) {
      lastActionKeyRef.current = actionKey;

      const picked = buildThreeMartItems(items);
      setDisplayItems(picked);
      shuffledItemsRef.current = null;

      setChosenIndex(null);
      setRevealedIndex(null);
      setPhase(PHASE.REVEAL);
    }
  }, [actionKey, items]);

  const { endTurn } = useTurnTransition();

  const enterMountWrexo = useCallback(() => {
    if (!playerId) return;

    const martIndices = [4, 22]; // MW05, MW23
    const pick = martIndices[randomInt(0, martIndices.length - 1)];
    const tileNum = pick + 1;
    const tileId = `MW${String(tileNum).padStart(2, "0")}`;

    setGameState((prev) => ({
      ...prev,
      players: (prev.players || []).map((p) => {
        if (p.id !== playerId) return p;
        return {
          ...p,
          climbingMountWrexo: true,
          positionIndexWrexo: pick,
          currentTileIdWrexo: tileId,
        };
      }),
    }));

    // Roll again (same player continues), return to board
    const currentIdx = Number(gameState?.turnIndex) || 0;
    endTurn({
      endingPlayerId: playerId,
      nextTurnIndex: currentIdx,
      clearActiveAction: true,
      suppressAnnouncement: true,
    });
  }, [playerId, setGameState, endTurn, gameState?.turnIndex]);

  const consumeOneItemFinder = useCallback(() => {
    if (!playerId) return;

    setGameState((prev) => {
      const players = Array.isArray(prev?.players) ? prev.players : [];
      const idx = players.findIndex((p) => p?.id === playerId);
      if (idx === -1) return prev;

      const p = players[idx];
      const inv = Array.isArray(p?.items) ? p.items : [];

      const removeAt = inv.findIndex((it) => it?.id === ITEM_FINDER_ID);
      if (removeAt === -1) return prev;

      const nextInv = inv.filter((_, i) => i !== removeAt);

      const nextPlayer = { ...p, items: nextInv };
      const nextPlayers = [...players];
      nextPlayers[idx] = nextPlayer;

      return { ...prev, players: nextPlayers };
    });
  }, [playerId, setGameState]);

  const onContinueToShuffle = useCallback(() => {
    if (phase !== PHASE.REVEAL) return;

    setPhase(PHASE.SHUFFLE);

    const current = Array.isArray(displayItems) ? displayItems : [null, null, null];
    const shuffled = shuffleArray(current);
    shuffledItemsRef.current = shuffled;

    window.setTimeout(() => {
      setDisplayItems(shuffledItemsRef.current || shuffled);
      setPhase(PHASE.CHOOSE);
    }, 900);
  }, [phase, displayItems]);

  const grantItemAndFinish = useCallback(
    (idxToGrant) => {
      if (!playerId) return;

      const safeIdx = clampInt(Number(idxToGrant), 0, 2);
      const item = displayItems?.[safeIdx] || null;
      if (!item) return;

      try {
        addItemToInventory(playerId, item);
      } catch (e) {
        console.error(e);
      }

      setChosenIndex(safeIdx);
      setPhase(PHASE.RESULT);
    },
    [playerId, displayItems, addItemToInventory]
  );

  const onPick = useCallback(
    (idx) => {
      const safeIdx = clampInt(Number(idx), 0, 2);

      // Normal flow: pick grants immediately
      if (phase === PHASE.CHOOSE && !hasItemFinder) {
        grantItemAndFinish(safeIdx);
        return;
      }

      // Item Finder flow: first pick reveals only that card
      if (phase === PHASE.CHOOSE && hasItemFinder) {
        const item = displayItems?.[safeIdx] || null;
        if (!item) return;

        setRevealedIndex(safeIdx);
        setPhase(PHASE.FINDER_REVEAL_ONE);
        return;
      }

      // Item Finder flow: user chose to switch, now picks one of remaining two
      if (phase === PHASE.FINDER_SWITCH && hasItemFinder) {
        if (revealedIndex == null) return;
        if (safeIdx === revealedIndex) return; // cannot pick the revealed one here

        const item = displayItems?.[safeIdx] || null;
        if (!item) return;

        // Consume Item Finder and grant new pick
        consumeOneItemFinder();
        grantItemAndFinish(safeIdx);
      }
    },
    [phase, hasItemFinder, displayItems, revealedIndex, grantItemAndFinish, consumeOneItemFinder]
  );

  const onKeepRevealed = useCallback(() => {
    if (phase !== PHASE.FINDER_REVEAL_ONE) return;
    if (revealedIndex == null) return;

    grantItemAndFinish(revealedIndex);
  }, [phase, revealedIndex, grantItemAndFinish]);

  const onSwitchToOtherTwo = useCallback(() => {
    if (phase !== PHASE.FINDER_REVEAL_ONE) return;
    if (revealedIndex == null) return;

    setPhase(PHASE.FINDER_SWITCH);
  }, [phase, revealedIndex]);

  const isShuffling = phase === PHASE.SHUFFLE;

  const safeItems = useMemo(() => {
    const arr = Array.isArray(displayItems) ? displayItems.slice(0, 3) : [];
    while (arr.length < 3) arr.push(null);
    return arr;
  }, [displayItems]);

  const cardFaceDownForIndex = (i) => {
    // Default face-down in shuffle/choose
    if (phase === PHASE.SHUFFLE || phase === PHASE.CHOOSE) return true;

    // Finder reveal: only the revealed card is face-up
    if (phase === PHASE.FINDER_REVEAL_ONE) return i !== revealedIndex;

    // Finder switch: keep the revealed card face-up, other two face-down
    if (phase === PHASE.FINDER_SWITCH) return i !== revealedIndex;

    // Result: all face-up
    return false;
  };

  const cardDisabledForIndex = (i) => {
    // Clickable in choose
    if (phase === PHASE.CHOOSE) return false;

    // Finder reveal: no card clicks; user uses Keep/Switch buttons
    if (phase === PHASE.FINDER_REVEAL_ONE) return true;

    // Finder switch: only the other two can be clicked
    if (phase === PHASE.FINDER_SWITCH) return i === revealedIndex;

    // Result/shuffle/reveal: not clickable
    return true;
  };

  return (
    <div className="pokeMartRoot">
      <h1>Poke Mart</h1>

      <p className="pokeMartSubtitle">
        {phase === PHASE.REVEAL ? "Three items are on offer..." : null}
        {phase === PHASE.SHUFFLE ? "Shuffling..." : null}
        {phase === PHASE.CHOOSE ? "Pick one." : null}
        {phase === PHASE.FINDER_REVEAL_ONE
          ? "Item Finder: one card revealed. Keep it or switch?"
          : null}
        {phase === PHASE.FINDER_SWITCH ? "Pick one of the remaining two face-down cards." : null}
        {phase === PHASE.RESULT ? "Here is what you could have won." : null}
      </p>

      <div className={"pokeMartCards" + (isShuffling ? " shuffling" : "")}>
        {safeItems.map((it, i) => {
          const isChosen = chosenIndex === i;
          const isNotChosen = chosenIndex != null && chosenIndex !== i;

          const faceDown = cardFaceDownForIndex(i);

          const clickable =
            phase === PHASE.CHOOSE || (phase === PHASE.FINDER_SWITCH && i !== revealedIndex);

          return (
            <div
              key={it?.id ? `${it.id}-${i}` : `slot-${i}`}
              className={
                "pokeMartCardSlot" + (isChosen ? " chosen" : "") + (isNotChosen ? " notChosen" : "")
              }
            >
              <ItemCard
                item={it}
                faceDown={faceDown}
                selected={phase === PHASE.RESULT && chosenIndex === i}
                disabled={cardDisabledForIndex(i)}
                onClick={clickable ? () => onPick(i) : null}
              />
            </div>
          );
        })}
      </div>

      <div className="pokeMartFooter">
        {phase === PHASE.REVEAL ? (
          <>
            {pokemonCount >= 3 ? (
              <button type="button" onClick={enterMountWrexo} className="secondary">
                Climb Mount Wrexo
              </button>
            ) : null}

            <button
              type="button"
              onClick={onContinueToShuffle}
              disabled={!displayItems?.some(Boolean)}
            >
              Continue
            </button>
          </>
        ) : null}

        {phase === PHASE.FINDER_REVEAL_ONE ? (
          <>
            <button type="button" onClick={onKeepRevealed}>
              Keep
            </button>
            <button type="button" onClick={onSwitchToOtherTwo}>
              Switch
            </button>
          </>
        ) : null}

        {phase === PHASE.RESULT ? (
          <button type="button" onClick={endActiveAction}>
            Ok
          </button>
        ) : null}

        {phase === PHASE.SHUFFLE ||
        phase === PHASE.CHOOSE ||
        phase === PHASE.FINDER_REVEAL_ONE ||
        phase === PHASE.FINDER_SWITCH ? (
          <button type="button" onClick={endActiveAction} className="secondary">
            Back to Board
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default PokeMartAction;
