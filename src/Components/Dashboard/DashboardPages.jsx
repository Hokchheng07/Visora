import { useState } from "react";
import {
  Activity,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Filter,
  LayoutTemplate,
  Plus,
  Search,
  ShieldAlert,
  Users,
  X,
  MoreHorizontal,
  FolderOpen,
  GraduationCap,
  Briefcase,
  Palette,
  Trophy,
  Shapes,
} from "lucide-react";
import { Avatar, Pagination, StatusBadge, TemplateThumb } from "./ManagementUi";
import TemplateManagement from "./TemplateManagement";
import { useDashboardData } from "./dashboardData";
import "./dashboard-pages.css";
import "./portal.css";
const ds = [
  ["Total User", "1,345", Users, "purple"],
  ["Total Template", "2,234", LayoutTemplate, "yellow"],
  ["Public Template", "2,567", Eye, "green"],
  ["Pending Review", "23", Activity, "blue"],
  ["Report Template", "12", ShieldAlert, "red"],
];
const rs = [
  ["Total Users", "1,248", Users, "purple"],
  ["Total Template", "3,462", LayoutTemplate, "yellow"],
  ["Public Template", "2,814", Eye, "green"],
  ["Pending Review", "12", Activity, "blue"],
  ["Reported Templates", "7", ShieldAlert, "red"],
  ["Templates Downloads", "18,642", Download, "orange"],
];
const templates = [
  [
    "Graduation Ceremony 2026",
    "Sok Chantha",
    "12 min ago",
    "Graduation",
    "purple",
  ],
  ["Business Seminar Blue", "Dara Vannak", "34 min ago", "Seminar", "blue"],
  ["Khmer New Year Celebration", "Srey Pich", "1 hour ago", "Events", "orange"],
];
function Intro({ title, subtitle, action }) {
  return (
    <div className="page-intro portal-intro">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
function Btn({ children, type = "outline" }) {
  return <button className={`portal-button ${type}`}>{children}</button>;
}
function Thumb({ shade = "purple" }) {
  return (
    <span className={`template-thumb ${shade}`}>
      <i />
      <b />
      <em />
    </span>
  );
}
function Stats({ items }) {
  return (
    <section className={`portal-stats ${items.length === 6 ? "six" : ""}`}>
      {items.map(([n, v, I, c]) => (
        <article key={n}>
          <span className={`portal-stat-icon ${c}`}>
            <I size={19} />
          </span>
          <div>
            <p>{n}</p>
            <strong>{v}</strong>
          </div>
        </article>
      ))}
    </section>
  );
}
function Chart({ dual = false }) {
  return (
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
        {dual && (
          <path
            className="line-secondary"
            d="M0 155 C68 148 80 135 125 140 S182 112 220 124 S282 114 327 130 S389 90 435 108 S505 98 540 83 S608 70 680 78"
          />
        )}
      </svg>
      <div className="chart-labels">
        {[18, 19, 20, 21, 22, 23, 24].map((n) => (
          <span key={n}>May {n}</span>
        ))}
      </div>
    </div>
  );
}
function Empty({ title }) {
  return (
    <div className="dashboard-empty">
      <span>
        <LayoutTemplate size={25} />
      </span>
      <strong>{title}</strong>
      <p>Content will appear here when available.</p>
    </div>
  );
}
function Toolbar({ search, select }) {
  return (
    <div className="page-toolbar">
      <label>
        <Search size={17} />
        <input placeholder={search} />
      </label>
      <div>
        <Btn>
          {select}
          <ChevronDown size={16} />
        </Btn>
        <Btn>
          <Filter size={16} />
          Filter
        </Btn>
      </div>
    </div>
  );
}
export function DashboardOverview() {
  const people = [
    ["Sok Chantha", "sok.chantha@visora.com"],
    ["Dara Vannak", "dara.vannak@visora.com"],
    ["Srey Pich", "srey.pich@visora.com"],
    ["Vuthy Keo", "vuthy.keo@visora.com"],
    ["Nita Sorn", "nita.sorn@visora.com"],
  ];
  return (
    <div className="dashboard-content page-content portal">
      <Intro title="Admin Dashboard" subtitle="Welcome back, Admin!" />
      <Stats items={ds} />
      <section className="portal-split review-split">
        <article className="portal-card pending-card">
          <header>
            <div>
              <h3>Pending Templates Review</h3>
              <p>Templates waiting for your approval</p>
            </div>
            <a>
              View all <ChevronRight size={15} />
            </a>
          </header>
          {templates.map(([t, c, time, cat, shade]) => (
            <div className="review-row" key={t}>
              <Thumb shade={shade} />
              <div className="review-copy">
                <strong>{t}</strong>
                <span>
                  By {c} · Submitted {time}
                </span>
              </div>
              <small className="category-tag">{cat}</small>
              <div className="row-actions">
                <Btn>
                  <Check size={14} />
                  Approve
                </Btn>
                <Btn>
                  <X size={14} />
                  Reject
                </Btn>
                <Btn>
                  <Eye size={14} />
                  Preview
                </Btn>
              </div>
            </div>
          ))}
        </article>
        <article className="portal-card recent-users">
          <header>
            <div>
              <h3>Recent User</h3>
              <p>Newly joined members</p>
            </div>
            <a>
              View all <ChevronRight size={15} />
            </a>
          </header>
          {people.map(([n, e]) => (
            <div className="user-row" key={e}>
              <span className="gray-avatar">
                {n
                  .split(" ")
                  .map((x) => x[0])
                  .join("")}
              </span>
              <div>
                <strong>{n}</strong>
                <small>{e}</small>
              </div>
              <b>User</b>
            </div>
          ))}
        </article>
      </section>
      <section className="portal-split lower-split">
        <article className="portal-card categories-card">
          <header>
            <div>
              <h3>Templates Categories</h3>
              <p>Templates grouped by category</p>
            </div>
          </header>
          <div className="category-tiles">
            {[
              ["Examination", "824", "exam"],
              ["Workshop", "641", "work"],
              ["Graduation", "528", "grad"],
              ["Events", "463", "event"],
            ].map(([n, c, k]) => (
              <div className={k} key={n}>
                <span>{n[0]}</span>
                <strong>{n}</strong>
                <small>{c} templates</small>
              </div>
            ))}
          </div>
        </article>
        <article className="portal-card reports-list">
          <header>
            <div>
              <h3>Reports Overview</h3>
              <p>Recently reported templates</p>
            </div>
          </header>
          {templates.map(([t, , time, , shade], i) => (
            <div className="report-row" key={t}>
              <Thumb shade={shade} />
              <div>
                <strong>{t}</strong>
                <small>{time}</small>
              </div>
              <b className={i === 1 ? "resolved" : "reviewing"}>
                {i === 1 ? "Resolved" : "Under Review"}
              </b>
            </div>
          ))}
        </article>
      </section>
      <article className="portal-card platform-activity">
        <header>
          <div>
            <h3>Platform Activity</h3>
            <p>New users and templates published</p>
          </div>
          <Btn>
            Last 7 days
            <ChevronDown size={15} />
          </Btn>
        </header>
        <div className="legend">
          <span>
            <i className="purple-dot" />
            New Users
          </span>
          <span>
            <i className="orange-dot" />
            Templates Published
          </span>
        </div>
        <Chart dual />
      </article>
    </div>
  );
}
export function TemplatesPage() {
  return <TemplateManagement />;
}
const categoryRows = [
  [
    "Examination",
    "Academic and examination templates",
    352,
    "May 24, 2024",
    "10:30 AM",
    FolderOpen,
    "lavender",
  ],
  [
    "Workshop",
    "Hands-on training and workshop designs",
    487,
    "May 22, 2024",
    "9:15 AM",
    Briefcase,
    "blue",
  ],
  [
    "Graduation",
    "Graduation ceremony and achievement templates",
    623,
    "May 19, 2024",
    "2:45 PM",
    GraduationCap,
    "yellow",
  ],
  [
    "Khmer Events",
    "Cambodian festivals and cultural event designs",
    541,
    "May 18, 2024",
    "11:20 AM",
    Shapes,
    "pink",
  ],
  [
    "Seminar",
    "Professional seminar and conference templates",
    298,
    "May 16, 2024",
    "4:30 PM",
    Users,
    "green",
  ],
  [
    "Portfolio",
    "Creative personal portfolio layouts",
    276,
    "May 14, 2024",
    "1:00 PM",
    Palette,
    "peach",
  ],
  [
    "Competition",
    "Contest, tournament and award templates",
    233,
    "May 12, 2024",
    "3:10 PM",
    Trophy,
    "cyan",
  ],
  [
    "Others",
    "Miscellaneous templates and designs",
    152,
    "May 10, 2024",
    "8:50 AM",
    LayoutTemplate,
    "gray",
  ],
];
export function CategoriesPage() {
  const { templates } = useDashboardData();
  const [query, setQuery] = useState("");
  const rows = categoryRows.filter(([name]) =>
    name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="dashboard-content page-content management-page">
      <div className="management-toolbar category-toolbar">
        <label className="search-control">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search template by name or creator..."
          />
        </label>
        <div className="toolbar-controls">
          <button>
            Sort by Newest <ChevronDown size={15} />
          </button>
          <button aria-label="Filter">
            <Filter size={16} />
          </button>
        </div>
      </div>
      <div className="management-card table-scroll">
        <div className="management-table categories-table">
          <div className="management-head">
            <span>Category</span>
            <span>Description</span>
            <span>Templates</span>
            <span>Status</span>
            <span>Created At</span>
            <span>Actions</span>
          </div>
          {rows.map(([name, description, , date, time, Icon, tone]) => (
            <div className="management-row" key={name}>
              <div className="category-name">
                <span className={`category-icon ${tone}`}>
                  <Icon size={19} />
                </span>
                <strong>{name}</strong>
              </div>
              <p>{description}</p>
              <a className="count-link">
                {templates.filter((t) => t.category === name).length}
              </a>
              <StatusBadge status="Active" />
              <div className="date-cell">
                <strong>{date}</strong>
                <small>{time}</small>
              </div>
              <button className="menu-button">
                <MoreHorizontal size={19} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <Pagination
        text={`Showing 1 to ${rows.length} of ${rows.length} categories`}
      />
    </div>
  );
}
const pendingRows = [
  [
    "Graduation Ceremony 2026",
    "Celebrate success with an elegant ceremony design.",
    "Sok Chantha",
    "sok.chantha@visora.com",
    "Graduation",
    "May 24, 2024",
    "10:30 AM",
    "yellow",
  ],
  [
    "Workshop on AI",
    "A modern poster for artificial intelligence workshops.",
    "Dara Vannak",
    "dara.vannak@visora.com",
    "Workshop",
    "May 24, 2024",
    "9:15 AM",
    "blue",
  ],
  [
    "Khmer New Year Celebration",
    "A joyful cultural celebration announcement.",
    "Srey Pich",
    "srey.pich@visora.com",
    "Khmer Events",
    "May 23, 2024",
    "4:45 PM",
    "pink",
  ],
  [
    "Certificate of Achievement",
    "Recognize achievement with a clean certificate.",
    "Vuthy Keo",
    "vuthy.keo@visora.com",
    "Examination",
    "May 23, 2024",
    "2:20 PM",
    "violet",
  ],
  [
    "Business Seminar Beige",
    "An understated design for a business seminar.",
    "Nita Sorn",
    "nita.sorn@visora.com",
    "Seminar",
    "May 22, 2024",
    "11:05 AM",
    "peach",
  ],
  [
    "Creative Portfolio Red",
    "A bold portfolio layout for creative work.",
    "Bora Chea",
    "bora.chea@visora.com",
    "Portfolio",
    "May 22, 2024",
    "8:40 AM",
    "red",
  ],
  [
    "Children’s Day Celebration",
    "A bright, playful celebration invitation.",
    "Ratha Kim",
    "ratha.kim@visora.com",
    "Others",
    "May 21, 2024",
    "5:15 PM",
    "green",
  ],
];
export function PendingPage() {
  const { templates, updateTemplate } = useDashboardData();
  const [tab, setTab] = useState("All");
  const rows = templates.filter((t) => t.status === "pending");
  return (
    <div className="dashboard-content page-content management-page">
      <div className="management-toolbar pending-toolbar">
        <div className="management-tabs">
          {[
            ["All", templates.length],
            ["Templates", rows.length],
          ].map(([name, count]) => (
            <button
              key={name}
              className={tab === name ? "active" : ""}
              onClick={() => setTab(name)}
            >
              {name} <span>({count})</span>
            </button>
          ))}
        </div>
        <div className="toolbar-controls">
          <button>
            Sort by Newest <ChevronDown size={15} />
          </button>
          <button aria-label="Filter">
            <Filter size={16} />
          </button>
        </div>
      </div>
      <div className="management-card table-scroll">
        <div className="management-table pending-table">
          <div className="management-head">
            <span>Template</span>
            <span>Submitted By</span>
            <span>Category</span>
            <span>Submitted At</span>
            <span>Actions</span>
          </div>
          {rows.map((t) => (
            <div className="management-row" key={t.id}>
              <div className="pending-template">
                <TemplateThumb shade={t.shade} label={t.name} />
                <div>
                  <strong>{t.name}</strong>
                  <small>{t.description}</small>
                  <b>Template</b>
                </div>
              </div>
              <div className="person">
                <Avatar name={t.creator} />
                <div>
                  <strong>{t.creator}</strong>
                  <small>{t.email}</small>
                </div>
              </div>
              <span className="outlined-tag">{t.category}</span>
              <div className="date-cell">
                <strong>{t.createdAt}</strong>
                <small>{t.createdTime}</small>
              </div>
              <div className="pending-actions">
                <button
                  className="approve"
                  onClick={() => updateTemplate(t.id, { status: "published" })}
                >
                  <Check size={13} />
                  Approve
                </button>
                <button
                  className="reject"
                  onClick={() => updateTemplate(t.id, { status: "rejected" })}
                >
                  <X size={13} />
                  Reject
                </button>
                <button>
                  <Eye size={13} />
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Pagination
        text={`Showing 1 to ${rows.length} of ${rows.length} results`}
      />
    </div>
  );
}
export function ReportPage() {
  const rows = [
    [
      "Graduation Ceremony 2026",
      "Public",
      "Graduation",
      "2,856",
      "12,464",
      "purple",
    ],
    ["Business Seminar Blue", "Public", "Seminar", "2,144", "10,832", "blue"],
    [
      "Khmer New Year Celebration",
      "Private",
      "Events",
      "1,976",
      "9,420",
      "orange",
    ],
    [
      "Final Examination Template",
      "Pending",
      "Examination",
      "1,842",
      "8,203",
      "green",
    ],
    [
      "Workshop on Creative Design",
      "Public",
      "Workshop",
      "1,706",
      "7,554",
      "yellow",
    ],
  ];
  return (
    <div className="dashboard-content page-content portal report-page">
      <Intro
        title="Reports"
        subtitle="Track and analyze platform performance and activities"
        action={
          <div className="report-actions">
            <Btn>
              <CalendarDays size={16} />
              May 18, 2024 – May 24, 2024
            </Btn>
            <Btn type="primary">
              <Download size={16} />
              Export
            </Btn>
          </div>
        }
      />
      <Stats items={rs} />
      <section className="portal-split analytics-split">
        <article className="portal-card templates-chart">
          <header>
            <div>
              <h3>Templates Created</h3>
              <p>Template creation trend</p>
            </div>
            <Btn>
              Daily
              <ChevronDown size={15} />
            </Btn>
          </header>
          <div className="tooltip">
            May 22 <b>624 templates</b>
          </div>
          <Chart />
        </article>
        <article className="portal-card donut-card">
          <header>
            <div>
              <h3>Templates by Category</h3>
              <p>Distribution of all templates</p>
            </div>
          </header>
          <div className="donut-wrap">
            <div className="donut">
              <strong>3,462</strong>
              <span>Total templates</span>
            </div>
            <div className="donut-legend">
              {[
                ["Examination", "35.2% / 1,219", "purple"],
                ["Workshop", "18.7% / 647", "blue"],
                ["Graduation", "17.9% / 620", "orange"],
                ["Khmer Events", "15.6% / 540", "green"],
                ["Seminar", "8.6% / 298", "pink"],
                ["Others", "3.9% / 138", "gray"],
              ].map(([n, v, c]) => (
                <p key={n}>
                  <i className={c} />
                  <span>{n}</span>
                  <b>{v}</b>
                </p>
              ))}
            </div>
          </div>
        </article>
      </section>
      <section className="portal-split table-split">
        <article className="portal-card top-templates">
          <header>
            <div>
              <h3>
                Top Templates <span>(By Downloads)</span>
              </h3>
              <p>Most popular templates this period</p>
            </div>
          </header>
          <div className="top-head">
            <span>Template</span>
            <span>Status</span>
            <span>Category</span>
            <span>Downloads</span>
            <span>Views</span>
          </div>
          {rows.map(([n, s, c, d, v, shade], i) => (
            <div className="top-row" key={n}>
              <div>
                <b>{i + 1}</b>
                <Thumb shade={shade} />
                <strong>{n}</strong>
              </div>
              <span className={`status ${s.toLowerCase()}`}>{s}</span>
              <span className="category-tag">{c}</span>
              <span>{d}</span>
              <span>{v}</span>
            </div>
          ))}
        </article>
        <aside className="reports-actions">
          <h3>Reports Overview</h3>
          {[
            ["Audit Log Report", "Review changes and administrative actions."],
            [
              "User Activities Report",
              "Explore user activity across the platform.",
            ],
            ["Submission Report", "Track submitted templates and reviews."],
          ].map(([t, d]) => (
            <button key={t}>
              <span>
                <FileText size={20} />
              </span>
              <div>
                <strong>{t}</strong>
                <small>{d}</small>
              </div>
              <ChevronRight size={19} />
            </button>
          ))}
        </aside>
      </section>
    </div>
  );
}
