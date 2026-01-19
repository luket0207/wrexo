// game/board/board.jsx
import React, { useMemo } from "react";
import "./board.scss";

import Tile from "./components/tile";
import Piece from "./components/piece";
import BoardControls from "./components/boardControls";

import { useBoardLogic } from "./hooks/useBoardLogic";

const hashStringToUnit = (str) => {
  const s = String(str || "");
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000000) / 1000000;
};

const getTouchingOffset = ({ tileId, playerId, indexInTile }) => {
  const u = hashStringToUnit(`${tileId}::${playerId}`);
  const baseAngle = u * Math.PI * 2;

  // spread players around the tile a bit so they don't always overlap
  const spread = (indexInTile - 1) * 0.45;
  const angle = baseAngle + spread;

  // Tile is 25px, piece is ~22px. Put piece center just outside so it "touches".
  const distance = 12.5 + 10.5;
  const dx = Math.cos(angle) * distance;
  const dy = Math.sin(angle) * distance;

  return { dx, dy };
};

const isPieceVisible = (player) => {
  if (!player) return false;
  if (player.hasChosenStart !== true) return false;
  if (player.isChoosingStart === true) return false;
  return true;
};

const Board = () => {
  const {
    tiles,
    players,
    piecesByTileIndex,
    activePlayer,
    isAnimating,
    lastRoll,
    pendingMove,
    onRoll,
    onDebugRoll,
    onClockwise,
    onAnticlockwise,
    isWrexoView,
    exitMountWrexoDebug,
  } = useBoardLogic();

  const layout = useMemo(() => {
    const tileCount = Array.isArray(tiles) ? tiles.length : 0;
    const degToRad = (deg) => (Number(deg) || 0) * (Math.PI / 180);
    const TAU = Math.PI * 2;
    const WOBBLE_SEED = 9; // change this to get a totally different path BEST: 9
    const size = 900;
    const center = size / 2;

    // Base settings (switchable by view)
    const baseRadius = isWrexoView ? 350 : 380;
    // Target spacing between tiles in pixels
    const stepPx = 15;
    // Wobble amplitude in pixels
    const wobbleAmplitude = isWrexoView ? 0 : 100;
    // Start angle (degrees -> radians)
    const startAngle = degToRad(isWrexoView ? 359 : 190);

    const positions = new Map();

    // -----------------------------
    // Seeded random + LOOPING Catmull-Rom wobble (smooth, more random)
    // -----------------------------
    const hash01 = (n) => {
      let x = (n | 0) + 0x9e3779b9;
      x ^= x >>> 16;
      x = Math.imul(x, 0x85ebca6b);
      x ^= x >>> 13;
      x = Math.imul(x, 0xc2b2ae35);
      x ^= x >>> 16;
      return ((x >>> 0) % 1000000) / 1000000;
    };

    const clamp01 = (t) => Math.max(0, Math.min(1, t));

    // Catmull-Rom spline interpolation for scalars
    const catmullRom = (p0, p1, p2, p3, t) => {
      const tt = t * t;
      const ttt = tt * t;

      return (
        0.5 *
        (2 * p1 +
          (-p0 + p2) * t +
          (2 * p0 - 5 * p1 + 4 * p2 - p3) * tt +
          (-p0 + 3 * p1 - 3 * p2 + p3) * ttt)
      );
    };

    // Build looping control points of radius offsets in [-1, 1]
    const CONTROL_POINTS = 13; // tweak: more points = more variation but still smooth (try 9..17)
    const radiusCtrl = new Array(CONTROL_POINTS);

    for (let i = 0; i < CONTROL_POINTS; i += 1) {
      const r = hash01(i + WOBBLE_SEED) * 2 - 1;
      radiusCtrl[i] = r * r * r;
    }

    // Sample looping Catmull-Rom at normalized progress [0, 1)
    const sampleRadiusNoise = (progress01) => {
      const p = ((progress01 % 1) + 1) % 1; // wrap into [0,1)
      const x = p * CONTROL_POINTS;

      const i1 = Math.floor(x) % CONTROL_POINTS;
      const t = x - Math.floor(x);

      const i0 = (i1 - 1 + CONTROL_POINTS) % CONTROL_POINTS;
      const i2 = (i1 + 1) % CONTROL_POINTS;
      const i3 = (i1 + 2) % CONTROL_POINTS;

      return catmullRom(radiusCtrl[i0], radiusCtrl[i1], radiusCtrl[i2], radiusCtrl[i3], t);
    };

    // -----------------------------
    // Two-pass: compute dThetas, then distribute closure error
    // -----------------------------
    const radii = new Array(tileCount);
    const dThetas = new Array(tileCount);

    for (let i = 0; i < tileCount; i += 1) {
      const progress = tileCount > 0 ? i / tileCount : 0;

      // Smooth, random-looking wobble in [-1, 1]
      const n = sampleRadiusNoise(progress);

      // Radius for this tile
      const radius = baseRadius + n * wobbleAmplitude;

      const safeR = Math.max(40, Math.abs(radius));
      const dTheta = stepPx / safeR;

      radii[i] = radius;
      dThetas[i] = dTheta;
    }

    const totalTheta = dThetas.reduce((sum, v) => sum + v, 0);
    const closureError = TAU - totalTheta;
    const correctionPerStep = tileCount > 0 ? closureError / tileCount : 0;

    let theta = startAngle;

    for (let i = 0; i < tileCount; i += 1) {
      const t = tiles[i];
      const radius = radii[i];

      const x = center + radius * Math.cos(theta);
      const y = center + (radius + (isWrexoView ? -120 : 30)) * Math.sin(theta);

      positions.set(t.id, { x, y });

      theta += dThetas[i] + correctionPerStep;
    }

    return { size, center, positions };
  }, [tiles, isWrexoView]);

  // Precompute piece placements (NO jitter; keep aligned with tiles)
  const piecePlacements = useMemo(() => {
    const placements = [];

    tiles.forEach((t) => {
      const tilePlayersRaw = piecesByTileIndex.get(t.index) || [];
      const tilePlayers = tilePlayersRaw.filter(isPieceVisible); // NEW
      if (!tilePlayers.length) return;

      const pos = layout.positions.get(t.id);
      const x = Number.isFinite(pos?.x) ? pos.x : layout.center;
      const y = Number.isFinite(pos?.y) ? pos.y : layout.center;

      tilePlayers.forEach((p, idx2) => {
        const { dx, dy } = getTouchingOffset({
          tileId: t.id,
          playerId: p.id,
          indexInTile: idx2,
        });

        placements.push({
          key: `${t.id}::${p.id}::${idx2}`,
          player: p,
          isActive: p.id === activePlayer?.id,
          left: x,
          top: y,
          dx,
          dy,
        });
      });
    });

    return placements;
  }, [tiles, piecesByTileIndex, layout, activePlayer?.id]);

  return (
    <div className="boardRoot">
      <BoardControls
        players={players}
        activePlayerId={activePlayer?.id || null}
        isAnimating={isAnimating}
        lastRoll={lastRoll}
        onRoll={onRoll}
        onDebugRoll={onDebugRoll}
        pendingMove={pendingMove}
        onClockwise={onClockwise}
        onAnticlockwise={onAnticlockwise}
        isWrexoView={isWrexoView}
        onExitMountWrexoDebug={exitMountWrexoDebug}
      />

      <div className="boardWrap" aria-label="Board">
        <div
          className="boardGrid"
          role="grid"
          aria-label="72 tile board"
          style={{ width: layout.size, height: layout.size }}
        >
          {/* 1) Tiles layer */}
          <div className={`boardTilesLayer ${isWrexoView ? 'wrexoView' : ''}`}>
            {tiles.map((t) => {
              const pos = layout.positions.get(t.id);

              const x = Number.isFinite(pos?.x) ? pos.x : layout.center;
              const y = Number.isFinite(pos?.y) ? pos.y : layout.center;
              const tilePlayersRaw = piecesByTileIndex.get(t.index) || [];
              const tilePlayers = tilePlayersRaw.filter(isPieceVisible);

              return (
                <div
                  key={t.id}
                  className="boardTilePos"
                  style={{
                    left: x,
                    top: y,
                  }}
                >
                  <Tile tile={t} isActive={tilePlayers.some((p) => p.id === activePlayer?.id)} />
                </div>
              );
            })}
          </div>

          {/* 2) Pieces overlay layer (ALWAYS ABOVE TILES) */}
          <div className="boardPiecesLayer" aria-hidden="true">
            {piecePlacements.map((pp) => (
              <div
                key={pp.key}
                className="boardPiecePos"
                style={{
                  left: pp.left,
                  top: pp.top,
                  transform: `translate(-50%, -50%) translate(${pp.dx}px, ${pp.dy}px)`,
                }}
              >
                <Piece player={pp.player} isActive={pp.isActive} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Board;
