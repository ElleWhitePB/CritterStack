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

export function generatePeculiarName() {
  const s = pick(softStarts);
  const m = pick(middles);
  const e = pick(ends);
  const name = maybeApostrophe(s + m + e);
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
