import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import { cardanoNftCollections } from "@/lib/cardanoNftCollections";

const normalize = (value = "") => value.toLowerCase().trim();
const slugify = (value = "") =>
  value
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export default function CollectionAutocomplete({ value, onChange }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dbCollections, setDbCollections] = React.useState([]);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    base44.entities.GlobalNftCollection.list()
      .then((rows) => {
        if (mounted) setDbCollections(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const allNames = React.useMemo(() => {
    const fromDb = dbCollections.map((c) => c?.name).filter(Boolean);
    const combined = [...fromDb, ...cardanoNftCollections];
    // Deduplicate case-insensitively, keep first occurrence
    const seen = new Set();
    const unique = [];
    for (const n of combined) {
      const key = normalize(n);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(n);
      }
    }
    return unique;
  }, [dbCollections]);

  const suggestions = React.useMemo(() => {
    const query = normalize(value);
    const ranked = allNames
      .filter((n) => !query || normalize(n).includes(query))
      .sort((a, b) => {
        const aStarts = normalize(a).startsWith(query);
        const bStarts = normalize(b).startsWith(query);
        if (aStarts !== bStarts) return aStarts ? -1 : 1;
        return a.localeCompare(b);
      });
    return ranked.slice(0, 8);
  }, [value, allNames]);

  const existsExact = React.useMemo(() => {
    const q = normalize(value);
    return allNames.some((n) => normalize(n) === q);
  }, [value, allNames]);

  const handleAdd = async () => {
    const name = (value || "").trim();
    if (!name) return;
    setIsSaving(true);
    try {
      const record = await base44.entities.GlobalNftCollection.create({
        name,
        slug: slugify(name),
        source: "custom",
      });
      setDbCollections((prev) => [...prev, record]);
      onChange(name);
      setIsOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative">
      <Label>Collection</Label>
      <Input
        value={value || ""}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 120)}
        placeholder="Type e.g. House of Titans"
        autoComplete="off"
      />
      {isOpen && (suggestions.length > 0 || (!!value && !existsExact)) && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {suggestions.map((collection) => (
            <button
              key={collection}
              type="button"
              onMouseDown={() => {
                onChange(collection);
                setIsOpen(false);
              }}
              className="block w-full border-b border-slate-100 px-3 py-2 text-left text-sm text-slate-700 last:border-b-0 hover:bg-slate-50"
            >
              {collection}
            </button>
          ))}
          {!!value && !existsExact && (
            <button
              type="button"
              onMouseDown={handleAdd}
              disabled={isSaving}
              className="block w-full px-3 py-2 text-left text-sm text-indigo-600 hover:bg-indigo-50 disabled:opacity-60"
            >
              {isSaving ? "Adding..." : `Add: "${value.trim()}"`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}