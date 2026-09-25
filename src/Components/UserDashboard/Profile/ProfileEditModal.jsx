import { useRef,useState } from "react";
import { useUserUploadMutation,getStorageUrl } from "../../API/storageApi";
import { uploadErrorMessage } from "../../API/apiError.js";
import {
  Camera,
  Upload,
  UserRound,
  AtSign,
  BriefcaseBusiness,
  AlignLeft,
  MapPin,
  X,
} from "lucide-react";

const inputClass="w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-overlay)] px-3.5 py-2.5 text-sm text-[var(--text-heading)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-primary focus:ring-2 focus:ring-primary/10";

function ModalShell({onClose,children}){
  return(
    <div
      onMouseDown={(e)=>{
        if(e.target===e.currentTarget)onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity duration-200 starting:opacity-0"
    >
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[28px] transition-[opacity,scale] duration-[220ms] ease-[cubic-bezier(.23,1,.32,1)] starting:scale-[.96] starting:opacity-0 motion-reduce:starting:scale-100 border border-[var(--border-card)] bg-[var(--surface-card)] p-5 shadow-[0_25px_80px_rgba(0,0,0,.3)] sm:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 text-[var(--text-muted)] transition hover:bg-primary/10 hover:text-primary"
        >
          <X className="h-4 w-4"/>
        </button>

        {children}
      </div>
    </div>
  );
}

function ModalHeading({icon,title,subtitle}){
  return(
    <div className="mb-5 flex items-start gap-3 pr-10">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>

      <div>
        <h3 className="text-base font-bold text-[var(--text-heading)]">
          {title}
        </h3>
        <p className="mt-0.5 text-xs leading-5 text-[var(--text-muted)]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function FieldLabel({children}){
  return(
    <label className="mb-1.5 block text-xs font-semibold text-[var(--text-heading)]">
      {children}
    </label>
  );
}

export function ProfileEditModal({profile,onSave,onClose,saving=false,error=""}){
  const [draft,setDraft]=useState(profile);
  const fileInputRef=useRef(null);
  const [uploadPhoto,{isLoading:uploading}]=useUserUploadMutation();
  const [photoError,setPhotoError]=useState("");

  // The photo goes to the server (POST /storage) and comes back as a file
  // name. That name is what the profile stores; the link is built for showing.
  const handleFileChange=async(e)=>{
    const file=e.target.files?.[0];
    e.target.value="";
    if(!file)return;

    setPhotoError("");

    if(!file.type.startsWith("image/")){
      setPhotoError("Please choose an image.");
      return;
    }
    if(file.size>5*1024*1024){
      setPhotoError("That photo is bigger than 5 MB.");
      return;
    }

    const formData=new FormData();
    formData.append("file",file);
    const result=await uploadPhoto({userUploadRequest:formData});
    const fileName=result?.data?.data?.fileName;

    if(!fileName){
      setPhotoError(uploadErrorMessage(result?.error,"photo"));
      return;
    }

    setDraft((current)=>({
      ...current,
      picture:fileName,
      avatarUrl:getStorageUrl(fileName),
    }));
  };

  const handleSave=async()=>{
    // onSave returns false when the server refused; the modal stays open so nothing is lost.
    const saved=await onSave(draft);
    if(saved!==false)onClose();
  };

  return(
    <ModalShell onClose={onClose}>
      <ModalHeading
        icon={<UserRound className="h-4 w-4"/>}
        title="Edit Profile"
        subtitle="Update your personal information and profile picture."
      />

      <div className="mb-5 flex items-center gap-4 rounded-[20px] bg-primary/5 p-4 dark:bg-primary/10">
        <div className="relative shrink-0">
          <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-[var(--surface-card)] bg-[var(--surface-overlay)] shadow-md">
            <img
              src={draft.avatarUrl}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          </div>

          <button
            type="button"
            onClick={()=>fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--surface-card)] bg-primary text-white shadow"
          >
            <Camera className="h-3.5 w-3.5"/>
          </button>
        </div>

        <div>
          <p className="text-sm font-semibold text-[var(--text-heading)]">
            Profile photo
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            JPG, PNG or WEBP
          </p>

          <button
            type="button"
            onClick={()=>fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline disabled:opacity-60"
          >
            <Upload className="h-3.5 w-3.5"/>
            {uploading?"Uploading…":"Change photo"}
          </button>

          {photoError&&(
            <p className="mt-1.5 text-xs text-red-500">{photoError}</p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field icon={UserRound} label="Name">
          <input
            value={draft.name}
            onChange={(e)=>setDraft((current)=>({...current,name:e.target.value}))}
            className={inputClass}
          />
        </Field>

        <Field icon={AtSign} label="Handle">
          <input
            value={draft.handle}
            onChange={(e)=>setDraft((current)=>({...current,handle:e.target.value}))}
            className={inputClass}
          />
        </Field>

        <div className="sm:col-span-2">
          <Field icon={BriefcaseBusiness} label="Role / Title">
            <input
              value={draft.role}
              onChange={(e)=>setDraft((current)=>({...current,role:e.target.value}))}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field icon={AlignLeft} label="Bio">
            <textarea
              value={draft.bio}
              onChange={(e)=>setDraft((current)=>({...current,bio:e.target.value}))}
              rows={3}
              maxLength={180}
              className={`${inputClass} resize-none`}
            />

            <p className="mt-1 text-right text-[10px] text-[var(--text-muted)]">
              {draft.bio?.length||0}/180
            </p>
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field icon={MapPin} label="Location">
            <input
              value={draft.location}
              onChange={(e)=>setDraft((current)=>({...current,location:e.target.value}))}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {error&&(
        <p className="mt-5 rounded-xl bg-red-500/10 px-3.5 py-2.5 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-2 border-t border-[var(--border-default)] pt-5">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:bg-primary/5 hover:text-primary"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving||uploading}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_5px_15px_rgba(112,90,224,.2)] hover:bg-primary/90 disabled:opacity-60"
        >
          {saving?"Saving…":"Save Changes"}
        </button>
      </div>
    </ModalShell>
  );
}

function Field({icon:Icon,label,children}){
  return(
    <div>
      <div className="mb-1.5 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-primary"/>
        <FieldLabel>{label}</FieldLabel>
      </div>
      {children}
    </div>
  );
}
