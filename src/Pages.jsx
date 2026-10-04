import { useState, useEffect, useRef, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import asset_char1_png from "./assets/char1.png";
import asset_char2_png from "./assets/char2.png";
import asset_char3_png from "./assets/char3.png";
import asset_main1_mp4 from "./assets/main1.mp4";
import asset_icon1_png from "./assets/icon1.png";
import asset_icon2_png from "./assets/icon2.png";
import asset_icon3_png from "./assets/icon3.png";
import asset_main3_mp4 from "./assets/main3.mp4";
import asset_newsign_png from "./assets/newsign.png";
import aboutStyles from './about.css?inline';
import socialStyles from './socials.css?inline';
import BgVideo from './BgVideo.jsx';
import asset_open_ui_wav from "./assets/open_ui.wav";
import asset_enter_ui_wav from "./assets/enter_ui.wav";
import asset_navigation_ui_wav from "./assets/navigation_ui.wav";
import asset_back_ui_wav from "./assets/back_ui.wav";
import asset_deck_ui_wav from "./assets/deck_ui.wav";

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
const makeSfx = src => {
  const a = new Audio(src);
  a.preload = "auto";
  return a;
};
const SFX = {
  open: { audio: makeSfx(asset_open_ui_wav), volume: 0.6 },
  enter: { audio: makeSfx(asset_enter_ui_wav), volume: 0.6 },
  nav: { audio: makeSfx(asset_navigation_ui_wav), volume: 0.5 }, // volume: 0 = silent, 1 = full
  back: { audio: makeSfx(asset_back_ui_wav), volume: 0.6 },
  deck: { audio: makeSfx(asset_deck_ui_wav), volume: 0.5 }
};
function playSfx(name) {
  try {
    const copy = SFX[name].audio.cloneNode();
    copy.volume = SFX[name].volume;
    return copy.play();
  } catch (err) {
    return undefined;
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

// open_ui: plays when the menu screen shows. If the browser blocks it (no click
// or key press yet on a fresh page load), it plays on the visitor's first key
// press or click instead, as long as they are still on the menu.
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
  if (onMenuScreen()) playSfx("open");
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
  const result = playSfx("open");
  if (result && result.catch) {
    result.catch(() => {
      if (openArmed) return;
      openArmed = true;
      window.addEventListener("pointerdown", unlockOpen);
      window.addEventListener("keydown", unlockOpen);
    });
  }
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
      <BgVideo src={asset_main1_mp4} />
      {revealed && <AboutDetail item={ABOUTME_ITEMS[active]} index={active} chip={(ABOUTME_ITEMS.slice(0, active + 1).reverse().find(x => x.group) || {}).group || "ABOUT"} />}
      <style>{aboutStyles}</style>

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
// Social profiles
const SOCIALS_CHARS = [asset_char1_png, asset_char2_png, asset_char3_png];
const SOCIALS_ROLES = [{
  text: "LEADER",
  color: "#e8c100",
  bg: "rgba(232,193,0,0.12)",
  border: "rgba(232,193,0,0.5)"
}, {
  text: "PARTY",
  color: "#4a8fff",
  bg: "rgba(74,143,255,0.12)",
  border: "rgba(74,143,255,0.5)"
}, {
  text: "PARTY",
  color: "#4a8fff",
  bg: "rgba(74,143,255,0.12)",
  border: "rgba(74,143,255,0.5)"
}];
const SOCIALS_ITEMS = [{
  id: "twitch",
  label: "TWITCH",
  handle: "@yourname",
  href: "https://twitch.tv/yourname",
  icon: "🎮",
  barIcon: asset_icon1_png,
  bars: 1,
  newBars: [0],
  counts: ["56"],
  links: ["twitch.tv/videos/2041837265"],
  stats: [{
    tag: "FOL",
    value: "1.2K",
    color: "#9147ff"
  }, {
    tag: "VWR",
    value: "042",
    color: "#bf94ff"
  }]
}, {
  id: "instagram",
  label: "INSTAGRAM",
  handle: "@yourhandle",
  href: "https://instagram.com/yourhandle",
  icon: "📷",
  barIcon: asset_icon2_png,
  bars: 5,
  newBars: [1, 2],
  counts: ["3.4M", "2.5M", "676K", "412K", "198K"],
  links: ["instagram.com/p/C4xQmRrNk2a", "instagram.com/p/C3wLpBsOj7f", "instagram.com/reel/C2vKoArMi6e", "instagram.com/p/C1uJnZqLh5d", "instagram.com/reel/C0tImYpKg4c"],
  stats: [{
    tag: "FOL",
    value: "3.4K",
    color: "#e1306c"
  }, {
    tag: "PST",
    value: "128",
    color: "#f77737"
  }]
}, {
  id: "tiktok",
  label: "TIKTOK",
  handle: "@yourhandle",
  href: "https://tiktok.com/@yourhandle",
  icon: "🎵",
  barIcon: asset_icon3_png,
  bars: 7,
  newBars: [0, 3, 5, 6],
  counts: ["5.1M", "3.7M", "2.2M", "1.4M", "831K", "490K", "217K"],
  links: ["tiktok.com/@yourhandle/video/7318492016374859054", "tiktok.com/@yourhandle/video/7305837261940183342", "tiktok.com/@yourhandle/video/7291046385720348974", "tiktok.com/@yourhandle/video/7278392047163820334", "tiktok.com/@yourhandle/video/7264819203847165742", "tiktok.com/@yourhandle/video/7251047382916430126", "tiktok.com/@yourhandle/video/7237294018463851822"],
  stats: [{
    tag: "FOL",
    value: "8.9K",
    color: "#00f2ea"
  }, {
    tag: "LKS",
    value: "52K",
    color: "#ff0050"
  }]
}];
export function Socials() {
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [activeInfoBar, setActiveInfoBar] = useState(0);
  const [focus, setFocus] = useState("left"); // "left" | "right"
  const navigate = useNavigate();
  const isMobileViewport = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const onKey = e => {
      if (focus === "left") {
        if (e.key === "ArrowUp" && active > 0) {
          playNav();
          setActive(active - 1);
        }
        if (e.key === "ArrowDown" && active < SOCIALS_ITEMS.length - 1) {
          playNav();
          setActive(active + 1);
        }
        if (e.key === "ArrowRight") {
          setFocus("right");
          setActiveInfoBar(0);
        }
        if (e.key === "Enter") {
          playEnter();
          window.open(SOCIALS_ITEMS[active].href, "_blank");
        }
      } else {
        const barCount = SOCIALS_ITEMS[active].bars;
        if (e.key === "ArrowUp" && activeInfoBar > 0) {
          playDeck();
          setActiveInfoBar(activeInfoBar - 1);
        }
        if (e.key === "ArrowDown" && activeInfoBar < barCount - 1) {
          playDeck();
          setActiveInfoBar(activeInfoBar + 1);
        }
        if (e.key === "ArrowLeft") {
          playBack();
          setFocus("left");
        }
        if (e.key === "Enter") {
          playEnter();
          window.open("https://" + SOCIALS_ITEMS[active].links[activeInfoBar], "_blank");
        }
      }
      if (e.key === "ArrowLeft" && focus === "left" || e.key === "Escape" || e.key === "Backspace") {
        playBack();
        navigate(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, activeInfoBar, navigate, focus]);
  return <div id="menu-screen">
      <BgVideo src={asset_main3_mp4} />
      <style>{socialStyles}</style>

      <div className="sc-root" role="navigation">
        {SOCIALS_ITEMS.map((item, i) => <div key={item.id} className={`sc-bar-outer${active === i ? " active" : ""}${mounted ? " mounted" : ""}`} onClick={() => {
        playEnter();
        if (active === i) window.open(item.href, "_blank");else setActive(i);
      }} onMouseEnter={() => {
        if (active !== i) playNav();
        setActive(i);
      }}>
            <div className="sc-bar-red" />
            <div className="sc-bar">
              <img className="sc-char" src={SOCIALS_CHARS[i]} alt="" />
              <div className="sc-bar-fill" />
              <div className="sc-bar-shade" />
              <div className="sc-bar-content">
                <div className="sc-role">{SOCIALS_ROLES[i].text}</div>
                <div className="sc-main">
                  <div className="sc-main-top">
                    <div className="sc-icon">{item.icon}</div>
                    <div className="sc-label">{item.label}</div>
                  </div>
                </div>
                <div className="sc-stats">
                  {item.stats.map(s => <div className="sc-stat" key={s.tag}>
                      <div className="sc-stat-top">
                        <span className="sc-stat-tag" style={{
                    color: s.color,
                    borderColor: s.color
                  }}>{s.tag}</span>
                        <span className="sc-stat-num">{s.value}</span>
                      </div>
                      <div className="sc-stat-bars">
                        <div className="sc-stat-bar-color" style={{
                    background: s.color
                  }} />
                        <div className="sc-stat-bar-black" />
                      </div>
                    </div>)}
                </div>
              </div>
            </div>
          </div>)}
      </div>

      {mounted && <div className="sc-right-nav" key={active}>
          <span className="sc-nav-arrow left">◄</span>
          <span className="sc-nav-btn">LB</span>
          <span className="sc-nav-label">{SOCIALS_ITEMS[active].label}</span>
          <span className="sc-nav-btn">RB</span>
          <span className="sc-nav-arrow right">►</span>
        </div>}

      {mounted && <div className="sc-info-panel" key={`panel-${active}`}>
          {Array.from({
        length: SOCIALS_ITEMS[active].bars
      }).map((_, i) => <div className={`sc-info-bar-wrap${activeInfoBar === i ? " selected" : ""}`} key={`bar-${active}-${i}`} style={{
        animationDelay: `${i * 50}ms`
      }} onClick={() => {
        playEnter();
        if (isMobileViewport || activeInfoBar === i) {
          window.open("https://" + SOCIALS_ITEMS[active].links[i], "_blank");
          return;
        }
        setActiveInfoBar(i);
      }} onMouseEnter={() => {
        if (activeInfoBar !== i) playDeck();
        setActiveInfoBar(i);
      }}>
              {SOCIALS_ITEMS[active].newBars.includes(i) && <img className="sc-info-bar-new" src={asset_newsign_png} alt="" />}
              <div className="sc-info-bar">
                <img className="sc-info-bar-icon" src={SOCIALS_ITEMS[active].barIcon} alt="" />
                <span className="sc-info-bar-text">{SOCIALS_ITEMS[active].links[i].slice(0, 10)}...</span>
                <span className="sc-info-bar-box">VIEWS</span>
                <span className="sc-info-bar-count">{SOCIALS_ITEMS[active].counts[i]}</span>
              </div>
            </div>)}
        </div>}

      <div className={`sc-footer${mounted ? " mounted" : ""}`}>
        <div className="sc-footer-row"><span className="sc-footer-key">↑↓</span><span>SELECT</span></div>
        <div className="sc-footer-row"><span className="sc-footer-key">↵</span><span>OPEN</span></div>
        <div className="sc-footer-row"><span className="sc-footer-key">ESC</span><span>BACK</span></div>
      </div>

      <div className="sc-mobile-controls" aria-label="Socials mobile controls">
        <button className="sc-mobile-btn" type="button" onClick={() => {
          playBack();
          navigate(-1);
        }}>
          BACK
        </button>
        <button className="sc-mobile-btn" type="button" onClick={() => {
          playEnter();
          window.open(SOCIALS_ITEMS[active].href, "_blank");
        }}>
          OPEN
        </button>
      </div>
    </div>;
}

// ─────────────────────────────────────────────
// Splash: blank entry page with a CONTINUE button (the click unlocks sound)
// ─────────────────────────────────────────────

// Blank entry page with one CONTINUE button.
// The click is what lets the browser play sound, so the music deck
// and the menu sounds can start right after it.
export function Splash({ onContinue }) {
  const [leaving, setLeaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(t);
  }, []);

  const go = () => {
    if (leaving) return;
    playEnter();
    setLeaving(true);
    setTimeout(onContinue, 250); // the menu's own page transition plays right after
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
  }, [leaving]);

  return <div className={`sp-root${mounted ? " mounted" : ""}${leaving ? " leaving" : ""}`}>
      <button className="sp-btn" type="button" onClick={go}>
        <span className="sp-shadow" />
        <span className="sp-highlight" />
        <span className="sp-label sp-label-dark">CONTINUE</span>
        <span className="sp-label sp-label-bright">CONTINUE</span>
      </button>
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

export function WebDeck() {
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
  const unlockRef = useRef(null);
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

            // Autoplay on start. Browsers often block sound until the visitor
            // clicks or presses a key once, so if it didn't start, the first
            // click / key press anywhere on the page starts it instead.
            e.target.playVideo();
            setTimeout(() => {
              const st = playerRef.current && playerRef.current.getPlayerState();
              if (st === 1 || st === 3) return; // playing or buffering
              const unlock = ev => {
                if (ev.target && ev.target.closest && ev.target.closest(".wd")) return;
                window.removeEventListener("pointerdown", unlock);
                window.removeEventListener("keydown", unlock);
                if (playerRef.current) playerRef.current.playVideo();
              };
              window.addEventListener("pointerdown", unlock);
              window.addEventListener("keydown", unlock);
              unlockRef.current = unlock;
            }, 1500);
          },
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
      if (unlockRef.current) {
        window.removeEventListener("pointerdown", unlockRef.current);
        window.removeEventListener("keydown", unlockRef.current);
      }
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