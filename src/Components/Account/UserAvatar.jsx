import { useState } from "react";
import "./user-menu.css";

// A round picture of the user, with their initials when there is no picture
// (or it fails to load) and a soft placeholder while the profile is loading.
export default function UserAvatar({ pictureUrl, initials = "?", name = "", size = 40, loading = false, className = "" }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const showPicture = pictureUrl && failedUrl !== pictureUrl;

  return (
    <span
      className={`user-avatar ${loading ? "is-loading" : ""} ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
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
}
