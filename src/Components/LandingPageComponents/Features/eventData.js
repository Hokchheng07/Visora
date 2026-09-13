import birthdayCard from "../../../assets/pages/home/explore-by-events/hanging-cards/DarkBlueCard.png";
import graduationCard from "../../../assets/pages/home/explore-by-events/hanging-cards/Purple.png";
import examinationCard from "../../../assets/pages/home/explore-by-events/hanging-cards/PinkCard.png";
import schoolCard from "../../../assets/pages/home/explore-by-events/hanging-cards/BlueCard.png";
import khmerCard from "../../../assets/pages/home/explore-by-events/hanging-cards/YellowCard.png";
import communityCard from "../../../assets/pages/home/explore-by-events/hanging-cards/GreenCard.png";

// The offsets follow the authored dashed path and intentionally produce the
// loose, pin-board rhythm in the Figma composition. Keep ids stable when these
// records are replaced with API data.
export const placeholderEvents = [
  {
    id: "birthday",
    title: "Birthdays",
    description: "Make birthdays shine with joyful backdrops for every celebration.",
    image: birthdayCard,
    tone: "dark-blue",
    offset: 0,
    pin: { x: 0.52, y: 0.145 },
    contentRotation: 1,
    width: 258,
    gapAfter: 29,
  },
  {
    id: "graduation",
    title: "Graduation",
    description: "Celebrate achievements with elegant graduation backdrops.",
    image: graduationCard,
    tone: "purple",
    offset: 46,
    pin: { x: 0.569, y: 0.168 },
    contentRotation: 9,
    width: 285,
    gapAfter: 48,
  },
  {
    id: "examination",
    title: "Examination",
    description: "Create professional backdrops for exams, assessments, and academic events.",
    image: examinationCard,
    tone: "pink",
    offset: 124,
    pin: { x: 0.479, y: 0.143 },
    contentRotation: -1,
    width: 254,
    gapAfter: 43,
  },
  {
    id: "school-events",
    title: "School Events",
    description: "Fun and memorable designs for school celebrations and activities.",
    image: schoolCard,
    tone: "blue",
    offset: 122,
    pin: { x: 0.519, y: 0.148 },
    contentRotation: 1,
    width: 259,
    gapAfter: 51,
  },
  {
    id: "khmer-event",
    title: "Khmer Event",
    description: "Beautiful Khmer-inspired backdrops featuring traditional patterns.",
    image: khmerCard,
    tone: "yellow",
    offset: 69,
    pin: { x: 0.427, y: 0.191 },
    contentRotation: -8,
    width: 281,
    gapAfter: 28,
  },
  {
    id: "community-events",
    title: "Community Events",
    description: "Bring workshops and community gatherings to life with fresh designs.",
    image: communityCard,
    tone: "green",
    offset: 16,
    pin: { x: 0.462, y: 0.154 },
    contentRotation: -1,
    width: 262,
    gapAfter: 29,
  },
];
