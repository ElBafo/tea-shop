import type { ItemId, LevelDef } from "./types";

const R: ItemId = "rose";
const J: ItemId = "jasmine";
const M: ItemId = "matcha";
const C: ItemId = "chai";
const L: ItemId = "lavender";
const E: ItemId = "earl";
const U: ItemId = "cup";
const A: ItemId = "macaron";

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    name: "First Pour",
    blurb: "Tap a jar, then tap another to tuck the top treats in.",
    capacity: 4,
    tubes: [
      [R, R, J, J],
      [J, J, R, R],
      [],
    ],
    par: 2,
  },
  {
    id: 2,
    name: "Pair of Tins",
    blurb: "Matching stacks can travel together.",
    capacity: 4,
    tubes: [
      [R, J, R, J],
      [J, R, J, R],
      [],
    ],
    par: 6,
  },
  {
    id: 3,
    name: "Three Scents",
    blurb: "Rose, jasmine, and matcha share a shelf.",
    capacity: 4,
    tubes: [
      [R, J, M],
      [M, R, J],
      [J, M, R],
      [],
    ],
    par: 6,
  },
  {
    id: 4,
    name: "Open Shelf",
    blurb: "An extra empty jar makes room to breathe.",
    capacity: 4,
    tubes: [
      [R, J, M, R],
      [J, M, R, J],
      [M, R, J, M],
      [],
      [],
    ],
    par: 9,
  },
  {
    id: 5,
    name: "Afternoon Rush",
    blurb: "Four flavours, still no hurry.",
    capacity: 4,
    tubes: [
      [R, C, J, M],
      [M, R, C, J],
      [J, M, R, C],
      [C, J, M, R],
      [],
      [],
    ],
    par: 12,
  },
  {
    id: 6,
    name: "The Little Lid",
    blurb: "A lid hides what sits under the top treat.",
    capacity: 4,
    tubes: [
      [R, J, C, M],
      [C, R, J, C],
      [M, C, R, J],
      [J, M, M, R],
      [],
      [],
    ],
    sealed: [false, true, false, false, false, false],
    par: 11,
  },
  {
    id: 7,
    name: "Hidden Steam",
    blurb: "Two jars keep their secrets.",
    capacity: 4,
    tubes: [
      [L, R, J, M],
      [M, L, R, J],
      [J, M, L, R],
      [R, J, M, L],
      [],
      [],
    ],
    sealed: [true, false, false, true, false, false],
    par: 12,
  },
  {
    id: 8,
    name: "Sunday Counter",
    blurb: "Cups join the tins on a busy shelf.",
    capacity: 4,
    tubes: [
      [R, U, J, M],
      [C, R, U, J],
      [M, C, R, U],
      [J, M, C, R],
      [U, J, M, C],
      [],
      [],
    ],
    sealed: [false, false, true, false, false, false, false],
    par: 15,
  },
  {
    id: 9,
    name: "Full House",
    blurb: "A crowded shelf, still no timer.",
    capacity: 4,
    tubes: [
      [R, E, J, M],
      [L, R, E, J],
      [U, L, R, E],
      [M, U, L, R],
      [J, M, U, L],
      [E, J, M, U],
      [],
      [],
    ],
    sealed: [false, true, false, false, true, false, false, false],
    par: 18,
  },
  {
    id: 10,
    name: "Closing Time",
    blurb: "Tidy the last jars. The bakery can wait.",
    capacity: 4,
    tubes: [
      [R, A, J, M],
      [C, R, A, J],
      [L, C, R, A],
      [M, L, C, R],
      [J, M, L, C],
      [A, J, M, L],
      [],
      [],
    ],
    sealed: [true, false, true, false, false, true, false, false],
    par: 18,
  },
];

export function getLevel(id: number): LevelDef | undefined {
  return LEVELS.find((level) => level.id === id);
}
