import {useEffect,useMemo,useState} from "react";
import {
  Grid2X2,
  Info,
  List,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import TrashCard from "./TrashCard";
import {
  INITIAL_TRASH,
  TRASH_FILTERS,
  getRemainingDays,
} from "./trashData";

export default function Trash(){
  const [trash,setTrash]=useState(()=>{
    try{
      const stored=JSON.parse(
        localStorage.getItem("visora-trash")||"[]"
      );

      if(stored.length===0)return INITIAL_TRASH;

      return stored.map((item)=>({
        ...item,
        deletedAt:
          item.deletedAt||
          item.trashedAt||
          new Date().toISOString(),
        deletedBy:item.deletedBy||"Chit Chimy",
        category:item.category||"Graphics & Posters",
        format:item.format||"Design",
        tags:item.tags||["Design"],
      }));
    }catch{
      return INITIAL_TRASH;
    }
  });

  const [activeFilter,setActiveFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [sort,setSort]=useState("remaining");
  const [viewMode,setViewMode]=useState("grid");

  useEffect(()=>{
    localStorage.setItem(
      "visora-trash",
      JSON.stringify(trash)
    );
  },[trash]);

  const counts=useMemo(()=>{
    return{
      all:trash.length,
      "Landing Pages":trash.filter(
        (item)=>item.category==="Landing Pages"
      ).length,
      "Graphics & Posters":trash.filter(
        (item)=>item.category==="Graphics & Posters"
      ).length,
      "Brand Assets":trash.filter(
        (item)=>item.category==="Brand Assets"
      ).length,
    };
  },[trash]);

  const visibleTrash=useMemo(()=>{
    let result=[...trash];

    if(activeFilter!=="all"){
      result=result.filter(
        (item)=>item.category===activeFilter
      );
    }

    if(search.trim()){
      const query=search.trim().toLowerCase();

      result=result.filter((item)=>
        item.title.toLowerCase().includes(query)||
        item.description?.toLowerCase().includes(query)||
        item.tags?.some((tag)=>
          tag.toLowerCase().includes(query)
        )
      );
    }

    if(sort==="remaining"){
      result.sort(
        (a,b)=>
          getRemainingDays(a.deletedAt)-
          getRemainingDays(b.deletedAt)
      );
    }

    if(sort==="recent"){
      result.sort(
        (a,b)=>new Date(b.deletedAt)-new Date(a.deletedAt)
      );
    }

    if(sort==="oldest"){
      result.sort(
        (a,b)=>new Date(a.deletedAt)-new Date(b.deletedAt)
      );
    }

    if(sort==="name"){
      result.sort(
        (a,b)=>a.title.localeCompare(b.title)
      );
    }

    return result;
  },[trash,activeFilter,search,sort]);

  const restoreDesign=(design)=>{
    const restored=JSON.parse(
      localStorage.getItem("visora-restored-designs")||"[]"
    );

    localStorage.setItem(
      "visora-restored-designs",
      JSON.stringify([
        {
          ...design,
          restoredAt:new Date().toISOString(),
        },
        ...restored,
      ])
    );

    setTrash((current)=>
      current.filter((item)=>item.id!==design.id)
    );
  };

  const restoreAll=()=>{
    if(trash.length===0)return;

    const confirmed=window.confirm(
      `Restore all ${trash.length} items?`
    );

    if(!confirmed)return;

    const restored=JSON.parse(
      localStorage.getItem("visora-restored-designs")||"[]"
    );

    localStorage.setItem(
      "visora-restored-designs",
      JSON.stringify([
        ...trash.map((item)=>({
          ...item,
          restoredAt:new Date().toISOString(),
        })),
        ...restored,
      ])
    );

    setTrash([]);
  };

  const deleteForever=(design)=>{
    const confirmed=window.confirm(
      `Permanently delete "${design.title}"? This cannot be undone.`
    );

    if(!confirmed)return;

    setTrash((current)=>
      current.filter((item)=>item.id!==design.id)
    );
  };

  const emptyTrash=()=>{
    if(trash.length===0)return;

    const confirmed=window.confirm(
      `Permanently delete all ${trash.length} items? This cannot be undone.`
    );

    if(!confirmed)return;

    setTrash([]);
  };

  return(
    <main className="min-h-screen px-3 pb-12 pt-4 text-[var(--text-body)] sm:px-5 md:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto w-full max-w-[1650px]">
        {/* HEADER */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-[var(--text-heading)] sm:text-4xl">
                Trash
              </h1>

              <span className="rounded-full bg-red-500/10 px-3 py-1 text-sm font-medium text-red-500">
                {trash.length} items
              </span>
            </div>

            <p className="mt-2 max-w-[720px] text-base leading-7 text-[var(--text-muted)]">
              Recover deleted designs or permanently remove items you no longer need.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={trash.length===0}
              onClick={restoreAll}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] px-5 text-base font-medium text-primary transition hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="h-[18px] w-[18px]"/>
              Restore All
            </button>

            <button
              type="button"
              disabled={trash.length===0}
              onClick={emptyTrash}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-300 bg-[var(--surface-card)] px-5 text-base font-medium text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-500/30"
            >
              <Trash2 className="h-[18px] w-[18px]"/>
              Empty Trash
            </button>
          </div>
        </div>

        {/* RETENTION NOTICE */}
        <div className="mt-7 rounded-[18px] border border-primary/15 bg-primary/[0.06] px-4 py-4 sm:px-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Info className="h-5 w-5"/>
            </div>

            <div className="min-w-0">
              <p className="text-base font-medium text-[var(--text-heading)]">
                Items stay in Trash for 30 days
              </p>

              <p className="mt-1 text-sm leading-6 text-[var(--text-muted)] sm:text-base">
                After 30 days, deleted designs are automatically removed permanently.
              </p>
            </div>
          </div>
        </div>

        {/* FILTER BAR */}
        <section className="mt-6 rounded-[18px] border border-[var(--border-card)] bg-[var(--surface-card)] p-3 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:items-center">
              {/* SEARCH */}
              <div className="relative w-full md:max-w-[300px]">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"/>

                <input
                  value={search}
                  onChange={(event)=>setSearch(event.target.value)}
                  placeholder="Search deleted designs..."
                  className="h-11 w-full rounded-xl border border-transparent bg-primary/5 pl-10 pr-4 text-base text-[var(--text-heading)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-primary/30"
                />
              </div>

              <div className="hidden h-7 w-px bg-[var(--border-default)] md:block"/>

              {/* FILTERS */}
              <div className="flex max-w-full gap-1 overflow-x-auto">
                {TRASH_FILTERS.map((filter)=>(
                  <button
                    key={filter.id}
                    type="button"
                    onClick={()=>setActiveFilter(filter.id)}
                    className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3.5 text-sm font-medium transition ${
                      activeFilter===filter.id
                        ?"bg-primary/15 text-primary"
                        :"text-[var(--text-body)] hover:bg-primary/5 hover:text-primary"
                    }`}
                  >
                    {filter.label}

                    <span
                      className={`rounded-full px-1.5 py-0.5 text-xs ${
                        activeFilter===filter.id
                          ?"bg-primary/15 text-primary"
                          :"bg-[var(--surface-warm)] text-[var(--text-muted)]"
                      }`}
                    >
                      {counts[filter.id]??0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* SORT + VIEW */}
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <div className="flex items-center gap-2">
                <span className="hidden text-sm text-[var(--text-muted)] sm:inline">
                  Sort:
                </span>

                <select
                  value={sort}
                  onChange={(event)=>setSort(event.target.value)}
                  className="h-10 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] px-3 text-sm font-medium text-[var(--text-heading)] outline-none"
                >
                  <option value="remaining">Expiring soon</option>
                  <option value="recent">Recently deleted</option>
                  <option value="oldest">Oldest deleted</option>
                  <option value="name">Name</option>
                </select>
              </div>

              <div className="flex rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-1">
                <button
                  type="button"
                  onClick={()=>setViewMode("grid")}
                  aria-label="Grid view"
                  className={`grid h-8 w-8 place-items-center rounded-lg transition ${
                    viewMode==="grid"
                      ?"bg-primary/15 text-primary"
                      :"text-[var(--text-muted)] hover:text-primary"
                  }`}
                >
                  <Grid2X2 className="h-4 w-4"/>
                </button>

                <button
                  type="button"
                  onClick={()=>setViewMode("list")}
                  aria-label="List view"
                  className={`grid h-8 w-8 place-items-center rounded-lg transition ${
                    viewMode==="list"
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

        {/* RESULTS */}
        <div className="mt-5">
          <p className="text-base text-[var(--text-muted)]">
            Showing{" "}
            <span className="font-medium text-[var(--text-heading)]">
              {visibleTrash.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-[var(--text-heading)]">
              {trash.length}
            </span>{" "}
            deleted designs
          </p>
        </div>

        {/* CARDS */}
        {visibleTrash.length>0?(
          <div
            className={
              viewMode==="grid"
                ?"mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                :"mt-6 flex flex-col gap-4"
            }
          >
            {visibleTrash.map((design)=>(
              <TrashCard
                key={design.id}
                design={design}
                viewMode={viewMode}
                onRestore={restoreDesign}
                onDelete={deleteForever}
              />
            ))}
          </div>
        ):(
          <div className="mt-8 flex min-h-[300px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border-card)] bg-[var(--surface-card)] px-6 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
              <Trash2 className="h-7 w-7 text-primary"/>
            </div>

            <h2 className="mt-4 text-xl font-semibold text-[var(--text-heading)]">
              Trash is empty
            </h2>

            <p className="mt-1 max-w-sm text-base leading-6 text-[var(--text-muted)]">
              Deleted designs will appear here before they are permanently removed.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}