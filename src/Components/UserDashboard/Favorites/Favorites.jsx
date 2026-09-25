import { useMemo,useState } from "react";
import { Grid2X2,Heart,List,Search,X } from "lucide-react";
import { useNavigate } from "react-router";
import FavoriteCard from "./FavoritesCard";
import { FAVORITE_DESIGNS } from "./FavoritesData";


const CATEGORIES=["All","Presentation","Social","Brand Kit"];

export default function Favorites(){
  const navigate=useNavigate();
  const [favorites,setFavorites]=useState(FAVORITE_DESIGNS);
  const [search,setSearch]=useState("");
  const [category,setCategory]=useState("All");
  const [sort,setSort]=useState("recent");
  const [viewMode,setViewMode]=useState("grid");
  const [renameTarget,setRenameTarget]=useState(null);
  const [renameValue,setRenameValue]=useState("");

  const visibleFavorites=useMemo(()=>{
    let result=[...favorites];

    if(search.trim()){
      const query=search.toLowerCase();

      result=result.filter((design)=>
        design.title.toLowerCase().includes(query)||
        design.description.toLowerCase().includes(query)||
        design.tags.some((tag)=>tag.toLowerCase().includes(query))
      );
    }

    if(category!=="All"){
      result=result.filter((design)=>design.category===category);
    }

    if(sort==="recent"){
      result.sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt));
    }

    if(sort==="views"){
      result.sort((a,b)=>b.views-a.views);
    }

    if(sort==="name"){
      result.sort((a,b)=>a.title.localeCompare(b.title));
    }

    return result;
  },[favorites,search,category,sort]);

  const removeFavorite=(id)=>{
    setFavorites((current)=>current.filter((design)=>design.id!==id));
  };

  const duplicateDesign=(design)=>{
    const now=new Date().toISOString();

    setFavorites((current)=>[
      {
        ...design,
        id:`favorite-${Date.now()}`,
        title:`${design.title} Copy`,
        views:0,
        updatedAt:now,
      },
      ...current,
    ]);
  };

  const moveToTrash=(design)=>{
    const confirmed=window.confirm(
      `Move "${design.title}" to Trash?`
    );

    if(!confirmed)return;

    const existingTrash=JSON.parse(
      localStorage.getItem("visora-trash")||"[]"
    );

    localStorage.setItem(
      "visora-trash",
      JSON.stringify([
        {
          ...design,
          trashedAt:new Date().toISOString(),
        },
        ...existingTrash,
      ])
    );

    removeFavorite(design.id);
  };

  const openRename=(design)=>{
    setRenameTarget(design);
    setRenameValue(design.title);
  };

  const saveRename=()=>{
    if(!renameValue.trim()||!renameTarget)return;

    setFavorites((current)=>
      current.map((design)=>
        design.id===renameTarget.id
          ?{
              ...design,
              title:renameValue.trim(),
              updatedAt:new Date().toISOString(),
            }
          :design
      )
    );

    setRenameTarget(null);
    setRenameValue("");
  };

  return(
    <main className="min-h-screen px-3 pb-10 pt-4 text-[var(--text-body)] sm:px-5 md:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto w-full max-w-[1650px]">
        <div className="flex flex-col gap-5 @3xl:flex-row @3xl:items-start @3xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
            

              <h1 className="text-3xl font-bold text-[var(--text-heading)] sm:text-4xl">
                Favorites
              </h1>

              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                {favorites.length} items
              </span>
            </div>

            <p className="mt-2 text-base text-[var(--text-muted)]">
              Quickly access the designs you love. Organized by recent activity and team tags.
            </p>
          </div>

        </div>

        <section className="mt-6 rounded-[18px] border border-[var(--border-card)] bg-[var(--surface-card)] p-2.5 shadow-sm sm:p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="contents">
              <div className="relative min-w-[200px] flex-1 @7xl:max-w-[300px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"/>

                <input
                  value={search}
                  onChange={(event)=>setSearch(event.target.value)}
                  placeholder="Filter favorites..."
                  className="h-10 w-full rounded-xl border border-transparent bg-primary/5 pl-10 pr-4 text-base text-[var(--text-heading)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-primary/30"
                />
              </div>

              <div className="hidden h-6 w-px bg-[var(--border-default)] @7xl:block"/>

              <div className="order-last flex w-full max-w-full gap-1 overflow-x-auto @7xl:order-none @7xl:w-auto @7xl:flex-1">
                {CATEGORIES.map((item)=>(
                  <button
                    key={item}
                    type="button"
                    onClick={()=>setCategory(item)}
                    className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      category===item
                        ?"bg-primary/15 text-primary"
                        :"text-[var(--text-body)] hover:bg-primary/5 hover:text-primary"
                    }`}
                  >
                    {item}
                    {item==="All"&&`(${favorites.length})`}
                  </button>
                ))}
              </div>
            </div>

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
                  <option value="recent">Last edited</option>
                  <option value="views">Most viewed</option>
                  <option value="name">Name</option>
                </select>
              </div>

              <div className="flex rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-1">
                <button
                  type="button"
                  onClick={()=>setViewMode("grid")}
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

        {visibleFavorites.length>0?(
          <div
            className={
              viewMode==="grid"
                ?"mt-6 grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-5"
                :"mt-6 flex flex-col gap-4"
            }
          >
            {visibleFavorites.map((design)=>(
              <FavoriteCard
                key={design.id}
                design={design}
                viewMode={viewMode}
                onOpen={(item)=>navigate(`/editor/${item.id}`)}
                onRename={openRename}
                onDuplicate={duplicateDesign}
                onRemoveFavorite={removeFavorite}
                onTrash={moveToTrash}
              />
            ))}
          </div>
        ):(
          <div className="mt-8 flex min-h-[300px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border-card)] bg-[var(--surface-card)] px-6 text-center">
            <Heart className="h-10 w-10 text-primary"/>

            <h2 className="mt-4 text-xl font-semibold text-[var(--text-heading)]">
              No favorites found
            </h2>

            <p className="mt-1 max-w-sm text-base text-[var(--text-muted)]">
              Try changing your search or filter.
            </p>
          </div>
        )}
      </div>

      {renameTarget&&(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-[24px] border border-[var(--border-card)] bg-[var(--surface-card)] p-6 shadow-[0_25px_80px_rgba(0,0,0,.28)]">
            <button
              type="button"
              onClick={()=>setRenameTarget(null)}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-[var(--text-muted)] transition hover:bg-primary/10 hover:text-primary"
            >
              <X className="h-4 w-4"/>
            </button>

            <h2 className="text-2xl font-semibold text-[var(--text-heading)]">
              Rename Design
            </h2>

            <p className="mt-1 text-base text-[var(--text-muted)]">
              Enter a new name for this design.
            </p>

            <input
              autoFocus
              value={renameValue}
              onChange={(event)=>setRenameValue(event.target.value)}
              onKeyDown={(event)=>{
                if(event.key==="Enter")saveRename();
              }}
              className="mt-5 h-11 w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-base)] px-4 text-base text-[var(--text-heading)] outline-none transition focus:border-primary"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={()=>setRenameTarget(null)}
                className="h-11 rounded-xl border border-[var(--border-default)] px-5 text-base font-semibold text-[var(--text-body)]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveRename}
                className="h-11 rounded-xl bg-primary px-5 text-base font-semibold text-white"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
