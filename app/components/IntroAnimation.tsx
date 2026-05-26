"use client";

import { useState, useEffect, useMemo } from "react";

const SHIELD = "/shield.png";
const SPARK_COUNT = 16;

function makeSparks() {
  return Array.from({ length: SPARK_COUNT }, (_, i) => {
    const angle = (i / SPARK_COUNT) * Math.PI * 2 + Math.random() * 0.5;
    const dist  = 200 + Math.random() * 280;
    const size  = 3 + Math.random() * 5;
    return { tx: Math.cos(angle) * dist, ty: Math.sin(angle) * dist, delay: 250 + Math.random() * 400, size };
  });
}

const STYLES = `
  .ei-stage {
    position: fixed; inset: 0; z-index: 9999;
    display: grid; place-items: center;
    isolation: isolate; overflow: hidden;
    background: radial-gradient(120% 80% at 50% 55%, #14224b 0%, #0a1230 45%, #03061a 100%);
    opacity: 1; transition: opacity 0.75s ease;
  }
  .ei-out { opacity: 0; pointer-events: none; }

  .ei-vignette {
    position: absolute; inset: 0; pointer-events: none; z-index: 30;
    background: radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.6) 100%);
  }

  /* ── Light burst ── */
  .ei-burst {
    position: absolute; left: 50%; top: 50%;
    width: 10px; height: 10px;
    transform: translate(-50%,-50%);
    border-radius: 50%;
    background: radial-gradient(circle, #fff 0%, #ffe9a8 25%, rgba(241,194,91,0.6) 45%, transparent 70%);
    box-shadow: 0 0 80px 20px rgba(255,230,160,0.7);
    opacity: 0; z-index: 1;
    animation: ei-burst 700ms cubic-bezier(0.16,0.9,0.3,1) forwards;
  }
  @keyframes ei-burst {
    0%   { opacity:0; transform:translate(-50%,-50%) scale(0.2); }
    20%  { opacity:1; }
    60%  { opacity:0.9; transform:translate(-50%,-50%) scale(120); }
    100% { opacity:0; transform:translate(-50%,-50%) scale(200); }
  }

  /* ── Halo rings ── */
  .ei-ring {
    position: absolute; left:50%; top:50%;
    width:60px; height:60px;
    transform: translate(-50%,-50%) scale(0);
    border-radius: 50%;
    border: 2px solid rgba(241,194,91,0.65);
    opacity: 0; z-index: 2; pointer-events: none;
    animation: ei-ring 1200ms cubic-bezier(0.16,0.9,0.3,1) forwards;
  }
  .ei-r2 { animation-delay: 120ms; }
  .ei-r3 { animation-delay: 260ms; }
  @keyframes ei-ring {
    0%   { opacity:0; transform:translate(-50%,-50%) scale(0); border-width:6px; }
    15%  { opacity:0.9; }
    100% { opacity:0; transform:translate(-50%,-50%) scale(22); border-width:1px; }
  }

  /* ── God rays ── */
  .ei-rays {
    position: absolute; left:50%; top:50%;
    width: 120vmin; height: 120vmin;
    transform: translate(-50%,-50%) rotate(-30deg) scale(0.4);
    opacity: 0; z-index: 3; pointer-events: none;
    background: conic-gradient(from 0deg,
      transparent 0deg, rgba(255,225,150,0) 6deg, rgba(255,225,150,0.22) 10deg, transparent 14deg,
      transparent 36deg, rgba(255,225,150,0.18) 40deg, transparent 44deg,
      transparent 70deg, rgba(255,225,150,0.20) 74deg, transparent 78deg,
      transparent 110deg, rgba(255,225,150,0.18) 114deg, transparent 118deg,
      transparent 150deg, rgba(255,225,150,0.16) 154deg, transparent 158deg,
      transparent 190deg, rgba(255,225,150,0.20) 194deg, transparent 198deg,
      transparent 226deg, rgba(255,225,150,0.16) 230deg, transparent 234deg,
      transparent 262deg, rgba(255,225,150,0.18) 266deg, transparent 270deg,
      transparent 298deg, rgba(255,225,150,0.20) 302deg, transparent 306deg,
      transparent 334deg, rgba(255,225,150,0.16) 338deg, transparent 342deg,
      transparent 360deg);
    -webkit-mask: radial-gradient(circle, transparent 18%, black 35%, black 70%, transparent 95%);
            mask: radial-gradient(circle, transparent 18%, black 35%, black 70%, transparent 95%);
    filter: blur(0.5px);
    animation: ei-rays 1800ms cubic-bezier(0.22,1,0.36,1) forwards;
  }
  @keyframes ei-rays {
    0%   { opacity:0; transform:translate(-50%,-50%) rotate(-30deg) scale(0.4); }
    25%  { opacity:0.95; }
    60%  { opacity:0.55; }
    100% { opacity:0; transform:translate(-50%,-50%) rotate(60deg) scale(1.2); }
  }

  /* ── Shield ── */
  .ei-shield-wrap {
    position: relative;
    width: clamp(200px, 36vmin, 420px);
    aspect-ratio: 921 / 1152;
    z-index: 10; opacity: 0;
    animation:
      ei-shield-burst 1100ms cubic-bezier(0.16,1,0.3,1) forwards,
      ei-float 6s ease-in-out 2200ms infinite;
  }
  .ei-shield-img {
    width: 100%; height: 100%; display: block; object-fit: contain;
  }
  @keyframes ei-shield-burst {
    0%   { opacity:0; transform:scale(0.05); filter:drop-shadow(0 0 0 rgba(255,255,255,0)) brightness(2.5); }
    35%  { opacity:1; transform:scale(1.1);  filter:drop-shadow(0 0 60px rgba(255,230,160,0.95)) brightness(1.4); }
    55%  { transform:scale(0.96); }
    75%  { transform:scale(1.02); }
    100% { opacity:1; transform:scale(1);    filter:drop-shadow(0 30px 60px rgba(0,0,0,0.55)) drop-shadow(0 0 30px rgba(255,220,150,0.25)) brightness(1); }
  }
  @keyframes ei-float {
    0%,100% { transform:translateY(0) scale(1); }
    50%      { transform:translateY(-10px) scale(1.01); }
  }

  /* ── Shine sweep ── */
  .ei-shine {
    position: absolute; inset: 0;
    pointer-events: none; opacity: 0;
    background: linear-gradient(115deg,
      transparent 35%, rgba(255,245,200,0) 45%,
      rgba(255,245,200,0.85) 50%, rgba(255,245,200,0) 55%, transparent 65%);
    background-size: 250% 100%;
    background-position: 200% 0;
    mix-blend-mode: screen;
    -webkit-mask: url('${SHIELD}') center / contain no-repeat;
            mask: url('${SHIELD}') center / contain no-repeat;
    animation: ei-shine 1100ms cubic-bezier(0.22,1,0.36,1) 900ms forwards;
  }
  @keyframes ei-shine {
    0%   { opacity:0; background-position:200% 0; }
    20%  { opacity:1; }
    80%  { opacity:1; }
    100% { opacity:0; background-position:-100% 0; }
  }

  /* ── Sparks ── */
  .ei-sparks {
    position: absolute; left:50%; top:50%;
    width:0; height:0; z-index:8; pointer-events:none;
  }
  .ei-spark {
    position: absolute;
    background: radial-gradient(circle, #fff 0%, #ffe9a8 40%, transparent 70%);
    border-radius: 50%; opacity: 0;
    animation: ei-spark 1400ms cubic-bezier(0.16,0.9,0.3,1) var(--d,300ms) forwards;
  }
  @keyframes ei-spark {
    0%   { opacity:0; transform:translate(0,0) scale(0.3); }
    20%  { opacity:1; transform:translate(calc(var(--tx)*0.3),calc(var(--ty)*0.3)) scale(1.2); }
    100% { opacity:0; transform:translate(var(--tx),var(--ty)) scale(0.4); }
  }

  /* ── Tagline ── */
  .ei-tagline {
    position: absolute;
    left: 50%;
    top: calc(50% + clamp(130px, 20vmin, 260px));
    transform: translate(-50%, 14px);
    text-align: center; z-index: 12;
    opacity: 0; pointer-events: none; white-space: nowrap;
    animation: ei-tagline 600ms cubic-bezier(0.22,1,0.36,1) 1500ms forwards;
  }
  @keyframes ei-tagline {
    0%   { opacity:0; transform:translate(-50%, 14px); }
    100% { opacity:1; transform:translate(-50%, 0); }
  }
  .ei-eyebrow {
    font-size: clamp(9px, 1.2vmin, 12px);
    letter-spacing: 0.45em; text-transform: uppercase;
    color: #f1c25b; margin-bottom: 10px; opacity: 0.85;
    font-weight: 500;
  }
  .ei-title {
    font-size: clamp(24px, 5vmin, 58px);
    font-weight: 900; letter-spacing: 0.08em;
    color: #f6f1e4; line-height: 1; text-transform: uppercase;
  }
  .ei-title-word { display: inline-block; }
  .ei-letter {
    display: inline-block; opacity: 0;
    transform: translateY(0.4em) rotate(-6deg); filter: blur(6px);
    animation: ei-letter 700ms cubic-bezier(0.22,1,0.36,1) forwards;
    animation-delay: calc(1500ms + var(--i) * 35ms);
  }
  .ei-accent { color: #ffe9a8; }
  @keyframes ei-letter {
    0%   { opacity:0; transform:translateY(0.5em) rotate(-8deg); filter:blur(8px); }
    60%  { opacity:1; filter:blur(0); }
    100% { opacity:1; transform:translateY(0) rotate(0); filter:blur(0); }
  }
`;

export default function IntroAnimation() {
  const [show, setShow]       = useState(false);
  const [exiting, setExiting] = useState(false);
  const sparks = useMemo(() => makeSparks(), []);

  useEffect(() => {
    if (sessionStorage.getItem("elbiou_intro")) return;
    sessionStorage.setItem("elbiou_intro", "1");
    setShow(true);
    const t1 = setTimeout(() => setExiting(true), 3400);
    const t2 = setTimeout(() => setShow(false), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!show) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className={`ei-stage${exiting ? " ei-out" : ""}`} aria-hidden="true">

        <div className="ei-burst" />
        <div className="ei-ring ei-r1" />
        <div className="ei-ring ei-r2" />
        <div className="ei-ring ei-r3" />

        <div className="ei-sparks">
          {sparks.map((s, i) => (
            <div
              key={i}
              className="ei-spark"
              style={{
                "--tx": `${s.tx}px`,
                "--ty": `${s.ty}px`,
                "--d":  `${s.delay}ms`,
                width:  `${s.size}px`,
                height: `${s.size}px`,
                left:   `${-s.size / 2}px`,
                top:    `${-s.size / 2}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        <div className="ei-rays" />

        <div className="ei-shield-wrap">
          <img className="ei-shield-img" src={SHIELD} alt="Elbio Fernández Universitario" />
          <div className="ei-shine" />
        </div>

        <div className="ei-tagline">
          <div className="ei-eyebrow">Bienvenidos</div>
          <div className="ei-title">
            {"ELBIO UNIVERSITARIO".split(" ").map((word, wi, arr) => (
              <span key={wi} className="ei-title-word">
                {Array.from(word).map((ch, ci) => (
                  <span
                    key={ci}
                    className={`ei-letter${wi === arr.length - 1 ? " ei-accent" : ""}`}
                    style={{ "--i": wi * 6 + ci } as React.CSSProperties}
                  >
                    {ch}
                  </span>
                ))}
                {wi < arr.length - 1 && <span>&nbsp;</span>}
              </span>
            ))}
          </div>
        </div>

        <div className="ei-vignette" />
      </div>
    </>
  );
}
