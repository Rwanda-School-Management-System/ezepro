import { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { loadRwanda, type RwandaLocation, type RwandaTree } from "@/data/rwanda";

type Props = {
  value: RwandaLocation;
  onChange: (next: RwandaLocation) => void;
  idPrefix?: string;
};

export function RwandaLocationPicker({ value, onChange, idPrefix = "loc" }: Props) {
  const [tree, setTree] = useState<RwandaTree | null>(null);

  useEffect(() => {
    let active = true;
    loadRwanda().then((t) => {
      if (active) setTree(t);
    });
    return () => {
      active = false;
    };
  }, []);

  const provinces = useMemo(() => (tree ? Object.keys(tree) : []), [tree]);
  const districts = useMemo(
    () => (tree && value.province ? Object.keys(tree[value.province] ?? {}) : []),
    [tree, value.province],
  );
  const sectors = useMemo(
    () =>
      tree && value.province && value.district
        ? Object.keys(tree[value.province]?.[value.district] ?? {})
        : [],
    [tree, value.province, value.district],
  );
  const cells = useMemo(
    () =>
      tree && value.province && value.district && value.sector
        ? Object.keys(tree[value.province]?.[value.district]?.[value.sector] ?? {})
        : [],
    [tree, value.province, value.district, value.sector],
  );
  const villages = useMemo(
    () =>
      tree && value.province && value.district && value.sector && value.cell
        ? tree[value.province]?.[value.district]?.[value.sector]?.[value.cell] ?? []
        : [],
    [tree, value.province, value.district, value.sector, value.cell],
  );

  const levels = [
    {
      key: "province" as const,
      label: "Province",
      options: provinces,
      disabled: !tree,
      next: (v: string): RwandaLocation => ({
        province: v,
        district: "",
        sector: "",
        cell: "",
        village: "",
      }),
    },
    {
      key: "district" as const,
      label: "District",
      options: districts,
      disabled: !value.province,
      next: (v: string): RwandaLocation => ({
        ...value,
        district: v,
        sector: "",
        cell: "",
        village: "",
      }),
    },
    {
      key: "sector" as const,
      label: "Sector",
      options: sectors,
      disabled: !value.district,
      next: (v: string): RwandaLocation => ({ ...value, sector: v, cell: "", village: "" }),
    },
    {
      key: "cell" as const,
      label: "Cell",
      options: cells,
      disabled: !value.sector,
      next: (v: string): RwandaLocation => ({ ...value, cell: v, village: "" }),
    },
    {
      key: "village" as const,
      label: "Village",
      options: villages,
      disabled: !value.cell,
      next: (v: string): RwandaLocation => ({ ...value, village: v }),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {levels.map((lvl) => (
        <div key={lvl.key} className="grid gap-2">
          <Label htmlFor={`${idPrefix}-${lvl.key}`}>{lvl.label}</Label>
          <Select
            value={value[lvl.key]}
            onValueChange={(v) => onChange(lvl.next(v))}
            disabled={lvl.disabled}
          >
            <SelectTrigger id={`${idPrefix}-${lvl.key}`}>
              <SelectValue placeholder={tree ? `Select ${lvl.label.toLowerCase()}` : "Loading…"} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {lvl.options.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}
