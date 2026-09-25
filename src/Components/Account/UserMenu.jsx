import UserProfile from "./UserProfile";

// Preserve the existing unframed menu for callers outside the shared headers.
export default function UserMenu(props) {
  return <UserProfile framed={false} {...props} />;
}
