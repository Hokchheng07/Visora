import { createContext, useContext, useEffect, useMemo, useState } from "react";

const DataContext = createContext(null);

function updateStats(stats, previous, next) {
  if (!stats) return stats;
  return {
    ...stats,
    publicTemplates:
      stats.publicTemplates +
      (next.visibility === "public" ? 1 : 0) -
      (previous.visibility === "public" ? 1 : 0),
    pendingReview:
      stats.pendingReview +
      (next.status === "pending" ? 1 : 0) -
      (previous.status === "pending" ? 1 : 0),
    reportedTemplates:
      stats.reportedTemplates +
      (next.status === "rejected" ? 1 : 0) -
      (previous.status === "rejected" ? 1 : 0),
  };
}

export function DashboardDataProvider({ children }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    async function loadDashboard() {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard.json", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Failed to fetch dashboard data");
        setDashboard(await response.json());
      } catch (requestError) {
        if (requestError.name !== "AbortError") setError(requestError.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadDashboard();
    return () => controller.abort();
  }, []);

  const value = useMemo(() => {
    const templates = dashboard?.templates || [];
    const users = dashboard?.users || [];
    const categoryNames = dashboard?.categories || [];
    return {
      dashboard,
      loading,
      error,
      templates,
      users,
      categories: [
        ...new Set([
          ...categoryNames,
          ...templates.map((template) => template.category),
        ]),
      ],
      reports: dashboard?.reports || [],
      activity: dashboard?.activity || {},
      stats: dashboard?.stats || null,
      addTemplate: (item) =>
        setDashboard((current) => ({
          ...current,
          templates: [
            {
              ...item,
              id: Date.now(),
              createdTime: item.createdTime || "12:00 PM",
              shade: item.shade || "violet",
              description:
                item.description ||
                `A polished ${item.category.toLowerCase()} template for Visora.`,
            },
            ...current.templates,
          ],
          stats: {
            ...current.stats,
            totalTemplates: current.stats.totalTemplates + 1,
            publicTemplates:
              current.stats.publicTemplates +
              (item.visibility === "public" ? 1 : 0),
            pendingReview:
              current.stats.pendingReview + (item.status === "pending" ? 1 : 0),
            reportedTemplates:
              current.stats.reportedTemplates +
              (item.status === "rejected" ? 1 : 0),
          },
        })),
      updateTemplate: (id, patch) =>
        setDashboard((current) => {
          const previous = current.templates.find(
            (template) => template.id === id,
          );
          if (!previous) return current;
          const next = { ...previous, ...patch };
          return {
            ...current,
            templates: current.templates.map((template) =>
              template.id === id ? next : template,
            ),
            stats: updateStats(current.stats, previous, next),
          };
        }),
      deleteTemplate: (id) =>
        setDashboard((current) => {
          const removed = current.templates.find(
            (template) => template.id === id,
          );
          if (!removed) return current;
          return {
            ...current,
            templates: current.templates.filter(
              (template) => template.id !== id,
            ),
            stats: {
              ...current.stats,
              totalTemplates: current.stats.totalTemplates - 1,
              publicTemplates:
                current.stats.publicTemplates -
                (removed.visibility === "public" ? 1 : 0),
              pendingReview:
                current.stats.pendingReview -
                (removed.status === "pending" ? 1 : 0),
              reportedTemplates:
                current.stats.reportedTemplates -
                (removed.status === "rejected" ? 1 : 0),
            },
          };
        }),
      addUser: (user) =>
        setDashboard((current) => ({
          ...current,
          users: [{ ...user, id: Date.now() }, ...current.users],
          stats: { ...current.stats, totalUsers: current.stats.totalUsers + 1 },
        })),
      updateUser: (id, patch) =>
        setDashboard((current) => ({
          ...current,
          users: current.users.map((user) =>
            user.id === id ? { ...user, ...patch } : user,
          ),
        })),
      deleteUser: (id) =>
        setDashboard((current) => ({
          ...current,
          users: current.users.filter((user) => user.id !== id),
          stats: { ...current.stats, totalUsers: current.stats.totalUsers - 1 },
        })),
    };
  }, [dashboard, error, loading]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useDashboardData = () => useContext(DataContext);
