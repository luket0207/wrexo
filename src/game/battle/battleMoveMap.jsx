// battleMoveMap.js
export const createMoveMap = (moves) => {
  const map = Object.create(null);
  const list = Array.isArray(moves) ? moves : [];

  list.forEach((m) => {
    if (m && typeof m.name === "string") {
      map[m.name] = m;
    }
  });

  return map;
};
