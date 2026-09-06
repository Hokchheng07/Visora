// Temporary API-shaped records. Keep ids stable when replacing these with data.
// Image, title, and description fall back to the dedicated placeholder design.
export const placeholderEvents = Array.from({ length: 6 }, (_, index) => ({
  id: `event-placeholder-${index + 1}`,
  title: null,
  description: null,
  image: null,
}));
