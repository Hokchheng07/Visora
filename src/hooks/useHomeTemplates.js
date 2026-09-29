import { useMemo } from "react";
import { useGetTemplatesQuery } from "../Components/API/templateApi";
import { fromServerTemplate } from "../Components/Templates/serverTemplate.js";
import { newestPerDesign } from "../Components/Dashboard/templateVersions.js";

const HOME_LIMIT = 3;
const KHMER = /khmer/i;

export const isKhmerTemplate = (template) => template.categories.some((name) => KHMER.test(name));

/* Approved templates for a home page section, newest first, one per design.
   `khmer` keeps only templates in a Khmer category. Both sections share one
   request (RTK caches GET /templates). */
export default function useHomeTemplates({ khmer = false, limit = HOME_LIMIT } = {}) {
  const { data: page, isLoading, error } = useGetTemplatesQuery({ templateStatus: "APPROVED", pageSize: 100 });
  const data = useMemo(() => {
    const approved = (page?.data?.contents || [])
      .filter((template) => template?.uuid && template.status !== "ARCHIVED"
        && (!template.templateStatus || template.templateStatus === "APPROVED"));
    return newestPerDesign(approved)
      .sort((a, b) => `${b.submittedAt || b.createdAt || ""}`.localeCompare(`${a.submittedAt || a.createdAt || ""}`))
      .map(fromServerTemplate)
      .filter((template) => !khmer || isKhmerTemplate(template))
      .slice(0, limit);
  }, [page, khmer, limit]);
  return { data, loading: isLoading, error };
}
