import { PenLine,Search,SlidersHorizontal } from "lucide-react";
import yellowLine from "../../assets/pages/templates/yellow-line.svg";

export default function TemplateHeader({
  search,
  setSearch,
  onCreate,
  onToggleFilters,
  activeFilterCount=0,
}){
  return(
    <div className="mx-auto w-full max-w-7xl px-4 text-center sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
      <h1 className="mx-auto max-w-[900px] text-[32px] font-bold leading-[1.15] text-[var(--text-heading)] sm:text-[38px] md:text-[42px] lg:max-w-none lg:whitespace-nowrap lg:text-[46px] xl:text-[50px] 2xl:text-[64px]">
        Find Your Perfect{" "}
        <span className="relative inline-block text-primary">
          Templates

          <img
            src={yellowLine}
            alt=""
            className="pointer-events-none absolute -bottom-3 left-1/2 w-[90%] -translate-x-1/2 select-none sm:-bottom-4 sm:w-[92%] md:w-[94%] lg:w-[95%] xl:-bottom-5 2xl:-bottom-6 2xl:w-[105%]"
          />
        </span>
      </h1>

      <p className="mx-auto mt-5 max-w-[520px] text-[13px] leading-6 text-[var(--text-body)] sm:max-w-[580px] sm:text-sm md:max-w-[640px] md:text-[15px] lg:max-w-2xl lg:text-base xl:mt-6 2xl:mt-7 2xl:max-w-[850px] 2xl:text-[18px] 2xl:leading-8">
        Start with a professionally designed backdrop and make it uniquely yours.
      </p>

      <div className="mx-auto mt-8 flex w-full max-w-[520px] flex-col gap-3 sm:mt-9 sm:max-w-[600px] md:mt-10 md:max-w-[760px] md:flex-row md:gap-3 lg:max-w-[850px] xl:max-w-[950px] 2xl:mt-14 2xl:max-w-[1200px] 2xl:gap-4">
        <div className="relative min-w-0 flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] md:left-5 2xl:h-5 2xl:w-5"
          />

          <input
            type="text"
            value={search}
            onChange={(event)=>setSearch(event.target.value)}
            placeholder="Search Templates..."
            className="h-11 w-full rounded-xl border border-[var(--border-card)] bg-[var(--surface-overlay)] pl-11 pr-12 text-[13px] text-[var(--text-heading)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-primary focus:ring-2 focus:ring-primary/10 sm:h-12 sm:text-sm md:h-[50px] md:pl-12 lg:h-[52px] xl:h-[54px] 2xl:h-[60px] 2xl:pl-14 2xl:text-base"
          />

          <button
            type="button"
            onClick={onToggleFilters}
            aria-label="Toggle filters"
            className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-primary transition hover:bg-primary/10 min-[900px]:hidden"
          >
            <SlidersHorizontal size={18}/>

            {activeFilterCount>0&&(
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-secondary px-1 text-[9px] font-bold text-black">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-[13px] font-semibold text-white transition hover:bg-primary/90 active:scale-[0.98] sm:h-12 sm:text-sm md:h-[50px] md:w-auto md:px-5 lg:h-[52px] lg:px-6 xl:h-[54px] xl:px-7 2xl:h-[60px] 2xl:px-10 2xl:text-base"
        >
          <PenLine className="h-4 w-4 sm:h-[18px] sm:w-[18px] 2xl:h-5 2xl:w-5"/>
          Create from Scratch
        </button>
      </div>
    </div>
  );
}