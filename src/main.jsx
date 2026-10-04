import { useState, useEffect } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import asset_Mainn_mp4 from "./assets/Mainn.mp4";
import asset_main1_mp4 from "./assets/main1.mp4";
import asset_main2_mp4 from "./assets/main2.mp4";
import asset_main3_mp4 from "./assets/main3.mp4";
import poster_Mainn from "./assets/Mainn_poster.jpg";
import poster_main1 from "./assets/main1_poster.jpg";
import poster_main2 from "./assets/main2_poster.jpg";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { AboutMe, Socials, Splash, WebDeck, playNav, playEnter, playBack, playOpenOnStart, getMenuVideoSrc, warmVideos, VIDEO } from './Pages.jsx';
import './styles.css';
import BgVideo from './BgVideo.jsx';

// ─────────────────────────────────────────────
// Menu and keyboard selection
// ─────────────────────────────────────────────

// Buttons shown on the main menu
const P3MENU_ITEMS = [{
  id: "about",
  label: "ABOUT ME",
  page: "about",
  fontSize: 80,
  offsetX: 0,
  offsetY: 0,
  skew: -6,
  skewY: 10
}, {
  id: "socials",
  label: "SOCIALS",
  page: "socials",
  fontSize: 74,
  offsetX: 16,
  offsetY: 8,
  skew: -3,
  skewY: 5
}, {
  id: "skills",
  label: "SKILLS",
  page: "skills",
  fontSize: 68,
  offsetX: 8,
  offsetY: 6,
  skew: 0,
  skewY: -4
}, {
  id: "blogs",
  label: "BLOGS",
  page: "blogs",
  fontSize: 70,
  offsetX: 10,
  offsetY: 6,
  skew: -4,
  skewY: 7
}];

// Old buttons, saved for later. NOT shown on the menu.
// To bring one back, copy it into P3MENU_ITEMS above.
const P3MENU_ARCHIVED_ITEMS = [{
  id: "resume",
  label: "RESUME",
  page: "resume",
  fontSize: 66,
  offsetX: 20,
  offsetY: 8,
  skew: -11,
  skewY: -10
}, {
  id: "github",
  label: "GITHUB LINK",
  page: "github",
  fontSize: 68,
  offsetX: 8,
  offsetY: 6,
  skew: 0,
  skewY: -4
}, {
  id: "sideproj",
  label: "SIDE PROJECTS",
  page: "sideproj",
  fontSize: 56,
  offsetX: 10,
  offsetY: 6,
  skew: -4,
  skewY: 7
}];

const P3MENU_CLIP_SHAPES = [(w, h) => `polygon(0px 0px, ${w}px ${h * 0.5}px, 0px ${h}px)`, (w, h) => `polygon(0px 0px, ${w}px ${h * 0.5}px, 0px ${h}px)`, (w, h) => `polygon(0px 0px, ${w}px ${h * 0.5}px, 0px ${h}px)`, (w, h) => `polygon(0px 0px, ${w}px ${h * 0.5}px, 0px ${h}px)`, (w, h) => `polygon(0px 0px, ${w}px ${h * 0.5}px, 0px ${h}px)`];

function P3Menu({
  onNavigate
}) {
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const activate = idx => {
    if (idx !== active) playNav();
    setActive(idx);
    setAnimKey(k => k + 1);
  };
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 1000);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const onKey = e => {
      if (e.key === "ArrowUp") activate(Math.max(0, active - 1));
      if (e.key === "ArrowDown") activate(Math.min(P3MENU_ITEMS.length - 1, active + 1));
      if (e.key === "Enter") onNavigate?.(P3MENU_ITEMS[active].page);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);
  return <>
      <div className="p3-overlay">
        <div className="p3-name-tag">
          <span>lee's</span>
          <span>persona</span>
        </div>

        {/* big faded index of the hovered button: 01, 02, 03... */}
        <div className="p3-index" key={active} aria-hidden="true">{String(active + 1).padStart(2, "0")}</div>

        <nav className="p3-menu">
          {P3MENU_ITEMS.map((item, i) => {
          const isActive = active === i;
          const dist = Math.abs(i - active);
          const opacity = isActive ? 1 : Math.max(0.5, 1 - dist * 0.2);
          const estW = item.label.length * item.fontSize * 0.6 + 80;
          const estH = item.fontSize * 0.94;
          const clipFn = P3MENU_CLIP_SHAPES[i] ?? P3MENU_CLIP_SHAPES[0];
          return <a key={item.id} href="#" className={`p3-row ${isActive ? "active" : ""} ${mounted ? "mounted" : ""}`} style={{
            marginRight: item.offsetX,
            marginTop: item.offsetY,
            transitionDelay: mounted ? `${i * 80}ms` : "0ms"
          }} onClick={e => {
            e.preventDefault();
            onNavigate?.(item.page);
          }} onMouseEnter={() => activate(i)} aria-current={isActive ? "page" : undefined}>
                <div className="p3-glow" />
                <div className="p3-skew-wrap" style={{
              transform: `skewX(${item.skew}deg) skewY(${item.skewY}deg)`
            }}>
                  <div key={isActive ? `pop-${i}-${animKey}` : `idle-${i}`} className={`p3-shadow-tri${isActive ? ' pop' : ''}`} style={{
                width: estW,
                height: estH,
                clipPath: clipFn(estW, estH)
              }} />
                  <div className="p3-highlight" style={{
                width: estW,
                height: estH,
                clipPath: clipFn(estW, estH),
                transform: `translateY(-50%) scaleX(${isActive ? 1 : 0})`
              }} />
                  <div className="p3-label-wrap" style={{
                opacity
              }}>
                    <span className="p3-label-base p3-label-dark" style={{
                  fontSize: item.fontSize
                }}>
                      {item.label}
                    </span>
                    <span className="p3-label-base p3-label-bright" style={{
                  fontSize: item.fontSize,
                  clipPath: clipFn(estW, estH)
                }}>
                      {item.label}
                    </span>
                  </div>
                </div>
              </a>;
        })}
        </nav>

        <div className={`p3-hint ${mounted ? "mounted" : ""}`}>
          <div className="p3-hint-row"><span className="p3-hint-key">↑↓</span><span>NAVIGATE</span></div>
          <div className="p3-hint-row"><span className="p3-hint-key">↵</span><span>CONFIRM</span></div>
        </div>
      </div>
    </>;
}

// ─────────────────────────────────────────────
// Resume cards (template, still used by /resume, /skills and /blogs)
// ─────────────────────────────────────────────
const RESUMEPAGE_ITEMS = [{
  id: "i",
  badge: "I",
  title: "EDUCATION",
  subtitle: "University / Coursework",
  rank: 3
}, {
  id: "ii",
  badge: "II",
  title: "SKILLS",
  subtitle: "Frontend / Design / UI",
  rank: 4
}, {
  id: "iii",
  badge: "III",
  title: "PROJECTS",
  subtitle: "Featured Work",
  rank: 5
}, {
  id: "iv",
  badge: "IV",
  title: "EXPERIENCE",
  subtitle: "Internships / Roles",
  rank: 2
}];
const RESUMEPAGE_EDUCATION_ROWS = [{
  index: "01",
  title: "General Education",
  status: "Complete"
}, {
  index: "02",
  title: "Computer Science Core",
  status: "In Progress"
}, {
  index: "03",
  title: "Elective Track",
  status: "Queued"
}, {
  index: "04",
  title: "Capstone Prep",
  status: "Pending"
}];
function ResumePage({
  src,
  poster,
  title = "LIST"
}) {
  const navigate = useNavigate();
  const [active, setActive] = useState(1);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const onKey = e => {
      if (e.key === "ArrowUp" && active > 0) {
        playNav();
        setActive(active - 1);
      }
      if (e.key === "ArrowDown" && active < RESUMEPAGE_ITEMS.length - 1) {
        playNav();
        setActive(active + 1);
      }
      if (e.key === "ArrowLeft" || e.key === "Escape" || e.key === "Backspace") {
        playBack();
        navigate(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, active]);
  return <div id="menu-screen">
      <BgVideo src={src} poster={poster} />
      <div className="resume-entry-mask" aria-hidden="true">
        <BgVideo className="resume-entry-video" src={src} poster={poster} />
      </div>

      <div className="resume-overlay">
        <div className="resume-stack">
          <div className={`resume-list-tag${mounted ? " mounted" : ""}`}>{title}</div>
          {RESUMEPAGE_ITEMS.map((item, index) => <div key={item.id} className={`resume-card-wrap${active === index ? " active" : ""}${mounted ? " mounted" : ""}`} style={{
          transitionDelay: `${index * 55}ms`
        }} onMouseEnter={() => {
          if (active !== index) playNav();
          setActive(index);
        }} onClick={() => {
          playEnter();
          setActive(index);
        }}>
              <div className="resume-card">
                <div className="resume-badge">
                  <div className="resume-badge-text">{item.badge}</div>
                </div>
                <div className="resume-card-inner">
                  <div className="resume-title">{item.title}</div>
                  <div className="resume-rank">
                    <div className="resume-rank-label">RANK</div>
                    <div className="resume-rank-number">{item.rank}</div>
                  </div>
                </div>
                <div className="resume-subtitle-bar">
                  <div className="resume-subtitle">{item.subtitle}</div>
                </div>
              </div>
            </div>)}
        </div>

        {active === 0 && <div className="resume-detail-panel">
            <div className="resume-detail-top">
              <div className="resume-detail-top-index">01</div>
              <div className="resume-detail-top-title">EDUCATION LOG</div>
              <div className="resume-detail-top-progress">7/5</div>
            </div>

            <div className="resume-detail-list">
              {RESUMEPAGE_EDUCATION_ROWS.map(row => <div className="resume-detail-row" key={row.index}>
                  <div className="resume-detail-row-index">{row.index}</div>
                  <div className="resume-detail-row-title">{row.title}</div>
                  <div className="resume-detail-status">{row.status}</div>
                </div>)}
            </div>

            <div className="resume-detail-bottom">
              <div className="resume-detail-bottom-title">DETAILS</div>
              <div className="resume-detail-bullets">
                <div className="resume-detail-bullet">- Maintain progress across required classes and supporting work.</div>
                <div className="resume-detail-bullet">- Track portfolio-ready projects tied to coursework and labs.</div>
                <div className="resume-detail-bullet">- Keep materials prepared for internships, research, and review.</div>
              </div>
            </div>
          </div>}

      </div>

      <div className="resume-mobile-controls" aria-label="Resume mobile controls">
        <button className="resume-mobile-btn" type="button" onClick={() => {
          playBack();
          navigate(-1);
        }}>
          BACK
        </button>
      </div>
    </div>;
}

// ─────────────────────────────────────────────
// Page transitions
// ─────────────────────────────────────────────
const PAGETRANSITION_defaultBlocks = ["#0d1a3a", "#1a6aff", "#7dd4fc"];
function DefaultTransition() {
  return PAGETRANSITION_defaultBlocks.map((color, i) => <motion.div key={i} style={{
    position: "fixed",
    pointerEvents: "none",
    inset: 0,
    background: color,
    zIndex: 999 - i,
    originX: 0
  }} initial={{
    scaleX: 0
  }} animate={{
    scaleX: [0, 1, 1, 0]
  }} transition={{
    duration: 0.45,
    delay: i * 0.05,
    times: [0, 0.4, 0.6, 1],
    ease: [0.76, 0, 0.24, 1]
  }} />);
}
function AboutTransition() {
  const panels = [{
    color: "#00184c",
    top: "-12vh",
    left: "-18vw",
    width: "86vw",
    delay: 0
  }, {
    color: "#53edff",
    top: "24vh",
    left: "-10vw",
    width: "72vw",
    delay: 0.05
  }, {
    color: "#ffffff",
    top: "58vh",
    left: "-14vw",
    width: "82vw",
    delay: 0.1
  }];
  return panels.map((panel, i) => <motion.div key={i} style={{
    position: "fixed",
    pointerEvents: "none",
    top: panel.top,
    left: panel.left,
    width: panel.width,
    height: "26vh",
    background: panel.color,
    zIndex: 999 - i,
    clipPath: "polygon(0 0, 100% 0, calc(100% - 120px) 100%, 0 100%)",
    transform: "rotate(-18deg)",
    transformOrigin: "left center"
  }} initial={{
    x: -500,
    opacity: 0
  }} animate={{
    x: [-500, 20, 0],
    opacity: [1, 1, 0]
  }} transition={{
    duration: 0.52,
    delay: panel.delay,
    times: [0, 0.68, 1],
    ease: [0.22, 1, 0.36, 1]
  }} />);
}
function SocialsTransition() {
  // Three bands sweep right to left across the middle of the screen, the same line the
  // icon conveyor sits on, so the page appears to be carried in by the wipe.
  const bands = [{
    color: "#00184c",
    top: "29vh",
    delay: 0
  }, {
    color: "#00dff7",
    top: "39.5vh",
    delay: 0.06
  }, {
    color: "#ffffff",
    top: "50vh",
    delay: 0.12
  }];
  return bands.map((band, i) => <motion.div key={i} style={{
    position: "fixed",
    pointerEvents: "none",
    top: band.top,
    left: "-20vw",
    width: "140vw",
    height: "11vh",
    background: band.color,
    zIndex: 999 - i,
    skewX: -16
  }} initial={{
    x: "110vw"
  }} animate={{
    x: ["110vw", "0vw", "0vw", "-130vw"]
  }} transition={{
    duration: 0.62,
    delay: band.delay,
    times: [0, 0.42, 0.58, 1],
    ease: [0.76, 0, 0.24, 1]
  }} />);
}
function TransitionOverlay({
  variant
}) {
  if (variant === "about") return <AboutTransition />;
  if (variant === "resume") return <ResumeTransition />;
  if (variant === "socials") return <SocialsTransition />;
  return <DefaultTransition />;
}
function ResumeTransition() {
  const cards = [{
    top: "14vh",
    color: "#0f1760",
    delay: 0
  }, {
    top: "31vh",
    color: "#7ff6ff",
    delay: 0.05
  }, {
    top: "48vh",
    color: "#ffffff",
    delay: 0.1
  }, {
    top: "65vh",
    color: "#0f1760",
    delay: 0.15
  }];
  return cards.map((card, i) => <motion.div key={i} style={{
    position: "fixed",
    pointerEvents: "none",
    left: "-6vw",
    top: card.top,
    width: "78vw",
    height: "14vh",
    background: card.color,
    zIndex: 999 - i,
    clipPath: "polygon(0 0, 97% 0, 100% 100%, 3% 100%)",
    boxShadow: card.color === "#ffffff" ? "10px 0 0 #d63232" : "none"
  }} initial={{
    x: -900,
    opacity: 1
  }} animate={{
    x: [-900, 30, 0, 900]
  }} transition={{
    duration: 0.6,
    delay: card.delay,
    times: [0, 0.48, 0.7, 1],
    ease: [0.76, 0, 0.24, 1]
  }} />);
}
function PageTransition({
  children,
  variant = "default"
}) {
  const location = useLocation();
  // The slide-in panels are removed from the page once their animation is done,
  // so they can never sit on top of the buttons and swallow hover / click.
  const [showOverlay, setShowOverlay] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowOverlay(false), 1200);
    return () => clearTimeout(t);
  }, []);
  return <AnimatePresence mode="wait">
      <motion.div key={location.pathname} style={{
      position: "relative"
    }}>
        {showOverlay && <div className="pt-overlay" aria-hidden="true"><TransitionOverlay variant={variant} /></div>}
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.2,
        delay: 0.18
      }}>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>;
}

// ─────────────────────────────────────────────
// Page layout and routes
// ─────────────────────────────────────────────
function MenuScreen() {
  const navigate = useNavigate();
  useEffect(() => {
    playOpenOnStart(); // plays every time the menu screen shows
  }, []);
  return <div id="menu-screen">
      <BgVideo src={getMenuVideoSrc()} poster={poster_Mainn} />
      <P3Menu onNavigate={page => {
        playEnter();
        navigate(`/${page}`);
      }} />
    </div>;
}
function AnimatedRoutes() {
  const location = useLocation();
  return <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><MenuScreen /></PageTransition>} />
        <Route path="/about" element={<PageTransition variant="about"><AboutMe /></PageTransition>} />
        <Route path="/socials" element={<PageTransition variant="socials"><Socials /></PageTransition>} />

        {/* New menu pages. Both reuse the Resume template as a placeholder.
            Replace ResumePage with your own SkillsPage / BlogsPage later. */}
        <Route path="/skills" element={<PageTransition><ResumePage src={VIDEO.skills} poster={poster_main2} title="SKILLS" /></PageTransition>} />
        <Route path="/blogs" element={<PageTransition><ResumePage src={VIDEO.about} poster={poster_main1} title="BLOGS" /></PageTransition>} />

        {/* Original Resume page, kept as a template. Not linked from the menu,
            but still reachable at /#/resume */}
        <Route path="/resume" element={<PageTransition><ResumePage src={VIDEO.skills} poster={poster_main2} title="RESUME" /></PageTransition>} />
      </Routes>
    </AnimatePresence>;
}
function App() {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (entered) warmVideos();
  }, [entered]);
  // The CONTINUE click lets the browser play sound, so the deck and menu sounds can start after it.
  if (!entered) return <Splash onContinue={() => setEntered(true)} />;
  return <>
      <AnimatedRoutes />
      <WebDeck />
    </>;
}

// Hash routes work in subfolders and survive refresh on static hosts.
createRoot(document.getElementById('root')).render(<StrictMode><HashRouter><App /></HashRouter></StrictMode>);
