import { useState } from "react";
import { useNavigate } from "react-router";

import BottomCTA from "../Templates/BottomCTA";
import CategoryBar from "../Templates/CategoryBar";
import FilterSidebar from "../Templates/FilterSidebar";
import TemplateDecorations from "../Templates/templateDecorations";
import TemplateGrid from "../Templates/TemplateGrid";
import TemplateHeader from "../Templates/TemplateHeader";

import { templates } from "../Templates/templateData";
import { useTemplateFilters } from "../Templates/useTemplateFilters";

export default function TemplatePage() {
  const navigate = useNavigate();

  const [showFilters, setShowFilters] = useState(false);
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
    <main className="relative -mt-[126px] min-h-dvh overflow-hidden bg-[var(--surface-warm)] pt-[126px] md:-mt-[146px] md:pt-[146px]">
      <div
        className="bg-sparkle pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      />

      <TemplateDecorations />

      <div className="relative z-10 mx-auto w-full max-w-[1700px] px-4 pb-8 pt-7 sm:px-6 sm:pt-9 md:px-8 lg:px-10 xl:px-12">
        <TemplateHeader
          search={search}
          setSearch={setSearch}
          onCreate={handleCreate}
          onToggleFilters={() => setShowFilters((current) => !current)}
          activeFilterCount={activeFilterCount}
        />

        <CategoryBar
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        {showFilters && (
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setShowFilters(false)}
            className="fixed inset-0 z-30 bg-black/35 backdrop-blur-[1px] min-[900px]:hidden"
          />
        )}

        <div className="mt-4 flex flex-col gap-5 min-[1000px]:mt-5 min-[1000px]:flex-row min-[1000px]:items-start">
          <FilterSidebar
            showFilters={showFilters}
            onClose={() => setShowFilters(false)}
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

      <BottomCTA />
    </main>
  );
}
