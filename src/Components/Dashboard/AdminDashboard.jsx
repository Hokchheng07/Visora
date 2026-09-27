import {
  Check,
  ChevronDown,
  Clock,
  Eye,
  Flag,
  Globe,
  Layers,
  Radar,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import ActivityChart from "./ActivityChart";
import { CardHeader, ReviewQueueEmptyState, StatCards, UserAvatar } from "./AdminUi";
import { useDashboardData } from "./dashboardData";
import { useReviewQueue, useServerTemplates } from "./useReviewQueue";
import { useUserDirectory } from "./useUserDirectory";
import { categoryIcon } from "./categoryIcons";
import { useGetCategoriesQuery } from "../API/categoryApi";
import creativePortfolio from "../../assets/pages/admin/dashboard/pending-review/creative-portfolio.png";
import frontendExam from "../../assets/pages/admin/dashboard/pending-review/frontend-exam.png";
import backendExam from "../../assets/pages/admin/dashboard/pending-review/backend-exam.png";
import "./admin-dashboard.css";

// Seed templates have no preview images yet; these Figma exports stand in.
const sampleThumbs = [creativePortfolio, frontendExam, backendExam];

const reportImages = { creativePortfolio, frontendExam, backendExam };

export default function AdminDashboard() {
  const { users, categories, reports, activity: activityData, stats: apiStats, loading, error } = useDashboardData();
  // Real submissions (from the editor) first, then the samples — the same queue as the Pending page.
  const navigate = useNavigate();
  const { submissions, decide, serverError } = useReviewQueue();
  // Every real template, any state, for the totals and category counts.
  const { rows: templates } = useServerTemplates();
  // Icons the admin picked, by category name, for the tiles below.
  const { data: categoryPage } = useGetCategoriesQuery();
  const savedIcons = new Map((categoryPage?.data?.contents || []).map((category) => [category.name, category.icon]));
  // Real accounts, newest first; the samples only while the server has none to show.
  const directory = useUserDirectory();
  const recentPeople = directory.people.length
    ? [...directory.people].sort((a, b) => `${b.createdAt}`.localeCompare(`${a.createdAt}`)).slice(0, 5)
    : users.slice(0, 5).map((u) => ({ uuid: u.id, name: u.name, email: u.email, role: "User" }));
  const [period, setPeriod] = useState("Last 7 days");
  if (loading) return <div className="ad-page"><p className="ad-empty">Loading dashboard data…</p></div>;
  if (error) return <div className="ad-page"><p className="ad-empty">Failed to load dashboard data.</p></div>;
  const pending = submissions.slice(0, 3);
  const periods = Object.keys(activityData);
  const selectedPeriod = activityData[period] ? period : periods[0];
  const activity = activityData[selectedPeriod];
  const chartData = activity.points;

  const stats = [
    { label: "Total User", value: apiStats?.totalUsers ?? users.length, icon: Users, tone: "purple" },
    // Counted from the real templates: every state, approved (on the Templates page), waiting.
    { label: "Total Template", value: templates.length, icon: Layers, tone: "yellow" },
    { label: "Public Template", value: templates.filter((t) => t.status === "published").length, icon: Globe, tone: "purple", knockout: true },
    { label: "Pending Review", value: submissions.length, icon: Clock, tone: "yellow", knockout: true },
    { label: "Report Template", value: apiStats?.reportedTemplates ?? 0, icon: Flag, tone: "red" },
  ];

  return (
    <div className="ad-page">
      <StatCards items={stats} label="Platform totals" />

      <section className="ad-row ad-row-top">
        <article className="ad-card ad-pending">
          <CardHeader icon={Layers} title="Pending Templates Review" linkLabel="View all pending review" to="/dashboard/pending" />
          {serverError && <p className="ad-empty" role="status">{serverError}</p>}
          {pending.length === 0 ? (
            <ReviewQueueEmptyState compact />
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
                    <button type="button" className="ad-action approve" onClick={() => decide(t, "published")}>
                      <Check size={14} strokeWidth={3} aria-hidden="true" /> Approve
                    </button>
                    <button type="button" className="ad-action reject" onClick={() => decide(t, "rejected")}>
                      <X size={14} strokeWidth={3} aria-hidden="true" /> Reject
                    </button>
                    {/* The Pending page opens this template's preview (see PendingReview). */}
                    <button type="button" className="ad-action preview" onClick={() => navigate("/dashboard/pending", { state: { preview: t.remoteId } })}>
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
            {recentPeople.map((u) => (
              <li className="ad-user" key={u.uuid}>
                <UserAvatar size={40} person={u} />
                <div>
                  <h3>{u.name}</h3>
                  <p>{u.email}</p>
                </div>
                <b>{u.role ? u.role[0] + u.role.slice(1).toLowerCase() : "User"}</b>
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
                const Icon = categoryIcon(name, savedIcons.get(name));
                return (
                  <li className={index % 2 ? "yellow" : "purple"} key={name}>
                    <Icon size={24} fill="currentColor" strokeWidth={1.4} aria-hidden="true" />
                    <span>{name}</span>
                    <strong>{templates.filter((t) => (t.categories || [t.category]).includes(name)).length}</strong>
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
