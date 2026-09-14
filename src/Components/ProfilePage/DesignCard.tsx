import { useState } from "react";
import { MoreVertical, Pencil, Edit3, Copy, Trash2, Users } from "lucide-react";
import type { Design } from "./types";
import { TAG_COLORS } from "./data";
import { DesignArt } from "./DesignArt";
import { EditModal } from "./EditModal";
import { RenameModal } from "./RenameModal";
import { DuplicateModal } from "./DuplicateModal";
import { DeleteModal } from "./DeleteModal";

export function DesignCard({ design }: { design: Design }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"edit" | "rename" | "duplicate" | "delete" | null>(null);

  const openModal = (modal: "edit" | "rename" | "duplicate" | "delete") => {
    setMenuOpen(false);
    setActiveModal(modal);
  };

  return (
    <div className="flex h-full w-full flex-col rounded-2xl border-[3px] border-violet-300 bg-white transition-shadow hover:shadow-md">
      <div className="relative aspect-[8/5] w-full overflow-hidden rounded-t-[13px]">
        <DesignArt kind={design.art} />
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-slate-900">{design.title}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{design.subtitle}</p>
          </div>

          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Design options"
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-7 z-10 w-44 overflow-hidden rounded-2xl border border-slate-100 bg-white py-3 shadow-xl">
                <button
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => openModal("edit")}
                >
                  <Pencil className="h-4 w-4 text-slate-400" />
                  Edit
                </button>
                <button
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => openModal("rename")}
                >
                  <Edit3 className="h-4 w-4 text-slate-400" />
                  Rename
                </button>
                <button
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => openModal("duplicate")}
                >
                  <Copy className="h-4 w-4 text-slate-400" />
                  Duplicate
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-rose-500 hover:bg-rose-50"
                  onClick={() => openModal("delete")}
                >
                  <Trash2 className="h-4 w-4 text-rose-500" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex flex-wrap gap-1">
            {design.tags.map((tag) => (
              <span
                key={tag.label}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${TAG_COLORS[tag.color]}`}
              >
                {tag.label}
              </span>
            ))}
          </div>
          <span className="flex shrink-0 items-center gap-1 text-[11px] text-slate-400">
            <Users className="h-3 w-3" />
            {design.uses} uses
          </span>
        </div>
      </div>

      {activeModal === "edit" && <EditModal design={design} onClose={() => setActiveModal(null)} />}
      {activeModal === "rename" && <RenameModal design={design} onClose={() => setActiveModal(null)} />}
      {activeModal === "duplicate" && <DuplicateModal design={design} onClose={() => setActiveModal(null)} />}
      {activeModal === "delete" && <DeleteModal design={design} onClose={() => setActiveModal(null)} />}
    </div>
  );
}
