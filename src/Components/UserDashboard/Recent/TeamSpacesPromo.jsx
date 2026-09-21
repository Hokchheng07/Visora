import { UserPlus } from "lucide-react";

import { DEFAULT_PROFILE } from "../Profile/profileData";

/* Bento promo tile that sits inside the design grid and spans two columns. */
const TEAMMATES=[
  DEFAULT_PROFILE.avatarUrl,
  "https://api.dicebear.com/7.x/personas/svg?seed=Lily",
  "https://api.dicebear.com/7.x/personas/svg?seed=Davin",
];

export default function TeamSpacesPromo(){
  return(
    <article className="relative flex flex-col justify-between overflow-hidden rounded-[13px] bg-[#2b1263] p-6 text-white sm:col-span-2 sm:p-7">
      {/* GLOW */}
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/45 blur-3xl"/>

      <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-secondary/20 blur-3xl"/>

      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
            Team Spaces
          </span>

          <span className="h-2 w-2 rounded-full bg-emerald-400"/>
        </div>

        <h3 className="mt-5 text-2xl font-bold leading-tight sm:text-[32px] sm:leading-[1.15]">
          Work with teammates in real-time
        </h3>

        <p className="mt-3 max-w-[520px] text-sm leading-6 text-white/75">
          Multi-player cursor canvas, live threaded comments, synchronized asset
          handoff, and version history.
        </p>
      </div>

      <div className="relative mt-7 flex flex-wrap items-center justify-between gap-4">
        {/* AVATARS */}
        <div className="flex items-center">
          {TEAMMATES.map((avatar,index)=>(
            <img
              key={avatar}
              src={avatar}
              alt=""
              className={`h-9 w-9 rounded-full border-2 border-[#2b1263] bg-white object-cover ${
                index===0?"":"-ml-3"
              }`}
            />
          ))}

          <span className="-ml-3 grid h-9 w-9 place-items-center rounded-full border-2 border-[#2b1263] bg-primary text-[11px] font-semibold">
            +5
          </span>
        </div>

        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#2b1263] transition hover:opacity-90"
        >
          <UserPlus className="h-4 w-4"/>
          Invite Team Members
        </button>
      </div>
    </article>
  );
}
