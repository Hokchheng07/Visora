import { motion } from "motion/react";
import { ArrowLeft, ArrowUpRight, Compass } from "lucide-react";
import { Link } from "react-router";
import "./not-found.css";

const particles = [
  ["p-one", "12%", "21%", 7],
  ["p-two", "83%", "26%", 6],
  ["p-three", "23%", "68%", 5],
  ["p-four", "76%", "71%", 7],
  ["p-five", "6%", "53%", 5],
  ["p-six", "94%", "56%", 6],
];

const reveal = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="nf-background" aria-hidden="true">
        <div className="nf-orb orb-1" />
        <div className="nf-orb orb-2" />
        <div className="nf-orb orb-3" />
        <div className="nf-grid-overlay" />
      </div>

      <section className="nf-content" aria-labelledby="not-found-heading">
        <div className="nf-radar" aria-hidden="true">
          <div className="nf-ring ring-one" />
          <div className="nf-ring ring-two" />
          <div className="nf-ring ring-three" />
          <motion.div
            className="nf-sweep"
            animate={{ rotate: 360 }}
            transition={{ duration: 12, ease: "linear", repeat: Infinity }}
          />

          <motion.svg
            className="nf-path"
            viewBox="0 0 600 320"
            fill="none"
            animate={{
              y: [0, -7, 2, -5, 0],
              rotate: [0, 0.7, -0.5, 0.3, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Base wire */}
            <path
              className="nf-cable-base"
              d="M42 221C144 72 232 270 331 139c69-91 145 33 225-91"
            />
            {/* Infinite streaming dashed electric/data cable */}
            <path
              className="nf-cable-stream"
              d="M42 221C144 72 232 270 331 139c69-91 145 33 225-91"
            />
            {/* Infinite traveling energy packet */}
            <path
              className="nf-cable-pulse"
              d="M42 221C144 72 232 270 331 139c69-91 145 33 225-91"
            />

            {/* Cable nodes with larger, easy-to-see circles and infinite ping effect */}
            <g className="nf-node node-1">
              <circle className="nf-node-ping" cx="42" cy="221" r="9" />
              <circle className="nf-node-halo" cx="42" cy="221" r="14" />
              <circle className="nf-node-core" cx="42" cy="221" r="8.5" />
              <circle className="nf-node-center" cx="42" cy="221" r="3.2" />
            </g>
            <g className="nf-node node-2">
              <circle className="nf-node-ping" cx="331" cy="139" r="9" />
              <circle className="nf-node-halo" cx="331" cy="139" r="14" />
              <circle className="nf-node-core" cx="331" cy="139" r="8.5" />
              <circle className="nf-node-center" cx="331" cy="139" r="3.2" />
            </g>
            <g className="nf-node node-3">
              <circle className="nf-node-ping" cx="556" cy="48" r="9" />
              <circle className="nf-node-halo" cx="556" cy="48" r="14" />
              <circle className="nf-node-core" cx="556" cy="48" r="8.5" />
              <circle className="nf-node-center" cx="556" cy="48" r="3.2" />
            </g>
          </motion.svg>
        </div>

        {particles.map(([name, left, top, size], index) => (
          <motion.i
            key={name}
            className={`nf-particle ${name}`}
            style={{ left, top, width: size, height: size }}
            animate={{ y: [0, -13, 0], opacity: [0.25, 0.95, 0.25] }}
            transition={{
              duration: 3.5 + index * 0.4,
              delay: index * 0.25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            aria-hidden="true"
          />
        ))}

        <motion.div
          className="nf-copy"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        >
          <motion.p className="nf-eyebrow" variants={reveal}>
            <Compass size={14} /> Error 404
          </motion.p>
          <motion.h1
            id="not-found-heading"
            className="nf-title"
            variants={{
              hidden: { opacity: 0, scale: 0.88 },
              visible: {
                opacity: 1,
                scale: 1,
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            animate={{ y: [0, -8, 0] }}
            transition={{
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            Sorry Page Not Found
          </motion.h1>
          <motion.p className="nf-subheading" variants={reveal}>
            Oops! This page went off the radar.
          </motion.p>
          <motion.p className="nf-description" variants={reveal}>
            The page you&apos;re looking for doesn&apos;t exist or may have been
            moved. Let&apos;s get you back on track.
          </motion.p>

          <motion.div className="nf-actions" variants={reveal}>
            <div className="nf-btn-wrapper primary-wrap">
              <Link className="nf-primary" to="/dashboard">
                Back to Dashboard <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="nf-btn-wrapper secondary-wrap">
              <Link className="nf-secondary" to="/">
                <ArrowLeft size={17} /> Go Home
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <footer className="nf-footer">
        VISORA <span /> Navigate with confidence
      </footer>
    </main>
  );
}
