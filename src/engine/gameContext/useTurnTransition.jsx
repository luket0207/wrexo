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
      // Use a snapshot to compute the next turn index and decide whether to
      // prompt the player for starting choice instead of showing the Turn Start modal.
      const playersSnapshot = Array.isArray(gameState?.players) ? gameState.players : [];
      const computedNextIdx =
        typeof nextTurnIndex === "number" && Number.isFinite(nextTurnIndex)
          ? nextTurnIndex
          : computeNextTurnIndex(gameState?.turnIndex, playersSnapshot.length);

      // If caller explicitly asked to suppress announcement, do so and do nothing else.
      if (suppressAnnouncement) {
        suppressNextAnnouncementRef.current = true;
      }

      // Update the state (set the next turn index and clear transient flags)
      setGameState((prev) => ({
        ...prev,
        ...(clearActiveAction ? { activeAction: null } : null),
        ...(clearPendingMove ? { pendingMove: null } : null),
        ...(clearAnimating ? { isAnimating: false } : null),
        ...(clearLastRoll ? { lastRoll: null } : null),
        turnIndex: computedNextIdx,
      }));

      // If the next player hasn't chosen a start, suppress the normal Turn Start
      // modal and dispatch a platform event that the board logic can listen for
      // to open the start-selection modal. Otherwise, show the normal Turn Start modal
      // (unless suppressed above).
      const nextPlayer = playersSnapshot?.[computedNextIdx] || null;
      const shouldPromptStart = nextPlayer && nextPlayer.hasChosenStart !== true;

      if (shouldPromptStart) {
        suppressNextAnnouncementRef.current = true;
        const playerId = nextPlayer.id;
        window.setTimeout(() => {
          try {
            window.dispatchEvent(
              new CustomEvent("wrexo:promptChooseStartingZone", { detail: { playerId } })
            );
          } catch (e) {
            // best-effort, ignore if dispatch fails
          }
        }, 0);
        return;
      }

      if (!suppressAnnouncement) {
        suppressNextAnnouncementRef.current = true;
        const name = nextPlayer?.name || "Player";
        window.setTimeout(() => {
          openModal({
            title: "Turn Start",
            content: `${name}'s turn.`,
            buttons: MODAL_BUTTONS.OK,
          });
        }, 0);
      }
    },
    [setGameState, tickEventsEndTurn, openModal]
  );

  return { startTurn, endTurn };
};
