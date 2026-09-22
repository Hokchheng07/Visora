import "./profile-avatar-frame.css";

export default function ProfileAvatarFrame({ profile, compact = false }) {
  return (
    <span className={`profile-avatar-frame${compact ? " profile-avatar-frame-compact" : ""}`}>
      <span className="profile-avatar-frame-ring">
        <img src={profile.avatarUrl} alt={`${profile.name} avatar`} />
      </span>
      <span className="profile-avatar-frame-spark" aria-hidden="true" />
      <span className="profile-avatar-frame-dot" aria-hidden="true" />
    </span>
  );
}
