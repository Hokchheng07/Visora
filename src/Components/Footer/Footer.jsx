import visoraLogo from "../../assets/Website/VisoraLogo.png";
import facebook from "../../assets/footer/facebook.png";
import instagram from "../../assets/footer/instagram.png";
import github from "../../assets/footer/github.png";
import letter from "../../assets/footer/letter.png";
import line from "../../assets/footer/line.png";
import logo from "../../assets/footer/logo.png";

const footerLinks = [
  {
    title: "Product",
    color: "primary",
    links: [
      "Templates",
      "Features",
      "Custom Branding",
      "What's New",
      "Pricing",
    ],
  },
  {
    title: "Resources",
    color: "accent",
    links: [
      "Templates Library",
      "Blog & Tips",
      "Guides",
      "Webinars",
      "Help Center",
    ],
  },
  {
    title: "Company",
    color: "primary",
    links: [
      "Help Center",
      "Contact Support",
      "Live Chat",
      "System Status",
      "Feedback",
    ],
  },
  {
    title: "Support",
    color: "accent",
    links: [
      "About Us",
      "Our Story",
      "Press Kit",
      "Careers",
      "Contact Us",
    ],
  },
];

const socialLinks = [
  {
    name: "Facebook",
    icon: facebook,
    className: "h-10 w-10",
  },
  {
    name: "Instagram",
    icon: instagram,
    className: "h-10 w-10 scale-[1.5]",
  },
  {
    name: "GitHub",
    icon: github,
    className: "h-10 w-10",
  },
];

const legalLinks = ["Privacy Policy", "Terms of Service", "Cookie Policy"];

const ZigzagUnderline = ({ color }) => (
  <svg
    viewBox="0 0 120 14"
    className={`mt-1 h-[12px] w-[100px] ${
      color === "primary" ? "text-primary" : "text-accent"
    }`}
    fill="none"
  >
    <path
      d="M2 10 L16 3 L29 10 L43 3 L57 10 L71 3 L85 10 L99 3 L113 10"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-sparkle relative overflow-hidden bg-white font-sans text-[#252525]">
     <div className="relative z-10 mx-auto max-w-[1440px] px-5 pt-10 pb-24 sm:px-8 sm:pt-12 lg:px-10 lg:pt-14 lg:pb-28 xl:px-14">
        {/* TOP FOOTER */}
        <div className="grid grid-cols-1 gap-12 xl:grid-cols-[1.05fr_2.3fr_1fr] xl:gap-10">
          {/* BRAND */}
          <div className="flex flex-col items-center text-center xl:items-start xl:text-left">
            <img
              src={visoraLogo}
              alt="Visora"
              className="mb-6 w-[190px] object-contain sm:w-[220px] lg:w-[240px]"
            />

            <h3 className=" text-center max-w-[330px] text-[20px] leading-[1.5] font-semibold sm:text-[22px]">
              Visora is your digital backdrop platform for creative events.
            </h3>

            <p className=" text-center mt-4 max-w-[320px] text-[15px] leading-7 text-gray-500 sm:text-[16px]">
              Create beautiful immersive backdrops with ease so you can focus
              on what truly matters.
            </p>

            {/* SOCIAL ICONS */}
            <div className="mt-6 flex w-full items-center justify-center gap-5">
              {socialLinks.map(({ name, icon, className }) => (
                <a
                  key={name}
                  href="#"
                  aria-label={name}
                  className="flex h-11 w-11 items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:scale-105"
                >
                  <img
                    src={icon}
                    alt={name}
                    className={`${className} object-contain`}
                  />
                </a>
              ))}
            </div>
          </div>

          {/* FOOTER LINKS */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-x-8 xl:pt-4">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h3 className="text-[17px] font-semibold text-[#262626] sm:text-[18px]">
                  {section.title}
                </h3>

                <ZigzagUnderline color={section.color} />

                <ul className="mt-5 space-y-4">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="inline-block text-[15px] leading-6 text-gray-600 transition-all duration-200 hover:translate-x-1 hover:text-primary sm:text-[16px]"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* NEWSLETTER */}
          <div className="flex justify-center xl:justify-end">
            <div className="w-full max-w-[360px] rounded-[24px] border border-secondary/70 bg-white px-6 py-6 shadow-[0_8px_30px_rgba(104,84,218,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(104,84,218,0.16)] xl:max-w-[310px]">
              <div className="flex justify-center">
                <img
                  src={letter}
                  alt="Newsletter"
                  className="h-[75px] w-[100px] object-contain sm:h-[85px] sm:w-[110px]"
                />
              </div>

              <h3 className="mt-2 text-center text-[20px] font-semibold sm:text-[22px]">
                <span className="text-secondary">Stay in the </span>
                <span className="text-accent">Loop</span>
              </h3>

              <p className="mx-auto mt-3 max-w-[270px] text-center text-[14px] leading-6 text-gray-400 sm:text-[16px]">
                Get tips, new templates, and product updates straight to your
                inbox.
              </p>

              <form
                className="mt-6"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="h-12 w-full rounded-full border border-gray-200 bg-white px-5 text-[15px] text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10 sm:text-[16px]"
                />

                <button
                  type="submit"
                  className="mt-3 h-12 w-full cursor-pointer rounded-full bg-gradient-to-r from-primary via-secondary to-accent text-[16px] font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="mt-12 border-t border-dashed border-accent/60 lg:mt-14" />

        {/* BOTTOM FOOTER */}
        <div className="mt-7 flex flex-col items-center gap-7 lg:flex-row lg:justify-between">
          {/* COPYRIGHT */}
          <div className="text-center lg:text-left">
            <p className="text-[14px] leading-7 text-gray-700 sm:text-[16px]">
              ©2024 Visora. All rights reserved
            </p>

            <p className="flex items-center text-center justify-center gap-1 text-[14px] text-gray-700 sm:text-[16px] lg:justify-start">
              Made with
              <span className="mx-1 text-[20px] text-primary">♥</span>
              for creators worldwide
            </p>
          </div>

          {/* LEGAL LINKS */}
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 sm:gap-x-10">
            {legalLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="text-[14px] font-medium text-primary transition-colors hover:text-accent sm:text-[16px]"
              >
                {link}
              </a>
            ))}
          </div>

          {/* SPONSOR */}
          <div className="flex items-center justify-center gap-4">
            <p className="text-center text-[14px] font-semibold leading-5 text-primary sm:text-[16px]">
              Sponsored and
              <br />
              organized by
            </p>

            <img
              src={logo}
              alt="ISTAD"
              className="h-[50px] w-auto object-contain sm:h-[60px] lg:h-[65px]"
            />
          </div>
        </div>
      </div>

      {/* FOOTER WAVE */}
      <img
  src={line}
  alt=""
  aria-hidden="true"
  className="pointer-events-none absolute bottom-0 left-1/2 z-0 h-[90px] w-screen max-w-none -translate-x-1/2 object-fill sm:h-[110px] md:h-[130px] lg:h-[145px] xl:h-[155px]"
/>
    </footer>
  );
};

export default Footer;