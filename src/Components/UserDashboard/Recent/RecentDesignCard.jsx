import {useState} from "react";
import {
  Clock3,
  Copy,
  Edit3,
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import {DesignArt} from "../Profile/DesignArt";
import {TemplateActionModal} from "../Profile/TemplateActionModal";
import {formatRelativeTime,TAG_COLORS} from "../Profile/profileData";

export default function RecentDesignCard({
  design,
  viewMode,
  onUpdate,
  onRename,
  onDuplicate,
  onDelete,
}){
  const [menuOpen,setMenuOpen]=useState(false);
  const [activeModal,setActiveModal]=useState(null);

  const openModal=(mode)=>{
    setMenuOpen(false);
    setActiveModal(mode);
  };

  const isDraft=design.status==="draft";

  if(viewMode==="list"){
    return(
      <>
        <article className="relative flex min-w-0 flex-col gap-4 rounded-[18px] border border-[var(--border-card)] bg-[var(--surface-card)] p-3 shadow-[0_8px_24px_rgba(112,90,224,.07)] sm:flex-row sm:items-center">
          <div className="w-full shrink-0 rounded-[13px] bg-accent p-[7px] sm:w-[250px] lg:w-[300px]">
            <div className="aspect-[16/9] overflow-hidden rounded-[8px] bg-white">
              <DesignArt kind={design.art}/>
            </div>
          </div>

          <div className="min-w-0 flex-1 py-1">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[17px] font-semibold text-[var(--text-heading)] sm:text-lg">
                  {design.title}
                </h3>

                <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--text-muted)]">
                  {design.subtitle}
                </p>
              </div>

              <CardMenu
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                openModal={openModal}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {design.tags.map((tag)=>(
                <span
                  key={tag.label}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${TAG_COLORS[tag.color]||"bg-primary/10 text-primary"}`}
                >
                  {tag.label}
                </span>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-5 text-xs text-[var(--text-muted)]">
              {!isDraft&&(
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4"/>
                  {design.views} views
                </span>
              )}

              <span className="flex items-center gap-1.5">
                <Clock3 className="h-4 w-4"/>
                {isDraft
                  ?`Edited ${formatRelativeTime(design.updatedAt)}`
                  :formatRelativeTime(design.publishedAt)
                }
              </span>
            </div>
          </div>
        </article>

        {activeModal&&(
          <TemplateActionModal
            mode={activeModal}
            design={design}
            onClose={()=>setActiveModal(null)}
            onUpdate={onUpdate}
            onRename={onRename}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        )}
      </>
    );
  }

  return(
    <>
      <article className="relative min-w-0 rounded-[14px] border border-[var(--border-card)] bg-[var(--surface-card)] shadow-[0_8px_24px_rgba(112,90,224,.07)]">
        <div className="rounded-t-[13px] bg-accent p-[8px] pb-[10px]">
          <div className="aspect-[16/9] overflow-hidden rounded-[8px] bg-white">
            <DesignArt kind={design.art}/>
          </div>
        </div>

        <div className="px-4 pb-4 pt-3">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[17px] font-semibold text-[var(--text-heading)]">
                {design.title}
              </h3>
            </div>

            <CardMenu
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
              openModal={openModal}
            />
          </div>

          <p className="mt-1 line-clamp-2 min-h-[44px] text-[13px] leading-[22px] text-[var(--text-muted)]">
            {design.subtitle}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {design.tags.map((tag)=>(
              <span
                key={tag.label}
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${TAG_COLORS[tag.color]||"bg-primary/10 text-primary"}`}
              >
                {tag.label}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-[11px] text-[var(--text-muted)]">
            {!isDraft?(
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5"/>
                {design.views} views
              </span>
            ):(
              <span/>
            )}

            <span className="flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5"/>
              {isDraft
                ?`Edited ${formatRelativeTime(design.updatedAt)}`
                :formatRelativeTime(design.publishedAt)
              }
            </span>
          </div>
        </div>
      </article>

      {activeModal&&(
        <TemplateActionModal
          mode={activeModal}
          design={design}
          onClose={()=>setActiveModal(null)}
          onUpdate={onUpdate}
          onRename={onRename}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      )}
    </>
  );
}

function CardMenu({
  menuOpen,
  setMenuOpen,
  openModal,
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
        <div className="absolute right-0 top-9 z-[100] w-[180px] rounded-[14px] border border-[var(--border-default)] bg-[var(--surface-card)] p-1.5 shadow-[0_18px_50px_rgba(0,0,0,.18)]">
          <MenuButton
            icon={<Edit3 className="h-4 w-4"/>}
            label="Edit"
            onClick={()=>openModal("edit")}
          />

          <MenuButton
            icon={<Pencil className="h-4 w-4"/>}
            label="Rename"
            onClick={()=>openModal("rename")}
          />

          <MenuButton
            icon={<Copy className="h-4 w-4"/>}
            label="Duplicate"
            onClick={()=>openModal("duplicate")}
          />

          <div className="my-1 h-px bg-[var(--border-default)]"/>

          <MenuButton
            icon={<Trash2 className="h-4 w-4"/>}
            label="Delete"
            className="text-red-500"
            onClick={()=>openModal("delete")}
          />
        </div>
      )}
    </div>
  );
}

function MenuButton({
  icon,
  label,
  onClick,
  className="",
}){
  return(
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-primary/10 ${className||"text-[var(--text-body)]"}`}
    >
      {icon}
      {label}
    </button>
  );
}