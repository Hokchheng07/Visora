import { useMemo, useState } from "react";
import { Check, ChevronDown, Eye, FileText, Funnel, X } from "lucide-react";
import { Modal, Pagination, UserAvatar, formatDate } from "./AdminUi";
import { useDashboardData } from "./dashboardData";
import happyGraduation from "../../assets/pages/admin/pending/review-table/happy-graduation.png";
import workshopOnAi from "../../assets/pages/admin/pending/review-table/workshop-on-ai.png";
import khmerNewYear from "../../assets/pages/admin/pending/review-table/khmer-new-year.png";
import certificate from "../../assets/pages/admin/pending/review-table/certificate-of-achievement.png";
import businessSeminar from "../../assets/pages/admin/pending/review-table/business-seminar-beige.png";
import creativePortfolio from "../../assets/pages/admin/pending/review-table/creative-portfolio-red.png";
import childrensDay from "../../assets/pages/admin/pending/review-table/childrens-day.png";
import "./admin-pending.css";

// Seed templates have no preview images or real descriptions yet; these
// Figma exports and copy stand in, picked by category.
const previewByCategory = {
  Graduation: happyGraduation,
  Workshop: workshopOnAi,
  "Khmer Events": khmerNewYear,
  Examination: certificate,
  Seminar: businessSeminar,
  Portfolio: creativePortfolio,
  Others: childrensDay,
};
const descriptionByCategory = {
  Graduation: "A modern graduation backdrop template with purple and gold theme.",
  Workshop: "Tech workshop template with clean blue design.",
  "Khmer Events": "Traditional Khmer New Year template with cultural elements.",
  Examination: "Elegant certificate template with gold accents.",
  Seminar: "Minimal and professional seminar template.",
  Portfolio: "Bold portfolio presentation template in red and white.",
  Others: "Fun and colorful template for children's day events.",
};
const categoryTone = {
  Graduation: "purple tinted",
  Workshop: "purple tinted",
  "Khmer Events": "green",
  Examination: "yellow",
  Seminar: "purple",
  Portfolio: "red",
  Others: "green",
};
const perPage = 7;

export default function PendingReview() {
  const { templates, updateTemplate } = useDashboardData();
  const [tab, setTab] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState(null);

  // Only templates can be submitted today, so both tabs show the same queue.
  // "All" is where other submission types will be added later.
  const pending = useMemo(
    () =>
      templates
        .filter((t) => t.status === "pending")
        .sort((a, b) => {
          const order = `${a.createdAt}`.localeCompare(`${b.createdAt}`);
          return sort === "oldest" ? order : -order;
        }),
    [templates, sort],
  );
  const tabs = [
    ["all", "All", pending.length],
    ["templates", "Templates", pending.length],
  ];

  const pageCount = Math.ceil(pending.length / perPage);
  const currentPage = Math.min(page, Math.max(pageCount, 1));
  const shown = pending.slice((currentPage - 1) * perPage, currentPage * perPage);
  const previewFor = (t) => t.image || previewByCategory[t.category] || childrensDay;
  const descriptionFor = (t) => descriptionByCategory[t.category] || t.description;

  return (
    <div className="ad-page pr-page">
      <div className="pr-toolbar">
        <div className="ad-tabs pr-tabs" role="tablist" aria-label="Submission type">
          {tabs.map(([key, label, count]) => (
            <button type="button" role="tab" key={key} aria-selected={tab === key} onClick={() => setTab(key)}>
              {label} ({count})
            </button>
          ))}
        </div>
        <div className="pr-toolbar-end">
          <label className="ad-control ad-sort">
            <span className="ad-sort-label">Sort by</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
            <ChevronDown size={16} strokeWidth={2.5} aria-hidden="true" />
          </label>
          <button type="button" className="ad-button icon-only" disabled title="More filters coming soon" aria-label="More filters, coming soon">
            <Funnel size={16} fill="currentColor" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="ad-table-card stack-wide pr-table">
        <table className="ad-table">
          <thead>
            <tr>
              <th scope="col">Template</th>
              <th scope="col">Submitted By</th>
              <th scope="col" className="is-center">Category</th>
              <th scope="col">Submitted At</th>
              <th scope="col" className="is-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr>
                <td colSpan={5} className="ad-table-empty">Nothing to review. New submissions will show up here.</td>
              </tr>
            )}
            {shown.map((t) => (
              <tr key={t.id}>
                <td className="is-primary">
                  <div className="pr-template">
                    <img src={previewFor(t)} alt="" />
                    <div>
                      <strong>{t.name}</strong>
                      <p>{descriptionFor(t)}</p>
                      <span className="pr-type">
                        <FileText size={11} fill="currentColor" strokeWidth={1.5} aria-hidden="true" /> Template
                      </span>
                    </div>
                  </div>
                </td>
                <td data-label="Submitted By">
                  <div className="ad-person">
                    <UserAvatar size={38} />
                    <div>
                      <strong>{t.creator}</strong>
                      <small>{t.email}</small>
                    </div>
                  </div>
                </td>
                <td data-label="Category" className="is-center">
                  <span className={`ad-pill ${categoryTone[t.category] || "purple"} pr-category`}>{t.category}</span>
                </td>
                <td data-label="Submitted At">
                  <div className="ad-date">
                    <strong>{formatDate(t.createdAt)}</strong>
                    <small>{t.createdTime}</small>
                  </div>
                </td>
                <td className="pr-actions-cell">
                  <div className="pr-actions">
                    <button type="button" className="ad-action approve" onClick={() => updateTemplate(t.id, { status: "published" })}>
                      <Check size={14} strokeWidth={3} aria-hidden="true" /> Approve
                    </button>
                    <button type="button" className="ad-action reject" onClick={() => updateTemplate(t.id, { status: "rejected" })}>
                      <X size={14} strokeWidth={3} aria-hidden="true" /> Reject
                    </button>
                    <button type="button" className="ad-action preview" onClick={() => setViewing(t)}>
                      <Eye size={14} aria-hidden="true" /> Preview
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={currentPage} pageCount={pageCount} total={pending.length} perPage={perPage} noun="results" onChange={setPage} variant="outlined" />

      {viewing && (
        <Modal title={viewing.name} onClose={() => setViewing(null)} className="pr-preview">
          <header>
            <h2>{viewing.name}</h2>
            <button type="button" onClick={() => setViewing(null)} aria-label="Close">
              <X size={18} />
            </button>
          </header>
          <img src={previewFor(viewing)} alt={`${viewing.name} preview`} />
          <p>{descriptionFor(viewing)}</p>
          <p className="pr-preview-meta">Submitted by {viewing.creator} on {formatDate(viewing.createdAt)}</p>
          <div className="ad-modal-actions">
            <button
              type="button"
              className="ad-action reject"
              onClick={() => {
                updateTemplate(viewing.id, { status: "rejected" });
                setViewing(null);
              }}
            >
              <X size={14} strokeWidth={3} aria-hidden="true" /> Reject
            </button>
            <button
              type="button"
              className="ad-action approve"
              onClick={() => {
                updateTemplate(viewing.id, { status: "published" });
                setViewing(null);
              }}
            >
              <Check size={14} strokeWidth={3} aria-hidden="true" /> Approve
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
