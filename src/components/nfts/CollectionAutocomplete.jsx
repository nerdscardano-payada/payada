import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cardanoNftCollections } from "@/lib/cardanoNftCollections";

const normalize = (value = "") => value.toLowerCase().trim();

export default function CollectionAutocomplete({ value, onChange }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const suggestions = React.useMemo(() => {
    const query = normalize(value);
    const ranked = cardanoNftCollections.filter((item) => {
      const name = normalize(item);
      return !query || name.includes(query);
    }).sort((a, b) => {
      const aStarts = normalize(a).startsWith(query);
      const bStarts = normalize(b).startsWith(query);
      if (aStarts !== bStarts) return aStarts ? -1 : 1;
      return a.localeCompare(b);
    });

    return ranked.slice(0, 8);
  }, [value]);

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
        placeholder="Typ bv. House of Titans"
        autoComplete="off"
      />
      {isOpen && suggestions.length > 0 && (
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
        </div>
      )}
    </div>
  );
}