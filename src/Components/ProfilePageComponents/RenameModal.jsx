import { useState } from "react";
import { Edit3, Layers, Link2, Info } from "lucide-react";
import { slugify } from "./profileData";
import { ModalShell, ModalHeading, FieldLabel } from "./ModalPrimitives";

/* ---------------------------------------------------------------------- */
/* Rename modal                                                            */
/* ---------------------------------------------------------------------- */
export function RenameModal({ design, onClose }) {
  const [name, setName] = useState(design.title);
  const slug = slugify(name);

  return (
    <ModalShell onClose={onClose} previewLabel="Rename" previewIcon={<Edit3 className="h-4 w-4 text-violet-500" />}>
      <ModalHeading
        icon={<Edit3 className="h-4.5 w-4.5" />}
        tone="violet"
        title="Rename Design"
        subtitle="Update the display title and URL slug for this project file."
      />

      <div className="mb-1 flex items-center justify-between">
        <FieldLabel>Design Name</FieldLabel>
        <span className="text-[11px] text-slate-400">{name.length} / 60 max characters</span>
      </div>
      <div className="mb-4 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 focus-within:border-violet-300 focus-within:bg-white">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          className="flex-1 bg-transparent text-sm text-slate-800 outline-none"
        />
        <span className="ml-2 shrink-0 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
          .visora
        </span>
      </div>

      <div className="mb-4 space-y-2 rounded-xl bg-slate-50 p-3.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-slate-600">
            <Layers className="h-3.5 w-3.5 text-slate-400" />
            doodle_cover_art_v2.visora
          </span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
            Original format preserved
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Live slug / web URL</p>
            <p className="truncate text-xs text-slate-600">visora.studio/@chitchimy/p/{slug}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-600">
            <Link2 className="h-3 w-3" />
            Public link will update automatically
          </span>
        </div>
      </div>

      <div className="mb-6 flex items-start gap-2 rounded-xl bg-violet-50 p-3.5 text-xs text-violet-700">
        <Info className="h-4 w-4 shrink-0" />
        Renaming will maintain all existing collaborator access and version history (#24 iterations).
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700">
          Cancel
        </button>
        <button
          onClick={onClose}
          className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Update Name
        </button>
      </div>
    </ModalShell>
  );
}
