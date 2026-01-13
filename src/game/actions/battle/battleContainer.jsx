// game/actions/battle/battleContainer.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useActions } from "../../../engine/gameContext/useActions";
import { useGame } from "../../../engine/gameContext/gameContext";
import { MODAL_BUTTONS, useModal } from "../../../engine/ui/modal/modalContext";

import pokemonDex from "../../../assets/gameContent/pokemon.jsx";
import { buildTrainerEncounter } from "./trainerPools";

import Battle from "./battle";

const getPokemonId = (p) => String(p?.id || p?.ID || "").trim();
const getPokemonName = (p) => String(p?.name || p?.Name || p?.pokemonName || "Pokemon").trim();

const findPokemonById = (dex, id) => {
  const arr = Array.isArray(dex) ? dex : [];
  const target = String(id || "").trim();
  if (!target) return null;

  return arr.find((p) => getPokemonId(p) === target) || null;
};

const cloneForBattle = (pokemonObj) => {
  if (!pokemonObj || typeof pokemonObj !== "object") return null;
  return { ...pokemonObj };
};

const BattleContainer = () => {
  const { endActiveAction } = useActions();
  const { gameState } = useGame();
  const { openModal } = useModal();

  const [battleStarted, setBattleStarted] = useState(false);

  const action = gameState?.activeAction || null;
  const actionKey = String(action?.actionKey || "");

  // Prevent re-opening the intro modal on re-render for the same actionKey
  const shownForActionKeyRef = useRef(null);

  useEffect(() => {
    // New action => reset local UI state
    setBattleStarted(false);
    shownForActionKeyRef.current = null;
  }, [actionKey]);

  const player = useMemo(() => {
    const playerId = action?.playerId || null;
    const players = Array.isArray(gameState?.players) ? gameState.players : [];
    return players.find((p) => p?.id === playerId) || null;
  }, [gameState?.players, action?.playerId]);

  const zoneCode = useMemo(() => {
    const raw = action?.zoneId ?? action?.zone ?? "EE";
    return String(raw).trim() || "EE";
  }, [action?.zoneId, action?.zone]);

  const playerTeam = useMemo(
    () => (Array.isArray(player?.pokemon) ? player.pokemon : []),
    [player?.pokemon]
  );

  const playerLevel = useMemo(() => Number(player?.level) || 1, [player?.level]);

  const opponent = useMemo(() => {
    const encounter = buildTrainerEncounter({ level: playerLevel, zoneCode });
    if (!encounter?.ok) return { ok: false, reason: encounter?.reason || "unknown" };

    const picked = findPokemonById(pokemonDex, encounter.pokemonId);
    if (!picked) {
      return {
        ok: false,
        reason: "pokemon_not_found_in_dex",
        trainer: encounter.trainer,
        pokemonId: encounter.pokemonId,
      };
    }

    const opponentTeam = [cloneForBattle(picked)].filter(Boolean);

    return {
      ok: true,
      trainer: encounter.trainer,
      trainerType: encounter.trainerType,
      pokemonId: encounter.pokemonId,
      pokemonName: getPokemonName(picked),
      team: opponentTeam,
    };
  }, [playerLevel, zoneCode]);

  const beginBattle = useCallback(() => {
    setBattleStarted(true);
  }, []);

  useEffect(() => {
    if (!actionKey) return;

    // prevent re-opening modal on re-render
    if (shownForActionKeyRef.current === actionKey) return;

    // If we somehow mount without a valid player, safely end the action.
    if (!player) {
      shownForActionKeyRef.current = actionKey;
      endActiveAction();
      return;
    }

    // No pokemon in party -> block trainer battle and advance turn via endActiveAction.
    if (playerTeam.length === 0) {
      shownForActionKeyRef.current = actionKey;
      openModal({
        title: "Trainer Battle",
        content: "You need pokemon to take on a trainer battle",
        buttons: MODAL_BUTTONS.OK,
        onClick: endActiveAction,
      });
      return;
    }

    // We have a party: generate opponent and announce battle.
    if (!opponent?.ok) {
      shownForActionKeyRef.current = actionKey;
      openModal({
        title: "Trainer Battle",
        content: "A trainer wants to battle you, but the encounter could not be generated.",
        buttons: MODAL_BUTTONS.OK,
        onClick: endActiveAction,
      });
      return;
    }

    shownForActionKeyRef.current = actionKey;
    openModal({
      title: "Trainer Battle",
      content: `A ${opponent.trainer} wants to battle you with their ${opponent.pokemonName}`,
      buttons: MODAL_BUTTONS.OK,
      onClick: beginBattle,
    });
  }, [actionKey, player, playerTeam.length, opponent, openModal, endActiveAction, beginBattle]);

  // Until user clicks OK on the intro modal, render nothing.
  if (!battleStarted) return null;

  // If something went wrong, fail closed.
  if (!Array.isArray(playerTeam) || playerTeam.length === 0) return null;
  if (!opponent?.ok || !Array.isArray(opponent.team) || opponent.team.length === 0) return null;

  return <Battle playerTeam={playerTeam} opponentTeam={opponent.team} />;
};

export default BattleContainer;