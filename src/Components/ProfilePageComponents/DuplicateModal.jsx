import { useState } from "react";
import { Copy, Folder, Info } from "lucide-react";
import { ModalShell, ModalHeading, FieldLabel } from "./ModalPrimitives";

/* ---------------------------------------------------------------------- */
/* Duplicate modal                                                         */
/* ---------------------------------------------------------------------- */
export function DuplicateModal({ design, onClose }) {
  const [name, setName] = useState(`${design.title} (Copy)`);
  const [copyHistory, setCopyHistory] = useState(true);
  const [preservePermissions, setPreservePermissions] = useState(false);
  const [duplicateAssets, setDuplicateAssets] = useState(true);

  const options = [
    {
      key: "history",
      label: "Copy version history",
      desc: "Include all 24 past iterations and branch checkpoints.",
      checked: copyHistory,
      toggle: () => setCopyHistory((v) => !v),
    },
    {
      key: "permissions",
      label: "Preserve collaborator permissions",
      desc: "Keep existing shared team members and view access.",
      checked: preservePermissions,
      toggle: () => setPreservePermissions((v) => !v),
    },
    {
      key: "assets",
      label: "Duplicate linked assets",
      desc: "Create isolated local copies of embedded textures and fonts.",
      checked: duplicateAssets,
      toggle: () => setDuplicateAssets((v) => !v),
    },
  ];

  return (
    <ModalShell onClose={onClose} previewLabel="Duplicate" previewIcon={<Copy className="h-4 w-4 text-violet-500" />}>
      <ModalHeading
        icon={<Copy className="h-4.5 w-4.5" />}
        tone="violet"
        title="Duplicate Design"
        subtitle="Create an independent copy of this project file with custom settings."
      />

      <div className="mb-1 flex items-center justify-between">
        <FieldLabel>New File / Copy Name</FieldLabel>
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

      <FieldLabel>Destination / Location</FieldLabel>
      <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 p-3">
        <span className="flex items-center gap-2 text-xs text-slate-700">
          <Folder className="h-4 w-4 text-amber-500" />
          <span>
            <span className="block font-semibold">Personal Projects / Work in Progress</span>
            <span className="text-slate-400">Visora Workspace · Private Directory</span>
          </span>
        </span>
        <button className="shrink-0 rounded-lg border border-violet-200 px-3 py-1.5 text-xs font-medium text-violet-600 hover:bg-violet-50">
          Change folder
        </button>
      </div>

      <FieldLabel>Duplication Options</FieldLabel>
      <div className="mb-4 space-y-2">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={opt.toggle}
            className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left ${
              opt.checked ? "border-violet-500 bg-violet-50/40" : "border-slate-200"
            }`}
          >
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded ${
                opt.checked ? "bg-violet-600" : "border border-slate-300 bg-white"
              }`}
            >
              {opt.checked && <span className="text-[10px] leading-none text-white">✓</span>}
            </span>
            <span>
              <span className="block text-xs font-semibold text-slate-800">{opt.label}</span>
              <span className="text-[11px] text-slate-400">{opt.desc}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="mb-6 flex items-start gap-2 rounded-xl bg-violet-50 p-3.5 text-xs text-violet-700">
        <Info className="h-4 w-4 shrink-0" />
        The duplicated project will be saved with a unique URL slug and won&apos;t affect the live published
        design.
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700">
          Cancel
        </button>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          <Copy className="h-3.5 w-3.5" />
          Duplicate Project
        </button>
      </div>
    </ModalShell>
  );
}
