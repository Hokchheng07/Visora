import { useState } from "react";
import { Pencil, Upload, X, Plus } from "lucide-react";
import type { Design } from "../ProfilePage/types";
import { DesignArt } from "./DesignArt";
import { ModalShell, ModalHeading, FieldLabel } from "./ModalPrimitives";

/* ---------------------------------------------------------------------- */
/* Edit modal                                                              */
/* ---------------------------------------------------------------------- */
export function EditModal({ design, onClose }: { design: Design; onClose: () => void }) {
  const [title, setTitle] = useState(design.title);
  const [description, setDescription] = useState(
    "Organic playful wireframe kit designed with speckle paper styling for workshop ideation."
  );
  const [tags, setTags] = useState(design.tags.map((t) => t.label));
  const [visibility, setVisibility] = useState<"public" | "team" | "private">("public");

  return (
    <ModalShell onClose={onClose} previewLabel="Edit" previewIcon={<Pencil className="h-4 w-4 text-violet-500" />}>
      <ModalHeading
        icon={<Pencil className="h-4.5 w-4.5" />}
        tone="violet"
        title="Edit Design Details"
        subtitle="Update project name, tags, thumbnail, and visibility."
      />

      <FieldLabel>Project Thumbnail</FieldLabel>
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 p-2.5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg">
          <DesignArt kind={design.art} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-800">doodle_cover_art_v2.png</p>
          <p className="text-xs text-slate-400">1280 × 720 · 240 KB</p>
        </div>
        <button className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
          <Upload className="h-3.5 w-3.5" />
          Change
        </button>
      </div>

      <FieldLabel>Design Title</FieldLabel>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-300 focus:bg-white"
      />

      <FieldLabel>Description</FieldLabel>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="mb-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-300 focus:bg-white"
      />
      <p className="mb-4 text-[11px] text-slate-400">
        Brief summary displayed across studio directories &amp; client links.
      </p>

      <FieldLabel>Tags</FieldLabel>
      <div className="mb-4 flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-600"
          >
            {tag}
            <button onClick={() => setTags((t) => t.filter((x) => x !== tag))}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <button className="flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-xs text-slate-500 hover:bg-white">
          <Plus className="h-3 w-3" />
          Add tag
        </button>
      </div>

      <FieldLabel>Project Visibility</FieldLabel>
      <div className="mb-6 grid grid-cols-3 gap-2">
        {(
          [
            { key: "public", label: "Public", desc: "Visible on studio profile" },
            { key: "team", label: "Team Only", desc: "Visora Workspace" },
            { key: "private", label: "Private", desc: "Only you have access" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.key}
            onClick={() => setVisibility(opt.key)}
            className={`rounded-xl border p-3 text-left ${
              visibility === opt.key ? "border-violet-500 ring-1 ring-violet-500" : "border-slate-200"
            }`}
          >
            <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  visibility === opt.key ? "bg-violet-500" : "bg-slate-300"
                }`}
              />
              {opt.label}
            </span>
            <span className="text-[10px] text-slate-400">{opt.desc}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700">
          Cancel
        </button>
        <button
          onClick={onClose}
          className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Save Changes
        </button>
      </div>
    </ModalShell>
  );
}
