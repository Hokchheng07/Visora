import { motion } from "motion/react";
import blobArtwork from "../../assets/Website/LandingPage/WhyChooseVisora/why-choose-blob.png";
import linearBg from "../../assets/Website/LandingPage/WhyChooseVisora/WhyChooseVisoraLinear.svg";
import apsara from "../../assets/Website/LandingPage/WhyChooseVisora/AsparaWhyChoose.svg";
import spiralArrow from "../../assets/Website/LandingPage/PopularTemplates/SpiralArrow.png";
import arrowWithPlane from "../../assets/Website/LandingPage/Hero-Section/ArrowNPlane.png";
import screwCard from "../../assets/Website/LandingPage/WhyChooseVisora/ScrewCard.svg";
import entireBlue from "../../assets/Website/LandingPage/WhyChooseVisora/EntireBlue(WhyChoose).svg";
import entirePink from "../../assets/Website/LandingPage/WhyChooseVisora/EntirePink(WhyChoose)..svg";
import entireYellow from "../../assets/Website/LandingPage/WhyChooseVisora/EntireYellow(WhyChoose)..svg";
import { fadeInUp, popIn, staggerContainer, viewportOnce } from "../../lib/animations";

const benefits = [
  { title: "Easy to Customize", copy: "Design beautiful backdrops without advanced design skills.", color: "#705ae0", groupedIcon: screwCard },
  { title: "Khmer-Inspired", copy: "Use Cambodian cultural elements and Khmer fonts.", color: "#45bfd1", groupedIcon: entireBlue },
  { title: "Event Ready", copy: "Add countdown timers and event information.", color: "#ffc21c", groupedIcon: entireYellow },
  { title: "Display Anywhere", copy: "Designed for projectors, TVs, LED screens and large displays.", color: "#e16ac9", groupedIcon: entirePink },
];

export default function WhyChooseVisora() {
  return (
    <section className="features-section relative isolate w-full overflow-hidden px-8 py-20 sm:px-16 lg:px-20 lg:py-24">
      <motion.img
        src={blobArtwork}
        alt=""
        aria-hidden="true"
        className="features-art"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={viewportOnce}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
      <img src={linearBg} alt="" aria-hidden="true" className="features-linear-bg" />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-br from-[#b294f0]/20 via-transparent to-[#ffc21c]/35" />
      <div className="pointer-events-none absolute inset-0 z-[3] bg-sparkle opacity-70" />
      <div aria-hidden="true" className="features-decorations">
        <img src={spiralArrow} alt="" className="features-spiral" />
        <div className="features-plane-tile">
          <img src={arrowWithPlane} alt="" className="features-plane" />
        </div>
        <img src={apsara} alt="" className="features-apsara" />
      </div>
      <div className="relative z-10 mx-auto max-w-[1440px]">
        <motion.h2
          className="text-center text-7xl font-semibold tracking-tight text-black sm:text-6xl lg:text-[60px]"
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={fadeInUp}
        >
          Why choose <span className="text-primary">Visora</span>?
        </motion.h2>
        <motion.div
          className="mx-auto mt-5 h-5 w-[350px] max-w-full bg-[url('/textures/speckles.svg')] opacity-90"
          aria-hidden="true"
          initial={{ opacity: 0, scaleX: 0.6 }}
          whileInView={{ opacity: 0.9, scaleX: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 0.6, delay: 0.15 }}
        />
        <motion.div
          className="features-benefits-grid mt-20 grid w-full max-w-[760px] gap-x-20 gap-y-20 sm:grid-cols-2 lg:-translate-x-16"
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={staggerContainer(0.14, 0.2)}
        >
          {benefits.map(({ title, copy, color, groupedIcon }) => (
            <motion.article
              key={title}
              className="relative min-h-[170px] border-l-4 pl-5"
              style={{ borderColor: color }}
              variants={fadeInUp}
            >
              <motion.div
                className="relative mb-5 flex h-[54px] w-[54px] items-center justify-center text-black"
                variants={popIn}
              >
                <img src={groupedIcon} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-contain" />
              </motion.div>
              <h3 className="text-[22px] font-semibold text-[#151515] lg:text-[24px]">{title}</h3>
              <p className="mt-2 max-w-[330px] text-[16px] leading-6 text-[#666] lg:text-[18px]">{copy}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
