import {useMemo,useRef,useState} from "react";
import {
  Clock3,
  FilePlus2,
  Grid2X2,
  Import,
  List,
  Plus,
  Search,
  X,
} from "lucide-react";
import {useNavigate} from "react-router";
import CanvasPickerModal from "../../Templates/CanvasPickerModal.jsx";
import {useCanvasPicker} from "../../Templates/useCanvasPicker.js";
import {loadPublishedTemplates} from "../../Editor/model/templatePublish.js";
import MyDesignCard from "./MyDesignsCard";
import {MY_DESIGNS} from "./myDesignsData";

const PAGE_SIZE=6;

const FILTERS=[
  {id:"all",label:"All"},
  {id:"recent",label:"Recent"},
  {id:"published",label:"Published"},
  {id:"draft",label:"Drafts"},
  {id:"private",label:"Private"},
];

export default function MyDesigns(){
  const navigate=useNavigate();
  const canvasPicker=useCanvasPicker();
  const fileInputRef=useRef(null);

  const [designs,setDesigns]=useState(MY_DESIGNS);
  const [pendingBackdrops]=useState(()=>loadPublishedTemplates().filter(
    (record)=>record?.visibility==="public"&&record.status==="pending"
  ));
  const [activeFilter,setActiveFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [sort,setSort]=useState("recent");
  const [viewMode,setViewMode]=useState("grid");
  const [page,setPage]=useState(1);
  const [renameTarget,setRenameTarget]=useState(null);
  const [renameValue,setRenameValue]=useState("");

  const counts=useMemo(()=>{
    const now=new Date();

    return{
      all:designs.length,
      recent:designs.filter((design)=>{
        const days=(now-new Date(design.updatedAt))/(1000*60*60*24);
        return days<=7;
      }).length,
      published:designs.filter(
        (design)=>design.status==="published"
      ).length,
      draft:designs.filter(
        (design)=>design.status==="draft"
      ).length,
      private:designs.filter(
        (design)=>design.visibility==="private"
      ).length,
    };
  },[designs]);

  const filteredDesigns=useMemo(()=>{
    let result=[...designs];

    if(activeFilter==="recent"){
      const now=new Date();

      result=result.filter((design)=>{
        const days=(now-new Date(design.updatedAt))/(1000*60*60*24);
        return days<=7;
      });
    }

    if(activeFilter==="published"){
      result=result.filter(
        (design)=>design.status==="published"
      );
    }

    if(activeFilter==="draft"){
      result=result.filter(
        (design)=>design.status==="draft"
      );
    }

    if(activeFilter==="private"){
      result=result.filter(
        (design)=>design.visibility==="private"
      );
    }

    if(search.trim()){
      const query=search.trim().toLowerCase();

      result=result.filter((design)=>
        design.title.toLowerCase().includes(query)||
        design.description.toLowerCase().includes(query)||
        design.tags.some((tag)=>
          tag.toLowerCase().includes(query)
        )
      );
    }

    if(sort==="recent"){
      result.sort(
        (a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)
      );
    }

    if(sort==="oldest"){
      result.sort(
        (a,b)=>new Date(a.updatedAt)-new Date(b.updatedAt)
      );
    }

    if(sort==="views"){
      result.sort(
        (a,b)=>b.views-a.views
      );
    }

    if(sort==="name"){
      result.sort(
        (a,b)=>a.title.localeCompare(b.title)
      );
    }

    return result;
  },[designs,activeFilter,search,sort]);

  const totalPages=Math.max(
    1,
    Math.ceil(filteredDesigns.length/PAGE_SIZE)
  );

  const visibleDesigns=filteredDesigns.slice(
    (page-1)*PAGE_SIZE,
    page*PAGE_SIZE
  );

  const changeFilter=(filter)=>{
    setActiveFilter(filter);
    setPage(1);
  };

  const editDesign=(design)=>{
    navigate(`/editor/${design.id}`);
  };

  const openRename=(design)=>{
    setRenameTarget(design);
    setRenameValue(design.title);
  };

  const saveRename=()=>{
    if(!renameTarget||!renameValue.trim())return;

    setDesigns((current)=>
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

  const duplicateDesign=(design)=>{
    setDesigns((current)=>[
      {
        ...design,
        id:`design-${Date.now()}`,
        title:`${design.title} Copy`,
        views:0,
        status:"draft",
        visibility:"private",
        updatedAt:new Date().toISOString(),
      },
      ...current,
    ]);

    setActiveFilter("all");
    setPage(1);
  };

  const deleteDesign=(design)=>{
    const confirmed=window.confirm(
      `Delete "${design.title}"?`
    );

    if(!confirmed)return;

    setDesigns((current)=>
      current.filter(
        (item)=>item.id!==design.id
      )
    );
  };

  const handleImport=(event)=>{
    const file=event.target.files?.[0];

    if(!file)return;

    const reader=new FileReader();

    reader.onload=()=>{
      setDesigns((current)=>[
        {
          id:`import-${Date.now()}`,
          title:file.name.replace(/\.[^/.]+$/,""),
          description:"Imported design",
          tags:["Imported","Design","Creative"],
          views:0,
          art:"portfolio",
          status:"draft",
          visibility:"private",
          updatedAt:new Date().toISOString(),
        },
        ...current,
      ]);

      setActiveFilter("all");
      setPage(1);
    };

    reader.readAsDataURL(file);
    event.target.value="";
  };

  return(
    <main className="min-h-screen px-3 pb-12 pt-4 text-[var(--text-body)] sm:px-5 md:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto w-full max-w-[1650px]">
        {/* HEADER */}
        <div className="flex flex-col gap-5 @3xl:flex-row @3xl:items-start @3xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-[var(--text-heading)] sm:text-4xl">
                My Designs
              </h1>

              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                {designs.length} items
              </span>
            </div>

            <p className="mt-2 max-w-[720px] text-base leading-7 text-[var(--text-muted)]">
              Manage your creative work, drafts, published designs, and private projects in one place.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3 lg:flex-nowrap">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".json,.png,.jpg,.jpeg"
              onChange={handleImport}
            />

            <button
              type="button"
              onClick={()=>fileInputRef.current?.click()}
              className="inline-flex h-11 shrink-0 whitespace-nowrap items-center justify-center gap-2 rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] px-5 text-base font-medium text-[var(--text-heading)] transition hover:border-primary/40 hover:bg-primary/5"
            >
              <Import className="h-[18px] w-[18px]"/>
              Import
            </button>

            <button
              type="button"
              onClick={canvasPicker.show}
              className="inline-flex h-11 shrink-0 whitespace-nowrap items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-medium text-[var(--text-on-brand)] shadow-[0_7px_18px_rgba(112,90,224,.18)] transition hover:-translate-y-0.5 hover:opacity-90"
            >
              <Plus className="h-[18px] w-[18px]"/>
              Create New
            </button>
          </div>
        </div>

        {pendingBackdrops.length>0&&(
          <section className="mt-7 rounded-[18px] border border-primary/25 bg-[var(--surface-card)] p-4 shadow-sm sm:p-5" aria-labelledby="pending-backdrops-title">
            <div className="flex items-center gap-2 text-primary">
              <Clock3 className="h-5 w-5" aria-hidden="true"/>
              <h2 id="pending-backdrops-title" className="text-lg font-semibold">Under review</h2>
            </div>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Your public backdrops will appear after admin approval.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {pendingBackdrops.map((backdrop)=>(
                <div key={backdrop.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-[var(--border-card)] p-2.5">
                  {backdrop.thumbnail
                    ? <img src={backdrop.thumbnail} alt="" className="h-14 w-20 shrink-0 rounded-lg bg-white object-cover"/>
                    : <div className="h-14 w-20 shrink-0 rounded-lg bg-primary/10" aria-hidden="true"/>}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--text-heading)]">{backdrop.title}</p>
                    <p className="mt-0.5 text-xs font-medium text-primary">In review</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FILTER BAR */}
        <section className="mt-7 rounded-[18px] border border-[var(--border-card)] bg-[var(--surface-card)] p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="contents">
              {/* SEARCH */}
              <div className="relative min-w-[200px] flex-1 @7xl:max-w-[300px]">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"/>

                <input
                  value={search}
                  onChange={(event)=>{
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search your designs..."
                  className="h-11 w-full rounded-xl border border-transparent bg-primary/5 pl-10 pr-4 text-base text-[var(--text-heading)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-primary/30"
                />
              </div>

              <div className="hidden h-7 w-px bg-[var(--border-default)] @7xl:block"/>

              {/* FILTERS */}
              <div className="order-last flex w-full max-w-full gap-1 overflow-x-auto @7xl:order-none @7xl:w-auto @7xl:flex-1">
                {FILTERS.map((filter)=>(
                  <button
                    key={filter.id}
                    type="button"
                    onClick={()=>changeFilter(filter.id)}
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
                      {counts[filter.id]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* SORT + VIEW */}
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="hidden text-sm text-[var(--text-muted)] sm:inline">
                  Sort:
                </span>

                <select
                  value={sort}
                  onChange={(event)=>{
                    setSort(event.target.value);
                    setPage(1);
                  }}
                  className="h-10 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] px-3 text-sm font-medium text-[var(--text-heading)] outline-none"
                >
                  <option value="recent">Last edited</option>
                  <option value="oldest">Oldest</option>
                  <option value="views">Most viewed</option>
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

        {/* RESULT + PAGINATION */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base text-[var(--text-muted)]">
            Showing{" "}
            <span className="font-medium text-[var(--text-heading)]">
              {visibleDesigns.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-[var(--text-heading)]">
              {filteredDesigns.length}
            </span>{" "}
            designs
          </p>

          {totalPages>1&&(
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                disabled={page===1}
                onClick={()=>setPage((current)=>Math.max(1,current-1))}
                className="h-10 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] px-4 text-sm font-medium text-[var(--text-body)] transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from(
                {length:totalPages},
                (_,index)=>index+1
              ).map((number)=>(
                <button
                  key={number}
                  type="button"
                  onClick={()=>setPage(number)}
                  className={`grid h-10 w-10 place-items-center rounded-xl text-sm font-medium transition ${
                    page===number
                      ?"bg-primary text-[var(--text-on-brand)]"
                      :"border border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--text-body)] hover:border-primary/30 hover:text-primary"
                  }`}
                >
                  {number}
                </button>
              ))}

              <button
                type="button"
                disabled={page===totalPages}
                onClick={()=>setPage((current)=>Math.min(totalPages,current+1))}
                className="h-10 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] px-4 text-sm font-medium text-[var(--text-body)] transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* DESIGNS */}
        {visibleDesigns.length>0?(
          <div
            className={
              viewMode==="grid"
                ?"mt-6 grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-5"
                :"mt-6 flex flex-col gap-4"
            }
          >
            {visibleDesigns.map((design)=>(
              <MyDesignCard
                key={design.id}
                design={design}
                viewMode={viewMode}
                onEdit={editDesign}
                onRename={openRename}
                onDuplicate={duplicateDesign}
                onDelete={deleteDesign}
              />
            ))}
          </div>
        ):(
          <div className="mt-8 flex min-h-[300px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border-card)] bg-[var(--surface-card)] px-6 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
              <FilePlus2 className="h-7 w-7 text-primary"/>
            </div>

            <h3 className="mt-4 text-xl font-semibold text-[var(--text-heading)]">
              No designs found
            </h3>

            <p className="mt-1 max-w-sm text-base leading-6 text-[var(--text-muted)]">
              Create a new design or change your filters.
            </p>

            <button
              type="button"
              onClick={canvasPicker.show}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-base font-medium text-[var(--text-on-brand)] transition hover:opacity-90"
            >
              <Plus className="h-4 w-4"/>
              Create New
            </button>
          </div>
        )}
      </div>

      {/* RENAME MODAL */}
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

            <p className="mt-2 text-base text-[var(--text-muted)]">
              Enter a new name for your design.
            </p>

            <input
              autoFocus
              value={renameValue}
              onChange={(event)=>setRenameValue(event.target.value)}
              onKeyDown={(event)=>{
                if(event.key==="Enter"){
                  saveRename();
                }
              }}
              className="mt-5 h-12 w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-base)] px-4 text-base text-[var(--text-heading)] outline-none transition focus:border-primary"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={()=>setRenameTarget(null)}
                className="h-11 rounded-xl border border-[var(--border-default)] px-5 text-base font-medium text-[var(--text-body)] transition hover:bg-primary/5"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveRename}
                className="h-11 rounded-xl bg-primary px-5 text-base font-medium text-[var(--text-on-brand)] transition hover:opacity-90"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
      <CanvasPickerModal open={canvasPicker.open} onClose={canvasPicker.close} onCreate={canvasPicker.create}/>
    </main>
  );
}
