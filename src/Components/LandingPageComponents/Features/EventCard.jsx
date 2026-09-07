import { ThemeImage } from "../../../theme/ThemeImage";

export default function EventCard({ event, index, count, duplicate = false }) {
  return (
    <div
      className={`hanging-card-slot hanging-card-${event.tone}`}
      style={{
        "--hanging-card-offset": `${event.offset ?? 0}px`,
        "--hanging-card-width": `${event.width ?? 270}px`,
        "--hanging-card-gap": `${event.gapAfter ?? 40}px`,
      }}
      role={duplicate ? "presentation" : "group"}
      aria-roledescription={duplicate ? undefined : "slide"}
      aria-label={duplicate ? undefined : `${event.title}, ${index + 1} of ${count}`}
      data-event-index={duplicate ? undefined : index}
    >
      <article className="hanging-card">
        <ThemeImage
          className="hanging-card-image"
          src={event.image}
          alt=""
          aria-hidden="true"
          draggable="false"
        />
        <div
          className="hanging-card-copy"
          style={{ "--hanging-content-rotation": `${event.contentRotation ?? 0}deg` }}
        >
          <h3>{event.title}</h3>
          <p>{event.description}</p>
        </div>
      </article>
    </div>
  );
}
