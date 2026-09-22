import { useState } from "react";
import {
  Clock3,
  Copy,
  Edit3,
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  formatRelativeTime,
  TAG_COLORS,
} from "./profileData";

import { DesignArt } from "./DesignArt";
import { TemplateActionModal } from "./TemplateActionModal";

export function TemplateCard({
  design,
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

  return(
    <article className="profile-template-card relative rounded-[13px] border border-[var(--border-card)] bg-[var(--surface-card)] shadow-[0_8px_24px_rgba(112,90,224,0.07)]">
      {/* TEMPLATE PREVIEW */}
      <div className="rounded-t-[13px] bg-accent p-[8px] pb-[10px]">
        <div className="aspect-[16/9] overflow-hidden rounded-[9px] bg-white">
          <DesignArt kind={design.art}/>
        </div>
      </div>

      {/* INFORMATION */}
      <div className="px-4 pb-4 pt-3">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[17px] font-semibold text-[var(--text-heading)]">
              {design.title}
            </h3>
          </div>

          {/* MENU */}
          <div className="relative z-30 shrink-0">
            <button
              type="button"
              onClick={()=>setMenuOpen((current)=>!current)}
              className="grid h-8 w-8 place-items-center rounded-full text-[var(--text-muted)] transition hover:bg-primary/10 hover:text-primary"
            >
              <MoreVertical className="h-[18px] w-[18px]"/>
            </button>

            {menuOpen&&(
              <div className="absolute right-0 top-9 z-[80] w-[180px] rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-1.5 shadow-[0_14px_40px_rgba(0,0,0,0.16)]">
                <button
                  type="button"
                  onClick={()=>openModal("edit")}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--text-body)] transition hover:bg-primary/10 hover:text-primary"
                >
                  <Pencil className="h-4 w-4"/>
                  Edit
                </button>

                <button
                  type="button"
                  onClick={()=>openModal("rename")}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--text-body)] transition hover:bg-primary/10 hover:text-primary"
                >
                  <Edit3 className="h-4 w-4"/>
                  Rename
                </button>

                <button
                  type="button"
                  onClick={()=>openModal("duplicate")}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--text-body)] transition hover:bg-primary/10 hover:text-primary"
                >
                  <Copy className="h-4 w-4"/>
                  Duplicate
                </button>

                <div className="my-1 h-px bg-[var(--border-default)]"/>

                <button
                  type="button"
                  onClick={()=>openModal("delete")}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-rose-500 transition hover:bg-rose-500/10"
                >
                  <Trash2 className="h-4 w-4"/>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* DESCRIPTION */}
        <p className="mt-1 line-clamp-2 min-h-[44px] text-[13px] leading-[22px] text-[var(--text-muted)]">
          {design.subtitle}
        </p>

        {/* BOTTOM */}
        <div className="profile-template-details mt-3 flex items-end justify-between gap-3">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {design.tags.map((tag)=>(
              <span
                key={tag.label}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  TAG_COLORS[tag.color]
                }`}
              >
                {tag.label}
              </span>
            ))}
          </div>

          {/* POSTED TEMPLATE */}
          {!isDraft&&(
            <div className="flex shrink-0 flex-col items-end gap-1 text-[11px] text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5"/>
                {design.views} views
              </span>

              <span className="flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5"/>
                {formatRelativeTime(design.publishedAt)}
              </span>
            </div>
          )}

          {/* DRAFT */}
          {isDraft&&(
            <span className="flex shrink-0 items-center gap-1 text-[11px] text-[var(--text-muted)]">
              <Clock3 className="h-3.5 w-3.5"/>
              Edited {formatRelativeTime(design.updatedAt)}
            </span>
          )}
        </div>
      </div>

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
    </article>
  );
}