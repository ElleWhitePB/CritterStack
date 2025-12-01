const softStarts = [
  "Glee", "Fli", "Bri", "Puff", "Miri", "Shiv", "Wisp", "Brum", "Noodle", "Fuzzle",
];

const middles = [
  "ble", "bo", "bi", "va", "lo", "ri", "doo", "wee", "mo", "na",
];

const ends = [
  "kin", "let", "ling", "bloom", "puff", "whisk", "moss", "sprig", "snip", "flick",
];

// rare apostrophes still allowed
function maybeApostrophe(str) {
  if (Math.random() > 0.05) return str; // 95% no apostrophe
  const pos = Math.floor(Math.random() * (str.length - 2)) + 1;
  return str.slice(0, pos) + "'" + str.slice(pos);
}

export function generateCreatureName() {
  const s = pick(softStarts);
  const m = pick(middles);
  const e = pick(ends);
  const name = maybeApostrophe(s + m + e);
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateSpeciesName() {
  const descriptors = [
    // Soft natural descriptors (Group 1 + 2)
    "Moss", "Glow", "Starlit", "Bramble", "Ash", "Pebble", "Mire", "Drift",
    "Spore", "Cinder", "Mist", "Dusk", "Thimble", "Bark", "Hollow",
    "Echo", "Shimmer", "Rustle", "Wick", "Tangle", "Soot", "Bloom",
    "Mossy", "Nettle", "Shiver", "Gloom", "Lunar"
  ];

  const creatureForms = [
    // Small critter forms (Group 1 + 2)
    "Nib", "Pip", "Grub", "Moth", "Sprite", "Wisp", "Back",
    "Fin", "Tuft", "Sprout", "Flicker", "Gnat", "Wing", "Mare", "ling"
  ];

  const dramaticForms = [
    // Larger species (Group 3)
    "Stag", "Hound", "Ram", "Treader", "Stagwing", "Mare", "Ox", "Crawler"
  ];

  // 80% small creature names, 20% dramatic creature names
  const useDramatic = Math.random() < 0.2;

  const descriptor = pick(descriptors);
  const form = useDramatic
    ? pick(dramaticForms)
    : pick(creatureForms);

  // 70% chance to hyphenate (Moon-Pip, Star-Moth, Thornbellow style)
  const hyphenate = Math.random() < 0.7;

  // Assemble
  const name = hyphenate ? `${descriptor}-${form}` : `${descriptor}${form}`;

  return name;
}
