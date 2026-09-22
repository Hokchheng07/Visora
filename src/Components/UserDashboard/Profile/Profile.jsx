import { useState } from "react";
import { useOutletContext } from "react-router";

import {
  PROFILE_TEMPLATES,
} from "./profileData";

import ProfileHero from "./ProfileHero";
import ProfileStats from "./ProfileStats";
import ProfileTemplates from "./ProfileTemplates";
import { ProfileEditModal } from "./ProfileEditModal";
import CosmicDust from "../../Effects/CosmicDust.jsx";

export default function Profile(){
  const {profile,saveProfile,isSaving,saveError}=useOutletContext();
  const [profileModalOpen,setProfileModalOpen]=useState(false);
  const [templates,setTemplates]=useState(PROFILE_TEMPLATES);

  const updateTemplate=(updatedTemplate)=>{
    setTemplates((current)=>
      current.map((template)=>{
        if(template.id!==updatedTemplate.id){
          return template;
        }

        const now=new Date().toISOString();

        if(updatedTemplate.visibility==="private"){
          return{
            ...updatedTemplate,
            status:"draft",
            publishedAt:null,
            updatedAt:now,
          };
        }

        const wasDraft=template.status==="draft";

        return{
          ...updatedTemplate,
          status:"posted",
          publishedAt:wasDraft
            ?now
            :template.publishedAt||now,
          updatedAt:now,
        };
      })
    );
  };

  const renameTemplate=(id,title)=>{
    setTemplates((current)=>
      current.map((template)=>
        template.id===id
          ?{
              ...template,
              title,
              updatedAt:new Date().toISOString(),
            }
          :template
      )
    );
  };

  const duplicateTemplate=(template,title)=>{
    setTemplates((current)=>[
      {
        ...template,
        id:`template-${Date.now()}`,
        title:title||`${template.title} Copy`,
        views:0,
        visibility:"private",
        status:"draft",
        publishedAt:null,
        updatedAt:new Date().toISOString(),
      },
      ...current,
    ]);
  };

  const deleteTemplate=(id)=>{
    setTemplates((current)=>
      current.filter(
        (template)=>template.id!==id
      )
    );
  };

  return(
    <main className="user-dashboard-profile relative min-h-screen bg-[var(--surface-warm)] px-3 pb-8 pt-3 text-[var(--text-body)] sm:px-5 sm:pb-10 sm:pt-4 md:px-6 lg:px-8 xl:px-10">
      <CosmicDust particleCount={120} />
      <div className="relative z-[1] mx-auto w-full max-w-[1650px]">
        <ProfileHero
          profile={profile}
          onEdit={()=>setProfileModalOpen(true)}
        />

        <ProfileStats templates={templates}/>

        <ProfileTemplates
          templates={templates}
          onUpdate={updateTemplate}
          onRename={renameTemplate}
          onDuplicate={duplicateTemplate}
          onDelete={deleteTemplate}
        />
      </div>

      {profileModalOpen&&(
        <ProfileEditModal
          profile={profile}
          onSave={saveProfile}
          saving={isSaving}
          error={saveError}
          onClose={()=>setProfileModalOpen(false)}
        />
      )}
    </main>
  );
}
