import { useState } from "react";
import { Clock3,Copy,Edit3,FolderOpen,Heart,MoreVertical,Trash2 } from "lucide-react";
import { DesignArt } from "../Profile/DesignArt";
import VisoraCard from "../../Cards/VisoraCard.jsx";
import { FAVORITE_TAG_COLORS,formatFavoriteTime } from "./FavoritesData";

export default function FavoriteCard({
  design,
  viewMode,
  onOpen,
  onRename,
  onDuplicate,
  onRemoveFavorite,
  onTrash,
  index=0,
}){
  const [menuOpen,setMenuOpen]=useState(false);
  const preview=design.image
    ?<img src={design.image} alt="" className="h-full w-full object-cover" loading="lazy" draggable={false}/>
    :<DesignArt kind={design.art}/>;
  const added=`Added ${formatFavoriteTime(design.updatedAt).replace(/^J/,"j").replace(/^Y/,"y")}`;

  if(viewMode==="list"){
    return(
      <article className="relative flex min-w-0 flex-col gap-4 rounded-[18px] border border-[var(--border-card)] bg-[var(--surface-card)] p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative w-full shrink-0 overflow-hidden rounded-[13px] border-[7px] border-accent/80 sm:w-[210px]">
          <div className="aspect-[16/9] overflow-hidden rounded-[7px] bg-white">
            {preview}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-[var(--text-heading)]">
                {design.title}
              </h3>
              <p className="mt-1 text-base text-[var(--text-muted)]">
                {design.description}
              </p>
            </div>

            <CardMenu
              design={design}
              onOpen={onOpen}
              onRename={onRename}
              onDuplicate={onDuplicate}
              onRemoveFavorite={onRemoveFavorite}
              onTrash={onTrash}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {design.tags.map((tag,index)=>(
              <span
                key={tag}
                className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${FAVORITE_TAG_COLORS[index%FAVORITE_TAG_COLORS.length]}`}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5"/>
              {added}
            </span>
          </div>
        </div>

      </article>
    );
  }

  return(
    <VisoraCard
      index={index}
      preview={design.image||preview}
      title={design.title}
      description={`${design.description} · ${added}`}
      tags={design.tags}
      favorite={{active:true,onToggle:()=>onRemoveFavorite(design.id)}}
      menu={[
        ...(design.available===false?[]:[{label:"Open",icon:FolderOpen,onSelect:()=>onOpen(design)}]),
        ...(onRename?[{label:"Rename",icon:Edit3,onSelect:()=>onRename(design)}]:[]),
        ...(onDuplicate&&design.available!==false?[{label:"Duplicate",icon:Copy,onSelect:()=>onDuplicate(design)}]:[]),
        {label:"Remove from Favorites",icon:Heart,onSelect:()=>onRemoveFavorite(design.id)},
        ...(onTrash?[{label:"Move to Trash",icon:Trash2,onSelect:()=>onTrash(design),danger:true}]:[]),
      ]}
      onOpen={()=>onOpen(design)}
    />
  );
}

function CardMenu({
  design,
  onOpen,
  onRename,
  onDuplicate,
  onRemoveFavorite,
  onTrash,
  menuOpen,
  setMenuOpen,
}){
  const run=(action)=>{
    setMenuOpen(false);
    action();
  };

  return(
    <div className="relative z-40 shrink-0">
      <button
        type="button"
        onClick={()=>setMenuOpen((current)=>!current)}
        className="grid h-8 w-8 place-items-center rounded-full text-[var(--text-muted)] transition hover:bg-primary/10 hover:text-primary"
      >
        <MoreVertical className="h-[18px] w-[18px]"/>
      </button>

      {menuOpen&&(
        <div className="absolute right-0 top-9 z-[100] w-[240px] rounded-[14px] border border-[var(--border-default)] bg-[var(--surface-card)] p-1.5 shadow-[0_18px_50px_rgba(0,0,0,.18)]">
          <MenuButton
            icon={<FolderOpen className="h-4 w-4"/>}
            label="Open"
            onClick={()=>run(()=>onOpen(design))}
          />

          {onRename&&(
            <MenuButton
              icon={<Edit3 className="h-4 w-4"/>}
              label="Rename"
              onClick={()=>run(()=>onRename(design))}
            />
          )}

          {onDuplicate&&design.available!==false&&(
            <MenuButton
              icon={<Copy className="h-4 w-4"/>}
              label="Duplicate"
              onClick={()=>run(()=>onDuplicate(design))}
            />
          )}

          <MenuButton
            icon={<Heart className="h-4 w-4"/>}
            label="Remove from Favorites"
            className="text-pink-500"
            onClick={()=>run(()=>onRemoveFavorite(design.id))}
          />

          {onTrash&&(
            <>
              <div className="my-1 h-px bg-[var(--border-default)]"/>

              <MenuButton
                icon={<Trash2 className="h-4 w-4"/>}
                label="Move to Trash"
                className="text-red-500"
                onClick={()=>run(()=>onTrash(design))}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuButton({icon,label,onClick,className=""}){
  return(
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-base transition hover:bg-primary/10 ${className||"text-[var(--text-body)]"}`}
    >
      {icon}
      {label}
    </button>
  );
}
