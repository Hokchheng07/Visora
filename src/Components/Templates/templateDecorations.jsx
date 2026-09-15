import waveLeftLight from "../../assets/pages/templates/wave-left-light-mode.svg";
import waveLeftDark from "../../assets/pages/templates/wave-left-dark-mode.svg";
import waveRightLight from "../../assets/pages/templates/wave-right-light-mode.svg";
import waveRightDark from "../../assets/pages/templates/wave-right-dark-mode.svg";
import scissorLineLight from "../../assets/pages/templates/black-line.svg";
import scissorLineDark from "../../assets/pages/templates/pink-line-dark-mode.svg";
import purpleLine from "../../assets/pages/templates/purple-line.svg";

export default function TemplateDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden="true">

      <img
        src={waveLeftLight}
        alt=""
        className="absolute left-0 top-[165px] hidden w-[100px] max-w-none select-none dark:hidden sm:block md:top-[170px] md:w-[130px] lg:top-[175px] lg:w-[180px] xl:w-[230px] 2xl:w-[280px]"
      />

      <img
        src={waveLeftDark}
        alt=""
        className="absolute left-0 top-[165px] hidden w-[100px] max-w-none select-none dark:sm:block md:top-[170px] md:w-[130px] lg:top-[175px] lg:w-[180px] xl:w-[230px] 2xl:w-[280px]"
      />

      <img
        src={waveRightLight}
        alt=""
        className="absolute right-0 top-[165px] hidden w-[100px] max-w-none select-none dark:hidden sm:block md:top-[170px] md:w-[130px] lg:top-[175px] lg:w-[180px] xl:w-[230px] 2xl:w-[280px]"
      />

      <img
        src={waveRightDark}
        alt=""
        className="absolute right-0 top-[165px] hidden w-[100px] max-w-none select-none dark:sm:block md:top-[170px] md:w-[130px] lg:top-[175px] lg:w-[180px] xl:w-[230px] 2xl:w-[280px]"
      />

      <img
        src={scissorLineLight}
        alt=""
        className="absolute right-[12px] top-[72px] w-[90px] max-w-none select-none dark:hidden sm:right-[18px] sm:w-[110px] md:right-[28px] md:top-[68px] md:w-[145px] lg:right-[45px] lg:top-[65px] lg:w-[180px] xl:right-[60px] xl:top-[62px] xl:w-[210px] 2xl:right-[80px] 2xl:w-[250px]"
      />

      <img
        src={scissorLineDark}
        alt=""
        className="absolute right-[12px] top-[72px] hidden w-[90px] max-w-none select-none dark:block sm:right-[18px] sm:w-[110px] md:right-[28px] md:top-[68px] md:w-[145px] lg:right-[45px] lg:top-[65px] lg:w-[180px] xl:right-[60px] xl:top-[62px] xl:w-[210px] 2xl:right-[80px] 2xl:w-[250px]"
      />

      <img
        src={purpleLine}
        alt=""
        className="absolute left-[16%] top-[68px] hidden w-[145px] max-w-none -translate-x-1/2 select-none md:block lg:left-[15%] lg:top-[65px] lg:w-[180px] xl:left-[14%] xl:top-[62px] xl:w-[220px] 2xl:left-[13%] 2xl:w-[250px]"
      />

    </div>
  );
}