// Shared team join-code generation — used by both the student self-serve
// team creation route and the instructor-created team route, so the format
// (and word list) stays identical no matter who creates the team.

const WORDS = [
  "NOVA", "BOLT", "APEX", "FLUX", "VEGA", "ZION", "ECHO", "HALO",
  "IRIS", "JADE", "KITE", "LYNX", "MIST", "NEON", "ONYX", "PIKE",
  "QUILL", "REEF", "SAGE", "TIDE", "URSA", "VALE", "WAVE", "XENO",
  "YARN", "ZEST", "ARC", "BAY", "CREST", "DAWN",
];

export function generateJoinCode(): string {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `${word}-${digits}`;
}
