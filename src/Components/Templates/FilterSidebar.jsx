import { useState } from "react";
import { ChevronUp,RotateCcw } from "lucide-react";

import { templateColors,templateStyles,templateTypes } from "./templateData";

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
}){
  return(
    <aside
      className={`max-h-[70vh] w-full shrink-0 overflow-y-auto rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-4 shadow-[0_8px_24px_rgba(112,90,224,0.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.25)] sm:rounded-2xl sm:p-5 min-[900px]:max-h-none min-[900px]:w-[220px] min-[900px]:self-start min-[900px]:overflow-visible lg:w-[230px] xl:w-[240px] 2xl:w-[250px] ${
        showFilters?"block":"hidden min-[900px]:block"
      }`}
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
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
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
    </aside>
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

  return(
    <div className="mt-4 border-t border-[var(--border-default)] pt-3.5 sm:mt-5 sm:pt-4">
      <button
        type="button"
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

      {open&&(
        <div className="mt-2.5 sm:mt-3">
          {children}
        </div>
      )}
    </div>
  );
}