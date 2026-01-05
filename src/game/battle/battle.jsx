// Battle.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import OrderSelect from "./components/orderSelect";
import FirstDecision from "./components/firstDecision";
import Player from "./components/player";
import Opponent from "./components/opponent";

import { createBattleState, getTurnLabel, prepareStartOfTurn, TURN } from "./battleEngine";
import { useDiceRoll } from "../../engine/components/diceRoll/diceRoll";

import moves from "../../assets/gameContent/moves";
import { createMoveMap } from "./battleMoveMap";
import { createTurnController } from "./battleTurnController";
import DebugMoveControls from "./components/DebugMoveControls";

import "./battle.scss";

const BATTLE_PHASE = {
  ORDER_SELECT: "ORDER_SELECT",
  FIRST_DECISION: "FIRST_DECISION",
  STARTED: "STARTED",
};

const DEBUG_MANUAL_CONTROLS = true;

const Battle = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { rollDice, evenDiceRoll, minMaxDiceRoll } = useDiceRoll();

  // Keep dice functions in refs for safety inside async flows
  const rollDiceRef = useRef(rollDice);
  const evenDiceRollRef = useRef(evenDiceRoll);
  const minMaxDiceRollRef = useRef(minMaxDiceRoll);

  useEffect(() => {
    rollDiceRef.current = rollDice;
  }, [rollDice]);

  useEffect(() => {
    evenDiceRollRef.current = evenDiceRoll;
  }, [evenDiceRoll]);

  useEffect(() => {
    minMaxDiceRollRef.current = minMaxDiceRoll;
  }, [minMaxDiceRoll]);

  const initialPlayerTeam = location.state?.playerTeam ?? [];
  const initialOpponentTeam = location.state?.opponentTeam ?? [];

  const [phase, setPhase] = useState(BATTLE_PHASE.ORDER_SELECT);

  const [playerTeamOrdered, setPlayerTeamOrdered] = useState([]);
  const [opponentTeamOrdered, setOpponentTeamOrdered] = useState([]);

  const [firstTurn, setFirstTurn] = useState(null);
  const [battleState, setBattleState] = useState(null);

  const [lastSelection, setLastSelection] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);

  // Used to prevent double-async executions
  const isResolvingTurnRef = useRef(false);

  // Opponent auto-roll gate for debug mode
  const [opponentAutoRequested, setOpponentAutoRequested] = useState(false);
  const opponentTurnTokenRef = useRef(0);

  const moveMap = useMemo(() => createMoveMap(moves), []);

  // Provide a "live" getter so controller always sees latest state
  const battleStateRef = useRef(battleState);
  useEffect(() => {
    battleStateRef.current = battleState;
  }, [battleState]);

  const getBattleState = useCallback(() => battleStateRef.current, []);

  // Create controller once; it uses refs + setters so it doesn't stale-close
  const controllerRef = useRef(null);
  if (!controllerRef.current) {
    controllerRef.current = createTurnController({
      getBattleState,
      setBattleState,
      setLastSelection,
      setCurrentAction,
      isResolvingTurnRef,
      moveMap,
      rollDiceRef,
      evenDiceRollRef,
      minMaxDiceRollRef,
      actionDelayMs: 3000,
    });
  }

  const runTurn = useCallback(async ({ side, forcedSlot = null }) => {
    if (!controllerRef.current) return;
    await controllerRef.current.runTurn({ side, forcedSlot });
  }, []);

  // Ensure confuse slots are prepared at START of each turn so UI can show them.
  useEffect(() => {
    if (!battleState) return;
    if (battleState.status === "FINISHED") return;

    setBattleState((prev) => {
      if (!prev || prev.status === "FINISHED") return prev;
      return prepareStartOfTurn(prev);
    });
  }, [battleState?.turn, battleState?.status]);

  const handleOrderComplete = useCallback(({ playerTeamOrdered: p, opponentTeamOrdered: o }) => {
    setPlayerTeamOrdered(p);
    setOpponentTeamOrdered(o);
    setPhase(BATTLE_PHASE.FIRST_DECISION);
  }, []);

  const handleFirstDecided = useCallback(
    (winner) => {
      const turn = winner === "OPPONENT" ? TURN.OPPONENT : TURN.PLAYER;
      setFirstTurn(turn);

      const nextState = createBattleState({
        playerTeamOrdered,
        opponentTeamOrdered,
        firstTurn: turn,
      });

      setBattleState(nextState);
      setLastSelection(null);
      setCurrentAction(null);
      setOpponentAutoRequested(false);
      setPhase(BATTLE_PHASE.STARTED);
    },
    [playerTeamOrdered, opponentTeamOrdered]
  );

  const handlePlayerRoll = useCallback(async () => {
    await runTurn({ side: TURN.PLAYER });
  }, [runTurn]);

  const handleManualMove = useCallback(
    async (side, slot) => {
      await runTurn({ side, forcedSlot: slot });
    },
    [runTurn]
  );

  const requestOpponentAutoRoll = useCallback(() => {
    setOpponentAutoRequested(true);
  }, []);

  // Opponent auto-roll
  useEffect(() => {
    if (!battleState) return;
    if (battleState.turn !== TURN.OPPONENT) return;
    if (battleState.status === "FINISHED") return;
    if (isResolvingTurnRef.current) return;

    // In debug mode, opponent only auto-rolls after user clicks "Continue Auto Roll"
    if (DEBUG_MANUAL_CONTROLS && !opponentAutoRequested) return;

    opponentTurnTokenRef.current += 1;
    const myToken = opponentTurnTokenRef.current;

    let cancelled = false;

    const run = async () => {
      try {
        // Slight buffer to allow modal stacks to close cleanly
        await new Promise((resolve) => window.setTimeout(resolve, 350));

        if (cancelled) return;
        if (opponentTurnTokenRef.current !== myToken) return;

        if (DEBUG_MANUAL_CONTROLS) {
          setOpponentAutoRequested(false);
        }

        await runTurn({ side: TURN.OPPONENT });
      } catch (e) {
        console.error(e);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [battleState, opponentAutoRequested, runTurn]);

  if (initialPlayerTeam.length === 0 || initialOpponentTeam.length === 0) {
    return (
      <div className="battle">
        <h1>Battle</h1>
        <p>No battle setup found.</p>
        <button type="button" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  if (phase === BATTLE_PHASE.ORDER_SELECT) {
    return (
      <OrderSelect
        playerTeam={initialPlayerTeam}
        opponentTeam={initialOpponentTeam}
        onOrderComplete={handleOrderComplete}
      />
    );
  }

  if (phase === BATTLE_PHASE.FIRST_DECISION) {
    return <FirstDecision onDecided={handleFirstDecided} onCancel={() => navigate(-1)} />;
  }

  if (!battleState || !firstTurn) {
    return (
      <div className="battle">
        <h1>Battle</h1>
        <p>Battle state not ready.</p>
        <button type="button" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  const turnLabel = getTurnLabel(battleState.turn);

  return (
    <div className="battle">
      <h1>Battle</h1>

      {battleState.status === "FINISHED" ? (
        <div className="battle__banner">
          <strong>
            Battle Over! Winner: {battleState.winner === TURN.PLAYER ? "Player" : "Opponent"}
          </strong>
        </div>
      ) : null}

      <div className="battle__turn">
        Turn: <strong>{turnLabel}</strong>
      </div>

      <div className="battle__controls">
        {battleState.turn === TURN.PLAYER ? (
          <div className="battle__controlBlock">
            <button
              type="button"
              onClick={handlePlayerRoll}
              disabled={isResolvingTurnRef.current || battleState.status === "FINISHED"}
            >
              Roll Dice (Select Move)
            </button>

            {DEBUG_MANUAL_CONTROLS ? (
              <DebugMoveControls
                side={TURN.PLAYER}
                isMyTurn={battleState.turn === TURN.PLAYER}
                disabled={isResolvingTurnRef.current || battleState.status === "FINISHED"}
                sideState={battleState.player}
                onManualSlot={(slot) => handleManualMove(TURN.PLAYER, slot)}
              />
            ) : null}
          </div>
        ) : (
          <div className="battle__controlBlock">
            {DEBUG_MANUAL_CONTROLS ? (
              <>
                <button
                  type="button"
                  onClick={requestOpponentAutoRoll}
                  disabled={isResolvingTurnRef.current || battleState.status === "FINISHED"}
                >
                  Continue Auto Roll
                </button>

                <DebugMoveControls
                  side={TURN.OPPONENT}
                  isMyTurn={battleState.turn === TURN.OPPONENT}
                  disabled={isResolvingTurnRef.current || battleState.status === "FINISHED"}
                  sideState={battleState.opponent}
                  onManualSlot={(slot) => handleManualMove(TURN.OPPONENT, slot)}
                />
              </>
            ) : (
              <div className="battle__opponentStatus">
                {battleState.status === "FINISHED"
                  ? "Battle finished."
                  : isResolvingTurnRef.current
                  ? "Opponent is acting..."
                  : "Opponent is rolling..."}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="battle__selection">
        Selected move:{" "}
        {lastSelection ? (
          <strong>
            {lastSelection.side === TURN.PLAYER ? "Player" : "Opponent"} selected{" "}
            {lastSelection.diceRoll ?? "-"} (slot {lastSelection.slot ?? "-"}) -{" "}
            {lastSelection.moveName ?? "Locked"}
          </strong>
        ) : (
          <span className="battle__muted">None yet</span>
        )}
      </div>

      <div className="battle__action">
        Current action:{" "}
        {currentAction ? (
          <strong>
            {currentAction.side === TURN.PLAYER ? "Player" : "Opponent"} executing{" "}
            {currentAction.moveName ?? "Locked"}...
          </strong>
        ) : (
          <span className="battle__muted">None</span>
        )}
      </div>

      {Array.isArray(battleState.lastTurnMessages) && battleState.lastTurnMessages.length > 0 ? (
        <div className="battle__log">
          <div className="battle__logTitle">Turn log</div>
          <div className="battle__logList">
            {battleState.lastTurnMessages.map((m, i) => (
              <div key={`turn-msg-${i}`}>{m}</div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="battle__grid">
        <Player playerState={battleState.player} />
        <Opponent opponentState={battleState.opponent} />
      </div>
    </div>
  );
};

export default Battle;
