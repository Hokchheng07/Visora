import { useState } from "react";
import { ChevronUp, RotateCcw, X } from "lucide-react";

import { templateColors, templateStyles, templateTypes } from "./templateData";

export default function FilterSidebar({
  showFilters,
  selectedTypes,
  setSelectedTypes,
  selectedStyles,
  setSelectedStyles,
  selectedColors,
  setSelectedColors,
  orientation,
  setOrientation,
  toggleArrayValue,
  resetFilters,
}) {
  return (
    <aside
      className={`w-full shrink-0 rounded-2xl border border-[var(--border-card)] bg-[var(--surface-card)] p-5 shadow-[0_12px_30px_rgba(112,90,224,0.08)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.25)] min-[900px]:block min-[900px]:self-start min-[900px]:w-60 lg:w-64 ${
        showFilters ? "block" : "hidden"
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--text-heading)]">
          Filters
        </h2>

        <button
          type="button"
          onClick={resetFilters}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <RotateCcw size={13} />
          Reset All
        </button>
      </div>

      <FilterSection title="Type">
        <div className="space-y-3">
          {templateTypes.map((type) => (
            <FilterCheckbox
              key={type}
              label={type}
              checked={selectedTypes.includes(type)}
              onChange={() => toggleArrayValue(type, setSelectedTypes)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Style">
        <div className="space-y-3">
          {templateStyles.map((style) => (
            <FilterCheckbox
              key={style}
              label={style}
              checked={selectedStyles.includes(style)}
              onChange={() => toggleArrayValue(style, setSelectedStyles)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Color">
        <div className="flex flex-wrap gap-2.5">
          {templateColors.map((color) => {
            const active = selectedColors.includes(color.name);

            return (
              <button
                key={color.name}
                type="button"
                title={color.name}
                aria-label={color.name}
                aria-pressed={active}
                onClick={() => toggleArrayValue(color.name, setSelectedColors)}
                className={`h-7 w-7 rounded-full border border-white shadow-sm transition ${
                  active
                    ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-[var(--surface-card)]"
                    : "hover:scale-110"
                }`}
                style={{ background: color.value }}
              />
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Orientation">
        <div className="space-y-2.5">
          {["Landscape", "Portrait"].map((value) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-body)]"
            >
              <input
                type="radio"
                name="orientation"
                checked={orientation === value}
                onChange={() => setOrientation(value)}
                className="h-[18px] w-[18px] accent-primary"
              />

              {value}
            </label>
          ))}
        </div>

        {orientation !== "All" && (
          <button
            type="button"
            onClick={() => setOrientation("All")}
            className="mt-3 text-xs font-medium text-primary hover:underline"
          >
            Clear
          </button>
        )}
      </FilterSection>
    </aside>
  );
}

function FilterCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-body)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-[18px] w-[18px] accent-primary"
      />

      {label}
    </label>
  );
}

function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mt-5 border-t border-[var(--border-default)] pt-4">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between text-sm font-semibold text-[var(--text-heading)]"
      >
        {title}

        <ChevronUp
          size={16}
          className={`transition-transform ${open ? "" : "rotate-180"}`}
        />
      </button>

      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}