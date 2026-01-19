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
    name: "Fire Punch",
    rarity: "Rare",
    type: "Fire",
    damage: 30,
    statusEffects: [],
  },
  {
    name: "Fire Blast",
    rarity: "Rare",
    type: "Fire",
    damage: 30,
    statusEffects: [
      { effect: "Burn", strength: 2 },
      { effect: "RASELF", strength: 1 },
    ],
  },

  // Fire — Epic
  {
    name: "Will-O-Wisp",
    rarity: "Epic",
    type: "Fire",
    damage: 25,
    statusEffects: [{ effect: "Burn", strength: 3 }],
  },
  {
    name: "Flamethrower",
    rarity: "Epic",
    type: "Fire",
    damage: 40,
    statusEffects: [],
  },

  // Fire — Legendary
  {
    name: "Heat Wave",
    rarity: "Legendary",
    type: "Fire",
    damage: 45,
    statusEffects: [{ effect: "Burn", strength: 3 }],
  },
  {
    name: "Crimson Storm",
    rarity: "Legendary",
    type: "Fire",
    damage: 60,
    statusEffects: [{ effect: "RASELF", strength: 2 }],
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
    name: "Clamp",
    rarity: "Common",
    type: "Water",
    damage: 10,
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
  {
    name: "Ice Beam",
    rarity: "Rare",
    type: "Water",
    damage: 20,
    statusEffects: [{ effect: "Paralyse", strength: 1 }],
  },
  {
    name: "Crabhammer",
    rarity: "Rare",
    type: "Water",
    damage: 25,
    statusEffects: [{ effect: "Paralyse", strength: 1 }],
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
  {
    name: "Aurora Beam",
    rarity: "Epic",
    type: "Water",
    damage: 25,
    statusEffects: [{ effect: "Confuse", strength: 3 }],
  },
  {
    name: "Waterfall",
    rarity: "Epic",
    type: "Water",
    damage: 30,
    statusEffects: [{ effect: "RAE", strength: 2 }],
  },

  // Water — Legendary
  {
    name: "Whirlpool",
    rarity: "Legendary",
    type: "Water",
    damage: 50,
    statusEffects: [{ effect: "Confuse", strength: 2 }],
  },
  {
    name: "Hydro Pump",
    rarity: "Legendary",
    type: "Water",
    damage: 60,
    statusEffects: [],
  },
  {
    name: "Blizzard",
    rarity: "Legendary",
    type: "Water",
    damage: 30,
    statusEffects: [
      { effect: "Paralyse", strength: 2 },
      { effect: "RAE", strength: 3 },
    ],
  },

  // ======================
  // Grass — Common
  // ======================
  {
    name: "Poison Powder",
    rarity: "Common",
    type: "Grass",
    damage: 0,
    statusEffects: [{ effect: "Poison", strength: 2 }],
  },
  {
    name: "Poison Gas",
    rarity: "Common",
    type: "Grass",
    damage: 0,
    statusEffects: [{ effect: "Poison", strength: 2 }],
  },
  {
    name: "Smog",
    rarity: "Common",
    type: "Grass",
    damage: 5,
    statusEffects: [{ effect: "Poison", strength: 1 }],
  },
  {
    name: "String Shot",
    rarity: "Common",
    type: "Grass",
    damage: 0,
    statusEffects: [{ effect: "Paralyse", strength: 1 }],
  },
  {
    name: "Stun Spore",
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
  {
    name: "Vine Whip",
    rarity: "Common",
    type: "Grass",
    damage: 10,
    statusEffects: [],
  },
  {
    name: "Leech Life",
    rarity: "Common",
    type: "Grass",
    damage: 5,
    statusEffects: [{ effect: "Heal", strength: 0.5 }],
  },
  {
    name: "Absorb",
    rarity: "Common",
    type: "Grass",
    damage: 5,
    statusEffects: [{ effect: "Heal", strength: 0.5 }],
  },

  // Grass — Rare
  {
    name: "Mega Drain",
    rarity: "Rare",
    type: "Grass",
    damage: 10,
    statusEffects: [{ effect: "Heal", strength: 1 }],
  },
  {
    name: "Razor Leaf",
    rarity: "Rare",
    type: "Grass",
    damage: 30,
    statusEffects: [],
  },
  {
    name: "Sleep Powder",
    rarity: "Rare",
    type: "Grass",
    damage: 0,
    statusEffects: [{ effect: "Sleep", strength: 2 }],
  },
  {
    name: "Sludge",
    rarity: "Rare",
    type: "Grass",
    damage: 20,
    statusEffects: [{ effect: "Poison", strength: 2 }],
  },
  {
    name: "Pin Missile",
    rarity: "Rare",
    type: "Grass",
    damage: 10,
    statusEffects: [
      { effect: "Paralyse", strength: 1 },
      { effect: "RAE", strength: 1.5 },
    ],
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
  {
    name: "Toxic",
    rarity: "Epic",
    type: "Grass",
    damage: 25,
    statusEffects: [{ effect: "Poison", strength: 3 }],
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
  // Lightning — Common
  // ======================
  {
    name: "Thundershock",
    rarity: "Common",
    type: "Lightning",
    damage: 10,
    statusEffects: [],
  },
  {
    name: "Spark",
    rarity: "Common",
    type: "Lightning",
    damage: 5,
    statusEffects: [{ effect: "Paralyse", strength: 1 }],
  },

  // Lightning — Rare
  {
    name: "Shock Wave",
    rarity: "Rare",
    type: "Lightning",
    damage: 30,
    statusEffects: [],
  },
  {
    name: "Sonic Boom",
    rarity: "Rare",
    type: "Lightning",
    damage: 20,
    statusEffects: [],
  },
  {
    name: "Thunder Wave",
    rarity: "Rare",
    type: "Lightning",
    damage: 10,
    statusEffects: [{ effect: "Paralyse", strength: 3 }],
  },

  // Lightning — Epic
  {
    name: "Thunder Punch",
    rarity: "Epic",
    type: "Lightning",
    damage: 40,
    statusEffects: [],
  },
  {
    name: "Thunderbolt",
    rarity: "Epic",
    type: "Lightning",
    damage: 30,
    statusEffects: [{ effect: "Paralyse", strength: 1 }],
  },
  {
    name: "Self Destruct",
    rarity: "Epic",
    type: "Lightning",
    damage: 200,
    statusEffects: [{ effect: "SELF", strength: 20 }],
  },

  // Lightning — Legendary
  {
    name: "Zap Cannon",
    rarity: "Legendary",
    type: "Lightning",
    damage: 35,
    statusEffects: [
      { effect: "Paralyse", strength: 2 },
      { effect: "RAE", strength: 2 },
    ],
  },
  {
    name: "Thunder",
    rarity: "Legendary",
    type: "Lightning",
    damage: 50,
    statusEffects: [{ effect: "Paralyse", strength: 2 }],
  },

  // ======================
  // Fighting — Common
  // ======================
  {
    name: "Karate Chop",
    rarity: "Common",
    type: "Fighting",
    damage: 10,
    statusEffects: [],
  },
  {
    name: "Low Kick",
    rarity: "Common",
    type: "Fighting",
    damage: 15,
    statusEffects: [],
  },
  {
    name: "Sand Attack",
    rarity: "Common",
    type: "Fighting",
    damage: 5,
    statusEffects: [{ effect: "Paralyse", strength: 1 }],
  },
  {
    name: "Bind",
    rarity: "Common",
    type: "Fighting",
    damage: 5,
    statusEffects: [{ effect: "Paralyse", strength: 1 }],
  },
  {
    name: "Defence Curl",
    rarity: "Common",
    type: "Fighting",
    damage: 0,
    statusEffects: [{ effect: "Confuse", strength: 2 }],
  },
  {
    name: "Bone Club",
    rarity: "Common",
    type: "Fighting",
    damage: 10,
    statusEffects: [],
  },

  // Fighting — Rare
  {
    name: "Counter",
    rarity: "Rare",
    type: "Fighting",
    damage: 10,
    statusEffects: [{ effect: "RAE", strength: 2 }],
  },
  {
    name: "Seismic Toss",
    rarity: "Rare",
    type: "Fighting",
    damage: 30,
    statusEffects: [],
  },
  {
    name: "Rock Throw",
    rarity: "Rare",
    type: "Fighting",
    damage: 30,
    statusEffects: [],
  },
  {
    name: "Dig",
    rarity: "Rare",
    type: "Fighting",
    damage: 35,
    statusEffects: [],
  },
  {
    name: "Vital Throw",
    rarity: "Rare",
    type: "Fighting",
    damage: 30,
    statusEffects: [
      { effect: "Paralyse", strength: 1 },
      { effect: "RASELF", strength: 1 },
    ],
  },
  {
    name: "Rock Slide",
    rarity: "Rare",
    type: "Fighting",
    damage: 20,
    statusEffects: [{ effect: "Confuse", strength: 1 }],
  },
  {
    name: "Boomerang",
    rarity: "Rare",
    type: "Fighting",
    damage: 20,
    statusEffects: [{ effect: "RAE", strength: 2 }],
  },

  // Fighting — Epic
  {
    name: "Submission",
    rarity: "Epic",
    type: "Fighting",
    damage: 40,
    statusEffects: [
      { effect: "Paralyse", strength: 2 },
      { effect: "RASELF", strength: 2 },
    ],
  },
  {
    name: "Rock Smash",
    rarity: "Epic",
    type: "Fighting",
    damage: 40,
    statusEffects: [],
  },

  // Fighting — Legendary
  {
    name: "Close Combat",
    rarity: "Legendary",
    type: "Fighting",
    damage: 50,
    statusEffects: [
      { effect: "Confuse", strength: 2 },
      { effect: "RASELF", strength: 2 },
    ],
  },
  {
    name: "Earthquake",
    rarity: "Legendary",
    type: "Fighting",
    damage: 50,
    statusEffects: [{ effect: "RAM", strength: 1 }],
  },

  // ======================
  // Psychic — Common
  // ======================
  {
    name: "Confusion",
    rarity: "Common",
    type: "Psychic",
    damage: 0,
    statusEffects: [{ effect: "Confuse", strength: 2 }],
  },
  {
    name: "Light Screen",
    rarity: "Common",
    type: "Psychic",
    damage: 0,
    statusEffects: [{ effect: "Confuse", strength: 2 }],
  },
  {
    name: "Confuse Ray",
    rarity: "Common",
    type: "Psychic",
    damage: 5,
    statusEffects: [{ effect: "Confuse", strength: 1 }],
  },
  {
    name: "Teleport",
    rarity: "Common",
    type: "Psychic",
    damage: 0,
    statusEffects: [{ effect: "Confuse", strength: 2 }],
  },
  {
    name: "Psybeam",
    rarity: "Common",
    type: "Psychic",
    damage: 10,
    statusEffects: [],
  },

  // Psychic — Rare
  {
    name: "Psywave",
    rarity: "Rare",
    type: "Psychic",
    damage: 20,
    statusEffects: [{ effect: "Confuse", strength: 1 }],
  },
  {
    name: "Night Shade",
    rarity: "Rare",
    type: "Psychic",
    damage: 30,
    statusEffects: [],
  },
  {
    name: "Hypnosis",
    rarity: "Rare",
    type: "Psychic",
    damage: 0,
    statusEffects: [{ effect: "Sleep", strength: 2 }],
  },

  // Psychic — Epic
  {
    name: "Psychic",
    rarity: "Epic",
    type: "Psychic",
    damage: 30,
    statusEffects: [{ effect: "Confuse", strength: 2 }],
  },
  {
    name: "Psycho Cut",
    rarity: "Epic",
    type: "Psychic",
    damage: 30,
    statusEffects: [{ effect: "RAE", strength: 2 }],
  },

  // Psychic — Legendary
  {
    name: "Future Sight",
    rarity: "Legendary",
    type: "Psychic",
    damage: 50,
    statusEffects: [{ effect: "Confuse", strength: 3 }],
  },
  {
    name: "Dream Eater",
    rarity: "Legendary",
    type: "Psychic",
    damage: 50,
    statusEffects: [{ effect: "Sleep", strength: 1 }],
  },

  // ======================
  // Colourless — Common
  // ======================
  {
    name: "Splash",
    rarity: "Common",
    type: "Colourless",
    damage: 0,
    statusEffects: [],
  },
  {
    name: "Leer",
    rarity: "Common",
    type: "Colourless",
    damage: 0,
    statusEffects: [{ effect: "Confuse", strength: 1 }],
  },
  {
    name: "Growl",
    rarity: "Common",
    type: "Colourless",
    damage: 0,
    statusEffects: [{ effect: "Paralyse", strength: 1 }],
  },
  {
    name: "Tail Whip",
    rarity: "Common",
    type: "Colourless",
    damage: 0,
    statusEffects: [{ effect: "Paralyse", strength: 1 }],
  },
  {
    name: "Gust",
    rarity: "Common",
    type: "Colourless",
    damage: 10,
    statusEffects: [],
  },
  {
    name: "Peck",
    rarity: "Common",
    type: "Colourless",
    damage: 15,
    statusEffects: [],
  },
  {
    name: "Pound",
    rarity: "Common",
    type: "Colourless",
    damage: 5,
    statusEffects: [{ effect: "Paralyse", strength: 1 }],
  },
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
    name: "Payday",
    rarity: "Common",
    type: "Colourless",
    damage: 10,
    statusEffects: [{ effect: "RAM", strength: 0.5 }],
  },
  {
    name: "Horn Attack",
    rarity: "Common",
    type: "Colourless",
    damage: 10,
    statusEffects: [],
  },
  {
    name: "Drill Peck",
    rarity: "Common",
    type: "Colourless",
    damage: 10,
    statusEffects: [],
  },
  {
    name: "Swords Dance",
    rarity: "Common",
    type: "Colourless",
    damage: 0,
    statusEffects: [{ effect: "RAE", strength: 2.5 }],
  },
  {
    name: "Lovely Kiss",
    rarity: "Common",
    type: "Colourless",
    damage: 0,
    statusEffects: [{ effect: "Sleep", strength: 1 }],
  },

  // Colourless — Rare
  {
    name: "Fury Swipes",
    rarity: "Rare",
    type: "Colourless",
    damage: 15,
    statusEffects: [{ effect: "RAE", strength: 1.5 }],
  },
  {
    name: "Double Slap",
    rarity: "Rare",
    type: "Colourless",
    damage: 20,
    statusEffects: [{ effect: "RAM", strength: 2 }],
  },
  {
    name: "Comet Punch",
    rarity: "Rare",
    type: "Colourless",
    damage: 20,
    statusEffects: [{ effect: "Confuse", strength: 1 }],
  },
  {
    name: "Leek Smash",
    rarity: "Rare",
    type: "Colourless",
    damage: 20,
    statusEffects: [{ effect: "Confuse", strength: 1 }],
  },
  {
    name: "Quick Attack",
    rarity: "Rare",
    type: "Colourless",
    damage: 25,
    statusEffects: [{ effect: "RAE", strength: 1 }],
  },
  {
    name: "Bite",
    rarity: "Rare",
    type: "Colourless",
    damage: 20,
    statusEffects: [],
  },
  {
    name: "Slash",
    rarity: "Rare",
    type: "Colourless",
    damage: 30,
    statusEffects: [],
  },
  {
    name: "Headbutt",
    rarity: "Rare",
    type: "Colourless",
    damage: 35,
    statusEffects: [{ effect: "RASELF", strength: 1 }],
  },
  {
    name: "Strength",
    rarity: "Rare",
    type: "Colourless",
    damage: 35,
    statusEffects: [],
  },
  {
    name: "Stomp",
    rarity: "Rare",
    type: "Colourless",
    damage: 25,
    statusEffects: [{ effect: "Paralyse", strength: 1 }],
  },
  {
    name: "Wrap",
    rarity: "Rare",
    type: "Colourless",
    damage: 25,
    statusEffects: [{ effect: "Paralyse", strength: 1 }],
  },
  {
    name: "Vice Grip",
    rarity: "Rare",
    type: "Colourless",
    damage: 25,
    statusEffects: [{ effect: "Paralyse", strength: 1 }],
  },
  {
    name: "Whirlwind",
    rarity: "Rare",
    type: "Colourless",
    damage: 10,
    statusEffects: [{ effect: "Confuse", strength: 2 }],
  },
  {
    name: "Wing Attack",
    rarity: "Rare",
    type: "Colourless",
    damage: 25,
    statusEffects: [{ effect: "RAE", strength: 1 }],
  },
  {
    name: "Egg Bomb",
    rarity: "Rare",
    type: "Colourless",
    damage: 40,
    statusEffects: [{ effect: "RASELF", strength: 2 }],
  },
  {
    name: "Double-Edge",
    rarity: "Rare",
    type: "Colourless",
    damage: 40,
    statusEffects: [{ effect: "RASELF", strength: 2 }],
  },
  {
    name: "Dizzy Punch",
    rarity: "Rare",
    type: "Colourless",
    damage: 25,
    statusEffects: [{ effect: "Confuse", strength: 2 }],
  },
  {
    name: "Dragon Rage",
    rarity: "Rare",
    type: "Colourless",
    damage: 30,
    statusEffects: [],
  },
  {
    name: "Transform",
    rarity: "Rare",
    type: "Colourless",
    damage: 0,
    statusEffects: [
      {
        effect: "Transform",
        strength: 0,
        text: "Replace your moves with your opponents for the rest of this battle.",
      },
    ],
  },
  {
    name: "Sing",
    rarity: "Rare",
    type: "Colourless",
    damage: 0,
    statusEffects: [{ effect: "Sleep", strength: 2 }],
  },
  {
    name: "Soft-Boiled",
    rarity: "Rare",
    type: "Colourless",
    damage: 0,
    statusEffects: [{ effect: "Heal", strength: 2 }],
  },
  {
    name: "Rest",
    rarity: "Rare",
    type: "Colourless",
    damage: 0,
    statusEffects: [
      { effect: "Heal", strength: 3 },
      { effect: "SleepSELF", strength: 1 },
    ],
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
    damage: 50,
    statusEffects: [
      { effect: "Confuse", strength: 2 },
      { effect: "SELF", strength: 1 },
    ],
  },
  {
    name: "Mega Punch",
    rarity: "Epic",
    type: "Colourless",
    damage: 50,
    statusEffects: [],
  },
  {
    name: "Mega Kick",
    rarity: "Epic",
    type: "Colourless",
    damage: 50,
    statusEffects: [],
  },
  {
    name: "Sky Attack",
    rarity: "Epic",
    type: "Colourless",
    damage: 45,
    statusEffects: [],
  },
  {
    name: "Hyper Fang",
    rarity: "Epic",
    type: "Colourless",
    damage: 30,
    statusEffects: [{ effect: "Paralyse", strength: 2 }],
  },
  {
    name: "Body Slam",
    rarity: "Epic",
    type: "Colourless",
    damage: 40,
    statusEffects: [{ effect: "Paralyse", strength: 1 }],
  },
  {
    name: "Fly",
    rarity: "Epic",
    type: "Colourless",
    damage: 40,
    statusEffects: [{ effect: "Paralyse", strength: 1 }],
  },
  {
    name: "Guillotine",
    rarity: "Epic",
    type: "Colourless",
    damage: 0,
    statusEffects: [{ effect: "RAM", strength: 6 }],
  },
  {
    name: "Recover",
    rarity: "Epic",
    type: "Colourless",
    damage: 0,
    statusEffects: [{ effect: "Heal", strength: 3 }],
  },

  // Colourless — Legendary
  {
    name: "Super Fang",
    rarity: "Legendary",
    type: "Colourless",
    damage: 40,
    statusEffects: [{ effect: "Paralyse", strength: 2 }],
  },
  {
    name: "Hyper Beam",
    rarity: "Legendary",
    type: "Colourless",
    damage: 55,
    statusEffects: [{ effect: "Paralyse", strength: 1 }],
  },
];

export default moves;
