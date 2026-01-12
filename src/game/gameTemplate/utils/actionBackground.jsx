import TILES from "../../../assets/gameContent/tiles";

import talacaLighthouseImg from "../../../assets/images/board/features/horseshoe-coast-talaca-lighthouse.png";
import tealLagoonImg from "../../../assets/images/board/features/horseshoe-coast-teal-lagoon.png";

import panoCliffsImg from "../../../assets/images/board/features/earths-end-pano-cliffs.png";
import glasQuarryImg from "../../../assets/images/board/features/earths-end-glas-quarry.png";

import wedsCavesImg from "../../../assets/images/board/features/frith-weds-caves.png";
import tinChapelImg from "../../../assets/images/board/features/frith-the-tin-chapel.png";

import minraMinesImg from "../../../assets/images/board/features/basham-minra-mines.png";
import bashamIronworksImg from "../../../assets/images/board/features/basham-basham-ironworks.png";

import princeMillImg from "../../../assets/images/board/features/erdig-prince-mill.png";
import teapotFallsImg from "../../../assets/images/board/features/erdig-teapot-falls.png";

import langoValleyImg from "../../../assets/images/board/features/dinasran-lango-valley.png";
import dinasranRuinsImg from "../../../assets/images/board/features/dinasran-dinasran-ruins.png";

const FEATURE_BG_BY_TILE_ID = Object.freeze({
  T03: tealLagoonImg,
  T11: talacaLighthouseImg,
  T15: panoCliffsImg,
  T23: glasQuarryImg,
  T27: tinChapelImg,
  T35: wedsCavesImg,
  T39: bashamIronworksImg,
  T47: minraMinesImg,
  T51: teapotFallsImg,
  T59: princeMillImg,
  T63: langoValleyImg,
  T71: dinasranRuinsImg,
  
});

const ZONE_FEATURES = Object.freeze({
  HC: ["T03", "T11"],
  EE: ["T15", "T23"],
  F: ["T27", "T35"],
  B: ["T39", "T47"],
  E: ["T51", "T59"],
  D: ["T63", "T71"],
});

const normalizeZoneCode = (z) => {
  if (typeof z === "string" && z.trim()) return z.trim();
  if (z && typeof z === "object" && typeof z.code === "string") return z.code;
  return null;
};

const getTileNumber = (tileId) => {
  const m = String(tileId || "").match(/^T(\d+)$/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
};

const findZonePokemonCentreTileId = (zoneCode) => {
  const z = normalizeZoneCode(zoneCode);
  if (!z) return null;

  const tiles = Array.isArray(TILES) ? TILES : [];
  const found = tiles.find((t) => {
    const tileZone =
      (t?.zone && typeof t.zone === "object" ? t.zone.code : null) ||
      (typeof t?.zone === "string" ? t.zone : null) ||
      (typeof t?.zoneId === "string" ? t.zoneId : null);

    return tileZone === z && String(t?.type || "") === "PokemonCentre";
  });

  return found?.id || null;
};

export const getActionBackgroundStyle = (activeAction) => {
  if (!activeAction) return null;

  const tileType = String(activeAction.tileType || "");
  const tileId = String(activeAction.tileId || "");
  const zoneId = activeAction.zoneId;

  if (tileType === "PokemonCentre") return { backgroundColor: "red" };
  if (tileType === "PokeMart") return { backgroundColor: "blue" };

  if (tileType === "Feature") {
    const img = FEATURE_BG_BY_TILE_ID[tileId] || null;
    if (!img) return null;

    return {
      backgroundImage: `url(${img})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }

  // Grass now behaves like NPC/Trainer: pick feature based on before/after Pokemon Centre in the zone
  if (tileType === "NPC" || tileType === "Trainer" || tileType === "Grass") {
    const zoneCode = normalizeZoneCode(zoneId) || "EE";
    const pair = ZONE_FEATURES[zoneCode] || null;
    if (!pair) return null;

    const centreTileId = findZonePokemonCentreTileId(zoneCode);

    const tileNum = getTileNumber(tileId);
    const centreNum = getTileNumber(centreTileId);

    const isBeforeCentre =
      Number.isFinite(tileNum) && Number.isFinite(centreNum) ? tileNum < centreNum : true;

    const featureTileId = isBeforeCentre ? pair[0] : pair[1];
    const img = FEATURE_BG_BY_TILE_ID[featureTileId] || null;
    if (!img) return null;

    return {
      backgroundImage: `url(${img})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }

  return null;
};

