export function StatCard({
  icon,
  iconBg,
  iconColor,
  value,
  label,
  caption,
  captionColor,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: number;
  label: string;
  caption: string;
  captionColor: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-lg font-semibold leading-tight text-slate-900">{value}</p>
        <p className="text-[11px] text-slate-500">{label}</p>
        <p className={`mt-0.5 text-[11px] font-medium ${captionColor}`}>{caption}</p>
      </div>
    </div>
  );
}
