// game/actions/pokemonCentre/pokemonCentre.jsx
import React from "react";
import { useActions } from "../../../engine/gameContext/useActions";
import "./pokemonCentre.scss";

const PokemonCentre = () => {
  const { endActiveAction } = useActions();

  return (
    <div className="pokemonCentre">
      <h1>Pokemon Centre</h1>

      <div className="pokemonCentre__body">
        <p>Welcome to the Pokémon Centre.</p>
      </div>

      <div className="pokemonCentre__footer">
        <button type="button" className="pokemonCentre__ok" onClick={endActiveAction}>
          OK
        </button>
      </div>
    </div>
  );
};

export default PokemonCentre;
