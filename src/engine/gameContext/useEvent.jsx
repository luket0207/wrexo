// engine/gameContext/useEvent.jsx
import { useCallback } from "react";

const toIntOrNull = (v) => {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const toBool = (v) => !!v;

const normalizeEvent = (evt, overrides = {}) => {
  if (!evt || typeof evt !== "object") {
    throw new Error("useEvents: event must be an object");
  }

  const id = String(evt.id || evt.ID || "").trim();
  if (!id) throw new Error("useEvents: event.id is required");

  const tile = evt.tile ?? null;
  const zone = evt.zone ?? evt.zoneId ?? evt.zoneCode ?? null;
  const expires = toIntOrNull(evt.expires);

  const createdAt =
    typeof overrides.createdAt === "number"
      ? overrides.createdAt
      : typeof evt.createdAt === "number"
        ? evt.createdAt
        : Date.now();

  const global = typeof overrides.global === "boolean" ? overrides.global : toBool(evt.global);

  return {
    id,
    tile,
    zone,
    expires, // null or number
    global, // boolean
    createdAt,
    // Key used to keep global events synchronized across players
    globalKey: `${id}::${createdAt}`,
    meta: evt.meta && typeof evt.meta === "object" ? evt.meta : null,
  };
};

// tileSpec supports:
// - string: matches tileId OR tileType
// - object: matches { id/tileId } OR { type/tileType }
const matchesTile = (tileSpec, tileId, tileType) => {
  if (tileSpec == null) return true;

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

const updatePlayerById = (prevState, playerId, updater) => {
  const players = Array.isArray(prevState?.players) ? prevState.players : [];
  const idx = players.findIndex((p) => p?.id === playerId);
  if (idx === -1) return prevState;

  const player = players[idx];
  const nextPlayer = updater(player);
  if (!nextPlayer) return prevState;

  const nextPlayers = [...players];
  nextPlayers[idx] = nextPlayer;

  return { ...prevState, players: nextPlayers };
};

const ensureEventsArray = (player) => (Array.isArray(player?.events) ? player.events : []);

const useEvents = ({ setGameState }) => {
  if (typeof setGameState !== "function") {
    throw new Error("useEvents: setGameState must be provided");
  }

  const addEventToPlayer = useCallback(
    (playerId, eventInput) => {
      if (!playerId) throw new Error("addEventToPlayer: playerId is required");

      let result = { ok: false, reason: "unknown" };
      const evt = normalizeEvent(eventInput, { global: false });

      setGameState((prev) => {
        const next = updatePlayerById(prev, playerId, (player) => {
          const events = ensureEventsArray(player);
          return { ...player, events: [...events, evt] };
        });

        if (next === prev) {
          result = { ok: false, reason: "player_not_found" };
          return prev;
        }

        result = { ok: true, event: evt };
        return next;
      });

      return result;
    },
    [setGameState]
  );

  // NEW: add one global event to ALL players
  const addGlobalEventToAllPlayers = useCallback(
    (eventInput) => {
      let result = { ok: false, reason: "unknown" };
      const createdAt = Date.now();
      const evt = normalizeEvent(eventInput, { global: true, createdAt });

      setGameState((prev) => {
        const players = Array.isArray(prev?.players) ? prev.players : [];
        if (players.length === 0) {
          result = { ok: false, reason: "no_players" };
          return prev;
        }

        const nextPlayers = players.map((p) => {
          const events = ensureEventsArray(p);
          return { ...p, events: [...events, evt] };
        });

        result = { ok: true, event: evt };
        return { ...prev, players: nextPlayers };
      });

      return result;
    },
    [setGameState]
  );

  const removeEventFromPlayer = useCallback(
    (playerId, eventId, opts = {}) => {
      const { removeAll = true } = opts || {};
      if (!playerId) throw new Error("removeEventFromPlayer: playerId is required");
      if (!eventId) throw new Error("removeEventFromPlayer: eventId is required");

      const id = String(eventId).trim();
      let removedCount = 0;
      let removedGlobalKeys = new Set();

      setGameState((prev) => {
        const players = Array.isArray(prev?.players) ? prev.players : [];

        // First, detect if the event being removed is global (and capture its globalKey(s))
        const activePlayer = players.find((p) => p?.id === playerId) || null;
        const activeEvents = ensureEventsArray(activePlayer);
        const matching = activeEvents.filter((e) => e?.id === id);

        const isGlobal = matching.some((e) => !!e?.global);
        if (isGlobal) {
          matching.forEach((e) => {
            if (e?.globalKey) removedGlobalKeys.add(e.globalKey);
          });
          if (removedGlobalKeys.size === 0) {
            // fallback: remove by id if key missing
            removedGlobalKeys.add(`${id}::`);
          }
        }

        const nextPlayers = players.map((p) => {
          const events = ensureEventsArray(p);
          if (events.length === 0) return p;

          // If global: remove matching globalKey(s) for everyone
          if (isGlobal) {
            const nextEvents = events.filter((e) => {
              if (!e) return false;

              if (e.id !== id) return true;

              // Prefer exact key match when present
              if (e.globalKey && removedGlobalKeys.has(e.globalKey)) return false;

              // Fallback: if we didn't have keys, remove by id when global:true
              if (!e.globalKey && e.global) return false;

              return true;
            });

            removedCount += events.length - nextEvents.length;
            return nextEvents.length !== events.length ? { ...p, events: nextEvents } : p;
          }

          // Non-global: remove only on the given player
          if (p.id !== playerId) return p;

          if (removeAll) {
            const nextEvents = events.filter((e) => e?.id !== id);
            removedCount += events.length - nextEvents.length;
            return nextEvents.length !== events.length ? { ...p, events: nextEvents } : p;
          }

          const idx = events.findIndex((e) => e?.id === id);
          if (idx === -1) return p;
          removedCount += 1;

          const nextEvents = events.filter((_, i) => i !== idx);
          return { ...p, events: nextEvents };
        });

        return { ...prev, players: nextPlayers };
      });

      return { ok: true, removedCount };
    },
    [setGameState]
  );

  const matchesZone = (zoneSpec, zoneId) => {
    if (zoneSpec == null) return true; // no zone constraint means "any zone"
    const zoneStr = zoneId == null ? "" : String(zoneId);

    if (typeof zoneSpec === "string") {
      const spec = zoneSpec.trim();
      if (!spec) return false;
      return spec === zoneStr;
    }

    if (typeof zoneSpec === "object") {
      const specCode =
        zoneSpec.code ?? zoneSpec.zone ?? zoneSpec.zoneCode ?? zoneSpec.zoneId ?? null;
      if (specCode == null) return false;
      return String(specCode) === zoneStr;
    }

    return false;
  };

  const triggerEventsForLanding = useCallback(
    ({ playerId, tileId, tileType, zoneId }) => {
      if (!playerId) throw new Error("triggerEventsForLanding: playerId is required");

      const landedZoneId = zoneId == null ? "" : String(zoneId).trim();

      let triggered = [];

      setGameState((prev) => {
        const next = updatePlayerById(prev, playerId, (player) => {
          const events = ensureEventsArray(player);
          if (events.length === 0) return player;

          const keep = [];
          const hit = [];

          for (let i = 0; i < events.length; i += 1) {
            const evt = events[i];

            const tileOk = !!evt && matchesTile(evt.tile, tileId, tileType);
            const zoneOk = !!evt && matchesZone(evt.zone, landedZoneId);

            if (evt && tileOk && zoneOk) {
              hit.push(evt);
            } else {
              keep.push(evt);
            }
          }

          triggered = hit;

          if (hit.length === 0) return player;
          return { ...player, events: keep };
        });

        return next;
      });

      return { ok: true, triggered };
    },
    [setGameState]
  );

  // FIXED: ticks individual events for playerId, and ticks global events for ALL players once
  const tickEventsEndTurn = useCallback(
    (playerId) => {
      if (!playerId) throw new Error("tickEventsEndTurn: playerId is required");

      let expired = [];

      setGameState((prev) => {
        const players = Array.isArray(prev?.players) ? prev.players : [];
        if (players.length === 0) return prev;

        const activePlayer = players.find((p) => p?.id === playerId) || null;
        const activeEvents = ensureEventsArray(activePlayer);

        // Determine which global events should tick this turn (based on active player's global events)
        const globalKeysToTick = new Set(
          activeEvents
            .filter((e) => e && e.global && e.expires != null && typeof e.globalKey === "string")
            .map((e) => e.globalKey)
        );

        const nextPlayers = players.map((p) => {
          const events = ensureEventsArray(p);
          if (events.length === 0) return p;

          const nextEvents = [];
          const expiredNow = [];

          for (let i = 0; i < events.length; i += 1) {
            const evt = events[i];
            if (!evt) continue;

            // no expiry => keep
            if (evt.expires == null) {
              nextEvents.push(evt);
              continue;
            }

            const shouldTick =
              (evt.global && evt.globalKey && globalKeysToTick.has(evt.globalKey)) ||
              (!evt.global && p.id === playerId);

            if (!shouldTick) {
              nextEvents.push(evt);
              continue;
            }

            const nextExpires = Number(evt.expires) - 1;

            if (nextExpires <= 0) {
              expiredNow.push(evt);
            } else {
              nextEvents.push({ ...evt, expires: nextExpires });
            }
          }

          if (expiredNow.length > 0) expired.push(...expiredNow);

          // Only create a new object if something changed
          const sameLength = nextEvents.length === events.length;
          let sameRefs = sameLength;
          if (sameRefs) {
            for (let i = 0; i < events.length; i += 1) {
              if (events[i] !== nextEvents[i]) {
                sameRefs = false;
                break;
              }
            }
          }

          return sameRefs ? p : { ...p, events: nextEvents };
        });

        return { ...prev, players: nextPlayers };
      });

      return { ok: true, expired };
    },
    [setGameState]
  );

  return {
    addEventToPlayer,
    addGlobalEventToAllPlayers,
    removeEventFromPlayer,
    triggerEventsForLanding,
    tickEventsEndTurn,
  };
};

export default useEvents;
