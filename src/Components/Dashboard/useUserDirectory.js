import { useMemo } from "react";
import { useGetUsersQuery } from "../API/userApi";
import { pictureToUrl } from "../Account/useCurrentUser";

/* A person as the admin pages show them: a real name (or the username, or
   the email) and their profile picture — never a bare uuid. */
export function toPerson(user) {
  if (!user) return null;
  const fullName = [user.givenName, user.familyName].filter(Boolean).join(" ").trim();
  return {
    uuid: user.uuid,
    name: fullName || user.username || user.email || "Visora user",
    username: user.username || "",
    email: user.email || "",
    picture: pictureToUrl(user.picture),
    role: user.role?.role || "",
    createdAt: user.createdAt,
  };
}

/* Every account, looked up by uuid. The server stores who made or submitted
   a template as a uuid (submittedBy, ownerUuid); this turns it into a person. */
export function useUserDirectory() {
  const { data } = useGetUsersQuery({ pageNumber: 0, pageSize: 200 });
  return useMemo(() => {
    const people = (data?.data?.contents || []).map(toPerson);
    const byUuid = new Map(people.map((person) => [person.uuid, person]));
    return { people, find: (uuid) => byUuid.get(uuid) || null };
  }, [data]);
}
