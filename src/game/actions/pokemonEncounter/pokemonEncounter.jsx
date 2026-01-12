// game/actions/pokemonEncounter/pokemonEncounter.jsx
import React, { useMemo, useState, useCallback } from "react";
import { useActions } from "../../../engine/gameContext/useActions";
import { useGame } from "../../../engine/gameContext/gameContext";
import { randomInt } from "../../../engine/utils/rng/rng";

import pokemonDex from "../../../assets/gameContent/pokemon.jsx";

import { CATCH_OUTCOME, resolveCatchAttempt } from "./hooks/catchCalculation";
import { useBallInventory } from "./hooks/useBallInventory";

import PokemonImage from "../../components/pokemonImage/pokemonImage";
import CatchAnimation from "./components/catchAnimation";

import { useModal } from "../../../engine/ui/modal/modalContext";

import { useEncounterSelection } from "./hooks/useEncounterSelection";
import { useCatchAnimationSequence } from "./hooks/useCatchAnimationSequence";
import { usePartyFullModal } from "./hooks/usePartyFullModal";

const TEAM_MAX = 3;

const PokemonEncounter = () => {
  const { endActiveAction } = useActions();
  const { gameState, addPokemonToTeam, setGameState, removeEventFromPlayer } = useGame();

  const { openModal, closeModal } = useModal();
  const { openPartyFullModal } = usePartyFullModal({ openModal, closeModal });

  const action = gameState?.activeAction;

  const player = useMemo(() => {
    const players = Array.isArray(gameState?.players) ? gameState.players : [];
    return players.find((p) => p?.id === action?.playerId) || null;
  }, [gameState?.players, action?.playerId]);

  const zoneId = useMemo(() => {
    const raw = action?.zoneId;
    if (typeof raw === "string") return raw;
    if (raw && typeof raw === "object" && typeof raw.code === "string") return raw.code;
    return "EE";
  }, [action?.zoneId]);

  const locationType = action?.locationType || "grass";
  const tileId = action?.tileId || null;
  const tileType = action?.tileType || null;
  const actionKey = action?.actionKey || null;

  const { encounter } = useEncounterSelection({
    pokemonDex,
    player,
    zoneId,
    locationType,
    tileId,
    tileType,
    actionKey,
    removeEventFromPlayer,
  });

  const team = useMemo(() => (Array.isArray(player?.pokemon) ? player.pokemon : []), [player?.pokemon]);
  const teamIsFull = team.length >= TEAM_MAX;

  const [isThrowing, setIsThrowing] = useState(false);
  const [awaitingOk, setAwaitingOk] = useState(false);
  const [lastOutcome, setLastOutcome] = useState(null);

  const { phase: catchPhase, play: playCatchAnimation, clear: clearCatchAnimation } =
    useCatchAnimationSequence();

  const playerItems = Array.isArray(player?.items) ? player.items : [];
  const ballInv = useBallInventory({
    playerId: player?.id || null,
    items: playerItems,
    setGameState,
  });

  const doThrow = useCallback(
    async ({ ballBonus, title, forceRate6 = false, consumeFn = null }) => {
      if (!player?.id || !encounter) return;
      if (isThrowing || awaitingOk) return;

      let removedItem = null;
      if (typeof consumeFn === "function") {
        removedItem = consumeFn();
        if (!removedItem) return;
      }

      setIsThrowing(true);
      setAwaitingOk(false);
      setLastOutcome(null);
      clearCatchAnimation();

      try {
        const rollFn = () => randomInt(1, 6);

        const result = await resolveCatchAttempt({
          catchRate: encounter.catchRate,
          ballBonus,
          rollDice: rollFn,
          title,
          forceRate6,
        });

        setLastOutcome(result.outcome);
        await playCatchAnimation(result.outcome);

        if (result.outcome === CATCH_OUTCOME.ESCAPE) {
          setLastOutcome(null);
          clearCatchAnimation();
          return;
        }

        if (result.outcome === CATCH_OUTCOME.CATCH) {
          clearCatchAnimation();

          if (teamIsFull) {
            openPartyFullModal({
              player,
              encounter,
              onReplaceIndex: (replaceIndex) => {
                addPokemonToTeam(player.id, encounter, { mode: "replace", replaceIndex });
                endActiveAction();
              },
              onDiscardNew: () => {
                endActiveAction();
              },
            });
            return;
          }

          setAwaitingOk(true);
          return;
        }

        setAwaitingOk(true);
      } catch (err) {
        if (removedItem) ballInv.refund(removedItem);
        throw err;
      } finally {
        setIsThrowing(false);
      }
    },
    [
      player,
      encounter,
      isThrowing,
      awaitingOk,
      clearCatchAnimation,
      playCatchAnimation,
      teamIsFull,
      openPartyFullModal,
      addPokemonToTeam,
      endActiveAction,
      ballInv,
    ]
  );

  const onOk = useCallback(() => {
    if (!player?.id || !encounter) return;

    if (lastOutcome === CATCH_OUTCOME.CATCH) {
      const currentTeam = Array.isArray(player?.pokemon) ? player.pokemon : [];
      if (currentTeam.length < TEAM_MAX) addPokemonToTeam(player.id, encounter);
    }

    endActiveAction();
  }, [player?.id, player?.pokemon, encounter, lastOutcome, addPokemonToTeam, endActiveAction]);

  const throwDisabled = !encounter || isThrowing || awaitingOk;

  return (
    <div style={{ padding: "16px" }}>
      <h1>Pokemon Encounter</h1>

      <div style={{ marginBottom: "12px" }}>
        <strong>Player:</strong> {player?.name || "Unknown"} (Level {player?.level || 1})
      </div>

      {encounter ? (
        <div style={{ marginBottom: "12px" }}>
          <PokemonImage
            pokemon={encounter}
            animate
            back={false}
            style={{ width: 96, height: 96, imageRendering: "pixelated" }}
          />
          <div><strong>Encounter:</strong> {encounter.name} ({encounter.id})</div>
          <div><strong>Type:</strong> {encounter.type}</div>
          <div><strong>Rarity:</strong> {encounter.rarity}</div>
          <div><strong>Level:</strong> {encounter.level}</div>
          <div><strong>HP:</strong> {encounter.health}</div>
          <div><strong>Catch Rate:</strong> {encounter.catchRate}</div>
        </div>
      ) : (
        <div style={{ marginBottom: "12px" }}>No Pokemon available to encounter (dex is empty).</div>
      )}

      {catchPhase ? <CatchAnimation phase={catchPhase} /> : null}

      {awaitingOk ? (
        <div style={{ marginBottom: "12px" }}>
          <button type="button" onClick={onOk}>Ok</button>
        </div>
      ) : null}

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button type="button" onClick={endActiveAction} disabled={isThrowing || awaitingOk}>
          Back to Board
        </button>

        <button
          type="button"
          disabled={throwDisabled}
          onClick={() => doThrow({ ballBonus: 0, title: "Throwing Poke Ball" })}
        >
          Throw Ball
        </button>

        {ballInv.canUse.great ? (
          <button
            type="button"
            disabled={throwDisabled}
            onClick={() => doThrow({ ballBonus: 1, title: "Throwing Great Ball", consumeFn: ballInv.consume.great })}
          >
            Great Ball
          </button>
        ) : null}

        {ballInv.canUse.ultra ? (
          <button
            type="button"
            disabled={throwDisabled}
            onClick={() => doThrow({ ballBonus: 2, title: "Throwing Ultra Ball", consumeFn: ballInv.consume.ultra })}
          >
            Ultra Ball
          </button>
        ) : null}

        {ballInv.canUse.master ? (
          <button
            type="button"
            disabled={throwDisabled}
            onClick={() =>
              doThrow({ ballBonus: 0, title: "Throwing Master Ball", forceRate6: true, consumeFn: ballInv.consume.master })
            }
          >
            Master Ball
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default PokemonEncounter;
