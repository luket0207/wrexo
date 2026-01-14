import React, { useEffect, useMemo, useState } from "react";
import "./diceRoll.scss";

import { randomInt } from "../../utils/rng/rng";
import { useModal, MODAL_BUTTONS } from "../../ui/modal/modalContext";

const ROLL_DURATION_MS = 2000;
const MODAL_AUTOCLOSE_SECONDS = 4;

const clampInt = (n, min, max) => Math.max(min, Math.min(max, n));

const getD6Rotation = (value) => {
  switch (value) {
    case 1:
      return { rx: -90, ry: 0 };
    case 2:
      return { rx: 0, ry: 0 };
    case 3:
      return { rx: 0, ry: -90 };
    case 4:
      return { rx: 0, ry: 90 };
    case 5:
      return { rx: 90, ry: 0 };
    case 6:
      return { rx: 180, ry: 0 };
    default:
      return { rx: 0, ry: 0 };
  }
};

const DiceRoll = ({
  value = 1,
  sides = 6,
  rollDurationMs = ROLL_DURATION_MS,
  label = "Rolling dice",
}) => {
  const [isRolling, setIsRolling] = useState(true);
  const safeSides = useMemo(() => clampInt(Number(sides) || 6, 2, 1000), [sides]);
  const safeValue = useMemo(
    () => clampInt(Number(value) || 1, 1, safeSides),
    [value, safeSides]
  );

  const d6Rotation = useMemo(() => getD6Rotation(safeValue), [safeValue]);

  useEffect(() => {
    setIsRolling(true);
    const t = window.setTimeout(() => setIsRolling(false), rollDurationMs);
    return () => window.clearTimeout(t);
  }, [rollDurationMs, safeValue]);

  const renderPips = (count) => {
    const safeCount = clampInt(Number(count) || 1, 1, 6);

    const patterns = {
      1: [5],
      2: [1, 9],
      3: [1, 5, 9],
      4: [1, 3, 7, 9],
      5: [1, 3, 5, 7, 9],
      6: [1, 3, 4, 6, 7, 9],
    };

    const active = patterns[safeCount] || patterns[1];

    return (
      <div className="diceRoll__pips" aria-hidden="true">
        {Array.from({ length: 9 }).map((_, i) => {
          const pos = i + 1;
          const isOn = active.includes(pos);
          return isOn ? (
            <span key={pos} className="diceRoll__pip" />
          ) : (
            <span key={pos} className="diceRoll__pipSlot" />
          );
        })}
      </div>
    );
  };

  if (safeSides !== 6) {
    return (
      <div className="diceRoll" aria-label={label} role="img">
        <div className={`diceRoll__token ${isRolling ? "is-rolling" : "is-landed"}`}>
          <div className="diceRoll__tokenInner">{safeValue}</div>
        </div>
        <div className="diceRoll__caption">{isRolling ? "Rolling..." : `Result: ${safeValue}`}</div>
      </div>
    );
  }

  return (
    <div className="diceRoll" aria-label={label} role="img">
      <div
        className={`diceRoll__scene ${isRolling ? "is-rolling" : "is-landed"}`}
        style={{
          "--final-rx": `${d6Rotation.rx}deg`,
          "--final-ry": `${d6Rotation.ry}deg`,
          "--roll-ms": `${rollDurationMs}ms`,
        }}
      >
        <div className="diceRoll__cube">
          <div className="diceRoll__face diceRoll__face--top">{renderPips(1)}</div>
          <div className="diceRoll__face diceRoll__face--front">{renderPips(2)}</div>
          <div className="diceRoll__face diceRoll__face--right">{renderPips(3)}</div>
          <div className="diceRoll__face diceRoll__face--left">{renderPips(4)}</div>
          <div className="diceRoll__face diceRoll__face--bottom">{renderPips(5)}</div>
          <div className="diceRoll__face diceRoll__face--back">{renderPips(6)}</div>
        </div>
      </div>

      <div className="diceRoll__caption">{isRolling ? "Rolling..." : `Result: ${safeValue}`}</div>
    </div>
  );
};

export default DiceRoll;

const resolveAfterClose = (value, autoCloseSeconds) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(value), autoCloseSeconds * 1000);
  });

const DiceRollDouble = ({
  leftValue,
  rightValue,
  sides = 6,
  rollDurationMs = ROLL_DURATION_MS,
}) => {
  const total = (Number(leftValue) || 0) + (Number(rightValue) || 0);

  return (
    <div className="diceRollDouble" role="img" aria-label={`Double dice roll total ${total}`}>
      <div className="diceRollDouble__diceRow">
        <DiceRoll value={leftValue} sides={sides} rollDurationMs={rollDurationMs} label="Left die" />
        <DiceRoll value={rightValue} sides={sides} rollDurationMs={rollDurationMs} label="Right die" />
      </div>

      <div className="diceRollDouble__total">
        Total: <strong>{total}</strong>
      </div>
    </div>
  );
};

export const useDiceRoll = () => {
  const { openModal } = useModal();

  const openDiceModal = ({ result, sides, rollDurationMs, autoCloseSeconds, title }) => {
    openModal({
      title,
      modalContent: (
        <DiceRoll
          value={result}
          sides={sides}
          rollDurationMs={rollDurationMs}
          label={`Dice roll result will be ${result}`}
        />
      ),
      buttons: MODAL_BUTTONS.NONE,
      autoClose: Number(autoCloseSeconds),
    });
  };

  const openDoubleDiceModal = ({
    leftResult,
    rightResult,
    sides,
    rollDurationMs,
    autoCloseSeconds,
    title,
  }) => {
    openModal({
      title,
      modalContent: (
        <DiceRollDouble
          leftValue={leftResult}
          rightValue={rightResult}
          sides={sides}
          rollDurationMs={rollDurationMs}
        />
      ),
      buttons: MODAL_BUTTONS.NONE,
      autoClose: Number(autoCloseSeconds),
    });
  };

  const rollDice = ({
    min = 1,
    max = 6,
    sides = 6,
    rollDurationMs = ROLL_DURATION_MS,
    autoCloseSeconds = MODAL_AUTOCLOSE_SECONDS,
    title = "Rolling Dice",
  } = {}) => {
    const safeMin = Number.isFinite(min) ? min : 1;
    const safeMax = Number.isFinite(max) ? max : 6;
    const lo = Math.min(safeMin, safeMax);
    const hi = Math.max(safeMin, safeMax);

    const result = randomInt(lo, hi);

    openDiceModal({ result, sides, rollDurationMs, autoCloseSeconds, title });

    return resolveAfterClose(result, autoCloseSeconds);
  };

  const doubleDiceRoll = ({
    sides = 6,
    rollDurationMs = ROLL_DURATION_MS,
    autoCloseSeconds = MODAL_AUTOCLOSE_SECONDS,
    title = "Rolling Dice",
  } = {}) => {
    // Double roll is explicitly two dice; by definition it's 1..6 each for now.
    // If you later want other sided dice, we can generalize this.
    const leftResult = randomInt(1, 6);
    const rightResult = randomInt(1, 6);
    const total = leftResult + rightResult;

    openDoubleDiceModal({ leftResult, rightResult, sides: 6, rollDurationMs, autoCloseSeconds, title });

    return resolveAfterClose(total, autoCloseSeconds);
  };

  const evenDiceRoll = ({
    min = 1,
    max = 6,
    sides = 6,
    rollDurationMs = ROLL_DURATION_MS,
    autoCloseSeconds = MODAL_AUTOCLOSE_SECONDS,
    title = "Rolling Dice",
  } = {}) => {
    const safeMin = Number.isFinite(min) ? min : 1;
    const safeMax = Number.isFinite(max) ? max : 6;
    const lo = Math.min(safeMin, safeMax);
    const hi = Math.max(safeMin, safeMax);

    const result = randomInt(lo, hi);

    openDiceModal({ result, sides, rollDurationMs, autoCloseSeconds, title });

    const isEven = result % 2 === 0;
    return resolveAfterClose(isEven, autoCloseSeconds);
  };

  const minMaxDiceRoll = ({
    rollDurationMs = ROLL_DURATION_MS,
    autoCloseSeconds = MODAL_AUTOCLOSE_SECONDS,
    title = "Rolling Dice",
  } = {}) => {
    const result = randomInt(1, 6);

    openDiceModal({ result, sides: 6, rollDurationMs, autoCloseSeconds, title });

    const isMinOrMax = result === 1 || result === 6;
    return resolveAfterClose(isMinOrMax, autoCloseSeconds);
  };

  return { rollDice, doubleDiceRoll, evenDiceRoll, minMaxDiceRoll };
};
