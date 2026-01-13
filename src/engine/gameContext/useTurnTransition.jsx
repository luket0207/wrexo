// engine/gameContext/useTurnTransition.jsx
import { useCallback, useEffect, useRef } from "react";
import { useGame } from "./gameContext";
import { useModal, MODAL_BUTTONS } from "../ui/modal/modalContext";

const computeNextTurnIndex = (prevTurnIndex, playerCount) => {
  const count = Math.max(1, Number(playerCount) || 1);
  const idx = Number(prevTurnIndex) || 0;
  return (idx + 1) % count;
};

export const useTurnTransition = () => {
  const { gameState, setGameState, tickEventsEndTurn } = useGame();
  const { openModal } = useModal();

  // Track real turn changes (source of truth)
  const prevTurnIndexRef = useRef(null);

  // Optional: allow callers to suppress the next announcement (e.g. during init/reset)
  const suppressNextAnnouncementRef = useRef(false);

  // Announce on actual turnIndex changes (reliable, regardless of who changed it)
  useEffect(() => {
    const current = Number(gameState?.turnIndex) || 0;

    // Skip first render to avoid announcing on initial load
    if (prevTurnIndexRef.current === null) {
      prevTurnIndexRef.current = current;
      return;
    }

    if (prevTurnIndexRef.current === current) return;

    prevTurnIndexRef.current = current;

    if (suppressNextAnnouncementRef.current) {
      suppressNextAnnouncementRef.current = false;
      return;
    }

    const name = gameState?.players?.[current]?.name || "Player";

    // Defer slightly to avoid being instantly closed by other transition logic
    window.setTimeout(() => {
      openModal({
        title: "Turn Start",
        content: `${name}'s turn.`,
        buttons: MODAL_BUTTONS.OK,
      });
    }, 0);
  }, [gameState?.turnIndex, gameState?.players, openModal]);

  const startTurn = useCallback(
    (turnIndex, { suppressAnnouncement = false } = {}) => {
      const idx = Number(turnIndex) || 0;

      if (suppressAnnouncement) suppressNextAnnouncementRef.current = true;

      // IMPORTANT: make the board "idle" for the next player
      setGameState((prev) => ({
        ...prev,
        turnIndex: idx,
        pendingMove: null,
        isAnimating: false,
        activeAction: null,
      }));
    },
    [setGameState]
  );

  const endTurn = useCallback(
    ({
      endingPlayerId = null,
      nextTurnIndex = null,
      clearActiveAction = true,
      clearPendingMove = true,
      clearAnimating = true,
      clearLastRoll = true,
      suppressAnnouncement = false,
    } = {}) => {
      if (endingPlayerId && typeof tickEventsEndTurn === "function") {
        tickEventsEndTurn(endingPlayerId);
      }

      // Compute next turn index using the *latest* state inside the setter
      // (prevents stale closure issues and ensures playerCount is correct).
      setGameState((prev) => {
        const players = Array.isArray(prev?.players) ? prev.players : [];
        const playerCount = players.length;

        const nextIdx =
          typeof nextTurnIndex === "number" && Number.isFinite(nextTurnIndex)
            ? nextTurnIndex
            : computeNextTurnIndex(prev?.turnIndex, playerCount);

        // Control whether the turnIndex-change effect should announce.
        // If we announce here, suppress the effect. If we do NOT announce here,
        // allow the effect to announce normally.
        if (suppressAnnouncement) {
          suppressNextAnnouncementRef.current = true;
        } else {
          suppressNextAnnouncementRef.current = true;

          const name = players?.[nextIdx]?.name || "Player";
          window.setTimeout(() => {
            openModal({
              title: "Turn Start",
              content: `${name}'s turn.`,
              buttons: MODAL_BUTTONS.OK,
            });
          }, 0);
        }

        return {
          ...prev,
          ...(clearActiveAction ? { activeAction: null } : null),
          ...(clearPendingMove ? { pendingMove: null } : null),
          ...(clearAnimating ? { isAnimating: false } : null),
          ...(clearLastRoll ? { lastRoll: null } : null),
          turnIndex: nextIdx,
        };
      });
    },
    [setGameState, tickEventsEndTurn, openModal]
  );

  return { startTurn, endTurn };
};
