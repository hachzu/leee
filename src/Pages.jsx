import { useState, useEffect, useRef, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import asset_char1_png from "./assets/char1.png";
import asset_char2_png from "./assets/char2.png";
import asset_char3_png from "./assets/char3.png";
import asset_main1_mp4 from "./assets/main1.mp4";
import asset_main3_mp4 from "./assets/main3.mp4";
import asset_Mainn_mp4 from "./assets/Mainn.mp4";
import asset_main2_mp4 from "./assets/main2.mp4";
import poster_Mainn from "./assets/Mainn_poster.jpg";
import poster_main1 from "./assets/main1_poster.jpg";
import poster_main2 from "./assets/main2_poster.jpg";
import poster_main3 from "./assets/main3_poster.jpg";
import lite_Mainn from "./assets/Mainn_lite.mp4";
import lite_main1 from "./assets/main1_lite.mp4";
import lite_main2 from "./assets/main2_lite.mp4";
import lite_main3 from "./assets/main3_lite.mp4";
import aboutStyles from './about.css?inline';
import socialStyles from './socials.css?inline';
import BgVideo from './BgVideo.jsx';
import asset_open_ui_wav from "./assets/open_ui.wav";
import asset_enter_ui_wav from "./assets/enter_ui.wav";
import asset_navigation_ui_wav from "./assets/navigation_ui.wav";
import asset_back_ui_wav from "./assets/back_ui.wav";
import asset_deck_ui_wav from "./assets/deck_ui.wav";
import asset_launch_ui_wav from "./assets/launch_ui.wav";

// ─────────────────────────────────────────────
// UI sounds
//   open_ui        menu screen appears (also when coming back to it)
//   enter_ui       a button is clicked / confirmed
//   back_ui        the visitor goes back (Esc, Backspace, ←, BACK button)
//   deck_ui        navigating while inside a deck (About reveal, Socials link list)
//   navigation_ui  hovering or cycling through elements
// Every play uses a fresh copy of the sound, so sounds are never cut off:
// quick repeats layer on top of each other until each one finishes.
// Browsers block sound until the visitor has clicked or pressed a key once,
// so the very first hover can be silent. That is normal.
// ─────────────────────────────────────────────
const SFX_DEFS = {
  open: { src: asset_open_ui_wav, volume: 0.6 },
  enter: { src: asset_enter_ui_wav, volume: 0.6 },
  nav: { src: asset_navigation_ui_wav, volume: 0.5 }, // volume: 0 = silent, 1 = full
  back: { src: asset_back_ui_wav, volume: 0.6 },
  deck: { src: asset_deck_ui_wav, volume: 0.5 },
  launch: { src: asset_launch_ui_wav, volume: 0.6 } // opening a social link
};

// Sounds are downloaded and decoded once into memory (Web Audio), then played from there.
let audioCtx = null;
const buffers = {};
function getCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  return audioCtx;
}
export function resumeAudio() {
  const c = getCtx();
  if (c && c.state !== "running") {
    return c.resume().catch(() => {});
  }
  return Promise.resolve();
}
function unlockAudioOnGesture() {
  resumeAudio();
  if (audioCtx && audioCtx.state === "running") {
    ["pointerdown", "keydown", "touchend"].forEach(t => window.removeEventListener(t, unlockAudioOnGesture));
  }
}
["pointerdown", "keydown", "touchend"].forEach(t => window.addEventListener(t, unlockAudioOnGesture));

// Returns true if the sound started, false if it could not (not loaded yet, or the browser still blocks audio).
function playSfx(name) {
  const c = audioCtx;
  const buf = buffers[name];
  if (!c || !buf) return false;
  if (c.state !== "running") {
    c.resume().catch(() => {});
    return false;
  }
  try {
    const src = c.createBufferSource();
    src.buffer = buf;
    const gain = c.createGain();
    gain.gain.value = SFX_DEFS[name].volume;
    src.connect(gain);
    gain.connect(c.destination);
    src.start(0);
    return true;
  } catch (err) {
    return false;
  }
}
export const playNav = () => {
  playSfx("nav");
};
export const playEnter = () => {
  playSfx("enter");
};
export const playOpen = () => {
  playSfx("open");
};
export const playBack = () => {
  playSfx("back");
};
export const playDeck = () => {
  playSfx("deck");
};
export const playLaunch = () => {
  playSfx("launch");
};

// open_ui: plays when the menu screen shows. If the browser still blocks audio
// (no click or key press yet), it plays on the visitor's first key press or
// click instead, as long as they are still on the menu.
let lastOpenAt = 0;
let openArmed = false;
const onMenuScreen = () => {
  const h = window.location.hash;
  return h === "" || h === "#" || h === "#/";
};
function unlockOpen(e) {
  if (e.type === "keydown" && e.key === "Enter") return;
  if (e.target && e.target.closest && e.target.closest(".p3-row")) return;
  disarmOpen();
  resumeAudio().then(() => {
    if (onMenuScreen()) playSfx("open");
  });
}
function disarmOpen() {
  window.removeEventListener("pointerdown", unlockOpen);
  window.removeEventListener("keydown", unlockOpen);
  openArmed = false;
}
export function playOpenOnStart() {
  const now = Date.now();
  if (now - lastOpenAt < 400) return; // React StrictMode runs effects twice in dev
  lastOpenAt = now;
  disarmOpen();
  if (!playSfx("open")) {
    if (openArmed) return;
    openArmed = true;
    window.addEventListener("pointerdown", unlockOpen);
    window.addEventListener("keydown", unlockOpen);
  }
}

// Phones, narrow screens, Data Saver and slow connections get the small 720p videos.
// Everyone else gets the full-quality ones. Decided once when the page loads.
const USE_LITE_VIDEO = (() => {
  try {
    if (window.matchMedia("(max-width: 768px)").matches) return true;
    const c = navigator.connection;
    if (c && (c.saveData || ["slow-2g", "2g", "3g"].includes(c.effectiveType))) return true;
  } catch (err) {}
  return false;
})();
export const VIDEO = {
  menu: USE_LITE_VIDEO ? lite_Mainn : asset_Mainn_mp4,
  about: USE_LITE_VIDEO ? lite_main1 : asset_main1_mp4,
  skills: USE_LITE_VIDEO ? lite_main2 : asset_main2_mp4,
  socials: USE_LITE_VIDEO ? lite_main3 : asset_main3_mp4
};

// ─────────────────────────────────────────────
// Preloading
//   preloadEssentials: runs on the CONTINUE screen. Loads the sounds, the images
//     and posters, and the menu video (kept in memory as a blob so the menu never shows black).
//   warmVideos: after entering, quietly downloads the other videos so the browser caches them.
//   Both skip the big downloads when the visitor has Data Saver on or a 2G connection.
// ─────────────────────────────────────────────
const PRELOAD_TIMEOUT_MS = 20000;
let menuVideoUrl = VIDEO.menu;
export const getMenuVideoSrc = () => menuVideoUrl;

function isSlowConnection() {
  const c = navigator.connection;
  if (!c) return false;
  return !!c.saveData || c.effectiveType === "slow-2g" || c.effectiveType === "2g";
}

async function loadSfxBuffers(onEach) {
  const c = getCtx();
  const names = Object.keys(SFX_DEFS);
  if (!c) {
    names.forEach(() => onEach());
    return;
  }
  await Promise.all(names.map(async name => {
    try {
      const res = await fetch(SFX_DEFS[name].src);
      const data = await res.arrayBuffer();
      buffers[name] = await new Promise((resolve, reject) => c.decodeAudioData(data, resolve, reject));
    } catch (err) {}
    onEach();
  }));
}

async function fetchBlobWithProgress(url, onFrac) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("bad response");
  const total = Number(res.headers.get("content-length")) || 0;
  if (!res.body || !res.body.getReader) {
    const b = await res.blob();
    onFrac(1);
    return b;
  }
  const reader = res.body.getReader();
  const chunks = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    got += value.length;
    if (total) onFrac(Math.min(0.99, got / total));
  }
  onFrac(1);
  return new Blob(chunks, { type: res.headers.get("content-type") || "video/mp4" });
}

let essentialsPromise = null;
let essentialsProgress = 0;
let progressListener = null;
function reportProgress(v) {
  essentialsProgress = Math.max(essentialsProgress, v);
  if (progressListener) progressListener(essentialsProgress);
}

async function runPreload() {
  const slow = isSlowConnection();
  const weights = { sfx: 12, img: 14 };
  if (!slow) weights.video = 60;
  const frac = { sfx: 0, img: 0, video: 0 };
  const report = () => {
    let total = 0;
    let got = 0;
    for (const k in weights) {
      total += weights[k];
      got += weights[k] * (frac[k] || 0);
    }
    reportProgress(total ? Math.round((got / total) * 100) : 100);
  };

  const sfxCount = Object.keys(SFX_DEFS).length;
  const images = [asset_char1_png, asset_char2_png, asset_char3_png, poster_Mainn, poster_main1, poster_main2, poster_main3];
  let sfxDone = 0;
  let imgDone = 0;

  const jobs = [
    loadSfxBuffers(() => {
      sfxDone++;
      frac.sfx = sfxDone / sfxCount;
      report();
    }),
    Promise.all(images.map(src => new Promise(resolve => {
      const img = new Image();
      img.onload = img.onerror = () => {
        imgDone++;
        frac.img = imgDone / images.length;
        report();
        resolve();
      };
      img.src = src;
    })))
  ];
  if (!slow) {
    jobs.push(fetchBlobWithProgress(VIDEO.menu, f => {
      frac.video = f;
      report();
    }).then(blob => {
      menuVideoUrl = URL.createObjectURL(blob);
    }).catch(() => {}).then(() => {
      frac.video = 1;
      report();
    }));
  }
  await Promise.all(jobs);
}

export function preloadEssentials(listener) {
  progressListener = listener || null;
  if (listener) listener(essentialsProgress);
  if (!essentialsPromise) essentialsPromise = runPreload();
  return essentialsPromise;
}

let warmStarted = false;
export function warmVideos() {
  if (warmStarted) return;
  warmStarted = true;
  if (isSlowConnection()) return;
  const urls = [VIDEO.about, VIDEO.socials, VIDEO.skills]; // About, Socials, Skills in that order
  setTimeout(async () => {
    for (const u of urls) {
      try {
        const res = await fetch(u, { priority: "low" });
        const reader = res.body.getReader();
        while (!(await reader.read()).done) {}
      } catch (err) {}
    }
  }, 3000);
}

// About page
const ABOUTME_CHARS = [asset_char1_png, asset_char2_png, asset_char3_png];

// Buttons on the About page (all text below is placeholder).
//   label  - text on the bar and the card title
//   role   - the tilted word on the left of the bar
//   group  - puts a divider with this title above the button (also shown on the card)
//   sections - what the card on the right shows. Each section has a title and a type:
//     "rows" : rows: [["LABEL", "value"], ...]
//     "tags" : tags: ["one", "two"]
//     "text" : paragraphs: ["first paragraph", "second paragraph", ...]  (free writing, e.g. your introduction)
//     "list" : items: [{ icon, name, detail, credit, mine }]
//              icon = a short symbol/emoji, or an imported image
//              credit = small tag on the right (e.g. "ART BY @artist"); mine: true makes it blue
//   side   - optional. A small tab hanging off the right side of the card, with the same kind of sections
//            (sideTitle = the little title on it). Used by PROFILE for basic info, map and languages.
// Characters repeat in order if there are more buttons than images.
const ABOUTME_ITEMS = [{
  id: "profile",
  label: "PROFILE",
  role: "LEADER",
  sideTitle: "BIO",
  sections: [{
    title: "INTRODUCTION",
    type: "text",
    paragraphs: ["hi, i'm moneybagg! this is where your main introduction goes. say who you are, what you do and what this little corner of the internet is for.", "add a second paragraph about what you're into: the things you make, the games you play, the music that's on repeat. each string in this list is its own paragraph, so write as many as you like.", "and a last one for anything else visitors should know before they go poking around the rest of the menu."]
  }, {
    title: "CURRENTLY",
    type: "text",
    paragraphs: ["a short note about what you're working on or into right now. placeholder text, swap it whenever."]
  }],
  // the small tab that hangs off the right side of the card. Same section types as above.
  side: [{
    title: "BASIC INFO",
    type: "rows",
    rows: [["NAME", "moneybagg"], ["YEAR", "placeholder"], ["BIRTHDAY", "mm/dd"], ["PRONOUNS", "placeholder"], ["MAJOR", "computer science"]]
  }, {
    title: "MAP",
    type: "list",
    items: [{ icon: "◎", name: "city, country", detail: "where i'm based" }]
  }, {
    title: "LANGUAGES",
    type: "tags",
    tags: ["language one", "language two"]
  }]
}, {
  id: "music",
  group: "INTERESTS",
  label: "MUSIC",
  role: "PARTY",
  sections: [{
    title: "FAVORITE ARTISTS",
    type: "list",
    items: [{ icon: "♪", name: "artist name", detail: "why i like them" }, { icon: "♪", name: "artist name", detail: "why i like them" }]
  }, {
    title: "FAVORITE SONGS",
    type: "list",
    items: [{ icon: "♫", name: "song title", detail: "artist / album" }, { icon: "♫", name: "song title", detail: "artist / album" }]
  }]
}, {
  id: "shows",
  label: "SHOWS / ANIME",
  role: "PARTY",
  sections: [{
    title: "ANIME",
    type: "list",
    items: [{ icon: "★", name: "anime title", detail: "short thoughts" }, { icon: "★", name: "anime title", detail: "short thoughts" }]
  }, {
    title: "SHOWS",
    type: "list",
    items: [{ icon: "▶", name: "show title", detail: "short thoughts" }]
  }]
}, {
  id: "ocs",
  label: "ORIGINAL CHARACTERS",
  role: "PARTY",
  sections: [{
    title: "CHARACTERS",
    type: "list",
    items: [{ icon: "◆", name: "character one", detail: "short description", credit: "DRAWN BY ME", mine: true }, { icon: "◆", name: "character two", detail: "short description", credit: "ART BY @ARTIST" }, { icon: "◆", name: "character three", detail: "short description", credit: "COMMISSION: @ARTIST" }]
  }]
}, {
  id: "games",
  label: "GAMES",
  role: "PARTY",
  sections: [{
    title: "ALL-TIME FAVORITES",
    type: "list",
    items: [{ icon: "▣", name: "game title", detail: "why it's a favorite" }, { icon: "▣", name: "game title", detail: "why it's a favorite" }]
  }, {
    title: "CURRENTLY PLAYING",
    type: "list",
    items: [{ icon: "▣", name: "game title", detail: "how far in" }]
  }]
}];

// Ad blockers (uBlock, AdBlock, Edge's built-in blockers...) hide anything whose class starts with "ad-".
// That is why the About detail card was in the page but invisible. The card's classes are now "abt-*" in
// this file, and the matching selectors in about.css (still written as ".ad-*") are renamed here so
// about.css doesn't need to change.
// Look-and-feel changes for the About page, added on top of about.css (loaded after it, so they win).
// Calmer "water" palette: navy + one cyan + a mid blue. Red is kept only as a small accent
// (the tip of the card's top edge and the diamond in front of group titles).
const aboutTweaks = `
/* ── card: no number, water colours, red only on the tip of the top edge ── */
.abt-panel { --side-w: min(17vw, 240px); }
.abt-panel.has-side { right: calc(3vw + var(--side-w)); width: min(40vw, 580px); }
.abt-shell { background: rgba(6, 18, 52, 0.94); }
.abt-shell::before { background: linear-gradient(90deg, #c4001a 0 12%, #3ce2ff 12%, #1a6aff 100%); }
.abt-title { color: #06133b; }
.abt-chip { background: #06133b; color: #8df6ff; }
.abt-body { scrollbar-color: #3ce2ff transparent; }
.abt-sec-title { color: #bfeaff; }
.abt-sec-title i { background: #3ce2ff; }
.abt-sec-title b { background: linear-gradient(90deg, rgba(191, 234, 255, 0.5), rgba(191, 234, 255, 0)); }
.abt-row, .abt-item, .abt-text { background: rgba(120, 170, 255, 0.08); }
.abt-row, .abt-text { border-left: 3px solid #2f7bff; }
.abt-icon-wrap { filter: drop-shadow(4px 4px 0 #2f7bff); }
.abt-tag { background: rgba(60, 226, 255, 0.12); color: #bff6ff; border-left: 3px solid #3ce2ff; }
.abt-credit { background: #2f7bff; }
.abt-credit.mine { background: #8df6ff; color: #04122e; }

/* ── the small tab hanging off the right side of the card ── */
.abt-side {
  position: absolute;
  left: calc(100% - 10px);
  top: 74px;
  z-index: -1;
  width: var(--side-w);
  max-height: calc(100% - 100px);
  display: flex;
  flex-direction: column;
  padding-left: 10px;
  background: rgba(6, 18, 52, 0.94);
  clip-path: polygon(0 0, 100% 0, calc(100% - 14px) 100%, 0 100%);
  animation: abt-side-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both;
}
@keyframes abt-side-in {
  from { opacity: 0; transform: translateX(-70px); }
  to   { opacity: 1; transform: translateX(0); }
}
.abt-side::before { content: ""; height: 5px; flex-shrink: 0; background: #3ce2ff; }
.abt-side-head {
  flex-shrink: 0;
  padding: 7px 22px 7px 16px;
  background: #fff;
  clip-path: polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%);
}
.abt-side-head span {
  font-family: 'Anton', sans-serif;
  font-style: italic;
  font-size: 22px;
  letter-spacing: 1px;
  line-height: 1;
  color: #06133b;
}
.abt-side-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px 16px 16px 8px;
  scrollbar-width: thin;
  scrollbar-color: #3ce2ff transparent;
}
.abt-side .abt-sec { margin-bottom: 16px; }
.abt-side .abt-sec-title { font-size: 17px; letter-spacing: 3px; margin-bottom: 8px; }
.abt-side .abt-row { grid-template-columns: 1fr; gap: 2px; padding: 6px 12px 7px 10px; margin-bottom: 5px; }
.abt-side .abt-k { font-size: 14px; letter-spacing: 2px; }
.abt-side .abt-v { font-size: 19px; }
.abt-side .abt-item { padding: 7px 12px 7px 8px; gap: 10px; }
.abt-side .abt-icon { width: 36px; height: 36px; font-size: 18px; }
.abt-side .abt-name { font-size: 17px; }
.abt-side .abt-detail { font-size: 12px; }
.abt-side .abt-tag { font-size: 17px; padding: 4px 14px 4px 9px; }

/* ── left list: navy bars, cyan underlay instead of red ── */
.sc-bar { background: #0a1633; }
.sc-bar-red { background: #3ce2ff; }
.sc-bar-outer.active .sc-label { color: #06133b; }

/* ── group divider (e.g. INTERESTS), now with a line you can actually see ── */
.sc-group {
  width: 45vw;
  height: 26px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 18px;
  pointer-events: none;
  transform: translateX(-100%);
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}
.sc-group.mounted { transform: translateX(0); }
.sc-group-dot { width: 10px; height: 10px; background: #c4001a; transform: rotate(45deg); flex-shrink: 0; }
.sc-group-label {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 20px;
  letter-spacing: 5px;
  line-height: 1;
  color: #fff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.8), 0 0 2px rgba(0, 0, 0, 0.8);
  user-select: none;
}
.sc-group-rule {
  flex: 1;
  min-width: 40px;
  height: 3px;
  background: #fff;
  box-shadow: 0 2px 0 rgba(6, 19, 59, 0.85), 0 0 8px rgba(255, 255, 255, 0.35);
  transform: skewX(-30deg);
}
@media (max-width: 1024px) {
  .sc-group { width: min(88vw, 760px); }
  .abt-panel.has-side { right: 8px; width: auto; }
  .abt-side {
    position: static;
    z-index: auto;
    width: auto;
    max-height: 18vh;
    flex-shrink: 0;
    margin-top: 6px;
    padding-left: 0;
    clip-path: none;
  }
}
@media (max-width: 768px) {
  .sc-group { width: min(96vw, 560px); height: 20px; padding-left: 10px; }
  .sc-group-label { font-size: 15px; letter-spacing: 3px; }
}
`;

const aboutCss = aboutStyles.replace(/\.ad-/g, ".abt-") + aboutTweaks;

// One section of a card (also used inside the side tab).
function AboutSection({ sec, delay }) {
  return <section className="abt-sec">
      <div className="abt-sec-title"><i />{sec.title}<b /></div>
      {sec.type === "rows" && sec.rows.map(([k, v]) => <div className="abt-row" style={delay()} key={k}>
          <span className="abt-k">{k}</span>
          <span className="abt-v">{v}</span>
        </div>)}
      {sec.type === "text" && sec.paragraphs.map((t, k) => <p className="abt-text" style={delay()} key={k}>{t}</p>)}
      {sec.type === "tags" && <div className="abt-tags">
          {sec.tags.map(t => <span className="abt-tag" style={delay()} key={t}>{t}</span>)}
        </div>}
      {sec.type === "list" && sec.items.map((it, k) => <div className="abt-item" style={delay()} key={k}>
          <div className="abt-icon-wrap">
            <div className="abt-icon">
              {typeof it.icon === "string" && it.icon.length > 3 ? <img src={it.icon} alt="" /> : it.icon}
            </div>
          </div>
          <div className="abt-item-text">
            <div className="abt-name">{it.name}</div>
            {it.detail && <div className="abt-detail">{it.detail}</div>}
          </div>
          {it.credit && <span className={`abt-credit${it.mine ? " mine" : ""}`}>{it.credit}</span>}
        </div>)}
    </section>;
}

// The card that shows on the right side of the About page.
// If the button has a "side" list, a small tab hangs off the right edge of the card.
function AboutDetail({ item, chip }) {
  let n = 0; // counts rows so they pop in one after another
  const delay = () => ({ animationDelay: `${120 + n++ * 55}ms` });
  return <aside className={`abt-panel${item.side ? " has-side" : ""}`}>
      <div className="abt-shell" key={item.id}>
        <div className="abt-head">
          <span className="abt-title">{item.label}</span>
          <span className="abt-chip">{chip}</span>
        </div>
        <div className="abt-body">
          {item.sections.map(sec => <AboutSection sec={sec} delay={delay} key={sec.title} />)}
        </div>
      </div>
      {item.side && <div className="abt-side" key={`${item.id}-side`}>
          <div className="abt-side-head"><span>{item.sideTitle || "BIO"}</span></div>
          <div className="abt-side-body">
            {item.side.map(sec => <AboutSection sec={sec} delay={delay} key={sec.title} />)}
          </div>
        </div>}
    </aside>;
}

export function AboutMe() {
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const navigate = useNavigate();
  // Checked at click time (not once at render), so browser zoom / Windows display scaling
  // and window resizes can't leave this stuck on the wrong layout.
  const isMobile = () => typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
  const handleBarClick = index => {
    playEnter();
    const mobile = isMobile();
    if (mobile && active === index) {
      setRevealed(prev => !prev);
      return;
    }
    setActive(index);
    if (mobile) {
      setRevealed(false);
    } else {
      setRevealed(true);
    }
  };
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const onKey = e => {
      if (e.key === "ArrowUp" && active > 0) {
        if (revealed) playDeck();else playNav();
        setActive(active - 1);
      }
      if (e.key === "ArrowDown" && active < ABOUTME_ITEMS.length - 1) {
        if (revealed) playDeck();else playNav();
        setActive(active + 1);
      }
      if (e.key === "Enter") {
        playEnter();
        setRevealed(true);
      }
      if (e.key === "ArrowRight") setRevealed(true);
      if (e.key === "ArrowLeft") {
        playBack();
        if (revealed) setRevealed(false);else navigate(-1);
      }
      if (e.key === "Escape" || e.key === "Backspace") {
        playBack();
        // inside a section: just close it. On the section list: go back to the menu.
        if (revealed) setRevealed(false);else navigate(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, navigate, revealed]);
  return <div id="menu-screen">
      <BgVideo src={VIDEO.about} poster={poster_main1} />
      {revealed && <AboutDetail item={ABOUTME_ITEMS[active]} chip={(ABOUTME_ITEMS.slice(0, active + 1).reverse().find(x => x.group) || {}).group || "ABOUT"} />}
      <style>{aboutCss}</style>
      <div className={`pg-title${mounted ? " mounted" : ""}`}>ABOUT ME</div>

      <div className="sc-root" role="navigation">
        {ABOUTME_ITEMS.map((item, i) => <Fragment key={item.id}>
            {item.group && <div className={`sc-group${mounted ? " mounted" : ""}`} style={{
          transitionDelay: `${i * 80}ms`
        }}>
                <span className="sc-group-dot" />
                <span className="sc-group-label">{item.group}</span>
                <span className="sc-group-rule" />
              </div>}
            <div className={`sc-bar-outer${active === i ? " active" : ""}${mounted ? " mounted" : ""}`} style={{
          transitionDelay: `${i * 80}ms`
        }} onClick={() => {
        handleBarClick(i);
      }} onMouseEnter={() => {
        if (active !== i) {
          if (revealed) playDeck();else playNav();
        }
        setActive(i);
      }}>
            <div className="sc-bar-red" />
            <div className="sc-bar">
              <img className="sc-char" src={ABOUTME_CHARS[i % ABOUTME_CHARS.length]} alt="" />
              <div className="sc-bar-fill" />
              <div className="sc-bar-shade" />
              <div className="sc-bar-content">
                <div className="sc-role">{item.role}</div>
                <div className="sc-main">
                  <div className="sc-main-top">
                    <div className="sc-label">{item.label}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </Fragment>)}
      </div>

      <div className={`sc-footer${mounted ? " mounted" : ""}`}>
        <div className="sc-footer-row"><span className="sc-footer-key">↑↓</span><span>SELECT</span></div>
        <div className="sc-footer-row"><span className="sc-footer-key">↵</span><span>REVEAL</span></div>
        <div className="sc-footer-row"><span className="sc-footer-key">ESC</span><span>BACK</span></div>
      </div>

      <div className="sc-mobile-controls" aria-label="About mobile controls">
        <button className="sc-mobile-btn" type="button" onClick={() => {
          playBack();
          if (revealed) setRevealed(false);else navigate(-1);
        }}>
          BACK
        </button>
        <button className="sc-mobile-btn" type="button" onClick={() => {
          if (revealed) playBack();else playEnter();
          setRevealed(prev => !prev);
        }}>
          {revealed ? "HIDE" : "REVEAL"}
        </button>
      </div>
    </div>;
}
// ─────────────────────────────────────────────
// Socials: a horizontal conveyor of icons.
//   The icon in the middle is highlighted and zoomed, the ones next to it fade out.
//   ←/→ (or A/D, LB/RB, the dots, mouse wheel, swipe) slide the conveyor.
//   Click the middle icon (or press Enter) to open it. A ghost copy pops out of it.
//
// To edit: change label / handle / href in SOCIALS_ITEMS.
// The icons below are simple drawn versions. To use a real logo file instead,
// import it at the top of this file and add  image: yourImport  to the item.
// ─────────────────────────────────────────────
const IconDiscord = () => <svg viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M19.6 5.3A17.5 17.5 0 0 0 15.3 4l-.5 1a16 16 0 0 0-5.6 0l-.5-1a17.5 17.5 0 0 0-4.3 1.3C1.7 9.3 1 13.2 1.3 17a17.7 17.7 0 0 0 5.3 2.7l1.1-1.8c-.6-.2-1.2-.5-1.7-.9l.4-.3a12.6 12.6 0 0 0 11.2 0l.4.3c-.5.4-1.1.7-1.7.9l1.1 1.8a17.7 17.7 0 0 0 5.3-2.7c.4-4.4-.7-8.3-3.1-11.7z M8.6 10.3c-1 0-1.8.9-1.8 2.1s.8 2.1 1.8 2.1 1.8-.9 1.8-2.1-.8-2.1-1.8-2.1z M15.4 10.3c-1 0-1.8.9-1.8 2.1s.8 2.1 1.8 2.1 1.8-.9 1.8-2.1-.8-2.1-1.8-2.1z" /></svg>;
const IconInstagram = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" /></svg>;
const IconKofi = () => <svg viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M3 7.5h14.5v6.2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z M10.2 15.6s-3-1.8-3-3.8a1.7 1.7 0 0 1 3-1.1 1.7 1.7 0 0 1 3 1.1c0 2-3 3.8-3 3.8z" /><path d="M17.5 9h1.2a2.7 2.7 0 0 1 0 5.4h-1.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
const IconRoblox = () => <svg viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M7.05 3.43L20.57 7.05L16.95 20.57L3.43 16.95Z M10.59 9.55L14.45 10.59L13.41 14.45L9.55 13.41Z" /></svg>;
const IconSpotify = () => <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="currentColor" /><g fill="none" strokeLinecap="round" style={{ stroke: "var(--cut)" }}><path d="M6.3 9.4c3.8-1.1 8.2-.7 11.6 1.3" strokeWidth="1.9" /><path d="M7 12.7c3.2-.9 6.7-.5 9.5 1.2" strokeWidth="1.6" /><path d="M7.7 15.7c2.6-.7 5.2-.4 7.4 1" strokeWidth="1.3" /></g></svg>;
const IconGithub = () => <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" /></svg>;
const IconSteam = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><circle cx="15.2" cy="9.6" r="3.2" /><circle cx="8.6" cy="15.4" r="2.2" fill="currentColor" /><path d="M10.2 14.1l3.2-2.4" /></svg>;

const SOCIALS_ITEMS = [
  { id: "discord", label: "DISCORD", handle: "@leesys", href: "https://discord.com/users/805105039953362975", Icon: IconDiscord },
  { id: "instagram", label: "INSTAGRAM", handle: "@lillee", href: "https://instagram.com/lee.llsys", Icon: IconInstagram },
  { id: "kofi", label: "KO-FI", handle: "ko-fi.com/leesys", href: "https://ko-fi.com/leesys", Icon: IconKofi },
  { id: "roblox", label: "ROBLOX", handle: "@sxfthazu", href: "https://www.roblox.com/users/164693082/profile", Icon: IconRoblox },
  { id: "spotify", label: "SPOTIFY", handle: "lee_ko", href: "https://open.spotify.com/user/yourid", Icon: IconSpotify },
  { id: "github", label: "GITHUB", handle: "@hachzu", href: "https://github.com/hachzu", Icon: IconGithub },
  { id: "steam", label: "STEAM", handle: "@yourname", href: "https://steamcommunity.com/profiles/76561199114238463/", Icon: IconSteam }
];

// how far each slot is from the middle, how big it is, and how visible
const SO_X = [0, 1.45, 2.45, 3.3];     // distance from the middle, in icon widths
const SO_SCALE = [1.3, 0.85, 0.65, 0.5];
const SO_OPACITY = [1, 0.5, 0.2, 0];
const SO_SLOPE = Math.tan(4 * Math.PI / 180); // must match the band's skewY(-4deg) in socials.css, so the icons ride along the slant
const OPEN_DELAY = 2000; // ms between the click and the link opening, so the ghost animation can play

function SocialIcon({ item }) {
  return item.image ? <img src={item.image} alt="" /> : <item.Icon />;
}

export function Socials() {
  const N = SOCIALS_ITEMS.length;
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [ghosts, setGhosts] = useState([]);
  const [pressed, setPressed] = useState(false);
  const activeRef = useRef(0);
  const ghostId = useRef(0);
  const wheelAt = useRef(0);
  const swipe = useRef(null);
  const swiped = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const openTimer = useRef(null);
  const [opening, setOpening] = useState(false);
  const cancelOpen = () => {
    clearTimeout(openTimer.current);
    openTimer.current = null;
    setOpening(false);
  };
  useEffect(() => () => clearTimeout(openTimer.current), []);

  const go = i => {
    cancelOpen(); // moving to another icon cancels a pending open
    activeRef.current = i;
    setActive(i);
    setGhosts([]);
  };
  const move = dir => {
    playNav();
    go((activeRef.current + dir + N) % N);
  };
  // click / Enter on the middle icon: ghost pop now, the link opens after OPEN_DELAY
  const activate = () => {
    const item = SOCIALS_ITEMS[activeRef.current];
    playLaunch();
    const id = ++ghostId.current;
    setGhosts(g => [...g.slice(-3), id]);
    setPressed(true);
    setTimeout(() => setPressed(false), 160);
    if (openTimer.current) return; // already counting down, extra clicks only pop
    setOpening(true);
    openTimer.current = setTimeout(() => {
      openTimer.current = null;
      setOpening(false);
      const w = window.open(item.href, "_blank");
      if (w) {
        try { w.opener = null; } catch (err) {}
      } else {
        window.location.assign(item.href); // the browser blocked the new tab, so open it here instead
      }
    }, OPEN_DELAY);
  };
  const back = () => {
    cancelOpen();
    playBack();
    navigate(-1);
  };

  useEffect(() => {
    const onKey = e => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") move(-1);
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") move(1);
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault(); // stops a focused button from also firing its own click
        if (!e.repeat) activate();
      } else if (e.key === "Escape" || e.key === "Backspace") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const onWheel = e => {
    const now = Date.now();
    if (now - wheelAt.current < 260) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 8) return;
    wheelAt.current = now;
    move(d > 0 ? 1 : -1);
  };
  const onPointerDown = e => {
    swipe.current = e.clientX;
    swiped.current = false;
  };
  const onPointerUp = e => {
    if (swipe.current === null) return;
    const dx = e.clientX - swipe.current;
    swipe.current = null;
    if (Math.abs(dx) > 50) {
      swiped.current = true;
      move(dx < 0 ? 1 : -1);
    }
  };

  const cur = SOCIALS_ITEMS[active];

  return <div id="menu-screen">
      <BgVideo src={VIDEO.socials} poster={poster_main3} />
      <style>{socialStyles}</style>

      <div className="so-page">
        <div className="so-shade" />
        <div className={`so-band${mounted ? " mounted" : ""}`} />

        <div className={`so-title${mounted ? " mounted" : ""}`}>SOCIALS</div>

        <div className={`so-nav${mounted ? " mounted" : ""}`}>
          <span className="so-lb" onClick={() => move(-1)}>◄ LB</span>
          <div className="so-dots">
            {SOCIALS_ITEMS.map((it, i) => <span key={it.id} className={`so-dot${i === active ? " on" : ""}`} onClick={() => { if (i !== active) { playNav(); go(i); } }} />)}
          </div>
          <span className="so-rb" onClick={() => move(1)}>RB ►</span>
        </div>

        <div className={`so-stage${mounted ? " mounted" : ""}`} onWheel={onWheel} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { swipe.current = null; }}>
          {SOCIALS_ITEMS.map((item, i) => {
            let off = ((i - active) % N + N) % N;
            if (off > N / 2) off -= N;
            const d = Math.min(Math.abs(off), 3);
            const sign = off < 0 ? -1 : 1;
            const isMid = off === 0;
            return <div key={item.id} role="button" aria-label={item.label} className={`so-item${isMid ? " active" : ""}${isMid && pressed ? " pressed" : ""}`} style={{
              transform: `translate(-50%, -50%) translateX(calc(var(--sz) * ${sign * SO_X[d]})) translateY(calc(var(--sz) * ${(-sign * SO_X[d] * SO_SLOPE).toFixed(4)})) scale(${SO_SCALE[d]})`,
              opacity: SO_OPACITY[d],
              zIndex: 10 - d,
              pointerEvents: Math.abs(off) > 2 ? "none" : "auto"
            }} onClick={() => {
              if (swiped.current) return;
              if (isMid) activate();
              else { playNav(); go(i); }
            }}>
                <div className="so-card">
                  <div className="so-icon"><SocialIcon item={item} /></div>
                </div>
                {isMid && ghosts.map(g => <span className="so-ghost" key={g}>
                    <span className="so-ghost-ring" />
                    <span className="so-ghost-card" onAnimationEnd={e => {
                      if (e.animationName === "so-ghost-pop") setGhosts(x => x.filter(y => y !== g));
                    }}>
                      <span className="so-icon"><SocialIcon item={item} /></span>
                    </span>
                  </span>)}
              </div>;
          })}
        </div>

        <div className={`so-info${mounted ? " mounted" : ""}`} key={active}>
          <div className="so-info-name"><span>{cur.label}</span></div>
          <div className="so-info-row">
            <span className="so-info-handle">{cur.handle}</span>
            <span className={`so-info-open${opening ? " going" : ""}`} onClick={activate}>
              {opening ? "OPENING..." : "↵ OPEN"}
              {opening && <span className="so-load" style={{ animationDuration: `${OPEN_DELAY}ms` }} />}
            </span>
          </div>
        </div>
      </div>

      <div className={`sc-footer${mounted ? " mounted" : ""}`}>
        <div className="sc-footer-row"><span className="sc-footer-key">←→</span><span>SELECT</span></div>
        <div className="sc-footer-row"><span className="sc-footer-key">↵</span><span>OPEN</span></div>
        <div className="sc-footer-row"><span className="sc-footer-key">ESC</span><span>BACK</span></div>
      </div>

      <div className="sc-mobile-controls" aria-label="Socials mobile controls">
        <button className="sc-mobile-btn" type="button" onClick={back}>BACK</button>
        <button className="sc-mobile-btn" type="button" onClick={activate}>OPEN</button>
      </div>
    </div>;
}

// ─────────────────────────────────────────────
// Skills: the Persona 3 Reload "Social Stats" Venn diagram, used as a hub for several categories.
//   One colour-coded bubble per category. They spiral in, then pop. The white arrow in the middle
//   points at the selected bubble, and the list on the left shows that category's content.
//   ←/→ (or ↑/↓, A/D, LB / RB, the dots, hover, click) switch category. Esc goes back.
//
// To edit (everything in SKILL_GROUPS is placeholder):
//   Add or remove a whole object to add or remove a bubble. The bubbles lay themselves out in a ring
//   (3 to 6 look best), so you never have to place them by hand.
//   name / tag / icon - the bubble's name, the black label under it, and the small symbol
//   color            - the colour of the bubble AND of that category's list on the left
//   type: "bars"     - skills with a progress bar: items: [{ name, pct }]  (pct = 0 to 100)
//                      the big number in the bubble is the average of the pct values
//   type: "list"     - education, projects, anything else: items: [{ title, sub, tag }]
//                      sub and tag are optional (tag = small coloured chip on the right)
//                      the big number in the bubble is how many items there are
// All styles for this page are in skillsStyles just below (so no extra css file is needed).
// Every class starts with "sk-" (never "ad-", so ad blockers leave them alone).
// ─────────────────────────────────────────────
const SKILL_GROUPS = [
  {
    id: "code", name: "Code", tag: "Logic & Syntax", icon: "✦", color: "#3f9bff", type: "bars",
    items: [
      { name: "Java", pct: 65 },
      { name: "JavaScript", pct: 60 },
      { name: "SQL", pct: 55 },
      { name: "HTML & CSS", pct: 70 }
    ]
  },
  {
    id: "design", name: "Design", tag: "Eye For Detail", icon: "❖", color: "#ff5c93", type: "bars",
    items: [
      { name: "UI / UX", pct: 75 },
      { name: "Figma", pct: 70 },
      { name: "Illustration", pct: 60 },
      { name: "Branding", pct: 40 }
    ]
  },
  {
    id: "tools", name: "Tools", tag: "Daily Drivers", icon: "◆", color: "#2fd6a4", type: "bars",
    items: [
      { name: "VS Code", pct: 80 },
      { name: "Git", pct: 55 },
      { name: "Photoshop", pct: 50 },
      { name: "Notion", pct: 65 }
    ]
  },
  {
    id: "edu", name: "Education", tag: "Always Learning", icon: "★", color: "#ffb830", type: "list",
    items: [
      { title: "University name", sub: "BS Computer Science", tag: "2023 — NOW" },
      { title: "Senior High School", sub: "strand / track", tag: "2021 — 2023" },
      { title: "Online Courses", sub: "CS50, freeCodeCamp, etc.", tag: "ONGOING" }
    ]
  },
  {
    id: "projects", name: "Projects", tag: "Things I Made", icon: "▣", color: "#a674ff", type: "list",
    items: [
      { title: "This Website", sub: "Persona 3 Reload styled portfolio · React", tag: "LIVE" },
      { title: "Project two", sub: "short description", tag: "WIP" },
      { title: "Project three", sub: "short description", tag: "IDEA" }
    ]
  }
];

const skillValue = g => g.type === "bars" ? Math.round(g.items.reduce((s, k) => s + k.pct, 0) / g.items.length) : g.items.length;

// Bubble layout: the bubbles sit on a ring, evenly spaced, starting from the top.
// RING_R is chosen so neighbouring bubbles always overlap by the same amount, whatever the count.
const SK_COUNT = SKILL_GROUPS.length;
const SK_RING_R = SK_COUNT > 1 ? 0.33 / Math.sin(Math.PI / SK_COUNT) : 0; // in bubble diameters
const SK_EXTENT = SK_RING_R + 0.54; // how far the diagram reaches from the middle, in bubble diameters
const SK_NODES = SKILL_GROUPS.map((g, i) => {
  const ang = (-90 + (360 * i) / SK_COUNT) * (Math.PI / 180);
  const ux = Math.cos(ang);
  const uy = Math.sin(ang);
  return {
    dx: ux * SK_RING_R,
    dy: uy * SK_RING_R,
    deg: (ang * 180) / Math.PI,                   // direction the white arrow turns to
    lx: `${(50 + ux * 8).toFixed(1)}%`,           // label sits slightly toward the outside of its bubble
    ly: `${(50 + uy * 8).toFixed(1)}%`,
    spin: 110 + (i % 3) * 20                      // how far it turns while spiralling in (degrees)
  };
});

const skillsStyles = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Montserrat:wght@300;700&display=swap');

/* No dark panel, no lines: the background video is left exactly as it is.
   --E (set inline) is how far the diagram reaches, so the bubbles shrink as you add more of them. */
.sk-page {
  --d: min(calc(26vw / var(--E)), calc(37vh / var(--E)));   /* diameter of one bubble */
  --ease: cubic-bezier(0.22, 0.8, 0.3, 1);
  position: absolute;
  inset: 0;
  z-index: 6;
  overflow: hidden;
  pointer-events: none;
}

/* ───────── title: same look as the main menu buttons, text only ───────── */
.sk-title {
  position: absolute;
  left: 2.6vw;
  top: 7vh;
  font-family: 'Anton', sans-serif;
  font-style: italic;
  font-size: clamp(60px, 9vw, 140px);
  letter-spacing: 2px;
  line-height: 0.85;
  color: #3ce2ff;
  transform: skewY(-4deg);
  transform-origin: left center;
  white-space: nowrap;
  user-select: none;
  animation: sk-drop 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both;
}
@keyframes sk-drop {
  from { opacity: 0; translate: 0 -24px; }
  to   { opacity: 1; translate: 0 0; }
}

/* ───────── ◄ LB  ◆◆◆  RB ►  (copied from the Socials page) ───────── */
.sk-nav {
  position: absolute;
  top: 5vh;
  right: 3vw;
  display: flex;
  align-items: center;
  gap: 16px;
  pointer-events: auto;
  animation: sk-drop 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
}
.sk-lb, .sk-rb {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(30px, 4.2vw, 56px);
  letter-spacing: 3px;
  line-height: 1;
  color: #fff;
  -webkit-text-stroke: 1.5px #000;
  paint-order: stroke fill;
  cursor: pointer;
  user-select: none;
  transition: color 0.15s ease, transform 0.15s ease;
}
.sk-lb:hover, .sk-rb:hover { color: #3ce2ff; transform: scale(1.08) skewX(-6deg); }
.sk-dots { display: flex; gap: 10px; align-items: center; }
.sk-dot {
  width: 14px;
  height: 14px;
  background: rgba(255, 255, 255, 0.35);
  border: 2px solid #000;
  transform: rotate(45deg);
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}
.sk-dot:hover { background: #fff; }
.sk-dot.on { background: #c4001a; transform: rotate(45deg) scale(1.35); }

/* ───────── content list (left). --c = the selected category's colour ───────── */
.sk-list {
  position: absolute;
  left: 2.6vw;
  top: 27vh;
  width: min(33vw, 560px);
  max-height: calc(100vh - 27vh - 90px);
  overflow-y: auto;
  padding-right: 6px;
  pointer-events: auto;
  scrollbar-width: none;
}
.sk-list::-webkit-scrollbar { display: none; }
.sk-list-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  animation: sk-row-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.sk-list-head i { width: 10px; height: 10px; background: var(--c); transform: rotate(45deg); flex-shrink: 0; }
.sk-list-head span {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(18px, 1.6vw, 24px);
  letter-spacing: 5px;
  line-height: 1;
  color: #fff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
}
.sk-list-head b {
  flex: 1;
  height: 3px;
  background: linear-gradient(90deg, var(--c), rgba(255, 255, 255, 0));
  transform: skewX(-30deg);
}

.sk-row {
  position: relative;
  margin-bottom: 8px;
  padding: 7px 24px 9px 14px;
  background: rgba(0, 0, 0, 0.9);
  border-left: 4px solid var(--c);
  clip-path: polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%);
  animation: sk-row-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--n) * 50ms + 60ms);
}
@keyframes sk-row-in {
  0%   { opacity: 0; transform: translateX(-50px); }
  60%  { opacity: 1; transform: translateX(5px); }
  100% { opacity: 1; transform: translateX(0); }
}
.sk-row-top { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.sk-row-name {
  font-family: 'Anton', sans-serif;
  font-size: clamp(18px, 1.55vw, 24px);
  letter-spacing: 1px;
  line-height: 1.1;
  color: #fff;
}
.sk-row-pct {
  font-family: 'Anton', sans-serif;
  font-style: italic;
  font-size: clamp(18px, 1.55vw, 24px);
  letter-spacing: 1px;
  color: var(--c);
  filter: brightness(1.3);
}
.sk-row-pct small { font-size: 0.6em; margin-left: 2px; }
.sk-track {
  height: 9px;
  margin-top: 6px;
  background: rgba(255, 255, 255, 0.18);
  transform: skewX(-20deg);
}
.sk-fill {
  height: 100%;
  width: var(--w);
  background: #fff;
  box-shadow: 3px 0 0 var(--c);
  transform-origin: left center;
  animation: sk-fill 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--n) * 50ms + 180ms);
}
@keyframes sk-fill {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
/* rows of a "list" category (education, projects...) */
.sk-chip {
  flex-shrink: 0;
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(13px, 1.1vw, 17px);
  letter-spacing: 2px;
  line-height: 1;
  color: #04122e;
  background: var(--c);
  padding: 4px 14px 4px 10px;
  clip-path: polygon(0 0, 100% 0, calc(100% - 7px) 100%, 0 100%);
}
.sk-item-sub {
  margin-top: 3px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
  font-size: clamp(12px, 0.95vw, 14px);
  line-height: 1.25;
  color: rgba(255, 255, 255, 0.75);
}

/* ───────── the Venn diagram ───────── */
/* .sk-center is a zero-size anchor in the middle of the diagram.
   isolation keeps the "screen" blend between the circles only, never with the video behind. */
.sk-center {
  position: absolute;
  left: 70vw;
  top: 53vh;
  width: 0;
  height: 0;
  isolation: isolate;
}
.sk-float {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
}

/* SPIRAL ENTRY (fast, one gentle turn). The orbit is a zero-size element at the diagram's centre.
   It starts turned back a little and small, then unwinds to 0 while growing; the bubble sits at a
   fixed offset inside it, so it sweeps in along a short spiral and then eases to a stop.
   To change the speed, change the 1.1s here and in .sk-label (keep the two equal). */
.sk-orbit {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  animation: sk-spiral 1.1s var(--ease) both;
  animation-delay: calc(0.15s + var(--i) * 0.1s);
}
@keyframes sk-spiral {
  0%   { transform: rotate(calc(var(--a) * -1)) scale(0.2); opacity: 0; }
  30%  { opacity: 1; }
  100% { transform: rotate(0deg) scale(1); opacity: 1; }
}
/* the circles are blended with "screen", so where they overlap the colour gets lighter */
.sk-orbit-disc { mix-blend-mode: screen; }

/* fixed offset of each bubble from the centre (set inline with --dx / --dy, in bubble diameters) */
.sk-pos {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  transform: translate(calc(var(--d) * var(--dx)), calc(var(--d) * var(--dy)));
}
.sk-bubble {
  position: absolute;
  left: calc(var(--d) / -2);
  top: calc(var(--d) / -2);
  width: var(--d);
  height: var(--d);
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), filter 0.3s ease;
}
.sk-bubble.active { transform: scale(1.06); filter: brightness(1.15); }

/* every circle is exactly the same size and perfectly round */
.sk-disc {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--c);
  opacity: 0.9;
  pointer-events: auto;
  cursor: pointer;
  /* SMOOTH POP: right as the spiral lands, the bubble swells a little and settles */
  animation: sk-pop 0.6s ease-in-out both;
  animation-delay: calc(0.15s + var(--i) * 0.1s + 0.85s);
}
/* thin outer ring: same centre, same width all the way round */
.sk-disc::after {
  content: "";
  position: absolute;
  inset: -4%;
  border-radius: 50%;
  border: 2px solid var(--c);
  opacity: 0.6;
  transition: border-color 0.3s ease, opacity 0.3s ease;
}
.sk-bubble.active .sk-disc::after { border-color: #fff; opacity: 0.95; }
@keyframes sk-pop {
  0%   { transform: scale(1); }
  45%  { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* labels live in their own orbit (same spiral), so they are NOT blended and stay crisp */
.sk-label-pos {
  position: absolute;
  left: var(--lx);
  top: var(--ly);
  width: 0;
  height: 0;
}
/* the label counter-rotates the spiral (start angle = spiral angle, same duration and easing),
   so the text always reads at its final tilt and never ends up upside down */
.sk-label {
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(-50%, -50%) rotate(-14deg);
  animation: sk-counter 1.1s var(--ease) both;
  animation-delay: calc(0.15s + var(--i) * 0.1s);
  white-space: nowrap;
  text-align: left;
}
@keyframes sk-counter {
  from { transform: translate(-50%, -50%) rotate(calc(var(--a) - 14deg)); }
  to   { transform: translate(-50%, -50%) rotate(-14deg); }
}
.sk-label-pop {
  animation: sk-pop 0.6s ease-in-out both;
  animation-delay: calc(0.15s + var(--i) * 0.1s + 0.85s);
}
.sk-max {
  display: block;
  margin: 0 0 calc(var(--d) * -0.02) calc(var(--d) * 0.2);
  font-family: 'Bebas Neue', sans-serif;
  font-size: calc(var(--d) * 0.045);
  letter-spacing: calc(var(--d) * 0.03);
  color: #fff;
}
.sk-line { display: flex; align-items: center; gap: calc(var(--d) * 0.03); }
.sk-num {
  font-family: 'Anton', sans-serif;
  font-style: italic;
  font-size: calc(var(--d) * 0.24);
  line-height: 1;
  color: #fff;
  min-width: 0.7em;
}
.sk-num small { font-size: 0.4em; margin-left: 2px; }
.sk-name {
  font-family: 'Anton', sans-serif;
  font-style: italic;
  font-size: calc(var(--d) * 0.12);
  line-height: 1;
  letter-spacing: 1px;
  color: #fff;
}
.sk-sub {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--d) * 0.03);
  margin-top: calc(var(--d) * 0.03);
  padding: calc(var(--d) * 0.012) calc(var(--d) * 0.07) calc(var(--d) * 0.012) calc(var(--d) * 0.03);
  background: #000;
  clip-path: polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12);
}
.sk-sub i {
  font-style: normal;
  font-size: calc(var(--d) * 0.065);
  line-height: 1;
  color: var(--c);
  filter: brightness(1.4);
}
.sk-sub span {
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
  font-size: calc(var(--d) * 0.052);
  letter-spacing: 0.5px;
  color: #fff;
}

/* white arrow in the middle, turns to point at the selected bubble */
.sk-tri {
  position: absolute;
  left: calc(var(--d) * -0.16);
  top: calc(var(--d) * -0.14);
  width: calc(var(--d) * 0.3);
  height: calc(var(--d) * 0.28);
  transition: transform 0.5s cubic-bezier(0.34, 1.3, 0.5, 1);
  z-index: 5;
  filter: drop-shadow(0 0 14px rgba(255, 255, 255, 0.45));
}
.sk-tri-in {
  width: 100%;
  height: 100%;
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.97) 0%, rgba(190, 240, 255, 0.4) 100%);
  clip-path: polygon(0 0, 100% 50%, 0 100%);
  animation: sk-tri-in 0.5s cubic-bezier(0.34, 1.4, 0.5, 1) 0.9s both;
}
@keyframes sk-tri-in {
  from { transform: scale(0) rotate(-90deg); opacity: 0; }
  to   { transform: scale(1) rotate(0deg);   opacity: 1; }
}

/* ───────── hints ───────── */
.sk-hint {
  position: fixed;
  bottom: 22px;
  right: 28px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  font-family: 'Anton', sans-serif;
  z-index: 14;
  animation: sk-drop 0.4s ease 0.4s both;
}
.sk-hint-row {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  letter-spacing: 2.5px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.5);
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
}
.sk-hint-key {
  box-sizing: border-box;
  width: 46px;
  padding: 4px 0 3px;
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.25);
  font-size: 18px;
  letter-spacing: 0;
  text-align: center;
}
.sk-mobile-controls { display: none; }
.sk-mobile-btn {
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(0, 0, 0, 0.62);
  color: #fff;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 1.2px;
  font-size: 13px;
  padding: 7px 12px;
  border-radius: 8px;
  min-width: 84px;
}

/* ───────── small screens: bubbles on top, list underneath ───────── */
@media (max-width: 1024px) {
  .sk-page { --d: min(calc(42vw / var(--E)), calc(21vh / var(--E))); }
  .sk-title { top: 2vh; left: 4vw; font-size: clamp(44px, 12vw, 72px); }
  .sk-nav { top: 10.5vh; left: 0; right: 0; justify-content: center; gap: 8px; }
  .sk-lb, .sk-rb { font-size: 26px; }
  .sk-dots { gap: 6px; }
  .sk-dot { width: 9px; height: 9px; }
  .sk-center { left: 50vw; top: 38vh; }
  .sk-list { left: 4vw; top: auto; bottom: 66px; width: 92vw; max-height: 36vh; }
  .sk-list-head { margin-bottom: 6px; }
  .sk-row { margin-bottom: 5px; padding: 5px 20px 6px 12px; }
  .sk-hint { display: none; }
  .sk-mobile-controls {
    position: fixed;
    left: 8px;
    right: 8px;
    bottom: max(8px, env(safe-area-inset-bottom));
    z-index: 60;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    pointer-events: all;
  }
}
`;

// counts up from 0 once the spiral has landed
function CountUp({ to, delay }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf;
    let t0;
    const start = setTimeout(() => {
      const tick = ts => {
        if (!t0) t0 = ts;
        const p = Math.min(1, (ts - t0) / 800);
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(start);
      cancelAnimationFrame(raf);
    };
  }, [to, delay]);
  return v;
}

export function SkillsPage() {
  const N = SKILL_GROUPS.length;
  const [active, setActive] = useState(0);
  const [ang, setAng] = useState(SK_NODES[0].deg);
  const angRef = useRef(SK_NODES[0].deg);
  const navigate = useNavigate();

  // turn the arrow the short way round
  useEffect(() => {
    const d = ((((SK_NODES[active].deg - angRef.current) % 360) + 540) % 360) - 180;
    angRef.current += d;
    setAng(angRef.current);
  }, [active]);

  const select = i => {
    if (i === active) return;
    playNav();
    setActive(i);
  };
  const step = dir => {
    playNav();
    setActive(a => (a + dir + N) % N);
  };
  const back = () => {
    playBack();
    navigate(-1);
  };

  useEffect(() => {
    const onKey = e => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "d" || e.key === "D") step(1);
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "a" || e.key === "A") step(-1);
      else if (e.key === "Escape" || e.key === "Backspace") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const cur = SKILL_GROUPS[active];

  // shared inline vars for one bubble's orbit / position
  const orbitVars = (nd, i) => ({ "--i": i, "--a": `${nd.spin}deg` });
  const posVars = nd => ({ "--dx": nd.dx, "--dy": nd.dy });

  return <div id="menu-screen">
      <BgVideo src={VIDEO.skills} poster={poster_main2} />
      <style>{skillsStyles}</style>

      <div className="sk-page" style={{ "--E": SK_EXTENT }}>
        <div className="sk-title">SKILLS</div>

        <div className="sk-nav">
          <span className="sk-lb" onClick={() => step(-1)}>◄ LB</span>
          <div className="sk-dots">
            {SKILL_GROUPS.map((g, i) => <span key={g.id} className={`sk-dot${i === active ? " on" : ""}`} onClick={() => select(i)} />)}
          </div>
          <span className="sk-rb" onClick={() => step(1)}>RB ►</span>
        </div>

        {/* content of the selected category, tinted with its colour */}
        <div className="sk-list" key={cur.id} style={{ "--c": cur.color }}>
          <div className="sk-list-head"><i /><span>{cur.name.toUpperCase()}</span><b /></div>
          {cur.type === "bars" && cur.items.map((s, n) => <div className="sk-row" style={{ "--n": n }} key={s.name}>
              <div className="sk-row-top">
                <span className="sk-row-name">{s.name}</span>
                <span className="sk-row-pct">{s.pct}<small>%</small></span>
              </div>
              <div className="sk-track"><div className="sk-fill" style={{ "--w": `${s.pct}%` }} /></div>
            </div>)}
          {cur.type === "list" && cur.items.map((it, n) => <div className="sk-row" style={{ "--n": n }} key={it.title}>
              <div className="sk-row-top">
                <span className="sk-row-name">{it.title}</span>
                {it.tag && <span className="sk-chip">{it.tag}</span>}
              </div>
              {it.sub && <div className="sk-item-sub">{it.sub}</div>}
            </div>)}
        </div>

        {/* the Venn diagram */}
        <div className="sk-center">
          <div className="sk-float">

            {/* layer 1: the blended circles */}
            {SKILL_GROUPS.map((g, i) => <div className="sk-orbit sk-orbit-disc" style={orbitVars(SK_NODES[i], i)} key={g.id}>
                <div className="sk-pos" style={posVars(SK_NODES[i])}>
                  <div className={`sk-bubble${active === i ? " active" : ""}`}>
                    <div className="sk-disc" style={{ "--c": g.color, "--i": i }} onMouseEnter={() => select(i)} onClick={() => { playEnter(); setActive(i); }} />
                  </div>
                </div>
              </div>)}

            {/* the arrow */}
            <div className="sk-tri" style={{ transform: `rotate(${ang}deg)` }}>
              <div className="sk-tri-in" />
            </div>

            {/* layer 2: the labels (not blended, so the black bars stay black) */}
            {SKILL_GROUPS.map((g, i) => {
              const nd = SK_NODES[i];
              const v = skillValue(g);
              return <div className="sk-orbit" style={{ ...orbitVars(nd, i), pointerEvents: "none" }} key={g.id}>
                <div className="sk-pos" style={posVars(nd)}>
                  <div className={`sk-bubble${active === i ? " active" : ""}`} style={{ pointerEvents: "none", filter: "none" }}>
                    <div className="sk-label-pos" style={{ "--lx": nd.lx, "--ly": nd.ly }}>
                      <div className="sk-label" style={{ "--a": `${nd.spin}deg`, "--i": i, "--c": g.color }}>
                        <div className="sk-label-pop" style={{ "--i": i }}>
                          {g.type === "bars" && v >= 90 && <span className="sk-max">M A X</span>}
                          <div className="sk-line">
                            <span className="sk-num"><CountUp to={v} delay={150 + i * 100 + 700} />{g.type === "bars" && <small>%</small>}</span>
                            <span className="sk-name">{g.name}</span>
                          </div>
                          <div className="sk-sub"><i>{g.icon}</i><span>{g.tag}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>;
            })}
          </div>
        </div>
      </div>

      <div className="sk-hint">
        <div className="sk-hint-row"><span className="sk-hint-key">←→</span><span>SELECT</span></div>
        <div className="sk-hint-row"><span className="sk-hint-key">ESC</span><span>BACK</span></div>
      </div>

      <div className="sk-mobile-controls" aria-label="Skills mobile controls">
        <button className="sk-mobile-btn" type="button" onClick={back}>BACK</button>
        <button className="sk-mobile-btn" type="button" onClick={() => step(1)}>NEXT</button>
      </div>
    </div>;
}

// ─────────────────────────────────────────────
// Splash: entry page with a "READ BEFORE YOU PROCEED" notice (left),
// a divider, and the CONTINUE button + loading bar (right).
// The click is what lets the browser play sound.
// ─────────────────────────────────────────────

// Edit the bullets here. One string = one bullet.
// <mark className="sp-hl"> = the one emphasis style (cyan slab). Keep it to a few key phrases.
const SPLASH_NOTICES = [
  <>Coded on a <mark className="sp-hl">1920 x 1080</mark> screen, so resolutions might come off weird!</>,
  <>Recommended to be viewed on a <mark className="sp-hl">PC</mark>, as I have not catered too much around mobile viewing.</>,
  <>Music will <mark className="sp-hl">auto-play</mark> once you enter!</>,
  <>If any error occurs, try doing a <mark className="sp-hl">hard refresh (CTRL + SHIFT + R)</mark>.</>,
  <>This website will always be a work in progress. Coded with HTML, CSS and JavaScript (React).</>,
  <>This is a personal biographical website made entirely by me, centered around <mark className="sp-hl">Persona 3: Reload's Menu UI</mark>. It may seem inaccurate, but I tried my best to replicate it!</>,
  <>All assets belong to <a className="sp-link" href="https://atlus.com" target="_blank" rel="noopener noreferrer">ATLUS</a> and <a className="sp-link" href="https://en.wikipedia.org/wiki/P-Studio" target="_blank" rel="noopener noreferrer">P-Studio</a>.</>
];

// Styles for the notice layout. Injected with a <style> tag (same approach as about.css / socials.css),
// so styles.css doesn't need to change. It loads after styles.css, so it overrides the old
// CONTINUE-only placement of .sp-load.
const splashStyles = `
.sp-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(20px, 3.5vw, 56px);
  width: min(1240px, 92vw);
}

.sp-notice {
  flex: 1 1 58%;
  min-width: 0;
  background: rgba(5, 9, 28, 0.94);
  border-top: 6px solid #3ce2ff;
  clip-path: polygon(0 0, 100% 0, calc(100% - 24px) 100%, 0 100%);
  box-shadow: inset 0 0 0 1px rgba(60, 226, 255, 0.14);
  padding-bottom: 20px;
  opacity: 0;
  transform: translateX(-60px);
  transition: opacity 0.45s ease 0.15s, transform 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.15s;
}
.sp-root.mounted .sp-notice { opacity: 1; transform: translateX(0); }
.sp-root.leaving .sp-notice { opacity: 0; transform: translateX(-60px); transition-delay: 0s; }

.sp-notice-head {
  background: #000;
  margin-top: 8px;
  padding: 10px 40px 10px 28px;
  clip-path: polygon(0 0, 100% 0, calc(100% - 20px) 100%, 0 100%);
}
.sp-notice-head span {
  display: block;
  font-family: 'Anton', sans-serif;
  font-style: italic;
  font-size: clamp(22px, 3vw, 38px);
  letter-spacing: 2px;
  line-height: 1.05;
  color: #3ce2ff;
}

.sp-notice-list { list-style: none; padding: 18px 34px 0 28px; }
.sp-notice-list li {
  position: relative;
  padding: 7px 0 7px 26px;
  font-family: 'Montserrat', 'Barlow Condensed', sans-serif;
  font-weight: 300;
  font-size: clamp(13px, 1.25vw, 17px);
  line-height: 1.4;
  letter-spacing: 0.3px;
  color: rgba(255, 255, 255, 0.9);
  opacity: 0;
  transform: translateX(-24px);
  transition: opacity 0.35s ease, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.sp-root.mounted .sp-notice-list li { opacity: 1; transform: translateX(0); }
.sp-notice-list li i {
  position: absolute;
  left: 4px;
  top: 14px;
  width: 9px;
  height: 9px;
  background: #c4001a;
  transform: rotate(45deg);
}

/* emphasis inside the bullets */
/* emphasis inside the bullets */
.sp-notice-list .sp-hl {
  background: #8df6ff;
  color: #04122e;
  font-weight: 700;
  padding: 0 6px;
  margin: 0 1px;
  clip-path: polygon(0 0, 100% 0, calc(100% - 5px) 100%, 0 100%);
}
.sp-notice-list .sp-link {
  color: #ff2a2a;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 4px;
  transition: color 0.15s ease;
}
.sp-notice-list .sp-link:hover { color: #fff; }

.sp-notice-foot {
  margin: 12px 34px 0 28px;
  padding-top: 12px;
  border-top: 2px solid rgba(60, 226, 255, 0.35);
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(16px, 1.7vw, 22px);
  letter-spacing: 3px;
  color: #8df6ff;
}
.sp-notice-foot b { color: #fff; font-weight: 400; text-shadow: 3px 3px 0 #c4001a; }

.sp-divider {
  flex: 0 0 6px;
  align-self: stretch;
  position: relative;
  background: linear-gradient(180deg, rgba(255,255,255,0), #fff 18%, #fff 82%, rgba(255,255,255,0));
  transform: skewX(-12deg) scaleY(0);
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.25s;
  box-shadow: 4px 0 0 #c4001a;
}
.sp-root.mounted .sp-divider { transform: skewX(-12deg) scaleY(1); }

.sp-right {
  flex: 1 1 36%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
}
.sp-right .sp-btn { padding: 24px clamp(20px, 3vw, 48px); transform: translateX(40px); }
.sp-root.mounted .sp-right .sp-btn { transform: translateX(0); }
.sp-right .sp-label { font-size: clamp(36px, 5.2vw, 76px); }
.sp-right .sp-label-bright { left: clamp(20px, 3vw, 48px); }
.sp-right .sp-load {
  position: static;
  transform: none;
  width: min(300px, 100%);
}

@media (max-width: 768px) {
  .sp-root { overflow-y: auto; align-items: flex-start; }
  .sp-wrap { flex-direction: column; width: 94vw; gap: 16px; padding: 18px 0 28px; }
  .sp-notice { flex: none; width: 100%; }
  .sp-divider { flex: 0 0 5px; align-self: center; width: 70%; height: 5px; transform: skewX(-12deg) scaleX(0); background: linear-gradient(90deg, rgba(255,255,255,0), #fff 18%, #fff 82%, rgba(255,255,255,0)); }
  .sp-root.mounted .sp-divider { transform: skewX(-12deg) scaleX(1); }
  .sp-right { flex: none; width: 100%; }
}
`;

export function Splash({ onContinue, onStartAudio, playerReady }) {
  const [leaving, setLeaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [assetsReady, setAssetsReady] = useState(false);
  const startedRef = useRef(false);
  const ready = assetsReady && playerReady;

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(t);
  }, []);

  // load everything important while the visitor looks at this screen
  useEffect(() => {
    let alive = true;
    const finish = () => {
      if (!alive) return;
      setAssetsReady(true);
    };
    const cap = setTimeout(finish, PRELOAD_TIMEOUT_MS); // never make anyone wait forever
    preloadEssentials(p => {
      if (alive) setProgress(p);
    }).then(() => {
      clearTimeout(cap);
      if (alive) setProgress(100);
      finish();
    });
    return () => {
      alive = false;
      clearTimeout(cap);
    };
  }, []);

  const proceed = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    playEnter();
    setLeaving(true);
    setTimeout(onContinue, 250); // the menu's own page transition plays right after
  };

  const go = () => {
    if (startedRef.current || !ready) return;
    const unlocked = resumeAudio(); // this click is what lets the browser play sound
    if (onStartAudio) onStartAudio();
    unlocked.then(proceed);
  };

  useEffect(() => {
    const onKey = e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ready]);

  return <div className={`sp-root${mounted ? " mounted" : ""}${leaving ? " leaving" : ""}`}>
      <style>{splashStyles}</style>
      <div className="sp-wrap">
        <section className="sp-notice" aria-label="Read before you proceed">
          <div className="sp-notice-head"><span>WELCOME! READ BEFORE YOU PROCEED</span></div>
          <ul className="sp-notice-list">
            {SPLASH_NOTICES.map((t, i) => <li key={i} style={{ transitionDelay: `${0.35 + i * 0.09}s` }}><i />{t}</li>)}
          </ul>
          <p className="sp-notice-foot">If you're okay with these, you may "<b>CONTINUE</b>"</p>
        </section>

        <div className="sp-divider" aria-hidden="true" />

        <div className="sp-right">
          <button className="sp-btn" type="button" onClick={go} disabled={!ready}>
            <span className="sp-shadow" />
            <span className="sp-highlight" />
            <span className="sp-label sp-label-dark">CONTINUE</span>
            <span className="sp-label sp-label-bright">CONTINUE</span>
          </button>
          <div className={`sp-load${ready ? " done" : ""}`} aria-hidden="true">
            <div className="sp-load-track"><div className="sp-load-fill" style={{ width: `${progress}%` }} /></div>
            <div className="sp-load-text">{ready ? "READY" : `LOADING ${progress}%`}</div>
          </div>
        </div>
      </div>
      <div className="sp-hint"><span className="sp-hint-key">↵</span><span>CONTINUE</span></div>
    </div>;
}



// ─────────────────────────────────────────────
// WebDeck: a small draggable music deck.
// Spawns at bottom center. The video stays hidden until you expand it.
// Add more songs by adding YouTube video ids to TRACKS
// (the id is the part after youtu.be/ or after ?v=).
// ─────────────────────────────────────────────
// The first track always plays first on start, even with shuffle on.
const TRACKS = [
  { id: "j9Sn1nFGQQ8" }, // Color Your Night
  { id: "2KuWjZD6PBA" },
  { id: "IYCPzZtDj98" },
  { id: "M7VSEZOQIlg" },
  { id: "nOj_A3aZxGs" }
];

let ytPromise;
function loadYT() {
  if (ytPromise) return ytPromise;
  ytPromise = new Promise(resolve => {
    if (window.YT && window.YT.Player) return resolve(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev();
      resolve(window.YT);
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  });
  return ytPromise;
}

const fmt = s => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

export function WebDeck({ onPlayerReady }) {
  const [open, setOpen] = useState(false);
  const [below, setBelow] = useState(false); // panel opens under the bar when deck is near the top
  const [playing, setPlaying] = useState(false);
  const [title, setTitle] = useState("");
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [idx, setIdx] = useState(0);
  const [pos, setPos] = useState(null); // null = default bottom-center spawn
  const [mounted, setMounted] = useState(false);

  const deckRef = useRef(null);
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const idxRef = useRef(0);
  const drag = useRef(null);
  const shuffleRef = useRef(false);
  const historyRef = useRef([]);
  const [shuffle, setShuffle] = useState(false);
  const [vol, setVol] = useState(() => {
    try {
      const v = parseInt(localStorage.getItem("wd-vol"), 10);
      return isNaN(v) ? 70 : Math.min(100, Math.max(0, v));
    } catch (err) {
      return 70;
    }
  });
  const [muted, setMuted] = useState(false);
  const volRef = useRef(vol);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // ── YouTube player ──
  useEffect(() => {
    let cancelled = false;
    let player;
    loadYT().then(YT => {
      if (cancelled || !hostRef.current) return;
      const el = document.createElement("div");
      hostRef.current.appendChild(el);
      player = new YT.Player(el, {
        width: "100%",
        height: "100%",
        videoId: TRACKS[0].id,
        playerVars: { controls: 0, modestbranding: 1, rel: 0, playsinline: 1, disablekb: 1, iv_load_policy: 3 },
        events: {
          onReady: e => {
            playerRef.current = e.target;
            const t = e.target.getVideoData && e.target.getVideoData().title;
            if (t) setTitle(t);

            e.target.setVolume(volRef.current);
            if (onPlayerReady) onPlayerReady(e.target);
          },
          onAutoplayBlocked: () => setPlaying(false),
          onStateChange: e => {
            if (e.data === 1) setPlaying(true);
            if (e.data === 2) setPlaying(false);
            if (e.data === 0) {
              setPlaying(false);
              skipNext();
            }
            const t = e.target.getVideoData && e.target.getVideoData().title;
            if (t) setTitle(t);
          }
        }
      });
    });
    return () => {
      cancelled = true;
      try {
        player && player.destroy();
      } catch (err) {}
      playerRef.current = null;
      if (hostRef.current) hostRef.current.innerHTML = "";
    };
  }, []);

  // progress polling
  useEffect(() => {
    const t = setInterval(() => {
      const p = playerRef.current;
      if (!p || !p.getCurrentTime) return;
      setCur(p.getCurrentTime() || 0);
      setDur(p.getDuration() || 0);
    }, 400);
    return () => clearInterval(t);
  }, []);

  const go = n => {
    const p = playerRef.current;
    if (!p) return;
    const next = (n + TRACKS.length) % TRACKS.length;
    idxRef.current = next;
    setIdx(next);
    setCur(0);
    p.loadVideoById(TRACKS[next].id);
  };

  // next / previous, with shuffle support
  const skipNext = () => {
    const cur = idxRef.current;
    let n = (cur + 1) % TRACKS.length;
    if (shuffleRef.current && TRACKS.length > 1) {
      do {
        n = Math.floor(Math.random() * TRACKS.length);
      } while (n === cur);
    }
    historyRef.current.push(cur);
    go(n);
  };
  const skipPrev = () => {
    const p = playerRef.current;
    if (p && p.getCurrentTime && p.getCurrentTime() > 3) return go(idxRef.current); // restart song
    if (shuffleRef.current && historyRef.current.length) return go(historyRef.current.pop());
    go(idxRef.current - 1);
  };
  const toggleShuffle = () => {
    shuffleRef.current = !shuffleRef.current;
    setShuffle(shuffleRef.current);
    playNav();
  };

  // volume: drag on the bar to set it, click VOL to mute
  const applyVol = e => {
    const r = e.currentTarget.getBoundingClientRect();
    const v = Math.round(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * 100);
    volRef.current = v;
    setVol(v);
    try { localStorage.setItem("wd-vol", String(v)); } catch (err) {}
    const p = playerRef.current;
    if (!p) return;
    p.setVolume(v);
    if (v > 0 && p.isMuted()) {
      p.unMute();
      setMuted(false);
    }
  };
  const onVolDown = e => {
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.dataset.drag = "1";
    applyVol(e);
  };
  const onVolMove = e => {
    if (e.currentTarget.dataset.drag) applyVol(e);
  };
  const onVolUp = e => {
    delete e.currentTarget.dataset.drag;
  };
  const toggleMute = () => {
    const p = playerRef.current;
    if (!p) return;
    playNav();
    if (p.isMuted()) {
      p.unMute();
      setMuted(false);
    } else {
      p.mute();
      setMuted(true);
    }
  };

  const toggle = () => {
    const p = playerRef.current;
    if (!p) return;
    playEnter();
    if (playing) p.pauseVideo();
    else p.playVideo();
  };

  const toggleOpen = () => {
    const r = deckRef.current.getBoundingClientRect();
    setBelow(r.top < window.innerHeight * 0.45);
    if (open) playBack();
    else playEnter();
    setOpen(!open);
  };

  const seek = e => {
    const p = playerRef.current;
    if (!p || !dur) return;
    const r = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    p.seekTo(ratio * dur, true);
    setCur(ratio * dur);
  };

  // ── dragging (grab the bar anywhere that isn't a button) ──
  const onDown = e => {
    if (e.target.closest("button")) return;
    const r = deckRef.current.getBoundingClientRect();
    drag.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    e.currentTarget.setPointerCapture(e.pointerId);
    setPos({ left: r.left, top: r.top });
  };
  const onMove = e => {
    if (!drag.current) return;
    const w = deckRef.current.offsetWidth;
    const left = Math.min(window.innerWidth - w, Math.max(0, e.clientX - drag.current.dx));
    const top = Math.min(window.innerHeight - 56, Math.max(0, e.clientY - drag.current.dy));
    setPos({ left, top });
  };
  const onUp = () => {
    drag.current = null;
  };

  const label = title ? title.toUpperCase() : "LOADING...";
  const pct = dur ? (cur / dur) * 100 : 0;
  const style = pos ? { left: pos.left, top: pos.top, bottom: "auto", transform: "none" } : undefined;

  return <div ref={deckRef} className={`wd${mounted ? " mounted" : ""}${playing ? " playing" : ""}${open ? " open" : ""}${below ? " below" : ""}${drag.current ? " dragging" : ""}`} style={style}>
      <div className="wd-panel">
        <div className="wd-video">
          <div className="wd-host" ref={hostRef} />
          <div className="wd-video-hit" onClick={toggle} />
        </div>
        <div className="wd-strip">
          <button className="wd-mini" type="button" onClick={() => { playNav(); skipPrev(); }}>◄◄</button>
          <span className="wd-time">{fmt(cur)}</span>
          <div className="wd-seek" onClick={seek}>
            <div className="wd-seek-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="wd-time">{fmt(dur)}</span>
          <button className="wd-mini" type="button" onClick={() => { playNav(); skipNext(); }}>►►</button>
          <button className={`wd-mini wd-shuf${shuffle ? " on" : ""}`} type="button" onClick={toggleShuffle} aria-pressed={shuffle}>SHUFFLE</button>
        </div>
        <div className="wd-strip wd-vol-row">
          <button className="wd-mini wd-vol-btn" type="button" onClick={toggleMute}>{muted || vol === 0 ? "MUTED" : "VOL"}</button>
          <div className="wd-seek wd-vol" onPointerDown={onVolDown} onPointerMove={onVolMove} onPointerUp={onVolUp} onPointerCancel={onVolUp}>
            <div className="wd-seek-fill" style={{ width: `${muted ? 0 : vol}%` }} />
          </div>
          <span className="wd-time">{muted ? 0 : vol}</span>
        </div>
      </div>

      <div className="wd-bar-outer">
        <div className="wd-red" />
        <div className="wd-bar" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <div className="wd-fill" />
          <div className="wd-content">
            <button className="wd-play" type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
              {playing ? <span className="wd-pause-icon"><i /><i /></span> : <span className="wd-play-icon" />}
            </button>
            <div className="wd-marquee">
              <div className="wd-marquee-track" style={{ animationDuration: `${Math.max(12, label.length * 0.45)}s` }}>
                {Array.from({ length: 6 }).map((_, i) => <span key={i}>{label}<b>◆</b></span>)}
              </div>
            </div>
            <div className="wd-eq" aria-hidden="true"><i /><i /><i /><i /></div>
            <button className="wd-toggle" type="button" onClick={toggleOpen} aria-label={open ? "Minimize" : "Expand"}>▲</button>
          </div>
          <div className="wd-progress" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>;
}