// game/board/board.jsx
import React from "react";
import "./board.scss";

import Tile from "./components/tile";
import Piece from "./components/piece";
import BoardSidebar from "./components/boardSidebar";

import { useBoardLogic } from "./hooks/useBoardLogic";

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
    onDebugRoll, // NEW
    onClockwise,
    onAnticlockwise,
  } = useBoardLogic();

  return (
    <div className="boardRoot">
      <BoardSidebar
        players={players}
        activePlayerId={activePlayer?.id || null}
        isAnimating={isAnimating}
        lastRoll={lastRoll}
        onRoll={onRoll}
        onDebugRoll={onDebugRoll} // NEW
        pendingMove={pendingMove}
        onClockwise={onClockwise}
        onAnticlockwise={onAnticlockwise}
      />

      <div className="boardWrap" aria-label="Board">
        <div className="boardGrid" role="grid" aria-label="72 tile board">
          {tiles.map((t) => {
            const tilePlayers = piecesByTileIndex.get(t.index) || [];
            return (
              <Tile
                key={t.id}
                tile={t}
                isActive={tilePlayers.some((p) => p.id === activePlayer?.id)}
              >
                <div className="tilePieces">
                  {tilePlayers.map((p) => (
                    <Piece key={p.id} player={p} isActive={p.id === activePlayer?.id} />
                  ))}
                </div>
              </Tile>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Board;
