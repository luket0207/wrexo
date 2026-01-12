// game/gameTemplate/components/gameUi.jsx
import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import "./gameUi.scss";

import { useGame } from "../../../engine/gameContext/gameContext";

import itemsCatalog from "../../../assets/gameContent/items.jsx";
import TILES, { TILE_TYPES, ZONES } from "../../../assets/gameContent/tiles.jsx";

import PlayerCard from "./gameUi/components/playerCard";
import {
  normalizeTilesArray,
  getTileTypeOptions,
  buildExpiresOptions,
  computeSafeTurnIndex,
} from "./gameUi/utils/gameUiUtils";

const GameUi = ({ onNewGame }) => {
  const {
    gameState,
    addItemToInventory,
    resolvePendingItemDecision,
    clearPendingItemDecision,

    addEventToPlayer,
    addGlobalEventToAllPlayers,
    removeEventFromPlayer,
  } = useGame();

  const [debugSelectedItemByPlayer, setDebugSelectedItemByPlayer] = useState({});
  const [replaceIndexByPlayer, setReplaceIndexByPlayer] = useState({});

  const zoneOptions = useMemo(() => Object.keys(ZONES || {}), []);

  const [debugEventIdByPlayer, setDebugEventIdByPlayer] = useState({});
  const [debugEventTileByPlayer, setDebugEventTileByPlayer] = useState({});
  const [debugEventExpiresByPlayer, setDebugEventExpiresByPlayer] = useState({});
  const [debugEventGlobalByPlayer, setDebugEventGlobalByPlayer] = useState({});
  const [debugEventZoneByPlayer, setDebugEventZoneByPlayer] = useState({});

  const items = useMemo(() => (Array.isArray(itemsCatalog) ? itemsCatalog : []), []);
  const tiles = useMemo(() => normalizeTilesArray(TILES), []);
  const tileTypeOptions = useMemo(() => getTileTypeOptions(TILE_TYPES), []);
  const tileIdOptions = useMemo(() => tiles.map((t) => t?.id).filter(Boolean), [tiles]);

  const expiresOptions = useMemo(() => buildExpiresOptions(10), []);

  const players = useMemo(
    () => (Array.isArray(gameState?.players) ? gameState.players : []),
    [gameState?.players]
  );

  const safeTurnIndex = useMemo(
    () => computeSafeTurnIndex(gameState?.turnIndex, players.length),
    [gameState?.turnIndex, players.length]
  );

  const activePlayerId = useMemo(
    () => players[safeTurnIndex]?.id || null,
    [players, safeTurnIndex]
  );

  const pendingDecision = gameState?.pendingItemDecision || null;

  // NEW: scrolling refs
  const inventoriesRef = useRef(null);
  const playerRowRefs = useRef({});

  useEffect(() => {
    if (!activePlayerId) return;

    const el = playerRowRefs.current?.[activePlayerId] || null;
    if (!el) return;

    // Scroll the active player card into view within the scroll container.
    // "nearest" avoids big jumps if it's already mostly visible.
    el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
  }, [activePlayerId]);

  const onSelectDebugItem = useCallback((playerId, itemId) => {
    setDebugSelectedItemByPlayer((prev) => ({ ...prev, [playerId]: itemId }));
  }, []);

  const onGiveDebugItem = useCallback(
    (playerId) => {
      const itemId = debugSelectedItemByPlayer?.[playerId] || "";
      if (!itemId) return;

      const itemObj = items.find((it) => it?.id === itemId) || null;
      if (!itemObj) return;

      addItemToInventory(playerId, itemObj);
    },
    [addItemToInventory, debugSelectedItemByPlayer, items]
  );

  const onSetReplaceIndex = useCallback((playerId, idx) => {
    setReplaceIndexByPlayer((prev) => ({ ...prev, [playerId]: idx }));
  }, []);

  const onConfirmReplace = useCallback(
    (playerId) => {
      const decision = pendingDecision;
      if (!decision || decision.playerId !== playerId) return;

      const idxRaw = replaceIndexByPlayer?.[playerId];
      const idx = Number.isFinite(Number(idxRaw)) ? Number(idxRaw) : 0;

      resolvePendingItemDecision("replace", idx);
    },
    [pendingDecision, replaceIndexByPlayer, resolvePendingItemDecision]
  );

  const onConfirmDiscard = useCallback(() => {
    resolvePendingItemDecision("discard");
  }, [resolvePendingItemDecision]);

  const onCancelDecision = useCallback(() => {
    clearPendingItemDecision();
  }, [clearPendingItemDecision]);

  const onChangeDebugEventId = useCallback((playerId, value) => {
    setDebugEventIdByPlayer((prev) => ({ ...prev, [playerId]: value }));
  }, []);

  const onChangeDebugEventTile = useCallback((playerId, value) => {
    setDebugEventTileByPlayer((prev) => ({ ...prev, [playerId]: value }));
  }, []);

  const onChangeDebugEventZone = useCallback((playerId, value) => {
    setDebugEventZoneByPlayer((prev) => ({ ...prev, [playerId]: value }));
  }, []);

  const onChangeDebugEventExpires = useCallback((playerId, value) => {
    setDebugEventExpiresByPlayer((prev) => ({ ...prev, [playerId]: value }));
  }, []);

  const onChangeDebugEventGlobal = useCallback((playerId, checked) => {
    setDebugEventGlobalByPlayer((prev) => ({ ...prev, [playerId]: !!checked }));
  }, []);

  return (
    <header className="gameUiRoot" aria-label="Game UI">
      <div className="gameUiTopBar">
        <div className="gameUiTitle">Game</div>

        <div className="gameUiPlayers">
          {players.map((p) => (
            <div
              key={p.id}
              className={`gameUiPlayerPill ${p.id === activePlayerId ? "is-active" : ""}`}
            >
              <span className="gameUiSwatch" style={{ backgroundColor: p.color }} />
              <span className="gameUiName">{p.name}</span>
              <span className="gameUiLevel">Lv {p.level}</span>
            </div>
          ))}
        </div>

        <button className="gameUiBtn" type="button" onClick={onNewGame}>
          New Game
        </button>
      </div>

      <div
        className="gameUiInventories"
        aria-label="Player inventories"
        ref={inventoriesRef}
      >
        {players.map((p) => {
          const isActive = p.id === activePlayerId;

          const selectedItemId = debugSelectedItemByPlayer?.[p.id] || "";
          const replaceIndexValue =
            typeof replaceIndexByPlayer?.[p.id] === "number" ? replaceIndexByPlayer[p.id] : 0;

          const debugEventId = debugEventIdByPlayer?.[p.id] ?? "";
          const debugEventTile = debugEventTileByPlayer?.[p.id] ?? "";
          const debugEventExpires = debugEventExpiresByPlayer?.[p.id] ?? "null";
          const debugEventGlobal = !!debugEventGlobalByPlayer?.[p.id];
          const debugEventZone = debugEventZoneByPlayer?.[p.id] ?? "";

          return (
            <div
              key={p.id}
              ref={(el) => {
                if (el) playerRowRefs.current[p.id] = el;
                else delete playerRowRefs.current[p.id];
              }}
            >
              <PlayerCard
                player={p}
                isActive={isActive}
                activePlayerId={activePlayerId}
                items={items}
                pendingDecision={pendingDecision}
                selectedItemId={selectedItemId}
                onSelectDebugItem={onSelectDebugItem}
                onGiveDebugItem={onGiveDebugItem}
                replaceIndexValue={replaceIndexValue}
                onSetReplaceIndex={onSetReplaceIndex}
                onConfirmReplace={onConfirmReplace}
                onConfirmDiscard={onConfirmDiscard}
                onCancelDecision={onCancelDecision}
                tileIdOptions={tileIdOptions}
                tileTypeOptions={tileTypeOptions}
                zoneOptions={zoneOptions}
                expiresOptions={expiresOptions}
                debugEventId={debugEventId}
                debugEventTile={debugEventTile}
                debugEventZone={debugEventZone}
                debugEventExpires={debugEventExpires}
                debugEventGlobal={debugEventGlobal}
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
          );
        })}
      </div>
    </header>
  );
};

export default GameUi;
