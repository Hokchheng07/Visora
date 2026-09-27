import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Heart, WandSparkles, X } from "lucide-react";
import { TemplateArtwork } from "./TemplateCard.jsx";
import TemplateFormatBadge from "./TemplateFormatBadge.jsx";
import { getTemplateCategoryTags, getTemplateFormat } from "./templatePresentation.js";

/* A gallery-like look at one template: the artwork gets the room, while the
   supporting information and actions stay in a stable side rail. */
export default function TemplatePreviewModal({ template, favorite, onFavorite, onUse, onClose }) {
  const categoryTags = getTemplateCategoryTags(template);
  const format = getTemplateFormat(template);
  return (
    <Dialog open={!!template} onClose={onClose} className="relative z-[120]">
      <div className="fixed inset-0 bg-[rgb(12_9_23/.68)] backdrop-blur-[6px]" aria-hidden="true" />
      <div className="fixed inset-0 grid place-items-center overflow-y-auto p-3 sm:p-6">
        {template && (
          <DialogPanel className="template-preview-dialog relative grid max-h-[calc(100dvh-24px)] w-full max-w-[1120px] overflow-y-auto rounded-[16px] bg-[var(--surface-card)] shadow-[0_30px_100px_rgb(9_6_24/.42)] lg:grid-cols-[minmax(0,1fr)_340px] lg:overflow-hidden">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full border border-black/5 bg-white/95 text-[#29243a] shadow-[0_5px_18px_rgb(18_12_38/.14)] transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:right-4 lg:top-4"
            >
              <X className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>

            <div className="template-preview-stage flex min-h-0 items-center p-3 sm:p-5 lg:min-h-[590px] lg:p-7">
              <div className="aspect-video w-full overflow-hidden rounded-[12px] bg-[#faf9f4] shadow-[0_14px_38px_rgb(54_35_105/.14)]">
                <TemplateArtwork template={template} />
              </div>
            </div>

            <div className="flex min-w-0 flex-col border-t border-[var(--border-default)] p-5 sm:p-7 lg:border-l lg:border-t-0 lg:pb-6 lg:pt-20">
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-[clamp(1.5rem,2.2vw,2rem)] font-semibold leading-[1.18] tracking-[-0.025em] text-[var(--text-heading)]">
                  {template.title}
                </DialogTitle>

                {template.description && (
                  <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                    {template.description}
                  </p>
                )}

                {(categoryTags.length > 0 || format.label) && (
                  <div className="mt-6 border-t border-[var(--border-default)] pt-5">
                    <div className="mb-4">
                      <TemplateFormatBadge format={format} />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {categoryTags.map((tag) => (
                        <span
                          key={tag}
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            tag === "Timer" ? "template-timer-tag" : "bg-primary/10 text-primary"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-7 grid shrink-0 gap-2.5">
                <button
                  type="button"
                  onClick={onUse}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-[var(--text-on-brand)] shadow-[0_9px_20px_rgb(112_90_224/.24)] transition-[transform,filter] hover:brightness-105 active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <WandSparkles className="h-4 w-4" aria-hidden="true" />
                  Use this template
                </button>
                <button
                  type="button"
                  onClick={onFavorite}
                  aria-pressed={!!favorite}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-default)] px-4 text-sm font-semibold text-[var(--text-heading)] transition hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <Heart className={`h-4 w-4 ${favorite ? "fill-primary text-primary" : ""}`} aria-hidden="true" />
                  {favorite ? "Favorited" : "Favorite"}
                </button>
              </div>
            </div>
          </DialogPanel>
        )}
      </div>
    </Dialog>
  );
}
