import { boardFromLevel } from "../src/game/engine";
import { mulberry32, shuffleInPlace, solve } from "../src/game/solver";
import type { ItemId, LevelDef, Tube } from "../src/game/types";

interface Recipe {
  id: number;
  name: string;
  blurb: string;
  kinds: ItemId[];
  capacity: number;
  empties: number;
  sealed: number[];
  seed: number;
  minPar: number;
  maxPar: number;
}

const recipes: Recipe[] = [
  {
    id: 5,
    name: "Afternoon Rush",
    blurb: "Four flavours, still no hurry.",
    kinds: ["rose", "jasmine", "matcha", "chai"],
    capacity: 4,
    empties: 2,
    sealed: [],
    seed: 1804,
    minPar: 8,
    maxPar: 16,
  },
  {
    id: 6,
    name: "The Little Lid",
    blurb: "A lid hides what sits under the top treat.",
    kinds: ["rose", "jasmine", "matcha", "chai"],
    capacity: 4,
    empties: 2,
    sealed: [1],
    seed: 2207,
    minPar: 9,
    maxPar: 18,
  },
  {
    id: 7,
    name: "Hidden Steam",
    blurb: "Two jars keep their secrets.",
    kinds: ["rose", "jasmine", "matcha", "lavender"],
    capacity: 4,
    empties: 2,
    sealed: [0, 3],
    seed: 3341,
    minPar: 10,
    maxPar: 20,
  },
  {
    id: 8,
    name: "Sunday Counter",
    blurb: "Cups join the tins on a busy shelf.",
    kinds: ["rose", "jasmine", "matcha", "chai", "cup"],
    capacity: 4,
    empties: 2,
    sealed: [2],
    seed: 4410,
    minPar: 12,
    maxPar: 22,
  },
  {
    id: 9,
    name: "Full House",
    blurb: "A crowded shelf, still no timer.",
    kinds: ["rose", "jasmine", "matcha", "lavender", "earl", "cup"],
    capacity: 4,
    empties: 2,
    sealed: [1, 4],
    seed: 5522,
    minPar: 14,
    maxPar: 26,
  },
  {
    id: 10,
    name: "Closing Time",
    blurb: "Tidy the last jars. The bakery can wait.",
    kinds: ["rose", "jasmine", "matcha", "chai", "lavender", "macaron"],
    capacity: 4,
    empties: 2,
    sealed: [0, 2, 5],
    seed: 6688,
    minPar: 14,
    maxPar: 28,
  },
];

function packTubes(
  kinds: ItemId[],
  capacity: number,
  empties: number,
  rand: () => number,
): Tube[] {
  const items: ItemId[] = [];
  for (const kind of kinds) {
    for (let i = 0; i < capacity; i += 1) items.push(kind);
  }
  shuffleInPlace(items, rand);
  const filled = kinds.length;
  const tubes: Tube[] = [];
  let offset = 0;
  for (let i = 0; i < filled; i += 1) {
    tubes.push(items.slice(offset, offset + capacity));
    offset += capacity;
  }
  for (let i = 0; i < empties; i += 1) tubes.push([]);
  return tubes;
}

function alreadyWon(tubes: Tube[]): boolean {
  return tubes.every(
    (tube) => tube.length === 0 || tube.every((item) => item === tube[0]),
  );
}

function generateFromRecipe(recipe: Recipe): LevelDef | null {
  for (let extra = 0; extra < 80; extra += 1) {
    const rand = mulberry32(recipe.seed + extra * 97);
    const tubes = packTubes(recipe.kinds, recipe.capacity, recipe.empties, rand);
    if (alreadyWon(tubes)) continue;
    const sealed = tubes.map((_, index) => recipe.sealed.includes(index));
    const level: LevelDef = {
      id: recipe.id,
      name: recipe.name,
      blurb: recipe.blurb,
      capacity: recipe.capacity,
      tubes,
      sealed,
      par: 0,
    };
    const result = solve(boardFromLevel(level));
    if (!result.solvable) continue;
    const par = result.moves.length;
    if (par < recipe.minPar || par > recipe.maxPar) continue;
    return { ...level, par };
  }
  return null;
}

export function generatedLevels(): LevelDef[] {
  const levels: LevelDef[] = [];
  for (const recipe of recipes) {
    const level = generateFromRecipe(recipe);
    if (!level) {
      throw new Error(`Could not generate a solvable board for ${recipe.name}`);
    }
    levels.push(level);
  }
  return levels;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const level of generatedLevels()) {
    console.log(JSON.stringify(level, null, 2));
  }
}
