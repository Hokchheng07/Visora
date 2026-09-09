import {
  Activity,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  LayoutTemplate,
  ShieldAlert,
  Users,
  X,
  Layers3,
} from "lucide-react";
import { useState } from "react";
import "./portal.css";
import "./dashboard-polish.css";
import { useDashboardData } from "./dashboardData";
import { Clock2 } from 'lucide-react';
const activityData = {
  "Last 7 days": [18, 19, 20, 21, 22, 23, 24],
  "Last 30 days": [1, 5, 10, 15, 20, 25, 30],
};
const reportRows = [
  ["Creative Portfolio", "Channa", "2 hours ago", "Under Review", "purple"],
  ["Frontend examination", "Channay", "3 hours ago", "Resolved", "blue"],
  ["Backend examination", "Channy", "8 hours ago", "Under Review", "orange"],
];
function Thumb({ shade = "purple" }) {
  return (
    <span className={`template-thumb ${shade}`}>
      <i />
      <b />
      <em />
    </span>
  );
}
function Action({ kind, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`portal-button dashboard-action ${kind || ""}`}
    >
      {children}
    </button>
  );
}
function ActivityChart({ period }) {
  const dates = activityData[period];
  return (
    <div className="activity-chart">
      <div className="chart-y left !text-[12px] mt-5">
        <span>200</span>
        <span>150</span>
        <span>100</span>
        <span>50</span>
        <span>0</span>
      </div>
      <div className="line-chart">
        <div className="chart-grid" />
        <svg viewBox="0 0 680 180" preserveAspectRatio="none">
          <path
            className="line-fill"
            d="M0 144 C60 128 75 142 125 115 S185 94 220 113 S281 132 327 82 S395 77 435 95 S500 61 540 73 S605 30 680 42 V180 H0Z"
          />
          <path
            className="line-main"
            d="M0 144 C60 128 75 142 125 115 S185 94 220 113 S281 132 327 82 S395 77 435 95 S500 61 540 73 S605 30 680 42"
          />
          <path
            className="line-secondary"
            d="M0 155 C68 148 80 135 125 140 S182 112 220 124 S282 114 327 130 S389 90 435 108 S505 98 540 83 S608 70 680 78"
          />
          {[0, 125, 220, 327, 435, 540, 680].map((cx, i) => (
            <circle
              key={cx}
              cx={cx}
              cy={[144, 115, 113, 82, 95, 73, 42][i]}
              r="3.5"
              className="chart-point"
            />
          ))}
        </svg>
        <div className="chart-labels">
          {dates.map((day) => (
            <span className="text-[12px]" key={day}>May {day}</span>
          ))}
        </div>
      </div>
      <div className="chart-y left !text-[12px] mt-5">
        <span>80</span>
        <span>60</span>
        <span>40</span>
        <span>20</span>
        <span>0</span>
      </div>
    </div>
  );
}
export default function AdminDashboard() {
  const { templates, users, categories, updateTemplate } = useDashboardData();
  const [period, setPeriod] = useState("Last 7 days");
  const [openPeriod, setOpenPeriod] = useState(false);
  const pending = templates.filter((t) => t.status === "pending").slice(0, 3);
  const stats = [
    ["Total User", users.length, Users, "purple"],
    ["Total Template", templates.length, LayoutTemplate, "yellow"],
    [
      "Public Template",
      templates.filter((t) => t.visibility === "public").length,
      Eye,
      "green",
    ],
    [
      "Pending Review",
      templates.filter((t) => t.status === "pending").length,
      Activity,
      "blue",
    ],
    [
      "Report Template",
      templates.filter((t) => t.status === "rejected").length,
      ShieldAlert,
      "red",
    ],
  ];
  return (
    <div className="dashboard-content portal admin-dashboard">
      <section className="portal-stats">
        {stats.map(([name, value, Icon, color]) => (
          <article key={name}>
            <span className={`portal-stat-icon ${color}`}>
              <Icon size={19} />
            </span>
            <div>
              <p>{name}</p>
              <strong>{value}</strong>
            </div>
          </article>
        ))}
      </section>
      <section className="portal-split review-split">
        <article className="portal-card pending-card">
          <header>
            <div className="card-title-icon">
              <span>
                <Layers3 size={20} />
              </span>
              <div>
                <h3 className="text-blue-500 font-semibold">Pending Templates Review</h3>
                <p>Templates waiting for your approval</p>
              </div>
            </div>
            <a className="!text-[13px] font-semibold">
              View all pending review <ChevronRight size={15} />
            </a>
          </header>
          {pending.map((t) => (
            <div className="review-row" key={t.id}>
              <Thumb shade={t.shade} />
              {/* <img src={t.image} alt={t.name} className="template-image" /> */}
              <div className="review-copy">
                <strong className="!text-[13px] font-bold">{t.name}</strong>
                <span className="!text-[11px]">by {t.creator}</span>
                <span className="!text-[10px]">Submitted {t.createdTime}</span>
              </div>
              <small className="category-tag">{t.category}</small>
              <div className="row-actions">
                <Action
                  kind="approve"
                  onClick={() => updateTemplate(t.id, { status: "published" })}
                >
                  <Check size={14} />
                  Approve
                </Action>
                <Action
                  kind="reject"
                  onClick={() => updateTemplate(t.id, { status: "rejected" })}
                >
                  <X size={14} />
                  Reject
                </Action>
                <Action kind="preview">
                  <Eye size={15} />
                  Preview
                </Action>
              </div>
            </div>
          ))}
        </article>
        <article className="portal-card recent-users">
          <header>
            <div className="card-title-icon">
              <span>
                <Users size={22} />
              </span>
              <div>
                <h3 className="text-blue-500 font-semibold">Recent User</h3>
                <p>Newly joined members</p>
              </div>
            </div>
            <a className="!text-[13px] font-semibold">
              View all users <ChevronRight size={15} />
            </a>
          </header>
          {users.slice(0, 5).map((u) => (
            <div className="user-row" key={u.id}>
              <span className="gray-avatar">
                {u.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </span>
              <div>
                <strong className="!text-[12px] font-semibold">{u.name}</strong>
                <small className="!text-[10px]">{u.email}</small>
              </div>
              <b className="!text-[12px]">User</b>
            </div>
          ))}
        </article>
      </section>
      <section className="dashboard-bottom">
        <div className="dashboard-left-stack">
          <article className="portal-card categories-card">
            <header>
              <div className="card-title-icon">
              <span>
                <Layers3 size={20} />
              </span>
              <div>
                <h3 className="text-blue-500 font-semibold">Template Categories</h3>
                <p>Templates grouped by category</p>
              </div>
            </div>
            <a className="!text-[13px] font-semibold">
              View all <ChevronRight size={15} />
            </a>
            </header>
            <div className="category-tiles">
              {categories.slice(0, 4).map((name, index) => (
                <div
                  className={["exam", "work", "grad", "event"][index]}
                  key={name}
                >
                  <span>{name[0]}</span>
                  <strong>{name}</strong>
                  <small>
                    {templates.filter((t) => t.category === name).length}
                  </small>
                </div>
              ))}
            </div>
            
          </article>
          <article className="portal-card reports-list">
            <header>
              <div>
                <h3 className="flex gap-2 text-blue-500 font-semibold"><Clock2 />Reports Overview</h3>
                <p>Recently reported templates</p>
              </div>
            </header>
            {reportRows.map(([name, creator, time, status, shade]) => (
              <div className="report-row" key={name}>
                <Thumb shade={shade} />
                <div>
                  <strong className="!text-[13px]">{name}</strong>
                  <small>
                    by {creator} · {time}
                  </small>
                </div>
                <b className={status === "Resolved" ? "resolved" : "reviewing"} className="border border-accent text-yellow-500 !text-[12px]">
                  {status}
                </b>
              </div>
            ))}
          </article>
        </div>
        <article className="portal-card platform-activity">
          <header>
            <div>
              <h3 className="flex gap-2 text-blue-500"><Clock2 />Platform Activity</h3>
              <p>New users and templates published</p>
            </div>
            <div className="period-picker">
              <button className="!text-[12px]" onClick={() => setOpenPeriod(!openPeriod)}>
                {period}
                <ChevronDown size={15} />
              </button>
              {openPeriod && (
                <div>
                  {Object.keys(activityData).map((value) => (
                    <button
                      key={value}
                      onClick={() => {
                        setPeriod(value);
                        setOpenPeriod(false);
                      }}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </header>
          <div className="legend">
            <span className="legend-item text-[14px]">
              <i className="purple-dot" />
              New Users
            </span>
            <span className="legend-item text-[14px]">
              <i className="orange-dot" />
              Templates Published
            </span>
          </div>
          <ActivityChart period={period} />
        </article>
      </section>
    </div>
  );
}
