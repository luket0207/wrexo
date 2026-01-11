// game/actions/pokemonEncounter/hooks/useEncounterSelection.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { randomInt } from "../../../../engine/utils/rng/rng";

const ZONE_TYPE_POOLS = Object.freeze({
  HC: ["Water", "Fire", "Lightning"],
  EE: ["Grass", "Lightning", "Colourless"],
  F: ["Grass", "Psychic", "Colourless"],
  B: ["Fire", "Fighting", "Water"],
  E: ["Grass", "Water", "Fighting"],
  D: ["Psychic", "Fighting", "Colourless"],
});

const GRASS_RARITY_MATRIX = Object.freeze({
  1: { Common: 75, Rare: 22.5, Epic: 2.3, Legendary: 0.2 },
  2: { Common: 65, Rare: 27.5, Epic: 5, Legendary: 2.5 },
  3: { Common: 52, Rare: 33, Epic: 12, Legendary: 3 },
  4: { Common: 43, Rare: 30, Epic: 20, Legendary: 7 },
});

const FEATURE_RARITY_MATRIX = Object.freeze({
  1: { Common: 65, Rare: 27.5, Epic: 5, Legendary: 2.5 },
  2: { Common: 52, Rare: 33, Epic: 12, Legendary: 3 },
  3: { Common: 43, Rare: 30, Epic: 20, Legendary: 7 },
  4: { Common: 35.5, Rare: 27.5, Epic: 25, Legendary: 12 },
});

const RARITIES = Object.freeze(["Common", "Rare", "Epic", "Legendary"]);

const normalizePokemonDex = (maybeDex) => {
  if (Array.isArray(maybeDex)) return maybeDex;
  if (maybeDex && Array.isArray(maybeDex.pokemon)) return maybeDex.pokemon;
  return [];
};

const clampLevelToMatrix = (n) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return 1;
  if (x <= 1) return 1;
  if (x >= 4) return 4;
  return Math.round(x);
};

const pickWeightedKey = (weightsObj) => {
  const entries = Object.entries(weightsObj || {});
  if (entries.length === 0) return null;

  const total = entries.reduce((sum, [, w]) => sum + (Number(w) || 0), 0);
  if (total <= 0) return entries[0][0];

  const roll = randomInt(1, Math.max(1, Math.floor(total * 1000)));
  let acc = 0;

  for (let i = 0; i < entries.length; i += 1) {
    const [key, w] = entries[i];
    acc += Math.floor((Number(w) || 0) * 1000);
    if (roll <= acc) return key;
  }

  return entries[entries.length - 1]?.[0] || null;
};

const isValidRarity = (r) => RARITIES.includes(r);

const matchesTile = (tileSpec, tileId, tileType) => {
  if (tileSpec == null) return false;

  const idStr = tileId == null ? "" : String(tileId);
  const typeStr = tileType == null ? "" : String(tileType);

  if (typeof tileSpec === "string") {
    const spec = tileSpec.trim();
    if (!spec) return false;
    return spec === idStr || spec === typeStr;
  }

  if (typeof tileSpec === "object") {
    const specId = tileSpec.id ?? tileSpec.tileId ?? null;
    const specType = tileSpec.type ?? tileSpec.tileType ?? null;

    if (specId != null && String(specId) === idStr) return true;
    if (specType != null && String(specType) === typeStr) return true;
    return false;
  }

  return false;
};

// FORCE<POKEMON_ID>, but NOT FORCERARITY...
// Accept separators like FORCE:BU04, FORCE_BU04, FORCE-BU04, FORCE BU04
const parseForcePokemonEvent = (id) => {
  const raw = String(id || "").trim();
  if (!raw.toUpperCase().startsWith("FORCE")) return null;
  if (raw.toUpperCase().startsWith("FORCERARITY")) return null;

  // Strip prefix + optional separators
  const rest = raw
    .slice(5)
    .replace(/^[:\-_ ]+/, "")
    .trim();
  if (!rest) return null;

  // Normalize to a clean ID token (alphanumeric only), uppercase
  const forcedId = rest.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (!forcedId) return null;

  return { kind: "FORCE_POKEMON_ID", forcedId, rawId: raw };
};

const parseForceRarityEvent = (id) => {
  const raw = String(id || "").trim();
  if (!raw.startsWith("FORCERARITY")) return null;

  const rarity = raw.slice("FORCERARITY".length).trim();
  if (!isValidRarity(rarity)) return null;

  return { kind: "FORCE_RARITY", rarity, rawId: raw };
};

// DECREASERARITYC100R50E25
// INCREASERARITYC25R10
// (Also support legacy REDUCERARITY... for compatibility)
const parseMultiAdjustRarityEvent = (id) => {
  const raw = String(id || "").trim();

  const isDecrease = raw.startsWith("DECREASERARITY") || raw.startsWith("REDUCERARITY");
  const isIncrease = raw.startsWith("INCREASERARITY");

  if (!isDecrease && !isIncrease) return null;

  const prefix = isIncrease
    ? "INCREASERARITY"
    : raw.startsWith("DECREASERARITY")
      ? "DECREASERARITY"
      : "REDUCERARITY";

  const rest = raw.slice(prefix.length).trim();
  if (!rest) return null;

  const mapLetterToRarity = (ch) => {
    if (ch === "C") return "Common";
    if (ch === "R") return "Rare";
    if (ch === "E") return "Epic";
    if (ch === "L") return "Legendary";
    return null;
  };

  const adjustments = [];
  let i = 0;

  while (i < rest.length) {
    const ch = rest[i];
    const rarity = mapLetterToRarity(ch);
    if (!rarity) return null;
    i += 1;

    let numStr = "";
    while (i < rest.length) {
      const c = rest[i];
      if (c >= "0" && c <= "9") {
        numStr += c;
        i += 1;
      } else {
        break;
      }
    }

    if (!numStr) return null;

    const pct = Number(numStr);
    if (!Number.isFinite(pct)) return null;

    adjustments.push({ rarity, pct: Math.max(0, Math.min(100, pct)) });
  }

  if (adjustments.length === 0) return null;

  return {
    kind: isIncrease ? "INCREASE_MULTI" : "DECREASE_MULTI",
    adjustments,
    rawId: raw,
  };
};

const clampInt = (n, min, max) => Math.max(min, Math.min(max, n));

// INCREASECATCH
// DECREASECATCH
const parseCatchAdjustEvent = (id) => {
  const raw = String(id || "").trim();
  if (raw === "INCREASECATCH") return { kind: "INCREASE_CATCH", rawId: raw };
  if (raw === "DECREASECATCH") return { kind: "DECREASE_CATCH", rawId: raw };
  return null;
};

const applyCatchAdjustToEncounter = (encounter, incCount, decCount) => {
  if (!encounter || typeof encounter !== "object") return encounter;

  const base = Number(encounter.catchRate);
  const safeBase = Number.isFinite(base) ? base : 1;

  // Net delta, but clamp final to 1..5 (6 cannot be achieved this way)
  const delta = (Number(incCount) || 0) - (Number(decCount) || 0);

  if (delta === 0) return encounter;

  const nextCatchRate = clampInt(Math.round(safeBase + delta), 1, 5);

  // Avoid pointless cloning if unchanged
  if (nextCatchRate === safeBase) return encounter;

  return { ...encounter, catchRate: nextCatchRate };
};

const applyMultiAdjustWeights = (weights, decreaseAdjustments, increaseAdjustments) => {
  const next = { ...(weights || {}) };

  const baseTotal = RARITIES.reduce((sum, k) => sum + (Number(next[k]) || 0), 0);
  if (baseTotal <= 0) return next;

  const applyOne = (rarity, pct, dir) => {
    if (!isValidRarity(rarity)) return;

    const w = Number(next[rarity]) || 0;
    const delta = (w * (Number(pct) || 0)) / 100;

    if (dir === "decrease") next[rarity] = Math.max(0, w - delta);
    else next[rarity] = w + delta;
  };

  (decreaseAdjustments || []).forEach((a) => applyOne(a.rarity, a.pct, "decrease"));
  (increaseAdjustments || []).forEach((a) => applyOne(a.rarity, a.pct, "increase"));

  // Renormalize to same total so distribution stays a "probability-like" set
  const newTotal = RARITIES.reduce((sum, k) => sum + (Number(next[k]) || 0), 0);
  if (newTotal <= 0) return { ...weights };

  const scale = baseTotal / newTotal;
  RARITIES.forEach((k) => {
    next[k] = (Number(next[k]) || 0) * scale;
  });

  return next;
};

const chooseEncounterPokemon = ({
  playerLevel,
  zoneId,
  locationType,
  dex,
  forcedPokemonId = null,
  forcedRarity = null,
  decreaseAdjustments = [],
  increaseAdjustments = [],
}) => {
  // FORCE BY POKEMON ID
  if (forcedPokemonId) {
    const targetId = String(forcedPokemonId).trim().toUpperCase();

    const matches = dex.filter((p) => {
      const pid = p && p.id != null ? String(p.id).trim().toUpperCase() : "";
      return pid === targetId;
    });

    if (matches.length > 0) return matches[randomInt(0, matches.length - 1)];
  }

  const zoneKey = ZONE_TYPE_POOLS[zoneId] ? zoneId : "EE";
  const typePool = ZONE_TYPE_POOLS[zoneKey] || ZONE_TYPE_POOLS.EE;

  const levelKey = clampLevelToMatrix(playerLevel);
  const isFeature = String(locationType || "grass").toLowerCase() === "feature";
  const matrix = isFeature ? FEATURE_RARITY_MATRIX : GRASS_RARITY_MATRIX;
  const baseWeights = matrix[levelKey] || matrix[1];

  const adjustedWeights = applyMultiAdjustWeights(
    baseWeights,
    decreaseAdjustments,
    increaseAdjustments
  );

  const rarityChoice = isValidRarity(forcedRarity)
    ? forcedRarity
    : pickWeightedKey(adjustedWeights);

  const pooledByRarity = dex.filter(
    (p) => p && p.rarity === rarityChoice && typePool.includes(p.type)
  );
  if (pooledByRarity.length > 0) return pooledByRarity[randomInt(0, pooledByRarity.length - 1)];

  const pooledAnyRarity = dex.filter((p) => p && typePool.includes(p.type));
  if (pooledAnyRarity.length > 0) return pooledAnyRarity[randomInt(0, pooledAnyRarity.length - 1)];

  if (dex.length > 0) return dex[randomInt(0, dex.length - 1)];
  return null;
};

export const useEncounterSelection = ({
  pokemonDex,
  player,
  zoneId,
  locationType,
  tileId,
  tileType,
  actionKey,
  removeEventFromPlayer,
}) => {
  const dex = useMemo(() => normalizePokemonDex(pokemonDex), [pokemonDex]);
  const [encounter, setEncounter] = useState(null);

  const lastKeyRef = useRef(null);
  const selectedForActionKeyRef = useRef(null);

  const eventsKey = useMemo(() => {
    const evts = Array.isArray(player?.events) ? player.events : [];
    return evts.map((e) => e?.globalKey || e?.id || "").join("|");
  }, [player?.events]);

  useEffect(() => {
    if (!actionKey) return;

    const compositeKey = `${actionKey}::${eventsKey}`;
    if (lastKeyRef.current === compositeKey) return;
    lastKeyRef.current = compositeKey;

    const allEvents = Array.isArray(player?.events) ? player.events : [];

    // Events that apply to THIS landing tile
    // If event.tile is null/undefined => treat as "applies anywhere" (e.g., next encounter)
    const applicable = allEvents.filter((e) => {
      const tileSpec = e?.tile ?? null;
      if (tileSpec == null) return true;
      return matchesTile(tileSpec, tileId, tileType);
    });

    console.log("[EncounterSelection] actionKey:", actionKey, {
      playerId: player?.id,
      eventIds: (Array.isArray(player?.events) ? player.events : []).map((e) => e?.id),
    });

    const forcePokemonEvt =
      applicable.map((e) => parseForcePokemonEvent(e?.id)).find(Boolean) || null;
    const forceRarityEvt =
      applicable.map((e) => parseForceRarityEvent(e?.id)).find(Boolean) || null;
    const adjEvt = applicable.map((e) => parseMultiAdjustRarityEvent(e?.id)).find(Boolean) || null;

    if (forcePokemonEvt) {
      const dexIdsSample = dex.slice(0, 20).map((p) => String(p?.id || "").trim());
      console.log("[FORCE DEBUG]", {
        rawEventId: forcePokemonEvt.rawId,
        forcedId: forcePokemonEvt.forcedId,
        tileId,
        tileType,
        dexCount: dex.length,
        dexIdsSample,
      });
    }

    const forcedPokemonId = forcePokemonEvt?.forcedId || null;
    const forcedRarity = forceRarityEvt?.rarity || null;

    const decreaseAdjustments =
      adjEvt && adjEvt.kind === "DECREASE_MULTI" ? adjEvt.adjustments || [] : [];
    const increaseAdjustments =
      adjEvt && adjEvt.kind === "INCREASE_MULTI" ? adjEvt.adjustments || [] : [];

    const nextBase = chooseEncounterPokemon({
      playerLevel: player?.level || 1,
      zoneId,
      locationType,
      dex,
      forcedPokemonId,
      forcedRarity,
      decreaseAdjustments,
      increaseAdjustments,
    });

    console.log("[EncounterSelection] base choice:", nextBase?.id, {
      actionKey,
      playerId: player?.id,
      reason: "after chooseEncounterPokemon (before FORCE/catch adjust)",
    });

    // CATCH ADJUST EVENTS (tile-applicable only)
    const catchAdjustEvts = applicable.map((e) => parseCatchAdjustEvent(e?.id)).filter(Boolean);

    const hasDirective =
      !!forcePokemonEvt ||
      !!forceRarityEvt ||
      !!adjEvt ||
      (catchAdjustEvts && catchAdjustEvts.length > 0);

    // If we've already selected an encounter for this actionKey,
    // do not overwrite it on reruns unless there's a directive to apply.
    // This prevents "consume event -> rerun -> overwrite forced encounter".
    if (selectedForActionKeyRef.current === actionKey && !hasDirective) {
      return;
    }

    const incCount = catchAdjustEvts.filter((e) => e.kind === "INCREASE_CATCH").length;
    const decCount = catchAdjustEvts.filter((e) => e.kind === "DECREASE_CATCH").length;

    const next = applyCatchAdjustToEncounter(nextBase, incCount, decCount);

    console.log("[EncounterSelection] final choice:", next?.id, {
      forcedId: forcePokemonEvt?.forcedId || null,
      hadForce: !!forcePokemonEvt,
      incCount,
      decCount,
      actionKey,
    });

    console.log("[EncounterSelection] setEncounter:", next?.id, {
      actionKey,
      willConsumeForce: !!forcePokemonEvt,
    });

    setEncounter(next);
    selectedForActionKeyRef.current = actionKey;

    // Consume events after applying.
    // removeEventFromPlayer should remove globally for all players if the event is global.
    if (player?.id && typeof removeEventFromPlayer === "function") {
      if (forcePokemonEvt)
        removeEventFromPlayer(player.id, forcePokemonEvt.rawId, { removeAll: false });
      if (forceRarityEvt)
        removeEventFromPlayer(player.id, forceRarityEvt.rawId, { removeAll: false });
      if (adjEvt) removeEventFromPlayer(player.id, adjEvt.rawId, { removeAll: false });

      // Remove each catch adjust event instance (one-by-one)
      for (let i = 0; i < catchAdjustEvts.length; i += 1) {
        removeEventFromPlayer(player.id, catchAdjustEvts[i].rawId, { removeAll: false });
      }
    }
  }, [
    actionKey,
    eventsKey,
    player?.id,
    player?.level,
    zoneId,
    locationType,
    tileId,
    tileType,
    dex,
    removeEventFromPlayer,
  ]);

  return { encounter };
};
