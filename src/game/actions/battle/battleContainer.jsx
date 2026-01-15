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

const normalizePokemonForBattle = (pokemonObj) => {
  if (!pokemonObj || typeof pokemonObj !== "object") return null;

  const baseHealth = toNumber(pokemonObj.health, NaN);
  const baseMax = toNumber(pokemonObj.maxHealth, NaN);

  // Best-effort defaults: battle engine often expects numbers
  const maxHealth =
    Number.isFinite(baseMax)
      ? baseMax
      : Number.isFinite(baseHealth)
        ? baseHealth
        : toNumber(pokemonObj.hp, 10);

  const health =
    Number.isFinite(baseHealth)
      ? baseHealth
      : Number.isFinite(maxHealth)
        ? maxHealth
        : 10;

  return {
    ...pokemonObj,
    maxHealth,
    health,
  };
};

const validateOpponentPokemon = (pokemonObj) => {
  if (!pokemonObj || typeof pokemonObj !== "object") return { ok: false, reason: "missing_object" };

  const id = getPokemonId(pokemonObj);
  if (!id) return { ok: false, reason: "missing_id" };

  const hp = toNumber(pokemonObj.health, NaN);
  const max = toNumber(pokemonObj.maxHealth, NaN);

  if (!Number.isFinite(hp) || !Number.isFinite(max)) {
    return { ok: false, reason: "missing_health_fields", id, hp, max };
  }

  // If your battle engine requires specific move slots, you can tighten this later.
  // For now, just ensure object is sane.
  return { ok: true };
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
    const z = typeof raw === "string" ? raw : raw?.code;
    return String(z || "EE").trim().toUpperCase() || "EE";
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
    try {
      const encounter = buildTrainerEncounter({ level: playerLevel, zoneCode });

      if (!encounter?.ok) {
        console.error("BattleContainer: encounter not ok", { zoneCode, playerLevel, encounter });
        return { ok: false, reason: encounter?.reason || "unknown" };
      }

      const pickedRaw = findPokemonById(pokemonDex, encounter.pokemonId);

      if (!pickedRaw) {
        console.error("BattleContainer: pokemon not found in dex", {
          zoneCode,
          playerLevel,
          pokemonId: encounter.pokemonId,
          trainer: encounter.trainer,
        });

        return {
          ok: false,
          reason: "pokemon_not_found_in_dex",
          trainer: encounter.trainer,
          pokemonId: encounter.pokemonId,
        };
      }

      const picked = normalizePokemonForBattle({ ...pickedRaw });
      const validation = validateOpponentPokemon(picked);

      if (!validation.ok) {
        console.error("BattleContainer: opponent pokemon failed validation", {
          zoneCode,
          playerLevel,
          pokemonId: encounter.pokemonId,
          trainer: encounter.trainer,
          validation,
          picked,
        });

        return {
          ok: false,
          reason: "opponent_pokemon_invalid",
          trainer: encounter.trainer,
          pokemonId: encounter.pokemonId,
          validation,
        };
      }

      const opponentTeam = [picked].filter(Boolean);

      return {
        ok: true,
        trainer: encounter.trainer,
        trainerType: encounter.trainerType,
        pokemonId: encounter.pokemonId,
        pokemonName: getPokemonName(picked),
        team: opponentTeam,
      };
    } catch (e) {
      console.error("BattleContainer: exception building opponent", e, { zoneCode, playerLevel });
      return { ok: false, reason: "exception_building_opponent" };
    }
  }, [playerLevel, zoneCode]);

  const beginBattle = useCallback(() => {
    // Freeze the teams at the moment battle begins.
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

    // Entry gating only
    if (battleStarted) return;

    // If no player, bail out cleanly
    if (!player) {
      shownForActionKeyRef.current = actionKey;
      endActiveAction();
      return;
    }

    // Require at least one usable pokemon (hp > 0) to START a battle.
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

    // If opponent cannot be generated, show modal and return to board (no crash)
    if (!opponent?.ok) {
      shownForActionKeyRef.current = actionKey;

      const extra =
        opponent?.reason === "pokemon_not_found_in_dex"
          ? ` (Missing: ${String(opponent?.pokemonId || "").trim() || "unknown"})`
          : "";

      openModal({
        title: "Trainer Battle",
        content:
          "A trainer wants to battle you, but the encounter could not be generated." + extra,
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

  if (frozenPlayerTeam.length === 0) return null;
  if (frozenOpponentTeam.length === 0) return null;

  return (
    <Battle
      playerId={playerId}
      playerTeam={frozenPlayerTeam}
      opponentTeam={frozenOpponentTeam}
    />
  );
};

export default BattleContainer;
