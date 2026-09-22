import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { motion, useReducedMotion } from "motion/react";

import BottomCTA from "../Templates/BottomCTA";
import CategoryBar from "../Templates/CategoryBar";
import FilterSidebar from "../Templates/FilterSidebar";
import TemplateDecorations from "../Templates/templateDecorations";
import TemplateGrid from "../Templates/TemplateGrid";
import TemplateHeader from "../Templates/TemplateHeader";

import { templates } from "../Templates/templateData";
import { useTemplateFilters } from "../Templates/useTemplateFilters";
import "../../styles/pages/templates.css";

export default function TemplatePage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const reveal = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] },
  });

  const [showFilters, setShowFilters] = useState(false);
  const searchFilterRef = useRef(null);
  const [favorites, setFavorites] = useState([]);

  const {
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    selectedTypes,
    setSelectedTypes,
    selectedStyles,
    setSelectedStyles,
    selectedColors,
    setSelectedColors,
    orientation,
    setOrientation,
    page,
    setPage,
    currentTemplates,
    totalPages,
    activeFilterCount,
    toggleArrayValue,
    resetFilters,
  } = useTemplateFilters(templates);

  const handleFavorite = (templateId) => {
    setFavorites((current) =>
      current.includes(templateId)
        ? current.filter((id) => id !== templateId)
        : [...current, templateId]
    );
  };

  const handleOpenTemplate = () => {
    navigate("/editor");
  };

  const handleCreate = () => {
    navigate("/editor");
  };

  return (
    <main className="templates-page relative -mt-[126px] min-h-dvh overflow-hidden bg-[var(--surface-base)] pt-[126px] md:-mt-[146px] md:pt-[146px]">
      <div
        className="bg-sparkle pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      />

      <TemplateDecorations />

      <div className="relative z-10 mx-auto w-full max-w-[1700px] px-4 pb-8 pt-7 sm:px-6 sm:pt-9 md:px-8 lg:px-10 xl:px-12">
        <motion.div {...reveal()}>
          <TemplateHeader
            search={search}
            setSearch={setSearch}
            onCreate={handleCreate}
            onToggleFilters={() => setShowFilters((current) => !current)}
            showFilters={showFilters}
            activeFilterCount={activeFilterCount}
            filterButtonRef={searchFilterRef}
          />
        </motion.div>

        <motion.div {...reveal(0.1)}>
          <CategoryBar
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        </motion.div>

        <div className="mt-4 flex flex-col gap-5 min-[900px]:mt-5 min-[900px]:flex-row min-[900px]:items-start">
          <FilterSidebar
            showFilters={showFilters}
            searchFilterRef={searchFilterRef}
            onToggle={() => setShowFilters((current) => !current)}
            onClose={() => setShowFilters(false)}
            activeFilterCount={activeFilterCount}
            selectedTypes={selectedTypes}
            setSelectedTypes={setSelectedTypes}
            selectedStyles={selectedStyles}
            setSelectedStyles={setSelectedStyles}
            selectedColors={selectedColors}
            setSelectedColors={setSelectedColors}
            orientation={orientation}
            setOrientation={setOrientation}
            toggleArrayValue={toggleArrayValue}
            resetFilters={resetFilters}
          />

          <TemplateGrid
            templates={currentTemplates}
            activeCategory={activeCategory}
            favorites={favorites}
            onFavorite={handleFavorite}
            onOpen={handleOpenTemplate}
            onReset={resetFilters}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      <motion.div {...reveal()}>
        <BottomCTA />
      </motion.div>
    </main>
  );
}
