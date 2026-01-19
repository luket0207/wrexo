// game/actions/battle/components/battleSide.jsx
import React, { useMemo } from "react";
import Bars from "../../../../engine/ui/bars/bars";
import { getActivePokemon, getBenchPokemon } from "../battleEngine";
import moves from "../../../../assets/gameContent/moves";
import { createMoveMap } from "../battleMoveMap";
import PokemonImage from "../../../components/pokemonImage/pokemonImage";
import "../battle.scss";
import pokeballImg from "../../../../assets/images/pokeball.png";

const formatStatusEffect = (effectName, effectStrengthRaw) => {
  const esNum = Number(effectStrengthRaw);
  const ES = Number.isFinite(esNum) ? esNum : 0;

  switch (effectName) {
    case "Burn":
      return `Burn the opponent for ${ES} turns.`;
    case "Paralyse":
      return `Paralyse the opponent for ${ES} turns.`;
    case "Poison":
      return `Poison the opponent for ${ES} turns.`;
    case "Confuse":
      return `Confuse ${ES} of the opponents moves next turn.`;
    case "Sleep":
      return `Send the opponent to sleep for ${ES} turns.`;
    case "Heal":
      return `Heal your pokemon by ${ES * 10}.`;
    case "RAE":
      return `Roll again, if even increase the attack by ${ES * 10}.`;
    case "RAM":
      return `Roll again, if 1 or 6 increase the attack by ${ES * 10}.`;
    case "RASELF":
      return `Roll again, if even you avoid recoil, if odd deal ${ES * 10} recoil damage.`;
    case "SELF":
      return `${ES * 10} recoil damage.`;
    case "SleepSELF":
    case "sleepSELF":
      return `Your pokemon falls asleep for ${ES} turns.`;
    default:
      return null;
  }
};

const getMoveDetailsString = (moveObj) => {
  if (!moveObj || typeof moveObj !== "object") return "";

  const dmg = Number(moveObj.damage);
  const hasDamage = Number.isFinite(dmg);
  const damageText = hasDamage ? `DMG: ${dmg}` : null;

  const effectsRaw = Array.isArray(moveObj.statusEffects)
    ? moveObj.statusEffects
    : typeof moveObj.statusEffect === "string"
      ? [
          {
            effect: moveObj.statusEffect,
            strength: moveObj.statusEffectStrength,
          },
        ]
      : [];

  const effectTexts = effectsRaw
    .map((e) => {
      const eff = String(e?.effect || "").trim();
      if (!eff) return null;
      return formatStatusEffect(eff, e?.strength);
    })
    .filter(Boolean);

  if (!damageText && effectTexts.length === 0) return "";

  return [damageText, ...effectTexts].filter(Boolean).join(" | ");
};

const MoveSlots = ({ pokemon }) => {
  const moveMap = useMemo(() => createMoveMap(moves), []);

  const safeMoves = Array.isArray(pokemon?.battleMoves)
    ? pokemon.battleMoves
    : new Array(6).fill(null);

  const confuseSlots = Array.isArray(pokemon?.status?.confuseSlots)
    ? pokemon.status.confuseSlots
    : [];

  return (
    <div className="battle-moves">
      <div className="battle-moves__title">Moves</div>

      <div className="battle-moves__list">
        {safeMoves.map((moveName, idx) => {
          const isLocked = moveName === null;
          const slot = idx + 1;
          const isConfused = confuseSlots.includes(slot);

          const moveObj = !isLocked && moveName ? moveMap[moveName] : null;
          const details = moveObj ? getMoveDetailsString(moveObj) : "";

          return (
            <div
              key={`move-slot-${idx}`}
              className={`battle-moves__slot ${isLocked ? "is-locked" : ""} ${
                isConfused ? "is-confused" : ""
              }`}
            >
              <div className="battle-moves__slotIndex">{slot}</div>

              <div className="battle-moves__slotName">{isLocked ? "Locked" : moveName}</div>

              {!isLocked && details ? (
                <div className="battle-moves__slotMeta">{details}</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HpBar = ({ pokemon }) => {
  if (!pokemon) return null;

  const max = Number.isFinite(pokemon.maxHealth) ? pokemon.maxHealth : Number(pokemon.health) || 0;
  const current = Number.isFinite(pokemon.health) ? pokemon.health : Number(pokemon.health) || 0;

  return (
    <div className="battle-hp">
      <Bars min={0} max={max} current={current} />
    </div>
  );
};

const StatusLine = ({ pokemon }) => {
  if (!pokemon) return null;

  const st = pokemon.status ?? {};
  const burn = Number(st.burn) || 0;
  const poison = Number(st.poison) || 0;
  const sleep = Number(st.sleep) || 0;
  const paralyse = Number(st.paralyse) || 0;
  const confusePending = Number(st.confusePending) || 0;
  const confuseSlots = Array.isArray(st.confuseSlots) ? st.confuseSlots : [];

  const parts = [];
  if (burn > 0) parts.push(`Burn ${burn}`);
  if (poison > 0) parts.push(`Poison ${poison}`);
  if (sleep > 0) parts.push(`Sleep ${sleep}`);
  if (paralyse > 0) parts.push(`Paralyse ${paralyse}`);
  if (confusePending > 0) parts.push(`Confuse ${confusePending}`);
  if (confuseSlots.length > 0) parts.push(`Confused slots: ${confuseSlots.join(",")}`);

  return (
    <div className="battle-sideCard__activeMeta">
      {parts.length > 0 ? parts.join(" • ") : "No status effects"}
    </div>
  );
};

const toNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const isAlive = (p) => toNumber(p?.health, 0) > 0;

// Replace BenchPokeBalls with this version (and stop passing `bench` in)

const BenchPokeBalls = ({ team, isPlayer = false }) => {
  const safeTeam = Array.isArray(team) ? team : [];
  const slots = [safeTeam[0] ?? null, safeTeam[1] ?? null, safeTeam[2] ?? null];

  return (
    <div className={`battle-benchBalls ${isPlayer ? "is-player" : ""}`}>
      {slots.map((p, idx) => {
        const state = !p ? "empty" : isAlive(p) ? "full" : "fainted";

        return (
          <div key={`party-slot-${idx}`} className={`battle-benchBall ${state}`}>
            <div className="battle-benchBall__circle">
              {state === "empty" ? null : (
                <img
                  className="battle-benchBall__img"
                  src={pokeballImg}
                  alt={state === "fainted" ? "Fainted Pokemon" : "Pokemon"}
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>

            {isPlayer ? <div className="battle-benchBall__name">{p ? p.name : ""}</div> : null}
          </div>
        );
      })}
    </div>
  );
};

// Pass isPlayer={true} for the player's side so sprites are "back" facing.
// Opponent can omit it (defaults false).
const BattleSide = ({ sideState, isPlayer = false }) => {
  const active = useMemo(() => getActivePokemon(sideState), [sideState]);
  const team = Array.isArray(sideState?.team) ? sideState.team : [];

  return (
    <div className="battle-sideCard">
      <div className="battle-sideCard__current">
        <div className="battle-sideCard__activeLine">
          {active ? (
            <>
              <PokemonImage
                pokemon={active}
                animate={true}
                back={isPlayer}
                shiny={active?.shiny}
                className="battle-sideCard__sprite"
                alt={active?.name || "Pokemon"}
              />
              <div className="battle-sideCard__activeText">
                <strong></strong> {`${active.name}`}
              </div>
            </>
          ) : (
            <>
              <strong>Active:</strong> None
            </>
          )}
        </div>

        {active ? (
          <>
            <div className="battle-sideCard__activeMeta">
              Lv {active.level} • {active.type} • {active.rarity}
            </div>

            <StatusLine pokemon={active} />

            <HpBar pokemon={active} />
            <MoveSlots pokemon={active} />
          </>
        ) : null}
      </div>

      <div className="battle-sideCard__bench">
        <strong>Bench:</strong>
        <div className="battle-sideCard__benchInner">
          <BenchPokeBalls team={team} isPlayer={isPlayer} />
        </div>
      </div>
    </div>
  );
};

export default BattleSide;
