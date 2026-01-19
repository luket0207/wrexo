import React, { useEffect, useRef, useState } from "react";
import { useDiceRoll } from "../../../../engine/components/diceRoll/diceRoll";

const SAFETY_TIMEOUT_MS = 8000;

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const withSafetyTimeout = (promise, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error(`Timeout waiting for dice roll: ${label}`)), SAFETY_TIMEOUT_MS);
    }),
  ]);

const FirstDecision = ({ onDecided, onCancel, playerName = "Player", opponentName = "Opponent" }) => {
  const { rollDice } = useDiceRoll();

  const rollDiceRef = useRef(rollDice);
  const onDecidedRef = useRef(onDecided);

  const playerNameRef = useRef(playerName);
  const opponentNameRef = useRef(opponentName);

  useEffect(() => {
    rollDiceRef.current = rollDice;
  }, [rollDice]);

  useEffect(() => {
    onDecidedRef.current = onDecided;
  }, [onDecided]);

  useEffect(() => {
    playerNameRef.current = playerName;
  }, [playerName]);

  useEffect(() => {
    opponentNameRef.current = opponentName;
  }, [opponentName]);

  const [playerRoll, setPlayerRoll] = useState(null);
  const [opponentRoll, setOpponentRoll] = useState(null);
  const [status, setStatus] = useState("Rolling...");
  const [winner, setWinner] = useState(null);

  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let isCancelled = false;

    const decide = async () => {
      while (!isCancelled) {
        try {
          setStatus(`Rolling for ${playerNameRef.current}...`);
          const p = await withSafetyTimeout(
            rollDiceRef.current({
              min: 1,
              max: 6,
              sides: 6,
              rollDurationMs: 2000,
              autoCloseSeconds: 3,
              modalTitle: `${playerNameRef.current} Roll`,
            }),
            "player"
          );

          if (isCancelled) return;
          setPlayerRoll(p);

          // Give the modal system time to fully unmount the previous modal
          // before we open the next one.
          await sleep(300);
          if (isCancelled) return;

          setStatus(`Rolling for ${opponentNameRef.current}...`);
          const o = await withSafetyTimeout(
            rollDiceRef.current({
              min: 1,
              max: 6,
              sides: 6,
              rollDurationMs: 2000,
              autoCloseSeconds: 3,
              modalTitle: `${opponentNameRef.current} Roll`,
            }),
            "opponent"
          );

          if (isCancelled) return;
          setOpponentRoll(o);

          if (p > o) {
            setWinner("PLAYER");
            setStatus(`${playerNameRef.current} goes first.`);
            if (typeof onDecidedRef.current === "function") onDecidedRef.current("PLAYER");
            return;
          }

          if (o > p) {
            setWinner("OPPONENT");
            setStatus(`${opponentNameRef.current} goes first.`);
            if (typeof onDecidedRef.current === "function") onDecidedRef.current("OPPONENT");
            return;
          }

          setStatus("Draw. Rolling again...");
          await sleep(300);
        } catch (err) {
          console.error(err);
          if (isCancelled) return;
          setStatus("Error rolling dice. Cancelling...");
          return;
        }
      }
    };

    decide();

    return () => {
      isCancelled = true;
      startedRef.current = false;
    };
  }, []);

  return (
    <div>
      <h1>Battle Setup</h1>
      <h2 style={{ marginTop: "12px" }}>Who goes first?</h2>

      <div style={{ marginTop: "12px", opacity: 0.9 }}>
        <div>
          {playerName} roll: <strong>{playerRoll === null ? "-" : playerRoll}</strong>
        </div>
        <div>
          {opponentName} roll: <strong>{opponentRoll === null ? "-" : opponentRoll}</strong>
        </div>

        <div style={{ marginTop: "10px" }}>
          Status: <strong>{status}</strong>
        </div>

        {winner ? (
          <div style={{ marginTop: "10px" }}>
            Winner: <strong>{winner === "PLAYER" ? playerName : opponentName}</strong>
          </div>
        ) : null}
      </div>

      <div style={{ marginTop: "16px" }}>
        <button type="button" onClick={onCancel}>
          Cancel and Go Back
        </button>
      </div>
    </div>
  );
};

export default FirstDecision;
