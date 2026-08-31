import React from "react";
import visora from "../../assets/Website/visora-logo-mobile.png";
import penIcon from "../../assets/Website/PictureCvPage/pen.png";
import trialIcon from "../../assets/Website/PictureCvPage/trailIcon.png";
import {
  Grid,
  Square,
  Type,
  Image,
  Sparkles,
  Shapes,
  Clock,
  Layers,
  Search,
  Mic,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Download,
  Share2,
  Plus,
  ChevronDown,
  MoreHorizontal,
  Save,
  FileText
} from "lucide-react";
import { transform } from "zod";
export default function CvTemplate() {
  return (
    <div className="flex h-screen w-full flex-col bg-slate-100 font-sans text-slate-800">
      {/* --- TOP NAVBAR --- */}
      <header className="flex h-18 w-full items-center justify-between border-b bg-6854DA px-4 shadow-sm">
        {/* Brand & Mode */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-amber-500 text-xl">
            <img src= {visora} alt="visora" className="h-auto w-40 sm:w-48 p-9" />
          </div>
          <button className="flex items-center gap-1 rounded-md px-3 pt-2 text-lg font-semibold text-black hover:bg-amber-200">
           <span><img src={penIcon}/></span> Editing <ChevronDown className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold pt-2 pl-120 text-black hidden md:inline">
            Black white Minimalist CV Resume  
          </span>
          <span className="text-sm font-semibold pt-2 px-5 text-black hidden md:inline">
            <img src= {trialIcon} alt="" />
          </span>
        </div>
         <div className="flex  p-8 gap-5" >
           <button className="flex items-center gap-1.5  rounded-md border border-slate-300 bg-white px-8 py-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <Save className="h-4 w-4 text-lg" /> Save
          </button>
          <button className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-5 py-3 text-xs font-semibold text-white hover:bg-indigo-700">
            <Download className="h-4 w-4" /> Export
          </button> 
          <button className="flex items-center gap-1.5 rounded-md bg-purple-600 px-5 py-3 text-xs font-semibold text-white hover:bg-purple-700">
            <Share2 className="h-4 w-4" /> Share
          </button>
         </div>
      </header>

      {/* --- MAIN BODY --- */}
      <div className="flex flex-1 overflow-hidden">
        {/* 1. PRIMARY SIDEBAR */}
        <aside className="flex w-16 flex-col items-center gap-6 border-r bg-white py-4 text-xs font-medium text-slate-500">
          <button className="flex flex-col items-center gap-1 text-purple-600">
            <span>Templates</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-slate-900">
            <Square className="h-5 w-5" />
            <span>Elements</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-slate-900">
            <Type className="h-5 w-5" />
            <span>Text</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-slate-900">
            <Image className="h-5 w-5" />
            <span>Images</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-slate-900">
            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-current font-bold text-[10px]">
              G
            </div>
            <span>Logo</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-slate-900">
            <Shapes className="h-5 w-5" />
            <span>Shapes</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-slate-900">
            <Clock className="h-5 w-5" />
            <span>Timer</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-slate-900">
            <Layers className="h-5 w-5" />
            <span>Layers</span>
          </button>
        </aside>

        {/* 2. SECONDARY PANEL (Templates Gallery) */}
        <section className="w-80 overflow-y-auto border-r bg-slate-50 p-4">
          <h2 className="mb-3 text-sm font-bold text-slate-800">Templates</h2>

          {/* Search Bar */}
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Describe your ideal design"
              className="w-full rounded-md border border-slate-300 py-1.5 pl-3 pr-8 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <Mic className="absolute right-2.5 top-2 h-4 w-4 text-slate-400" />
          </div>

          {/* Action Row */}
          <div className="mb-4 flex gap-2">
            <button className="rounded bg-indigo-600 px-3 py-1 text-xs text-white">All</button>
            <button className="flex items-center gap-1 rounded border bg-white px-2 py-1 text-xs text-slate-700">
              <Sparkles className="h-3 w-3" /> Generate <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex-1 rounded bg-indigo-600 text-xs text-white">Search</button>
          </div>

          {/* Featured Templates Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="h-44 rounded bg-teal-800 p-2 shadow-sm border border-slate-200 cursor-pointer hover:ring-2 hover:ring-purple-500">
              <div className="h-full bg-slate-100 rounded opacity-90"></div>
            </div>
            <div className="h-44 rounded bg-amber-500 p-2 shadow-sm border border-slate-200 cursor-pointer hover:ring-2 hover:ring-purple-500">
              <div className="h-full bg-white rounded opacity-90"></div>
            </div>
          </div>

          {/* More Templates Section */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-700">More template for you</h3>
            <span className="text-[10px] text-slate-400 cursor-pointer hover:underline">See All</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-40 rounded bg-slate-900 p-2 border shadow-sm"></div>
            <div className="h-40 rounded bg-blue-900 p-2 border shadow-sm"></div>
            <div className="h-40 rounded bg-slate-800 p-2 border shadow-sm"></div>
            <div className="h-40 rounded bg-amber-400 p-2 border shadow-sm"></div>
          </div>
        </section>

        {/* 3. WORKSPACE / CANVAS AREA */}
        <main className="flex flex-1 flex-col items-center overflow-y-auto bg-slate-200 p-6 relative">
          {/* Floating Context Toolbar */}
          <div className="mb-6 flex items-center gap-3 rounded-md bg-rose-50/80 px-4 py-1.5 shadow-sm border border-rose-100 backdrop-blur-sm">
            <button className="rounded bg-white px-2 py-1 text-xs font-semibold shadow-sm border">
              Montserrat
            </button>
            <div className="flex items-center rounded border bg-white px-2 py-1 text-xs font-semibold">
              - 79 +
            </div>
            <div className="flex items-center gap-2 border-x px-2 text-slate-700">
              <button className="font-bold"><Bold className="h-4 w-4" /></button>
              <button className="italic"><Italic className="h-4 w-4" /></button>
              <button className="underline"><Underline className="h-4 w-4" /></button>
              <button className="line-through"><Strikethrough className="h-4 w-4" /></button>
            </div>
            <button className="text-xs font-medium text-slate-700 hover:text-slate-900">Effects</button>
            <button className="text-xs font-medium text-slate-700 hover:text-slate-900">Animate</button>
            <button className="text-xs font-medium text-slate-700 hover:text-slate-900">Position</button>
            <button className="text-slate-700"><MoreHorizontal className="h-4 w-4" /></button>
          </div>

          {/* The Resume Document Canvas (A4 Sheet Preview) */}
          <div className="relative w-[500px] min-h-[700px] bg-white shadow-xl rounded-sm flex flex-col text-slate-800">
            {/* Top Toolbar overlay on canvas */}
            <div className="absolute right-2 top-2 flex gap-1.5 text-slate-400">
              <FileText className="h-4 w-4 cursor-pointer hover:text-slate-600" />
              <Layers className="h-4 w-4 cursor-pointer hover:text-slate-600" />
              <Plus className="h-4 w-4 cursor-pointer hover:text-slate-600" />
            </div>

            <div className="flex flex-1">
              {/* Left Column (Grey Background) */}
              <div className="w-2/5 bg-slate-300 p-4 flex flex-col gap-4 text-xs">
                {/* Profile Picture */}
                <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-white shadow">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Education */}
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-[11px] mb-1">Education</h4>
                  <p className="text-[10px] font-semibold">2014 - 2017</p>
                  <p className="font-bold text-[10px]">BACHELOR OF DESIGN</p>
                  <p className="text-[9px] text-slate-600">INHARDER UNIVERSITY</p>
                  <p className="text-[9px] text-slate-500">Graduated in Web Designing</p>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-[11px] mb-1">Skills</h4>
                  <ul className="list-disc list-inside text-[9px] text-slate-700 space-y-0.5">
                    <li>Management Skills</li>
                    <li>Creativity</li>
                    <li>Digital Marketing</li>
                    <li>Negotiation</li>
                    <li>Critical Thinking</li>
                  </ul>
                </div>

                {/* Languages */}
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-[11px] mb-1">Languages</h4>
                  <p className="text-[9px] text-slate-700">English</p>
                  <p className="text-[9px] text-slate-700">German (Basic)</p>
                  <p className="text-[9px] text-slate-700">Spanish (Basic)</p>
                </div>

                {/* Contact */}
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-[11px] mb-1">Contact</h4>
                  <p className="text-[9px] text-slate-700">+123-456-7890</p>
                  <p className="text-[9px] text-slate-700">hello@reallygreatsite.com</p>
                  <p className="text-[9px] text-slate-700">123 Anywhere St., Any City</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="w-3/5 p-5 flex flex-col gap-4">
                {/* Header Banner */}
                <div className="bg-slate-700 p-4 text-white -mx-5 -mt-5">
                  <h1 className="text-xl font-bold tracking-wider uppercase">Jonathan</h1>
                  <h1 className="text-xl font-light tracking-widest uppercase">Patterson</h1>
                  <p className="text-xs text-slate-300 font-light tracking-wide mt-1">Art Director</p>
                </div>

                {/* Profile Info */}
                <div>
                  <h4 className="font-bold uppercase text-xs tracking-wider mb-1">Profile Info</h4>
                  <p className="text-[9px] text-slate-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>

                {/* Experience */}
                <div>
                  <h4 className="font-bold uppercase text-xs tracking-wider mb-2">Experience</h4>
                  <div className="border-l border-slate-300 pl-3 space-y-2">
                    <div>
                      <p className="font-bold text-[10px]">SENIOR GRAPHIC DESIGNER</p>
                      <p className="text-[8px] text-slate-400">2020 - 2023 | WARNER SHADOWS</p>
                      <p className="text-[9px] text-slate-600">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-[10px]">SENIOR GRAPHIC DESIGNER</p>
                      <p className="text-[8px] text-slate-400">2018 - 2020 | INDIGO COMPANY</p>
                      <p className="text-[9px] text-slate-600">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Achievement */}
                <div>
                  <h4 className="font-bold uppercase text-xs tracking-wider mb-1">Achievement</h4>
                  <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-600">
                    <div>
                      <span className="font-bold text-slate-800">2014 - 2015</span>
                      <p>Reduced the production cost by 20% in the second year.</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">2015 - 2020</span>
                      <p>Managed five projects in our company worth over $10 million.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add Page Button */}
          <button className="mt-4 flex items-center gap-1 rounded-md border border-purple-300 bg-white px-6 py-2 text-xs font-medium text-purple-700 shadow-sm hover:bg-purple-50">
            <Plus className="h-4 w-4" /> Add Page <ChevronDown className="h-4 w-4" />
          </button>
        </main>
      </div>

      {/* --- BOTTOM FOOTER STATUS BAR --- */}
      <footer className="flex h-8 w-full items-center justify-between border-t bg-white px-4 text-[11px] text-slate-500">
        <div className="flex items-center gap-4">
          <button className="hover:text-slate-800">Notes</button>
          <button className="hover:text-slate-800">Timer</button>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-1/2 bg-rose-400"></div>
          </div>
          <span>50%</span>
          <span>Page 1/1</span>
        </div>
      </footer>
    </div>
  );
}