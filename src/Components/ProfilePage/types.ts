export type Design = {
  id: string;
  title: string;
  subtitle: string;
  tags: { label: string; color: "violet" | "blue" | "green" }[];
  uses: number;
  art: "portfolio" | "exam" | "doodle";
};

export type ProfileInfo = {
  avatarUrl: string;
  name: string;
  handle: string;
  role: string;
  bio: string;
  location: string;
};