import { X } from "lucide-react";

/* ---------------------------------------------------------------------- */
/* Shared modal chrome: "CARD ACTIONS PREVIEW" pill + preview button bar   */
/* ---------------------------------------------------------------------- */
export function ModalShell({
  onClose,
  previewLabel,
  previewIcon,
  previewTone = "violet",
  children,
}: {
  onClose: () => void;
  previewLabel: string;
  previewIcon: React.ReactNode;
  previewTone?: "violet" | "rose";
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <span className="rounded-md bg-violet-100 px-2 py-1 text-[10px] font-bold tracking-wide text-violet-600">
            CARD ACTIONS PREVIEW
          </span>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          className={`mb-5 flex items-center justify-center gap-2 rounded-full border py-2.5 text-sm font-semibold shadow-sm ${
            previewTone === "rose"
              ? "border-rose-200 text-rose-600"
              : "border-slate-200 text-slate-800"
          }`}
        >
          {previewIcon}
          {previewLabel}
        </div>

        {children}
      </div>
    </div>
  );
}

export function ModalHeading({
  icon,
  tone,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  tone: "violet" | "rose";
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          tone === "rose" ? "bg-rose-100 text-rose-600" : "bg-violet-100 text-violet-600"
        }`}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-semibold text-slate-700">{children}</label>;
}
