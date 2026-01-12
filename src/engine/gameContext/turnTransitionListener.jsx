// engine/gameContext/TurnTransitionListener.jsx
import React from "react";
import { useTurnTransition } from "./useTurnTransition";

const TurnTransitionListener = () => {
  // Just mounting this hook globally enables the "turnIndex changed" modal logic.
  useTurnTransition();
  return null;
};

export default TurnTransitionListener;
