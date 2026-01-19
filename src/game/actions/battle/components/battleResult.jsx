import React, { useMemo } from "react";
import { useActions } from "../../../../engine/gameContext/useActions";
import { useGame } from "../../../../engine/gameContext/gameContext";
import { TURN } from "../battleEngine";

const getWinnerLabel = (winner, playerName, opponentName) => {
  if (winner === TURN.PLAYER) return playerName;
  if (winner === TURN.OPPONENT) return opponentName;
  return "Unknown";
};

const hasAnyAlivePokemon = (team) => {
  const arr = Array.isArray(team) ? team : [];
  for (let i = 0; i < arr.length; i += 1) {
    const hp = Number(arr[i]?.health) || 0;
    if (hp > 0) return true;
  }
  return false;
};

const BattleResult = ({
  winner,
  playerId = null,
  playerName = "Player",
  opponentName = "Opponent",
  playerTeam = [],
  isEliteBattle = false,
}) => {
  const { endActiveAction } = useActions();
  const { setGameState, setPlayerFainted } = useGame();

  const playerWiped = useMemo(() => {
    // Only treat as "player fainted" if the opponent won AND the player has no living Pokemon.
    if (winner !== TURN.OPPONENT) return false;
    return !hasAnyAlivePokemon(playerTeam);
  }, [winner, playerTeam]);

  const bannerText = useMemo(() => {
    if (isEliteBattle && winner === TURN.PLAYER) return "Elite Battle Won!";
    if (playerWiped) return `${playerName} has run out of Pokemon. ${playerName} fainted.`;
    return `Battle Over! Winner: ${getWinnerLabel(winner, playerName, opponentName)}`;
  }, [winner, playerWiped, isEliteBattle]);

  const clearPartyStatuses = (prev, pid) => {
    const players = Array.isArray(prev?.players) ? prev.players : [];
    const pIndex = players.findIndex((pl) => pl?.id === pid);
    if (pIndex === -1) return prev;

    const playerObj = players[pIndex];
    const party = Array.isArray(playerObj?.pokemon) ? playerObj.pokemon : [];
    if (party.length === 0) return prev;

    const nextParty = party.map((pk) => {
      if (!pk || !pk.status) return pk;
      return {
        ...pk,
        status: {
          burn: 0,
          poison: 0,
          sleep: 0,
          paralyse: 0,
          confusePending: 0,
          confuseSlots: [],
          burnJustApplied: false,
          poisonJustApplied: false,
        },
      };
    });

    const nextPlayers = players.slice();
    nextPlayers[pIndex] = { ...playerObj, pokemon: nextParty };
    return { ...prev, players: nextPlayers };
  };

  const onReturn = () => {
    // ----------------------------
    // ELITE BATTLE WIN: special flow
    // ----------------------------
    if (isEliteBattle && winner === TURN.PLAYER && playerId) {
      let reachedWinCondition = false;

      setGameState((prev) => {
        const players = Array.isArray(prev?.players) ? prev.players : [];
        const pIndex = players.findIndex((pl) => pl?.id === playerId);
        if (pIndex === -1) return prev;

        const playerObj = players[pIndex];
        const prevLevel = Number(playerObj?.level) || 1;
        const nextLevel = prevLevel + 1;

        // Winner hits level 5 => game ends
        if (nextLevel >= 5) {
          reachedWinCondition = true;

          const nextPlayers = players.slice();
          nextPlayers[pIndex] = { ...playerObj, level: nextLevel };

          // Also clear party statuses for cleanliness (optional but safe)
          const withStatusCleared = clearPartyStatuses({ ...prev, players: nextPlayers }, playerId);

          return {
            ...withStatusCleared,
            activeAction: {
              kind: "end",
              winnerPlayerId: playerId,
            },
            pendingMove: null,
            isAnimating: false,
          };
        }

        // Otherwise: player "faints" and loses whole team, exits mount, must re-pick start
        const nextPlayer = {
          ...playerObj,
          level: nextLevel,

          pokemon: [],

          climbingMountWrexo: false,

          // Force the start-selection modal flow again on their next turn
          isFainted: true,
          hasChosenStart: false,
          isChoosingStart: true,
        };

        const nextPlayers = players.slice();
        nextPlayers[pIndex] = nextPlayer;

        // Clear status across party (party is now empty, but keep it consistent)
        const withStatusCleared = clearPartyStatuses({ ...prev, players: nextPlayers }, playerId);

        return {
          ...withStatusCleared,
        };
      });

      // CRITICAL: if we triggered the end screen, DO NOT clear activeAction.
      // Clearing it would immediately remove the "end" action before it renders.
      if (reachedWinCondition) return;

      // End action and return to board (the player will be in "fainted / choose start" flow next turn)
      endActiveAction();
      return;
    }

    // ----------------------------
    // NORMAL BATTLE FLOW (existing)
    // ----------------------------
    if (playerWiped && playerId) {
      setPlayerFainted(playerId, true);
    }

    // Clear status effects from all player Pokémon when battle ends
    if (playerId && Array.isArray(playerTeam)) {
      setGameState((prev) => clearPartyStatuses(prev, playerId));
    }

    endActiveAction();
  };

  return (
    <div className="battle__banner">
      <strong>{bannerText}</strong>

      <div style={{ marginTop: "12px" }}>
        <button type="button" onClick={onReturn}>
          Return to Board
        </button>
      </div>
    </div>
  );
};

export default BattleResult;
