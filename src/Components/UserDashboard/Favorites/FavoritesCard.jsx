import { useState } from "react";
import { Clock3,Copy,Edit3,Eye,FolderOpen,Heart,MoreVertical,Trash2 } from "lucide-react";
import { DesignArt } from "../Profile/DesignArt";
import { FAVORITE_TAG_COLORS,formatFavoriteTime } from "./FavoritesData";

export default function FavoriteCard({
  design,
  viewMode,
  onOpen,
  onRename,
  onDuplicate,
  onRemoveFavorite,
  onTrash,
}){
  const [menuOpen,setMenuOpen]=useState(false);

  if(viewMode==="list"){
    return(
      <article className="relative flex min-w-0 flex-col gap-4 rounded-[18px] border border-[var(--border-card)] bg-[var(--surface-card)] p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative w-full shrink-0 overflow-hidden rounded-[13px] border-[7px] border-accent/80 sm:w-[210px]">
          <div className="aspect-[16/9] overflow-hidden rounded-[7px] bg-white">
            <DesignArt kind={design.art}/>
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
              <Eye className="h-3.5 w-3.5"/>
              {design.views} views
            </span>

            <span className="flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5"/>
              Edited {formatFavoriteTime(design.updatedAt)}
            </span>
          </div>
        </div>

      </article>
    );
  }

  return(
    <article className="relative min-w-0 rounded-[14px] border border-[var(--border-card)] bg-[var(--surface-card)] shadow-[0_8px_24px_rgba(112,90,224,0.07)]">
      <div className="rounded-t-[13px] bg-accent p-[8px] pb-[10px]">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[8px] bg-white">
          <DesignArt kind={design.art}/>

          <div className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-lg bg-[var(--surface-card)]/95 shadow-sm">
            <Heart className="h-4 w-4 fill-pink-500 text-pink-500"/>
          </div>

        </div>
      </div>

      <div className="px-4 pb-4 pt-3">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[18px] font-semibold text-[var(--text-heading)]">
              {design.title}
            </h3>
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

        <p className="mt-1 line-clamp-2 min-h-[42px] text-[15px] leading-5 text-[var(--text-muted)]">
          {design.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {design.tags.map((tag,index)=>(
            <span
              key={tag}
              className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${FAVORITE_TAG_COLORS[index%FAVORITE_TAG_COLORS.length]}`}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5"/>
            {design.views} views
          </span>

          <span className="flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5"/>
            Edited {formatFavoriteTime(design.updatedAt)}
          </span>
        </div>
      </div>
    </article>
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

          <MenuButton
            icon={<Edit3 className="h-4 w-4"/>}
            label="Rename"
            onClick={()=>run(()=>onRename(design))}
          />

          <MenuButton
            icon={<Copy className="h-4 w-4"/>}
            label="Duplicate"
            onClick={()=>run(()=>onDuplicate(design))}
          />

          <MenuButton
            icon={<Heart className="h-4 w-4"/>}
            label="Remove from Favorites"
            className="text-pink-500"
            onClick={()=>run(()=>onRemoveFavorite(design.id))}
          />

          <div className="my-1 h-px bg-[var(--border-default)]"/>

          <MenuButton
            icon={<Trash2 className="h-4 w-4"/>}
            label="Move to Trash"
            className="text-red-500"
            onClick={()=>run(()=>onTrash(design))}
          />
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
