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
import { LayoutGroup, motion, useReducedMotion } from "motion/react";

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
  const reduceMotion = useReducedMotion();
  return(
    <div className="mt-10 flex items-center gap-4 sm:mt-8 lg:gap-8">
      <span className="hidden shrink-0 text-sm font-semibold text-[var(--text-body)] min-[900px]:block">
        Browse by Category
      </span>

      <div className="min-w-0 flex-1">
        <LayoutGroup id="template-categories">
        <div className="scrollbar-none flex gap-2 overflow-x-auto p-1 sm:gap-3">
          {templateCategories.map((category)=>{
            const Icon=categoryIcons[category];
            const active=activeCategory===category;

            return(
              <button
                key={category}
                type="button"
                aria-pressed={active}
                onClick={()=>setActiveCategory(category)}
                className={`templates-category relative isolate flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors sm:px-4 sm:py-2.5 sm:text-sm ${
                  active
                    ?"border-primary text-white"
                    :"border-[var(--border-default)] bg-[var(--surface-card)] text-primary hover:border-primary hover:bg-primary/5"
                }`}
              >
                {active && <motion.span layoutId="active-category" className="absolute inset-0 -z-10 rounded-[7px] bg-primary" transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }} />}
                {Icon&&<Icon size={15}/>}
                {category}
              </button>
            );
          })}
        </div>
        </LayoutGroup>
      </div>
    </div>
  );
}
