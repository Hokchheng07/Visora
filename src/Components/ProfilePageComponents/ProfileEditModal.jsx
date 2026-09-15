import { useRef, useState } from "react";
import { X, Upload, Camera } from "lucide-react";
import { FieldLabel } from "./ModalPrimitives";

/* ---------------------------------------------------------------------- */
/* Profile edit modal                                                      */
/* ---------------------------------------------------------------------- */
export function ProfileEditModal({
  profile,
  onSave,
  onClose,
}) {
  const [draft, setDraft] = useState(profile);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setDraft((d) => ({ ...d, avatarUrl: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Edit Profile</h3>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Avatar upload */}
        <div className="mb-5 flex flex-col items-center">
          <div className="group relative">
            <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-200 ring-2 ring-white">
              <img src={draft.avatarUrl} alt="Avatar preview" className="h-full w-full object-cover" />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload photo"
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-transparent transition group-hover:bg-black/40 group-hover:text-white"
            >
              <Camera className="h-5 w-5" />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload photo
          </button>
        </div>

        <FieldLabel>Name</FieldLabel>
        <input
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-300 focus:bg-white"
        />

        <FieldLabel>Handle</FieldLabel>
        <div className="mb-4 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 focus-within:border-violet-300 focus-within:bg-white">
          <span className="mr-1 text-sm text-slate-400">@</span>
          <input
            value={draft.handle}
            onChange={(e) => setDraft((d) => ({ ...d, handle: e.target.value }))}
            className="flex-1 bg-transparent text-sm text-slate-800 outline-none"
          />
        </div>

        <FieldLabel>Role / Title</FieldLabel>
        <input
          value={draft.role}
          onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}
          className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-300 focus:bg-white"
        />

        <FieldLabel>Bio</FieldLabel>
        <textarea
          value={draft.bio}
          onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
          rows={3}
          className="mb-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-300 focus:bg-white"
        />

        <FieldLabel>Location</FieldLabel>
        <input
          value={draft.location}
          onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
          className="mb-6 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-300 focus:bg-white"
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700">
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(draft);
              onClose();
            }}
            className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
