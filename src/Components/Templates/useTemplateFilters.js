import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 6;

export function useTemplateFilters(templates = []) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  const [orientation, setOrientation] = useState("All");
  const [page, setPage] = useState(1);

  const filteredTemplates = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return templates.filter((template) => {
      const searchableText = [
        template.title,
        template.description,
        template.type,
        ...(template.categories || []),
        ...(template.styles || []),
        ...(template.tags || []),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !keyword || searchableText.includes(keyword);

      const matchesCategory =
        activeCategory === "All" || template.categories?.includes(activeCategory);

      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(template.type);

      const matchesStyle =
        selectedStyles.length === 0 ||
        template.styles?.some((style) => selectedStyles.includes(style));

      const matchesColor =
        selectedColors.length === 0 || selectedColors.includes(template.color);

      const matchesOrientation =
        orientation === "All" || template.orientation === orientation;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesStyle &&
        matchesColor &&
        matchesOrientation
      );
    });
  }, [
    templates,
    search,
    activeCategory,
    selectedTypes,
    selectedStyles,
    selectedColors,
    orientation,
  ]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    activeCategory,
    selectedTypes,
    selectedStyles,
    selectedColors,
    orientation,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const currentTemplates = filteredTemplates.slice(start, start + PAGE_SIZE);

  const toggleArrayValue = (value, setState) => {
    setState((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const resetFilters = () => {
    setSearch("");
    setActiveCategory("All");
    setSelectedTypes([]);
    setSelectedStyles([]);
    setSelectedColors([]);
    setOrientation("All");
    setPage(1);
  };

  const activeFilterCount =
    selectedTypes.length +
    selectedStyles.length +
    selectedColors.length +
    (orientation !== "All" ? 1 : 0);

  return {
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
    filteredTemplates,
    currentTemplates,
    totalPages,
    activeFilterCount,
    toggleArrayValue,
    resetFilters,
  };
}