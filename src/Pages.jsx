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
// Characters repeat in order if there are more buttons than images.
const ABOUTME_ITEMS = [{
  id: "profile",
  label: "PROFILE",
  role: "LEADER",
  sections: [{
    title: "INTRODUCTION",
    type: "text",
    paragraphs: ["hi, i'm moneybagg. write your introduction here.", "add as many paragraphs as you like, each string is its own paragraph."]
  }, {
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

// The card that shows on the right side of the About page.
function AboutDetail({ item, index, chip }) {
  let n = 0; // counts rows so they pop in one after another
  const delay = () => ({ animationDelay: `${120 + n++ * 55}ms` });
  return <aside className="ad-panel">
      <div className="ad-shell" key={item.id}>
        <div className="ad-head">
          <span className="ad-index">{String(index + 1).padStart(2, "0")}</span>
          <span className="ad-title">{item.label}</span>
          <span className="ad-chip">{chip}</span>
        </div>
        <div className="ad-body">
          {item.sections.map(sec => <section className="ad-sec" key={sec.title}>
              <div className="ad-sec-title"><i />{sec.title}<b /></div>
              {sec.type === "rows" && sec.rows.map(([k, v]) => <div className="ad-row" style={delay()} key={k}>
                  <span className="ad-k">{k}</span>
                  <span className="ad-v">{v}</span>
                </div>)}
              {sec.type === "text" && sec.paragraphs.map((t, k) => <p className="ad-text" style={delay()} key={k}>{t}</p>)}
              {sec.type === "tags" && <div className="ad-tags">
                  {sec.tags.map(t => <span className="ad-tag" style={delay()} key={t}>{t}</span>)}
                </div>}
              {sec.type === "list" && sec.items.map((it, k) => <div className="ad-item" style={delay()} key={k}>
                  <div className="ad-icon-wrap">
                    <div className="ad-icon">
                      {typeof it.icon === "string" && it.icon.length > 3 ? <img src={it.icon} alt="" /> : it.icon}
                    </div>
                  </div>
                  <div className="ad-item-text">
                    <div className="ad-name">{it.name}</div>
                    {it.detail && <div className="ad-detail">{it.detail}</div>}
                  </div>
                  {it.credit && <span className={`ad-credit${it.mine ? " mine" : ""}`}>{it.credit}</span>}
                </div>)}
            </section>)}
        </div>
      </div>
    </aside>;
}

export function AboutMe() {
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const navigate = useNavigate();
  const isMobileViewport = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
  const handleBarClick = index => {
    playEnter();
    if (isMobileViewport && active === index) {
      setRevealed(prev => !prev);
      return;
    }
    setActive(index);
    if (isMobileViewport) {
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
      {revealed && <AboutDetail item={ABOUTME_ITEMS[active]} index={active} chip={(ABOUTME_ITEMS.slice(0, active + 1).reverse().find(x => x.group) || {}).group || "ABOUT"} />}
      <style>{aboutStyles}</style>
      <div className={`pg-title${mounted ? " mounted" : ""}`}>ABOUT ME</div>

      <div className="sc-root" role="navigation">
        {ABOUTME_ITEMS.map((item, i) => <Fragment key={item.id}>
            {item.group && <div className={`sc-divider${mounted ? " mounted" : ""}`} style={{
          transitionDelay: `${i * 80}ms`
        }}>
                <span className="sc-divider-dot" />
                <span className="sc-divider-label">{item.group}</span>
                <span className="sc-divider-line" />
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
  { id: "discord", label: "DISCORD", handle: "@yourname", href: "https://discord.com/users/yourid", Icon: IconDiscord },
  { id: "instagram", label: "INSTAGRAM", handle: "@yourhandle", href: "https://instagram.com/yourhandle", Icon: IconInstagram },
  { id: "kofi", label: "KO-FI", handle: "ko-fi.com/yourname", href: "https://ko-fi.com/yourname", Icon: IconKofi },
  { id: "roblox", label: "ROBLOX", handle: "@yourname", href: "https://www.roblox.com/users/yourid/profile", Icon: IconRoblox },
  { id: "spotify", label: "SPOTIFY", handle: "your profile", href: "https://open.spotify.com/user/yourid", Icon: IconSpotify },
  { id: "github", label: "GITHUB", handle: "@yourname", href: "https://github.com/yourname", Icon: IconGithub },
  { id: "steam", label: "STEAM", handle: "@yourname", href: "https://steamcommunity.com/id/yourname", Icon: IconSteam }
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
// Splash: blank entry page with a CONTINUE button (the click unlocks sound)
// ─────────────────────────────────────────────

// Blank entry page with one CONTINUE button.
// The click is what lets the browser play sound, so the music deck
// and the menu sounds can start right after it.
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
