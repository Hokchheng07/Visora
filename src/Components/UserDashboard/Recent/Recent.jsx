import {useMemo,useState} from "react";
import {Grid2X2,List,Search,SquarePlus} from "lucide-react";
import {Link} from "react-router";
import {PROFILE_TEMPLATES} from "../Profile/profileData";
import RecentDesignCard from "./RecentDesignCard";
import CosmicDust from "../../Effects/CosmicDust.jsx";

const FILTERS=[
  {id:"all",label:"All"},
  {id:"posted",label:"Posted"},
  {id:"draft",label:"Drafts"},
  {id:"public",label:"Public"},
  {id:"private",label:"Private"},
];

const SORT_OPTIONS=[
  {value:"edited",label:"Last edited"},
  {value:"name",label:"Name"},
  {value:"views",label:"Most viewed"},
];

export default function Recent(){
  const [designs,setDesigns]=useState(PROFILE_TEMPLATES);
  const [query,setQuery]=useState("");
  const [filter,setFilter]=useState("all");
  const [sort,setSort]=useState("edited");
  const [view,setView]=useState("grid");

  const counts=useMemo(()=>{
    return{
      all:designs.length,
      posted:designs.filter(
        (design)=>design.status==="posted"
      ).length,
      draft:designs.filter(
        (design)=>design.status==="draft"
      ).length,
      public:designs.filter(
        (design)=>design.visibility==="public"
      ).length,
      private:designs.filter(
        (design)=>design.visibility==="private"
      ).length,
    };
  },[designs]);

  const visibleDesigns=useMemo(()=>{
    const needle=query.trim().toLowerCase();

    let result=designs.filter((design)=>{
      if(filter==="posted"&&design.status!=="posted")return false;
      if(filter==="draft"&&design.status!=="draft")return false;
      if(filter==="public"&&design.visibility!=="public")return false;
      if(filter==="private"&&design.visibility!=="private")return false;

      if(!needle)return true;

      return(
        design.title.toLowerCase().includes(needle)||
        design.subtitle.toLowerCase().includes(needle)||
        design.tags.some((tag)=>
          tag.label.toLowerCase().includes(needle)
        )
      );
    });

    if(sort==="name"){
      result.sort(
        (a,b)=>a.title.localeCompare(b.title)
      );
    }

    if(sort==="views"){
      result.sort(
        (a,b)=>b.views-a.views
      );
    }

    if(sort==="edited"){
      result.sort(
        (a,b)=>
          new Date(b.updatedAt).getTime()-
          new Date(a.updatedAt).getTime()
      );
    }

    return result;
  },[designs,query,filter,sort]);

  const updateDesign=(updatedDesign)=>{
    setDesigns((current)=>
      current.map((design)=>{
        if(design.id!==updatedDesign.id)return design;

        const now=new Date().toISOString();

        if(updatedDesign.visibility==="private"){
          return{
            ...updatedDesign,
            status:"draft",
            publishedAt:null,
            updatedAt:now,
          };
        }

        const wasDraft=design.status==="draft";

        return{
          ...updatedDesign,
          status:"posted",
          publishedAt:wasDraft
            ?now
            :design.publishedAt||now,
          updatedAt:now,
        };
      })
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

    setFilter("all");
  };

  const deleteDesign=(id)=>{
    setDesigns((current)=>
      current.filter(
        (design)=>design.id!==id
      )
    );
  };

  return(
    <section className="relative min-h-screen px-3 pb-10 pt-4 text-[var(--text-body)] sm:px-5 md:px-6 lg:px-8 xl:px-10">
      <CosmicDust particleCount={120}/>

      <div className="relative z-[1] mx-auto w-full max-w-[1650px]">
        {/* HEADER */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-[var(--text-heading)] sm:text-4xl">
                Recent
              </h1>

              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                {designs.length} items
              </span>
            </div>

            <p className="mt-2 text-base text-[var(--text-muted)]">
              Continue working on your recently edited designs.
            </p>
          </div>

          <Link
            to="/editor"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-[var(--text-on-brand)] transition hover:opacity-90 sm:w-auto"
          >
            <SquarePlus className="h-4 w-4"/>
            New Canvas
          </Link>
        </div>

        {/* FILTER BAR */}
        <section className="mt-6 rounded-[18px] border border-[var(--border-card)] bg-[var(--surface-card)] p-2.5 shadow-sm sm:p-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            {/* LEFT */}
            <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:items-center">
              {/* SEARCH */}
              <div className="relative w-full md:max-w-[300px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"/>

                <input
                  value={query}
                  onChange={(event)=>setQuery(event.target.value)}
                  placeholder="Filter designs..."
                  className="h-10 w-full rounded-xl border border-transparent bg-primary/5 pl-10 pr-4 text-base text-[var(--text-heading)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-primary/30"
                />
              </div>

              <div className="hidden h-6 w-px bg-[var(--border-default)] md:block"/>

              {/* FILTERS */}
              <div className="flex max-w-full gap-1 overflow-x-auto">
                {FILTERS.map((item)=>(
                  <button
                    key={item.id}
                    type="button"
                    onClick={()=>setFilter(item.id)}
                    className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      filter===item.id
                        ?"bg-primary/15 text-primary"
                        :"text-[var(--text-body)] hover:bg-primary/5 hover:text-primary"
                    }`}
                  >
                    {item.label}
                    <span className="ml-1 text-xs">
                      {counts[item.id]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <div className="flex items-center gap-2">
                <span className="hidden text-sm text-[var(--text-muted)] sm:inline">
                  Sort:
                </span>

                <select
                  value={sort}
                  onChange={(event)=>setSort(event.target.value)}
                  className="h-10 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] px-3 text-sm font-semibold text-[var(--text-heading)] outline-none"
                >
                  {SORT_OPTIONS.map((option)=>(
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* VIEW */}
              <div className="flex rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-1">
                <button
                  type="button"
                  onClick={()=>setView("grid")}
                  aria-label="Grid view"
                  className={`grid h-8 w-8 place-items-center rounded-lg transition ${
                    view==="grid"
                      ?"bg-primary/15 text-primary"
                      :"text-[var(--text-muted)] hover:text-primary"
                  }`}
                >
                  <Grid2X2 className="h-4 w-4"/>
                </button>

                <button
                  type="button"
                  onClick={()=>setView("list")}
                  aria-label="List view"
                  className={`grid h-8 w-8 place-items-center rounded-lg transition ${
                    view==="list"
                      ?"bg-primary/15 text-primary"
                      :"text-[var(--text-muted)] hover:text-primary"
                  }`}
                >
                  <List className="h-4 w-4"/>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CARDS */}
        {visibleDesigns.length>0?(
          <div
            className={
              view==="grid"
                ?"mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                :"mt-6 flex flex-col gap-4"
            }
          >
            {visibleDesigns.map((design)=>(
              <RecentDesignCard
                key={design.id}
                design={design}
                viewMode={view}
                onUpdate={updateDesign}
                onRename={renameDesign}
                onDuplicate={duplicateDesign}
                onDelete={deleteDesign}
              />
            ))}
          </div>
        ):(
          <div className="mt-8 flex min-h-[300px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border-card)] bg-[var(--surface-card)] px-6 text-center">
            <Search className="h-10 w-10 text-primary"/>

            <h2 className="mt-4 text-xl font-semibold text-[var(--text-heading)]">
              No designs found
            </h2>

            <p className="mt-1 max-w-sm text-base text-[var(--text-muted)]">
              Try changing your search or filter.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}