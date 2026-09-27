import {
  Award, Baby, BookOpen, BriefcaseBusiness, CalendarDays, Camera, ClipboardCheck, Code, Dumbbell, FileUser, Flower2, Gift,
  Globe, GraduationCap, Heart, Landmark, Laptop, Leaf, Megaphone, Mic, Music, Network, Palette, PartyPopper,
  Presentation, School, Shapes, Sparkles, Star, Tent, Trophy, Users, Utensils, Wrench,
} from "lucide-react";

/*
 * A category's icon. The server keeps a category's icon as text (`icon`), so
 * an admin picks one from CATEGORY_ICONS and its key is what is saved. A
 * category without a saved icon — or with a key this app does not know —
 * gets one guessed from its name ("Final Examination" → the exam icon).
 */
export const CATEGORY_ICONS = [
  { key: "graduation-cap", label: "Graduation", Icon: GraduationCap },
  { key: "clipboard-check", label: "Exam", Icon: ClipboardCheck },
  { key: "wrench", label: "Workshop", Icon: Wrench },
  { key: "presentation", label: "Seminar", Icon: Presentation },
  { key: "tent", label: "Khmer event", Icon: Tent },
  { key: "landmark", label: "Culture", Icon: Landmark },
  { key: "briefcase-business", label: "Business", Icon: BriefcaseBusiness },
  { key: "trophy", label: "Competition", Icon: Trophy },
  { key: "file-user", label: "CV", Icon: FileUser },
  { key: "school", label: "School", Icon: School },
  { key: "party-popper", label: "Celebration", Icon: PartyPopper },
  { key: "gift", label: "Birthday", Icon: Gift },
  { key: "award", label: "Award", Icon: Award },
  { key: "music", label: "Music", Icon: Music },
  { key: "mic", label: "Talk", Icon: Mic },
  { key: "megaphone", label: "Announcement", Icon: Megaphone },
  { key: "users", label: "Community", Icon: Users },
  { key: "baby", label: "Children", Icon: Baby },
  { key: "heart", label: "Wedding", Icon: Heart },
  { key: "flower-2", label: "Festival", Icon: Flower2 },
  { key: "code", label: "Coding", Icon: Code },
  { key: "laptop", label: "Tech", Icon: Laptop },
  { key: "network", label: "Network", Icon: Network },
  { key: "book-open", label: "Study", Icon: BookOpen },
  { key: "palette", label: "Art", Icon: Palette },
  { key: "camera", label: "Photo", Icon: Camera },
  { key: "sparkles", label: "Creative", Icon: Sparkles },
  { key: "dumbbell", label: "Sport", Icon: Dumbbell },
  { key: "utensils", label: "Food", Icon: Utensils },
  { key: "leaf", label: "Nature", Icon: Leaf },
  { key: "globe", label: "Travel", Icon: Globe },
  { key: "calendar-days", label: "Event", Icon: CalendarDays },
  { key: "star", label: "Featured", Icon: Star },
  { key: "shapes", label: "Other", Icon: Shapes },
];

const BY_KEY = new Map(CATEGORY_ICONS.map((choice) => [choice.key, choice.Icon]));

// First match wins.
const RULES = [
  [/graduat|ceremony/i, "graduation-cap"],
  [/exam|test|quiz/i, "clipboard-check"],
  [/workshop|training|hands/i, "wrench"],
  [/seminar|conference|talk|lecture/i, "presentation"],
  [/khmer|new year|festival|tradition|culture/i, "tent"],
  [/portfolio|business|company|corporate/i, "briefcase-business"],
  [/competition|contest|hackathon|tournament/i, "trophy"],
  [/cv|resume|profile/i, "file-user"],
  [/school|class|campus|university/i, "school"],
  [/child|kid/i, "baby"],
  [/birthday/i, "gift"],
  [/wedding|love/i, "heart"],
  [/celebrat|party|anniversary|event/i, "party-popper"],
  [/award|certificate|achievement/i, "award"],
  [/concert|music|show/i, "music"],
  [/speech|podcast|interview/i, "mic"],
  [/meet|community|club|team/i, "users"],
  [/coding|developer|programming/i, "code"],
  [/network|tech/i, "laptop"],
  [/book|reading|library|study/i, "book-open"],
  [/art|design|creative/i, "sparkles"],
  [/sport|fitness|game/i, "dumbbell"],
];

/** The key a category's name suggests, for a category with no saved icon. */
export const guessCategoryIcon = (name = "") => RULES.find(([pattern]) => pattern.test(name))?.[1] || "shapes";

/** The icon to draw: the saved one when this app knows it, else the name's guess. */
export const categoryIcon = (name = "", icon = "") => BY_KEY.get(icon) || BY_KEY.get(guessCategoryIcon(name));

// Tints cycled by position (the .cm-icon colours), so neighbouring rows differ.
const TONES = ["purple", "orange", "green", "blue", "red", "teal", "yellow", "violet"];
export const categoryTone = (index) => TONES[index % TONES.length];
