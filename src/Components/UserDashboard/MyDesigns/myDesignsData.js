export const CREATE_FORMATS=[
  {
    id:"blank",
    title:"Blank Canvas",
    subtitle:"Custom size & DPI",
    type:"Quick",
    icon:"plus",
  },
  {
    id:"presentation",
    title:"Presentation",
    subtitle:"1920 × 1080 px",
    icon:"presentation",
  },
  {
    id:"social",
    title:"Social Post",
    subtitle:"1080 × 1080 px",
    icon:"social",
  },
  {
    id:"poster",
    title:"Poster / A4",
    subtitle:"Print ready 300 DPI",
    icon:"poster",
  },
  {
    id:"web",
    title:"Web Landing",
    subtitle:"1440 × 900 px",
    icon:"web",
  },
];

export const MY_DESIGNS=[
  {
    id:"design-1",
    title:"Creative Portfolio",
    description:"Design with your ideas and creative",
    tags:["Workshop","Modern","Creative"],
    views:250,
    art:"portfolio",
    status:"published",
    visibility:"public",
    updatedAt:"2026-09-23T18:00:00",
  },
  {
    id:"design-2",
    title:"Frontend Examination",
    description:"Design with your ideas and creative",
    tags:["Workshop","Modern","Creative"],
    views:250,
    art:"exam",
    status:"published",
    visibility:"public",
    updatedAt:"2026-09-22T18:00:00",
  },
  {
    id:"design-3",
    title:"Creative Doodle",
    description:"Design with your ideas and creative",
    tags:["Workshop","Modern","Creative"],
    views:250,
    art:"doodle",
    status:"draft",
    visibility:"private",
    updatedAt:"2026-09-21T18:00:00",
  },
  {
    id:"design-4",
    title:"Portfolio Presentation",
    description:"Modern creative portfolio presentation",
    tags:["Portfolio","Modern","Creative"],
    views:180,
    art:"portfolio",
    status:"draft",
    visibility:"private",
    updatedAt:"2026-09-20T18:00:00",
  },
  {
    id:"design-5",
    title:"Workshop Examination",
    description:"Timed examination presentation",
    tags:["Exam","Workshop","Modern"],
    views:195,
    art:"exam",
    status:"published",
    visibility:"public",
    updatedAt:"2026-09-19T18:00:00",
  },
  {
    id:"design-6",
    title:"Event Doodle",
    description:"Creative event backdrop design",
    tags:["Event","Creative","Modern"],
    views:130,
    art:"doodle",
    status:"draft",
    visibility:"private",
    updatedAt:"2026-09-18T18:00:00",
  },
  {
    id:"design-7",
    title:"Leadership Portfolio",
    description:"Leadership and business presentation",
    tags:["Leadership","Business","Modern"],
    views:210,
    art:"portfolio",
    status:"published",
    visibility:"public",
    updatedAt:"2026-09-17T18:00:00",
  },
  {
    id:"design-8",
    title:"Private Examination",
    description:"Private examination workspace",
    tags:["Exam","Education","Private"],
    views:0,
    art:"exam",
    status:"draft",
    visibility:"private",
    updatedAt:"2026-09-16T18:00:00",
  },
  {
    id:"design-9",
    title:"Creative Event",
    description:"Colorful event presentation",
    tags:["Event","Modern","Creative"],
    views:165,
    art:"doodle",
    status:"published",
    visibility:"public",
    updatedAt:"2026-09-15T18:00:00",
  },
];

export const TAG_COLORS=[
  "bg-primary/10 text-primary",
  "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
  "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
];

export function formatDesignTime(date){
  const now=new Date();
  const target=new Date(date);
  const diff=Math.max(0,now-target);
  const minutes=Math.floor(diff/60000);
  const hours=Math.floor(minutes/60);
  const days=Math.floor(hours/24);

  if(minutes<1)return "Just now";
  if(minutes<60)return `${minutes}m ago`;
  if(hours<24)return `${hours}h ago`;
  if(days===1)return "Yesterday";
  return `${days}d ago`;
}