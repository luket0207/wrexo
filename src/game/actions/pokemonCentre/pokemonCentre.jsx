// game/actions/pokemonCentre/pokemonCentre.jsx
import React from "react";
import { useActions } from "../../../engine/gameContext/useActions";
import { useGame } from "../../../engine/gameContext/gameContext";
import { useTurnTransition } from "../../../engine/gameContext/useTurnTransition";
import { useModal, MODAL_BUTTONS } from "../../../engine/ui/modal/modalContext";
import "./pokemonCentre.scss";

const PokemonCentre = () => {
  const { endActiveAction } = useActions();
  const { gameState, healPlayerParty } = useGame();
  const { endTurn } = useTurnTransition();
  const { openModal } = useModal();

  const activeAction = gameState?.activeAction || null;
  const playerId = activeAction?.playerId || gameState?.players?.[gameState?.turnIndex]?.id || null;
  const player = (Array.isArray(gameState?.players) ? gameState.players : []).find((p) => p.id === playerId) || null;
  const pokemonCount = Array.isArray(player?.pokemon) ? player.pokemon.length : 0;

  const handleHeal = () => {
    if (!playerId) return;
    if (typeof healPlayerParty === "function") {
      healPlayerParty(playerId, { amount: "MAX" });
    }

    openModal({
      title: "Healed",
      content: "All Pokémon have been healed.",
      buttons: MODAL_BUTTONS.OK,
      onClick: endActiveAction,
    });
  };

  const handleRollAgain = () => {
    const currentIdx = Number(gameState?.turnIndex) || 0;
    endTurn({
      endingPlayerId: playerId,
      nextTurnIndex: currentIdx,
      clearActiveAction: true,
      // keep announcement suppressed since this is not a new turn
      suppressAnnouncement: true,
    });
  };

  const handleClimb = () => {
    // placeholder for later behavior
    endActiveAction();
  };

  return (
    <div className="pokemonCentre">
      <h1>Pokemon Centre</h1>

      <div className="pokemonCentre__body">
        <div style={{ display: "grid", gap: "8px" }}>
          <button type="button" className="pokemonCentre__btn" onClick={handleHeal}>
            Heal Pokémon
          </button>

          <button type="button" className="pokemonCentre__btn" onClick={handleRollAgain}>
            Roll again
          </button>

          {pokemonCount >= 3 && (
            <button type="button" className="pokemonCentre__btn" onClick={handleClimb}>
              Climb Mount Wrexo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PokemonCentre;
