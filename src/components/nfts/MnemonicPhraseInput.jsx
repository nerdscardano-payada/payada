import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TOTAL_WORDS = 24;
const VALID_COUNTS = [12, 15, 18, 21, 24];

function toWords(value = "") {
  const words = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return Array.from({ length: TOTAL_WORDS }, (_, index) => words[index] || "");
}

export default function MnemonicPhraseInput({ value, onChange, disabled }) {
  const [activeIndex, setActiveIndex] = React.useState(null);
  const words = React.useMemo(() => toWords(value), [value]);
  const activePrefix = activeIndex === null ? "" : words[activeIndex].trim().toLowerCase();
  const enteredCount = value.trim() ? value.trim().split(/\s+/).filter(Boolean).length : 0;

  const { data: suggestions = [] } = useQuery({
    queryKey: ["cardano-mnemonic-suggestions", activePrefix],
    enabled: activePrefix.length > 0,
    queryFn: async () => {
      const response = await base44.functions.invoke("searchCardanoMnemonicWords", { prefix: activePrefix });
      return response.data.words || [];
    },
  });

  const updateWord = (index, nextValue) => {
    const nextWords = [...words];
    nextWords[index] = nextValue.toLowerCase().replace(/[^a-z]/g, "");
    onChange(nextWords.join(" ").replace(/\s+/g, " ").trim());
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Label>Recovery phrase</Label>
        <span className={`text-xs font-medium ${VALID_COUNTS.includes(enteredCount) ? "text-emerald-600" : "text-slate-500"}`}>
          {enteredCount}/24 woorden
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {words.map((word, index) => (
          <div key={index} className="relative space-y-1">
            <span className="text-xs font-medium text-slate-400">{index + 1}</span>
            <Input
              value={word}
              disabled={disabled}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder={`woord ${index + 1}`}
              onFocus={() => setActiveIndex(index)}
              onBlur={() => setTimeout(() => setActiveIndex(null), 120)}
              onChange={(e) => updateWord(index, e.target.value)}
            />
            {activeIndex === index && activePrefix && suggestions.length > 0 && (
              <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      updateWord(index, suggestion);
                      setActiveIndex(null);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs leading-5 text-slate-500">Typ een beginletter en je krijgt Cardano/BIP39 woorden als suggestie. De phrase blijft zichtbaar tijdens het invullen en wordt pas na opslaan versleuteld bewaard.</p>
    </div>
  );
}