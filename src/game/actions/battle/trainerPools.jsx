// game/actions/battle/trainerPools.js

const parsePool = (value) => {
  const raw = String(value || "").trim();
  if (!raw || raw.toUpperCase() === "N/A") return [];
  return raw
    .split(",")
    .map((s) => String(s).trim())
    .filter(Boolean);
};

const pickOne = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx] ?? null;
};

const LEVEL_1_2 = Object.freeze([
  {
    trainer: "Forager",
    type: "Grass",
    pools: Object.freeze({
      HC: "N/A",
      EE: "NM01, NM02, NM03, NI01, NI02, NI03, GM01, GM02, GM03, KO01, KO02, KO03, EK01, EK02, EK03",
      F: "WE01, WE02, WE03, CA01, CA02, CA03, VN01, VN02, VN03",
      B: "N/A",
      E: "OD01, OD02, OD03, BT01, BT02, BT03, PR01, PR02, PR03, TG01, TG02, TG03",
      D: "N/A",
    }),
  },
  {
    trainer: "Smith",
    type: "Fire",
    pools: Object.freeze({
      HC: "VP01, VP02, VP03, PT01, PT02, PT03, CH01, CH02, CH03",
      EE: "N/A",
      F: "N/A",
      B: "MA01, MA02, MA03, GF01, GF02, GF03, PT01, PT02, PT03",
      E: "N/A",
      D: "N/A",
    }),
  },
  {
    trainer: "Ferryman",
    type: "Water",
    pools: Object.freeze({
      HC: "SD01, SD02, SD03, TN01, TN02, TN03, KK01, KK02, KK03, HS01, HS02, HS03",
      EE: "N/A",
      F: "GL01, GL02, GL03, PS01, PS02, PS03, SH01, SH02, SH03, KK01, KK02, KK03",
      B: "N/A",
      E: "HS01, HS02, HS03, PL01, PL02, PL03, PS01, PS02, PS03",
      D: "N/A",
    }),
  },
  {
    trainer: "Druid",
    type: "Lightning",
    pools: Object.freeze({
      HC: "VX01, VX02, VX03, MG01, MG02, MG03, PK01, PK02, PK03",
      EE: "VX01, VX02, VX03, MG01, MG02, MG03, PK01, PK02, PK03",
      F: "N/A",
      B: "N/A",
      E: "N/A",
      D: "N/A",
    }),
  },
  {
    trainer: "Skirmisher",
    type: "Fighting",
    pools: Object.freeze({
      HC: "N/A",
      EE: "N/A",
      F: "N/A",
      B: "SS01, SS02, SS03, CW01, CW02, CW03, DG01, DG02, DG03",
      E: "MC01, MC02, MC03, MK01, MK02, MK03, CW01, CW02, CW03",
      D: "GD01, GD02, GD03, ON01, ON02, ON03, DG01, DG02, DG03",
    }),
  },
  {
    trainer: "Seer",
    type: "Psychic",
    pools: Object.freeze({
      HC: "N/A",
      EE: "N/A",
      F: "AB01, AB02, AB03, DR01, DR02, DR03, MM01, MM02, MM03",
      B: "N/A",
      E: "N/A",
      D: "GA01, GA02, GA03, DR01, DR02, DR03, JY01, JY02, JY03",
    }),
  },
  {
    trainer: "Wayfarer",
    type: "Colourless",
    pools: Object.freeze({
      HC: "N/A",
      EE:
        "PI01, PI02, PI03, SP01, SP02, SP03, FF01, FF02, FF03, FF04, FF05, FF06, EE01, EE02, EE03, RA01, RA02, RA03",
      F: "N/A",
      B: "RA01, RA02, RA03, TA01, TA02, TA03, DD01, DD02, DD03",
      E: "N/A",
      D: "SP01, SP02, SP03, JG01, JG02, JG03, MN01, MN02, MN03, CL01, CL02, CL03",
    }),
  },
]);

const LEVEL_3_4 = Object.freeze([
  {
    trainer: "Forager",
    type: "Grass",
    pools: Object.freeze({
      HC: "N/A",
      EE:
        "NM04, NM05, NM06, NI04, NI05, NI06, GM01, GM02, GM03, KO04, KO05, KO06, EK04, EK05, EK06, KO01, KO02, KO03, EK01, EK02, EK03",
      F: "WE01, WE02, WE03, CA01, CA02, CA03, SC01, SC02, SC03, PN01, PN02, PN03",
      B: "N/A",
      E:
        "OD01, OD02, OD03, BT01, BT02, BT03, PR01, PR02, PR03, OD04, OD05, OD06, PR04, PR05, PR06, TG04, TG05, TG06, BT04, BT05, BT06, BT07, BT08, BT09",
      D: "N/A",
    }),
  },
  {
    trainer: "Smith",
    type: "Fire",
    pools: Object.freeze({
      HC: "VP01, VP02, VP03, PT01, PT02, PT03, CH01, CH02, CH03, VP04, VP05, VP06, CH04, CH05, CH06",
      EE: "N/A",
      F: "N/A",
      B: "MA01, MA02, MA03, MA04, MA05, MA06, GF01, GF02, GF03, PT01, PT02, PT03, PT04, PT05, PT06",
      E: "N/A",
      D: "N/A",
    }),
  },
  {
    trainer: "Ferryman",
    type: "Water",
    pools: Object.freeze({
      HC:
        "SD01, SD02, SD03, TN01, TN02, TN03, KK01, KK02, KK03, HS01, HS02, HS03, SD04, SD05, SD06, TN04, TN05, TN06, HS04, HS05, HS06",
      EE: "N/A",
      F:
        "GL01, GL02, GL03, PS01, PS02, PS03, SH01, SH02, SH03, KK01, KK02, KK03, GL04, GL05, GL06, KK04, KK05, KK06, PS04, PS05, PS06",
      B: "N/A",
      E: "HS01, HS02, HS03, PL01, PL02, PL03, PS01, PS02, PS03, PL04, PL05, PL06, PL07, PL08, PL09",
      D: "N/A",
    }),
  },
  {
    trainer: "Druid",
    type: "Lightning",
    pools: Object.freeze({
      HC: "VX01, VX02, VX03, MG01, MG02, MG03, PK01, PK02, PK03, VX04, VX05, VX06, MG04, MG05, MG06",
      EE: "VX01, VX02, VX03, MG01, MG02, MG03, PK01, PK02, PK03, EB01, EB02, EB03",
      F: "N/A",
      B: "N/A",
      E: "N/A",
      D: "N/A",
    }),
  },
  {
    trainer: "Skirmisher",
    type: "Fighting",
    pools: Object.freeze({
      HC: "N/A",
      EE: "N/A",
      F: "N/A",
      B: "SS01, SS02, SS03, CW01, CW02, CW03, DG01, DG02, DG03, DG04, DG05, DG06, SS04, SS05, SS06",
      E: "MC01, MC02, MC03, MK01, MK02, MK03, CW01, CW02, CW03, MC04, MC05, MC06, MK04, MK05, MK06",
      D: "GD01, GD02, GD03, ON01, ON02, ON03, ON04, ON05, ON06, DG01, DG02, DG03, GD04, GD05, GD06, RH01, RH02, RH03",
    }),
  },
  {
    trainer: "Seer",
    type: "Psychic",
    pools: Object.freeze({
      HC: "N/A",
      EE: "N/A",
      F: "AB01, AB02, AB03, DR01, DR02, DR03, MM01, MM02, MM03, AB04, AB05, AB06, SL04, SL05, SL06",
      B: "N/A",
      E: "N/A",
      D: "GA01, GA02, GA03, DR01, DR02, DR03, JY01, JY02, JY03, JY04, JY05, JY06, GA04, GA05, GA06",
    }),
  },
  {
    trainer: "Wayfarer",
    type: "Colourless",
    pools: Object.freeze({
      HC: "N/A",
      EE:
        "PI01, PI02, PI03, SP01, SP02, SP03, FF01, FF02, FF03, FF04, FF05, FF06, EE01, EE02, EE03, RA01, RA02, RA03, PI04, PI05, PI06, RA04, RA05, RA06",
      F: "N/A",
      B:
        "RA01, RA02, RA03, TA01, TA02, TA03, DD01, DD02, DD03, DD04, DD05, DD06, KN01, KN02, KN03, KN04, KN05, KN06",
      E: "N/A",
      D: "SP01, SP02, SP03, JG01, JG02, JG03, MN01, MN02, MN03, JG04, JG05, JG06, MN04, MN05, MN06",
    }),
  },
]);

const getTableForLevel = (level) => {
  const lv = Number(level) || 1;
  if (lv <= 2) return LEVEL_1_2;
  return LEVEL_3_4; // default for 3+ for now
};

export const buildTrainerEncounter = ({ level, zoneCode }) => {
  const zone = String(zoneCode || "").trim().toUpperCase();
  const table = getTableForLevel(level);

  const candidates = table
    .map((row) => {
      const poolRaw = row?.pools?.[zone] ?? "N/A";
      const pool = parsePool(poolRaw);
      return { ...row, pool };
    })
    .filter((row) => Array.isArray(row.pool) && row.pool.length > 0);

  if (candidates.length === 0) {
    return { ok: false, reason: "no_pool_for_zone_or_level", zone, level };
  }

  const chosenTrainer = pickOne(candidates);
  const chosenPokemonId = pickOne(chosenTrainer?.pool);

  if (!chosenTrainer || !chosenPokemonId) {
    return { ok: false, reason: "failed_to_pick", zone, level };
  }

  return {
    ok: true,
    zone,
    level: Number(level) || 1,
    trainer: chosenTrainer.trainer,
    trainerType: chosenTrainer.type,
    pokemonId: chosenPokemonId,
  };
};
