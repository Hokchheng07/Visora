import { motion } from "motion/react";
import visoraLogo from "../../assets/Website/VisoraLogo.png";
import facebook from "../../assets/Website/Footer-Section/facebook.png";
import instagram from "../../assets/Website/Footer-Section/instagram.png";
import github from "../../assets/Website/Footer-Section/github.png";
import logo from "../../assets/Website/Footer-Section/logo.png";
import {
  fadeIn,
  fadeInUp,
  scaleIn,
  staggerContainer,
  viewportOnce,
} from "../../lib/animations/animations";

const footerLinks = [
  {
    title: "Resources",
    color: "accent",
    links: [
      "Template Library",
      "Event Templates",
      "CV & Portfolio",
      "Graduation Templates",
      "Khmer Template",
    ],
  },
  {
    title: "Company",
    color: "primary",
    links: [
      "About Us",
      "Features",
      "How It Works",
      "Our Member",
      "Our Team",
    ],
  },
  {
    title: "Support",
    color: "accent",
    links: [
      "Contact Us",
      "User Guide",
      "FAQs",
      "Report a Problem",
      "Feedback",
    ],
  },
];

const socialLinks = [
  { name: "Facebook", icon: facebook },
  { name: "Instagram", icon: instagram },
  { name: "GitHub", icon: github },
];

const legalLinks = [
  "Privacy Policy",
  "Terms of Service",
  "Cookie Policy",
];

const Zigzag = ({ color = "accent", sponsor = false }) => (
  <svg
    viewBox={sponsor ? "0 0 320 14" : "0 0 120 14"}
    className={`mt-1 h-3 ${
      sponsor ? "w-[230px] md:w-[280px] lg:w-[300px]" : "w-[105px]"
    } ${color === "primary" ? "text-primary" : "text-accent"}`}
    fill="none"
  >
    <path
      d={
        sponsor
          ? "M2 9 L16 3 L30 9 L44 3 L58 9 L72 3 L86 9 L100 3 L114 9 L128 3 L142 9 L156 3 L170 9 L184 3 L198 9 L212 3 L226 9 L240 3 L254 9 L268 3 L282 9 L296 3 L310 9"
          : "M2 9 L14 3 L26 9 L38 3 L50 9 L62 3 L74 9 L86 3 L98 9 L110 3"
      }
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Brand = () => (
  <motion.div
    className="flex flex-col items-center text-center xl:items-start xl:text-left"
    variants={fadeInUp}
  >
    <img
      src={visoraLogo}
      alt="Visora"
      className="w-[260px] object-contain sm:w-[280px] md:w-[300px] lg:w-[315px] xl:w-[320px]"
    />

    <p className="mt-7 max-w-[320px] text-[18px] leading-[1.55] text-[#696969]">
      Create beautiful immersive backdrops with ease so you can focus on what
      truly matters.
    </p>

    <div className="mt-5 flex gap-5">
      {socialLinks.map(({ name, icon }) => (
        <motion.a
          key={name}
          href="#"
          aria-label={name}
          className="flex h-11 w-11 items-center justify-center transition hover:-translate-y-1"
          whileHover={{ y: -4, scale: 1.08 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
        >
          <img
            src={icon}
            alt={name}
            className="h-10 w-10 object-contain"
          />
        </motion.a>
      ))}
    </div>
  </motion.div>
);

const FooterColumn = ({ title, color, links, centered = false }) => (
  <motion.div
    className={`flex min-w-0 flex-col ${
      centered
        ? "items-center text-center"
        : "items-center text-center xl:items-start xl:text-left"
    }`}
    variants={fadeInUp}
  >
    <h3 className="text-[20px] font-semibold sm:text-[22px]">
      {title}
    </h3>

    <Zigzag color={color} />

    <ul className="mt-5 space-y-4">
      {links.map((link) => (
        <li key={link}>
          <a
            href="#"
            className="block max-w-[140px] whitespace-normal text-[14px] leading-6text-[#444] transition hover:text-primary sm:max-w-none sm:text-[18px]"
          >
            {link}
          </a>
        </li>
      ))}
    </ul>
  </motion.div>
);

const Sponsor = () => (
  <motion.div
    className="flex flex-col items-center text-center"
    variants={scaleIn}
  >
    <h3 className="whitespace-nowrap text-[20px] font-semibold sm:text-[22px]">
      Sponsored and Organized by
    </h3>

    <Zigzag color="primary" sponsor />

    <img
      src={logo}
      alt="ISTAD"
      className="mt-5 h-[95px] object-contain sm:h-[105px] md:h-[110px] lg:h-[115px] xl:h-[120px]"
    />
  </motion.div>
);

const Footer = () => (
  <footer className="relative shrink-0 overflow-hidden bg-white font-sans text-[#252525]">
    {/* Background dots */}
    <motion.div
      className="bg-sparkle pointer-events-none absolute inset-0"
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      variants={fadeIn}
    />

    <div className="relative z-10 mx-auto max-w-[1500px] px-5 pt-12 pb-2 sm:px-8 lg:px-12 xl:px-14">
      {/* MOBILE */}
      <motion.div
        className="sm:hidden"
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={staggerContainer(0.12)}
      >
        <Brand />

        <div className="mt-12 grid grid-cols-2 gap-5">
          <FooterColumn {...footerLinks[0]} centered />
          <FooterColumn {...footerLinks[1]} centered />
        </div>

        <div className="mt-12 flex justify-center">
          <FooterColumn {...footerLinks[2]} centered />
        </div>

        <div className="mt-12">
          <Sponsor />
        </div>
      </motion.div>

      {/* 640px - 1279px */}
      <motion.div
        className="hidden sm:block xl:hidden"
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={staggerContainer(0.12)}
      >
        <div className="mx-auto grid max-w-[1050px] grid-cols-2 items-start gap-8 lg:gap-14">
          <Brand />

          {/* Align Sponsor with Visora at 768px and 1024px */}
          <div className="pt-5 md:pt-20">
            <Sponsor />
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-[900px] grid-cols-3 justify-items-center gap-6 lg:gap-12">
          {footerLinks.map((item) => (
            <FooterColumn key={item.title} {...item} centered />
          ))}
        </div>
      </motion.div>

      {/* 1280px+ */}
      <motion.div
        className="hidden xl:grid xl:grid-cols-[1.3fr_.85fr_.85fr_.85fr_1.45fr] xl:items-start xl:gap-10"
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={staggerContainer(0.12)}
      >
        <Brand />

        {footerLinks.map((item) => (
          <FooterColumn key={item.title} {...item} />
        ))}

        <Sponsor />
      </motion.div>

      {/* Divider */}
      <div className="mt-8 border-t border-dashed border-[#F0C04A]" />

      {/* Bottom */}
      <motion.div
        className="flex flex-col items-center justify-between gap-6 py-4 lg:flex-row pb-0"
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={fadeInUp}
      >
        <p className="text-center text-[16px] sm:text-left sm:text-[18px]">
          @2026 Visora. All rights reserved
        </p>

        <div className="flex flex-wrap justify-center gap-x-10 gap-y-5">
          {legalLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="text-[18px] text-[#745AE8] transition hover:text-accent"
            >
              {link}
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  </footer>
);

export default Footer;
