import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, ChevronUp, RotateCcw, SlidersHorizontal } from "lucide-react";

import { templateColors,templateStyles,templateTypes } from "./templateData";

export default function FilterSidebar({
  showFilters,
  searchFilterRef,
  onToggle,
  onClose,
  activeFilterCount = 0,
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
}){
  const toggleRef = useRef(null);
  const closeFilters = () => {
    onClose();
    const smallScreen = window.matchMedia("(min-width: 320px) and (max-width: 425px)").matches;
    (smallScreen ? searchFilterRef : toggleRef)?.current?.focus();
  };
  return(
    <div className="templates-filter-disclosure" data-open={showFilters}>
      <button
        ref={toggleRef}
        type="button"
        className="templates-filter-toggle"
        aria-expanded={showFilters}
        aria-controls="template-filters"
        onClick={onToggle}
      >
        <SlidersHorizontal size={18} aria-hidden="true" />
        <span>Filters</span>
        {activeFilterCount > 0 && <span className="templates-filter-count">{activeFilterCount}</span>}
        <ChevronDown className="templates-filter-chevron" size={18} aria-hidden="true" />
      </button>
      <div className="templates-filter-collapse">
        <div className="templates-filter-clip">
    <aside
      id="template-filters"
      aria-label="Template filters"
      onKeyDown={(event) => {
        if (event.key === "Escape" && window.matchMedia("(max-width: 899px)").matches) closeFilters();
      }}
      className="w-full rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-4 sm:rounded-2xl sm:p-5"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[var(--text-heading)] sm:text-base">
          Filters
        </h2>

        <button
          type="button"
          onClick={resetFilters}
          className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-primary transition hover:underline sm:text-xs"
        >
          <RotateCcw className="h-3 w-3 sm:h-[13px] sm:w-[13px]"/>
          Reset All
        </button>
      </div>

      {/* TYPE */}
      <FilterSection title="Type">
        <div className="space-y-2.5 sm:space-y-3">
          {templateTypes.map((type)=>(
            <FilterCheckbox
              key={type}
              label={type}
              checked={selectedTypes.includes(type)}
              onChange={()=>toggleArrayValue(type,setSelectedTypes)}
            />
          ))}
        </div>
      </FilterSection>

      {/* STYLE */}
      <FilterSection title="Style">
        <div className="space-y-2.5 sm:space-y-3">
          {templateStyles.map((style)=>(
            <FilterCheckbox
              key={style}
              label={style}
              checked={selectedStyles.includes(style)}
              onChange={()=>toggleArrayValue(style,setSelectedStyles)}
            />
          ))}
        </div>
      </FilterSection>

      {/* COLOR */}
      <FilterSection title="Color">
        <div className="template-filter-colors flex flex-wrap gap-2 sm:gap-2.5">
          {templateColors.map((color)=>{
            const active=selectedColors.includes(color.name);

            return(
              <button
                key={color.name}
                type="button"
                title={color.name}
                aria-label={color.name}
                aria-pressed={active}
                onClick={()=>toggleArrayValue(color.name,setSelectedColors)}
                className={`h-6 w-6 rounded-full border border-white shadow-sm transition sm:h-7 sm:w-7 ${
                  active
                    ?"scale-110 ring-2 ring-primary ring-offset-2 ring-offset-[var(--surface-card)]"
                    :"hover:scale-110"
                }`}
                style={{background:color.value}}
              />
            );
          })}
        </div>
      </FilterSection>

      {/* ORIENTATION */}
      <FilterSection title="Orientation">
        <div className="space-y-2 sm:space-y-2.5">
          {["Landscape","Portrait"].map((value)=>(
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 text-xs text-[var(--text-body)] sm:text-sm"
            >
              <input
                type="radio"
                name="orientation"
                checked={orientation===value}
                onChange={()=>setOrientation(value)}
                className="h-4 w-4 accent-primary sm:h-[18px] sm:w-[18px]"
              />

              {value}
            </label>
          ))}
        </div>

        {orientation!=="All"&&(
          <button
            type="button"
            onClick={()=>setOrientation("All")}
            className="mt-3 text-[10px] font-medium text-primary hover:underline sm:text-xs"
          >
            Clear
          </button>
        )}
      </FilterSection>
      <button type="button" onClick={closeFilters} className="mt-5 min-h-11 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white min-[900px]:hidden">
        Show templates
      </button>
    </aside>
        </div>
      </div>
    </div>
  );
}

function FilterCheckbox({label,checked,onChange}){
  return(
    <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--text-body)] sm:text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 accent-primary sm:h-[18px] sm:w-[18px]"
      />

      <span className="truncate">
        {label}
      </span>
    </label>
  );
}

function FilterSection({title,children}){
  const [open,setOpen]=useState(true);
  const reduceMotion = useReducedMotion();

  return(
    <div className="template-filter-section mt-4 border-t border-[var(--border-default)] pt-3.5 sm:mt-5 sm:pt-4">
      <button
        type="button"
        aria-expanded={open}
        onClick={()=>setOpen((current)=>!current)}
        className="flex w-full items-center justify-between text-xs font-semibold text-[var(--text-heading)] sm:text-sm"
      >
        {title}

        <ChevronUp
          className={`h-[14px] w-[14px] transition-transform sm:h-4 sm:w-4 ${
            open?"":"rotate-180"
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pb-1 pt-2.5 sm:pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
