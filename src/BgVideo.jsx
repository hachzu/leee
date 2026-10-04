import { useRef, useEffect } from "react";

// Background video that autoplays reliably across browsers (Chrome, Edge, Firefox, Safari).
// React doesn't always set the "muted" attribute in the DOM, and some browsers
// (like Edge) refuse to autoplay unless the video is really muted, so we set it in code.
// "poster" is an image shown while the video is still loading, so the screen is never black.
export default function BgVideo({ src, className, poster }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, [src]);
  return <video ref={ref} className={className} src={src} poster={poster} autoPlay loop muted playsInline preload="auto" />;
}
