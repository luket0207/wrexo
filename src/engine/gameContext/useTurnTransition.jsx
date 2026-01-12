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

    console.log("[useTurnTransition.effect] prevTurnIndex", prevTurnIndexRef.current, "current", current);

    // Skip first render to avoid announcing on initial load
    if (prevTurnIndexRef.current === null) {
      console.log("[useTurnTransition.effect] skipping first render announcement");
      prevTurnIndexRef.current = current;
      return;
    }

    if (prevTurnIndexRef.current === current) {
      console.log("[useTurnTransition.effect] no change in turnIndex");
      return;
    }

    prevTurnIndexRef.current = current;

    if (suppressNextAnnouncementRef.current) {
      console.log("[useTurnTransition.effect] suppressed announcement, clearing flag");
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

    console.log("[TurnStart]", current, name);

  }, [gameState?.turnIndex, gameState?.players, openModal]);

  const startTurn = useCallback(
    (turnIndex, { suppressAnnouncement = false } = {}) => {
      const idx = Number(turnIndex) || 0;

      // If you ever set turnIndex directly and *don’t* want a modal, use this.
      if (suppressAnnouncement) suppressNextAnnouncementRef.current = true;

      setGameState((prev) => ({
        ...prev,
        turnIndex: idx,
      }));
    },
    [setGameState]
  );

  const endTurn = useCallback(
    ({
      endingPlayerId = null,
      nextTurnIndex = null,
      clearActiveAction = false,
      clearPendingMove = true,
      clearAnimating = true,
      suppressAnnouncement = false,
    } = {}) => {
      console.log("[useTurnTransition.endTurn] called", {
        endingPlayerId,
        nextTurnIndex,
        clearActiveAction,
        clearPendingMove,
        clearAnimating,
        suppressAnnouncement,
      });

      if (endingPlayerId && typeof tickEventsEndTurn === "function") {
        tickEventsEndTurn(endingPlayerId);
      }

      // If we're going to announce the turn start directly (useful when the
      // listener might unmount/remount), set the suppress flag so the effect
      // doesn't duplicate the modal.
      const players = Array.isArray(gameState?.players) ? gameState.players : [];
      const playerCount = players.length;

      const nextIdx =
        typeof nextTurnIndex === "number" && Number.isFinite(nextTurnIndex)
          ? nextTurnIndex
          : computeNextTurnIndex(gameState?.turnIndex, playerCount);

      if (suppressAnnouncement) {
        suppressNextAnnouncementRef.current = true;
      } else {
        suppressNextAnnouncementRef.current = true;
        const name = players?.[nextIdx]?.name || "Player";
        // Defer to avoid race with other transition logic
        window.setTimeout(() => {
          console.log("[useTurnTransition.endTurn] opening modal for", nextIdx, name);
          openModal({
            title: "Turn Start",
            content: `${name}'s turn.`,
            buttons: MODAL_BUTTONS.OK,
          });
        }, 0);
      }

      setGameState((prev) => ({
        ...prev,
        ...(clearActiveAction ? { activeAction: null } : null),
        ...(clearPendingMove ? { pendingMove: null } : null),
        ...(clearAnimating ? { isAnimating: false } : null),
        turnIndex: nextIdx,
      }));
    },
    [setGameState, tickEventsEndTurn, gameState, openModal]
  );

  return { startTurn, endTurn };
};
