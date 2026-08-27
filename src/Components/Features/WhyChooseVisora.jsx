import { ClockIcon, LanguageIcon, PencilSquareIcon, TvIcon } from "@heroicons/react/24/outline";
import blobArtwork from "../../assets/Features/why-choose-blob.png";

const benefits = [
  { title: "Easy to Customize", copy: "Design beautiful backdrops without advanced design skills.", color: "#705ae0", icon: PencilSquareIcon },
  { title: "Khmer-Inspired", copy: "Use Cambodian cultural elements and Khmer fonts.", color: "#45bfd1", icon: LanguageIcon },
  { title: "Event Ready", copy: "Add countdown timers and event information.", color: "#ffc21c", icon: ClockIcon },
  { title: "Display Anywhere", copy: "Designed for projectors, TVs, LED screens and large displays.", color: "#e16ac9", icon: TvIcon },
];

export default function WhyChooseVisora() {
  return (
    <section className="relative isolate w-full overflow-hidden px-8 py-20 sm:px-16 lg:px-20 lg:py-24" style={{ aspectRatio: "1441 / 927" }}>
      <img src={blobArtwork} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-[#b294f0]/20 via-transparent to-[#ffc21c]/35" />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-sparkle opacity-70" />
      <div className="relative z-10 mx-auto max-w-[1080px]">
        <h2 className="text-center text-4xl font-semibold tracking-tight text-black sm:text-5xl lg:text-[48px]">Why choose <span className="text-primary">Visora</span>?</h2>
        <div className="mx-auto mt-5 h-5 w-[350px] max-w-full bg-[url('/textures/speckles.svg')] opacity-90" aria-hidden="true" />
        <div className="mt-20 grid max-w-[720px] gap-x-20 gap-y-20 sm:grid-cols-2">
          {benefits.map(({ title, copy, color, icon: Icon }) => (
            <article key={title} className="relative min-h-[135px] border-l-2 pl-5" style={{ borderColor: color }}>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md border border-black/20 bg-white shadow-[2px_2px_0_rgba(0,0,0,.18)]" style={{ color }}><Icon className="h-6 w-6" /></div>
              <h3 className="text-[18px] font-semibold text-[#151515]">{title}</h3>
              <p className="mt-1 max-w-[280px] text-[14px] leading-6 text-[#666]">{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
