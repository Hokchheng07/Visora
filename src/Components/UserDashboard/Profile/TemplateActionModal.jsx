import { useState } from "react";
import {
  Copy,
  Edit3,
  Globe2,
  Lock,
  Pencil,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { slugify } from "./profileData";
import { DesignArt } from "./DesignArt";

const inputClass=
  "w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-overlay)] px-3.5 py-2.5 text-sm text-[var(--text-heading)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-primary focus:ring-2 focus:ring-primary/10";

export function TemplateActionModal({
  mode,
  design,
  onClose,
  onUpdate,
  onRename,
  onDuplicate,
  onDelete,
}){
  return(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[24px] border border-[var(--border-card)] bg-[var(--surface-card)] p-6 shadow-[0_25px_80px_rgba(0,0,0,.28)]">
        {/* ONLY THIS X CLOSES DIRECTLY */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full text-[var(--text-muted)] transition hover:bg-primary/10 hover:text-primary"
        >
          <X className="h-4 w-4"/>
        </button>

        {mode==="edit"&&(
          <EditTemplate
            design={design}
            onSave={onUpdate}
            onClose={onClose}
          />
        )}

        {mode==="rename"&&(
          <RenameTemplate
            design={design}
            onSave={onRename}
            onClose={onClose}
          />
        )}

        {mode==="duplicate"&&(
          <DuplicateTemplate
            design={design}
            onSave={onDuplicate}
            onClose={onClose}
          />
        )}

        {mode==="delete"&&(
          <DeleteTemplate
            design={design}
            onDelete={onDelete}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

function Heading({
  icon,
  title,
  subtitle,
  danger=false,
}){
  return(
    <div className="mb-6 flex items-start gap-3 pr-10">
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
          danger
            ?"bg-rose-500/10 text-rose-500"
            :"bg-primary/10 text-primary"
        }`}
      >
        {icon}
      </div>

      <div>
        <h2 className="font-semibold text-[var(--text-heading)]">
          {title}
        </h2>

        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function EditTemplate({
  design,
  onSave,
  onClose,
}){
  const [title,setTitle]=useState(design.title);
  const [description,setDescription]=useState(design.subtitle);
  const [visibility,setVisibility]=useState(
    design.visibility||"public"
  );

  const save=()=>{
    if(!title.trim())return;

    onSave({
      ...design,
      title:title.trim(),
      subtitle:description.trim(),
      visibility,
    });

    onClose();
  };

  return(
    <>
      <Heading
        icon={<Pencil className="h-4 w-4"/>}
        title="Edit Template"
        subtitle="Update your template information and visibility."
      />

      <p className="mb-1.5 text-xs font-semibold text-[var(--text-heading)]">
        Preview
      </p>

      <div className="mb-5 aspect-[16/9] overflow-hidden rounded-xl border border-[var(--border-card)]">
        <DesignArt kind={design.art}/>
      </div>

      <p className="mb-1.5 text-xs font-semibold text-[var(--text-heading)]">
        Template Title
      </p>

      <input
        value={title}
        onChange={(e)=>setTitle(e.target.value)}
        className={`${inputClass} mb-4`}
      />

      <p className="mb-1.5 text-xs font-semibold text-[var(--text-heading)]">
        Description
      </p>

      <textarea
        value={description}
        onChange={(e)=>setDescription(e.target.value)}
        rows={3}
        className={`${inputClass} mb-5 resize-none`}
      />

      <p className="mb-2 text-xs font-semibold text-[var(--text-heading)]">
        Visibility
      </p>

      <div className="grid grid-cols-3 gap-2">
        <VisibilityButton
          active={visibility==="public"}
          onClick={()=>setVisibility("public")}
          icon={<Globe2 className="h-4 w-4"/>}
          label="Public"
        />

        <VisibilityButton
          active={visibility==="team"}
          onClick={()=>setVisibility("team")}
          icon={<Users className="h-4 w-4"/>}
          label="Team"
        />

        <VisibilityButton
          active={visibility==="private"}
          onClick={()=>setVisibility("private")}
          icon={<Lock className="h-4 w-4"/>}
          label="Private"
        />
      </div>

      {visibility==="private"&&(
        <p className="mt-3 rounded-xl bg-secondary/10 px-3 py-2.5 text-xs text-[var(--text-muted)]">
          Saving as Private will move this template to Drafts.
        </p>
      )}

      {design.status==="draft"&&visibility==="public"&&(
        <p className="mt-3 rounded-xl bg-primary/10 px-3 py-2.5 text-xs text-primary">
          Saving as Public will publish this template.
        </p>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl px-4 py-2.5 text-sm text-[var(--text-muted)] transition hover:bg-primary/5"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={save}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-[var(--text-on-brand)] transition hover:opacity-90"
        >
          Save Changes
        </button>
      </div>
    </>
  );
}

function VisibilityButton({
  active,
  onClick,
  icon,
  label,
}){
  return(
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-xs font-semibold transition ${
        active
          ?"border-primary bg-primary/10 text-primary"
          :"border-[var(--border-default)] text-[var(--text-muted)] hover:border-primary/40"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function RenameTemplate({
  design,
  onSave,
  onClose,
}){
  const [name,setName]=useState(design.title);

  const save=()=>{
    if(!name.trim())return;

    onSave(
      design.id,
      name.trim()
    );

    onClose();
  };

  return(
    <>
      <Heading
        icon={<Edit3 className="h-4 w-4"/>}
        title="Rename Template"
        subtitle="Give your template a new name."
      />

      <p className="mb-1.5 text-xs font-semibold text-[var(--text-heading)]">
        Template Name
      </p>

      <input
        value={name}
        onChange={(e)=>setName(e.target.value)}
        className={inputClass}
      />

      <div className="mt-4 rounded-xl bg-primary/5 p-3">
        <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
          Template URL
        </p>

        <p className="mt-1 truncate text-xs font-medium text-primary">
          visora.studio/template/{slugify(name)||"template"}
        </p>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl px-4 py-2 text-sm text-[var(--text-muted)] hover:bg-primary/5"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={save}
          className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-[var(--text-on-brand)]"
        >
          Rename
        </button>
      </div>
    </>
  );
}

function DuplicateTemplate({
  design,
  onSave,
  onClose,
}){
  const [name,setName]=useState(
    `${design.title} Copy`
  );

  const duplicate=()=>{
    if(!name.trim())return;

    onSave(
      design,
      name.trim()
    );

    onClose();
  };

  return(
    <>
      <Heading
        icon={<Copy className="h-4 w-4"/>}
        title="Duplicate Template"
        subtitle="The duplicated template will be saved as a draft."
      />

      <p className="mb-1.5 text-xs font-semibold text-[var(--text-heading)]">
        Copy Name
      </p>

      <input
        value={name}
        onChange={(e)=>setName(e.target.value)}
        className={inputClass}
      />

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl px-4 py-2 text-sm text-[var(--text-muted)] hover:bg-primary/5"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={duplicate}
          className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-[var(--text-on-brand)]"
        >
          Duplicate
        </button>
      </div>
    </>
  );
}

function DeleteTemplate({
  design,
  onDelete,
  onClose,
}){
  const [confirm,setConfirm]=useState("");

  const allowed=
    confirm.trim().toUpperCase()==="DELETE";

  const remove=()=>{
    if(!allowed)return;

    onDelete(design.id);
    onClose();
  };

  return(
    <>
      <Heading
        danger
        icon={<Trash2 className="h-4 w-4"/>}
        title="Delete Template"
        subtitle="This action cannot be undone."
      />

      <div className="rounded-xl bg-rose-500/10 p-4">
        <p className="text-sm font-medium text-rose-500">
          Delete “{design.title}”?
        </p>
      </div>

      <p className="mb-1.5 mt-4 text-xs font-semibold text-[var(--text-heading)]">
        Type DELETE to confirm
      </p>

      <input
        value={confirm}
        onChange={(e)=>setConfirm(e.target.value)}
        placeholder="DELETE"
        className={`${inputClass} uppercase`}
      />

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl px-4 py-2 text-sm text-[var(--text-muted)] hover:bg-primary/5"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={!allowed}
          onClick={remove}
          className="rounded-xl bg-rose-500 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Delete
        </button>
      </div>
    </>
  );
}