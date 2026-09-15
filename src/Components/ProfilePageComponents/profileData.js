// Placeholder profile content until the account API exists.
export const STANDARD_TAGS = [
  { label: "Workshop", color: "violet" },
  { label: "Modern", color: "blue" },
  { label: "Creative", color: "green" },
];

export const RECENT_DESIGNS = [
  { id: "d1", title: "Creative Portfolio", subtitle: "Design with your ideas and creative", tags: STANDARD_TAGS, uses: 250, art: "portfolio" },
  { id: "d2", title: "Frontend Examination", subtitle: "Design with your ideas and creative", tags: STANDARD_TAGS, uses: 250, art: "exam" },
  { id: "d3", title: "Creative doodle", subtitle: "Design with your ideas and creative", tags: STANDARD_TAGS, uses: 250, art: "doodle" },
  { id: "d4", title: "Creative Portfolio", subtitle: "Design with your ideas and creative", tags: STANDARD_TAGS, uses: 250, art: "portfolio" },
  { id: "d5", title: "Frontend Examination", subtitle: "Design with your ideas and creative", tags: STANDARD_TAGS, uses: 250, art: "exam" },
  { id: "d6", title: "Creative doodle", subtitle: "Design with your ideas and creative", tags: STANDARD_TAGS, uses: 250, art: "doodle" },
  { id: "d7", title: "Creative Portfolio", subtitle: "Design with your ideas and creative", tags: STANDARD_TAGS, uses: 180, art: "portfolio" },
  { id: "d8", title: "Frontend Examination", subtitle: "Design with your ideas and creative", tags: STANDARD_TAGS, uses: 165, art: "exam" },
  { id: "d9", title: "Creative doodle", subtitle: "Design with your ideas and creative", tags: STANDARD_TAGS, uses: 142, art: "doodle" },
];

export const TAG_COLORS = {
  violet: "bg-violet-100 text-violet-600",
  blue: "bg-indigo-100 text-indigo-600",
  green: "bg-emerald-100 text-emerald-600",
};

export const DEFAULT_PROFILE = {
  avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=ChitChimy",
  name: "Chit Chimy",
  handle: "chitchimy",
  role: "UI/UX Designer & Creative Developer",
  bio: "Crafting tactile, organic digital experiences that bridge the gap between logical structure and playful expression. Paper texture enthusiast.",
  location: "Phnom Penh, Cambodia",
};

export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
