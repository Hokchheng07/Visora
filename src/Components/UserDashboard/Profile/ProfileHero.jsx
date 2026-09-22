import {
  Calendar,
  Heart,
  MapPin,
  Pencil,
  Sparkles,
} from "lucide-react";

export default function ProfileHero({
  profile,
  onEdit,
}){
  return(
    <section className="profile-hero relative overflow-hidden rounded-t-[20px] border border-b-0 border-[var(--border-card)] bg-[var(--surface-card)] sm:rounded-t-[24px] lg:rounded-t-[30px]">
      {/* TOP COLOR */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-accent/20 via-primary/5 to-secondary/15 sm:h-20"/>

      <div className="profile-hero-layout relative grid gap-7 px-4 py-7 sm:px-6 sm:py-8 md:grid-cols-[190px_minmax(0,1fr)] md:items-center md:gap-8 lg:grid-cols-[210px_minmax(0,1fr)_240px] lg:px-8 xl:grid-cols-[240px_minmax(0,1fr)_280px] xl:gap-10 xl:px-10 xl:py-10">
        {/* PHOTO */}
        <div className="profile-hero-photo relative mx-auto w-[180px] rotate-[-2deg] sm:w-[205px] md:mx-0 md:w-[190px] lg:w-[210px] xl:w-[240px]">
          <div className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-[2deg] bg-accent/70 sm:h-7 sm:w-20"/>

          <div className="rounded-[6px] bg-white p-3 pb-8 shadow-[0_12px_30px_rgba(0,0,0,.14)] sm:p-4 sm:pb-10 xl:pb-12">
            <div className="aspect-square overflow-hidden bg-slate-100">
              <img
                src={profile.avatarUrl}
                alt={`${profile.name} avatar`}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* PROFILE INFO */}
        <div className="profile-hero-info text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <h1 className="text-2xl font-bold text-[var(--text-heading)] sm:text-3xl lg:text-4xl xl:text-5xl">
              {profile.name}
            </h1>

            <Heart className="h-5 w-5 fill-primary/10 text-primary sm:h-6 sm:w-6"/>
          </div>

          <p className="mt-2 text-sm font-semibold text-primary sm:text-base">
            @{profile.handle}
          </p>

          <div className="profile-hero-role mt-3 inline-flex rounded-full bg-accent/20 px-3 py-1.5 text-[11px] font-semibold text-primary sm:mt-4 sm:px-4 sm:py-2 sm:text-sm">
            {profile.role}
          </div>

          <p className="profile-hero-bio mx-auto mt-4 max-w-3xl text-sm leading-6 text-[var(--text-body)] sm:mt-5 sm:leading-7 md:mx-0 lg:text-base">
            {profile.bio}
          </p>

          <div className="profile-hero-meta mt-4 flex flex-col items-center gap-2 text-xs text-[var(--text-muted)] sm:flex-row sm:flex-wrap sm:justify-center sm:gap-5 sm:text-sm md:justify-start">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-primary"/>
              {profile.location}
            </span>

            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-primary"/>
              Joined May 2024
            </span>
          </div>
        </div>

        {/* CREATIVE FOCUS */}
        <div className="profile-hero-focus relative mx-auto w-full max-w-[320px] md:col-span-2 md:max-w-none lg:col-span-1 lg:mx-0 lg:max-w-[270px]">
          <div className="relative rotate-[1deg] rounded-[8px] bg-accent/25 p-5 shadow-[0_8px_20px_rgba(112,90,224,.1)] sm:p-6 lg:rotate-[2deg]">
            <div className="absolute -top-3 left-1/2 h-5 w-16 -translate-x-1/2 bg-primary/35 sm:h-6 sm:w-20"/>

            <p className="font-handwritten text-xl text-primary sm:text-2xl">
              My creative focus ♡
            </p>

            <ul className="mt-3 grid grid-cols-1 gap-2 text-sm leading-6 text-[var(--text-body)] sm:grid-cols-2 lg:grid-cols-1">
              <li>• UI/UX Design</li>
              <li>• Event Backdrops</li>
              <li>• Creative Templates</li>
              <li>• Frontend Development</li>
            </ul>

            <Sparkles className="absolute -right-1 bottom-3 h-5 w-5 text-secondary"/>
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-[var(--text-on-brand)] shadow-[0_6px_16px_rgba(112,90,224,.2)] transition hover:-translate-y-0.5 hover:opacity-90 sm:mt-5"
          >
            <Pencil className="h-4 w-4"/>
            Edit Profile
          </button>
        </div>
      </div>
    </section>
  );
}
