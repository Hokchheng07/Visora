import { useMemo,useState } from "react";
import {
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  Sparkles,
  SquarePlus,
} from "lucide-react";
import { Link } from "react-router";

import { PROFILE_TEMPLATES } from "../Profile/profileData";
import { TemplateCard } from "../Profile/TemplateCard";

import CreateNewShelf from "./CreateNewShelf";
import TeamSpacesPromo from "./TeamSpacesPromo";
import TrendingTemplates from "./TrendingTemplates";

const SORT_OPTIONS=[
  ["edited","Sort: Last edited"],
  ["name","Sort: Name (A-Z)"],
  ["views","Sort: Most viewed"],
];

export default function Recent(){
  // Same mock set the profile page uses until the designs endpoint exists.
  const [designs,setDesigns]=useState(PROFILE_TEMPLATES);
  const [query,setQuery]=useState("");
  const [sort,setSort]=useState("edited");
  const [view,setView]=useState("grid");

  const visibleDesigns=useMemo(()=>{
    const needle=query.trim().toLowerCase();

    const filtered=designs.filter((design)=>{
      if(!needle)return true;

      return(
        design.title.toLowerCase().includes(needle)||
        design.subtitle.toLowerCase().includes(needle)||
        design.tags.some((tag)=>
          tag.label.toLowerCase().includes(needle)
        )
      );
    });

    return[...filtered].sort((a,b)=>{
      if(sort==="name"){
        return a.title.localeCompare(b.title);
      }

      if(sort==="views"){
        return b.views-a.views;
      }

      return(
        new Date(b.updatedAt).getTime()-
        new Date(a.updatedAt).getTime()
      );
    });
  },[designs,query,sort]);

  const updateDesign=(updatedDesign)=>{
    setDesigns((current)=>
      current.map((design)=>
        design.id===updatedDesign.id
          ?{
              ...updatedDesign,
              updatedAt:new Date().toISOString(),
            }
          :design
      )
    );
  };

  const renameDesign=(id,title)=>{
    setDesigns((current)=>
      current.map((design)=>
        design.id===id
          ?{
              ...design,
              title,
              updatedAt:new Date().toISOString(),
            }
          :design
      )
    );
  };

  const duplicateDesign=(design,title)=>{
    setDesigns((current)=>[
      {
        ...design,
        id:`design-${Date.now()}`,
        title:title||`${design.title} Copy`,
        views:0,
        visibility:"private",
        status:"draft",
        publishedAt:null,
        updatedAt:new Date().toISOString(),
      },
      ...current,
    ]);
  };

  const deleteDesign=(id)=>{
    setDesigns((current)=>
      current.filter((design)=>design.id!==id)
    );
  };

  return(
    <section className="min-h-screen bg-[var(--surface-warm)] bg-sparkle px-3 pb-8 pt-3 text-[var(--text-body)] sm:px-5 sm:pb-10 sm:pt-4 md:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto w-full max-w-[1650px]">
        {/* PAGE HEADER */}
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          {/* LEFT */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-[var(--text-heading)] sm:text-4xl">
                Recent
              </h1>

              <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                {designs.length} Files
              </span>

              <Sparkles className="h-4 w-4 text-secondary"/>
            </div>

            <p className="mt-2 max-w-[560px] text-sm text-[var(--text-muted)]">
              Continue working on your latest designs, collaborative boards, and
              vector graphics.
            </p>
          </div>

          {/* RIGHT CONTROLS */}
          <div className="flex flex-wrap items-center gap-3">
            {/* FILTER */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />

              <input
                type="text"
                value={query}
                onChange={(event)=>setQuery(event.target.value)}
                placeholder="Filter designs..."
                className="h-11 w-full min-w-[200px] rounded-full border border-[var(--border-card)] bg-[var(--surface-card)] pl-10 pr-4 text-sm text-[var(--text-heading)] outline-none transition placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-primary/15 sm:w-[220px]"
              />
            </div>

            {/* SORT */}
            <div className="relative">
              <SlidersHorizontal
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />

              <select
                value={sort}
                onChange={(event)=>setSort(event.target.value)}
                aria-label="Sort designs"
                className="h-11 cursor-pointer appearance-none rounded-full border border-[var(--border-card)] bg-[var(--surface-card)] pl-10 pr-8 text-sm font-medium text-[var(--text-heading)] outline-none transition focus:ring-2 focus:ring-primary/15"
              >
                {SORT_OPTIONS.map(([value,label])=>(
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* VIEW TOGGLE */}
            <div className="inline-flex h-11 items-center gap-1 rounded-full border border-[var(--border-card)] bg-[var(--surface-card)] p-1">
              <button
                type="button"
                onClick={()=>setView("grid")}
                aria-label="Grid view"
                aria-pressed={view==="grid"}
                className={`grid h-9 w-9 place-items-center rounded-full transition ${
                  view==="grid"
                    ?"bg-primary text-[var(--text-on-brand)]"
                    :"text-[var(--text-muted)] hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <LayoutGrid className="h-[18px] w-[18px]"/>
              </button>

              <button
                type="button"
                onClick={()=>setView("list")}
                aria-label="List view"
                aria-pressed={view==="list"}
                className={`grid h-9 w-9 place-items-center rounded-full transition ${
                  view==="list"
                    ?"bg-primary text-[var(--text-on-brand)]"
                    :"text-[var(--text-muted)] hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <List className="h-[18px] w-[18px]"/>
              </button>
            </div>

            {/* NEW CANVAS */}
            <Link
              to="/editor"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-[var(--text-on-brand)] transition hover:opacity-90"
            >
              <SquarePlus className="h-4 w-4"/>
              New Canvas
            </Link>
          </div>
        </div>

        {/* QUICK FORMATS */}
        <CreateNewShelf/>

        {/* SECTION CHIP */}
        <div className="mt-7 flex items-center gap-2 border-b border-[var(--border-default)] pb-5">
          <span className="inline-flex h-9 items-center gap-2 rounded-full bg-primary/10 px-4 text-sm font-semibold text-primary">
            Recent Designs
            <span className="text-[11px] font-bold">
              {visibleDesigns.length}
            </span>
          </span>
        </div>

        {/* DESIGN GRID */}
        {visibleDesigns.length>0?(
          <div
            className={`mt-7 grid gap-7 ${
              view==="grid"
                ?"grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                :"grid-cols-1"
            }`}
          >
            {visibleDesigns.map((design)=>(
              <TemplateCard
                key={design.id}
                design={design}
                onUpdate={updateDesign}
                onRename={renameDesign}
                onDuplicate={duplicateDesign}
                onDelete={deleteDesign}
              />
            ))}

            <TeamSpacesPromo/>
          </div>
        ):(
          <div className="mt-7 flex min-h-[220px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border-card)] bg-[var(--surface-card)] px-6 text-center">
            <Search className="h-9 w-9 text-primary"/>

            <h3 className="mt-3 font-semibold text-[var(--text-heading)]">
              No designs match "{query}"
            </h3>

            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Try another name, or clear the filter to see everything.
            </p>
          </div>
        )}

        {/* TRENDING */}
        <TrendingTemplates/>
      </div>
    </section>
  );
}
