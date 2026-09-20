import { useMemo,useState } from "react";
import {
  FilePenLine,
  Plus,
  Upload,
} from "lucide-react";
import { Link } from "react-router";

import { TemplateCard } from "./TemplateCard";

export default function ProfileTemplates({
  templates,
  onUpdate,
  onRename,
  onDuplicate,
  onDelete,
}){
  const [activeTab,setActiveTab]=useState("posted");

  const visibleTemplates=useMemo(()=>{
    return templates
      .filter(
        (template)=>template.status===activeTab
      )
      .sort((a,b)=>{
        if(activeTab==="posted"){
          return(
            new Date(b.publishedAt).getTime()-
            new Date(a.publishedAt).getTime()
          );
        }

        return(
          new Date(b.updatedAt).getTime()-
          new Date(a.updatedAt).getTime()
        );
      });
  },[activeTab,templates]);

  return(
    <section className="mt-7">
      {/* TOP AREA */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        {/* LEFT */}
        <div>
          {/* TABS */}
          <div className="inline-flex h-11 items-center rounded-full border border-[var(--border-card)] bg-[var(--surface-card)] p-1 shadow-sm">
            <button
              type="button"
              onClick={()=>setActiveTab("posted")}
              className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
                activeTab==="posted"
                  ?"bg-primary text-[var(--text-on-brand)]"
                  :"text-[var(--text-body)] hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <Upload className="h-4 w-4"/>
              Posted Templates
            </button>

            <button
              type="button"
              onClick={()=>setActiveTab("draft")}
              className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
                activeTab==="draft"
                  ?"bg-primary text-[var(--text-on-brand)]"
                  :"text-[var(--text-body)] hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <FilePenLine className="h-4 w-4"/>
              Drafts
            </button>
          </div>

          {/* TITLE */}
          <div className="mt-5">
            <h2 className="font-handwritten text-4xl text-primary">
              {activeTab==="posted"
                ?"Posted Templates"
                :"Draft Templates"}
            </h2>

            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {activeTab==="posted"
                ?"Templates you have published on Visora."
                :"Templates you are still working on."}
            </p>
          </div>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex h-11 flex-wrap items-center gap-3">
          <Link
            to="/templates"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--border-card)] bg-[var(--surface-card)] px-5 text-sm font-semibold text-primary transition hover:bg-primary/10"
          >
            Browse Templates
          </Link>

          <Link
            to="/editor"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-[var(--text-on-brand)] transition hover:opacity-90"
          >
            <Plus className="h-4 w-4"/>
            New Design
          </Link>
        </div>
      </div>

      {/* TEMPLATE GRID */}
      {visibleTemplates.length>0?(
        <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visibleTemplates.map((template)=>(
            <TemplateCard
              key={template.id}
              design={template}
              onUpdate={onUpdate}
              onRename={onRename}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          ))}
        </div>
      ):(
        <div className="mt-8 flex min-h-[220px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border-card)] bg-[var(--surface-card)] px-6 text-center">
          <FilePenLine className="h-9 w-9 text-primary"/>

          <h3 className="mt-3 font-semibold text-[var(--text-heading)]">
            {activeTab==="posted"
              ?"No posted templates yet"
              :"No drafts yet"}
          </h3>

          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {activeTab==="posted"
              ?"Publish a template and it will appear here."
              :"Your unfinished designs will appear here."}
          </p>
        </div>
      )}
    </section>
  );
}