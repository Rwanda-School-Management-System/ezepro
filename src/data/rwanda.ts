export type RwandaTree = Record<
  string,
  Record<string, Record<string, Record<string, string[]>>>
>;

let cache: RwandaTree | null = null;
let pending: Promise<RwandaTree> | null = null;

/** Lazily loads the full Rwanda administrative tree (province → village). */
export function loadRwanda(): Promise<RwandaTree> {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = import("./rwanda-locations.json").then((mod) => {
      cache = (mod.default ?? mod) as RwandaTree;
      return cache;
    });
  }
  return pending;
}

export type RwandaLocation = {
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
};

export const EMPTY_LOCATION: RwandaLocation = {
  province: "",
  district: "",
  sector: "",
  cell: "",
  village: "",
};
