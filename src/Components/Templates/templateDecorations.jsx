import waveLeftLight from "../../assets/pages/templates/light/wave-left-light-mode.svg";
import waveLeftDark from "../../assets/pages/templates/dark/wave-left-dark-mode.svg";
import waveRightLight from "../../assets/pages/templates/light/wave-right-light-mode.svg";
import waveRightDark from "../../assets/pages/templates/dark/wave-right-dark-mode.svg";
import cloud from "../../assets/pages/templates/light/cloud.png";
import cloudDark from "../../assets/pages/templates/dark/cloud.png";
import purpleLine from "../../assets/pages/templates/light/purple-line.png";
import pinkBlueLine from "../../assets/pages/templates/dark/pink-blue-line.png";

export default function TemplateDecorations(){
  return(
    <div
      className="templates-decorations pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      aria-hidden="true"
    >
      {/* FLIGHT LINE - LIGHT */}
      <img
        src={purpleLine}
        alt=""
        className="absolute -left-[50px] top-[100px] block w-[200px] max-w-none select-none dark:hidden sm:-left-[15px] sm:top-[110px] sm:w-[205px] md:-left-[20px] md:top-[110px] md:w-[250px] lg:left-[2%] lg:top-[115px] lg:w-[250px] xl:left-[2%] xl:top-[110px] xl:w-[330px] 2xl:left-[2%] 2xl:w-[500px]"
      />

      {/* FLIGHT LINE - DARK */}
      <img
        src={pinkBlueLine}
        alt=""
        className="absolute -left-[50px] top-[100px] hidden w-[200px] max-w-none select-none dark:block sm:-left-[15px] sm:top-[110px] sm:w-[205px] md:-left-[20px] md:top-[110px] md:w-[250px] lg:left-[2%] lg:top-[115px] lg:w-[250px] xl:left-[2%] xl:top-[110px] xl:w-[330px] 2xl:left-[2%] 2xl:w-[500px]"
      />

    {/* LEFT WAVE - LIGHT */}
<img
  src={waveLeftLight}
  alt=""
  className="absolute -left-[150px] top-[175px] hidden h-auto w-[280px] max-w-none select-none dark:hidden md:block md:-left-[170px] md:top-[200px] md:w-[320px] lg:-left-[190px] lg:top-[190px] lg:w-[380px] xl:-left-[210px] xl:top-[180px] xl:w-[450px] 2xl:-left-[230px] 2xl:top-[170px] 2xl:w-[600px]"
/>

{/* LEFT WAVE - DARK */}
<img
  src={waveLeftDark}
  alt=""
  className="absolute -left-[150px] top-[175px] hidden h-auto w-[280px] max-w-none select-none md:-left-[170px] md:top-[195px] md:w-[320px] md:dark:block lg:-left-[190px] lg:top-[190px] lg:w-[380px] xl:-left-[210px] xl:top-[180px] xl:w-[450px] 2xl:-left-[230px] 2xl:top-[170px] 2xl:w-[600px]"
/>

{/* RIGHT WAVE - LIGHT */}
<img
  src={waveRightLight}
  alt=""
  className="absolute -right-[150px] top-[175px] z-[1] hidden h-auto w-[280px] max-w-none select-none dark:hidden md:block md:-right-[170px] md:top-[200px] md:w-[320px] lg:-right-[190px] lg:top-[190px] lg:w-[380px] xl:-right-[210px] xl:top-[180px] xl:w-[450px] 2xl:-right-[230px] 2xl:top-[170px] 2xl:w-[600px]"
/>

{/* RIGHT WAVE - DARK */}
<img
  src={waveRightDark}
  alt=""
  className="absolute -right-[150px] top-[175px] z-[1] hidden h-auto w-[280px] max-w-none select-none md:-right-[170px] md:top-[200px] md:w-[320px] md:dark:block lg:-right-[190px] lg:top-[190px] lg:w-[380px] xl:-right-[210px] xl:top-[180px] xl:w-[450px] 2xl:-right-[230px] 2xl:top-[170px] 2xl:w-[600px]"
/>

      {/* CLOUD - LIGHT */}
      <img
        src={cloud}
        alt=""
        className="absolute -right-[30px] top-[78px] z-[2] block w-[105px] max-w-none select-none dark:hidden sm:-right-[15px] sm:top-[90px] sm:w-[125px] md:-right-[10px] md:top-[70px] md:w-[145px] lg:right-[2%] lg:top-[90px] lg:w-[175px] xl:right-[5%] xl:top-[88px] xl:w-[205px] 2xl:right-[8%] 2xl:w-[250px]"
      />

      {/* CLOUD - DARK */}
      <img
        src={cloudDark}
        alt=""
        className="absolute -right-[30px] top-[78px] z-[2] hidden w-[105px] max-w-none select-none dark:block sm:-right-[15px] sm:top-[90px] sm:w-[125px] md:-right-[10px] md:top-[70px] md:w-[145px] lg:right-[2%] lg:top-[90px] lg:w-[175px] xl:right-[5%] xl:top-[88px] xl:w-[205px] 2xl:right-[8%] 2xl:w-[250px]"
      />
    </div>
  );
}
