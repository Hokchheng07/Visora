import { MonitorPlay,Plus } from "lucide-react";
import { Link } from "react-router";

/* The quick-format shelf. Blank Canvas is the highlighted first tile; the rest
 * are plain format presets that open the editor at a fixed size. */
const FORMATS=[
  {
    id:"presentation",
    title:"Presentation",
    caption:"1920 x 1080 px",
    icon:MonitorPlay,
    iconClass:"bg-orange-100 text-orange-500 dark:bg-orange-500/15 dark:text-orange-300",
    to:"/editor?format=presentation",
  },
];

export default function CreateNewShelf(){
  return(
    <section className="mt-7">
      {/* SECTION TITLE */}
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 shrink-0 rounded-full bg-primary"/>

        <h2 className="text-lg font-semibold text-[var(--text-heading)] sm:text-xl">
          Create Something New
        </h2>
      </div>

      {/* FORMAT TILES */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* BLANK CANVAS */}
        <Link
          to="/editor"
          className="group relative flex flex-col justify-between rounded-[16px] border-2 border-dashed border-primary/45 bg-[var(--surface-card)] p-4 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_10px_26px_rgba(112,90,224,0.12)]"
        >
          <div className="flex items-start justify-between">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-[var(--text-on-brand)] shadow-[0_6px_16px_rgba(112,90,224,0.25)]">
              <Plus className="h-5 w-5"/>
            </span>

            <span className="rounded-full bg-secondary/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
              Quick
            </span>
          </div>

          <div className="mt-8">
            <p className="text-[15px] font-semibold text-[var(--text-heading)]">
              Blank Canvas
            </p>

            <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">
              Custom size &amp; DPI
            </p>
          </div>
        </Link>

        {/* PRESETS */}
        {FORMATS.map(({id,title,caption,icon:Icon,iconClass,to})=>(
          <Link
            key={id}
            to={to}
            className="group flex flex-col justify-between rounded-[16px] border border-[var(--border-card)] bg-[var(--surface-card)] p-4 shadow-[0_8px_24px_rgba(112,90,224,0.07)] transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_10px_26px_rgba(112,90,224,0.12)]"
          >
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${iconClass}`}>
              <Icon className="h-5 w-5"/>
            </span>

            <div className="mt-8">
              <p className="text-[15px] font-semibold text-[var(--text-heading)]">
                {title}
              </p>

              <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">
                {caption}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
