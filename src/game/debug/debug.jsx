import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import pokemon from "../../assets/gameContent/pokemon";

const Debug = () => {
  const navigate = useNavigate();
  const options = useMemo(() => pokemon ?? [], []);

  // Player Team
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [p3, setP3] = useState("");

  // Opponent Team
  const [o1, setO1] = useState("");
  const [o2, setO2] = useState("");
  const [o3, setO3] = useState("");

  const selectedIds = useMemo(
    () => [p1, p2, p3, o1, o2, o3].filter(Boolean),
    [p1, p2, p3, o1, o2, o3]
  );

  const isIdTaken = useCallback(
    (id, currentSlotId) => {
      if (!id) return false;
      return selectedIds.includes(id) && id !== currentSlotId;
    },
    [selectedIds]
  );

  const byId = useMemo(() => new Map(options.map((p) => [p.id, p])), [options]);

  const handleStartBattle = useCallback(() => {
    const playerTeam = [p1, p2, p3].map((id) => byId.get(id)).filter(Boolean);
    const opponentTeam = [o1, o2, o3].map((id) => byId.get(id)).filter(Boolean);

    navigate("/battle", {
      state: {
        playerTeam,
        opponentTeam,
      },
    });
  }, [navigate, p1, p2, p3, o1, o2, o3, byId]);

  const renderSelect = (label, value, setValue) => (
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      <label style={{ width: "120px" }}>{label}</label>

      <select value={value} onChange={(e) => setValue(e.target.value)} style={{ minWidth: "260px" }}>
        <option value="">-- Select Pokemon --</option>

        {options.map((p) => {
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

  const playerCount = useMemo(() => [p1, p2, p3].filter(Boolean).length, [p1, p2, p3]);
  const opponentCount = useMemo(() => [o1, o2, o3].filter(Boolean).length, [o1, o2, o3]);

  // New rule: each side must have between 1 and 3 Pokemon
  const isReady = playerCount >= 1 && playerCount <= 3 && opponentCount >= 1 && opponentCount <= 3;

  const resetAll = useCallback(() => {
    setP1("");
    setP2("");
    setP3("");
    setO1("");
    setO2("");
    setO3("");
  }, []);

  return (
    <div>
      <h1>Debug Page</h1>

      <h2 style={{ marginTop: "16px" }}>Team Builder</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
        <div>
          <h3 style={{ margin: "0 0 8px 0" }}>Player Team</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {renderSelect("Player Slot 1", p1, setP1)}
            {renderSelect("Player Slot 2", p2, setP2)}
            {renderSelect("Player Slot 3", p3, setP3)}
          </div>
        </div>

        <div>
          <h3 style={{ margin: "0 0 8px 0" }}>Opponent Team</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {renderSelect("Opponent Slot 1", o1, setO1)}
            {renderSelect("Opponent Slot 2", o2, setO2)}
            {renderSelect("Opponent Slot 3", o3, setO3)}
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "8px" }}>
          <button type="button" onClick={handleStartBattle} disabled={!isReady}>
            Start Battle
          </button>

          <button type="button" onClick={resetAll}>
            Reset
          </button>

          <span style={{ opacity: 0.8 }}>
            Player: <strong>{playerCount}</strong> / 3 • Opponent: <strong>{opponentCount}</strong> / 3
          </span>
        </div>

        {!isReady && (
          <div style={{ opacity: 0.75, fontSize: "14px" }}>
            Pick between 1 and 3 unique Pokemon for each team to enable starting a battle.
          </div>
        )}
      </div>
    </div>
  );
};

export default Debug;
