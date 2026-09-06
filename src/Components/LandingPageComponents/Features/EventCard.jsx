import { ThemeImage } from '../../../theme/ThemeImage';
import { useState } from "react";
import { motion, useTransform } from "motion/react";
import { ImageIcon } from "lucide-react";

function EventPreview({ image, title }) {
  const [failedImage, setFailedImage] = useState(null);
  if (image && image !== failedImage) {
    return <ThemeImage className="event-card-image" src={image} alt={title || "Event backdrop"} loading="lazy" onError={() => setFailedImage(image)} />;
  }
  return (
    <div className="event-preview-placeholder" role="img" aria-label="Event image placeholder">
      <span className="event-preview-ring" aria-hidden="true" />
      <span className="event-preview-spark" aria-hidden="true">✳</span>
      <div className="event-preview-paper" aria-hidden="true">
        <span className="event-preview-paper-kicker" />
        <ImageIcon size={32} strokeWidth={1} />
        <span className="event-preview-paper-title" />
        <span className="event-preview-paper-line" />
        <span className="event-preview-paper-footer" />
      </div>
      <span className="event-preview-caption">Your occasion, imagined.</span>
      <span className="event-preview-label"><ImageIcon size={12} aria-hidden="true" /> Image placeholder</span>
    </div>
  );
}

export default function EventCard({ event, index, count, progress, pinned }) {
  const transform = useTransform(progress, (value) => {
    const distance = Math.min(1, Math.abs(value * (count - 1) - index));
    return pinned ? `scale(${1 - distance * 0.045}) rotate(${distance * (index % 2 ? 1.5 : -1.5)}deg)` : "none";
  });
  const opacity = useTransform(progress, (value) =>
    pinned ? 1 - Math.min(1, Math.abs(value * (count - 1) - index)) * 0.22 : 1,
  );

  return (
    <div className="event-card-slot" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${count}`}>
      <motion.article className={`event-card event-card-tone-${index % 3}`} style={{ transform, opacity }}>
        <div className="event-card-art">
          <EventPreview image={event.image} title={event.title} />
          <span className="event-card-stamp" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        </div>
        <div className="event-card-copy">
          <span className="event-card-kicker">The occasion collection</span>
          <h3>{event.title || "Event name"}</h3>
          <p>{event.description || "Event description goes here."}</p>
        </div>
      </motion.article>
    </div>
  );
}
