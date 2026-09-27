import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Heart, UsersRound, WandSparkles, X } from "lucide-react";
import { TemplateArtwork } from "./TemplateCard.jsx";

/* A larger look at one template before using it: the preview, what it is
   for, and the two things you can do with it. */
export default function TemplatePreviewModal({ template, favorite, onFavorite, onUse, onClose }) {
  return (
    <Dialog open={!!template} onClose={onClose} className="relative z-[120]">
      <div className="fixed inset-0 bg-[rgb(20_16_32/.5)] backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 grid place-items-center overflow-y-auto p-4">
        {template && (
          <DialogPanel className="relative w-full max-w-[880px] overflow-hidden rounded-[18px] bg-[var(--surface-card)] shadow-[0_28px_90px_rgb(14_12_36/.3)]">
            <button type="button" onClick={onClose} aria-label="Close preview"
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#29243a] shadow transition hover:text-primary">
              <X className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
            <div className="bg-[#b294f0] p-3 sm:p-4">
              <div className="aspect-video w-full overflow-hidden rounded-[12px] bg-[#faf9f4]">
                <TemplateArtwork template={template} />
              </div>
            </div>
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
              <div className="min-w-0">
                <DialogTitle className="text-2xl font-semibold text-[var(--text-heading)]">{template.title}</DialogTitle>
                {template.description && <p className="mt-1.5 text-[15px] leading-6 text-[var(--text-muted)]">{template.description}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {(template.tags || []).map((tag) => (
                    <span key={tag} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{tag}</span>
                  ))}
                  {template.users > 0 && (
                    <span className="flex items-center gap-1.5 text-sm text-[var(--text-body)]">
                      <UsersRound className="h-4 w-4" aria-hidden="true" />{Number(template.users).toLocaleString()} uses
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={onFavorite} aria-pressed={!!favorite}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-[var(--border-default)] px-4 text-sm font-semibold text-[var(--text-heading)] transition hover:border-primary hover:text-primary">
                  <Heart className={`h-4 w-4 ${favorite ? "fill-primary text-primary" : ""}`} aria-hidden="true" />
                  {favorite ? "Favorited" : "Favorite"}
                </button>
                <button type="button" onClick={onUse}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-[var(--text-on-brand)] transition hover:opacity-90">
                  <WandSparkles className="h-4 w-4" aria-hidden="true" />
                  Use this template
                </button>
              </div>
            </div>
          </DialogPanel>
        )}
      </div>
    </Dialog>
  );
}
