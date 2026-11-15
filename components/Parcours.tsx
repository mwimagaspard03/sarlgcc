"use client";
import Link from "next/link";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

type Props = {
  lang: string;
  hero: { title: string; text: string; cta: string };
  parcours: {
    label: string;
    steps: string[];
    next: string;
    prev: string;
    restart: string;
    loading: string;
    goto: string;
  };
};

// Fichiers dans public/parcours/ : 6 images fixes (étapes) et 5 clips (transitions)
const STILLS = ["B", "C", "D", "E", "F", "G"];
const CLIPS = ["1-BC", "2-CD", "3-DE", "4-EF", "5-FG"];
const LAST = STILLS.length - 1;

const Chevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
  </svg>
);

export default function Parcours({ lang, hero, parcours }: Props) {
  const [index, setIndex] = useState(0); // étape affichée
  const [playing, setPlaying] = useState<number | null>(null); // clip en cours
  const [waiting, setWaiting] = useState(false); // clip lancé mais pas encore en lecture
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const busy = playing !== null;
  const first = index === 0;
  const last = index === LAST;

  const finish = (to: number) => {
    setIndex(to);
    setPlaying(null);
    setWaiting(false);
  };

  const next = () => {
    if (busy || last) return;
    const v = videos.current[index];
    if (!v) return finish(index + 1);
    setPlaying(index);
    setWaiting(true);
    v.currentTime = 0;
    // shortcut: si la vidéo échoue, on passe à l'image fixe de l'étape suivante pour ne jamais bloquer
    v.play().catch(() => finish(index + 1));
  };

  const prev = () => {
    if (busy || first) return;
    setIndex(index - 1); // fondu vers l'image de l'étape précédente, pas de lecture à l'envers
  };

  const goTo = (j: number) => {
    if (busy || j === index) return;
    if (j === index + 1) next();
    else setIndex(j);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  };

  const onPointerUp = (e: PointerEvent) => {
    const s = pointer.current;
    pointer.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) next();
      else prev();
    }
  };

  const title = parcours.steps[index];

  return (
    <section
      className="parcours"
      role="region"
      aria-roledescription="carousel"
      aria-label={parcours.label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => (pointer.current = { x: e.clientX, y: e.clientY })}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (pointer.current = null)}
    >
      <div className="stage">
        {STILLS.map((s, i) => (
          <img
            key={s}
            src={`/parcours/etape-${s}.webp`}
            alt=""
            draggable={false}
            fetchPriority={i === 0 ? "high" : undefined}
            className={`still${i === index ? " on" : ""}`}
          />
        ))}
        {CLIPS.map((c, i) => (
          <video
            key={c}
            ref={(el) => {
              videos.current[i] = el;
            }}
            src={`/parcours/${c}.mp4`}
            muted
            playsInline
            aria-hidden="true"
            // shortcut: on précharge seulement le clip courant et le suivant
            preload={i <= index + 1 ? "auto" : "none"}
            className={`clip${playing === i && !waiting ? " on" : ""}`}
            onPlaying={() => setWaiting(false)}
            onEnded={() => playing === i && finish(i + 1)}
            onError={() => playing === i && finish(i + 1)}
          />
        ))}
        {busy && waiting && (
          <div className="spinner" role="status">
            <span className="sr-only">{parcours.loading}</span>
          </div>
        )}
        <div className="shade" />
      </div>

      <div className="panel">
        <div className="copy">
          <p className={`step ${first ? "step-small" : "step-big"}`}>{title}</p>
          <h1 className={first ? undefined : "sr-only"}>{hero.title}</h1>
          {first && <p className="lead">{hero.text}</p>}
          {(first || last) && (
            <Link className="btn" href={`/${lang}/contact`}>
              {hero.cta}
            </Link>
          )}
          <p className="sr-only" aria-live="polite">
            {title}
          </p>
        </div>

        <div className="controls">
          <button type="button" className="icon-btn" onClick={prev} disabled={first || busy} aria-label={parcours.prev}>
            <Chevron dir="left" />
          </button>
          <div className="dots">
            {STILLS.map((_, i) => (
              <button
                key={i}
                type="button"
                className="dot"
                onClick={() => goTo(i)}
                disabled={busy}
                aria-current={i === index ? "step" : undefined}
                aria-label={`${parcours.goto} ${i + 1} : ${parcours.steps[i]}`}
              />
            ))}
          </div>
          {last ? (
            <button type="button" className="btn btn-outline" onClick={() => goTo(0)} disabled={busy}>
              {parcours.restart}
            </button>
          ) : (
            <button type="button" className="btn btn-outline" onClick={next} disabled={busy}>
              {parcours.next}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
