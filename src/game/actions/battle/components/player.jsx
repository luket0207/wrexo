// Player.jsx
import React, { useMemo } from "react";
import Bars from "../../../../engine/ui/bars/bars";
import { getActivePokemon, getBenchPokemon } from "../battleEngine";
import "../battle.scss";

const MoveSlots = ({ pokemon }) => {
  const safeMoves = Array.isArray(pokemon?.battleMoves) ? pokemon.battleMoves : new Array(6).fill(null);
  const confuseSlots = Array.isArray(pokemon?.status?.confuseSlots) ? pokemon.status.confuseSlots : [];

  return (
    <div className="battle-moves">
      <div className="battle-moves__title">Moves</div>

      <div className="battle-moves__list">
        {safeMoves.map((moveName, idx) => {
          const isLocked = moveName === null;
          const slot = idx + 1;
          const isConfused = confuseSlots.includes(slot);

          return (
            <div
              key={`move-slot-${idx}`}
              className={`battle-moves__slot ${isLocked ? "is-locked" : ""} ${isConfused ? "is-confused" : ""}`}
            >
              <div className="battle-moves__slotIndex">{slot}</div>
              <div className="battle-moves__slotName">{isLocked ? "Locked" : moveName}</div>
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

const BenchList = ({ bench }) => {
  if (!bench || bench.length === 0) return <div>None</div>;

  return (
    <div className="battle-benchList">
      {bench.map((p) => (
        <div key={p.id} className={`battle-benchCard ${p.fainted ? "is-fainted" : ""}`}>
          <div className="battle-benchCard__name">
            <strong>{p.name}</strong> ({p.id})
          </div>
          <div className="battle-benchCard__meta">Lv {p.level}</div>
          <HpBar pokemon={p} />
        </div>
      ))}
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

const Player = ({ playerState }) => {
  const active = useMemo(() => getActivePokemon(playerState), [playerState]);
  const bench = useMemo(() => getBenchPokemon(playerState), [playerState]);

  return (
    <div className="battle-sideCard">
      <div className="battle-sideCard__current">
        <div className="battle-sideCard__activeLine">
          <strong>Active:</strong> {active ? `${active.name} (${active.id})` : "None"}
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
          <BenchList bench={bench} />
        </div>
      </div>
    </div>
  );
};

export default Player;
