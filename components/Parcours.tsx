"use client";
import Link from "next/link";
import { useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";

type Props = {
  lang: string;
  hero: { title: string; text: string; cta: string };
  parcours: {
    label: string;
    steps: string[];
    descriptions: string[];
    next: string;
    prev: string;
    restart: string;
    loading: string;
    goto: string;
    hint: string;
  };
};

// Fichiers dans public/parcours/ : 6 images fixes (étapes) et 5 clips (transitions)
const STILLS = ["B", "C", "D", "E", "F", "G"];
const CLIPS = ["1-BC", "2-CD", "3-DE", "4-EF", "5-FG"];
const LAST = STILLS.length - 1;

// Les sources durent environ 5,2 s : cette vitesse les ramène à ~3 s.
const CLIP_RATE = 1.73;

// Téléphone en portrait : on sert les médias 9:16 (fichiers mobile-*)
const MOBILE = "(max-width: 899px) and (orientation: portrait)";
const watch = (q: string) => (cb: () => void) => {
  const mq = window.matchMedia(q);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const watchMobile = watch(MOBILE);

const Chevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
  </svg>
);

export default function Parcours({ lang, hero, parcours }: Props) {
  // null tant que la page n'est pas hydratée : les vidéos n'ont alors pas de src, donc aucun téléchargement en double
  const mobile = useSyncExternalStore<boolean | null>(watchMobile, () => window.matchMedia(MOBILE).matches, () => null);
  const [index, setIndex] = useState(0); // étape du texte, du point actif et de l'annonce : change tout de suite
  const [shown, setShown] = useState(0); // image affichée : change à la fin du clip
  const [moved, setMoved] = useState(false); // vrai après un premier changement d'étape (pour l'animation du texte)
  const [playing, setPlaying] = useState<number | null>(null); // clip en cours
  const [waiting, setWaiting] = useState(false); // clip lancé mais pas encore en lecture
  const [progress, setProgress] = useState(0); // progression cumulée des cinq clips
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const busy = playing !== null; // un clip joue : on ignore les nouvelles navigations pour ne pas désynchroniser
  const first = index === 0;
  const last = index === LAST;

  const step = (to: number) => {
    setIndex(to);
    setMoved(true);
  };

  const finish = (to: number) => {
    setShown(to);
    setPlaying(null);
    setWaiting(false);
    setProgress(to / CLIPS.length);
  };
  const playClip = (from: number) => {
    const to = from + 1;
    step(to); // le texte change tout de suite, le clip n'est qu'une transition visuelle
    const v = videos.current[from];
    if (!v) return finish(to);
    setPlaying(from);
    setWaiting(true);
    v.currentTime = 0;
    setProgress(from / CLIPS.length);
    v.defaultPlaybackRate = CLIP_RATE;
    v.playbackRate = CLIP_RATE;
    // shortcut: si la vidéo échoue, on passe à l'image fixe de l'étape suivante pour ne jamais bloquer
    v.play().catch(() => finish(to));
  };
  const next = () => {
    if (busy || last) return;
    playClip(index);
  };

  const jump = (to: number) => {
    step(to);
    setShown(to); // fondu vers l'image de l'étape, pas de lecture à l'envers
    setProgress(to / CLIPS.length);
  };

  const prev = () => {
    if (busy || first) return;
    jump(index - 1);
  };

  const goTo = (j: number) => {
    if (busy || j === index) return;
    if (j === index + 1) next();
    else jump(j);
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
  const desc = first ? hero.text : parcours.descriptions[index];

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
          <picture key={s}>
            <source media={MOBILE} srcSet={`/parcours/mobile-etape-${s}.webp`} />
            <img
              src={`/parcours/etape-${s}.webp`}
              alt=""
              draggable={false}
              fetchPriority={i === 0 ? "high" : undefined}
              className={`still${i === shown ? " on" : ""}`}
            />
          </picture>
        ))}
        {CLIPS.map((c, i) => (
          <video
            key={c}
            ref={(el) => {
              videos.current[i] = el;
            }}
            src={mobile === null ? undefined : `/parcours/${mobile ? "mobile-" : ""}${c}.mp4`}
            muted
            playsInline
            aria-hidden="true"
            // shortcut: on précharge seulement le clip courant et le suivant
            preload={i <= index + 1 ? "auto" : "none"}
            className={`clip${playing === i && !waiting ? " on" : ""}`}
            onPlaying={() => setWaiting(false)}
            onTimeUpdate={(e) => {
              if (playing === i && e.currentTarget.duration > 0) {
                setProgress((i + e.currentTarget.currentTime / e.currentTarget.duration) / CLIPS.length);
              }
            }}
            onEnded={() => {
              if (playing !== i) return;
              const to = i + 1;
              setShown(to);
              if (to < LAST) playClip(to);
              else finish(to);
            }}
            onError={() => playing === i && finish(i + 1)}
          />
        ))}
        {busy && waiting && (
          <div className="spinner" role="status">
            <span className="sr-only">{parcours.loading}</span>
          </div>
        )}
        <div className="shade" />
        <div className="progress-track" aria-hidden="true">
          <span className="progress-fill" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>

      <div className="panel">
        <div className="copy">
          <div key={index} className={moved ? "copy-in" : undefined}>
            <p className={`step ${first ? "step-small" : "step-big"}`}>{title}</p>
            <h1 className={first ? undefined : "sr-only"}>{hero.title}</h1>
            <p className="lead">{desc}</p>
            {(first || last) && (
              <Link className="btn" href={`/${lang}/contact`}>
                {hero.cta}
              </Link>
            )}
            {first && !moved && (
              <p className="hint">
                {parcours.hint}
                <Chevron dir="right" />
              </p>
            )}
          </div>
          <p className="sr-only" aria-live="polite">
            {title}. {desc}
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
