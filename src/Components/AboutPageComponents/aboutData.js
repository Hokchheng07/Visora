import builtForCreators from "../../assets/Website/AboutUs/BuildForEventCreators.svg";
import inspiredByCambodia from "../../assets/Website/AboutUs/InspiredByCambodia.svg";
import simpleAndPowerful from "../../assets/Website/AboutUs/SimpleNPowerful.svg";
import forEveryoneAnywhere from "../../assets/Website/AboutUs/ForEverOne,AnyWhere.png";
import purpleFeatureCard from "../../assets/Website/AboutUs/PurpleCard.png";
import blueFeatureCard from "../../assets/Website/AboutUs/BlueCardAboutUs.svg";
import pinkFeatureCard from "../../assets/Website/AboutUs/PinkCardAboutUS.svg";
import yellowFeatureCard from "../../assets/Website/AboutUs/YellowCardAboutUs.png";
import purplePin from "../../assets/Website/AboutUs/PurplePin.svg";
import bluePin from "../../assets/Website/AboutUs/BluePin.svg";
import pinkPin from "../../assets/Website/AboutUs/PinkPin.svg";
import yellowPin from "../../assets/Website/AboutUs/YellowPin.svg";
import mentorChipor from "../../assets/Mentor/MentorChipor.jpg";
import mentorVannda from "../../assets/Mentor/MentorVannda.jpg";
import photoHokChheng from "../../assets/Team/Hokchheng.png";
import photoSenghak from "../../assets/Team/InfinityHak.jpg";
import photoLily from "../../assets/Team/Lily.png";
import photoChimy from "../../assets/Team/Chimy.png";
import photoBora from "../../assets/Team/Bora.jpg";
import photoSovannrith from "../../assets/Team/Sovannarith.jpg";
import photoSothearith from "../../assets/Team/Sothearith.png";
import photoSengheang from "../../assets/Team/Sengheang.png";

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

/* `quote` is optional — the card reserves room for one and simply omits the
   element when it is absent, so lines can be filled in per person later
   without another layout pass. */
export const members = [
  { name: "Chhun HokChheng", role: "Leader", photo: photoHokChheng, quote: null, github: null, facebook: null, telegram: null },
  { name: "Men Senghak", role: "Sub-leader", photo: photoSenghak, quote: null, github: null, facebook: null, telegram: null },
  { name: "Lay Lily", role: "Member", photo: photoLily, quote: null, github: null, facebook: null, telegram: null },
  { name: "Chit Chimy", role: "Member", photo: photoChimy, quote: null, github: null, facebook: null, telegram: null },
  { name: "Nin Bora", role: "Member", photo: photoBora, quote: null, github: null, facebook: null, telegram: null },
  { name: "Von Sovannrith", role: "Member", photo: photoSovannrith, quote: null, github: null, facebook: null, telegram: null },
  { name: "Borey Sothearith", role: "Member", photo: photoSothearith, quote: null, github: null, facebook: null, telegram: null },
  { name: "Kao Sengheang", role: "Member", photo: photoSengheang, quote: null, github: null, facebook: null, telegram: null },
];
