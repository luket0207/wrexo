// assets/gameContent/tiles.jsx

// 72 tiles, split into 6 zones (12 tiles each).
// Zone ranges:
//  1-12   Horseshoe Coast (HC)
//  13-24  Earth's End (EE)
//  25-36  Frith (F)
//  37-48  Basham (B)
//  49-60  Erdig (E)
//  61-72  Dinasran (D)
//
// Per-zone tile type counts (must total 12):
//  Pokemon Centre: 1
//  Poke Mart:      1
//  Trainer:        1
//  NPC:            2
//  Feature:        2
//  Grass:          5

export const TILE_TYPES = Object.freeze({
  POKEMON_CENTRE: "PokemonCentre",
  POKE_MART: "PokeMart",
  TRAINER: "Trainer",
  NPC: "NPC",
  FEATURE: "Feature",
  GRASS: "Grass",
});

export const ZONES = Object.freeze({
  HC: { name: "The Horseshoe Coast", code: "HC", start: 1, end: 12 },
  EE: { name: "Earth's End", code: "EE", start: 13, end: 24 },
  F: { name: "Frith", code: "F", start: 25, end: 36 },
  B: { name: "Basham", code: "B", start: 37, end: 48 },
  E: { name: "Erdig", code: "E", start: 49, end: 60 },
  D: { name: "Dinasran", code: "D", start: 61, end: 72 },
});

const ZONE_TYPE_PATTERN = [
  TILE_TYPES.GRASS,
  TILE_TYPES.NPC,
  TILE_TYPES.FEATURE,
  TILE_TYPES.GRASS,
  TILE_TYPES.GRASS,
  TILE_TYPES.POKEMON_CENTRE,
  TILE_TYPES.POKE_MART,
  TILE_TYPES.NPC,
  TILE_TYPES.GRASS,
  TILE_TYPES.TRAINER,
  TILE_TYPES.FEATURE,
  TILE_TYPES.GRASS,
];

const pad2 = (n) => String(n).padStart(2, "0");

const makeZoneTiles = (zoneNumber, zoneDef) => {
  const tiles = [];
  let patternIndex = 0;

  for (let tileNumber = zoneDef.start; tileNumber <= zoneDef.end; tileNumber += 1) {
    const idx0 = tileNumber - 1;
    const type = ZONE_TYPE_PATTERN[patternIndex] || TILE_TYPES.GRASS;

    tiles.push({
      index: idx0, // 0..71
      id: `T${pad2(tileNumber)}`, // T01..T72
      tileNumber, // 1..72
      zone: {
        number: zoneNumber, // 1..6
        code: zoneDef.code, // HC, EE, F, B, E, D
        name: zoneDef.name,
      },
      type, // one of TILE_TYPES values
    });

    patternIndex += 1;
  }

  return tiles;
};

const buildAllTiles = () => {
  const zonesInOrder = [ZONES.HC, ZONES.EE, ZONES.F, ZONES.B, ZONES.E, ZONES.D];

  const all = [];
  zonesInOrder.forEach((z, i) => {
    all.push(...makeZoneTiles(i + 1, z));
  });

  return all;
};

export const TILES = buildAllTiles();

export default TILES;
