import lineLeft from "../../assets/pages/templates/white-line-left.svg";
import lineRight from "../../assets/pages/templates/white-line-right.svg";
import boxLine from "../../assets/pages/templates/box-line.svg";
import airplane from "../../assets/pages/templates/airplan.svg";

export default function BottomCTA() {
  return (
    <section className="relative z-10 mt-6 h-[130px] w-full overflow-hidden sm:h-[160px] md:h-[210px] lg:h-[250px]">
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
            <stop offset="0%" stopColor="#DA4EC9" />
            <stop offset="50%" stopColor="#705AE0" />
            <stop offset="100%" stopColor="#72BFF1" />
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

      <img
        src={lineLeft}
        alt=""
      className="pointer-events-none absolute bottom-6 left-[7%] z-[2] hidden w-[110px] select-none md:block lg:bottom-10 lg:left-[15%] lg:w-[140px] xl:left-[18%] xl:w-[170px]"
      />

      <img
        src={airplane}
        alt=""
        className="pointer-events-none absolute bottom-7 left-[7%] z-[2] hidden w-[50px] select-none md:block lg:w-[70px]"
      />

      <img
        src={boxLine}
        alt=""
        className="pointer-events-none absolute bottom-7 right-[6%] z-[2] hidden w-[55px] select-none md:block lg:w-[80px]"
      />

      <img
        src={lineRight}
        alt=""
        className="pointer-events-none absolute bottom-[18px] right-[17%] z-[2] hidden w-[clamp(90px,10vw,145px)] select-none md:block"
      />

      <div className="absolute left-1/2 top-[68%] z-[3] w-full -translate-x-1/2 -translate-y-1/2 px-4 text-center md:top-[70%]">
        <h2 className="text-lg font-bold leading-tight text-white sm:text-xl md:text-2xl lg:text-[30px]">
          Can&apos;t find what you <span className="text-secondary">need</span>
        </h2>

        <p className="mx-auto mt-1 max-w-[90%] text-[9px] text-white/80 sm:text-[11px] md:text-xs lg:text-[13px]">
          Use our editor to create your own unique backdrop.
        </p>
      </div>
    </section>
  );
}