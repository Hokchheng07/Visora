import { useMemo } from "react";
import { useApproveTemplateMutation, useDeleteTemplateMutation, useGetAllTemplatesQuery, useGetTemplatesQuery, useRejectTemplateMutation } from "../API/templateApi";
import { getStorageUrl } from "../API/storageApi";
import { useUserDirectory } from "./useUserDirectory";
import { listRequestFailed } from "../API/apiError.js";
import { templateCategoryNames, templateCategoryUuids } from "../Templates/templateCategories.js";
import { replacedBy } from "./templateVersions.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* A template submitted through the editor (GET /templates/admin), in the
   shape of the sample rows. `findPerson` turns the submitter's uuid into a name. */
const STATUS = { PENDING: "pending", APPROVED: "published", REJECTED: "rejected" };

export function fromServerTemplate(template, findPerson) {
  const author = findPerson(template.submittedBy) || findPerson(template.ownerUuid);
  const submitted = template.submittedAt || template.createdAt || new Date().toISOString();
  const categories = templateCategoryNames(template);
  const categoryUuids = templateCategoryUuids(template);
  return {
    id: `template-${template.uuid}`,
    remoteId: template.uuid,
    ownerUuid: template.ownerUuid || template.submittedBy || "",
    // The design it was published from; a re-published design has one template per submission.
    sourceBackdropUuid: template.sourceBackdropUuid || "",
    name: template.proposedName || template.name || "Untitled",
    // List answers are summaries with no description; the full template
    // (GET /templates/{uuid}) fills it in when one is opened. Never a placeholder:
    // saving the form would write it back over the real one.
    description: template.description || "",
    image: template.thumbnail ? getStorageUrl(template.thumbnail) : null,
    // A value that is not a uuid (a username, an email) is already readable.
    creator: author?.name || (UUID.test(template.submittedBy || "") ? "Visora user" : template.submittedBy) || "Visora user",
    email: author?.email || "",
    author,
    categories: categories.length ? categories : ["Others"],
    categoryUuids,
    category: categories[0] || "Others",
    categoryUuid: categoryUuids[0] || "",
    visibility: "public",
    status: STATUS[template.templateStatus] || "pending",
    version: template.version,
    createdAt: submitted,
    createdTime: new Date(submitted).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
  };
}

/* Every template on the server in every review state, as rows, newest
   first — for the dashboard's Template Manager. Each state is asked for on
   its own (GET /templates/admin?templateStatus=…) rather than trusting what
   the server returns with no filter, and the three answers are merged. A
   404 is this server's empty list, so a state with nothing in it is fine. */
const REVIEW_STATES = ["PENDING", "APPROVED", "REJECTED"];

export function useServerTemplates() {
  const directory = useUserDirectory();
  const fresh = { refetchOnMountOrArgChange: true };
  const pending = useGetAllTemplatesQuery({ templateStatus: "PENDING", pageSize: 100 }, fresh);
  const approved = useGetAllTemplatesQuery({ templateStatus: "APPROVED", pageSize: 100 }, fresh);
  const rejected = useGetAllTemplatesQuery({ templateStatus: "REJECTED", pageSize: 100 }, fresh);
  // The public list (GET /templates) returns every author's templates too; a
  // backup in case the admin list leaves one out. Its rows carry their own state.
  const everyone = useGetTemplatesQuery({ pageSize: 100 }, fresh);
  const answers = [pending, approved, rejected, everyone];
  const rows = useMemo(() => {
    const seen = new Set();
    return answers
      .flatMap((answer, index) => (answer.data?.data?.contents || [])
        // An answer without templateStatus is labelled by the state it was asked for.
        .map((template) => ({ ...template, templateStatus: template.templateStatus || REVIEW_STATES[index] || "APPROVED" })))
      .filter((template) => template?.uuid && !seen.has(template.uuid) && seen.add(template.uuid))
      // A deleted template may only be archived on the server; to the admin it is gone.
      .filter((template) => template.status !== "ARCHIVED")
      .map((template) => fromServerTemplate(template, directory.find))
      .sort((a, b) => `${b.createdAt}`.localeCompare(`${a.createdAt}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending.data, approved.data, rejected.data, everyone.data, directory]);
  const failed = answers.map((answer) => answer.error).find(listRequestFailed) || null;
  // Only the first load: a refetch after approve/reject keeps showing the rows it has.
  const isLoading = answers.some((answer) => answer.isLoading);
  return { rows, error: failed, isLoading };
}

/*
 * The admin's review queue — the dashboard home's pending box and the Pending
 * page. Real submissions only, newest first. It reads the same combined lists
 * as the Template Manager (useServerTemplates): GET /templates/admin with a
 * status filter answers 404 even when something is pending, so the public list
 * (GET /templates, which includes pending ones) is what actually finds them.
 * decide(template, "published" | "rejected") approves or rejects on the server;
 * RTK then reloads every template list, so the row leaves the queue.
 */
export function useReviewQueue() {
  const { rows, error, isLoading } = useServerTemplates();
  const [approveTemplate] = useApproveTemplateMutation();
  const [rejectTemplate] = useRejectTemplateMutation();
  const [archiveTemplate] = useDeleteTemplateMutation();

  const submissions = useMemo(() => rows.filter((template) => template.status === "pending"), [rows]);

  /* An approved new version of a design replaces the one already live:
     DELETE /templates/{uuid} archives the older published templates. */
  const retireOlderVersions = (template) => Promise.all(replacedBy(rows, rows.find((row) => row.remoteId === template.remoteId) || template)
    .map((old) => archiveTemplate({ templateUuid: old.remoteId }).unwrap()))
    .catch(() => window.alert(`"${template.name}" was approved, but its older version is still live. Delete it from Templates.`));

  const decide = (template, status) => {
    if (!template.remoteId) return;
    const request = status === "published" ? approveTemplate : rejectTemplate;
    request({ templateUuid: template.remoteId }).unwrap()
      .then(() => status === "published" && retireOlderVersions(template))
      .catch(() => window.alert(`Couldn't ${status === "published" ? "approve" : "reject"} "${template.name}". Please try again.`));
  };

  // Said on the page rather than swallowed: an empty queue and a failed request look the same otherwise.
  const serverError = error
    ? error.status === 401 || error.status === 403
      ? "Live submissions need an admin sign-in."
      : `Couldn't load live submissions${Number.isInteger(error.status) ? ` (server said ${error.status})` : ""}.`
    : "";

  return { templates: submissions, submissions, decide, serverError, isLoading };
}
