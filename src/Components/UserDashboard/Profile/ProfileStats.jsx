import {
  Download,
  FilePenLine,
  Layers,
  Share2,
} from "lucide-react";

function StatCard({
  icon,
  iconBg,
  iconColor,
  value,
  label,
  caption,
  captionColor,
}){
  return(
    <div className="group flex min-w-0 items-center gap-3 rounded-[16px] border border-[var(--border-card)] bg-[var(--surface-card)] px-3 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:rounded-[18px] sm:px-4 sm:py-3.5">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 sm:rounded-2xl ${iconBg} ${iconColor}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-lg font-bold leading-none text-[var(--text-heading)] sm:text-xl">
          {value}
        </p>

        <p className="mt-1 truncate text-[10px] font-medium text-[var(--text-body)] sm:text-[11px]">
          {label}
        </p>

        <p
          className={`mt-0.5 truncate text-[9px] font-medium sm:text-[10px] ${captionColor}`}
        >
          {caption}
        </p>
      </div>
    </div>
  );
}

export default function ProfileStats({
  templates,
}){
  const posted=templates.filter(
    (template)=>template.status==="posted"
  ).length;

  const drafts=templates.filter(
    (template)=>template.status==="draft"
  ).length;

  return(
    <section className="rounded-b-[20px] border border-t border-[var(--border-card)] bg-[var(--surface-card)] p-3 shadow-[0_18px_55px_rgba(112,90,224,.1)] sm:rounded-b-[24px] sm:p-4 lg:rounded-b-[30px] lg:p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Layers className="h-5 w-5"/>}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          value={posted}
          label="Posted Templates"
          caption="Published on Visora"
          captionColor="text-primary"
        />

        <StatCard
          icon={<FilePenLine className="h-5 w-5"/>}
          iconBg="bg-accent/20"
          iconColor="text-primary"
          value={drafts}
          label="Drafts"
          caption="Work in progress"
          captionColor="text-primary"
        />

        <StatCard
          icon={<Download className="h-5 w-5"/>}
          iconBg="bg-secondary/20"
          iconColor="text-amber-600"
          value={12}
          label="Exports"
          caption="+2 this month"
          captionColor="text-amber-500"
        />

        <StatCard
          icon={<Share2 className="h-5 w-5"/>}
          iconBg="bg-accent/20"
          iconColor="text-primary"
          value={2}
          label="Shared"
          caption="+1 this week"
          captionColor="text-primary"
        />
      </div>
    </section>
  );
}