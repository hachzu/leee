import { useEffect, useRef, useState } from "react";
import { playEnter, playNav, playBack } from "./Pages.jsx";
import "./webdeck.css";

// ─────────────────────────────────────────────
// WebDeck: a small draggable music deck.
// Spawns at bottom center. The video stays hidden until you expand it.
// Add more songs by adding YouTube video ids to TRACKS
// (the id is the part after youtu.be/ or after ?v=).
// ─────────────────────────────────────────────
const TRACKS = [{ id: "j9Sn1nFGQQ8" }];

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

export default function WebDeck() {
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
              go(idxRef.current + 1);
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
          <button className="wd-mini" type="button" onClick={() => { playNav(); go(idx - 1); }}>◄◄</button>
          <span className="wd-time">{fmt(cur)}</span>
          <div className="wd-seek" onClick={seek}>
            <div className="wd-seek-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="wd-time">{fmt(dur)}</span>
          <button className="wd-mini" type="button" onClick={() => { playNav(); go(idx + 1); }}>►►</button>
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