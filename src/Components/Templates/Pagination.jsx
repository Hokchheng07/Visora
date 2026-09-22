import { ChevronLeft,ChevronRight } from "lucide-react";
import yellow from "../../assets/pages/templates/yellow.svg";

export default function Pagination({page,totalPages,onChange}){
  if(totalPages<=1)return null;

  return(
    <div className="templates-pagination relative mt-10 flex justify-center sm:mt-11 md:mt-12 lg:mt-14 xl:mt-16 2xl:mt-18">
      <div className="relative z-10 flex items-center gap-0.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-1 shadow-sm">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page===1}
          onClick={()=>onChange(Math.max(1,page-1))}
          className="grid h-8 w-8 place-items-center rounded-md text-[var(--text-muted)] transition hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-30 sm:h-[34px] sm:w-[34px] md:h-9 md:w-9 lg:h-[38px] lg:w-[38px] 2xl:h-10 2xl:w-10"
        >
          <ChevronLeft className="h-4 w-4 md:h-[17px] md:w-[17px]"/>
        </button>

        {Array.from({length:totalPages},(_,index)=>index+1).map((number)=>(
          <button
            key={number}
            type="button"
            aria-label={`Page ${number}`}
            aria-current={page === number ? "page" : undefined}
            onClick={()=>onChange(number)}
            className={`grid h-8 min-w-8 place-items-center rounded-md px-2 text-xs font-semibold transition sm:h-[34px] sm:min-w-[34px] md:h-9 md:min-w-9 lg:h-[38px] lg:min-w-[38px] 2xl:h-10 2xl:min-w-10 ${
              page===number
                ?"bg-primary text-white"
                :"text-[var(--text-body)] hover:bg-primary/10"
            }`}
          >
            {number}
          </button>
        ))}

        <button
          type="button"
          aria-label="Next page"
          disabled={page===totalPages}
          onClick={()=>onChange(Math.min(totalPages,page+1))}
          className="grid h-8 w-8 place-items-center rounded-md text-[var(--text-muted)] transition hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-30 sm:h-[34px] sm:w-[34px] md:h-9 md:w-9 lg:h-[38px] lg:w-[38px] 2xl:h-10 2xl:w-10"
        >
          <ChevronRight className="h-4 w-4 md:h-[17px] md:w-[17px]"/>
        </button>
      </div>

      <img
        src={yellow}
        alt=""
        className="pointer-events-none absolute left-[calc(50%+55px)] top-1/2 z-0 w-[90px] -translate-y-1/2 select-none"
      />
    </div>
  );
}
