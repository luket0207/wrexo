// game/actions/pokemonEncounter/hooks/catchCalculation.jsx
import { randomInt } from "../../../../engine/utils/rng/rng";

export const CATCH_OUTCOME = Object.freeze({
  CATCH: "Catch",
  ESCAPE: "Escape",
  RUN_AWAY: "Run Away",
});

const CATCH_TABLE = Object.freeze({
  6: [
    CATCH_OUTCOME.CATCH,
    CATCH_OUTCOME.CATCH,
    CATCH_OUTCOME.CATCH,
    CATCH_OUTCOME.CATCH,
    CATCH_OUTCOME.CATCH,
    CATCH_OUTCOME.CATCH,
  ],
  5: [
    CATCH_OUTCOME.CATCH,
    CATCH_OUTCOME.CATCH,
    CATCH_OUTCOME.CATCH,
    CATCH_OUTCOME.CATCH,
    CATCH_OUTCOME.RUN_AWAY,
    CATCH_OUTCOME.ESCAPE,
  ],
  4: [
    CATCH_OUTCOME.CATCH,
    CATCH_OUTCOME.CATCH,
    CATCH_OUTCOME.CATCH,
    CATCH_OUTCOME.RUN_AWAY,
    CATCH_OUTCOME.ESCAPE,
    CATCH_OUTCOME.ESCAPE,
  ],
  3: [
    CATCH_OUTCOME.CATCH,
    CATCH_OUTCOME.CATCH,
    CATCH_OUTCOME.CATCH,
    CATCH_OUTCOME.RUN_AWAY,
    CATCH_OUTCOME.RUN_AWAY,
    CATCH_OUTCOME.ESCAPE,
  ],
  2: [
    CATCH_OUTCOME.CATCH,
    CATCH_OUTCOME.CATCH,
    CATCH_OUTCOME.RUN_AWAY,
    CATCH_OUTCOME.RUN_AWAY,
    CATCH_OUTCOME.ESCAPE,
    CATCH_OUTCOME.ESCAPE,
  ],
  1: [
    CATCH_OUTCOME.CATCH,
    CATCH_OUTCOME.ESCAPE,
    CATCH_OUTCOME.ESCAPE,
    CATCH_OUTCOME.ESCAPE,
    CATCH_OUTCOME.RUN_AWAY,
    CATCH_OUTCOME.RUN_AWAY,
  ],
});

const clampInt = (n, min, max) => Math.max(min, Math.min(max, n));

const toRateKey = (rate) => {
  const r = Number(rate);
  if (!Number.isFinite(r)) return 1;
  // Table defines 1..6; clamp to keep behavior deterministic.
  return clampInt(Math.round(r), 1, 6);
};

const shuffleInPlace = (arr) => {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i); // inclusive
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
};

export const buildRandomOutcomeMap = (effectiveCatchRate) => {
  const rateKey = toRateKey(effectiveCatchRate);
  const base = CATCH_TABLE[rateKey] || CATCH_TABLE[1];

  // Randomize which dice face maps to which outcome (new shuffle per throw).
  // For rate 6 it is all Catch, but we keep this consistent.
  const shuffled = shuffleInPlace([...base]);

  return {
    rateKey,
    outcomesByDiceValue: {
      1: shuffled[0],
      2: shuffled[1],
      3: shuffled[2],
      4: shuffled[3],
      5: shuffled[4],
      6: shuffled[5],
    },
  };
};

// Core function you can reuse anywhere.
export const resolveCatchAttempt = async ({
  catchRate,
  ballBonus = 0,
  rollDice,
  title = "Throwing Poke Ball",
  forceRate6 = false, // Master Ball sets this true
}) => {
  if (typeof rollDice !== "function") {
    throw new Error("resolveCatchAttempt requires rollDice (from useDiceRoll).");
  }

  const baseRate = Number(catchRate);
  const safeBase = Number.isFinite(baseRate) ? baseRate : 1;

  // IMPORTANT:
  // - Normal throws are clamped to 2..5 (cannot reach 6 via bonuses).
  // - Master Ball uses a locked 6 (100% catch).
  const effectiveRate = forceRate6
    ? 6
    : clampInt(Math.round(safeBase + Number(ballBonus || 0)), 1, 5);

  const mapping = buildRandomOutcomeMap(effectiveRate);

  // Debug visibility: final rate used for this throw + the randomized face mapping.
  const outcomeLines = Object.keys(mapping.outcomesByDiceValue)
    .map((k) => Number(k))
    .sort((a, b) => a - b)
    .map((k) => `${k} - ${mapping.outcomesByDiceValue[k]}`);

  console.log("[CatchAttempt] effectiveCatchRate:", effectiveRate, {
    baseCatchRate: safeBase,
    ballBonus: Number(ballBonus || 0),
    forceRate6: !!forceRate6,
    title,
    outcomesByDiceValue: mapping.outcomesByDiceValue,
    outcomeMappingLines: outcomeLines,
  });

  const diceValue = await rollDice({
    min: 1,
    max: 6,
    sides: 6,
    title,
  });

  const outcome = mapping.outcomesByDiceValue[diceValue] || CATCH_OUTCOME.ESCAPE;

  return {
    diceValue,
    outcome,
    effectiveCatchRate: mapping.rateKey,
    outcomesByDiceValue: mapping.outcomesByDiceValue,
  };
};
