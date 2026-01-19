// 36 tiles, Mount Wrexo ring, clockwise from 12 o'clock.
// For now, all tiles use type "NPC" so they behave like NPC tiles,
// but we keep `wrexoKind` + `name` so you can differentiate later.

const pad2 = (n) => String(n).padStart(2, "0");

const SEQ = Object.freeze([
  { wrexoKind: "EliteBattle", name: "Elite Battle (N)" },
  { wrexoKind: "Path", name: "Path" },
  { wrexoKind: "NPC", name: "NPC" },
  { wrexoKind: "Path", name: "Path" },
  { wrexoKind: "PokeMart", name: "Poke Mart" },
  { wrexoKind: "Feature", name: "Caia Castle" },
  { wrexoKind: "Path", name: "Path" },
  { wrexoKind: "Trainer", name: "Trainer" },
  { wrexoKind: "NPC", name: "NPC" },
  { wrexoKind: "EliteBattle", name: "Elite Battle (E)" },
  { wrexoKind: "Path", name: "Path" },
  { wrexoKind: "Trainer", name: "Trainer" },
  { wrexoKind: "NPC", name: "NPC" },
  { wrexoKind: "Path", name: "Path" },
  { wrexoKind: "Feature", name: "Rubon Castle" },
  { wrexoKind: "Path", name: "Path" },
  { wrexoKind: "Trainer", name: "Trainer" },
  { wrexoKind: "Path", name: "Path" },
  { wrexoKind: "EliteBattle", name: "Elite Battle (S)" },
  { wrexoKind: "NPC", name: "NPC" },
  { wrexoKind: "Path", name: "Path" },
  { wrexoKind: "NPC", name: "NPC" },
  { wrexoKind: "PokeMart", name: "Poke Mart" },
  { wrexoKind: "Feature", name: "Bodas Castle" },
  { wrexoKind: "Path", name: "Path" },
  { wrexoKind: "Trainer", name: "Trainer" },
  { wrexoKind: "Path", name: "Path" },
  { wrexoKind: "EliteBattle", name: "Elite Battle (W)" },
  { wrexoKind: "Path", name: "Path" },
  { wrexoKind: "Trainer", name: "Trainer" },
  { wrexoKind: "NPC", name: "NPC" },
  { wrexoKind: "Path", name: "Path" },
  { wrexoKind: "Feature", name: "Penry Castle" },
  { wrexoKind: "Trainer", name: "Trainer" },
  { wrexoKind: "NPC", name: "NPC" },
  { wrexoKind: "Path", name: "Path" },
]);

export const buildMountWrexoTiles = (eliteTrainerByTileId = {}) =>
  Object.freeze(
    SEQ.map((t, i) => {
      const n = i + 1;
      const id = `MW${pad2(n)}`;

      const assignedElite = t.wrexoKind === "EliteBattle" ? eliteTrainerByTileId[id] : null;

      return {
        index: i,
        id, // MW01..MW36
        tileNumber: n,
        zone: { code: "MW", name: "Mount Wrexo" },
        type: t.wrexoKind,
        wrexoKind: t.wrexoKind,

        // Display name: if EliteBattle and assigned, show trainer name
        name: assignedElite?.name ? assignedElite.name : t.name,

        // Keep the assignment available for later battle triggers
        eliteTrainer: assignedElite || null,
      };
    })
  );

export const MOUNT_WREXO_TILES = buildMountWrexoTiles();
export default MOUNT_WREXO_TILES;
