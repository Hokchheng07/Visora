import lineLeft from "../../assets/pages/templates/bottom/white-line-left.png";
import lineRight from "../../assets/pages/templates/bottom/white-line-right.png";
import box from "../../assets/pages/templates/bottom/box.png";
import airplane from "../../assets/pages/templates/bottom/airplan.png";
import pen from "../../assets/pages/templates/bottom/pen.png";

export default function BottomCTA(){
  return(
    <section className="templates-bottom-cta relative z-10 mt-8 h-[clamp(150px,13vw,250px)] w-full overflow-hidden">
      {/* LIGHT MODE */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full select-none dark:hidden"
        viewBox="0 0 1440 150"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="
            M0 45
            C90 80 140 85 220 55
            C330 15 410 30 500 55
            C610 85 700 65 790 40
            C900 10 990 35 1080 62
            C1180 92 1260 80 1340 45
            C1390 25 1420 25 1440 45
            L1440 150
            L0 150
            Z
          "
          fill="#705AE0"
        />
      </svg>

      {/* DARK MODE */}
      <svg
        className="pointer-events-none absolute inset-0 hidden h-full w-full select-none dark:block"
        viewBox="0 0 1440 150"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="templateDarkBottomGradient"
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop offset="0%" stopColor="#DA4EC9"/>
            <stop offset="50%" stopColor="#705AE0"/>
            <stop offset="100%" stopColor="#72BFF1"/>
          </linearGradient>
        </defs>

        <path
          d="
            M0 45
            C90 80 140 85 220 55
            C330 15 410 30 500 55
            C610 85 700 65 790 40
            C900 10 990 35 1080 62
            C1180 92 1260 80 1340 45
            C1390 25 1420 25 1440 45
            L1440 150
            L0 150
            Z
          "
          fill="url(#templateDarkBottomGradient)"
        />
      </svg>

      {/* LEFT AIRPLANE */}
      <img
        src={airplane}
        alt=""
        className="pointer-events-none absolute left-[5%] top-[73%] z-[2] hidden w-[clamp(42px,6vw,70px)] -translate-y-1/2 select-none md:block"
      />

      {/* LEFT LINE */}
      <img
        src={lineLeft}
        alt=""
        className="pointer-events-none absolute left-[15%] top-[68%] z-[2] hidden w-[clamp(120px,18vw,280px)] -translate-y-1/2 select-none md:block"
      />

      {/* TEXT */}
      <div className="absolute left-1/2 top-[65%] z-[3] w-full -translate-x-1/2 -translate-y-1/2 px-5 text-center">
        <h2 className="text-[clamp(18px,2vw,30px)] font-bold leading-tight text-white">
          Can&apos;t find what you{" "}
          <span className="text-secondary">need</span>
        </h2>

        <p className="mx-auto mt-1.5 text-[clamp(9px,1vw,13px)] text-white/80">
          Use our editor to create your own unique backdrop.
        </p>
      </div>

      {/* RIGHT LINE */}
      <img
        src={lineRight}
        alt=""
        className="pointer-events-none absolute left-[64%] top-[68%] z-[1] hidden w-[clamp(120px,16vw,220px)] -translate-y-1/2 select-none md:block"
      />

      {/* RIGHT PEN */}
      <img
        src={pen}
        alt=""
        className="pointer-events-none absolute left-[79%] top-[68%] z-[2] hidden w-[clamp(48px,6vw,78px)] -translate-y-1/2 select-none md:block"
      />

      {/* RIGHT BOX */}
      <img
        src={box}
        alt=""
        className="pointer-events-none absolute left-[89%] top-[74%] z-[2] hidden w-[clamp(42px,5vw,65px)] -translate-y-1/2 select-none md:block"
      />

      {/* RIGHT RAYS */}
      <div className="pointer-events-none absolute right-[2%] top-[57%] z-[2] hidden md:block">
        <span className="absolute h-[3px] w-[13px] -rotate-[70deg] rounded-full bg-white"/>
        <span className="absolute left-[18px] top-[8px] h-[3px] w-[13px] -rotate-[15deg] rounded-full bg-white"/>
        <span className="absolute left-[20px] top-[22px] h-[3px] w-[12px] rotate-[22deg] rounded-full bg-white"/>
      </div>
    </section>
  );
}
