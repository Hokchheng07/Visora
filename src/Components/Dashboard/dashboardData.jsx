import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getDashboardSummary, updateTemplate as apiUpdateTemplate, deleteTemplate as apiDeleteTemplate, createTemplate as apiCreateTemplate, updateUser as apiUpdateUser, deleteUser as apiDeleteUser } from "../api/endpoints";
import { ApiError } from "../api/client";

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
        setDashboard(await getDashboardSummary(controller.signal));
        setError(null);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError instanceof ApiError ? requestError.message : "Failed to fetch dashboard data");
        }
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

      // Each mutation below does an optimistic local update (so the UI feels
      // instant) and fires the matching API call. If the request fails, we
      // roll the local state back and surface the error.
      addTemplate: (item) => {
        const optimistic = {
          ...item,
          id: Date.now(),
          createdTime: item.createdTime || "12:00 PM",
          shade: item.shade || "violet",
          description: item.description || `A polished ${item.category.toLowerCase()} template for Visora.`,
        };
        setDashboard((current) => ({
          ...current,
          templates: [optimistic, ...current.templates],
          stats: {
            ...current.stats,
            totalTemplates: current.stats.totalTemplates + 1,
            publicTemplates: current.stats.publicTemplates + (item.visibility === "public" ? 1 : 0),
            pendingReview: current.stats.pendingReview + (item.status === "pending" ? 1 : 0),
            reportedTemplates: current.stats.reportedTemplates + (item.status === "rejected" ? 1 : 0),
          },
        }));
        apiCreateTemplate(item).catch((requestError) => {
          setError(requestError instanceof ApiError ? requestError.message : "Failed to save template");
          setDashboard((current) => ({ ...current, templates: current.templates.filter((t) => t.id !== optimistic.id) }));
        });
      },

      updateTemplate: (id, patch) => {
        let previous;
        setDashboard((current) => {
          previous = current.templates.find((template) => template.id === id);
          if (!previous) return current;
          const next = { ...previous, ...patch };
          return {
            ...current,
            templates: current.templates.map((template) => (template.id === id ? next : template)),
            stats: updateStats(current.stats, previous, next),
          };
        });
        apiUpdateTemplate(id, patch).catch((requestError) => {
          setError(requestError instanceof ApiError ? requestError.message : "Failed to update template");
          if (previous) {
            setDashboard((current) => ({
              ...current,
              templates: current.templates.map((template) => (template.id === id ? previous : template)),
              stats: updateStats(current.stats, { ...previous, ...patch }, previous),
            }));
          }
        });
      },

      deleteTemplate: (id) => {
        let removed;
        setDashboard((current) => {
          removed = current.templates.find((template) => template.id === id);
          if (!removed) return current;
          return {
            ...current,
            templates: current.templates.filter((template) => template.id !== id),
            stats: {
              ...current.stats,
              totalTemplates: current.stats.totalTemplates - 1,
              publicTemplates: current.stats.publicTemplates - (removed.visibility === "public" ? 1 : 0),
              pendingReview: current.stats.pendingReview - (removed.status === "pending" ? 1 : 0),
              reportedTemplates: current.stats.reportedTemplates - (removed.status === "rejected" ? 1 : 0),
            },
          };
        });
        apiDeleteTemplate(id).catch((requestError) => {
          setError(requestError instanceof ApiError ? requestError.message : "Failed to delete template");
          if (removed) setDashboard((current) => ({ ...current, templates: [removed, ...current.templates] }));
        });
      },

      addUser: (user) => {
        const optimistic = { ...user, id: Date.now() };
        setDashboard((current) => ({
          ...current,
          users: [optimistic, ...current.users],
          stats: { ...current.stats, totalUsers: current.stats.totalUsers + 1 },
        }));
      },

      updateUser: (id, patch) => {
        let previous;
        setDashboard((current) => {
          previous = current.users.find((user) => user.id === id);
          return { ...current, users: current.users.map((user) => (user.id === id ? { ...user, ...patch } : user)) };
        });
        apiUpdateUser(id, patch).catch((requestError) => {
          setError(requestError instanceof ApiError ? requestError.message : "Failed to update user");
          if (previous) setDashboard((current) => ({ ...current, users: current.users.map((user) => (user.id === id ? previous : user)) }));
        });
      },

      deleteUser: (id) => {
        let removed;
        setDashboard((current) => {
          removed = current.users.find((user) => user.id === id);
          return {
            ...current,
            users: current.users.filter((user) => user.id !== id),
            stats: { ...current.stats, totalUsers: current.stats.totalUsers - 1 },
          };
        });
        apiDeleteUser(id).catch((requestError) => {
          setError(requestError instanceof ApiError ? requestError.message : "Failed to delete user");
          if (removed) setDashboard((current) => ({ ...current, users: [removed, ...current.users] }));
        });
      },
    };
  }, [dashboard, error, loading]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useDashboardData = () => useContext(DataContext);
