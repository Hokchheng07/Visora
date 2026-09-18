import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, MapPin, Calendar, Heart, Download, Share2, Layers, Settings, Pencil } from "lucide-react";

import { DEFAULT_PROFILE, RECENT_DESIGNS } from "../ProfilePageComponents/profileData";
import { StatCard } from "../ProfilePageComponents/StatCard";
import { DesignCard } from "../ProfilePageComponents/DesignCard";
import { ProfileEditModal } from "../ProfilePageComponents/ProfileEditModal";
import { useCurrentUser } from "../Account/useCurrentUser";
import UserAvatar from "../Account/UserAvatar";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("recent");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const account = useCurrentUser();
  // Signed in: the header shows the real account from /users/me. The bio,
  // location and designs below are still placeholders until those APIs exist.
  const name = account.user ? account.displayName : profile.name;
  const handle = account.user ? account.user.username : profile.handle;
  const role = account.user ? account.role.toLowerCase() || "member" : profile.role;

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5 text-sm font-medium hover:opacity-80">
            <ArrowLeft className="h-4 w-4 text-orange-500" />
            <span className="text-orange-500">Back to</span>
            <span className="font-semibold text-violet-600">Visora</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Pro Member
            </span>
            <Settings className="h-4 w-4 text-slate-400" />
          </div>
        </div>

        <h1 className="text-[15px] font-semibold text-slate-900">My Profile</h1>
        <p className="mb-4 text-xs text-slate-500">Manage your account and preferences</p>

        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-[#fdf3e3] via-[#fdeee8] to-[#f1ecfb] p-6">
          <button
            onClick={() => setProfileModalOpen(true)}
            className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-rose-500 shadow-sm ring-1 ring-rose-100 hover:shadow"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Profile
          </button>

          <div className="flex items-start gap-4">
            {account.isSignedIn ? (
              <UserAvatar
                size={64}
                loading={account.isLoading}
                pictureUrl={account.pictureUrl}
                initials={account.initials}
                name={name}
                className="ring-2 ring-white"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 ring-2 ring-white">
                <img
                  src={profile.avatarUrl}
                  alt={`${profile.name} avatar`}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-900">{name}</h2>
              <p className="text-sm text-violet-600">
                @{handle} · {role}
              </p>
              <p className="mt-1.5 max-w-xl text-sm text-slate-600">{profile.bio}</p>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined May 2024
                </span>
              </div>
            </div>
          </div>
        </div>

        {profileModalOpen && (
          <ProfileEditModal
            profile={profile}
            onSave={setProfile}
            onClose={() => setProfileModalOpen(false)}
          />
        )}

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={<Layers className="h-5 w-5" />}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            value={24}
            label="Designs Created"
            caption="+3 this month"
            captionColor="text-violet-500"
          />
          <StatCard
            icon={<Heart className="h-5 w-5" />}
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
            value={8}
            label="Favorites"
            caption="+1 this week"
            captionColor="text-rose-500"
          />
          <StatCard
            icon={<Download className="h-5 w-5" />}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            value={12}
            label="Exports"
            caption="+2 this month"
            captionColor="text-amber-500"
          />
          <StatCard
            icon={<Share2 className="h-5 w-5" />}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            value={2}
            label="Shared"
            caption="+1 this week"
            captionColor="text-violet-500"
          />
        </div>

        <div className="mt-6 flex items-end justify-between border-b border-slate-200">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("recent")}
              className={`relative pb-3 text-sm font-medium ${
                activeTab === "recent" ? "text-violet-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Recent Designs
              {activeTab === "recent" && (
                <span className="absolute -bottom-px left-0 h-0.5 w-full rounded-full bg-violet-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`relative pb-3 text-sm font-medium ${
                activeTab === "favorites" ? "text-violet-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Favorite Templates
              {activeTab === "favorites" && (
                <span className="absolute -bottom-px left-0 h-0.5 w-full rounded-full bg-violet-600" />
              )}
            </button>
          </div>
          <Link
            to="/templates"
            className="mb-2.5 rounded-full border border-violet-200 bg-white px-3.5 py-1 text-xs font-medium text-violet-600 hover:bg-violet-50"
          >
            View All
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RECENT_DESIGNS.slice(0, 6).map((d) => (
            <DesignCard key={`${activeTab}-${d.id}`} design={d} />
          ))}
        </div>
      </div>
    </div>
  );
}