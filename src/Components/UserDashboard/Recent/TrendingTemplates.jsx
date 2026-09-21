import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

const TRENDING=[
  {
    id:"minimalist-portfolio-deck",
    title:"Minimalist Portfolio Deck",
    caption:"16 Slides • Portfolio",
    badge:"16 Slides",
    badgeClass:"bg-slate-100 text-slate-500 dark:bg-slate-500/15 dark:text-slate-300",
  },
  {
    id:"brand-moodboard-kit",
    title:"Brand Moodboard Kit",
    caption:"Tactile Swatches • Pro",
    badge:"Moodboard",
    badgeClass:"bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  },
  {
    id:"bold-exhibition-poster",
    title:"Bold Exhibition Poster",
    caption:"Print Ready • Vector",
    badge:"Poster",
    badgeClass:"bg-rose-100 text-rose-500 dark:bg-rose-500/15 dark:text-rose-300",
  },
];

export default function TrendingTemplates(){
  return(
    <section className="mt-10 border-t border-[var(--border-default)] pt-8">
      {/* TOP AREA */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-[var(--text-heading)] sm:text-2xl">
              Trending Community Templates
            </h2>

            <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
              Curated
            </span>
          </div>

          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Jumpstart your next flow with pre-engineered typography, frames &amp;
            palettes.
          </p>
        </div>

        <Link
          to="/templates"
          className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary transition hover:opacity-80"
        >
          Explore All 1,200+ Templates
          <ArrowRight className="h-4 w-4"/>
        </Link>
      </div>

      {/* TRENDING CARDS */}
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {TRENDING.map(({id,title,caption,badge,badgeClass})=>(
          <article
            key={id}
            className="flex items-center gap-4 rounded-[13px] border border-[var(--border-card)] bg-[var(--surface-card)] p-4 shadow-[0_8px_24px_rgba(112,90,224,0.07)] transition hover:-translate-y-0.5 hover:border-primary/40"
          >
            <div
              className={`grid h-[74px] w-[74px] shrink-0 place-items-center rounded-[10px] px-2 text-center text-[10px] font-semibold leading-tight ${badgeClass}`}
            >
              {badge}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-semibold leading-snug text-[var(--text-heading)]">
                {title}
              </h3>

              <p className="mt-1 text-[12px] text-[var(--text-muted)]">
                {caption}
              </p>
            </div>

            <Link
              to="/editor"
              className="inline-flex h-9 shrink-0 items-center rounded-lg bg-primary/10 px-3 text-[12px] font-semibold text-primary transition hover:bg-primary hover:text-[var(--text-on-brand)]"
            >
              Use Template
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
