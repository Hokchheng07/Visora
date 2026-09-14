import {
  Award,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleUserRound,
  Clock,
  Eye,
  Flag,
  Globe,
  GraduationCap,
  Layers,
  Network,
  Presentation,
  Radar,
  Shapes,
  Tent,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import ActivityChart from "./ActivityChart";
import { CardHeader, StatCards } from "./AdminUi";
import { useDashboardData } from "./dashboardData";
import creativePortfolio from "../../assets/pages/admin/dashboard/pending-review/creative-portfolio.png";
import frontendExam from "../../assets/pages/admin/dashboard/pending-review/frontend-exam.png";
import backendExam from "../../assets/pages/admin/dashboard/pending-review/backend-exam.png";
import "./admin-dashboard.css";

// Seed templates have no preview images yet; these Figma exports stand in.
const sampleThumbs = [creativePortfolio, frontendExam, backendExam];

const reportImages = { creativePortfolio, frontendExam, backendExam };

const categoryIcons = {
  Examination: GraduationCap,
  Workshop: Network,
  Graduation: Award,
  "Khmer Events": Tent,
  Events: Tent,
  Seminar: Presentation,
  Portfolio: BriefcaseBusiness,
  Competition: Trophy,
};

export default function AdminDashboard() {
  const { templates, users, categories, reports, activity: activityData, stats: apiStats, loading, error, updateTemplate } = useDashboardData();
  const [period, setPeriod] = useState("Last 7 days");
  if (loading) return <div className="ad-page"><p className="ad-empty">Loading dashboard data…</p></div>;
  if (error) return <div className="ad-page"><p className="ad-empty">Failed to load dashboard data.</p></div>;
  const pendingTemplates = templates.filter((t) => t.status === "pending");
  const pending = pendingTemplates.slice(0, 3);
  const periods = Object.keys(activityData);
  const selectedPeriod = activityData[period] ? period : periods[0];
  const activity = activityData[selectedPeriod];
  const chartData = activity.points;

  const stats = [
    { label: "Total User", value: apiStats.totalUsers, icon: Users, tone: "purple" },
    { label: "Total Template", value: apiStats.totalTemplates, icon: Layers, tone: "yellow" },
    { label: "Public Template", value: apiStats.publicTemplates, icon: Globe, tone: "purple", knockout: true },
    { label: "Pending Review", value: apiStats.pendingReview, icon: Clock, tone: "yellow", knockout: true },
    { label: "Report Template", value: apiStats.reportedTemplates, icon: Flag, tone: "red" },
  ];

  return (
    <div className="ad-page">
      <StatCards items={stats} label="Platform totals" />

      <section className="ad-row ad-row-top">
        <article className="ad-card ad-pending">
          <CardHeader icon={Layers} title="Pending Templates Review" linkLabel="View all pending review" to="/dashboard/pending" />
          {pending.length === 0 ? (
            <p className="ad-empty">No templates are waiting for review.</p>
          ) : (
            <ul className="ad-list">
              {pending.map((t, index) => (
                <li className="ad-review" key={t.id}>
                  <img className="ad-thumb" src={t.image || sampleThumbs[index % sampleThumbs.length]} alt="" />
                  <div className="ad-review-copy">
                    <h3>{t.name}</h3>
                    <p>by {t.creator}</p>
                    <p className="ad-review-meta">
                      <span>Submitted {t.createdTime}</span>
                      <span className="ad-chip">{t.category}</span>
                    </p>
                  </div>
                  <div className="ad-review-actions">
                    <button type="button" className="ad-action approve" onClick={() => updateTemplate(t.id, { status: "published" })}>
                      <Check size={14} strokeWidth={3} aria-hidden="true" /> Approve
                    </button>
                    <button type="button" className="ad-action reject" onClick={() => updateTemplate(t.id, { status: "rejected" })}>
                      <X size={14} strokeWidth={3} aria-hidden="true" /> Reject
                    </button>
                    <button type="button" className="ad-action preview">
                      <Eye size={14} aria-hidden="true" /> Preview
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="ad-card ad-users">
          <CardHeader icon={Users} title="Recent User" linkLabel="View all users" to="/dashboard/users" />
          <ul className="ad-list">
            {users.slice(0, 5).map((u) => (
              <li className="ad-user" key={u.id}>
                <CircleUserRound className="ad-user-avatar" size={40} strokeWidth={1.3} aria-hidden="true" />
                <div>
                  <h3>{u.name}</h3>
                  <p>{u.email}</p>
                </div>
                <b>User</b>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="ad-row ad-row-bottom">
        <div className="ad-stack">
          <article className="ad-card ad-categories">
            <CardHeader icon={Layers} title="Templates Categories" linkLabel="View all" to="/dashboard/categories" />
            <ul className="ad-category-tiles">
              {categories.slice(0, 4).map((name, index) => {
                const Icon = categoryIcons[name] || Shapes;
                return (
                  <li className={index % 2 ? "yellow" : "purple"} key={name}>
                    <Icon size={24} fill="currentColor" strokeWidth={1.4} aria-hidden="true" />
                    <span>{name}</span>
                    <strong>{templates.filter((t) => t.category === name).length}</strong>
                  </li>
                );
              })}
            </ul>
          </article>

          <article className="ad-card ad-reports">
            <CardHeader icon={Clock} title="Reports Overview" linkLabel="View all" to="/dashboard/report" filled={false} />
            <ul className="ad-list">
              {reports.map((row) => (
                <li className="ad-report" key={row.id}>
                  <img className="ad-thumb small" src={reportImages[row.imageKey] || creativePortfolio} alt="" />
                  <div className="ad-report-copy">
                    <h3>{row.name}</h3>
                    <p>by {row.creator}</p>
                    <p>Submitted {row.time}</p>
                  </div>
                  <div className="ad-report-status">
                    <time>{row.date}</time>
                    <span className={`ad-status ${row.status === "Resolved" ? "resolved" : "reviewing"}`}>{row.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <article className="ad-activity">
          <header className="ad-activity-head">
            <h2>
              <Radar size={28} strokeWidth={1.8} aria-hidden="true" />
              Platform Activity
            </h2>
            <label className="ad-period">
              <span className="sr-only">Time range</span>
              <select value={period} onChange={(event) => setPeriod(event.target.value)}>
                {periods.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
              <ChevronDown size={18} aria-hidden="true" />
            </label>
          </header>
          <div className="ad-legend">
            <span><i className="users" />New Users</span>
            <span><i className="templates" />Templates Published</span>
          </div>
          <div className="ad-chart">
            <ActivityChart data={chartData} usersMax={activity.usersMax} templatesMax={activity.templatesMax} />
          </div>
        </article>
      </section>
    </div>
  );
}
