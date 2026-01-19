import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import OrderSelect from "./components/orderSelect";
import FirstDecision from "./components/firstDecision";
import BattleSide from "./components/battleSide";
import BattleResult from "./components/battleResult";

import { useDiceRoll } from "../../../engine/components/diceRoll/diceRoll";
import { useGame } from "../../../engine/gameContext/gameContext";

import { createBattleState, getTurnLabel, prepareStartOfTurn, TURN } from "./battleEngine";
import { MODAL_BUTTONS, useModal } from "../../../engine/ui/modal/modalContext";

import moves from "../../../assets/gameContent/moves";
import { createMoveMap } from "./battleMoveMap";
import { createTurnController } from "./battleTurnController";
import DebugMoveControls from "./components/DebugMoveControls";

import "./battle.scss";

const BATTLE_PHASE = {
  ORDER_SELECT: "ORDER_SELECT",
  FIRST_DECISION: "FIRST_DECISION",
  STARTED: "STARTED",
};

const clampNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const pickPersistedFieldsFromBattlePokemon = (battlePokemon) => {
  if (!battlePokemon || typeof battlePokemon !== "object") return null;

  return {
    health: clampNumber(battlePokemon.health, 0),
    maxHealth: clampNumber(battlePokemon.maxHealth, clampNumber(battlePokemon.health, 0)),
    fainted: !!battlePokemon.fainted,
    status: battlePokemon.status ?? undefined,
  };
};

const Battle = ({
  playerId = null,
  playerName = "Player",
  opponentName = "Opponent",
  playerTeam = [],
  opponentTeam = [],
  isEliteBattle = false,
}) => {
  const { rollDice, evenDiceRoll, minMaxDiceRoll } = useDiceRoll();
  const { setGameState } = useGame();
  const { openModal, closeModal } = useModal();

  // Capture initial teams ONCE so GameContext sync updates don't reset battle flow.
  const initialPlayerTeamRef = useRef(null);
  const initialOpponentTeamRef = useRef(null);

  if (!initialPlayerTeamRef.current) {
    initialPlayerTeamRef.current = Array.isArray(playerTeam)
      ? playerTeam.map((p) => ({ ...p }))
      : [];
  }

  if (!initialOpponentTeamRef.current) {
    initialOpponentTeamRef.current = Array.isArray(opponentTeam)
      ? opponentTeam.map((p) => ({ ...p }))
      : [];
  }

  const initialPlayerTeam = initialPlayerTeamRef.current;
  const initialOpponentTeam = initialOpponentTeamRef.current;

  // Toggle between "Debug" (manual controls + gated opponent) and "Normal" (player rolls, opponent auto rolls)
  const [debugManualControls, setDebugManualControls] = useState(true);

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
  const battleStateRef = useRef(null);
  battleStateRef.current = battleState;

  const getBattleState = useCallback(() => battleStateRef.current, []);

  // ============================
  // KO MODAL (faint -> auto switch) - robust detection
  // ============================
  const pendingKoModalRef = useRef(null);
  const lastKoSigRef = useRef("");

  const stageKoModalIfNeeded = (prev, next) => {
    if (!prev || !next) return;

    const computeEventForSide = (sideKey, labelName) => {
      const prevSide = prev?.[sideKey];
      const nextSide = next?.[sideKey];

      const prevTeam = Array.isArray(prevSide?.team) ? prevSide.team : [];
      const nextTeam = Array.isArray(nextSide?.team) ? nextSide.team : [];

      const prevIdx = Number.isFinite(prevSide?.activeIndex) ? prevSide.activeIndex : 0;
      const nextIdx = Number.isFinite(nextSide?.activeIndex) ? nextSide.activeIndex : 0;

      if (!prevTeam[prevIdx] || !nextTeam[nextIdx]) return null;

      // Only trigger when the active index actually changes
      if (prevIdx === nextIdx) return null;

      // KO detection: the pokemon that WAS active is now fainted (in the next state)
      const prevSlotInNext = nextTeam[prevIdx] || null;
      const wasKo = !!prevSlotInNext?.fainted || (Number(prevSlotInNext?.health) || 0) <= 0;

      if (!wasKo) return null;

      const faintedName = String(prevTeam[prevIdx]?.name || "Pokemon");
      const nextName = String(nextTeam[nextIdx]?.name || "Pokemon");

      const sig = `${sideKey}:${prevSlotInNext?.id || faintedName}:${nextTeam[nextIdx]?.id || nextName}:${nextIdx}`;
      if (lastKoSigRef.current === sig) return null;

      lastKoSigRef.current = sig;

      return `${faintedName} was knocked out. ${labelName} sent out ${nextName}.`;
    };

    // Usually only one side swaps per resolution; check player first, then opponent.
    const msg =
      computeEventForSide("player", playerName) || computeEventForSide("opponent", opponentName);

    if (msg) pendingKoModalRef.current = msg;
  };

  const setBattleStateWithKo = useCallback(
    (updater) => {
      setBattleState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        stageKoModalIfNeeded(prev, next);
        return next;
      });
    },
    [setBattleState]
  );

  // Show the KO modal after state updates (message staged in the updater above)
  useEffect(() => {
    const msg = pendingKoModalRef.current;
    if (!msg) return;

    pendingKoModalRef.current = null;

    openModal({
      title: "Pokemon Knocked Out",
      content: msg,
      buttons: MODAL_BUTTONS.OK,
      onClick: closeModal,
    });
  }, [battleState, openModal, closeModal]);

  // Create controller once; it uses refs + setters so it doesn't stale-close
  const controllerRef = useRef(null);
  if (!controllerRef.current) {
    controllerRef.current = createTurnController({
      getBattleState,
      setBattleState: setBattleStateWithKo,
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

    setBattleStateWithKo((prev) => {
      if (!prev || prev.status === "FINISHED") return prev;
      return prepareStartOfTurn(prev);
    });
  }, [battleState?.turn, battleState?.status, setBattleStateWithKo]);

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

  const toggleMode = useCallback(() => {
    setDebugManualControls((prev) => {
      const next = !prev;
      if (next) setOpponentAutoRequested(false);
      return next;
    });
  }, []);

  // Opponent auto-roll
  useEffect(() => {
    if (!battleState) return;
    if (battleState.turn !== TURN.OPPONENT) return;
    if (battleState.status === "FINISHED") return;
    if (isResolvingTurnRef.current) return;

    if (debugManualControls && !opponentAutoRequested) return;

    opponentTurnTokenRef.current += 1;
    const myToken = opponentTurnTokenRef.current;

    let cancelled = false;

    const run = async () => {
      try {
        await new Promise((resolve) => window.setTimeout(resolve, 350));

        if (cancelled) return;
        if (opponentTurnTokenRef.current !== myToken) return;

        if (debugManualControls) {
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
  }, [battleState, opponentAutoRequested, runTurn, debugManualControls]);

  // ============================
  // SYNC PLAYER TEAM BACK TO GAME CONTEXT (by __partyIndex)
  // ============================
  const lastSyncedSigRef = useRef("");

  useEffect(() => {
    if (!playerId) return;
    if (!battleState?.player?.team || !Array.isArray(battleState.player.team)) return;

    const team = battleState.player.team;

    // signature includes party index + hp/max + fainted
    const sig = team
      .map((p) => {
        const idx = Number.isFinite(Number(p?.__partyIndex)) ? Number(p.__partyIndex) : -1;
        return `${idx}:${clampNumber(p?.health, -1)}:${clampNumber(p?.maxHealth, -1)}:${p?.fainted ? 1 : 0}`;
      })
      .join("|");

    if (sig && lastSyncedSigRef.current === sig) return;
    lastSyncedSigRef.current = sig;

    setGameState((prev) => {
      const players = Array.isArray(prev?.players) ? prev.players : [];
      const pIndex = players.findIndex((pl) => pl?.id === playerId);
      if (pIndex === -1) return prev;

      const playerObj = players[pIndex];
      const party = Array.isArray(playerObj?.pokemon) ? playerObj.pokemon : [];
      if (party.length === 0) return prev;

      // Apply updates using the stable party index marker.
      let changed = false;
      const nextParty = party.map((pk, partyIdx) => {
        const battlePk = team.find((bp) => Number(bp?.__partyIndex) === partyIdx) || null;
        if (!battlePk) return pk;

        const persisted = pickPersistedFieldsFromBattlePokemon(battlePk);
        if (!persisted) return pk;

        // Only update if different to avoid pointless churn.
        const nextHealth = clampNumber(persisted.health, clampNumber(pk?.health, 0));
        const nextMax = clampNumber(persisted.maxHealth, clampNumber(pk?.maxHealth, nextHealth));

        const prevHealth = clampNumber(pk?.health, 0);
        const prevMax = clampNumber(pk?.maxHealth, prevHealth);

        const prevFainted = !!pk?.fainted;
        const nextFainted = !!persisted.fainted;

        const prevStatus = pk?.status;
        const nextStatus = persisted.status;

        const statusChanged =
          JSON.stringify(prevStatus || null) !== JSON.stringify(nextStatus || null);

        if (
          nextHealth !== prevHealth ||
          nextMax !== prevMax ||
          nextFainted !== prevFainted ||
          statusChanged
        ) {
          changed = true;
          return {
            ...pk,
            health: nextHealth,
            maxHealth: nextMax,
            fainted: nextFainted,
            status: nextStatus,
          };
        }

        return pk;
      });

      if (!changed) return prev;

      const nextPlayers = players.slice();
      nextPlayers[pIndex] = { ...playerObj, pokemon: nextParty };
      return { ...prev, players: nextPlayers };
    });
  }, [playerId, battleState, setGameState]);

  // ============================

  if (initialPlayerTeam.length === 0 || initialOpponentTeam.length === 0) {
    return (
      <div className="battle">
        <h1>Battle</h1>
        <p>No battle setup found.</p>
      </div>
    );
  }

  if (phase === BATTLE_PHASE.ORDER_SELECT) {
    return (
      <OrderSelect
        playerTeam={initialPlayerTeam}
        opponentTeam={initialOpponentTeam}
        onOrderComplete={handleOrderComplete}
        playerName={playerName}
        opponentName={opponentName}
      />
    );
  }

  if (phase === BATTLE_PHASE.FIRST_DECISION) {
    return (
      <FirstDecision
        onDecided={handleFirstDecided}
        onCancel={() => {}}
        playerName={playerName}
        opponentName={opponentName}
      />
    );
  }

  if (!battleState || !firstTurn) {
    return (
      <div className="battle">
        <h1>Battle</h1>
        <p>Battle state not ready.</p>
      </div>
    );
  }

  const turnLabel = battleState.turn === TURN.OPPONENT ? opponentName : playerName;

  return (
    <div className="battle">
      <h1>Battle</h1>

      {battleState.status === "FINISHED" ? (
        <BattleResult
          winner={battleState.winner}
          playerId={playerId}
          playerName={playerName}
          opponentName={opponentName}
          playerTeam={battleState?.player?.team || []}
          isEliteBattle={isEliteBattle}
        />
      ) : null}

      <div className="battle__turn">
        Turn: <strong>{turnLabel}</strong>
      </div>

      <div className="battle__controls">
        <div className="battle__controlBlock">
          <button
            type="button"
            onClick={toggleMode}
            disabled={isResolvingTurnRef.current}
            title="Toggle between Normal battle flow and Debug/manual controls"
          >
            Mode: {debugManualControls ? "Debug (Manual)" : "Normal (Auto Opponent)"}
          </button>
        </div>

        {battleState.turn === TURN.PLAYER ? (
          <div className="battle__controlBlock">
            <button
              type="button"
              onClick={handlePlayerRoll}
              disabled={isResolvingTurnRef.current || battleState.status === "FINISHED"}
            >
              Roll Dice (Select Move)
            </button>

            {debugManualControls ? (
              <DebugMoveControls
                side={TURN.PLAYER}
                isMyTurn={battleState.turn === TURN.PLAYER}
                disabled={isResolvingTurnRef.current || battleState.status === "FINISHED"}
                sideState={battleState.player}
                onManualSlot={(slot) => handleManualMove(TURN.PLAYER, slot)}
                playerName={playerName}
                opponentName={opponentName}
              />
            ) : null}
          </div>
        ) : (
          <div className="battle__controlBlock">
            {debugManualControls ? (
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

      <div className="battle__grid">
        <BattleSide sideState={battleState.player} isPlayer={true} />
        <BattleSide sideState={battleState.opponent} />
      </div>

      {Array.isArray(battleState.lastTurnMessages) && battleState.lastTurnMessages.length > 0 ? (
        <div className="battle__log">
          <div className="battle__logTitle">Turn Log</div>
          <div className="battle__logList">
            {battleState.lastTurnMessages.map((msg, idx) => (
              <div key={idx}>{msg}</div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Battle;
