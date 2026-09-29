import { useMemo,useState } from "react";
import { Grid2X2,Heart,List,Search } from "lucide-react";
import { Link,useNavigate } from "react-router";
import FavoriteCard from "./FavoritesCard";
import FavoritesEmptyState from "./FavoritesEmptyState";
import { useFavorites } from "../../Account/useFavorites";
import { useGetTemplatesQuery } from "../../API/templateApi";
import { useGetBackdropsQuery,useDuplicateBackdropMutation } from "../../API/backdropApi";
import { useGetCategoriesQuery } from "../../API/categoryApi";
import { getStorageUrl } from "../../API/storageApi";
import { listRequestFailed } from "../../API/apiError.js";
import { templateCategoryNames,templateCategoryUuids } from "../../Templates/templateCategories.js";
import VisoraLoader from "../../ui/VisoraLoader";
import VisoraSelect from "../../ui/VisoraSelect";

const CATEGORIES=["All","Templates","My designs"];

function toFavoriteDesign(favorite,target,categoryNames){
  const isTemplate=favorite.type==="TEMPLATE";
  const pages=target?.pageCount||1;
  const currentNames=target&&isTemplate?templateCategoryUuids(target).map((uuid)=>categoryNames.get(uuid)).filter(Boolean):[];
  const categories=target&&isTemplate?(currentNames.length?currentNames:templateCategoryNames(target)):[];
  return{
    id:favorite.uuid,
    type:favorite.type,
    targetUuid:favorite.targetUuid,
    available:!!target,
    title:target?(target.proposedName||target.name||"Untitled"):"Unavailable design",
    description:!target
      ?"This design was removed or is no longer shared"
      :isTemplate
        ?"Template"
        :`${pages} page${pages===1?"":"s"} · ${target.orientation==="PORTRAIT"?"portrait":"landscape"}`,
    category:isTemplate?"Templates":"My designs",
    tags:[...categories,...(target?.hasTimer?["Timer"]:[])],
    image:target?.thumbnail?getStorageUrl(target.thumbnail):null,
    art:"portfolio",
    updatedAt:favorite.createdAt,
  };
}

export default function Favorites(){
  const navigate=useNavigate();
  const {favorites:savedFavorites,removeFavoriteByUuid,isSignedIn,isLoading,error,refetch}=useFavorites();
  const {data:templatePage}=useGetTemplatesQuery({pageSize:100},{skip:!isSignedIn});
  const {data:backdropPage}=useGetBackdropsQuery({pageSize:100},{skip:!isSignedIn});
  const {data:categoryPage}=useGetCategoriesQuery(undefined,{skip:!isSignedIn});
  const [duplicateBackdrop]=useDuplicateBackdropMutation();
  const [search,setSearch]=useState("");
  const [category,setCategory]=useState("All");
  const [sort,setSort]=useState("recent");
  const [viewMode,setViewMode]=useState("grid");

  const favorites=useMemo(()=>{
    const templates=new Map((templatePage?.data?.contents||[]).map((template)=>[template.uuid,template]));
    const backdrops=new Map((backdropPage?.data?.contents||[]).map((backdrop)=>[backdrop.uuid,backdrop]));
    const categoryNames=new Map((categoryPage?.data?.contents||[]).map((item)=>[item.uuid,item.name]));
    return savedFavorites.map((favorite)=>toFavoriteDesign(
      favorite,
      favorite.type==="TEMPLATE"?templates.get(favorite.targetUuid):backdrops.get(favorite.targetUuid),
      categoryNames,
    ));
  },[savedFavorites,templatePage,backdropPage,categoryPage]);

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

    if(sort==="name"){
      result.sort((a,b)=>a.title.localeCompare(b.title));
    }

    return result;
  },[favorites,search,category,sort]);

  const openDesign=(design)=>{
    navigate(design.type==="TEMPLATE"?`/editor?template=${design.targetUuid}`:`/editor?backdrop=${design.targetUuid}`);
  };

  const duplicateDesign=(design)=>{
    duplicateBackdrop({backdropUuid:design.targetUuid,duplicateBackdropRequest:{name:`${design.title} Copy`}})
      .unwrap().catch(()=>window.alert("Couldn't duplicate this design. Please try again."));
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
                    <span className="ml-1 text-xs">
                      {item==="All"?favorites.length:favorites.filter((design)=>design.category===item).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="hidden text-sm text-[var(--text-muted)] sm:inline">
                  Sort:
                </span>

                <VisoraSelect
                  label="Sort favourites"
                  value={sort}
                  onChange={setSort}
                  options={[
                    {value:"recent",label:"Recently added"},
                    {value:"name",label:"Name"},
                  ]}
                  className="min-w-[144px]"
                />
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

        {!isSignedIn?(
          <FavoritesEmpty title="Sign in to see your favorites" text="Tap the heart on any template or design to keep it here.">
            <Link to="/auth/login" className="mt-5 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-base font-medium text-[var(--text-on-brand)] transition hover:opacity-90">Sign in</Link>
          </FavoritesEmpty>
        ):isLoading?(
          <VisoraLoader className="mt-10" label="Gathering your favorites…"/>
        ):listRequestFailed(error)?(
          <FavoritesEmpty title="Couldn't load your favorites" text="Check your connection, then try again.">
            <button type="button" onClick={()=>refetch()} className="mt-5 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-base font-medium text-[var(--text-on-brand)] transition hover:opacity-90">Try again</button>
          </FavoritesEmpty>
        ):favorites.length===0?(
          <FavoritesEmptyState />
        ):visibleFavorites.length>0?(
          <div
            className={
              viewMode==="grid"
                ?"mt-6 grid grid-cols-1 gap-5 @2xl:grid-cols-2 @5xl:grid-cols-3 @5xl:gap-7"
                :"mt-6 flex flex-col gap-4"
            }
          >
            {visibleFavorites.map((design,index)=>(
              <FavoriteCard
                key={design.id}
                index={index}
                design={design}
                viewMode={viewMode}
                onOpen={openDesign}
                onDuplicate={design.type==="BACKDROP"?duplicateDesign:undefined}
                onRemoveFavorite={removeFavoriteByUuid}
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

    </main>
  );
}

function FavoritesEmpty({title,text,children}){
  return(
    <div className="mt-8 flex min-h-[300px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border-card)] bg-[var(--surface-card)] px-6 text-center">
      <Heart className="h-10 w-10 text-primary"/>
      <h2 className="mt-4 text-xl font-semibold text-[var(--text-heading)]">{title}</h2>
      <p className="mt-1 max-w-sm text-base text-[var(--text-muted)]">{text}</p>
      {children}
    </div>
  );
}
