import { Search, Globe2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface InfluencerFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  nationalities: readonly string[];
  selectedNationality: string;
  onSelectNationality: (nation: string) => void;
}

export function InfluencerFilters({
  searchTerm,
  onSearchChange,
  nationalities,
  selectedNationality,
  onSelectNationality,
}: InfluencerFiltersProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 sm:p-6 mb-12 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl shadow-black/20">
      <div className="relative w-full md:w-96">
        <Input
          type="text"
          placeholder="Search by creator name, niche, or show..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Search size={17} />}
        />
      </div>

      <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
        <span className="text-xs text-text-muted mr-1 flex items-center gap-1">
          <Globe2 size={13} />
          <span>Region:</span>
        </span>
        {nationalities.map((nation) => (
          <button
            key={nation}
            type="button"
            onClick={() => onSelectNationality(nation)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all capitalize cursor-pointer",
              selectedNationality === nation
                ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20"
                : "bg-white/5 text-text-secondary hover:text-white hover:bg-white/10 border border-white/5"
            )}
          >
            {nation === "all" ? "All Creators" : nation}
          </button>
        ))}
      </div>
    </div>
  );
}
