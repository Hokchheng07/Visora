import { useMemo,useState } from "react";
import { useNavigate,useOutletContext } from "react-router";
import ProfileHero from "./ProfileHero";
import ProfileStats from "./ProfileStats";
import ProfileTemplates from "./ProfileTemplates";
import { ProfileEditModal } from "./ProfileEditModal";
import { useMyDesigns } from "../useMyDesigns";
import { useFavorites } from "../../Account/useFavorites";

export default function Profile(){
  const navigate=useNavigate();
  const {profile,profileLoading,saveProfile,isSaving,saveError}=useOutletContext();
  const [profileModalOpen,setProfileModalOpen]=useState(false);
  const {designs,isLoading:designsLoading,moveToTrash,rename,editDetails,duplicate}=useMyDesigns();
  const {isFavorite,toggleFavorite}=useFavorites();

  const templates=useMemo(()=>designs.map((design)=>({
    ...design,
    status:design.status==="posted"?"posted":"draft",
  })),[designs]);

  const findDesign=(id)=>templates.find((template)=>template.id===id);
  const openTemplate=(template)=>navigate(`/editor?backdrop=${template.remoteId}`);
  const renameTemplate=(id,title)=>{
    const template=findDesign(id);
    if(template)rename(template,title);
  };
  const duplicateTemplate=(template,title)=>duplicate(template,title);
  const deleteTemplate=(id)=>{
    const template=findDesign(id);
    if(template)moveToTrash(template);
  };

  return(
    <main className="user-dashboard-profile relative min-h-screen px-3 pb-8 pt-3 text-[var(--text-body)] sm:px-5 sm:pb-10 sm:pt-4 md:px-6 lg:px-8 xl:px-10">
      <div className="relative z-[1] mx-auto w-full max-w-[1650px]">
        <ProfileHero
          profile={profile}
          loading={profileLoading}
          onEdit={()=>setProfileModalOpen(true)}
        />

        <ProfileStats templates={templates} loading={designsLoading}/>

        <ProfileTemplates
          templates={templates}
          loading={designsLoading}
          onUpdate={openTemplate}
          onRename={renameTemplate}
          onEditDetails={editDetails}
          onDuplicate={duplicateTemplate}
          onDelete={deleteTemplate}
          isFavorite={isFavorite}
          onFavorite={(template)=>toggleFavorite("BACKDROP",template.remoteId)}
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
