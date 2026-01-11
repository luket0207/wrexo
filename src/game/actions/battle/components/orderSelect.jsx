import React, { useCallback, useEffect, useMemo, useState } from "react";
import { randomInt } from "../../../../engine/utils/rng/rng";

const shuffleWithRng = (arr) => {
  const copy = Array.isArray(arr) ? [...arr] : [];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i); // inclusive
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
};

const OrderSelect = ({ playerTeam = [], opponentTeam = [], onOrderComplete }) => {
  const playerOptions = useMemo(() => playerTeam ?? [], [playerTeam]);
  const playerCount = playerOptions.length;

  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [third, setThird] = useState("");

  const selectedIds = useMemo(() => [first, second, third].filter(Boolean), [first, second, third]);

  const isIdTaken = useCallback(
    (id, currentValue) => {
      if (!id) return false;
      return selectedIds.includes(id) && id !== currentValue;
    },
    [selectedIds]
  );

  const [opponentOrder, setOpponentOrder] = useState([]);

  useEffect(() => {
    setOpponentOrder(shuffleWithRng(opponentTeam));
  }, [opponentTeam]);

  // If team sizes are 1, skip ordering entirely.
  useEffect(() => {
    if (playerCount === 1) {
      if (typeof onOrderComplete === "function") {
        onOrderComplete({
          playerTeamOrdered: playerOptions,
          opponentTeamOrdered: opponentOrder.length > 0 ? opponentOrder : shuffleWithRng(opponentTeam),
        });
      }
    }
  }, [playerCount, playerOptions, opponentOrder, opponentTeam, onOrderComplete]);

  const requiredSelections = useMemo(() => Math.min(3, Math.max(0, playerCount)), [playerCount]);

  const isReady = selectedIds.length === requiredSelections && requiredSelections > 0;

  const handleSubmit = useCallback(() => {
    if (requiredSelections === 0) return;

    // For 1 Pokemon, we auto-submit via effect above.
    if (requiredSelections === 1) return;

    if (!isReady) return;

    const playerById = new Map(playerTeam.map((p) => [p.id, p]));
    const ids = [first, second, third].filter(Boolean).slice(0, requiredSelections);
    const playerTeamOrdered = ids.map((id) => playerById.get(id)).filter(Boolean);

    if (typeof onOrderComplete === "function") {
      onOrderComplete({
        playerTeamOrdered,
        opponentTeamOrdered: opponentOrder,
      });
    }
  }, [
    requiredSelections,
    isReady,
    first,
    second,
    third,
    playerTeam,
    opponentOrder,
    onOrderComplete,
  ]);

  const renderSelect = (label, value, setValue) => (
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      <label style={{ width: "80px" }}>{label}</label>

      <select value={value} onChange={(e) => setValue(e.target.value)} style={{ minWidth: "280px" }}>
        <option value="">-- Select Pokemon --</option>
        {playerOptions.map((p) => {
          const disabled = isIdTaken(p.id, value);
          const text = `${p.id} - ${p.name} (Lv ${p.level}, ${p.rarity})`;
          return (
            <option key={p.id} value={p.id} disabled={disabled}>
              {text}
            </option>
          );
        })}
      </select>

      {value ? (
        <button type="button" onClick={() => setValue("")}>
          Clear
        </button>
      ) : null}
    </div>
  );

  const resetAll = useCallback(() => {
    setFirst("");
    setSecond("");
    setThird("");
  }, []);

  // If 0 or 1, we do not need this UI.
  if (playerCount <= 1) {
    return (
      <div>
        <h1>Battle Setup</h1>
        <div style={{ marginTop: "12px", opacity: 0.85 }}>
          Player has {playerCount} Pokemon. Order selection {playerCount === 1 ? "is skipped" : "not required"}.
        </div>
        <div style={{ marginTop: "16px", opacity: 0.85 }}>
          <div>Opponent order is randomized automatically.</div>
          <div>
            (Current opponent order):{" "}
            {opponentOrder.length > 0 ? opponentOrder.map((p) => p.name).join(", ") : "None"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Battle Setup</h1>

      <h2 style={{ marginTop: "12px" }}>
        Choose Player Order ({requiredSelections} Pokemon)
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
        {renderSelect("1st", first, setFirst)}
        {renderSelect("2nd", second, setSecond)}
        {requiredSelections === 3 ? renderSelect("3rd", third, setThird) : null}

        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "8px" }}>
          <button type="button" onClick={handleSubmit} disabled={!isReady}>
            Submit Order
          </button>

          <button type="button" onClick={resetAll}>
            Reset
          </button>

          <span style={{ opacity: 0.8 }}>
            Selected: <strong>{selectedIds.length}</strong> / {requiredSelections}
          </span>
        </div>

        {!isReady ? (
          <div style={{ opacity: 0.75, fontSize: "14px" }}>
            Select {requiredSelections} unique Pokemon to enable submit.
          </div>
        ) : null}
      </div>

      <div style={{ marginTop: "16px", opacity: 0.85 }}>
        <div>Opponent order is randomized automatically.</div>
        <div>
          (Current opponent order):{" "}
          {opponentOrder.length > 0 ? opponentOrder.map((p) => p.name).join(", ") : "None"}
        </div>
      </div>
    </div>
  );
};

export default OrderSelect;
