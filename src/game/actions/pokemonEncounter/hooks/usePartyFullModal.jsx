// game/actions/pokemonEncounter/hooks/usePartyFullModal.jsx
import React, { useCallback } from "react";
import { MODAL_BUTTONS } from "../../../../engine/ui/modal/modalContext";

const TEAM_MAX = 3;

export const usePartyFullModal = ({ openModal, closeModal }) => {
  const openPartyFullModal = useCallback(
    ({ player, encounter, onReplaceIndex, onDiscardNew }) => {
      if (!player?.id || !encounter) return;

      const currentTeam = Array.isArray(player?.pokemon) ? player.pokemon.slice(0, TEAM_MAX) : [];

      const content = (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>Your party is full. Choose a Pokemon to release:</div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {currentTeam.map((mon, idx) => (
              <button
                key={`release-${idx}`}
                type="button"
                onClick={() => {
                  if (typeof onReplaceIndex === "function") onReplaceIndex(idx);
                  closeModal();
                }}
                style={{ padding: "10px" }}
              >
                Release Slot {idx + 1}: {mon?.name || "Unknown"}
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                if (typeof onDiscardNew === "function") onDiscardNew();
                closeModal();
              }}
              style={{ padding: "10px" }}
            >
              Release Newly Caught: {encounter?.name || "Pokemon"}
            </button>
          </div>
        </div>
      );

      openModal({
        title: "Party Full",
        content,
        buttons: MODAL_BUTTONS.NONE,
        onClose: () => {},
      });
    },
    [openModal, closeModal]
  );

  return { openPartyFullModal };
};
