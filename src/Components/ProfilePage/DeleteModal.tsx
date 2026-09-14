import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import type { Design } from "../ProfilePage/types";
import { slugify } from "../ProfilePage/types";
import { ModalShell, ModalHeading, FieldLabel } from "./ModalPrimitives";

/* ---------------------------------------------------------------------- */
/* Delete modal                                                            */
/* ---------------------------------------------------------------------- */
export function DeleteModal({ design, onClose }: { design: Design; onClose: () => void }) {
  const [confirmText, setConfirmText] = useState("");
  const slug = slugify(design.title);
  const canDelete = confirmText.trim().toUpperCase() === "DELETE";

  return (
    <ModalShell
      onClose={onClose}
      previewLabel="Delete"
      previewIcon={<Trash2 className="h-4 w-4 text-rose-500" />}
      previewTone="rose"
    >
      <ModalHeading
        icon={<Trash2 className="h-4.5 w-4.5" />}
        tone="rose"
        title="Delete Design"
        subtitle="Permanently remove this project, assets, and published links."
      />

      <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5">
        <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-rose-600">
          <AlertTriangle className="h-3.5 w-3.5" />
          Warning: This action is irreversible
        </p>
        <p className="text-xs text-rose-500">
          Deleting &quot;{design.title}&quot; will immediately unpublish the project link and permanently delete
          all revisions, shared links, and uploaded canvas textures.
        </p>
      </div>

      <p className="mb-2 text-xs font-semibold text-slate-700">Project Impact Summary</p>
      <ul className="mb-4 space-y-1.5 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-rose-400" />
          24 iteration checkpoints &amp; branch history
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-rose-400" />
          <span>
            Live public link: visora.studio/@chitchimy/p/{slug}{" "}
            <span className="text-rose-500">(will return 404)</span>
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-rose-400" />3 shared collaborator access tokens
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-rose-400" />
          12 linked custom vector assets &amp; textures
        </li>
      </ul>

      <FieldLabel>
        To confirm deletion, type <span className="rounded bg-rose-100 px-1.5 py-0.5 text-rose-600">&quot;DELETE&quot;</span>{" "}
        below:
      </FieldLabel>
      <input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="DELETE"
        className="mb-6 w-full rounded-xl border border-amber-200 bg-amber-50/40 px-3.5 py-2.5 text-sm uppercase tracking-wide text-slate-800 outline-none placeholder:normal-case placeholder:text-slate-400 focus:border-amber-300"
      />

      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700">
          Cancel
        </button>
        <button
          onClick={onClose}
          disabled={!canDelete}
          className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Permanently Delete
        </button>
      </div>
    </ModalShell>
  );
}
