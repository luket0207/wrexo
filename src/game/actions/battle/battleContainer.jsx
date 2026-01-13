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

const toNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const isUsableForBattle = (pokemon) => {
  // A pokemon with 0 (or less) health stays in party but cannot battle.
  const hp = toNumber(pokemon?.health, 0);
  return hp > 0;
};

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
  const { openModal, closeModal } = useModal();

  const [battleStarted, setBattleStarted] = useState(false);

  const action = gameState?.activeAction || null;
  const actionKey = String(action?.actionKey || "");

  // Prevent re-opening the intro modal on re-render for the same actionKey
  const shownForActionKeyRef = useRef(null);

  // Freeze teams for the duration of this battle action so the component
  // does NOT unmount when the player’s last usable Pokemon hits 0 HP.
  const frozenPlayerTeamRef = useRef(null);
  const frozenOpponentTeamRef = useRef(null);

  useEffect(() => {
    setBattleStarted(false);
    shownForActionKeyRef.current = null;
    frozenPlayerTeamRef.current = null;
    frozenOpponentTeamRef.current = null;
  }, [actionKey]);

  const playerId = useMemo(() => String(action?.playerId || "").trim() || null, [action?.playerId]);

  const player = useMemo(() => {
    const players = Array.isArray(gameState?.players) ? gameState.players : [];
    return players.find((p) => p?.id === playerId) || null;
  }, [gameState?.players, playerId]);

  const zoneCode = useMemo(() => {
    const raw = action?.zoneId ?? action?.zone ?? "EE";
    return String(raw).trim() || "EE";
  }, [action?.zoneId, action?.zone]);

  const playerTeam = useMemo(
    () => (Array.isArray(player?.pokemon) ? player.pokemon : []),
    [player?.pokemon]
  );

  // Build the battle-eligible team ONCE at battle start.
  // IMPORTANT: preserve original party indices via __partyIndex so battle sync maps back correctly.
  const usableTeamForBattle = useMemo(() => {
    const out = [];
    (Array.isArray(playerTeam) ? playerTeam : []).forEach((p, partyIndex) => {
      if (!isUsableForBattle(p)) return;
      out.push({ ...p, __partyIndex: partyIndex });
    });
    return out;
  }, [playerTeam]);

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
    // Freeze the teams at the moment battle begins.
    // This prevents the battle UI from disappearing when the player's last
    // usable Pokemon hits 0 HP (which would otherwise make usableTeamForBattle=[]).
    if (!frozenPlayerTeamRef.current) {
      frozenPlayerTeamRef.current = Array.isArray(usableTeamForBattle)
        ? usableTeamForBattle.map((p) => ({ ...p }))
        : [];
    }

    if (!frozenOpponentTeamRef.current) {
      frozenOpponentTeamRef.current =
        opponent?.ok && Array.isArray(opponent.team) ? opponent.team.map((p) => ({ ...p })) : [];
    }

    setBattleStarted(true);
  }, [usableTeamForBattle, opponent]);

  useEffect(() => {
    if (!actionKey) return;
    if (shownForActionKeyRef.current === actionKey) return;

    // NOTE: This effect is only for initial entry gating.
    // Once battleStarted, we do NOT want to auto-end or re-open anything.
    if (battleStarted) return;

    if (!player) {
      shownForActionKeyRef.current = actionKey;
      endActiveAction();
      return;
    }

    // Require at least one usable pokemon (hp > 0) to START a battle.
    // But do not enforce this after battle has started (battle must remain mounted until user exits).
    if (usableTeamForBattle.length === 0) {
      shownForActionKeyRef.current = actionKey;
      openModal({
        title: "Trainer Battle",
        content: "You need pokemon to take on a trainer battle",
        buttons: MODAL_BUTTONS.OK,
        onClick: endActiveAction,
      });
      return;
    }

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
      onClick: () => {
        closeModal();
        beginBattle();
      },
    });
  }, [
    actionKey,
    battleStarted,
    player,
    usableTeamForBattle.length,
    opponent,
    openModal,
    closeModal,
    endActiveAction,
    beginBattle,
  ]);

  // If battle hasn't started yet, don't render anything (modal drives entry).
  if (!battleStarted) return null;

  if (!playerId) return null;

  // Use frozen teams once battle has started.
  const frozenPlayerTeam = Array.isArray(frozenPlayerTeamRef.current)
    ? frozenPlayerTeamRef.current
    : [];
  const frozenOpponentTeam = Array.isArray(frozenOpponentTeamRef.current)
    ? frozenOpponentTeamRef.current
    : [];

  // IMPORTANT: Do NOT unmount battle if the current live team becomes empty.
  // The battle must remain mounted until the user clicks "Return to Board".
  if (frozenPlayerTeam.length === 0) return null;
  if (frozenOpponentTeam.length === 0) return null;

  return <Battle playerId={playerId} playerTeam={frozenPlayerTeam} opponentTeam={frozenOpponentTeam} />;
};

export default BattleContainer;
