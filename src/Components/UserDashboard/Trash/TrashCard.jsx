import {useState} from "react";
import {
  AlertTriangle,
  Clock3,
  MoreVertical,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {DesignArt} from "../Profile/DesignArt";
import {
  getDeletedTime,
  getRemainingDays,
} from "./trashData";

const TAG_COLORS=[
  "bg-primary/10 text-primary",
  "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
  "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
];

export default function TrashCard({
  design,
  viewMode,
  onRestore,
  onDelete,
}){
  const [menuOpen,setMenuOpen]=useState(false);

  const remainingDays=getRemainingDays(design.deletedAt);
  const expiringSoon=remainingDays<=7;
  const warning=remainingDays>7&&remainingDays<=15;

  if(viewMode==="list"){
    return(
      <article className="relative flex min-w-0 flex-col gap-4 rounded-[18px] border border-[var(--border-card)] bg-[var(--surface-card)] p-3 shadow-[0_7px_22px_rgba(112,90,224,.06)] sm:flex-row sm:items-center">
        {/* PREVIEW */}
        <div
          className={`w-full shrink-0 rounded-[13px] p-[7px] sm:w-[250px] lg:w-[290px] ${
            expiringSoon
              ?"bg-red-200/60 dark:bg-red-500/15"
              :"bg-accent"
          }`}
        >
          <div className="relative aspect-[16/9] overflow-hidden rounded-[8px] bg-white">
            <DesignArt kind={design.art}/>

            <RemainingBadge
              remainingDays={remainingDays}
              expiringSoon={expiringSoon}
              warning={warning}
            />
          </div>
        </div>

        {/* CONTENT */}
        <div className="min-w-0 flex-1 py-1">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-medium text-[var(--text-heading)]">
                {design.title}
              </h3>

              <p className="mt-1 text-sm leading-6 text-[var(--text-muted)] sm:text-base">
                {getDeletedTime(design.deletedAt)} by {design.deletedBy}
              </p>
            </div>

            <TrashMenu
              design={design}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
              onRestore={onRestore}
              onDelete={onDelete}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {design.tags?.map((tag,index)=>(
              <span
                key={tag}
                className={`rounded-full px-3 py-1 text-xs font-medium ${TAG_COLORS[index%TAG_COLORS.length]}`}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={()=>onRestore(design)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 text-sm font-medium text-primary transition hover:bg-primary/15"
            >
              <RotateCcw className="h-4 w-4"/>
              Restore
            </button>

            <button
              type="button"
              onClick={()=>onDelete(design)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-medium text-red-500 transition hover:bg-red-500/10 dark:border-red-500/30"
            >
              <Trash2 className="h-4 w-4"/>
              Delete Forever
            </button>
          </div>
        </div>
      </article>
    );
  }

  return(
    <article
      className={`relative min-w-0 rounded-[14px] border bg-[var(--surface-card)] shadow-[0_8px_24px_rgba(112,90,224,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(112,90,224,.1)] ${
        expiringSoon
          ?"border-red-300 dark:border-red-500/35"
          :"border-[var(--border-card)]"
      }`}
    >
      {/* PURPLE FRAME */}
      <div
        className={`rounded-t-[13px] p-[8px] pb-[10px] ${
          expiringSoon
            ?"bg-red-200/55 dark:bg-red-500/15"
            :"bg-accent"
        }`}
      >
        <div className="relative aspect-[16/9] overflow-hidden rounded-[8px] bg-white">
          <DesignArt kind={design.art}/>

          {design.format&&(
            <span className="absolute left-3 top-3 rounded-lg bg-[var(--surface-card)]/95 px-2.5 py-1 text-xs font-medium text-[var(--text-body)] shadow-sm backdrop-blur-sm">
              {design.format}
            </span>
          )}

          <RemainingBadge
            remainingDays={remainingDays}
            expiringSoon={expiringSoon}
            warning={warning}
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 pb-4 pt-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-medium text-[var(--text-heading)]">
              {design.title}
            </h3>

            <p className="mt-1 text-sm leading-5 text-[var(--text-muted)]">
              {getDeletedTime(design.deletedAt)} by {design.deletedBy}
            </p>
          </div>

          <TrashMenu
            design={design}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            onRestore={onRestore}
            onDelete={onDelete}
          />
        </div>

        {design.tags?.length>0&&(
          <div className="mt-4 flex flex-wrap gap-1.5">
            {design.tags.map((tag,index)=>(
              <span
                key={tag}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${TAG_COLORS[index%TAG_COLORS.length]}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={()=>onRestore(design)}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary/10 text-sm font-medium text-primary transition hover:bg-primary/15"
          >
            <RotateCcw className="h-4 w-4"/>
            Restore
          </button>

          <button
            type="button"
            onClick={()=>onDelete(design)}
            aria-label="Delete forever"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-red-200 text-red-500 transition hover:bg-red-500/10 dark:border-red-500/30"
          >
            <Trash2 className="h-4 w-4"/>
          </button>
        </div>
      </div>
    </article>
  );
}

function RemainingBadge({
  remainingDays,
  expiringSoon,
  warning,
}){
  return(
    <span
      className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium shadow-sm ${
        expiringSoon
          ?"border-red-300 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300"
          :warning
            ?"border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300"
            :"border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300"
      }`}
    >
      {expiringSoon?(
        <AlertTriangle className="h-3.5 w-3.5"/>
      ):(
        <Clock3 className="h-3.5 w-3.5"/>
      )}

      {remainingDays} days
    </span>
  );
}

function TrashMenu({
  design,
  menuOpen,
  setMenuOpen,
  onRestore,
  onDelete,
}){
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
        <div className="absolute right-0 top-9 z-[100] w-[190px] rounded-[14px] border border-[var(--border-default)] bg-[var(--surface-card)] p-1.5 shadow-[0_18px_50px_rgba(0,0,0,.18)]">
          <button
            type="button"
            onClick={()=>{
              setMenuOpen(false);
              onRestore(design);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-normal text-[var(--text-body)] transition hover:bg-primary/10 hover:text-primary"
          >
            <RotateCcw className="h-4 w-4"/>
            Restore
          </button>

          <button
            type="button"
            onClick={()=>{
              setMenuOpen(false);
              onDelete(design);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-normal text-red-500 transition hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4"/>
            Delete Forever
          </button>
        </div>
      )}
    </div>
  );
}