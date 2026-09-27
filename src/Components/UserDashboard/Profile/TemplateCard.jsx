import { useState } from "react";
import {
  Clock3,
  Copy,
  Edit3,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import { formatRelativeTime } from "./profileData";
import VisoraCard from "../../Cards/VisoraCard.jsx";

import { DesignArt } from "./DesignArt";
import { TemplateActionModal } from "./TemplateActionModal";

export function TemplateCard({
  design,
  onUpdate,
  onRename,
  onDuplicate,
  onDelete,
  favorite=false,
  onFavorite,
  index=0,
}){
  const [activeModal,setActiveModal]=useState(null);
  const openModal=setActiveModal;

  const isDraft=design.status==="draft";

  return(
    <>
      <VisoraCard
        index={index}
        preview={design.image||<DesignArt kind={design.art}/>}
        badge={design.review&&<span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-primary shadow-sm">{design.review}</span>}
        title={design.title}
        description={design.subtitle}
        tags={design.tags.map((tag)=>tag.label)}
        stats={[isDraft||!design.publishedAt
          ?{icon:Clock3,label:`Edited ${formatRelativeTime(design.updatedAt)}`}
          :{icon:Eye,label:`Posted ${formatRelativeTime(design.publishedAt)}`}]}
        favorite={{active:favorite,onToggle:()=>onFavorite?.(design)}}
        menu={[
          {label:"Edit",icon:Pencil,onSelect:()=>onUpdate(design)},
          {label:"Rename",icon:Edit3,onSelect:()=>openModal("rename")},
          {label:"Duplicate",icon:Copy,onSelect:()=>openModal("duplicate")},
          {label:"Move to Trash",icon:Trash2,onSelect:()=>onDelete(design.id),danger:true},
        ]}
        onOpen={()=>onUpdate(design)}
        openLabel={`Edit ${design.title}`}
      />

      {activeModal&&(
        <TemplateActionModal
          mode={activeModal}
          design={design}
          onClose={()=>setActiveModal(null)}
          onUpdate={onUpdate}
          onRename={onRename}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      )}
    </>
  );
}