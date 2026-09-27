import {useMemo,useState} from "react";
import {Grid2X2,List,Search,SquarePlus} from "lucide-react";
import {Link,useNavigate} from "react-router";
import CanvasPickerModal from "../../Templates/CanvasPickerModal.jsx";
import {useCanvasPicker} from "../../Templates/useCanvasPicker.js";
import RecentDesignCard from "./RecentDesignCard";
import CosmicDust from "../../Effects/CosmicDust.jsx";
import {useFavorites} from "../../Account/useFavorites";
import {useMyDesigns} from "../useMyDesigns";
import VisoraLoader from "../../ui/VisoraLoader";

/*
 * Recent: the signed-in account's own backdrops (GET /backdrops), most
 * recently opened first. The server stamps lastOpenedAt whenever a backdrop
 * is opened (GET /backdrops/{uuid}, which the editor does), so "recent" is
 * that time; a backdrop never opened falls back to when it was last saved,
 * then created. Sorting happens here, so it does not depend on the format of
 * the list's `sort` parameter.
 */
const FILTERS=[
  {id:"all",label:"All"},
  {id:"landscape",label:"Landscape"},
  {id:"portrait",label:"Portrait"},
  {id:"timer",label:"With timer"},
];

const SORT_OPTIONS=[
  {value:"opened",label:"Recently opened"},
  {value:"saved",label:"Last saved"},
  {value:"name",label:"Name"},
];

const time=(value)=>{
  const ms=new Date(value||0).getTime();
  return Number.isFinite(ms)?ms:0;
};

export default function Recent(){
  const navigate=useNavigate();
  const canvasPicker=useCanvasPicker();
  const [query,setQuery]=useState("");
  const [filter,setFilter]=useState("all");
  const [sort,setSort]=useState("opened");
  const [view,setView]=useState("grid");

  const {designs,isSignedIn,isLoading,failed,refetch,moveToTrash,rename,duplicate}=useMyDesigns();

  const counts=useMemo(()=>({
    all:designs.length,
    landscape:designs.filter((design)=>design.orientation==="Landscape").length,
    portrait:designs.filter((design)=>design.orientation==="Portrait").length,
    timer:designs.filter((design)=>design.hasTimer).length,
  }),[designs]);

  const visibleDesigns=useMemo(()=>{
    const needle=query.trim().toLowerCase();
    const result=designs.filter((design)=>{
      if(filter==="landscape"&&design.orientation!=="Landscape")return false;
      if(filter==="portrait"&&design.orientation!=="Portrait")return false;
      if(filter==="timer"&&!design.hasTimer)return false;
      return !needle||design.title.toLowerCase().includes(needle);
    });
    if(sort==="name")return result.sort((a,b)=>a.title.localeCompare(b.title));
    if(sort==="saved")return result.sort((a,b)=>time(b.savedAt)-time(a.savedAt));
    return result.sort((a,b)=>time(b.openedAt)-time(a.openedAt));
  },[designs,query,filter,sort]);

  const {isFavorite,toggleFavorite}=useFavorites();
  const openDesign=(design)=>navigate(`/editor?backdrop=${design.remoteId}`);
  const renameDesign=(id,title)=>{
    const design=designs.find((item)=>item.id===id);
    if(design)rename(design,title);
  };
  const duplicateDesign=(design,title)=>{
    duplicate(design,title);
    setFilter("all");
  };
  // Delete is a soft delete: the design goes to Trash, where it can be restored.
  const deleteDesign=(id)=>{
    const design=designs.find((item)=>item.id===id);
    if(design)moveToTrash(design);
  };

  return(
    <section className="relative min-h-screen px-3 pb-10 pt-4 text-[var(--text-body)] sm:px-5 md:px-6 lg:px-8 xl:px-10">
      <CosmicDust particleCount={120}/>

      <div className="relative z-[1] mx-auto w-full max-w-[1650px]">
        {/* HEADER */}
        <div className="flex flex-col gap-5 @3xl:flex-row @3xl:items-start @3xl:justify-between">
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

          <button
            type="button"
            onClick={canvasPicker.show}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-[var(--text-on-brand)] transition hover:opacity-90 sm:w-auto"
          >
            <SquarePlus className="h-4 w-4"/>
            New Canvas
          </button>
        </div>

        {/* FILTER BAR */}
        <section className="mt-6 rounded-[18px] border border-[var(--border-card)] bg-[var(--surface-card)] p-2.5 shadow-sm sm:p-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* LEFT */}
            <div className="contents">
              {/* SEARCH */}
              <div className="relative min-w-[200px] flex-1 @7xl:max-w-[300px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"/>

                <input
                  value={query}
                  onChange={(event)=>setQuery(event.target.value)}
                  placeholder="Filter designs..."
                  className="h-10 w-full rounded-xl border border-transparent bg-primary/5 pl-10 pr-4 text-base text-[var(--text-heading)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-primary/30"
                />
              </div>

              <div className="hidden h-6 w-px bg-[var(--border-default)] @7xl:block"/>

              {/* FILTERS */}
              <div className="order-last flex w-full max-w-full gap-1 overflow-x-auto @7xl:order-none @7xl:w-auto @7xl:flex-1">
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
            <div className="ml-auto flex items-center gap-2">
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
        {!isSignedIn?(
          <EmptyState title="Sign in to see your recent designs" text="Designs you open or save appear here, newest first.">
            <Link to="/auth/login" className="mt-5 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-base font-medium text-[var(--text-on-brand)] transition hover:opacity-90">Sign in</Link>
          </EmptyState>
        ):isLoading?(
          <VisoraLoader className="mt-10" label="Finding your recent designs…"/>
        ):failed?(
          <EmptyState title="Couldn't load your designs" text="Check your connection, then try again.">
            <button type="button" onClick={()=>refetch()} className="mt-5 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-base font-medium text-[var(--text-on-brand)] transition hover:opacity-90">Try again</button>
          </EmptyState>
        ):designs.length===0?(
          <EmptyState title="No designs yet" text="Start a new canvas — it will show up here once it is saved.">
            <button type="button" onClick={canvasPicker.show} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-base font-medium text-[var(--text-on-brand)] transition hover:opacity-90"><SquarePlus className="h-4 w-4"/>New Canvas</button>
          </EmptyState>
        ):visibleDesigns.length>0?(
          <div
            className={
              view==="grid"
                ?"mt-6 grid grid-cols-1 gap-5 @2xl:grid-cols-2 @5xl:grid-cols-3 @5xl:gap-7"
                :"mt-6 flex flex-col gap-4"
            }
          >
            {visibleDesigns.map((design,index)=>(
              <RecentDesignCard
                key={design.id}
                index={index}
                design={design}
                viewMode={view}
                onOpen={openDesign}
                favorite={isFavorite(design.remoteId)}
                onFavorite={(item)=>toggleFavorite("BACKDROP",item.remoteId)}
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
      <CanvasPickerModal open={canvasPicker.open} onClose={canvasPicker.close} onCreate={canvasPicker.create}/>
    </section>
  );
}

function EmptyState({title,text,children}){
  return(
    <div className="mt-8 flex min-h-[300px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border-card)] bg-[var(--surface-card)] px-6 text-center">
      <Search className="h-10 w-10 text-primary"/>
      <h2 className="mt-4 text-xl font-semibold text-[var(--text-heading)]">{title}</h2>
      <p className="mt-1 max-w-sm text-base text-[var(--text-muted)]">{text}</p>
      {children}
    </div>
  );
}
