// battleTurnController.js
import {
  applyPreMoveGateResult,
  getActivePokemon,
  getMoveForDiceRoll,
  getPreMoveGate,
  resolveSkippedTurn,
  resolveTurn,
  TURN,
} from "./battleEngine";

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const createTurnController = ({
  getBattleState,
  setBattleState,
  setLastSelection,
  setCurrentAction,
  isResolvingTurnRef,
  moveMap,
  rollDiceRef,
  evenDiceRollRef,
  minMaxDiceRollRef,
  actionDelayMs = 3000,
}) => {
  const runTurn = async ({ side, forcedSlot = null }) => {
    const battleState = getBattleState();
    if (!battleState) return;
    if (battleState.turn !== side) return;
    if (battleState.status === "FINISHED") return;
    if (isResolvingTurnRef.current) return;

    isResolvingTurnRef.current = true;

    try {
      let diceSlot = null;

      if (Number.isFinite(Number(forcedSlot))) {
        diceSlot = Number(forcedSlot);
      } else {
        diceSlot = await rollDiceRef.current({
          min: 1,
          max: 6,
          sides: 6,
          rollDurationMs: 2000,
          autoCloseSeconds: 3,
        });
      }

      const active =
        side === TURN.OPPONENT
          ? getActivePokemon(battleState.opponent)
          : getActivePokemon(battleState.player);

      const { slot, moveName } = getMoveForDiceRoll(active, diceSlot);
      const isLocked = moveName === null;

      setLastSelection({ side, diceRoll: diceSlot, slot, moveName });

      if (isLocked) {
        setCurrentAction({ side, moveName: null });
        await sleep(actionDelayMs);

        setBattleState((prev) => {
          if (!prev) return prev;

          const gate = getPreMoveGate(prev, side);
          let working = prev;
          let preMessages = [];

          // Locked: no check-roll, but still decrement sleep/paralyse by applying "failed"
          if (gate && (gate.type === "SLEEP" || gate.type === "PARALYSE")) {
            const applied = applyPreMoveGateResult(working, {
              side,
              type: gate.type,
              success: false,
            });
            working = applied.state;
            preMessages = preMessages.concat(applied.messages);
          }

          preMessages.push(`${side === TURN.PLAYER ? "Player" : "Opponent"} selected a locked slot.`);

          const next = resolveTurn(working, {
            attackerSide: side,
            move: null,
            selectedSlot: slot,
            preMessages,
          });

          if (next.status === "FINISHED") return next;

          const nextTurn = next.turn === TURN.PLAYER ? TURN.OPPONENT : TURN.PLAYER;
          return { ...next, turn: nextTurn };
        });

        setCurrentAction(null);
        return;
      }

      // Pre-move gate roll (sleep/paralyse)
      const gate = getPreMoveGate(battleState, side);
      if (gate && (gate.type === "SLEEP" || gate.type === "PARALYSE")) {
        let success = true;

        if (gate.type === "SLEEP") {
          success = await minMaxDiceRollRef.current({ rollDurationMs: 1500, autoCloseSeconds: 2 });
        } else {
          success = await evenDiceRollRef.current({ rollDurationMs: 1500, autoCloseSeconds: 2 });
        }

        if (!success) {
          setCurrentAction({
            side,
            moveName: gate.type === "SLEEP" ? "Sleep check failed" : "Paralysis check failed",
          });

          await sleep(600);

          setBattleState((prev) => {
            if (!prev) return prev;

            const applied = applyPreMoveGateResult(prev, {
              side,
              type: gate.type,
              success: false,
            });

            const skipped = resolveSkippedTurn(applied.state, { messages: applied.messages });

            if (skipped.status === "FINISHED") return skipped;

            const nextTurn = skipped.turn === TURN.PLAYER ? TURN.OPPONENT : TURN.PLAYER;
            return { ...skipped, turn: nextTurn };
          });

          setCurrentAction(null);
          return;
        }
      }

      setCurrentAction({ side, moveName });
      await sleep(actionDelayMs);

      const moveObj = moveName ? moveMap[moveName] : null;

      setBattleState((prev) => {
        if (!prev) return prev;

        let working = prev;
        let preMessages = [];

        // Successful gate still decrements (sleep resets; paralyse decrements)
        const gateNow = getPreMoveGate(working, side);
        if (gateNow && gateNow.type === "SLEEP") {
          const applied = applyPreMoveGateResult(working, { side, type: "SLEEP", success: true });
          working = applied.state;
          preMessages = preMessages.concat(applied.messages);
        } else if (gateNow && gateNow.type === "PARALYSE") {
          const applied = applyPreMoveGateResult(working, { side, type: "PARALYSE", success: true });
          working = applied.state;
          preMessages = preMessages.concat(applied.messages);
        }

        const next = resolveTurn(working, {
          attackerSide: side,
          move: moveObj,
          selectedSlot: slot,
          preMessages,
        });

        if (next.status === "FINISHED") return next;

        const nextTurn = next.turn === TURN.PLAYER ? TURN.OPPONENT : TURN.PLAYER;
        return { ...next, turn: nextTurn };
      });

      setCurrentAction(null);
    } finally {
      isResolvingTurnRef.current = false;
    }
  };

  return { runTurn };
};
