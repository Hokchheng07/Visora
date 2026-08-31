import { motion } from "motion/react";
import { AppWindowMac, BroomSparkles, MessageCircleDashedCheck } from "lucide-react";
import blobArtwork from "../../assets/Website/LandingPage/Features-Section/why-choose-blob.png";
import frameOne from "../../assets/Website/LandingPage/Hero-Section/1ndFrame.png";
import frameTwo from "../../assets/Website/LandingPage/Hero-Section/2ndFrame.png";
import cambodiaFlag from "../../assets/Website/LandingPage/Features-Section/flag-for-cambodia-svgrepo-com.svg";
import arrowWithScissors from "../../assets/Website/LandingPage/Hero-Section/ArrowWithScissors.png";
import apsara from "../../assets/Website/LandingPage/Features-Section/Apsara.png";
import spiralArrow from "../../assets/Website/LandingPage/Features-Section/SpiralArrow.png";
import arrowWithPlane from "../../assets/Website/LandingPage/Hero-Section/ArrowNPlane.png";
import { fadeInUp, popIn, staggerContainer, viewportOnce } from "../../lib/animations";

const benefits = [
  { title: "Easy to Customize", copy: "Design beautiful backdrops without advanced design skills.", color: "#705ae0", icon: BroomSparkles, frame: frameTwo },
  { title: "Khmer-Inspired", copy: "Use Cambodian cultural elements and Khmer fonts.", color: "#45bfd1", icon: cambodiaFlag, frame: frameOne, image: true },
  { title: "Event Ready", copy: "Add countdown timers and event information.", color: "#ffc21c", icon: MessageCircleDashedCheck, frame: frameOne },
  { title: "Display Anywhere", copy: "Designed for projectors, TVs, LED screens and large displays.", color: "#e16ac9", icon: AppWindowMac, frame: frameTwo },
];

export default function WhyChooseVisora() {
  return (
    <section className="relative isolate w-full overflow-hidden px-8 py-20 sm:px-16 lg:px-20 lg:py-24" style={{ aspectRatio: "1441 / 927" }}>
      <motion.img
        src={blobArtwork}
        alt=""
        aria-hidden="true"
        className="features-art"
        initial={{ opacity: 0, scale: 1.08 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={viewportOnce}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-[#b294f0]/20 via-transparent to-[#ffc21c]/35" />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-sparkle opacity-70" />
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
          <img
          src={arrowWithScissors}
          alt=""
          aria-hidden="true"
          className="templates-arrow-scissors why-choose-arrow-scissors"
        />
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
          className="mt-20 grid max-w-[720px] gap-x-20 gap-y-20 sm:grid-cols-2 lg:-translate-x-16"
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={staggerContainer(0.14, 0.2)}
        >
          {benefits.map(({ title, copy, color, icon: Icon, frame, image }) => (
            <motion.article
              key={title}
              className="relative min-h-[170px] border-l-4 pl-5"
              style={{ borderColor: color }}
              variants={fadeInUp}
            >
              <motion.div
                className="relative mb-5 flex h-[82px] w-[82px] items-center justify-center rounded-md bg-white/70"
                style={{ color }}
                variants={popIn}
              >
                <img src={frame} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-contain" />
                {image ? <img src={Icon} alt="Cambodia" className="relative z-10 h-10 w-10 object-contain" /> : <Icon aria-hidden="true" className="relative z-10 h-9 w-9" strokeWidth={2.2} />}
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
