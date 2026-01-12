import PokemonEncounter from "../../actions/pokemonEncounter/pokemonEncounter";
import EventAction from "../../actions/event/event";
import PokeMartAction from "../../actions/pokeMart/pokeMart";

export const ACTIONS = Object.freeze({
  pokemonEncounter: {
    component: PokemonEncounter,
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
});

export const getActionConfig = (kind) => ACTIONS[kind] || null;
