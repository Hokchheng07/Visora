import { useState } from "react";
import {
  ArrowRight,
  Ban,
  ChevronDown,
  FileUser,
  Funnel,
  RotateCcw,
  Trash2,
  UserCog,
  UserRoundMinus,
  UserRoundPlus,
  Users,
} from "lucide-react";
import { Link } from "react-router";
import {
  CardHeader,
  Modal,
  Pagination,
  RowMenu,
  StatCards,
  UserAvatar,
  formatDate,
} from "./AdminUi";
import {
  useDeleteUserMutation,
  useGetUsersQuery,
} from "../API/userApi";
import "./admin-users.css";

const tabs = [
  ["all", "All Users"],
  ["active", "Active"],
  ["inactive", "Inactive"],
  ["suspended", "Suspended"],
];
const statusTone = { active: "green", inactive: "red", suspended: "red" };
const roleTone = {
  Designer: "purple",
  Editor: "purple",
  Contributor: "yellow",
  Viewer: "gray",
};
const perPage = 10;
const dayMs = 24 * 60 * 60 * 1000;
const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

export default function UserManagement() {
  const { data, isLoading, isError } = useGetUsersQuery({
    pageNumber: 0,
    pageSize: 25,
  });
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [tab, setTab] = useState("all");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState(null);
  const [mutationError, setMutationError] = useState(null);

  const users = (data?.data?.contents ?? []).map((user) => ({
    id: user.uuid,
    name: `${user.givenName ?? ""} ${user.familyName ?? ""}`.trim(),
    email: user.email ?? "",
    role: user.role?.role ?? "No role",
    status: user.status?.toLowerCase?.() ?? (user.isDeleted ? "inactive" : "active"),
    joinedAt: user.createdAt,
    templateCount: user.templateCount ?? user.templatesCreated ?? user.templates?.length ?? 0,
  }));

  if (isLoading || isError) {
    return (
      <div className="ad-page">
        <div className="ad-table-card">
          <div className="ad-table-empty">
            {isLoading ? "Loading users…" : "Could not load users. Try refreshing the page."}
          </div>
        </div>
      </div>
    );
  }

  // The current API's PUT schema does not include a status field. Keep the
  // existing menu available, but do not send an invalid { status } payload.
  // A dedicated status endpoint is required before suspend/reactivate can
  // change backend data.
  const runStatusUpdate = () => {
    setMutationError(
      "User status cannot be changed yet because the backend has no status endpoint.",
    );
  };

  // Calculate "this week" based on the current date
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const isNewThisWeek = (u) => {
    if (!u.joinedAt) return false;
    const joinedDate = new Date(u.joinedAt);
    return joinedDate >= startOfWeek;
  };

  const joinedLabel = (u) => {
    if (!u.joinedAt) return "Joined date unavailable";

    const date = new Date(u.joinedAt);
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / dayMs);

    if (diffDays === 0) return "Joined today";
    return `Joined ${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  };

  const roles = [...new Set(users.map((u) => u.role))];
  const countFor = (key) =>
    key === "all" ? users.length : users.filter((u) => u.status === key).length;
  const filtered = users.filter(
    (u) =>
      (tab === "all" || u.status === tab) &&
      (role === "all" || u.role === role),
  );
  const pageCount = Math.ceil(filtered.length / perPage);
  const currentPage = Math.min(page, Math.max(pageCount, 1));
  const shown = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );
  const recent = [...users]
    .filter((u) => u.joinedAt)
    .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))
    .slice(0, 5);

  const stats = [
    { label: "Total User", value: users.length, icon: Users, tone: "purple" },
    {
      label: "Active Users",
      value: countFor("active"),
      icon: UserRoundPlus,
      tone: "yellow",
    },
    {
      label: "New This Week",
      value: users.filter(isNewThisWeek).length,
      icon: UserCog,
      tone: "purple",
    },
    {
      label: "Suspended Users",
      value: countFor("suspended"),
      icon: UserRoundMinus,
      tone: "red",
    },
  ];

  return (
    <div className="ad-page um-page">
      <StatCards items={stats} label="User totals" />

      {mutationError && <p className="ad-alert" role="alert">{mutationError}</p>}

      <div className="um-layout">
        <div className="um-toolbar">
          <div
            className="ad-tabs"
            role="tablist"
            aria-label="Filter users by status"
          >
            {tabs.map(([key, label]) => (
              <button
                type="button"
                role="tab"
                key={key}
                aria-selected={tab === key}
                onClick={() => {
                  setTab(key);
                  setPage(1);
                }}
              >
                {label} ({countFor(key).toLocaleString()})
              </button>
            ))}
          </div>
          <div className="um-toolbar-controls">
            <label className="ad-control">
              <span className="sr-only">Role</span>
              <select
                value={role}
                onChange={(event) => {
                  setRole(event.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Roles</option>
                {roles.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </label>
            <button
              type="button"
              className="ad-button"
              disabled
              title="More filters coming soon"
              aria-label="Filter, coming soon"
            >
              <Funnel size={14} fill="currentColor" aria-hidden="true" /> Filter
            </button>
          </div>
        </div>

        <div className="ad-table-card um-table">
          <table className="ad-table">
            <thead>
              <tr>
                <th scope="col">Names</th>
                <th scope="col">Status</th>
                <th scope="col">Joined Date</th>
                <th scope="col" className="is-center">
                  Templates
                </th>
                <th scope="col" className="is-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr>
                  <td colSpan={5} className="ad-table-empty">
                    No users match these filters.
                  </td>
                </tr>
              )}
              {shown.map((u) => (
                <tr key={u.id}>
                  <td className="is-primary">
                    <div className="ad-person">
                      <UserAvatar size={38} />
                      <div>
                        <strong>{u.name}</strong>
                        <small>{u.email}</small>
                      </div>
                    </div>
                  </td>
                  <td data-label="Status">
                    <span
                      className={`ad-pill ${statusTone[u.status] || "gray"}`}
                    >
                      <i className="dot" aria-hidden="true" />
                      {capitalize(u.status)}
                    </span>
                  </td>
                  <td data-label="Joined Date">
                    <div className="ad-date">
                      <strong>{formatDate(u.joinedAt)}</strong>
                    </div>
                  </td>
                  <td data-label="Templates" className="is-center">
                    {u.templateCount}
                  </td>
                  <td className="is-center is-actions">
                    <RowMenu
                      label={`Actions for ${u.name}`}
                      items={[
                        u.status === "suspended"
                          ? {
                              label: "Reactivate",
                              icon: RotateCcw,
                              onSelect: runStatusUpdate,
                            }
                          : {
                              label: "Suspend",
                              icon: Ban,
                              onSelect: runStatusUpdate,
                            },
                        {
                          label: "Delete user",
                          icon: Trash2,
                          danger: true,
                          onSelect: () => setConfirm(u),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="um-pagination">
          <Pagination
            page={currentPage}
            pageCount={pageCount}
            total={filtered.length}
            perPage={perPage}
            noun="Users"
            onChange={setPage}
          />
        </div>

        <aside className="ad-card um-registrations">
          <CardHeader
            icon={FileUser}
            title="Recent Registrations"
            linkLabel="View all"
            to="/dashboard/users"
          />
          <ul className="ad-list">
            {recent.map((u) => (
              <li key={u.id}>
                <UserAvatar size={38} />
                <div>
                  <strong>{u.name}</strong>
                  <small>{u.email}</small>
                  <small className="um-joined">{joinedLabel(u)}</small>
                </div>
                <span className={`ad-pill ${roleTone[u.role] || "gray"}`}>
                  {u.role}
                </span>
              </li>
            ))}
          </ul>
          <Link className="um-view-all" to="/dashboard/users">
            View all registration <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </aside>
      </div>


      {confirm && (
        <Modal title="Delete user" onClose={() => setConfirm(null)}>
          <header>
            <h2>Delete {confirm.name}?</h2>
          </header>
          <p>
            This removes the user from the list. This action cannot be undone.
          </p>
          <div className="ad-modal-actions">
            <button
              type="button"
              className="ad-button"
              onClick={() => setConfirm(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ad-button danger"
              disabled={isDeleting}
              onClick={async () => {
                setMutationError(null);
                try {
                  await deleteUser(confirm.id).unwrap();
                  setConfirm(null);
                } catch (error) {
                  setMutationError(error?.data?.message || "Unable to delete this user.");
                }
              }}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
