// game/gameTemplate/components/actionRegistry.jsx
import PokemonEncounter from "../../actions/pokemonEncounter/pokemonEncounter";
import EventAction from "../../actions/event/event";
import PokeMartAction from "../../actions/pokeMart/pokeMart";
import BattleContainer from "../../actions/battle/battleContainer";
import PokemonCentre from "../../actions/pokemonCentre/pokemonCentre";
import End from "../../end/end";

export const ACTIONS = Object.freeze({
  pokemonEncounter: { component: PokemonEncounter, hideUi: true },
  battle: { component: BattleContainer, hideUi: true },
  event: { component: EventAction, hideUi: false },
  pokeMart: { component: PokeMartAction, hideUi: false },
  pokemonCentre: { component: PokemonCentre, hideUi: false },
  end: { component: End, hideUi: true },
});


export const TILE_TYPE_TO_ACTION_KIND = Object.freeze({
  // Main board
  Grass: "pokemonEncounter",
  Feature: "pokemonEncounter",
  NPC: "event",
  PokeMart: "pokeMart",
  Trainer: "battle",
  PokemonCentre: "pokemonCentre",

  // Mount Wrexo (if you use these type strings)
  EliteBattle: "eliteBattle",
  Path: "event",
});

export const getActionConfig = (kind) => {
  const k = typeof kind === "string" ? kind.trim() : "";
  return ACTIONS[k] || null;
};
