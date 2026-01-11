// game/gameTemplate/components/gameUi/utils/gameUiUtils.jsx

export const makeSlots = (count) => new Array(count).fill(null);

export const toLabel = (value, fallback = "") => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    if (typeof value.name === "string") return value.name;
    if (typeof value.code === "string") return value.code;
    return fallback;
  }
  return fallback;
};

export const toNumberSafe = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const toExpiresLabel = (expires) => {
  if (expires == null) return "null";
  const n = Number(expires);
  return Number.isFinite(n) ? String(n) : "null";
};

// We encode tile target dropdown values as:
//  - "id:T01"
//  - "type:Grass"
export const parseTileTargetValue = (value) => {
  const raw = String(value || "");
  if (!raw) return null;

  const parts = raw.split(":");
  const kind = parts[0];
  const rest = parts[1];

  if (!kind || !rest) return null;

  if (kind === "id") return { tileSpec: rest };
  if (kind === "type") return { tileSpec: rest };

  return null;
};

export const parseExpiresValue = (value) => {
  if (value === "null" || value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

export const normalizeTilesArray = (maybeTiles) => (Array.isArray(maybeTiles) ? maybeTiles : []);

export const getTileTypeOptions = (TILE_TYPES) => {
  const entries = Object.entries(TILE_TYPES || {});
  return entries.map(([, value]) => String(value));
};

export const buildExpiresOptions = (max = 10) => {
  const arr = [{ value: "null", label: "null" }];
  for (let i = 0; i <= max; i += 1) {
    arr.push({ value: String(i), label: String(i) });
  }
  return arr;
};

export const computeSafeTurnIndex = (turnIndex, playerCount) => {
  const idx = Number(turnIndex) || 0;
  const maxIdx = Math.max(0, (Number(playerCount) || 0) - 1);
  return Math.min(idx, maxIdx);
};
