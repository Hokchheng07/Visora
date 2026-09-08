import { Send } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { ThemeImage } from "../../theme/ThemeImage";
import githubIcon from "../../assets/Website/Footer-Section/github.png";
import facebookIcon from "../../assets/Website/Footer-Section/facebook.png";
import purpleFrame from "../../assets/Website/AboutUs/Cards/purpleCard/PurpleFram.svg";
import purpleBackground from "../../assets/Website/AboutUs/Cards/purpleCard/prupleBg.svg";
import purpleBlob from "../../assets/Website/AboutUs/Cards/purpleCard/PurpleBlob.svg";
import purpleSolidLine from "../../assets/Website/AboutUs/Cards/purpleCard/SolidLine.svg";
import purpleDashLine from "../../assets/Website/AboutUs/Cards/purpleCard/DashLine.svg";
import yellowFrame from "../../assets/Website/AboutUs/Cards/yellowCard/CardFrame(Yellow)..svg";
import yellowBackground from "../../assets/Website/AboutUs/Cards/yellowCard/CardBG(Yellow).svg";
import yellowBlob from "../../assets/Website/AboutUs/Cards/yellowCard/BlobBehindPicture(Yellow)..svg";
import yellowSolidLine from "../../assets/Website/AboutUs/Cards/yellowCard/SolidLine(Yellow)..svg";
import yellowDashLine from "../../assets/Website/AboutUs/Cards/yellowCard/DashCircle(Yellow)..svg";

const socialIcons = {
  github: { image: githubIcon },
  facebook: { image: facebookIcon },
  telegram: { Icon: Send },
};

const cardThemes = {
  purple: {
    frame: purpleFrame,
    background: purpleBackground,
    blob: purpleBlob,
    solidLine: purpleSolidLine,
    dashLine: purpleDashLine,
  },
  yellow: {
    frame: yellowFrame,
    background: yellowBackground,
    blob: yellowBlob,
    solidLine: yellowSolidLine,
    dashLine: yellowDashLine,
  },
};

const getInitials = (name) => name
  .split(/\s+/)
  .map((part) => part[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

export default function PersonCard({ person, index = 0 }) {
  const reduceMotion = useReducedMotion();
  const availableSocials = Object.entries(socialIcons).filter(([name]) => person[name]);
  const featuredRole = person.role !== "Member";
  const tone = index % 2 === 0 ? "purple" : "yellow";
  const cardTheme = cardThemes[tone];

  return (
    <motion.article
      className={`about-person-card about-person-card-${tone}`}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 25 }}
    >
      <ThemeImage className="about-person-card-background" src={cardTheme.background} alt="" aria-hidden="true" />
      <ThemeImage className="about-person-card-frame" src={cardTheme.frame} alt="" aria-hidden="true" />

      <div className="about-person-portrait" aria-label={`${person.name}, ${person.role}`}>
        <ThemeImage className="about-person-portrait-blob" src={cardTheme.blob} alt="" aria-hidden="true" />
        {person.photo ? (
          <ThemeImage className="about-person-photo" src={person.photo} alt={`${person.name}, ${person.role}`} />
        ) : (
          <div className="about-person-placeholder" aria-hidden="true">
            {getInitials(person.name)}
          </div>
        )}
        <ThemeImage className="about-person-portrait-line about-person-portrait-line-solid" src={cardTheme.solidLine} alt="" aria-hidden="true" />
        <ThemeImage className="about-person-portrait-line about-person-portrait-line-dashed" src={cardTheme.dashLine} alt="" aria-hidden="true" />
      </div>

      <div className="about-person-content">
        <h3>{person.name}</h3>
        <span className={`about-person-role ${featuredRole ? "about-person-role-featured" : ""}`}>
          {person.role}
        </span>
        {/* The design reserves a quote line on every card and shows it as
            “ ······ ” until copy exists, so the empty state is the reference's
            own placeholder rather than a gap in the middle of the card. */}
        {person.quote ? (
          <p className="about-person-quote">{`“${person.quote}”`}</p>
        ) : (
          <p className="about-person-quote about-person-quote-empty" aria-hidden="true">
            <span>&ldquo;</span>
            <span className="about-person-quote-dots" />
            <span>&rdquo;</span>
          </p>
        )}
        <span className="about-person-divider" aria-hidden="true" />

        {availableSocials.length ? (
          <div className="about-person-socials" aria-label={`${person.name} social links`}>
            {availableSocials.map(([name, { Icon, image }]) => (
              <a key={name} href={person[name]} target="_blank" rel="noreferrer" aria-label={`${person.name} on ${name}`}>
                {Icon ? (
                  <Icon aria-hidden="true" />
                ) : (
                  <ThemeImage src={image} alt="" aria-hidden="true" />
                )}
              </a>
            ))}
          </div>
        ) : (
          <div className="about-person-socials about-person-socials-disabled" aria-hidden="true">
            <span><ThemeImage src={githubIcon} alt="" /></span>
            <span><ThemeImage src={facebookIcon} alt="" /></span>
            <span><Send /></span>
          </div>
        )}
      </div>
    </motion.article>
  );
}
