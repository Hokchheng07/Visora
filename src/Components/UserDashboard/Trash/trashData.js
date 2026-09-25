export const RETENTION_DAYS=30;

export function dateDaysAgo(days){
  const date=new Date();
  date.setDate(date.getDate()-days);
  return date.toISOString();
}

export const INITIAL_TRASH=[
  {
    id:"trash-1",
    title:"Old Homepage Concept v1",
    description:"Old website landing page concept",
    art:"portfolio",
    format:"Web Landing",
    category:"Landing Pages",
    tags:["SaaS Layout","Archived"],
    deletedAt:dateDaysAgo(2),
    deletedBy:"Chit Chimy",
  },
  {
    id:"trash-2",
    title:"Event Flyer Draft",
    description:"Summer event poster draft",
    art:"exam",
    format:"Print Poster",
    category:"Graphics & Posters",
    tags:["Conference","A4 Format"],
    deletedAt:dateDaysAgo(16),
    deletedBy:"Chit Chimy",
  },
  {
    id:"trash-3",
    title:"Discarded Logo Variations",
    description:"Unused brand identity concepts",
    art:"doodle",
    format:"Branding Kit",
    category:"Brand Assets",
    tags:["Logotypes","Brand Identity"],
    deletedAt:dateDaysAgo(25),
    deletedBy:"Chit Chimy",
  },
];

export const TRASH_FILTERS=[
  {id:"all",label:"All Items"},
  {id:"Landing Pages",label:"Landing Pages"},
  {id:"Graphics & Posters",label:"Graphics & Posters"},
  {id:"Brand Assets",label:"Brand Assets"},
];

export function getRemainingDays(deletedAt){
  const deleted=new Date(deletedAt);
  const expires=new Date(deleted);
  expires.setDate(expires.getDate()+RETENTION_DAYS);

  const difference=expires-new Date();

  return Math.max(
    0,
    Math.ceil(difference/(1000*60*60*24))
  );
}

export function getDeletedTime(deletedAt){
  const difference=new Date()-new Date(deletedAt);
  const days=Math.max(
    0,
    Math.floor(difference/(1000*60*60*24))
  );

  if(days===0)return "Deleted today";
  if(days===1)return "Deleted yesterday";

  return `Deleted ${days} days ago`;
}