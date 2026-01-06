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

const toNumber = (n, fallback = 0) => {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
};

const calcRollAgainBonusDamage = (strength) => {
  const s = toNumber(strength, 0);
  const raw = s * 10;
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  // Keep damage as integer. Allows 0.5 -> 5
  return Math.floor(raw);
};

const calcSelfDamage = (strength) => {
  const s = toNumber(strength, 0);
  const raw = s * 10;
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return Math.floor(raw);
};

const getStatusEffects = (move) => {
  if (!move) return [];
  if (Array.isArray(move.statusEffects)) return move.statusEffects;

  // Back-compat (older format)
  const effect = typeof move.statusEffect === "string" ? move.statusEffect : null;
  if (!effect) return [];
  return [{ effect, strength: move.statusEffectStrength }];
};

const findFirstEffect = (move, effectName) => {
  const effects = getStatusEffects(move);
  for (let i = 0; i < effects.length; i += 1) {
    if (effects[i]?.effect === effectName) return effects[i];
  }
  return null;
};

const setEffectFields = (move, effectName, fields) => {
  const effects = getStatusEffects(move);
  if (effects.length === 0) return move;

  let changed = false;

  const nextEffects = effects.map((e) => {
    if (e?.effect !== effectName) return e;
    changed = true;
    return { ...e, ...fields };
  });

  return changed ? { ...move, statusEffects: nextEffects } : move;
};

const getActiveForSide = (battleState, side) =>
  side === TURN.OPPONENT
    ? getActivePokemon(battleState?.opponent)
    : getActivePokemon(battleState?.player);

const willConfuseCancelMove = (battleState, side, selectedSlot) => {
  const active = getActiveForSide(battleState, side);
  if (!active) return false;

  const st = active.status || {};
  const confuseSlots = Array.isArray(st.confuseSlots) ? st.confuseSlots : [];
  const slotNum = Number(selectedSlot);

  return Number.isFinite(slotNum) && confuseSlots.includes(slotNum);
};

const isFiniteIntInRange = (v, min, max) => {
  const n = Number(v);
  return Number.isFinite(n) && Math.floor(n) === n && n >= min && n <= max;
};

const tryRollDice = async (fn, { min, max, sides, title }) => {
  if (typeof fn !== "function") return null;

  // Try "new" signature: rollDice({ min, max, sides, title })
  try {
    const res = await fn({ min, max, sides, title });
    if (isFiniteIntInRange(res, min, max)) return res;
  } catch (e) {
    // fall through to positional
  }

  // Fallback "old" signature: rollDice(min, max, sides, title)
  const res2 = await fn(min, max, sides, title);
  return res2;
};

const tryEvenRoll = async (fn, { title }) => {
  if (typeof fn !== "function") return false;

  // Try "new" signature: evenDiceRoll({ title })
  try {
    const res = await fn({ title });
    if (typeof res === "boolean") return res;
  } catch (e) {
    // fall through
  }

  // Fallback "old" signature: evenDiceRoll(title)
  const res2 = await fn(title);
  return !!res2;
};

const tryMinMaxRoll = async (fn, { title }) => {
  if (typeof fn !== "function") return false;

  // Try "new" signature: minMaxDiceRoll({ title })
  try {
    const res = await fn({ title });
    if (typeof res === "boolean") return res;
  } catch (e) {
    // fall through
  }

  // Fallback "old" signature: minMaxDiceRoll(title)
  const res2 = await fn(title);
  return !!res2;
};

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
  const sideLabel = (side) => (side === TURN.PLAYER ? "Player" : "Opponent");

  const runTurn = async ({ side, forcedSlot = null }) => {
    const battleState = getBattleState();
    if (!battleState) return;
    if (battleState.turn !== side) return;
    if (battleState.status === "FINISHED") return;
    if (isResolvingTurnRef.current) return;

    isResolvingTurnRef.current = true;

    try {
      let diceSlot = null;

      // 1) Roll for move selection (unless forced slot via debug)
      const forced = Number(forcedSlot);

      if (Number.isFinite(forced) && forced >= 1 && forced <= 6) {
        diceSlot = forced;
      } else {
        diceSlot = await rollDiceRef.current({
          min: 1,
          max: 6,
          sides: 6,
          title: `${sideLabel(side)} - Select Move`,
        });
      }

      const active =
        side === TURN.OPPONENT
          ? getActivePokemon(battleState.opponent)
          : getActivePokemon(battleState.player);

      const { slot, moveName } = getMoveForDiceRoll(active, diceSlot);
      const isLocked = moveName === null;

      setLastSelection({ side, diceRoll: diceSlot, slot, moveName });

      // Locked move: no gate roll, but still decrement sleep/paralyse if present.
      if (isLocked) {
        setCurrentAction({ side, moveName: null });
        await sleep(actionDelayMs);

        setBattleState((prev) => {
          if (!prev) return prev;

          const gate = getPreMoveGate(prev, side);
          let working = prev;
          let preMessages = [];

          if (gate && (gate.type === "SLEEP" || gate.type === "PARALYSE")) {
            const applied = applyPreMoveGateResult(working, {
              side,
              type: gate.type,
              success: false,
            });
            working = applied.state;
            preMessages = preMessages.concat(applied.messages);
          }

          preMessages.push(`${sideLabel(side)} selected a locked slot.`);

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

      // 2) Pre-move gate checks (sleep/paralyse)
      const gate = getPreMoveGate(battleState, side);
      if (gate && (gate.type === "SLEEP" || gate.type === "PARALYSE")) {
        let success = true;

        if (gate.type === "SLEEP") {
          success = await tryMinMaxRoll(minMaxDiceRollRef.current, {
            title: `${sideLabel(side)} - Sleep Check (1 or 6)`,
          });
        } else {
          success = await tryEvenRoll(evenDiceRollRef.current, {
            title: `${sideLabel(side)} - Paralysis Check (Even)`,
          });
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

      // 3) Execute move (includes heal, weakness, damage, status on-hit, dots, switching)
      setCurrentAction({ side, moveName });
      await sleep(actionDelayMs);

      let moveObj = moveName ? moveMap[moveName] : null;

            // Roll-again bonus damage (RAE / RAM)
      // Only attempt if the move exists and will not be cancelled by confusion.
      let rollAgainMessage = null;

      if (moveObj) {
        const rae = findFirstEffect(moveObj, "RAE");
        const ram = findFirstEffect(moveObj, "RAM");
        const rollAgainEffect = rae || ram;

        if (rollAgainEffect) {
          const latestState = getBattleState();

          // If confusion will cancel the move, skip roll-again entirely.
          if (!willConfuseCancelMove(latestState, side, slot)) {
            const bonus = calcRollAgainBonusDamage(rollAgainEffect.strength);

            if (bonus > 0) {
              const isEvenCheck = rollAgainEffect.effect === "RAE";

              const success = isEvenCheck
                ? await tryEvenRoll(evenDiceRollRef.current, {
                    title: `${sideLabel(side)} - Roll Again (Even)`,
                  })
                : await tryMinMaxRoll(minMaxDiceRollRef.current, {
                    title: `${sideLabel(side)} - Roll Again (1 or 6)`,
                  });

              if (success) {
                const base = toNumber(moveObj.damage, 0);
                moveObj = { ...moveObj, damage: base + bonus };
                rollAgainMessage = `${sideLabel(side)} rolled again successfully! +${bonus} damage.`;
              } else {
                rollAgainMessage = `${sideLabel(side)} roll again failed. No bonus damage.`;
              }
            }
          }
        }
      }

      // Roll-to-avoid recoil (RASELF)
      // Only attempt if the move exists and will not be cancelled by confusion.
      let raseSelfMessage = null;

      if (moveObj && findFirstEffect(moveObj, "RASELF")) {
        const latestState = getBattleState();

        // If confusion will cancel the move, skip the recoil roll entirely.
        if (!willConfuseCancelMove(latestState, side, slot)) {
          const eff = findFirstEffect(moveObj, "RASELF");
          const selfDmg = calcSelfDamage(eff?.strength);

          if (selfDmg > 0) {
            const avoided = await tryEvenRoll(evenDiceRollRef.current, {
              title: `${sideLabel(side)} - Avoid Recoil (Even)`,
            });

            // IMPORTANT: store the roll result on the RASELF effect itself
            // battleEngine reads e.avoided to decide whether to apply recoil.
            moveObj = setEffectFields(moveObj, "RASELF", { avoided });

            raseSelfMessage = avoided
              ? `${sideLabel(side)} avoided recoil damage.`
              : `${sideLabel(side)} failed to avoid recoil.`;
          }
        }
      }

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
          const applied = applyPreMoveGateResult(working, {
            side,
            type: "PARALYSE",
            success: true,
          });
          working = applied.state;
          preMessages = preMessages.concat(applied.messages);
        }

        if (rollAgainMessage) {
          preMessages.push(rollAgainMessage);
        }

        if (raseSelfMessage) {
          preMessages.push(raseSelfMessage);
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
