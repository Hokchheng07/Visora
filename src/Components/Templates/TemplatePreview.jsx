import angkorWat from "../../assets/pages/home/khmer-design-showcase/ankorwat.png";

export default function TemplatePreview({ template }) {
  const preview = template.preview;

  switch (preview.variant) {
    case "portfolio":
      return <PortfolioPreview />;
    case "exam":
      return <ExamPreview />;
    case "topic":
      return <TopicPreview />;
    case "ideas":
      return <IdeasPreview />;
    case "travel":
      return <TravelPreview />;
    case "cambodia":
      return <CambodiaPreview />;
    default:
      return <DefaultPreview preview={preview} />;
  }
}

function PortfolioPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#cbbdff] p-4 justify-center">
      <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(90deg,#65cef0_12px,transparent_12px),linear-gradient(#65cef0_12px,transparent_12px)] [background-size:32px_32px]" />
      <div className="absolute inset-3 rounded bg-white/45" />
      <div className="absolute left-8 top-8 h-[58%] w-[70%] rotate-[-1deg] rounded-sm bg-white shadow-sm">
        <div className="absolute -left-5 top-4 h-12 w-12 rotate-12 bg-slate-300/80" />
        <div className="absolute bottom-4 left-2 h-9 w-12 -rotate-12 bg-slate-300/70" />
        <p className="absolute left-8 top-5 -rotate-2 text-[28px] font-bold leading-[.9] text-[#d4162d] [text-shadow:2px_2px_0_#fff]">
          Creative
          <br />
          Portfolio
        </p>
      </div>
      <Star className="absolute left-11 top-7 h-9 w-9 text-[#d4162d]" />
      <Star className="absolute right-9 top-9 h-5 w-5 text-[#d4162d]" />
      <Star className="absolute bottom-8 right-16 h-6 w-6 text-[#d4162d]" />
      <LoopLine className="absolute bottom-11 left-8 h-10 w-24 text-[#d4162d]" />
    </div>
  );
}

function ExamPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#fffceb] px-5 py-4">
      <div className="absolute left-4 top-6 h-24 w-16 rounded border border-slate-200 bg-white shadow-sm">
        <div className="mx-auto mt-3 h-8 w-10 rounded bg-[#ffd977]" />
        <div className="mx-auto mt-2 h-2 w-10 rounded bg-[#d2c6ff]" />
        <div className="mx-auto mt-1 h-2 w-8 rounded bg-[#ff9dad]" />
      </div>
      <div className="absolute right-5 top-6 h-10 w-10 rounded-full border-4 border-[#8bd7ff] bg-white" />
      <Star className="absolute right-8 top-4 h-4 w-4 text-[#ef2347]" />
      <p className="ml-20 text-center text-[19px] font-semibold leading-none text-[#e2bb31]">
        FRONTEND
      </p>
      <p className="ml-20 mt-1 text-center text-[21px] font-bold leading-none text-[#2d2a28]">
        EXAMINATION
      </p>
      <div className="ml-20 mt-3 rounded-md border border-slate-200 bg-white px-3 py-1 text-center text-[30px] font-bold leading-none text-black shadow-sm">
        01:30:00
      </div>
      <div className="ml-20 mt-3 flex justify-center gap-1">
        {["Start", "Pause", "Stop", "Restart"].map((label, index) => (
          <span
            key={label}
            className={`rounded px-2 py-0.5 text-[6px] font-semibold text-white ${
              index === 0
                ? "bg-[#70d45f]"
                : index === 1
                  ? "bg-[#ffd95d]"
                  : index === 2
                    ? "bg-[#ff5a5a]"
                    : "bg-[#aaa]"
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function TopicPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#fff8ed]">
      <Ribbon className="absolute left-11 top-9 h-8 w-8 text-[#ead4ba]" />
      <p className="absolute right-12 top-12 rotate-[-2deg] text-[28px] font-bold text-[#de1e34] [text-shadow:1px_1px_0_#fff]">
        Title Topic
      </p>
      <div className="absolute bottom-9 left-12 h-8 w-8 rounded-full bg-[#b52b2d]" />
      <div className="absolute bottom-12 left-20 h-8 w-8 rounded-full bg-[#cc4b42]" />
      <div className="absolute bottom-16 left-[76px] h-7 w-10 rotate-[-24deg] rounded-full bg-[#82a963]" />
      <LoopLine className="absolute bottom-8 right-20 h-9 w-16 text-[#c44b42]" />
      <Star className="absolute bottom-5 right-5 h-6 w-6 text-[#df1d36]" />
    </div>
  );
}

function IdeasPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#fafbff]">
      <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(#9aa0a6_1.5px,transparent_1.5px)] [background-size:28px_28px]" />
      <ShapeDoodles />
      <div className="absolute left-[32%] top-[29%] rounded-lg bg-[#f5e9ff]/90 px-5 py-3 text-center">
        <p className="text-[25px] font-semibold leading-[1.12] text-[#302334]">
          Design
          <br />
          your ideas
        </p>
      </div>
    </div>
  );
}

function TravelPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#fff3df]">
      <div className="absolute right-0 top-0 h-full w-[56%] bg-[#eda538]" />
      <div className="absolute right-[21%] top-5 h-24 w-24 rounded-full bg-[#f0aa3e]" />
      <div className="absolute right-10 top-8 h-[76%] w-[29%] overflow-hidden rounded-t-full bg-gradient-to-b from-[#c9d7df] via-[#7e8b80] to-[#6a4d34] shadow-md" />
      <p className="absolute left-7 top-7 text-[27px] font-semibold leading-[.95] text-[#28221d]">
        Travel
        <br />
        Memory
      </p>
      <span className="absolute left-7 top-[58%] rounded-full bg-[#ee9e32] px-4 py-1 text-[8px] font-semibold text-white">
        best journey
      </span>
      <LoopLine className="absolute bottom-7 right-6 h-10 w-24 text-[#504238]" />
    </div>
  );
}

function CambodiaPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#006b34] text-white">
      <img
        src={angkorWat}
        alt=""
        className="absolute inset-y-0 left-0 h-full w-[43%] object-cover opacity-80 grayscale"
      />
      <div className="absolute inset-y-0 left-0 w-[43%] bg-[#8c6b39]/35" />
      <p className="absolute right-7 top-8 text-[36px] font-bold leading-none text-white">
        Cambodia
      </p>
      <p className="absolute right-8 top-[48%] w-[46%] text-[7px] font-medium leading-snug text-white/80">
        Tradition and progress in harmony
      </p>
      <div className="absolute bottom-5 right-8 h-12 w-24 overflow-hidden rounded-sm border border-white/40">
        <img src={angkorWat} alt="" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}

function DefaultPreview({ preview }) {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{
        background: preview.background,
      }}
    >
      <div
        className="absolute -left-6 -top-8 h-24 w-24 rounded-full opacity-20"
        style={{
          background: preview.accent,
        }}
      />

      <div
        className="absolute -bottom-10 -right-5 h-28 w-28 rounded-full opacity-25"
        style={{
          background: preview.secondary,
        }}
      />

      <Star className="absolute right-4 top-4 h-5 w-5" style={{ color: preview.accent }} />
      <LoopLine className="absolute bottom-4 left-3 h-7 w-20 opacity-50" style={{ color: preview.accent }} />

      <div className="relative z-10 px-4 text-center">
        {preview.kicker && (
          <p
            className="text-[10px] font-semibold"
            style={{
              color: preview.secondary,
            }}
          >
            {preview.kicker}
          </p>
        )}

        <h3
          className="mt-1 whitespace-pre-line text-xl font-bold leading-tight"
          style={{
            color: preview.accent,
          }}
        >
          {preview.title}
        </h3>

        {preview.timer && (
          <div className="mx-auto mt-2 rounded-md bg-white px-3 py-1 text-lg font-bold text-black shadow-sm">
            {preview.timer}
          </div>
        )}

        {preview.subtitle && (
          <p
            className="mt-2 text-[9px] font-medium"
            style={{
              color: preview.accent,
            }}
          >
            {preview.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function Star(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 1.8l2.5 6 6.5.6-5 4.2 1.5 6.4-5.5-3.4L6.5 19l1.5-6.4-5-4.2 6.5-.6L12 1.8z" />
    </svg>
  );
}

function Ribbon(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
      <path d="M13 11c8 3 14 3 22 0v24l-11-7-11 7V11Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LoopLine(props) {
  return (
    <svg viewBox="0 0 92 42" fill="none" aria-hidden="true" {...props}>
      <path d="M4 26c15-22 25 15 40-3 13-16 22 14 44-7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function ShapeDoodles() {
  return (
    <>
      <div className="absolute left-5 top-8 h-10 w-10 rotate-45 border-2 border-[#9cc7e8]" />
      <div className="absolute bottom-5 left-6 h-8 w-8 rotate-45 border-2 border-[#b9d9eb]" />
      <div className="absolute left-[30%] top-6 h-0 w-0 border-x-[14px] border-b-[24px] border-x-transparent border-b-[#9ed267]" />
      <div className="absolute bottom-8 right-[23%] h-8 w-8 rounded-full border-4 border-[#cdddf5]" />
      <div className="absolute right-10 top-10 h-7 w-10 rounded-full border-4 border-[#99d1ed]" />
      <div className="absolute bottom-11 right-11 h-1 w-16 rotate-[-12deg] bg-[#302334]" />
      <div className="absolute right-9 top-8 h-1 w-14 rotate-[18deg] bg-[#302334]" />
      <div className="absolute bottom-6 left-[37%] h-1 w-12 rotate-[14deg] bg-[#302334]" />
    </>
  );
}
