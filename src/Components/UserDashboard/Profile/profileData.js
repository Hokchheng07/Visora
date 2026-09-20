export const DEFAULT_PROFILE={
  avatarUrl:"https://api.dicebear.com/7.x/personas/svg?seed=ChitChimy",
  name:"Chit Chimy",
  handle:"chitchimy",
  role:"UI/UX Designer & Creative Developer",
  bio:"Crafting tactile, organic digital experiences that bridge the gap between logical structure and playful expression.",
  location:"Phnom Penh, Cambodia",
};

export function slugify(text){
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/(^-|-$)/g,"");
}

export function formatRelativeTime(date){
  if(!date)return "";

  const now=new Date();
  const target=new Date(date);

  const diff=Math.max(
    0,
    now.getTime()-target.getTime()
  );

  const seconds=Math.floor(diff/1000);
  const minutes=Math.floor(seconds/60);
  const hours=Math.floor(minutes/60);
  const days=Math.floor(hours/24);
  const months=Math.floor(days/30);
  const years=Math.floor(days/365);

  if(seconds<60)return "Just now";
  if(minutes<60)return `${minutes}m ago`;
  if(hours<24)return `${hours}h ago`;
  if(days<30)return `${days}d ago`;
  if(months<12)return `${months}mo ago`;

  return `${years}y ago`;
}

export const STANDARD_TAGS=[
  {label:"Workshop",color:"violet"},
  {label:"Modern",color:"blue"},
  {label:"Creative",color:"green"},
];

export const PROFILE_TEMPLATES=[
  {
    id:"d1",
    title:"Leadership Q&A Session",
    subtitle:"A bold closing slide for leadership talks, interviews, and audience questions.",
    tags:[
      {label:"Leadership",color:"violet"},
      {label:"Modern",color:"blue"},
      {label:"Creative",color:"green"},
    ],
    views:250,
    art:"portfolio",
    visibility:"public",
    status:"posted",
    publishedAt:"2026-09-20T09:45:00",
    updatedAt:"2026-09-20T09:45:00",
  },
  {
    id:"d2",
    title:"Modern Business Presentation",
    subtitle:"A playful geometric template for business plans, workshops, and team presentations.",
    tags:[
      {label:"Business",color:"violet"},
      {label:"Workshop",color:"blue"},
      {label:"Modern",color:"green"},
    ],
    views:184,
    art:"exam",
    visibility:"public",
    status:"posted",
    publishedAt:"2026-09-19T14:20:00",
    updatedAt:"2026-09-19T14:20:00",
  },
  {
    id:"d3",
    title:"Retail Forecast Report",
    subtitle:"A clean data-focused template for forecasts, market insights, and planning sessions.",
    tags:[
      {label:"Retail",color:"violet"},
      {label:"Report",color:"blue"},
      {label:"Minimal",color:"green"},
    ],
    views:126,
    art:"doodle",
    visibility:"team",
    status:"posted",
    publishedAt:"2026-08-15T11:00:00",
    updatedAt:"2026-08-15T11:00:00",
  },

  {
    id:"d4",
    title:"Creative Portfolio Draft",
    subtitle:"Work in progress portfolio template.",
    tags:STANDARD_TAGS,
    views:0,
    art:"portfolio",
    visibility:"private",
    status:"draft",
    publishedAt:null,
    updatedAt:"2026-09-20T10:10:00",
  },
  {
    id:"d5",
    title:"Examination Draft",
    subtitle:"An unfinished examination template.",
    tags:STANDARD_TAGS,
    views:0,
    art:"exam",
    visibility:"private",
    status:"draft",
    publishedAt:null,
    updatedAt:"2026-09-19T16:40:00",
  },
  {
    id:"d6",
    title:"Creative Doodle Draft",
    subtitle:"An unfinished creative template.",
    tags:STANDARD_TAGS,
    views:0,
    art:"doodle",
    visibility:"private",
    status:"draft",
    publishedAt:null,
    updatedAt:"2026-09-10T13:15:00",
  },
];

export const TAG_COLORS={
  violet:"bg-primary/10 text-primary",
  blue:"bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
  green:"bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
};