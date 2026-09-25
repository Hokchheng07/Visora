export const FAVORITE_DESIGNS=[
  {
    id:"fav-1",
    title:"Creative Portfolio",
    description:"Design with your ideas",
    category:"Presentation",
    tags:["Workshop","Modern","Creative"],
    views:250,
    updatedAt:"2026-09-23T18:00:00",
    art:"portfolio",
  },
  {
    id:"fav-2",
    title:"Frontend Examination",
    description:"Interactive timed workshop",
    category:"Presentation",
    tags:["Exam","Interactive","Quiz"],
    views:250,
    updatedAt:"2026-09-22T18:00:00",
    art:"exam",
  },
  {
    id:"fav-3",
    title:"Creative Topic",
    description:"Creative presentation design",
    category:"Social",
    tags:["Social","Creative","Event"],
    views:190,
    updatedAt:"2026-09-21T18:00:00",
    art:"doodle",
  },
  {
    id:"fav-4",
    title:"Brand Moodboard Kit",
    description:"Tactile textures, organic color",
    category:"Brand Kit",
    tags:["Branding","Vectors","Identity"],
    views:310,
    updatedAt:"2026-09-18T18:00:00",
    art:"portfolio",
  },
  {
    id:"fav-5",
    title:"Portfolio Showcase",
    description:"Modern portfolio presentation",
    category:"Presentation",
    tags:["Portfolio","Modern","Creative"],
    views:175,
    updatedAt:"2026-09-17T18:00:00",
    art:"portfolio",
  },
  {
    id:"fav-6",
    title:"Final Examination",
    description:"Examination backdrop with timer",
    category:"Presentation",
    tags:["Exam","Timer","Education"],
    views:220,
    updatedAt:"2026-09-16T18:00:00",
    art:"exam",
  },
  {
    id:"fav-7",
    title:"Social Event",
    description:"Colorful event presentation",
    category:"Social",
    tags:["Event","Social","Creative"],
    views:143,
    updatedAt:"2026-09-15T18:00:00",
    art:"doodle",
  },
  {
    id:"fav-8",
    title:"Visual Identity",
    description:"Brand identity presentation kit",
    category:"Brand Kit",
    tags:["Branding","Identity","Modern"],
    views:280,
    updatedAt:"2026-09-14T18:00:00",
    art:"portfolio",
  },
];

export function formatFavoriteTime(date){
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

export const FAVORITE_TAG_COLORS=[
  "bg-primary/10 text-primary",
  "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
  "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
];