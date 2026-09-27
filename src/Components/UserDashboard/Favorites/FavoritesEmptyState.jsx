import { ArrowUpRight, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router";
import "./favorites-empty-state.css";

export default function FavoritesEmptyState() {
  return (
    <section className="favorites-collection-empty" aria-labelledby="favorites-empty-title">
      <div className="favorites-empty-art" aria-hidden="true">
        <span className="favorites-empty-orbit" />

        <span className="favorites-empty-card is-template">
          <span className="favorites-empty-card-image" />
          <span className="favorites-empty-card-line is-long" />
          <span className="favorites-empty-card-line" />
        </span>

        <span className="favorites-empty-card is-design">
          <span className="favorites-empty-card-image" />
          <span className="favorites-empty-card-line is-long" />
          <span className="favorites-empty-card-line" />
        </span>

        <span className="favorites-empty-heart">
          <Heart size={34} strokeWidth={2.1} fill="currentColor" />
        </span>
        <Sparkles className="favorites-empty-spark is-one" size={22} strokeWidth={1.8} />
        <Sparkles className="favorites-empty-spark is-two" size={15} strokeWidth={2} />
      </div>

      <div className="favorites-empty-copy">
        <h2 id="favorites-empty-title">Start your collection</h2>
        <p>
          Select the heart on templates or designs you love. They’ll stay here,
          ready whenever inspiration returns.
        </p>
      </div>

      <Link to="/templates" className="favorites-empty-action">
        Explore templates
        <ArrowUpRight size={17} strokeWidth={2.2} aria-hidden="true" />
      </Link>
    </section>
  );
}
