// game/gameTemplate/components/gameUi/components/EventDebugPanel.jsx
import React, { useCallback } from "react";

import {
  toLabel,
  toExpiresLabel,
  parseTileTargetValue,
  parseExpiresValue,
} from "../utils/gameUiUtils";

const EventDebugPanel = ({
  player,

  tileIdOptions,
  tileTypeOptions,
  zoneOptions,
  expiresOptions,

  // controlled form state for THIS player
  debugEventId,
  debugEventTile,
  debugEventZone,
  debugEventExpires,
  debugEventGlobal,

  onChangeDebugEventId,
  onChangeDebugEventTile,
  onChangeDebugEventZone,
  onChangeDebugEventExpires,
  onChangeDebugEventGlobal,

  // actions
  addEventToPlayer,
  addGlobalEventToAllPlayers,
  removeEventFromPlayer,

  setDebugEventIdByPlayer,
}) => {
  const playerEvents = Array.isArray(player?.events) ? player.events : [];

  const onAdd = useCallback(() => {
    const id = String(debugEventId || "").trim();
    if (!id) return;

    const parsed = parseTileTargetValue(debugEventTile);
    if (!parsed) return;

    const expires = parseExpiresValue(debugEventExpires);
    const zone = String(debugEventZone || "").trim() || null;

    const payload = {
      id,
      tile: parsed.tileSpec,
      zone,
      expires,
    };

    if (debugEventGlobal) {
      if (typeof addGlobalEventToAllPlayers !== "function") return;
      addGlobalEventToAllPlayers(payload);
    } else {
      if (typeof addEventToPlayer !== "function") return;
      addEventToPlayer(player.id, payload);
    }

    if (typeof setDebugEventIdByPlayer === "function") {
      setDebugEventIdByPlayer((prev) => ({ ...prev, [player.id]: "" }));
    }
  }, [
    debugEventId,
    debugEventTile,
    debugEventZone,
    debugEventExpires,
    debugEventGlobal,
    addEventToPlayer,
    addGlobalEventToAllPlayers,
    player?.id,
    setDebugEventIdByPlayer,
  ]);

  const onRemove = useCallback(
    (eventId) => {
      if (typeof removeEventFromPlayer !== "function") return;
      if (!eventId) return;

      // removeEventFromPlayer removes global events for everyone automatically
      removeEventFromPlayer(player.id, eventId, { removeAll: true });
    },
    [removeEventFromPlayer, player?.id]
  );

  const canAdd = String(debugEventId || "").trim() && String(debugEventTile || "").trim();

  const addButtonLabel = debugEventGlobal ? "Add Global" : "Add";

  return (
    <>
      {/* DEBUG: Add event to player OR globally */}
      <div className="gameUiPositionRow" style={{ marginTop: 8 }}>
        <span style={{ marginRight: 8 }}>Debug event:</span>

        <input
          type="text"
          value={debugEventId}
          placeholder="Event ID"
          onChange={(e) => onChangeDebugEventId(player.id, e.target.value)}
          style={{ width: 140, marginRight: 8 }}
          aria-label={`Event ID for ${toLabel(player?.name, "Player")}`}
        />

        <select
          value={debugEventZone}
          onChange={(e) => onChangeDebugEventZone(player.id, e.target.value)}
          style={{ marginRight: 8 }}
          aria-label={`Event zone target for ${toLabel(player?.name, "Player")}`}
        >
          <option value="">Zone (optional)...</option>
          {zoneOptions.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>

        <select
          value={debugEventTile}
          onChange={(e) => onChangeDebugEventTile(player.id, e.target.value)}
          style={{ marginRight: 8 }}
          aria-label={`Event tile target for ${toLabel(player?.name, "Player")}`}
        >
          <option value="">Tile ID, type, or zone...</option>

          <optgroup label="Tile IDs">
            {tileIdOptions.map((id) => (
              <option key={`id:${id}`} value={`id:${id}`}>
                {id}
              </option>
            ))}
          </optgroup>

          <optgroup label="Tile Types">
            {tileTypeOptions.map((tp) => (
              <option key={`type:${tp}`} value={`type:${tp}`}>
                {tp}
              </option>
            ))}
          </optgroup>
        </select>

        <select
          value={debugEventExpires}
          onChange={(e) => onChangeDebugEventExpires(player.id, e.target.value)}
          style={{ marginRight: 8 }}
          aria-label={`Event expiry for ${toLabel(player?.name, "Player")}`}
        >
          {expiresOptions.map((opt) => (
            <option key={`exp:${opt.value}`} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, marginRight: 8 }}>
          <input
            type="checkbox"
            checked={!!debugEventGlobal}
            onChange={(e) => onChangeDebugEventGlobal(player.id, e.target.checked)}
            aria-label={`Global event toggle for ${toLabel(player?.name, "Player")}`}
          />
          Global
        </label>

        <button
          type="button"
          className="gameUiBtn"
          onClick={onAdd}
          disabled={!canAdd}
          title={
            debugEventGlobal
              ? "Adds this event to all players as global:true"
              : "Adds to this player only"
          }
        >
          {addButtonLabel}
        </button>
      </div>

      {/* DEBUG: list events */}
      <div className="gameUiPositionRow" style={{ marginTop: 8 }}>
        <div style={{ width: "100%" }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Events ({playerEvents.length})</div>

          {playerEvents.length === 0 ? (
            <div style={{ fontSize: 12, opacity: 0.8 }}>No events</div>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {playerEvents.map((evt, idx) => (
                <div
                  key={`${player.id}-evt-${evt?.id || "evt"}-${evt?.createdAt || idx}-${idx}`}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: 8,
                    padding: "6px 8px",
                  }}
                >
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span>
                      <strong>ID:</strong> {toLabel(evt?.id, "")}
                    </span>
                    <span>
                      <strong>Tile:</strong> {toLabel(evt?.tile, "")}
                    </span>
                    <span>
                      <strong>Zone:</strong> {toLabel(evt?.zone, "")}
                    </span>
                    <span>
                      <strong>Expires:</strong> {toExpiresLabel(evt?.expires)}
                    </span>
                    <span>
                      <strong>Global:</strong> {evt?.global ? "true" : "false"}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="gameUiBtn"
                    onClick={() => onRemove(evt?.id)}
                    title={
                      evt?.global
                        ? "Removes this global event for all players"
                        : "Removes all events with this ID for this player"
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EventDebugPanel;
