import { useState } from "react";
import { Clock3,Copy,Edit3,Eye,MoreVertical,Pencil,Trash2 } from "lucide-react";
import { DesignArt } from "../Profile/DesignArt";
import { TAG_COLORS,formatDesignTime } from "./myDesignsData";

export default function MyDesignCard({
  design,
  viewMode,
  onEdit,
  onRename,
  onDuplicate,
  onDelete,
}){
  const [menuOpen,setMenuOpen]=useState(false);

  if(viewMode==="list"){
    return(
      <article className="relative flex min-w-0 flex-col gap-4 rounded-[18px] border border-[var(--border-card)] bg-[var(--surface-card)] p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="w-full shrink-0 rounded-[14px] bg-accent p-[7px] sm:w-[230px]">
          <div className="aspect-[16/9] overflow-hidden rounded-[9px] bg-white">
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

            <DesignMenu
              design={design}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
              onEdit={onEdit}
              onRename={onRename}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {design.tags.map((tag,index)=>(
              <span
                key={tag}
                className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${TAG_COLORS[index%TAG_COLORS.length]}`}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5"/>
              {design.views} views
            </span>

            <span className="flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5"/>
              Edited {formatDesignTime(design.updatedAt)}
            </span>
          </div>
        </div>
      </article>
    );
  }

  return(
    <article className="relative min-w-0 rounded-[14px] border border-[var(--border-card)] bg-[var(--surface-card)] shadow-[0_8px_24px_rgba(112,90,224,.07)]">
      <div className="rounded-t-[13px] bg-accent p-[8px] pb-[10px]">
        <div className="aspect-[16/9] overflow-hidden rounded-[8px] bg-white">
          <DesignArt kind={design.art}/>
        </div>
      </div>

      <div className="px-4 pb-4 pt-3">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[18px] font-semibold text-[var(--text-heading)]">
              {design.title}
            </h3>

            <p className="mt-1 truncate text-[14px] text-[var(--text-muted)]">
              {design.description}
            </p>
          </div>

          <DesignMenu
            design={design}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            onEdit={onEdit}
            onRename={onRename}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {design.tags.map((tag,index)=>(
            <span
              key={tag}
              className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${TAG_COLORS[index%TAG_COLORS.length]}`}
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
            {formatDesignTime(design.updatedAt)}
          </span>
        </div>
      </div>
    </article>
  );
}

function DesignMenu({
  design,
  menuOpen,
  setMenuOpen,
  onEdit,
  onRename,
  onDuplicate,
  onDelete,
}){
  const run=(callback)=>{
    setMenuOpen(false);
    callback();
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
        <div className="absolute right-0 top-9 z-[100] w-[210px] rounded-[14px] border border-[var(--border-default)] bg-[var(--surface-card)] p-1.5 shadow-[0_18px_50px_rgba(0,0,0,.18)]">
          <MenuButton
            icon={<Edit3 className="h-4 w-4"/>}
            label="Edit"
            onClick={()=>run(()=>onEdit(design))}
          />

          <MenuButton
            icon={<Pencil className="h-4 w-4"/>}
            label="Rename"
            onClick={()=>run(()=>onRename(design))}
          />

          <MenuButton
            icon={<Copy className="h-4 w-4"/>}
            label="Duplicate"
            onClick={()=>run(()=>onDuplicate(design))}
          />

          <div className="my-1 h-px bg-[var(--border-default)]"/>

          <MenuButton
            icon={<Trash2 className="h-4 w-4"/>}
            label="Delete"
            className="text-red-500"
            onClick={()=>run(()=>onDelete(design))}
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