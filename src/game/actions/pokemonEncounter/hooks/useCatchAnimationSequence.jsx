// game/actions/pokemonEncounter/hooks/useCatchAnimationSequence.jsx
import { useCallback, useState } from "react";
import { CATCH_OUTCOME } from "../hooks/catchCalculation";

const waitMs = (ms) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

const outcomeToFinalPhase = (outcome) => {
  if (outcome === CATCH_OUTCOME.CATCH) return "pokemon_caught";
  if (outcome === CATCH_OUTCOME.ESCAPE) return "pokemon_escaped";
  if (outcome === CATCH_OUTCOME.RUN_AWAY) return "pokemon_runaway";
  return "";
};

export const useCatchAnimationSequence = () => {
  const [phase, setPhase] = useState("");

  const clear = useCallback(() => setPhase(""), []);

  const play = useCallback(async (outcome) => {
    setPhase("ball_thrown");
    await waitMs(1000);

    setPhase("pokemon_trapped");
    await waitMs(2000);

    setPhase(outcomeToFinalPhase(outcome));

    if (outcome === CATCH_OUTCOME.CATCH) await waitMs(2000);
    else await waitMs(1000);
  }, []);

  return { phase, play, clear };
};
