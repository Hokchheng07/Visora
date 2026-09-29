import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { motion, useReducedMotion } from "motion/react";

import BottomCTA from "../Templates/BottomCTA";
import CanvasPickerModal from "../Templates/CanvasPickerModal.jsx";
import { useCanvasPicker } from "../Templates/useCanvasPicker.js";
import CategoryBar from "../Templates/CategoryBar";
import FilterSidebar from "../Templates/FilterSidebar";
import TemplateDecorations from "../Templates/templateDecorations";
import TemplateGrid from "../Templates/TemplateGrid";
import TemplateHeader from "../Templates/TemplateHeader";

import { templateCategories, templates } from "../Templates/templateData";
import { useTemplateFilters } from "../Templates/useTemplateFilters";
import "../../styles/pages/templates.css";
import CosmicDust from "../Effects/CosmicDust.jsx";
import { useFavorites } from "../Account/useFavorites";
import TemplatePreviewModal from "../Templates/TemplatePreviewModal.jsx";
import { useCurrentUser } from "../Account/useCurrentUser";
import { useGetAllTemplatesQuery, useGetTemplatesQuery } from "../API/templateApi";
import { fromServerTemplate } from "../Templates/serverTemplate.js";
import { newestPerDesign } from "../Dashboard/templateVersions.js";

export default function TemplatePage() {
  const navigate = useNavigate();
  const canvasPicker = useCanvasPicker();
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
  const [previewing, setPreviewing] = useState(null);

  /* Approved templates from the server come first, then the samples. The
     list needs a sign-in (the server answers 401 otherwise), so a visitor
     sees the samples only. */
  const { isSignedIn, isAdmin } = useCurrentUser();
  /* Asked again each time the page opens (an approval made in another tab or
     account must show without a reload). An admin also reads the admin list,
     which holds everyone's templates — GET /templates may only return the
     signed-in account's own. Both are merged, each template once. */
  const fresh = { refetchOnMountOrArgChange: true };
  // Asked for signed out too: browsing is for everyone. Until the server makes
  // GET /templates public it answers visitors 401, and they see the samples only.
  const { data: ownPage } = useGetTemplatesQuery({ templateStatus: "APPROVED", pageSize: 100 }, fresh);
  const { data: adminPage } = useGetAllTemplatesQuery({ templateStatus: "APPROVED", pageSize: 100 }, { ...fresh, skip: !isAdmin });
  const allTemplates = useMemo(() => {
    const seen = new Set();
    const approved = [...(adminPage?.data?.contents || []), ...(ownPage?.data?.contents || [])]
      .filter((template) => template?.uuid && !seen.has(template.uuid) && seen.add(template.uuid))
      .filter((template) => template.status !== "ARCHIVED" && (!template.templateStatus || template.templateStatus === "APPROVED"));
    // A design approved twice shows once: its newest version (see templateVersions).
    return [...newestPerDesign(approved).map(fromServerTemplate), ...templates];
  }, [ownPage, adminPage]);
  const availableCategories = useMemo(() => [
    "All",
    ...new Set([
      ...templateCategories.filter((category) => category !== "All"),
      ...allTemplates.flatMap((template) => template.categories || []),
    ]),
  ], [allTemplates]);

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
  } = useTemplateFilters(allTemplates);

  const { isFavorite: isSavedFavorite, toggleFavorite } = useFavorites();

  const isFavorite = (template) => (template.remoteId ? isSavedFavorite(template.remoteId) : favorites.includes(template.id));

  const handleFavorite = (template) => {
    if (template.remoteId) {
      toggleFavorite("TEMPLATE", template.remoteId);
      return;
    }
    setFavorites((current) =>
      current.includes(template.id)
        ? current.filter((id) => id !== template.id)
        : [...current, template.id]
    );
  };

  // A server template is copied into your designs and opened (see useOpenRemoteDesign);
  // a sample one opens the editor as it is.
  // Looking is open to everyone; using a template (a copy saved to an account) needs one.
  const handleUseTemplate = (template) => {
    if (template.remoteId && !isSignedIn) {
      navigate("/auth/login");
      return;
    }
    navigate(template.remoteId ? `/editor?template=${template.remoteId}` : "/editor");
  };

  return (
    <main className="templates-page relative -mt-[126px] min-h-dvh overflow-hidden bg-[var(--surface-base)] pt-[126px] md:-mt-[146px] md:pt-[146px]">
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <CosmicDust particleCount={180} />
      </div>

      <TemplateDecorations />

      <div className="relative z-10 mx-auto w-full max-w-[1700px] px-4 pb-8 pt-7 sm:px-6 sm:pt-9 md:px-8 lg:px-10 xl:px-12">
        <motion.div {...reveal()}>
          <TemplateHeader
            search={search}
            setSearch={setSearch}
            onCreate={canvasPicker.show}
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
            categories={availableCategories}
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
            isFavorite={isFavorite}
            onFavorite={handleFavorite}
            onUse={handleUseTemplate}
            onPreview={setPreviewing}
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
      <TemplatePreviewModal
        template={previewing}
        favorite={previewing ? isFavorite(previewing) : false}
        onFavorite={() => previewing && handleFavorite(previewing)}
        onUse={() => { const chosen = previewing; setPreviewing(null); handleUseTemplate(chosen); }}
        onClose={() => setPreviewing(null)}
      />
      <CanvasPickerModal open={canvasPicker.open} onClose={canvasPicker.close} onCreate={canvasPicker.create} />
    </main>
  );
}
