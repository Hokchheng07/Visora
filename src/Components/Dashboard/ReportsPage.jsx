import { useId, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Check, ChevronDown, Clock, CloudDownload, FileText, FileUp, Flag, Lock, Users } from "lucide-react";
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "react-router";
import { StatCards } from "./AdminUi";
import { useDashboardData } from "./dashboardData";
import { useTheme } from "../../theme/useTheme";
import graduationCeremony from "../../assets/pages/admin/reports/top-templates/graduation-ceremony.png";
import businessSeminar from "../../assets/pages/admin/reports/top-templates/business-seminar.png";
import khmerNewYear from "../../assets/pages/admin/reports/top-templates/khmer-new-year.png";
import finalExamination from "../../assets/pages/admin/reports/top-templates/final-examination.png";
import creativeWorkshop from "../../assets/pages/admin/reports/top-templates/creative-workshop.png";
import "./admin-reports.css";

// Downloads, views and the creation trend are not tracked in the mock data
// yet, so this page uses fixed sample numbers for them. Totals and the
// category split are read live from the shared data.
const ranges = {
  week: {
    label: "May 18, 2024 – May 24, 2024",
    daily: [["May 18", 42], ["May 19", 290], ["May 20", 300], ["May 21", 395], ["May 22", 150], ["May 23", 400], ["May 24", 328]],
    downloads: 18642,
  },
  month: {
    label: "Apr 25, 2024 – May 24, 2024",
    daily: [["Apr 25", 120], ["Apr 29", 210], ["May 3", 180], ["May 7", 260], ["May 11", 240], ["May 15", 330], ["May 19", 290], ["May 24", 328]],
    weekly: [["Apr 25", 1320], ["May 2", 1580], ["May 9", 1460], ["May 16", 1790], ["May 23", 1905]],
    downloads: 72310,
  },
};
const topTemplates = [
  { name: "Graduation Ceremony 2026", state: "Public", category: "Graduation", downloads: 2345, views: 4345, image: graduationCeremony },
  { name: "Business Seminar Blue", state: "Public", category: "Seminar", downloads: 1234, views: 3234, image: businessSeminar },
  { name: "Khmer New Year Celebration", state: "Public", category: "Khmer Events", downloads: 1204, views: 4204, image: khmerNewYear },
  { name: "Final Examination Template", state: "Private", category: "Examination", downloads: 1134, views: 2134, image: finalExamination },
  { name: "Workshop on Creative Design", state: "Pending", category: "Workshop", downloads: 1004, views: 2004, image: creativeWorkshop },
];
const reportLinks = [
  ["Audit Log Report", "Track admin actions and system logs."],
  ["User Activities Report", "See detailed user activities and engagement."],
  ["Submission Report", "Review template submission and approval status."],
];
const categoryColors = ["#6155f5", "#c63de0", "#34c759", "#ffc21c", "#f9a8d4", "#9ca3af"];
const stateIcon = { Public: Check, Private: Lock, Pending: Clock };

function useChartPalette() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark"
    ? { line: "#a78dff", grid: "rgba(255,255,255,0.07)", tick: "#bcbccd", tooltip: "#1a1a28", ink: "#fff", border: "rgba(255,255,255,0.12)", ring: "#1a1a28" }
    : { line: "#5b45d8", grid: "#ececf1", tick: "#6b6b76", tooltip: "#fff", ink: "#111", border: "#e4e4e7", ring: "#fff" };
}

function TemplatesCreatedChart({ data }) {
  const colors = useChartPalette();
  const tick = { fill: colors.tick, fontSize: 12 };
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 16, right: 16, bottom: 0, left: -16 }}>
        <CartesianGrid stroke={colors.grid} vertical={false} />
        <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={{ stroke: colors.line }} tickMargin={10} interval="preserveStartEnd" />
        <YAxis tick={tick} tickLine={false} axisLine={false} tickCount={5} width={48} />
        <Tooltip
          cursor={{ stroke: colors.border }}
          contentStyle={{ background: colors.tooltip, border: `1px solid ${colors.border}`, borderRadius: 8, color: colors.ink, fontSize: 12 }}
          labelStyle={{ color: colors.ink, fontWeight: 500 }}
        />
        <Line name="Templates Created" type="monotone" dataKey="value" stroke={colors.line} strokeWidth={2} dot={{ r: 3, fill: colors.line, strokeWidth: 0 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function CategoryDonut({ slices, total }) {
  const colors = useChartPalette();
  return (
    <div className="rp-donut">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={slices} dataKey="count" nameKey="name" innerRadius="52%" outerRadius="100%" startAngle={90} endAngle={-270} stroke={colors.ring} strokeWidth={2} isAnimationActive={false}>
            {slices.map((slice) => (
              <Cell key={slice.name} fill={slice.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="rp-donut-center" aria-hidden="true">
        <strong>{total.toLocaleString()}</strong>
        <span>Total</span>
      </div>
    </div>
  );
}

function downloadCsv(filename, rows) {
  const escape = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const csv = rows.map((row) => row.map(escape).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const { templates, users } = useDashboardData();
  const [range, setRange] = useState("week");
  const [granularity, setGranularity] = useState("daily");
  const selectId = useId();
  const period = ranges[range];

  const pending = templates.filter((t) => t.status === "pending").length;
  const stats = [
    { label: "Total Users", value: users.length, icon: Users, tone: "purple" },
    { label: "Total template", value: templates.length, icon: FileText, tone: "purple", knockout: true },
    { label: "Public Template", value: templates.filter((t) => t.visibility === "public").length, icon: Check, tone: "green", outline: true },
    { label: "Pending Review", value: pending, icon: Clock, tone: "yellow", knockout: true },
    { label: "Reported Templates", value: templates.filter((t) => t.status === "rejected").length, icon: Flag, tone: "red" },
    { label: "Templates Downloads", value: period.downloads, icon: CloudDownload, tone: "blue", outline: true },
  ];

  // Five biggest categories, the rest folded into "Others".
  const slices = useMemo(() => {
    const counts = {};
    templates.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 5);
    const rest = sorted.slice(5).reduce((sum, [, count]) => sum + count, 0);
    const list = rest ? [...top, ["Others", rest]] : top;
    return list.map(([name, count], index) => ({ name, count, color: categoryColors[index] }));
  }, [templates]);
  const total = templates.length;
  const chartData = period[granularity].map(([label, value]) => ({ label, value }));

  const exportReport = () =>
    downloadCsv(`visora-report-${range}.csv`, [
      ["Visora report", period.label],
      [],
      ["Metric", "Value"],
      ...stats.map((s) => [s.label, s.value]),
      [],
      ["Category", "Templates", "Share"],
      ...slices.map((s) => [s.name, s.count, `${((s.count / total) * 100).toFixed(1)}%`]),
      [],
      ["Top template", "Category", "Downloads", "Views"],
      ...topTemplates.map((t) => [t.name, t.category, t.downloads, t.views]),
    ]);

  return (
    <div className="ad-page rp-page">
      <div className="rp-actions">
        <label className="ad-control rp-range">
          <CalendarDays size={16} className="rp-range-icon" aria-hidden="true" />
          <span className="sr-only">Date range</span>
          <select
            value={range}
            onChange={(event) => {
              setRange(event.target.value);
              if (!ranges[event.target.value].weekly) setGranularity("daily");
            }}
          >
            {Object.entries(ranges).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
          <ChevronDown size={16} strokeWidth={2.5} aria-hidden="true" />
        </label>
        <button type="button" className="ad-button rp-export" onClick={exportReport}>
          <FileUp size={16} fill="currentColor" strokeWidth={1.5} aria-hidden="true" /> Export
        </button>
      </div>

      <StatCards items={stats} label="Report totals" />

      <section className="rp-row rp-row-charts">
        <article className="ad-card rp-card rp-created">
          <header className="rp-card-head">
            <h2><i className="rp-dot" aria-hidden="true" />Templates Created</h2>
            <label className="ad-control rp-small-select" htmlFor={selectId}>
              <span className="sr-only">Group by</span>
              <select id={selectId} value={granularity} onChange={(event) => setGranularity(event.target.value)}>
                <option value="daily">Daily</option>
                <option value="weekly" disabled={!period.weekly}>Weekly</option>
              </select>
              <ChevronDown size={14} strokeWidth={3} aria-hidden="true" />
            </label>
          </header>
          <div className="rp-line">
            <TemplatesCreatedChart data={chartData} />
          </div>
        </article>

        <article className="ad-card rp-card rp-categories">
          <header className="rp-card-head">
            <h2>Templates by Category</h2>
            <Link to="/dashboard/categories">View All</Link>
          </header>
          <div className="rp-categories-body">
            <CategoryDonut slices={slices} total={total} />
            <table className="rp-legend">
              <caption className="sr-only">Templates by category</caption>
              <tbody>
                {slices.map((slice) => (
                  <tr key={slice.name}>
                    <th scope="row">
                      <i style={{ background: slice.color }} aria-hidden="true" />
                      {slice.name}
                    </th>
                    <td>{((slice.count / total) * 100).toFixed(1)}%</td>
                    <td>{slice.count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="rp-row rp-row-bottom">
        <article className="ad-card rp-card rp-top">
          <table className="rp-top-table">
            <thead>
              <tr>
                <th scope="col" colSpan={2} className="rp-top-title">Top Templates (By Downloads)</th>
                <th scope="col" className="is-center">Category</th>
                <th scope="col" className="is-num">Downloads</th>
                <th scope="col" className="is-num">Views</th>
              </tr>
            </thead>
            <tbody>
              {topTemplates.map((t, index) => {
                const StateIcon = stateIcon[t.state];
                return (
                  <tr key={t.name}>
                    <td className="rp-rank">{index + 1}</td>
                    <td>
                      <div className="rp-template">
                        <img src={t.image} alt="" />
                        <div>
                          <strong>{t.name}</strong>
                          <span>
                            <StateIcon size={13} strokeWidth={2.5} fill={t.state === "Pending" ? "currentColor" : "none"} className={t.state === "Pending" ? "is-knockout" : undefined} aria-hidden="true" />
                            {t.state}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td data-label="Category" className="is-center">
                      <span className="ad-pill purple tinted rp-pill">{t.category}</span>
                    </td>
                    <td data-label="Downloads" className="is-num">{t.downloads.toLocaleString()}</td>
                    <td data-label="Views" className="is-num">{t.views.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </article>

        <aside className="rp-links">
          <h2>Reports Overview</h2>
          {reportLinks.map(([title, description]) => (
            <button type="button" key={title} className="rp-link" aria-disabled="true" title="Coming soon">
              <span>
                <strong>{title}</strong>
                <small>{description}</small>
              </span>
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          ))}
        </aside>
      </section>
    </div>
  );
}
