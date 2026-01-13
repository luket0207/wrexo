// game/gameTemplate/components/actionRegistry.jsx
import PokemonEncounter from "../../actions/pokemonEncounter/pokemonEncounter";
import EventAction from "../../actions/event/event";
import PokeMartAction from "../../actions/pokeMart/pokeMart";
import BattleContainer from "../../actions/battle/battleContainer";

export const ACTIONS = Object.freeze({
  pokemonEncounter: {
    component: PokemonEncounter,
    hideUi: true,
  },
  battle: {
    component: BattleContainer,
    hideUi: true,
  },
  event: {
    component: EventAction,
    hideUi: false,
  },
  pokeMart: {
    component: PokeMartAction,
    hideUi: false,
  },
});

export const TILE_TYPE_TO_ACTION_KIND = Object.freeze({
  Grass: "pokemonEncounter",
  Feature: "pokemonEncounter",
  PokeMart: "pokeMart",
  Trainer: "battle",
});

export const getActionConfig = (kind) => ACTIONS[kind] || null;
