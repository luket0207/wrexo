// game/gameTemplate/components/actionRegistry.jsx
import PokemonEncounter from "../../actions/pokemonEncounter/pokemonEncounter";
import EventAction from "../../actions/event/event";
import PokeMartAction from "../../actions/pokeMart/pokeMart";
import BattleContainer from "../../actions/battle/battleContainer";
import PokemonCentre from "../../actions/pokemonCentre/pokemonCentre";

export const ACTIONS = Object.freeze({
  pokemonEncounter: {
    component: PokemonEncounter,
    hideUi: true,
  },

  // Canonical battle action
  battle: {
    component: BattleContainer,
    hideUi: true,
  },

  // Alias: some parts of your board logic are emitting this kind
  trainerBattle: {
    component: BattleContainer,
    hideUi: true,
  },

  // (Optional) if you later add a separate elite battle component,
  // you can switch this to a different component.
  eliteBattle: {
    component: EventAction,
    hideUi: false,
  },

  event: {
    component: EventAction,
    hideUi: false,
  },
  pokeMart: {
    component: PokeMartAction,
    hideUi: false,
  },
  pokemonCentre: {
    component: PokemonCentre,
    hideUi: false,
  },
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
