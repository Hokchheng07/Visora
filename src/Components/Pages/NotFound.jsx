import { Link } from "react-router";
import { Home, LayoutGrid } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import ThemeToggle from "../../theme/ThemeToggle";
import "./not-found.css";

// Decorative twinkling 4-point stars, crosses, and dots
const SPARKLES = [
  { id: "s1", type: "star", color: "cyan", top: "18%", left: "10%", size: 26, delay: 0 },
  { id: "s2", type: "star", color: "pink", top: "28%", left: "22%", size: 28, delay: 0.4 },
  { id: "s3", type: "star", color: "cyan", top: "48%", left: "5%", size: 22, delay: 0.8 },
  { id: "s4", type: "dot", color: "pink", top: "54%", left: "11%", size: 7, delay: 0.2 },
  { id: "s5", type: "plus", color: "cyan", top: "68%", left: "15%", size: 16, delay: 1.1 },
  { id: "s6", type: "star", color: "pink", top: "82%", left: "24%", size: 22, delay: 0.6 },
  { id: "s7", type: "star", color: "cyan", top: "88%", left: "32%", size: 18, delay: 1.4 },
  { id: "s8", type: "dot", color: "cyan", top: "86%", left: "39%", size: 6, delay: 0.9 },
  { id: "s9", type: "star", color: "pink", top: "22%", right: "29%", size: 30, delay: 0.3 },
  { id: "s10", type: "star", color: "cyan", top: "33%", right: "25%", size: 24, delay: 0.7 },
  { id: "s11", type: "plus", color: "pink", top: "42%", right: "8%", size: 16, delay: 1.2 },
  { id: "s12", type: "star", color: "cyan", top: "63%", right: "23%", size: 24, delay: 0.5 },
  { id: "s13", type: "dot", color: "pink", top: "64%", right: "11%", size: 7, delay: 1.0 },
  { id: "s14", type: "star", color: "pink", top: "79%", right: "22%", size: 20, delay: 1.5 },
  { id: "s15", type: "star", color: "cyan", top: "84%", right: "39%", size: 20, delay: 0.8 },
  { id: "s16", type: "dot", color: "pink", top: "88%", right: "42%", size: 6, delay: 1.3 },
];

// Reusable 4-point Diamond Star
function FourPointStar({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" />
    </svg>
  );
}

// Bubbly 3D "4" Digit
function BubbleFour({ delay = 0 }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="nf-digit-wrap nf-digit-four"
      animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
      transition={{ duration: 3.6, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg className="nf-digit-svg" viewBox="0 0 160 195">
        {/* 3D Under-Extrusion Shadow */}
        <path
          className="nf-four-shadow"
          fillRule="evenodd"
          transform="translate(3, 14)"
          d="M 88,16 C 80,16 72,22 66,32 L 20,108 C 12,122 22,138 38,138 L 74,138 L 74,162 C 74,175 85,185 98,185 C 111,185 122,175 122,162 L 122,138 L 134,138 C 147,138 156,127 156,114 C 156,101 147,90 134,90 L 122,90 L 122,38 C 122,25 111,16 98,16 Z M 76,58 L 76,92 L 54,92 Z"
        />
        {/* Front Glossy Face with Border */}
        <path
          className="nf-four-face"
          fillRule="evenodd"
          strokeLinejoin="round"
          d="M 88,16 C 80,16 72,22 66,32 L 20,108 C 12,122 22,138 38,138 L 74,138 L 74,162 C 74,175 85,185 98,185 C 111,185 122,175 122,162 L 122,138 L 134,138 C 147,138 156,127 156,114 C 156,101 147,90 134,90 L 122,90 L 122,38 C 122,25 111,16 98,16 Z M 76,58 L 76,92 L 54,92 Z"
        />
        {/* White Glossy Specular Highlights */}
        <ellipse
          cx="50"
          cy="65"
          rx="7"
          ry="18"
          transform="rotate(-30 50 65)"
          fill="#ffffff"
          opacity="0.88"
        />
        <rect
          x="94"
          y="32"
          width="10"
          height="34"
          rx="5"
          fill="#ffffff"
          opacity="0.88"
        />
        <circle cx="36" cy="122" r="4.5" fill="#ffffff" opacity="0.85" />
      </svg>
    </motion.div>
  );
}

// Bubbly 3D "0" Digit with Centered Twinkling Star
function BubbleZero({ delay = 0.2 }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="nf-digit-wrap nf-digit-zero"
      animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
      transition={{ duration: 3.6, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg className="nf-digit-svg" viewBox="0 0 160 195">
        {/* 3D Under-Extrusion Shadow */}
        <path
          className="nf-zero-shadow"
          fillRule="evenodd"
          transform="translate(3, 14)"
          d="M 80,20 C 116,20 144,54 144,98 C 144,142 116,176 80,176 C 44,176 16,142 16,98 C 16,54 44,20 80,20 Z M 80,56 C 60,56 48,74 48,98 C 48,122 60,140 80,140 C 100,140 112,122 112,98 C 112,74 100,56 80,56 Z"
        />
        {/* Front Glossy Face with Border */}
        <path
          className="nf-zero-face"
          fillRule="evenodd"
          strokeLinejoin="round"
          d="M 80,20 C 116,20 144,54 144,98 C 144,142 116,176 80,176 C 44,176 16,142 16,98 C 16,54 44,20 80,20 Z M 80,56 C 60,56 48,74 48,98 C 48,122 60,140 80,140 C 100,140 112,122 112,98 C 112,74 100,56 80,56 Z"
        />
        {/* White Glossy Specular Curved Arc */}
        <path
          d="M 38,72 C 38,46 56,34 80,34"
          fill="none"
          stroke="#ffffff"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.88"
        />
        <circle cx="33" cy="98" r="4.5" fill="#ffffff" opacity="0.85" />
      </svg>

      {/* Twinkling Star in Center Hole */}
      <motion.div
        className="nf-zero-star"
        animate={
          reduceMotion
            ? undefined
            : {
                rotate: [0, 90, 180, 270, 360],
                scale: [0.85, 1.25, 0.85],
              }
        }
        transition={{
          rotate: { duration: 12, repeat: Infinity, ease: "linear" },
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <FourPointStar size={26} className="nf-zero-star-icon" />
      </motion.div>
    </motion.div>
  );
}

// Paper Airplane with Fold Details
function FoldedPaperAirplane() {
  return (
    <svg className="nf-plane-svg" viewBox="0 0 130 90">
      {/* Dark Outline & Back Wing */}
      <path
        d="M6 32 L124 6 L72 82 L58 46 Z"
        fill="#42a5e2"
        stroke="#1a3b5c"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Top Main Wing */}
      <path
        d="M6 32 L124 6 L58 46 Z"
        fill="#62c7f8"
        stroke="#1a3b5c"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Inner White Fold */}
      <path
        d="M58 46 L72 82 L84 36 Z"
        fill="#d9f1ff"
        stroke="#1a3b5c"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Crease Line */}
      <path
        d="M6 32 L58 46"
        stroke="#1a3b5c"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Bottom Corner Fluid Neon Waves (matches media_1789626977482.png)
function BottomCornerWaves() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="nf-corner-waves-wrap" aria-hidden="true">
      {/* Bottom Left Fluid Wave */}
      <motion.div
        className="nf-wave-corner nf-wave-left"
        animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          viewBox="0 0 520 280"
          className="nf-wave-svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGradLeftBack" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e1842" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#13102d" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#080714" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="waveGradLeftFront" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14112c" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#0d0b1d" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#06060a" stopOpacity="1" />
            </linearGradient>
            <filter id="pinkGlowLeft" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f05ebd" floodOpacity="0.85" />
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#f05ebd" floodOpacity="0.45" />
            </filter>
            <filter id="cyanGlowLeft" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#62c7f8" floodOpacity="0.75" />
              <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#62c7f8" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Back Wave Fill */}
          <path
            className="nf-wave-fill-back-left"
            d="M 0,280 L 0,80 C 80,60 160,110 240,125 C 330,140 400,210 520,280 Z"
          />
          {/* Back Wave Contour */}
          <path
            className="nf-wave-stroke-back-left"
            d="M 0,80 C 80,60 160,110 240,125 C 330,140 400,210 520,280"
            fill="none"
          />

          {/* Front Wave Fill */}
          <path
            className="nf-wave-fill-front-left"
            d="M 0,280 L 0,165 C 60,135 110,130 160,185 C 220,245 290,260 410,280 Z"
          />
          {/* Front Wave Contour */}
          <path
            className="nf-wave-stroke-front-left"
            d="M 0,165 C 60,135 110,130 160,185 C 220,245 290,260 410,280"
            fill="none"
          />
        </svg>
      </motion.div>

      {/* Bottom Right Fluid Wave */}
      <motion.div
        className="nf-wave-corner nf-wave-right"
        animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
        transition={{ duration: 7, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          viewBox="0 0 520 280"
          className="nf-wave-svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGradRightBack" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e1842" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#13102d" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#080714" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="waveGradRightFront" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#14112c" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#0d0b1d" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#06060a" stopOpacity="1" />
            </linearGradient>
            <filter id="pinkGlowRight" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f05ebd" floodOpacity="0.85" />
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#f05ebd" floodOpacity="0.45" />
            </filter>
            <filter id="cyanGlowRight" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#62c7f8" floodOpacity="0.75" />
              <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#62c7f8" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Back Wave Fill */}
          <path
            className="nf-wave-fill-back-right"
            d="M 520,280 L 520,80 C 440,60 360,110 280,125 C 190,140 120,210 0,280 Z"
          />
          {/* Back Wave Contour */}
          <path
            className="nf-wave-stroke-back-right"
            d="M 520,80 C 440,60 360,110 280,125 C 190,140 120,210 0,280"
            fill="none"
          />

          {/* Front Wave Fill */}
          <path
            className="nf-wave-fill-front-right"
            d="M 520,280 L 520,165 C 460,135 410,130 360,185 C 300,245 230,260 110,280 Z"
          />
          {/* Front Wave Contour */}
          <path
            className="nf-wave-stroke-front-right"
            d="M 520,165 C 460,135 410,130 360,185 C 300,245 230,260 110,280"
            fill="none"
          />
        </svg>
      </motion.div>
    </div>
  );
}

export default function NotFound() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="nf-full-page" aria-labelledby="nf-title">
      {/* Floating Theme Toggle */}
      <div className="nf-floating-toggle">
        <ThemeToggle />
      </div>

      {/* Scattered Twinkling Sparkles and Stars */}
      <div className="nf-sparkles-field" aria-hidden="true">
        {SPARKLES.map((sp) => {
          const style = {
            top: sp.top,
            left: sp.left,
            right: sp.right,
          };
          return (
            <motion.div
              key={sp.id}
              className={`nf-sparkle nf-sparkle-${sp.color}`}
              style={style}
              animate={
                reduceMotion
                  ? undefined
                  : {
                      scale: [0.75, 1.25, 0.75],
                      opacity: [0.35, 1, 0.35],
                    }
              }
              transition={{
                duration: 2.8,
                delay: sp.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {sp.type === "star" && (
                <FourPointStar
                  size={sp.size}
                  className={`nf-star-icon nf-star-${sp.color}`}
                />
              )}
              {sp.type === "plus" && (
                <span
                  className={`nf-plus-icon nf-plus-${sp.color}`}
                  style={{ fontSize: sp.size }}
                >
                  +
                </span>
              )}
              {sp.type === "dot" && (
                <span
                  className={`nf-dot-icon nf-dot-${sp.color}`}
                  style={{
                    width: sp.size,
                    height: sp.size,
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Floating Volumetric Glowing Clouds */}
      <div className="nf-clouds-field" aria-hidden="true">
        {/* Top-Left Rich Luminous Cloud */}
        <motion.div
          className="nf-cloud nf-cloud-top-left"
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [-8, 12, -8],
                  y: [0, -7, 0],
                }
          }
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 160 100" className="nf-cloud-svg">
            <defs>
              <linearGradient id="cloudGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className="nf-cloud-stop-left-0" />
                <stop offset="60%" className="nf-cloud-stop-left-60" />
                <stop offset="100%" className="nf-cloud-stop-left-100" />
              </linearGradient>
            </defs>
            <path
              d="M 25,82 L 135,82 C 150,82 158,72 156,58 C 154,45 142,38 130,40 C 124,20 108,8 88,12 C 70,16 60,32 58,42 C 48,38 34,44 32,56 C 20,58 14,70 25,82 Z"
              fill="url(#cloudGradLeft)"
              className="nf-cloud-shape-left"
            />
          </svg>
        </motion.div>

        {/* Right Volumetric Luminous Cloud */}
        <motion.div
          className="nf-cloud nf-cloud-right"
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [10, -10, 10],
                  y: [0, -8, 0],
                }
          }
          transition={{ duration: 5.0, delay: 0.3, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 160 100" className="nf-cloud-svg">
            <defs>
              <linearGradient id="cloudGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className="nf-cloud-stop-right-0" />
                <stop offset="50%" className="nf-cloud-stop-right-50" />
                <stop offset="100%" className="nf-cloud-stop-right-100" />
              </linearGradient>
            </defs>
            <path
              d="M 25,82 L 135,82 C 150,82 158,72 156,58 C 154,45 142,38 130,40 C 124,20 108,8 88,12 C 70,16 60,32 58,42 C 48,38 34,44 32,56 C 20,58 14,70 25,82 Z"
              fill="url(#cloudGradRight)"
              className="nf-cloud-shape-right"
            />
          </svg>
        </motion.div>
      </div>

      {/* Central Visual Stage */}
      <div className="nf-hero-stage">
        {/* Sticky Note on the Left */}
        <motion.aside
          className="nf-sticky-card"
          animate={
            reduceMotion
              ? undefined
              : {
                  rotate: [-11, -8, -11],
                  y: [0, -6, 0],
                }
          }
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Pink Tape on top */}
          <div className="nf-sticky-tape" aria-hidden="true" />
          <div className="nf-sticky-text">
            <p>Good</p>
            <p>designs</p>
            <p>are always</p>
            <p>somewhere</p>
            <p>
              near{" "}
              <motion.span
                className="nf-sticky-heart"
                animate={reduceMotion ? undefined : { scale: [1, 1.25, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                ♡
              </motion.span>
            </p>
          </div>
        </motion.aside>

        {/* 3D Bubble 404 Cluster with Airplane & Flight Trail */}
        <div className="nf-404-cluster">
          {/* Burst doodle rays to the left of the first 4 */}
          <motion.div
            className="nf-burst-rays"
            aria-hidden="true"
            animate={reduceMotion ? undefined : { scale: [1, 1.12, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="ray ray-pink" />
            <span className="ray ray-yellow" />
            <span className="ray ray-cyan" />
          </motion.div>

          {/* First Bubble 4 */}
          <BubbleFour delay={0} />

          {/* Middle Bubble 0 */}
          <BubbleZero delay={0.15} />

          {/* Second Bubble 4 */}
          <BubbleFour delay={0.3} />

          {/* Burst doodle stripes to the right of second 4 */}
          <div className="nf-burst-stripes" aria-hidden="true">
            <span className="stripe" />
            <span className="stripe" />
          </div>

          {/* Top-Right Big Pink Sparkle */}
          <div className="nf-top-pink-star" aria-hidden="true">
            <FourPointStar size={32} />
          </div>

          {/* Flying Paper Airplane & Dashed Flight Path */}
          <div className="nf-flight-container" aria-hidden="true">
            {/* Dashed Curving Path from the 0 up to the plane */}
            <svg className="nf-flight-path-svg" viewBox="0 0 340 180">
              <path
                d="M 12 170 C 40 100 70 85 105 110 C 135 132 155 125 158 98 C 162 70 148 52 135 60 C 120 70 134 94 158 84 C 190 70 230 45 285 24"
                fill="none"
                className="nf-flight-path-line"
                strokeWidth="2.6"
                strokeDasharray="6 7"
                strokeLinecap="round"
              />
            </svg>

            {/* Hovering Paper Airplane */}
            <motion.div
              className="nf-airplane-entity"
              animate={
                reduceMotion
                  ? undefined
                  : {
                      x: [0, 7, 0],
                      y: [0, -10, 0],
                      rotate: [-2, 3, -2],
                    }
              }
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <FoldedPaperAirplane />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Headings and Subtext */}
      <div className="nf-content-block">
        <h1 id="nf-title" className="nf-title-text">
          <span className="nf-title-oops">Oops!</span> This page wandered off.
        </h1>
        <p className="nf-desc-text">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>

        {/* Action Buttons */}
        <div className="nf-action-buttons">
          {/* Go Home Button */}
          <motion.div
            whileHover={reduceMotion ? undefined : { scale: 1.04, y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          >
            <Link to="/" className="nf-btn nf-btn-home">
              <Home size={19} strokeWidth={2.4} />
              <span>Go Home</span>
            </Link>
          </motion.div>

          {/* Browse Templates Button */}
          <motion.div
            whileHover={reduceMotion ? undefined : { scale: 1.04, y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          >
            <Link to="/templates" className="nf-btn nf-btn-templates">
              <LayoutGrid size={19} strokeWidth={2.2} />
              <span>Browse Templates</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Fluid Neon Corner Waves along Bottom Left & Right (from reference image) */}
      <BottomCornerWaves />
    </main>
  );
}
