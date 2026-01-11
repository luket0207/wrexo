// game/gameTemplate/components/gameUi/components/PlayerCard.jsx
import React, { useCallback, useMemo } from "react";

import Bars from "../../../../../engine/ui/bars/bars";
import EventDebugPanel from "./eventDebugPanel";

import { makeSlots, toLabel, toNumberSafe } from "../utils/gameUiUtils";

const PlayerCard = ({
  player,
  isActive,
  activePlayerId,

  items,
  pendingDecision,

  selectedItemId,
  onSelectDebugItem,
  onGiveDebugItem,

  replaceIndexValue,
  onSetReplaceIndex,
  onConfirmReplace,
  onConfirmDiscard,
  onCancelDecision,

  tileIdOptions,
  tileTypeOptions,
  expiresOptions,

  zoneOptions,
  debugEventZone,
  onChangeDebugEventZone,

  debugEventId,
  debugEventTile,
  debugEventExpires,
  debugEventGlobal,

  onChangeDebugEventId,
  onChangeDebugEventTile,
  onChangeDebugEventExpires,
  onChangeDebugEventGlobal,

  addEventToPlayer,
  addGlobalEventToAllPlayers,
  removeEventFromPlayer,
  setDebugEventIdByPlayer,
}) => {
  const pokemonSlots = useMemo(
    () => makeSlots(3).map((_, i) => player.pokemon?.[i] || null),
    [player]
  );
  const itemLimit = Number(player.itemLimit) || 6;
  const itemSlots = useMemo(
    () => makeSlots(itemLimit).map((_, i) => player.items?.[i] || null),
    [player, itemLimit]
  );

  const decisionForThisPlayer = pendingDecision && pendingDecision.playerId === player.id;
  const existingItems = Array.isArray(player.items) ? player.items.slice(0, itemLimit) : [];

  const onGive = useCallback(() => onGiveDebugItem(player.id), [onGiveDebugItem, player.id]);

  return (
    <div className={`gameUiPlayerCard ${isActive ? "is-active" : ""}`}>
      <div className="gameUiPlayerCardHeader">
        <div className="gameUiPlayerCardNameRow">
          <span className="gameUiSwatch" style={{ backgroundColor: player.color }} />
          <span className="gameUiPlayerCardName">{toLabel(player.name, "Player")}</span>
          <span className="gameUiPlayerCardLevel">Level {toNumberSafe(player.level, 1)}</span>
          {player.id === activePlayerId ? <span className="gameUiTurnBadge">Your turn</span> : null}
        </div>

        <div className="gameUiPositionRow">
          Tile: <strong>{toLabel(player.currentTileId, "")}</strong>
        </div>

        {/* DEBUG: Add item to player */}
        <div className="gameUiPositionRow">
          <span style={{ marginRight: 8 }}>Debug item:</span>
          <select
            value={selectedItemId}
            onChange={(e) => onSelectDebugItem(player.id, e.target.value)}
            aria-label={`Select debug item for ${toLabel(player.name, "Player")}`}
          >
            <option value="">Select item...</option>
            {items.map((it) => (
              <option key={it.id} value={it.id}>
                {it.name} ({it.rarity})
              </option>
            ))}
          </select>

          <button
            type="button"
            className="gameUiBtn"
            style={{ marginLeft: 8 }}
            onClick={onGive}
            disabled={!selectedItemId}
          >
            Give
          </button>
        </div>

        <EventDebugPanel
          player={player}
          tileIdOptions={tileIdOptions}
          tileTypeOptions={tileTypeOptions}
          zoneOptions={zoneOptions}
          expiresOptions={expiresOptions}
          debugEventId={debugEventId}
          debugEventTile={debugEventTile}
          debugEventExpires={debugEventExpires}
          debugEventGlobal={debugEventGlobal}
          debugEventZone={debugEventZone}
          onChangeDebugEventZone={onChangeDebugEventZone}
          onChangeDebugEventId={onChangeDebugEventId}
          onChangeDebugEventTile={onChangeDebugEventTile}
          onChangeDebugEventExpires={onChangeDebugEventExpires}
          onChangeDebugEventGlobal={onChangeDebugEventGlobal}
          addEventToPlayer={addEventToPlayer}
          addGlobalEventToAllPlayers={addGlobalEventToAllPlayers}
          removeEventFromPlayer={removeEventFromPlayer}
          setDebugEventIdByPlayer={setDebugEventIdByPlayer}
        />
      </div>

      <div className="gameUiSection">
        <div className="gameUiSectionTitle">Pokemon</div>
        <div className="gameUiSlots">
          {pokemonSlots.map((mon, idx) => {
            const name = mon ? toLabel(mon.name, "Pokemon") : "Empty";
            const maxHealth = mon ? toNumberSafe(mon.maxHealth ?? mon.health ?? 0, 0) : 0;
            const currentHealth = mon ? toNumberSafe(mon.health ?? 0, 0) : 0;

            return (
              <div
                key={`${player.id}-mon-${idx}`}
                className={`gameUiSlot ${mon ? "has-value" : ""}`}
              >
                {name}
                {mon ? <Bars min={0} max={maxHealth} current={currentHealth} /> : null}
              </div>
            );
          })}
        </div>
      </div>

      {isActive ? (
        <div className="gameUiSection">
          <div className="gameUiSectionTitle">Items</div>

          {decisionForThisPlayer ? (
            <div style={{ marginBottom: 12 }}>
              <div style={{ marginBottom: 6 }}>
                <strong>Inventory full.</strong> You tried to add:{" "}
                <strong>{toLabel(pendingDecision?.item?.name, "Item")}</strong>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <label>
                  Replace slot:
                  <select
                    value={replaceIndexValue}
                    onChange={(e) => onSetReplaceIndex(player.id, Number(e.target.value))}
                    style={{ marginLeft: 8 }}
                    aria-label="Replace which item slot"
                  >
                    {existingItems.map((it, idx2) => (
                      <option key={`${player.id}-replace-${idx2}`} value={idx2}>
                        Slot {idx2 + 1}: {toLabel(it?.name ?? it, "Item")}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  className="gameUiBtn"
                  onClick={() => onConfirmReplace(player.id)}
                >
                  Replace
                </button>

                <button type="button" className="gameUiBtn" onClick={onConfirmDiscard}>
                  Discard new item
                </button>

                <button type="button" className="gameUiBtn" onClick={onCancelDecision}>
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          <div className="gameUiSlots gameUiSlots--items">
            {itemSlots.map((it, idx2) => (
              <div
                key={`${player.id}-item-${idx2}`}
                className={`gameUiSlot ${it ? "has-value" : ""}`}
              >
                {it ? toLabel(it.name ?? it, "Item") : "Empty"}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PlayerCard;
