/*
 * Publishing a design again makes a new template (POST /backdrops/{uuid}/templates)
 * for review, and approving it does not retire the version already live. These
 * keep one live template per design (sourceBackdropUuid): the newest approved.
 */
const submitted = (template) => `${template.submittedAt || template.createdAt || ""}`;

/** Server templates with only the newest of each design kept; ones without a design stay. */
export function newestPerDesign(templates) {
  const newest = new Map();
  for (const template of templates) {
    const design = template.sourceBackdropUuid;
    if (!design) continue;
    const current = newest.get(design);
    if (!current || submitted(template) > submitted(current)) newest.set(design, template);
  }
  return templates.filter((template) => !template.sourceBackdropUuid || newest.get(template.sourceBackdropUuid) === template);
}

/** Rows that approving `approved` replaces: the same design's other published templates. */
export const replacedBy = (rows, approved) => (approved?.sourceBackdropUuid
  ? rows.filter((row) => row.sourceBackdropUuid === approved.sourceBackdropUuid
    && row.status === "published" && row.remoteId && row.remoteId !== approved.remoteId)
  : []);
