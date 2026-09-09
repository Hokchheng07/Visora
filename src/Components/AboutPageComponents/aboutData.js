import builtForCreators from "../../assets/pages/about/core-values/BuildForEventCreators.svg";
import inspiredByCambodia from "../../assets/pages/about/core-values/InspiredByCambodia.svg";
import simpleAndPowerful from "../../assets/pages/about/core-values/SimpleNPowerful.svg";
import forEveryoneAnywhere from "../../assets/pages/about/core-values/ForEveryoneEveryWhere.svg";
import purpleFeatureCard from "../../assets/pages/about/design-present-inspire/PurpleCard.png";
import blueFeatureCard from "../../assets/pages/about/design-present-inspire/BlueCardAboutUs.svg";
import pinkFeatureCard from "../../assets/pages/about/design-present-inspire/PinkCardAboutUS.svg";
import yellowFeatureCard from "../../assets/pages/about/design-present-inspire/YellowCardAboutUs.png";
import purplePin from "../../assets/pages/about/design-present-inspire/PurplePin.svg";
import bluePin from "../../assets/pages/about/design-present-inspire/BluePin.svg";
import pinkPin from "../../assets/pages/about/design-present-inspire/PinkPin.svg";
import yellowPin from "../../assets/pages/about/design-present-inspire/YellowPin.svg";
import mentorChipor from "../../assets/pages/about/people/mentors/MentorChipor.jpg";
import mentorVannda from "../../assets/pages/about/people/mentors/MentorVannda.jpg";
import photoHokChheng from "../../assets/pages/about/people/team/Hokchheng.png";
import photoSenghak from "../../assets/pages/about/people/team/InfinityHak.jpg";
import photoLily from "../../assets/pages/about/people/team/Lily.png";
import photoChimy from "../../assets/pages/about/people/team/Chimy.png";
import photoBora from "../../assets/pages/about/people/team/Bora.jpg";
import photoSovannrith from "../../assets/pages/about/people/team/Sovannarith.jpg";
import photoSothearith from "../../assets/pages/about/people/team/Sothearith.png";
import photoSengheang from "../../assets/pages/about/people/team/Sengheang.png";

export const coreValues = [
  {
    title: "Built for Event Creators",
    description: "Helping anyone design stunning backdrops without design skills.",
    artwork: builtForCreators,
  },
  {
    title: "Inspired by Cambodia",
    description: "Rooted in Khmer culture and inspired by its timeless beauty and traditions.",
    artwork: inspiredByCambodia,
  },
  {
    title: "Simple & Powerful",
    description: "Clean tools that make design easy and results unforgettable.",
    artwork: simpleAndPowerful,
  },
  {
    title: "For Everyone, Anywhere",
    description: "Create, collaborate, and present from anywhere, on any device.",
    artwork: forEveryoneAnywhere,
  },
];

export const featureCards = [
  {
    title: "Khmer-Inspired Design Support",
    description: "Use Khmer elements, patterns, text styles, templates, and cultural illustrations.",
    artwork: purpleFeatureCard,
    pin: purplePin,
    tone: "purple",
    offset: 0,
  },
  {
    title: "Design like Canva",
    description: "Drag, drop, and customize templates with easy tools.",
    artwork: blueFeatureCard,
    pin: bluePin,
    tone: "blue",
    offset: 13,
  },
  {
    title: "Create Event Backdrops Easily",
    description: "Make backdrops for weddings, graduations, school events, and more.",
    artwork: pinkFeatureCard,
    pin: pinkPin,
    tone: "pink",
    offset: 36,
  },
  {
    title: "Present like PowerPoint",
    description: "Display your backdrop in presentation mode or full screen with ease.",
    artwork: yellowFeatureCard,
    pin: yellowPin,
    tone: "yellow",
    offset: 141,
  },
];

export const mentors = [
  { name: "Sreng Chipor", role: "Mentor", photo: mentorChipor, github: null, facebook: null, telegram: null },
  { name: "Kung Sovannda", role: "Mentor", photo: mentorVannda, github: null, facebook: null, telegram: null },
];

/* `quote` is optional; cards without one omit the quote line. */
export const members = [
  { name: "Chhun HokChheng", role: "Leader", photo: photoHokChheng, quote: "Set your heart Ablaze", github: null, facebook: null, telegram: null },
  { name: "Men Senghak", role: "Sub-leader", photo: photoSenghak, quote: null, github: null, facebook: null, telegram: null },
  { name: "Lay Lily", role: "Member", photo: photoLily, quote:"Just because you don't give up doesn't mean you will make it", github: null, facebook: null, telegram: null },
  { name: "Chit Chimy", role: "Member", photo: photoChimy, quote: "Small steps every day lead to big results.", github: null, facebook: null, telegram: null },
  { name: "Nin Bora", role: "Member", photo: photoBora, quote: null, github: null, facebook: null, telegram: null },
  { name: "Von Sovannrith", role: "Member", photo: photoSovannrith, quote: null, github: null, facebook: null, telegram: null },
  { name: "Borey Sothearith", role: "Member", photo: photoSothearith, quote: "Every bug is a lesson. Every solution is progress.", github: null, facebook: null, telegram: null },
  { name: "Kao Sengheang", role: "Member", photo: photoSengheang, quote: "Rain feel like home", github: null, facebook: null, telegram: null },
];
