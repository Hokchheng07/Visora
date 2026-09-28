import { fadeInUp } from "../../lib/animations/animations";

/*
 * A person card fading up as it scrolls into view. Cards in the same row
 * follow one another by `step` seconds, as the grid's stagger did; the next
 * row starts again from the left, because it arrives on screen later anyway.
 * Use with custom={{ index, columns, step }}.
 */
export const cardReveal = {
  hidden: fadeInUp.hidden,
  show: ({ index = 0, columns = 1, step = 0.08 } = {}) => ({
    ...fadeInUp.show,
    transition: { ...fadeInUp.show.transition, delay: (index % columns) * step },
  }),
};
