import {useEffect,useState} from "react";
import {X} from "lucide-react";
import {useGetTemplateByIdQuery} from "../../API/templateApi";
import {useGetCategoriesQuery} from "../../API/categoryApi";
import {publishErrorMessage} from "../../Editor/shell/usePublishBackdrop.js";
import VisoraSelect from "../../ui/VisoraSelect";

const fieldClass=
  "mt-2 w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-base)] px-4 text-base text-[var(--text-heading)] outline-none transition focus:border-primary";

/* Name, description and category of a design, edited without the editor, so
   they do not send it for review again. A draft has only a name until it is
   published (see useMyDesigns' editDetails). */
export default function EditDetailsModal({design,onSave,onClose}){
  const hasTemplate=Boolean(design.templateUuid);
  // The list only has a summary; the template itself holds the description.
  const {data:templateAnswer,isFetching:loadingTemplate}=useGetTemplateByIdQuery(
    {templateUuid:design.templateUuid},
    {skip:!hasTemplate,refetchOnMountOrArgChange:true},
  );
  const loaded=templateAnswer?.data;
  const {data:categoryPage}=useGetCategoriesQuery(undefined,{skip:!hasTemplate});
  const categories=(categoryPage?.data?.contents||[]).filter((category)=>category.isActive!==false);

  const [title,setTitle]=useState(design.title);
  const [description,setDescription]=useState("");
  const [categoryUuid,setCategoryUuid]=useState(design.categoryUuids[0]||"");
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");

  useEffect(()=>{
    if(loaded)setDescription(loaded.description||"");
  },[loaded]);

  const save=async(event)=>{
    event.preventDefault();
    if(!title.trim()||saving)return;
    setSaving(true);
    setError("");
    try{
      const chosen=categories.filter((category)=>category.uuid===categoryUuid);
      await onSave(
        // The just-loaded template's version: opening it can bump the one in the list.
        {...design,templateDescription:loaded?.description||"",templateVersion:loaded?.version??design.templateVersion},
        {title:title.trim(),description:hasTemplate?description.trim():undefined,categories:chosen},
      );
      onClose();
    }catch(failure){
      setError(publishErrorMessage(failure,"save these details"));
    }finally{
      setSaving(false);
    }
  };

  return(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <form
        onSubmit={save}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-details-title"
        className="relative w-full max-w-md rounded-[24px] border border-[var(--border-card)] bg-[var(--surface-card)] p-6 shadow-[0_25px_80px_rgba(0,0,0,.28)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-[var(--text-muted)] transition hover:bg-primary/10 hover:text-primary"
        >
          <X className="h-4 w-4"/>
        </button>

        <h2 id="edit-details-title" className="text-2xl font-semibold text-[var(--text-heading)]">
          Edit Details
        </h2>
        <p className="mt-2 text-base text-[var(--text-muted)]">
          {hasTemplate
            ?"Changes here don't send your template for review again."
            :"Description and category are chosen when you publish this design."}
        </p>

        <label className="mt-5 block text-sm font-medium text-[var(--text-heading)]">
          Name
          <input
            autoFocus
            value={title}
            onChange={(event)=>setTitle(event.target.value)}
            className={`${fieldClass} h-12`}
          />
        </label>

        {hasTemplate&&(
          <>
            <label className="mt-4 block text-sm font-medium text-[var(--text-heading)]">
              Description
              <textarea
                value={description}
                onChange={(event)=>setDescription(event.target.value)}
                rows={4}
                disabled={loadingTemplate&&!loaded}
                placeholder={loadingTemplate&&!loaded?"Loading…":"Describe your template"}
                className={`${fieldClass} resize-none py-3`}
              />
            </label>

            <label className="mt-4 block text-sm font-medium text-[var(--text-heading)]">
              Category
              <VisoraSelect
                label="Category"
                value={categoryUuid}
                onChange={setCategoryUuid}
                options={categories.map((category)=>({value:category.uuid,label:category.name}))}
                placeholder="Choose a category"
                size="field"
                className="mt-2 w-full"
              />
            </label>
          </>
        )}

        {error&&<p role="alert" className="mt-4 text-sm text-red-500">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-[var(--border-default)] px-5 text-base font-medium text-[var(--text-body)] transition hover:bg-primary/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()||saving||(hasTemplate&&!categoryUuid)}
            className="h-11 rounded-xl bg-primary px-5 text-base font-medium text-[var(--text-on-brand)] transition hover:opacity-90 disabled:opacity-50"
          >
            {saving?"Saving…":"Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
