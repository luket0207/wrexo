const moves = [
  // ======================
  // Fire — Common
  // ======================
  {
    name: "Ember",
    rarity: "Common",
    type: "Fire",
    damage: 5,
    statusEffects: [{ effect: "Burn", strength: 1 }],
  },
  {
    name: "Flame Wheel",
    rarity: "Common",
    type: "Fire",
    damage: 10,
    statusEffects: [],
  },

  // Fire — Rare
  {
    name: "Fire Spin",
    rarity: "Rare",
    type: "Fire",
    damage: 20,
    statusEffects: [{ effect: "Burn", strength: 2 }],
  },
  {
    name: "Fire Blast",
    rarity: "Rare",
    type: "Fire",
    damage: 20,
    statusEffects: [
      { effect: "Burn", strength: 2 },
      { effect: "RASELF", strength: 1 },
    ],
  },
  {
    name: "Fire Punch",
    rarity: "Rare",
    type: "Fire",
    damage: 30,
    statusEffects: [],
  },

  // Fire — Epic
  {
    name: "Flamethrower",
    rarity: "Epic",
    type: "Fire",
    damage: 40,
    statusEffects: [],
  },

  // Fire — Legendary
  {
    name: "Crimson Storm",
    rarity: "Legendary",
    type: "Fire",
    damage: 60,
    statusEffects: [{ effect: "RASELF", strength: 2 }],
  },
  {
    name: "Heat Wave",
    rarity: "Legendary",
    type: "Fire",
    damage: 45,
    statusEffects: [{ effect: "Burn", strength: 3 }],
  },

  // ======================
  // Water — Common
  // ======================
  {
    name: "Bubble",
    rarity: "Common",
    type: "Water",
    damage: 5,
    statusEffects: [{ effect: "Paralyse", strength: 1 }],
  },
  {
    name: "Water Gun",
    rarity: "Common",
    type: "Water",
    damage: 10,
    statusEffects: [],
  },

  // Water — Rare
  {
    name: "Aqua Jet",
    rarity: "Rare",
    type: "Water",
    damage: 30,
    statusEffects: [],
  },
  {
    name: "BubbleBeam",
    rarity: "Rare",
    type: "Water",
    damage: 15,
    statusEffects: [{ effect: "Confuse", strength: 2 }],
  },

  // Water — Epic
  {
    name: "Scald",
    rarity: "Epic",
    type: "Water",
    damage: 30,
    statusEffects: [{ effect: "Burn", strength: 2 }],
  },
  {
    name: "Surf",
    rarity: "Epic",
    type: "Water",
    damage: 40,
    statusEffects: [],
  },

  // Water — Legendary
  {
    name: "Hydro Pump",
    rarity: "Legendary",
    type: "Water",
    damage: 60,
    statusEffects: [],
  },
  {
    name: "Whirlpool",
    rarity: "Legendary",
    type: "Water",
    damage: 50,
    statusEffects: [{ effect: "Confuse", strength: 2 }],
  },

  // ======================
  // Grass — Common
  // ======================
  {
    name: "Vine Whip",
    rarity: "Common",
    type: "Grass",
    damage: 10,
    statusEffects: [],
  },
  {
    name: "Poison Powder",
    rarity: "Common",
    type: "Grass",
    damage: 0,
    statusEffects: [{ effect: "Poison", strength: 2 }],
  },
  {
    name: "String Shot",
    rarity: "Common",
    type: "Grass",
    damage: 0,
    statusEffects: [{ effect: "Paralyse", strength: 1 }],
  },
  {
    name: "Poison Sting",
    rarity: "Common",
    type: "Grass",
    damage: 5,
    statusEffects: [{ effect: "Poison", strength: 1 }],
  },

  // Grass — Rare
  {
    name: "Razor Leaf",
    rarity: "Rare",
    type: "Grass",
    damage: 30,
    statusEffects: [],
  },
  {
    name: "Mega Drain",
    rarity: "Rare",
    type: "Grass",
    damage: 10,
    statusEffects: [{ effect: "Heal", strength: 1 }],
  },
  {
    name: "Sleep Powder",
    rarity: "Rare",
    type: "Grass",
    damage: 0,
    statusEffects: [{ effect: "Sleep", strength: 2 }],
  },

  // Grass — Epic
  {
    name: "Cut",
    rarity: "Epic",
    type: "Grass",
    damage: 40,
    statusEffects: [],
  },
  {
    name: "Twin Needle",
    rarity: "Epic",
    type: "Grass",
    damage: 25,
    statusEffects: [{ effect: "RAE", strength: 2.5 }],
  },

  // Grass — Legendary
  {
    name: "Giga Drain",
    rarity: "Legendary",
    type: "Grass",
    damage: 30,
    statusEffects: [{ effect: "Heal", strength: 2 }],
  },
  {
    name: "SolarBeam",
    rarity: "Legendary",
    type: "Grass",
    damage: 50,
    statusEffects: [{ effect: "Paralyse", strength: 2 }],
  },

  // ======================
  // Colourless — Common
  // ======================
  {
    name: "Scratch",
    rarity: "Common",
    type: "Colourless",
    damage: 5,
    statusEffects: [],
  },
  {
    name: "Tackle",
    rarity: "Common",
    type: "Colourless",
    damage: 10,
    statusEffects: [],
  },
  {
    name: "Gust",
    rarity: "Common",
    type: "Colourless",
    damage: 10,
    statusEffects: [],
  },

  // Colourless — Rare
  {
    name: "Quick Attack",
    rarity: "Rare",
    type: "Colourless",
    damage: 20,
    statusEffects: [{ effect: "RAE", strength: 1 }],
  },
  {
    name: "Headbutt",
    rarity: "Rare",
    type: "Colourless",
    damage: 35,
    statusEffects: [],
  },

  // Colourless — Epic
  {
    name: "Slam",
    rarity: "Epic",
    type: "Colourless",
    damage: 45,
    statusEffects: [],
  },
  {
    name: "Skull Bash",
    rarity: "Epic",
    type: "Colourless",
    damage: 35,
    statusEffects: [{ effect: "Confuse", strength: 2 }],
  },
  {
    name: "Sky Attack",
    rarity: "Epic",
    type: "Colourless",
    damage: 45,
    statusEffects: [],
  },
  {
    name: "Rest",
    rarity: "Epic",
    type: "Colourless",
    damage: 0,
    statusEffects: [
      { effect: "Heal", strength: 3 },
      { effect: "SleepSELF", strength: 1 },
    ],
  },
];

export default moves;
