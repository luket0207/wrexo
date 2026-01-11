// game/actions/pokemonEncounter/components/catchAnimation.jsx
import React, { useMemo } from "react";

const phaseToText = (phase) => {
  switch (phase) {
    case "ball_thrown":
      return "ball thrown";
    case "pokemon_trapped":
      return "pokemon trapped";
    case "pokemon_caught":
      return "pokemon caught";
    case "pokemon_escaped":
      return "pokemon escaped";
    case "pokemon_runaway":
      return "pokemon runaway";
    default:
      return "";
  }
};

const CatchAnimation = ({ phase = "" }) => {
  const text = useMemo(() => phaseToText(phase), [phase]);

  if (!text) return null;

  return (
    <div
      aria-label="Catch animation"
      style={{
        padding: "12px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        marginBottom: "12px",
      }}
    >
      <strong style={{ textTransform: "capitalize" }}>{text}</strong>
    </div>
  );
};

export default CatchAnimation;
