// game/start/start.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./start.scss";

import { useDiceRoll } from "../../engine/components/diceRoll/diceRoll";

const COLOUR_OPTIONS = Object.freeze([
  { label: "Red", value: "red" },
  { label: "Blue", value: "blue" },
  { label: "Green", value: "green" },
  { label: "Yellow", value: "yellow" },
]);

const SAFETY_TIMEOUT_MS = 8000;

const clampInt = (n, min, max) => Math.max(min, Math.min(max, n));

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const withSafetyTimeout = (promise, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(
        () => reject(new Error(`Timeout waiting for dice roll: ${label}`)),
        SAFETY_TIMEOUT_MS
      );
    }),
  ]);

const makeDefaultPlayers = (count) => {
  const safeCount = clampInt(Number(count) || 2, 2, 4);
  const defaultColours = ["red", "blue", "green", "yellow"];

  return new Array(safeCount).fill(null).map((_, i) => ({
    name: `Player ${i + 1}`,
    color: defaultColours[i] || "red",
  }));
};

const ensureUniqueColours = (players) => {
  const used = new Set();
  const fallback = ["red", "blue", "green", "yellow"];

  return players.map((p) => {
    const desired = String(p.color || "").trim() || "red";
    if (!used.has(desired)) {
      used.add(desired);
      return { ...p, color: desired };
    }

    const next = fallback.find((c) => !used.has(c)) || desired;
    used.add(next);
    return { ...p, color: next };
  });
};

const rotatePlayersSoFirst = (players, firstIndex) => {
  const arr = Array.isArray(players) ? players : [];
  const n = arr.length;
  if (!n) return arr;

  const idx = ((Number(firstIndex) || 0) % n + n) % n;
  return [...arr.slice(idx), ...arr.slice(0, idx)];
};

// Pick an available colour. Prefer desired if free, otherwise first free, otherwise desired.
const pickAvailableColour = ({ desired, usedSet }) => {
  const want = String(desired || "").trim();
  const all = COLOUR_OPTIONS.map((c) => c.value);

  if (want && !usedSet.has(want)) return want;

  const firstFree = all.find((c) => !usedSet.has(c));
  return firstFree || want || all[0] || "red";
};

const Start = () => {
  const navigate = useNavigate();
  const { rollDice } = useDiceRoll();

  const rollDiceRef = useRef(rollDice);
  useEffect(() => {
    rollDiceRef.current = rollDice;
  }, [rollDice]);

  const [playerCount, setPlayerCount] = useState(2);
  const [players, setPlayers] = useState(() =>
    ensureUniqueColours(makeDefaultPlayers(2))
  );

  // Pre-start roll state
  const [isDecidingOrder, setIsDecidingOrder] = useState(false);
  const [status, setStatus] = useState("");
  const [rollsByIndex, setRollsByIndex] = useState(() => ({}));
  const [startingIndex, setStartingIndex] = useState(null);

  const setCount = useCallback((nextCount) => {
    const safeCount = clampInt(Number(nextCount) || 2, 2, 4);

    setPlayerCount(safeCount);
    setPlayers((prev) => {
      const base = Array.isArray(prev) ? prev : [];
      const expanded = new Array(safeCount).fill(null).map((_, i) => {
        return base[i] || makeDefaultPlayers(safeCount)[i];
      });

      return ensureUniqueColours(expanded);
    });

    // Reset any previous pre-start decision state
    setIsDecidingOrder(false);
    setStatus("");
    setRollsByIndex({});
    setStartingIndex(null);
  }, []);

  const updatePlayer = useCallback((index, patch) => {
    setPlayers((prev) => {
      const base = Array.isArray(prev) ? prev : [];
      const copy = [...base];

      const current = copy[index] || {
        name: `Player ${index + 1}`,
        color: "red",
      };

      // First apply patch
      const nextPlayer = { ...current, ...patch };
      copy[index] = nextPlayer;

      // If colour changed, enforce uniqueness by adjusting THIS player only.
      if (patch && Object.prototype.hasOwnProperty.call(patch, "color")) {
        const used = new Set(
          copy
            .filter((_, i) => i !== index)
            .map((p) => String(p?.color || "").trim())
            .filter(Boolean)
        );

        const fixedColour = pickAvailableColour({
          desired: nextPlayer.color,
          usedSet: used,
        });

        copy[index] = { ...nextPlayer, color: fixedColour };
      }

      // Also ensure we didn't inherit duplicates from older state edits
      return ensureUniqueColours(copy);
    });

    // Editing player details invalidates previous roll-to-start result
    setIsDecidingOrder(false);
    setStatus("");
    setRollsByIndex({});
    setStartingIndex(null);
  }, []);

  const activePlayers = useMemo(
    () => players.slice(0, playerCount),
    [players, playerCount]
  );

  const canStart = useMemo(() => {
    if (activePlayers.length < 2 || activePlayers.length > 4) return false;
    return activePlayers.every((p) => String(p?.name || "").trim().length > 0);
  }, [activePlayers]);

  const decideStartingPlayerIndex = useCallback(async () => {
    // Returns the index (0..playerCount-1) of the player who starts.
    // Tie handling: if highest roll is tied, only tied players reroll until resolved.

    const contenders = () => {
      const keys = Object.keys(rollsByIndexRef.current || {});
      return keys.map((k) => Number(k)).filter((n) => Number.isFinite(n));
    };

    // We use refs to avoid stale closure issues inside the loop.
  }, []);

  const isCancellingRef = useRef(false);
  const rollsByIndexRef = useRef(rollsByIndex);
  useEffect(() => {
    rollsByIndexRef.current = rollsByIndex;
  }, [rollsByIndex]);

  const onStart = useCallback(async () => {
    if (!canStart) return;
    if (isDecidingOrder) return;

    setIsDecidingOrder(true);
    setStatus("Rolling to decide who starts...");
    setRollsByIndex({});
    setStartingIndex(null);

    isCancellingRef.current = false;

    // Ensure uniqueness right before starting (safety net)
    const uniquePlayers = ensureUniqueColours(activePlayers);

    const safePlayers = uniquePlayers.map((p, i) => ({
      name: String(p?.name || `Player ${i + 1}`).trim(),
      color: String(p?.color || "red").trim(),
    }));

    try {
      let contenderIndexes = safePlayers.map((_, i) => i);

      while (!isCancellingRef.current) {
        const roundRolls = {};

        // Roll for each contender in order
        // (contenders might be a subset in tie-break rounds)
        for (let i = 0; i < contenderIndexes.length; i += 1) {
          const idx = contenderIndexes[i];
          const playerName = safePlayers[idx]?.name || `Player ${idx + 1}`;

          setStatus(`Rolling for ${playerName}...`);

          const result = await withSafetyTimeout(
            rollDiceRef.current({
              min: 1,
              max: 6,
              sides: 6,
              rollDurationMs: 2000,
              autoCloseSeconds: 3,
              title: `${playerName} - Starting Roll`,
            }),
            `player-${idx}`
          );

          if (isCancellingRef.current) return;

          roundRolls[idx] = result;

          // Update UI roll tracking (store latest roll per player index)
          setRollsByIndex((prev) => ({ ...prev, [idx]: result }));

          // Modal unmount buffer
          // eslint-disable-next-line no-await-in-loop
          await sleep(300);
          if (isCancellingRef.current) return;
        }

        // Determine highest among contenders for this round
        const values = contenderIndexes.map((idx) => roundRolls[idx]);
        const max = Math.max(...values);

        const tied = contenderIndexes.filter((idx) => roundRolls[idx] === max);

        if (tied.length === 1) {
          const winnerIdx = tied[0];
          setStartingIndex(winnerIdx);

          const winnerName = safePlayers[winnerIdx]?.name || `Player ${winnerIdx + 1}`;
          setStatus(`${winnerName} goes first.`);

          // Rotate players so winner starts, but relative order remains the same.
          const rotated = rotatePlayersSoFirst(safePlayers, winnerIdx);

          await sleep(300);
          if (isCancellingRef.current) return;

          navigate("/game", {
            state: {
              players: rotated,
            },
          });

          return;
        }

        // Tie for highest: only tied players re-roll
        const tiedNames = tied
          .map((idx) => safePlayers[idx]?.name || `Player ${idx + 1}`)
          .join(", ");

        setStatus(`Tie for highest between: ${tiedNames}. Rolling again...`);
        contenderIndexes = tied;

        await sleep(400);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);

      setStatus("Error rolling dice. Please try again.");
      setIsDecidingOrder(false);
      return;
    }
  }, [activePlayers, canStart, isDecidingOrder, navigate]);

  useEffect(() => {
    return () => {
      isCancellingRef.current = true;
    };
  }, []);

  // Compute taken colours for disabling options in the UI (active players only)
  const takenColoursByIndex = useMemo(() => {
    const taken = new Map();
    activePlayers.forEach((p, idx) => {
      const c = String(p?.color || "").trim();
      if (!c) return;
      const arr = taken.get(c) || [];
      arr.push(idx);
      taken.set(c, arr);
    });
    return taken;
  }, [activePlayers]);

  return (
    <div className="startRoot">
      <div className="startCard">
        <h1 className="startTitle">New Game</h1>
        <p className="startSubtitle">Choose player count, names, and colours to begin.</p>

        <div className="startRow">
          <label className="startLabel">Players</label>
          <select
            className="startSelect"
            value={playerCount}
            onChange={(e) => setCount(e.target.value)}
            disabled={isDecidingOrder}
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </div>

        <div className="playersEditor">
          {activePlayers.map((p, idx) => (
            <div key={idx} className="playerEditorRow">
              <div className="playerEditorHeader">
                <div className="playerEditorTitle">Player {idx + 1}</div>
                <span className="playerEditorSwatch" style={{ backgroundColor: p.color }} />
              </div>

              <div className="playerEditorFields">
                <div className="field">
                  <label className="fieldLabel">Name</label>
                  <input
                    className="fieldInput"
                    type="text"
                    value={p.name}
                    disabled={isDecidingOrder}
                    onChange={(e) => updatePlayer(idx, { name: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label className="fieldLabel">Colour</label>
                  <select
                    className="fieldSelect"
                    value={p.color}
                    disabled={isDecidingOrder}
                    onChange={(e) => updatePlayer(idx, { color: e.target.value })}
                  >
                    {COLOUR_OPTIONS.map((c) => {
                      const users = takenColoursByIndex.get(c.value) || [];
                      const takenByOther = users.length > 0 && !users.includes(idx);

                      return (
                        <option key={c.value} value={c.value} disabled={takenByOther}>
                          {c.label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: "10px", opacity: 0.9 }}>
                Roll: <strong>{rollsByIndex[idx] === undefined ? "-" : rollsByIndex[idx]}</strong>
                {startingIndex === idx ? <span style={{ marginLeft: "10px" }}>(Starts)</span> : null}
              </div>
            </div>
          ))}
        </div>

        {status ? (
          <div style={{ marginTop: "10px", opacity: 0.9 }}>
            Status: <strong>{status}</strong>
          </div>
        ) : null}

        <button
          className="startButton"
          type="button"
          onClick={onStart}
          disabled={!canStart || isDecidingOrder}
        >
          {isDecidingOrder ? "Deciding turn order..." : "Start Game"}
        </button>
      </div>
    </div>
  );
};

export default Start;
