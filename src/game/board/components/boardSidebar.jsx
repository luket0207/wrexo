// game/board/components/boardSidebar.jsx
import React, { useMemo, useState, useCallback } from "react";

const BoardSidebar = ({
  players,
  activePlayerId,
  isAnimating,
  lastRoll,
  onRoll,
  onDebugRoll, // NEW
  pendingMove,
  onClockwise,
  onAnticlockwise,
}) => {
  const [isDebugMode, setIsDebugMode] = useState(false);

  const active = useMemo(
    () => players.find((p) => p.id === activePlayerId) || null,
    [players, activePlayerId]
  );

  const pendingForActive = useMemo(() => {
    if (!pendingMove || !active) return null;
    return pendingMove.playerId === active.id ? pendingMove : null;
  }, [pendingMove, active]);

  const canRollNow = !isAnimating && !pendingMove;

  const onToggleDebug = useCallback(() => {
    setIsDebugMode((prev) => !prev);
  }, []);

  return (
    <aside className="boardSidebar" aria-label="Game status">
      <div className="boardSidebar__header">
        <div className="boardSidebar__title">Turn</div>
        <div className="boardSidebar__subtitle">
          {active ? (
            <>
              <span
                className="boardSidebar__colorSwatch"
                style={{ backgroundColor: active.color }}
              />
              <span className="boardSidebar__activeName">{active.name}</span>
            </>
          ) : (
            "No active player"
          )}
        </div>
      </div>

      {!isDebugMode ? (
        <button
          className="boardSidebar__rollBtn"
          type="button"
          onClick={onRoll}
          disabled={isAnimating || !!pendingMove}
        >
          {isAnimating ? "Moving..." : pendingMove ? "Choose Direction" : "Roll Dice"}
        </button>
      ) : (
        <div style={{ display: "grid", gap: "8px" }}>
          <div style={{ fontSize: "13px", opacity: 0.85 }}>Debug roll (click a value)</div>

          <div
            role="group"
            aria-label="Debug next roll value"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((v) => (
              <button
                key={v}
                type="button"
                className="boardSidebar__rollBtn"
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
        </div>
      )}

      <button
        className="boardSidebar__rollBtn"
        type="button"
        onClick={onToggleDebug}
        disabled={isAnimating}
        style={{ marginTop: "8px" }}
      >
        {isDebugMode ? "Debug Mode: ON" : "Debug Mode: OFF"}
      </button>

      {pendingForActive ? (
        <div className="boardSidebar__section">
          <div className="boardSidebar__sectionTitle">Direction</div>
          <div style={{ fontSize: "13px", opacity: 0.85, marginBottom: "10px" }}>
            Steps to move: <strong>{pendingForActive.steps}</strong>
          </div>

          <div style={{ display: "grid", gap: "8px" }}>
            <button
              className="boardSidebar__rollBtn"
              type="button"
              onClick={onClockwise}
              disabled={isAnimating}
            >
              Clockwise
            </button>
            <button
              className="boardSidebar__rollBtn"
              type="button"
              onClick={onAnticlockwise}
              disabled={isAnimating}
            >
              Anti-clockwise
            </button>
          </div>
        </div>
      ) : null}

      <div className="boardSidebar__section">
        <div className="boardSidebar__sectionTitle">Players</div>
        <div className="boardSidebar__players">
          {players.map((p) => (
            <div
              key={p.id}
              className={`boardSidebar__playerRow ${p.id === activePlayerId ? "is-active" : ""}`}
            >
              <span className="boardSidebar__colorSwatch" style={{ backgroundColor: p.color }} />
              <div className="boardSidebar__playerMeta">
                <div className="boardSidebar__playerName">{p.name}</div>
                <div className="boardSidebar__playerTile">
                  Landed on: <strong>{p.currentTileId}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="boardSidebar__section">
        <div className="boardSidebar__sectionTitle">Last roll</div>
        <div className="boardSidebar__lastRoll">
          {lastRoll ? (
            <>
              <div>
                Player:{" "}
                <strong>
                  {players.find((p) => p.id === lastRoll.playerId)?.name || lastRoll.playerId}
                </strong>
              </div>
              <div>
                Value: <strong>{lastRoll.value}</strong>
              </div>
            </>
          ) : (
            "None yet"
          )}
        </div>
      </div>
    </aside>
  );
};

export default BoardSidebar;
