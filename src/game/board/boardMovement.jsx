// game/board/boardMovement.jsx
import TILES from "../../assets/gameContent/tiles";

const clampInt = (n, min, max) => Math.max(min, Math.min(max, n));

export const buildTiles = (count = 72) => {
  if (Array.isArray(TILES) && TILES.length === 72) return TILES;

  const safeCount = clampInt(Number(count) || 72, 1, 9999);
  return new Array(safeCount).fill(null).map((_, i) => {
    const num = String(i + 1).padStart(2, "0");
    return {
      index: i,
      id: `T${num}`,
      tileNumber: i + 1,
      zone: null,
      type: null,
    };
  });
};

export const getNextTurnIndex = (currentIndex, playerCount) => {
  const count = Math.max(1, Number(playerCount) || 1);
  const idx = Number(currentIndex) || 0;
  return (idx + 1) % count;
};

const delay = (ms) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

const wrapIndex = (index, length) => {
  const len = Math.max(1, Number(length) || 1);
  const raw = Number(index) || 0;
  return ((raw % len) + len) % len;
};

const stepDeltaForDirection = (direction) => {
  return direction === "anticlockwise" ? -1 : 1;
};

export const movePlayerBySteps = async ({
  steps,
  direction = "clockwise",
  tiles,
  playerId,
  startIndex,
  setPlayerPosition,
  stepDelayMs = 220,
}) => {
  const safeSteps = Math.max(0, Math.min(999, Number(steps) || 0));
  const tileCount = Array.isArray(tiles) ? tiles.length : 0;

  if (!tileCount) return { finalIndex: 0, finalTileId: "T01" };
  if (!playerId) return { finalIndex: 0, finalTileId: "T01" };
  if (typeof setPlayerPosition !== "function") return { finalIndex: 0, finalTileId: "T01" };

  const perStepDelay = Math.max(0, Math.min(2000, Number(stepDelayMs) || 220));
  const delta = direction === "anticlockwise" ? -1 : 1;

  const wrapIndex = (index, length) => {
    const len = Math.max(1, Number(length) || 1);
    const raw = Number(index) || 0;
    return ((raw % len) + len) % len;
  };

  const delay = (ms) =>
    new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });

  let pos = wrapIndex(Number(startIndex) || 0, tileCount);

  for (let s = 0; s < safeSteps; s += 1) {
    pos = wrapIndex(pos + delta, tileCount);
    const nextTileId = tiles[pos]?.id || "T01";

    setPlayerPosition({ playerId, nextIndex: pos, nextTileId });

    if (perStepDelay > 0) {
      // eslint-disable-next-line no-await-in-loop
      await delay(perStepDelay);
    }
  }

  return { finalIndex: pos, finalTileId: tiles[pos]?.id || "T01" };
};

