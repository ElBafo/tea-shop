import type { ItemId } from "./types";

export interface ItemLook {
  id: ItemId;
  label: string;
  kind: "tin" | "cup" | "macaron";
  fill: string;
  deep: string;
  ink: string;
}

export const ITEMS: Record<ItemId, ItemLook> = {
  rose: {
    id: "rose",
    label: "Rose",
    kind: "tin",
    fill: "#f0b3b8",
    deep: "#d47d86",
    ink: "#7a3b42",
  },
  jasmine: {
    id: "jasmine",
    label: "Jasmine",
    kind: "tin",
    fill: "#f3d98a",
    deep: "#d4b45a",
    ink: "#6d5720",
  },
  matcha: {
    id: "matcha",
    label: "Matcha",
    kind: "tin",
    fill: "#9bb784",
    deep: "#6f8a58",
    ink: "#334226",
  },
  chai: {
    id: "chai",
    label: "Chai",
    kind: "tin",
    fill: "#e0a06e",
    deep: "#b86d3c",
    ink: "#5c3216",
  },
  lavender: {
    id: "lavender",
    label: "Lavender",
    kind: "tin",
    fill: "#c9b4dc",
    deep: "#9a7fb3",
    ink: "#4d3860",
  },
  earl: {
    id: "earl",
    label: "Earl Grey",
    kind: "tin",
    fill: "#8ea0b5",
    deep: "#5f738a",
    ink: "#2c3a4a",
  },
  cup: {
    id: "cup",
    label: "Cup",
    kind: "cup",
    fill: "#fff6ee",
    deep: "#e6d2c2",
    ink: "#7a5a4a",
  },
  macaron: {
    id: "macaron",
    label: "Macaron",
    kind: "macaron",
    fill: "#f4b8c8",
    deep: "#de7f9a",
    ink: "#7a3148",
  },
};
