import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import asset_char1_png from "./assets/char1.png";
import asset_char2_png from "./assets/char2.png";
import asset_char3_png from "./assets/char3.png";
import asset_main1_mp4 from "./assets/main1.mp4";
import asset_icon1_png from "./assets/icon1.png";
import asset_icon2_png from "./assets/icon2.png";
import asset_icon3_png from "./assets/icon3.png";
import asset_mainm_jpeg from "./assets/mainm.jpeg";
import asset_mainm2_jpeg from "./assets/mainm2.jpeg";
import asset_mainf_jpeg from "./assets/mainf.jpeg";
import asset_main3_mp4 from "./assets/main3.mp4";
import asset_newsign_png from "./assets/newsign.png";
import aboutStyles from './about.css?inline';
import socialStyles from './socials.css?inline';
import BgVideo from './BgVideo.jsx';
// About page
const ABOUTME_CHARS = [asset_char1_png, asset_char2_png, asset_char3_png];
const ABOUTME_MAIN_IMAGES = [asset_mainm_jpeg, asset_mainm2_jpeg, asset_mainf_jpeg];
const ABOUTME_REVEAL_CONTENT = [{
  upper: ["name moneybagg", "age:23"],
  lower: "major: computer science"
}, {
  upper: ["Cleopatra lived closer to the Moon landing than to the building of the pyramids.", "Vikings kept cats on ships for pest control (and vibes).", "In medieval Europe, animals could be put on trial for crimes"],
  lower: "abbove is some history fun fact"
}, {
  upper: ["Oxford University founding is older than the Aztec Empire.", "The shortest war in history lasted 38–45 minutes (Britain vs Zanzibar).", "Humans have been writing for ~5,000 years"],
  lower: "yes it's a place holder"
}];
const ABOUTME_ROLES = [{
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
const ABOUTME_ITEMS = [{
  id: "twitch",
  label: "ABOUT ME",
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
  label: "FUN FACT ABOUT ME",
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
  label: "WIRED FACT ABOUT ME",
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
export function AboutMe() {
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const navigate = useNavigate();
  const isMobileViewport = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
  const handleBarClick = index => {
    if (isMobileViewport && active === index) {
      setRevealed(prev => !prev);
      return;
    }
    setActive(index);
    if (isMobileViewport) {
      setRevealed(false);
    }
  };
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const onKey = e => {
      if (e.key === "ArrowUp") setActive(i => Math.max(0, i - 1));
      if (e.key === "ArrowDown") setActive(i => Math.min(ABOUTME_ITEMS.length - 1, i + 1));
      if (e.key === "Enter") setRevealed(true);
      if (e.key === "ArrowRight") setRevealed(true);
      if (e.key === "ArrowLeft") {
        if (revealed) setRevealed(false);else navigate(-1);
      }
      if (e.key === "Escape" || e.key === "Backspace") navigate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, navigate, revealed]);
  return <div id="menu-screen">
      <BgVideo src={asset_main1_mp4} />
      {revealed && <div key={`dim-${active}`} className="sc-dim" />}
      {revealed && <div key={`panel-${active}`} className={`sc-reveal-panel${mounted ? " mounted" : ""}`}>
          <div className="sc-reveal-upper-bar">
            {ABOUTME_REVEAL_CONTENT[active].upper.map(line => <div className="sc-reveal-upper-line" key={line}>{line}</div>)}
          </div>
          <div className="sc-reveal-lower-bar">{ABOUTME_REVEAL_CONTENT[active].lower}</div>
        </div>}
      {revealed && <div key={`nav-${active}`} className="sc-right-nav">
          <span className="sc-nav-arrow left">◄</span>
          <span className="sc-nav-btn">LB</span>
          <span className="sc-nav-dot" />
          <span className="sc-nav-btn">RB</span>
          <span className="sc-nav-arrow right">►</span>
        </div>}
      {revealed && <div key={`portrait-${active}`} className={`sc-main-portrait-shell${mounted ? " mounted" : ""}`}>
          <img className="sc-main-portrait" src={ABOUTME_MAIN_IMAGES[active]} alt="" />
        </div>}
      <style>{aboutStyles}</style>

      <div className="sc-root" role="navigation">
        {ABOUTME_ITEMS.map((item, i) => <div key={item.id} className={`sc-bar-outer${active === i ? " active" : ""}${mounted ? " mounted" : ""}`} onClick={() => {
        handleBarClick(i);
      }} onMouseEnter={() => {
        setActive(i);
      }}>
            <div className="sc-bar-red" />
            <div className="sc-bar">
              <img className="sc-char" src={ABOUTME_CHARS[i]} alt="" />
              <div className="sc-bar-fill" />
              <div className="sc-bar-shade" />
              <div className="sc-bar-content">
                <div className="sc-role">{ABOUTME_ROLES[i].text}</div>
                <div className="sc-main">
                  <div className="sc-main-top">
                    <div className="sc-label">{item.label}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>)}
      </div>

      <div className={`sc-footer${mounted ? " mounted" : ""}`}>
        <div className="sc-footer-row"><span className="sc-footer-key">↑↓</span><span>SELECT</span></div>
        <div className="sc-footer-row"><span className="sc-footer-key">↵</span><span>REVEAL</span></div>
        <div className="sc-footer-row"><span className="sc-footer-key">ESC</span><span>BACK</span></div>
      </div>

      <div className="sc-mobile-controls" aria-label="About mobile controls">
        <button className="sc-mobile-btn" type="button" onClick={() => navigate(-1)}>
          BACK
        </button>
        <button className="sc-mobile-btn" type="button" onClick={() => setRevealed(prev => !prev)}>
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
        if (e.key === "ArrowUp") setActive(i => Math.max(0, i - 1));
        if (e.key === "ArrowDown") setActive(i => Math.min(SOCIALS_ITEMS.length - 1, i + 1));
        if (e.key === "ArrowRight") {
          setFocus("right");
          setActiveInfoBar(0);
        }
        if (e.key === "Enter") window.open(SOCIALS_ITEMS[active].href, "_blank");
      } else {
        const barCount = SOCIALS_ITEMS[active].bars;
        if (e.key === "ArrowUp") setActiveInfoBar(i => Math.max(0, i - 1));
        if (e.key === "ArrowDown") setActiveInfoBar(i => Math.min(barCount - 1, i + 1));
        if (e.key === "ArrowLeft") setFocus("left");
        if (e.key === "Enter") window.open("https://" + SOCIALS_ITEMS[active].links[activeInfoBar], "_blank");
      }
      if (e.key === "ArrowLeft" && focus === "left" || e.key === "Escape" || e.key === "Backspace") navigate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, navigate, focus]);
  return <div id="menu-screen">
      <BgVideo src={asset_main3_mp4} />
      <style>{socialStyles}</style>

      <div className="sc-root" role="navigation">
        {SOCIALS_ITEMS.map((item, i) => <div key={item.id} className={`sc-bar-outer${active === i ? " active" : ""}${mounted ? " mounted" : ""}`} onClick={() => {
        if (active === i) window.open(item.href, "_blank");else setActive(i);
      }} onMouseEnter={() => setActive(i)}>
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
        if (isMobileViewport || activeInfoBar === i) {
          window.open("https://" + SOCIALS_ITEMS[active].links[i], "_blank");
          return;
        }
        setActiveInfoBar(i);
      }} onMouseEnter={() => setActiveInfoBar(i)}>
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
        <button className="sc-mobile-btn" type="button" onClick={() => navigate(-1)}>
          BACK
        </button>
        <button className="sc-mobile-btn" type="button" onClick={() => window.open(SOCIALS_ITEMS[active].href, "_blank")}>
          OPEN
        </button>
      </div>
    </div>;
}