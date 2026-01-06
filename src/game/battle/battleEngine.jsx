// battleEngine.jsx
import { randomInt } from "../../engine/utils/rng/rng";

export const TURN = {
  PLAYER: "PLAYER",
  OPPONENT: "OPPONENT",
};

const DOT_DAMAGE = 5;
const CONFUSE_SELF_DAMAGE = 20;

const toFixedMoveArray = (attackArray) => {
  const arr = Array.isArray(attackArray) ? attackArray : [];
  const fixed = new Array(6).fill(null);
  for (let i = 0; i < 6; i += 1) {
    fixed[i] = arr[i] ?? null;
  }
  return fixed;
};

const shuffleWithRng = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
};

const clampNonNegativeInt = (n) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  const i = Math.floor(x);
  return i < 0 ? 0 : i;
};

const toNumber = (n, fallback = 0) => {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
};

const isAlive = (p) => toNumber(p?.health, 0) > 0;

const normalizePokemonForBattle = (pokemon) => {
  const hp = toNumber(pokemon?.health, 0);
  const maxHealth = Number.isFinite(pokemon?.maxHealth) ? pokemon.maxHealth : hp;

  return {
    ...pokemon,
    health: hp,
    maxHealth,
    fainted: hp <= 0,
    status: {
      burn: 0,
      poison: 0,
      sleep: 0,
      paralyse: 0,
      confusePending: 0,
      confuseSlots: [],
      burnJustApplied: false,
      poisonJustApplied: false,
      ...(pokemon?.status ?? {}),
    },
  };
};

const attachBattleMoves = (pokemon) => {
  const baseMoves = toFixedMoveArray(pokemon?.attackArray);
  const battleMoves = shuffleWithRng(baseMoves);

  return {
    ...normalizePokemonForBattle(pokemon),
    battleMoves,
  };
};

export const createBattleState = ({
  playerTeamOrdered = [],
  opponentTeamOrdered = [],
  firstTurn = TURN.PLAYER,
}) => {
  const safePlayer = Array.isArray(playerTeamOrdered) ? playerTeamOrdered : [];
  const safeOpponent = Array.isArray(opponentTeamOrdered) ? opponentTeamOrdered : [];

  return {
    status: "IN_PROGRESS",
    winner: null,
    lastTurnMessages: [],
    turn: firstTurn,
    player: {
      team: safePlayer.map(attachBattleMoves),
      activeIndex: 0,
    },
    opponent: {
      team: safeOpponent.map(attachBattleMoves),
      activeIndex: 0,
    },
  };
};

export const getActivePokemon = (sideState) => {
  if (!sideState || !Array.isArray(sideState.team)) return null;
  const idx = Number.isFinite(sideState.activeIndex) ? sideState.activeIndex : 0;
  return sideState.team[idx] ?? null;
};

export const getBenchPokemon = (sideState) => {
  if (!sideState || !Array.isArray(sideState.team)) return [];
  const idx = Number.isFinite(sideState.activeIndex) ? sideState.activeIndex : 0;
  return sideState.team.filter((_, i) => i !== idx);
};

export const getMoveForDiceRoll = (activePokemon, diceRoll) => {
  const moves = Array.isArray(activePokemon?.battleMoves) ? activePokemon.battleMoves : [];
  const roll = Number(diceRoll);

  if (!Number.isFinite(roll) || roll < 1 || roll > 6) {
    return { slot: null, moveName: null };
  }

  const index = roll - 1;
  return {
    slot: roll,
    moveName: moves[index] ?? null,
  };
};

export const getTurnLabel = (turn) => (turn === TURN.OPPONENT ? "Opponent" : "Player");

const findNextAliveIndex = (team, fromIndex) => {
  if (!Array.isArray(team) || team.length === 0) return null;

  for (let i = fromIndex + 1; i < team.length; i += 1) {
    if (isAlive(team[i])) return i;
  }

  for (let i = 0; i < team.length; i += 1) {
    if (isAlive(team[i])) return i;
  }

  return null;
};

const normalizeAfterDamage = (p) => {
  if (!p) return p;
  const hp = toNumber(p.health, 0);
  const fainted = hp <= 0;
  return {
    ...p,
    health: hp,
    fainted,
  };
};

const clampToMaxHealth = (p) => {
  if (!p) return p;
  const max = toNumber(p.maxHealth, toNumber(p.health, 0));
  const hp = toNumber(p.health, 0);
  const clamped = Math.min(hp, max);
  return clamped === hp ? p : { ...p, health: clamped };
};

const ensureSideActiveIsValid = (sideState) => {
  if (!sideState || !Array.isArray(sideState.team) || sideState.team.length === 0) return sideState;

  const idx = Number.isFinite(sideState.activeIndex) ? sideState.activeIndex : 0;
  const active = sideState.team[idx];

  if (active && isAlive(active)) return sideState;

  const nextIdx = findNextAliveIndex(sideState.team, idx);
  if (nextIdx === null) return sideState;

  return {
    ...sideState,
    activeIndex: nextIdx,
  };
};

const allFainted = (team) => {
  if (!Array.isArray(team) || team.length === 0) return true;
  return team.every((p) => !isAlive(p));
};

const getStatus = (p) => (p && typeof p === "object" ? (p.status ?? {}) : {});
const setStatus = (p, nextStatus) => ({ ...p, status: nextStatus });

const getStatusEffects = (move) => {
  if (!move) return [];
  if (Array.isArray(move.statusEffects)) return move.statusEffects;

  // Back-compat for older move format
  const effect = typeof move.statusEffect === "string" ? move.statusEffect : null;
  if (!effect) return [];

  return [
    {
      effect,
      strength: move.statusEffectStrength,
    },
  ];
};


export const getPreMoveGate = (battleState, side) => {
  if (!battleState || battleState.status === "FINISHED") return null;

  const sideKey = side === TURN.OPPONENT ? "opponent" : "player";
  const active = getActivePokemon(battleState[sideKey]);
  if (!active || !isAlive(active)) return null;

  const st = getStatus(active);
  const sleep = clampNonNegativeInt(st.sleep);
  const paralyse = clampNonNegativeInt(st.paralyse);

  if (sleep > 0) return { type: "SLEEP", remaining: sleep };
  if (paralyse > 0) return { type: "PARALYSE", remaining: paralyse };
  return null;
};

export const applyPreMoveGateResult = (battleState, { side, type, success }) => {
  if (!battleState) return { state: battleState, messages: [] };

  const sideKey = side === TURN.OPPONENT ? "opponent" : "player";
  const sideState = battleState[sideKey];
  const idx = Number.isFinite(sideState?.activeIndex) ? sideState.activeIndex : 0;
  const team = Array.isArray(sideState?.team) ? sideState.team : [];
  const active = team[idx];

  if (!active) return { state: battleState, messages: [] };

  const messages = [];
  const st = getStatus(active);

  let next = active;

  if (type === "SLEEP") {
    const cur = clampNonNegativeInt(st.sleep);

    if (success) {
      if (cur > 0) messages.push(`${active.name} woke up!`);
      next = setStatus(next, { ...st, sleep: 0 });
    } else {
      const nextCount = cur > 0 ? cur - 1 : 0;
      messages.push(`${active.name} is asleep and cannot move.`);
      next = setStatus(next, { ...st, sleep: nextCount });
    }
  }

  if (type === "PARALYSE") {
    const cur = clampNonNegativeInt(st.paralyse);
    const nextCount = cur > 0 ? cur - 1 : 0;

    if (!success) {
      messages.push(`${active.name} is paralysed and cannot move.`);
    } else {
      messages.push(`${active.name} fought through paralysis.`);
    }

    next = setStatus(next, { ...st, paralyse: nextCount });
  }

  const nextTeam = team.map((p, i) => (i === idx ? next : p));
  const nextSideState = { ...sideState, team: nextTeam };

  const nextState = {
    ...battleState,
    [sideKey]: ensureSideActiveIsValid(nextSideState),
  };

  return { state: nextState, messages };
};

const isLockedSlot = (pokemon, slot) => {
  const idx = Number(slot) - 1;
  if (!Number.isFinite(idx) || idx < 0 || idx > 5) return true;
  const moves = Array.isArray(pokemon?.battleMoves) ? pokemon.battleMoves : [];
  return moves[idx] === null;
};

const uniqueRandomPick = (arr, count) => {
  const safe = Array.isArray(arr) ? [...arr] : [];
  const n = clampNonNegativeInt(count);
  if (n <= 0 || safe.length === 0) return [];
  for (let i = safe.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    const tmp = safe[i];
    safe[i] = safe[j];
    safe[j] = tmp;
  }
  return safe.slice(0, Math.min(n, safe.length));
};

// Confuse slots must exist BEFORE the player picks (so UI can highlight).
const ensureConfuseSlotsForTurn = (pokemon) => {
  if (!pokemon) return pokemon;

  const st = getStatus(pokemon);
  const pending = clampNonNegativeInt(st.confusePending);
  const hasSlots = Array.isArray(st.confuseSlots) && st.confuseSlots.length > 0;

  if (pending <= 0 || hasSlots) return pokemon;

  const nonLockedSlots = [];
  for (let s = 1; s <= 6; s += 1) {
    if (!isLockedSlot(pokemon, s)) nonLockedSlots.push(s);
  }

  const picked = uniqueRandomPick(nonLockedSlots, pending);

  return setStatus(pokemon, {
    ...st,
    confuseSlots: picked,
  });
};

const clearConfuseAfterTurn = (pokemon) => {
  if (!pokemon) return pokemon;

  const st = getStatus(pokemon);
  const hadPending = clampNonNegativeInt(st.confusePending) > 0;
  const hadSlots = Array.isArray(st.confuseSlots) && st.confuseSlots.length > 0;

  if (!hadPending && !hadSlots) return pokemon;

  return setStatus(pokemon, {
    ...st,
    confusePending: 0,
    confuseSlots: [],
  });
};

// Exported: call at start of each turn so UI shows confused slots before selection.
export const prepareStartOfTurn = (battleState) => {
  if (!battleState) return battleState;
  if (battleState.status === "FINISHED") return battleState;

  const side = battleState.turn;
  const sideKey = side === TURN.OPPONENT ? "opponent" : "player";
  const sideState = battleState[sideKey];

  if (!sideState || !Array.isArray(sideState.team) || sideState.team.length === 0)
    return battleState;

  const idx = Number.isFinite(sideState.activeIndex) ? sideState.activeIndex : 0;
  const team = sideState.team;
  const active = team[idx];

  if (!active || !isAlive(active)) return battleState;

  const nextActive = ensureConfuseSlotsForTurn(active);
  if (nextActive === active) return battleState;

  const nextTeam = team.map((p, i) => (i === idx ? nextActive : p));
  return {
    ...battleState,
    [sideKey]: {
      ...sideState,
      team: nextTeam,
    },
  };
};

const applyStatusOnHit = (defenderPokemon, move, messages) => {
  if (!defenderPokemon || !move) return defenderPokemon;

  const effects = getStatusEffects(move);
  if (effects.length === 0) return defenderPokemon;

  let nextDefender = defenderPokemon;

  for (let i = 0; i < effects.length; i += 1) {
    const e = effects[i];
    const effect = typeof e?.effect === "string" ? e.effect : null;
    const strength = clampNonNegativeInt(e?.strength);

    if (!effect || strength <= 0) continue;

    const st = getStatus(nextDefender);

    if (effect === "Burn") {
      const nextBurn = clampNonNegativeInt(st.burn) + strength;
      messages.push(`${nextDefender.name} was burned (${nextBurn}).`);
      nextDefender = setStatus(nextDefender, {
        ...st,
        burn: nextBurn,
        burnJustApplied: true,
      });
      continue;
    }

    if (effect === "Poison") {
      const nextPoison = clampNonNegativeInt(st.poison) + strength;
      messages.push(`${nextDefender.name} was poisoned (${nextPoison}).`);
      nextDefender = setStatus(nextDefender, {
        ...st,
        poison: nextPoison,
        poisonJustApplied: true,
      });
      continue;
    }

    if (effect === "Sleep") {
      const nextSleep = clampNonNegativeInt(st.sleep) + strength;
      messages.push(`${nextDefender.name} fell asleep (${nextSleep}).`);
      nextDefender = setStatus(nextDefender, { ...st, sleep: nextSleep });
      continue;
    }

    if (effect === "Paralyse") {
      const nextParalyse = clampNonNegativeInt(st.paralyse) + strength;
      messages.push(`${nextDefender.name} was paralysed (${nextParalyse}).`);
      nextDefender = setStatus(nextDefender, { ...st, paralyse: nextParalyse });
      continue;
    }

    if (effect === "Confuse") {
      const nextConfuse = clampNonNegativeInt(st.confusePending) + strength;
      messages.push(`${nextDefender.name} became confused (${nextConfuse}).`);
      nextDefender = setStatus(nextDefender, {
        ...st,
        confusePending: nextConfuse,
        confuseSlots: Array.isArray(st.confuseSlots) ? st.confuseSlots : [],
      });
      continue;
    }
  }

  return nextDefender;
};

const applySelfStatusOnUse = (attackerPokemon, move, messages) => {
  if (!attackerPokemon || !move) return attackerPokemon;

  const effects = getStatusEffects(move);
  if (effects.length === 0) return attackerPokemon;

  let nextAttacker = attackerPokemon;

  for (let i = 0; i < effects.length; i += 1) {
    const e = effects[i];
    const effect = typeof e?.effect === "string" ? e.effect : null;

    if (effect !== "SleepSELF") continue;

    const strength = clampNonNegativeInt(e?.strength);
    if (strength <= 0) continue;

    const st = getStatus(nextAttacker);
    const nextSleep = clampNonNegativeInt(st.sleep) + strength;

    messages.push(`${nextAttacker.name} fell asleep (${nextSleep}).`);
    nextAttacker = setStatus(nextAttacker, { ...st, sleep: nextSleep });
  }

  return nextAttacker;
};

const applyHealOnUse = (attackerPokemon, move, messages) => {
  if (!attackerPokemon || !move) return attackerPokemon;

  const effects = getStatusEffects(move);
  if (effects.length === 0) return attackerPokemon;

  let totalHeal = 0;

  for (let i = 0; i < effects.length; i += 1) {
    const e = effects[i];
    const effect = typeof e?.effect === "string" ? e.effect : null;
    if (effect !== "Heal") continue;

    const strengthRaw = Number(e?.strength);
    const strength = Number.isFinite(strengthRaw) ? strengthRaw : 0;

    const raw = strength * 10;
    if (!Number.isFinite(raw) || raw <= 0) continue;

    totalHeal += Math.floor(raw);
  }

  if (totalHeal <= 0) return attackerPokemon;

  const max = toNumber(attackerPokemon.maxHealth, toNumber(attackerPokemon.health, 0));
  const cur = toNumber(attackerPokemon.health, 0);
  const nextHp = Math.min(max, cur + totalHeal);

  if (nextHp === cur) {
    messages.push(`${attackerPokemon.name} tried to heal, but is already at full HP.`);
    return attackerPokemon;
  }

  messages.push(`${attackerPokemon.name} healed ${nextHp - cur} HP.`);
  return { ...attackerPokemon, health: nextHp };
};

const applySelfDamageOnUse = (attackerPokemon, move, messages) => {
  if (!attackerPokemon || !move) return attackerPokemon;

  const effects = getStatusEffects(move);
  if (effects.length === 0) return attackerPokemon;

  let totalRecoil = 0;

  for (let i = 0; i < effects.length; i += 1) {
    const e = effects[i];
    const effect = typeof e?.effect === "string" ? e.effect : null;
    if (effect !== "SELF" && effect !== "RASELF") continue;

    const strengthRaw = Number(e?.strength);
    const strength = Number.isFinite(strengthRaw) ? strengthRaw : 0;

    const raw = strength * 10;
    if (!Number.isFinite(raw) || raw <= 0) continue;

    const dmg = Math.floor(raw);

    if (effect === "RASELF") {
      // Controller sets avoided=true when even roll succeeds
      const avoided = !!e?.avoided;
      if (avoided) continue;
    }

    totalRecoil += dmg;
  }

  if (totalRecoil <= 0) return attackerPokemon;

  const cur = toNumber(attackerPokemon.health, 0);
  const nextHp = cur - totalRecoil;

  messages.push(`${attackerPokemon.name} took ${totalRecoil} recoil damage.`);
  return normalizeAfterDamage({ ...attackerPokemon, health: nextHp });
};

const applyEndOfTurnDots = (battleState, messages) => {
  if (!battleState) return battleState;

  const applyToSide = (sideState) => {
    if (!sideState || !Array.isArray(sideState.team)) return sideState;

    const nextTeam = sideState.team.map((p) => {
      if (!p || !isAlive(p)) return p;

      const st = getStatus(p);
      const burn = clampNonNegativeInt(st.burn);
      const poison = clampNonNegativeInt(st.poison);

      let next = p;
      let nextStatus = st;

      if (burn > 0) {
        const justApplied = !!nextStatus.burnJustApplied;

        if (justApplied) {
          // Do not tick on the same turn it was applied; arm it for next turn
          nextStatus = { ...nextStatus, burnJustApplied: false };
        } else {
          const hp = toNumber(next.health, 0) - DOT_DAMAGE;
          next = normalizeAfterDamage({ ...next, health: hp });
          nextStatus = { ...nextStatus, burn: burn - 1 };
          messages.push(`${next.name} took ${DOT_DAMAGE} burn damage.`);
        }
      }

      if (poison > 0) {
        const justApplied = !!nextStatus.poisonJustApplied;

        if (justApplied) {
          // Do not tick on the same turn it was applied; arm it for next turn
          nextStatus = { ...nextStatus, poisonJustApplied: false };
        } else {
          const hp = toNumber(next.health, 0) - DOT_DAMAGE;
          next = normalizeAfterDamage({ ...next, health: hp });
          nextStatus = { ...nextStatus, poison: poison - 1 };
          messages.push(`${next.name} took ${DOT_DAMAGE} poison damage.`);
        }
      }

      if (nextStatus !== st) {
        next = setStatus(next, nextStatus);
      }

      return next;
    });

    return ensureSideActiveIsValid({ ...sideState, team: nextTeam });
  };

  return {
    ...battleState,
    player: applyToSide(battleState.player),
    opponent: applyToSide(battleState.opponent),
  };
};

const finalizeBattleIfNeeded = (battleState) => {
  if (!battleState) return battleState;
  if (battleState.status === "FINISHED") return battleState;

  const playerDead = allFainted(battleState.player?.team);
  const opponentDead = allFainted(battleState.opponent?.team);

  if (playerDead && opponentDead) {
    return {
      ...battleState,
      status: "FINISHED",
      winner: null,
    };
  }

  if (opponentDead) {
    return {
      ...battleState,
      status: "FINISHED",
      winner: TURN.PLAYER,
    };
  }

  if (playerDead) {
    return {
      ...battleState,
      status: "FINISHED",
      winner: TURN.OPPONENT,
    };
  }

  return battleState;
};

export const resolveSkippedTurn = (battleState, { messages = [] } = {}) => {
  if (!battleState) return battleState;

  let nextState = { ...battleState };
  const nextMessages = Array.isArray(messages) ? [...messages] : [];

  const attackerSide = battleState.turn;
  const attackerKey = attackerSide === TURN.OPPONENT ? "opponent" : "player";
  const attackerSideState = nextState[attackerKey];

  const aIdx = Number.isFinite(attackerSideState?.activeIndex) ? attackerSideState.activeIndex : 0;
  const aTeam = Array.isArray(attackerSideState?.team) ? attackerSideState.team : [];

  // Confuse expires after this turn even if skipped
  const aPokemon = aTeam[aIdx];
  if (aPokemon) {
    const cleared = clearConfuseAfterTurn(aPokemon);
    if (cleared !== aPokemon) {
      const nextTeam = aTeam.map((p, i) => (i === aIdx ? cleared : p));
      nextState = {
        ...nextState,
        [attackerKey]: ensureSideActiveIsValid({ ...attackerSideState, team: nextTeam }),
      };
    }
  }

  nextState = applyEndOfTurnDots(nextState, nextMessages);
  nextState = finalizeBattleIfNeeded(nextState);

  return {
    ...nextState,
    lastTurnMessages: nextMessages,
  };
};

export const resolveTurn = (
  battleState,
  { attackerSide, move, selectedSlot, preMessages = [] }
) => {
  if (!battleState) return battleState;
  if (battleState.status === "FINISHED") return battleState;

  const messages = Array.isArray(preMessages) ? [...preMessages] : [];

  const attackerKey = attackerSide === TURN.OPPONENT ? "opponent" : "player";
  const defenderKey = attackerSide === TURN.OPPONENT ? "player" : "opponent";

  const attackerSideState = battleState[attackerKey];
  const defenderSideState = battleState[defenderKey];

  const aIdx = Number.isFinite(attackerSideState?.activeIndex) ? attackerSideState.activeIndex : 0;
  const dIdx = Number.isFinite(defenderSideState?.activeIndex) ? defenderSideState.activeIndex : 0;

  const aTeam = Array.isArray(attackerSideState?.team) ? attackerSideState.team : [];
  const dTeam = Array.isArray(defenderSideState?.team) ? defenderSideState.team : [];

  const attackerPokemon = aTeam[aIdx] ?? null;
  const defenderPokemon = dTeam[dIdx] ?? null;

  if (!attackerPokemon) {
    let nextState = applyEndOfTurnDots(battleState, messages);
    nextState = finalizeBattleIfNeeded(nextState);
    return { ...nextState, lastTurnMessages: messages };
  }

  // Confuse slots should already be prepared at start-of-turn, but keep this safe.
  let nextAttacker = ensureConfuseSlotsForTurn(attackerPokemon);

  // If selected slot is confused, move fails and attacker takes 20 self-damage
  const st = getStatus(nextAttacker);
  const confuseSlots = Array.isArray(st.confuseSlots) ? st.confuseSlots : [];
  const slotNum = Number(selectedSlot);

  if (Number.isFinite(slotNum) && confuseSlots.includes(slotNum)) {
    const hp = toNumber(nextAttacker.health, 0) - CONFUSE_SELF_DAMAGE;
    nextAttacker = normalizeAfterDamage({ ...nextAttacker, health: hp });

    messages.push(
      `${nextAttacker.name} hurt itself in confusion for ${CONFUSE_SELF_DAMAGE} damage.`
    );
    move = null;
  }

  // Write attacker back (self-damage / slots persistence)
  let workingState = {
    ...battleState,
    [attackerKey]: ensureSideActiveIsValid({
      ...attackerSideState,
      team: aTeam.map((p, i) => (i === aIdx ? nextAttacker : p)),
    }),
  };

  // Re-read attacker in case it fainted and switched
  const refreshedAttackerSide = workingState[attackerKey];
  const refreshedAIdx = Number.isFinite(refreshedAttackerSide?.activeIndex)
    ? refreshedAttackerSide.activeIndex
    : aIdx;

  const refreshedATeam = Array.isArray(refreshedAttackerSide?.team)
    ? refreshedAttackerSide.team
    : [];
  const refreshedAttacker = refreshedATeam[refreshedAIdx] ?? null;

  if (!refreshedAttacker || !isAlive(refreshedAttacker)) {
    messages.push(`${attackerPokemon.name} fainted.`);

    workingState = applyEndOfTurnDots(workingState, messages);
    workingState = finalizeBattleIfNeeded(workingState);

    // Confuse expires after this turn
    const clearedTeam = refreshedATeam.map((p, i) =>
      i === refreshedAIdx ? clearConfuseAfterTurn(p) : p
    );

    return {
      ...workingState,
      [attackerKey]: ensureSideActiveIsValid({ ...refreshedAttackerSide, team: clearedTeam }),
      lastTurnMessages: messages,
    };
  }

  if (move && refreshedAttacker && isAlive(refreshedAttacker)) {
    let updatedAttacker = refreshedAttacker;

    // Heal effects
    updatedAttacker = clampToMaxHealth(applyHealOnUse(updatedAttacker, move, messages));

    // Self-applied statuses (SleepSELF)
    updatedAttacker = applySelfStatusOnUse(updatedAttacker, move, messages);

    if (updatedAttacker !== refreshedAttacker) {
      const updatedTeam = refreshedATeam.map((p, i) => (i === refreshedAIdx ? updatedAttacker : p));
      workingState = {
        ...workingState,
        [attackerKey]: ensureSideActiveIsValid({
          ...refreshedAttackerSide,
          team: updatedTeam,
        }),
      };
    }
  }
  
  const latestAttackerSide = workingState[attackerKey];
  const latestAIdx = Number.isFinite(latestAttackerSide?.activeIndex)
    ? latestAttackerSide.activeIndex
    : refreshedAIdx;
  const latestATeam = Array.isArray(latestAttackerSide?.team)
    ? latestAttackerSide.team
    : refreshedATeam;
  const latestAttacker = latestATeam[latestAIdx] ?? refreshedAttacker;

  if (move && defenderPokemon && isAlive(defenderPokemon)) {
    const baseDamage = Math.max(0, clampNonNegativeInt(move.damage));

    let finalDamage = baseDamage;

    // Weakness: +10 only if the move already deals >0 damage
    const defenderWeakness =
      defenderPokemon && typeof defenderPokemon.weakness === "string"
        ? defenderPokemon.weakness
        : null;

    const moveType = move && typeof move.type === "string" ? move.type : null;

    const isWeak = baseDamage > 0 && defenderWeakness && moveType && defenderWeakness === moveType;

    if (isWeak) {
      finalDamage += 10;
      messages.push(`${defenderPokemon.name} is weak to ${moveType}! +10 damage.`);
    }

    if (finalDamage > 0) {
      const hp = toNumber(defenderPokemon.health, 0) - finalDamage;
      messages.push(`${defenderPokemon.name} took ${finalDamage} damage.`);

      let nextDefender = normalizeAfterDamage({ ...defenderPokemon, health: hp });
      nextDefender = applyStatusOnHit(nextDefender, move, messages);

      const nextDTeam = dTeam.map((p, i) => (i === dIdx ? nextDefender : p));
      workingState = {
        ...workingState,
        [defenderKey]: ensureSideActiveIsValid({
          ...defenderSideState,
          team: nextDTeam,
        }),
      };
    } else {
      // 0 damage moves can still apply status effects
      let nextDefender = defenderPokemon;
      nextDefender = applyStatusOnHit(nextDefender, move, messages);

      if (nextDefender !== defenderPokemon) {
        const nextDTeam = dTeam.map((p, i) => (i === dIdx ? nextDefender : p));
        workingState = {
          ...workingState,
          [defenderKey]: ensureSideActiveIsValid({
            ...defenderSideState,
            team: nextDTeam,
          }),
        };
      }
    }
  }

  // Apply SELF / RASELF recoil to the attacker (after move resolution)
  if (move) {
    const sideNow = workingState[attackerKey];
    const idxNow = Number.isFinite(sideNow?.activeIndex) ? sideNow.activeIndex : latestAIdx;
    const teamNow = Array.isArray(sideNow?.team) ? sideNow.team : latestATeam;

    const atkNow = teamNow[idxNow] ?? null;

    if (atkNow && isAlive(atkNow)) {
      const afterRecoil = applySelfDamageOnUse(atkNow, move, messages);

      if (afterRecoil !== atkNow) {
        const nextTeam = teamNow.map((p, i) => (i === idxNow ? afterRecoil : p));
        workingState = {
          ...workingState,
          [attackerKey]: ensureSideActiveIsValid({ ...sideNow, team: nextTeam }),
        };
      }
    }
  }

  if (!move) {
    messages.push(`${refreshedAttacker.name} could not execute a move.`);
  }

  workingState = applyEndOfTurnDots(workingState, messages);

  // Confuse expires after this attacker turn
  const postAttackerSide = workingState[attackerKey];
  const postIdx = Number.isFinite(postAttackerSide?.activeIndex)
    ? postAttackerSide.activeIndex
    : refreshedAIdx;
  const postTeam = Array.isArray(postAttackerSide?.team) ? postAttackerSide.team : [];

  const clearedTeam = postTeam.map((p, i) => (i === postIdx ? clearConfuseAfterTurn(p) : p));
  workingState = {
    ...workingState,
    [attackerKey]: ensureSideActiveIsValid({ ...postAttackerSide, team: clearedTeam }),
  };

  workingState = finalizeBattleIfNeeded(workingState);

  return {
    ...workingState,
    lastTurnMessages: messages,
  };
};
