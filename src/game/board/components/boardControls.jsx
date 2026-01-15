// game/board/components/boardControls.jsx
import React, { useMemo, useState, useCallback } from "react";

const TILE_KEY = Object.freeze([
  { label: "Pokemon Centre", color: "#B3363A" }, // strong muted red
  { label: "Pokemart", color: "#2B4FA3" }, // solid blue
  { label: "Grass", color: "#2F7D4C" }, // natural green
  { label: "Feature", color: "#f5d7a0" },
  { label: "NPC", color: "#4FA3C7" }, // lighter blue-cyan
  { label: "Trainer", color: "#bd7440" },
]);

const TILE_KEY_WREXO = Object.freeze([
  { label: "Elite Battle", color: "#F6C343" }, // vibrant gold
  { label: "Poke Mart", color: "#2B4FA3" }, // same as board
  { label: "Feature", color: "#f5d7a0" }, // same as board
  { label: "NPC", color: "#4FA3C7" }, // same as board
  { label: "Trainer", color: "#bd7440" }, // same as board
  { label: "Path", color: "#2F3A44" }, // dark slate grey
]);

const BoardControls = ({
  players,
  activePlayerId,
  isAnimating,
  onRoll,
  onDebugRoll,
  pendingMove,
  onClockwise,
  onAnticlockwise,
  isWrexoView,
  onExitMountWrexoDebug,
}) => {
  const [isDebugMode, setIsDebugMode] = useState(false);

  const active = useMemo(
    () => players.find((p) => p.id === activePlayerId) || null,
    [players, activePlayerId]
  );

  const tileKeyToShow = useMemo(() => {
    return isWrexoView ? TILE_KEY_WREXO : TILE_KEY;
  }, [isWrexoView]);

  const pendingForActive = useMemo(() => {
    if (!pendingMove || !active) return null;
    return pendingMove.playerId === active.id ? pendingMove : null;
  }, [pendingMove, active]);

  const canRollNow = !isAnimating && !pendingMove;
  const isChoosingDirection = !!pendingForActive;

  const onToggleDebug = useCallback(() => {
    setIsDebugMode((prev) => !prev);
  }, []);

  const headerBg = useMemo(() => {
    return active?.color || "#334155";
  }, [active?.color]);

  return (
    <aside
      className={`boardControls ${isWrexoView ? "mount-wrexo" : ""}`}
      aria-label="Board controls"
    >
      <div className="boardControls__turnHeader" style={{ backgroundColor: headerBg }}>
        <div className="boardControls__turnHeaderLabel">Turn</div>
        <div className="boardControls__turnHeaderName">{active?.name || "No active player"}</div>
      </div>

      <div className="boardControls__body">
        {!isChoosingDirection ? (
          <>
            {!isDebugMode ? (
              <button
                className="boardControls__primaryBtn"
                type="button"
                onClick={onRoll}
                disabled={!canRollNow}
              >
                {isAnimating ? "Moving..." : "Roll Dice"}
              </button>
            ) : (
              <div className="boardControls__debugGrid" role="group" aria-label="Debug roll value">
                {[1, 2, 3, 4, 5, 6].map((v) => (
                  <button
                    key={v}
                    type="button"
                    className="boardControls__debugBtn"
                    disabled={!canRollNow}
                    onClick={() => {
                      if (!canRollNow) return;
                      if (typeof onDebugRoll !== "function") return;
                      onDebugRoll(v);
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}

            <button
              className="boardControls__secondaryBtn"
              type="button"
              onClick={onToggleDebug}
              disabled={isAnimating}
            >
              {isDebugMode ? "Debug: ON" : "Debug: OFF"}
            </button>
          </>
        ) : (
          <div className="boardControls__direction">
            <button
              className="boardControls__primaryBtn"
              type="button"
              onClick={onClockwise}
              disabled={isAnimating}
            >
              Clockwise
            </button>
            <button
              className="boardControls__primaryBtn"
              type="button"
              onClick={onAnticlockwise}
              disabled={isAnimating}
            >
              Anti-clockwise
            </button>
          </div>
        )}
        {/* Tile Key */}
        <div className="boardControls__tileKey" aria-label="Tile key">
          <div className="boardControls__tileKeyTitle">Tile Key</div>

          <div className="boardControls__tileKeyItems">
            {tileKeyToShow.map((t) => (
              <div key={t.label} className="boardControls__tileKeyItem">
                <span
                  className="boardControls__tileKeyDot"
                  style={{ backgroundColor: t.color }}
                  aria-hidden="true"
                />
                <span className="boardControls__tileKeyLabel">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default BoardControls;
