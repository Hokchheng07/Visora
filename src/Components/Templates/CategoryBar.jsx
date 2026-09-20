import {
  BookOpen,
  BriefcaseBusiness,
  FileText,
  GraduationCap,
  Landmark,
  LayoutGrid,
  Mic,
  PartyPopper,
  Presentation,
  School,
  Trophy,
} from "lucide-react";

import { templateCategories } from "./templateData";

const categoryIcons={
  All:LayoutGrid,
  Portfolio:BriefcaseBusiness,
  "CV / Resume":FileText,
  Graduation:GraduationCap,
  Examination:BookOpen,
  Seminar:Mic,
  Competition:Trophy,
  Workshop:Presentation,
  "School Event":School,
  "Khmer Event":Landmark,
  Celebration:PartyPopper,
};

export default function CategoryBar({activeCategory,setActiveCategory}){
  return(
    <div className="mt-10 ml-15 flex items-center gap-20 sm:mt-8">
      <span className="hidden shrink-0 text-sm font-semibold text-[var(--text-body)] min-[900px]:block">
        Browse by Category
      </span>

      <div className="min-w-0 flex-1">
        <div className="scrollbar-none flex gap-2 overflow-x-auto pb-2 pr-1 sm:gap-3">
          {templateCategories.map((category)=>{
            const Icon=categoryIcons[category];
            const active=activeCategory===category;

            return(
              <button
                key={category}
                type="button"
                onClick={()=>setActiveCategory(category)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition sm:px-4 sm:py-2.5 sm:text-sm ${
                  active
                    ?"border-primary bg-primary text-white"
                    :"border-[var(--border-default)] bg-[var(--surface-card)] text-primary hover:border-primary hover:bg-primary/5"
                }`}
              >
                {Icon&&<Icon size={15}/>}
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}