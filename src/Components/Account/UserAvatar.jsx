import { useState } from "react";
import "./user-menu.css";

// A round picture of the user, with their initials when there is no picture
// (or it fails to load) and a soft placeholder while the profile is loading.
export default function UserAvatar({ pictureUrl, initials = "?", name = "", size = 40, loading = false, className = "", frameSrc, avatarScale = 0.7 }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const showPicture = pictureUrl && failedUrl !== pictureUrl;

  const scale = frameSrc ? avatarScale : 1;
  const avatarSize = typeof size === "number" ? Math.round(size * scale) : `calc(${size} * ${scale})`;
  const fontSize = typeof avatarSize === "number" ? Math.round(avatarSize * 0.38) : `calc(${avatarSize} * 0.38)`;
  const avatar = (
    <span
      className={`user-avatar ${loading ? "is-loading" : ""} ${className}`}
      style={{ width: avatarSize, height: avatarSize, fontSize }}
      aria-hidden="true"
      title={name || undefined}
    >
      {loading ? null : showPicture ? (
        <img src={pictureUrl} alt="" onError={() => setFailedUrl(pictureUrl)} draggable={false} />
      ) : (
        initials
      )}
    </span>
  );

  if (!frameSrc) return avatar;

  return (
    <span className="user-avatar-frame" style={{ width: size, height: size }} aria-hidden="true">
      {avatar}
      <img className="user-avatar-frame-art" src={frameSrc} alt="" draggable={false} />
    </span>
  );
}
