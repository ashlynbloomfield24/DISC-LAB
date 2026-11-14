import { useEffect, useRef, useState } from 'react';

export const SPEEDS = [1, 10, 60, 600, 3600];

export function fmtClock(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
}

/** Simulation clock driven by requestAnimationFrame. */
export function useSimClock(total: number, initialSpeed: number) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const last = useRef<number | null>(null);
  useEffect(() => {
    if (!playing) {
      last.current = null;
      return;
    }
    let raf = 0;
    const tick = (now: number) => {
      if (last.current !== null) {
        const dt = ((now - last.current) / 1000) * speed;
        setT((prev) => {
          const next = prev + dt;
          if (next >= total) {
            setPlaying(false);
            return total;
          }
          return next;
        });
      }
      last.current = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, total]);
  useEffect(() => {
    setT((prev) => Math.min(prev, total));
  }, [total]);
  return {
    t,
    playing,
    speed,
    setSpeed,
    seek: (v: number) => setT(Math.max(0, Math.min(total, v))),
    toggle: () => {
      if (!playing && t >= total) setT(0);
      setPlaying((p) => !p);
    },
    reset: () => {
      setPlaying(false);
      setT(0);
    },
  };
}

interface Props {
  t: number;
  total: number;
  playing: boolean;
  speed: number;
  speeds?: number[];
  onToggle: () => void;
  onReset: () => void;
  onSeek: (t: number) => void;
  onSpeed: (s: number) => void;
  phases: { start: number; end: number; loaded: boolean }[];
  status?: string;
}

export default function PlaybackBar({ t, total, playing, speed, speeds = SPEEDS, onToggle, onReset, onSeek, onSpeed, phases, status }: Props) {
  const fill = total > 0 ? (t / total) * 100 : 0;
  return (
    <div className="card playback">
      <button className="play-btn" onClick={onToggle} aria-label={playing ? 'Pause' : 'Play'}>
        {playing ? (
          <svg width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor" /><rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor" /></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M4 2.5v11l9-5.5z" fill="currentColor" /></svg>
        )}
      </button>
      <button className="icon-btn" onClick={onReset} aria-label="Reset time">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 10a6 6 0 1 0 2-4.5" /><path d="M4 3v3.5h3.5" /></svg>
      </button>
      <div className="scrubber">
        <input
          type="range"
          min={0}
          max={total}
          step={total / 1000 || 1}
          value={t}
          aria-label="Simulation time"
          style={{ ['--fill' as string]: `${fill}%` }}
          onChange={(e) => onSeek(Number(e.target.value))}
        />
        <div className="phase-bar" aria-hidden>
          {phases.map((p, i) => (
            <span key={i} className={p.loaded ? 'loaded' : 'rest'} style={{ width: `${((p.end - p.start) / (total || 1)) * 100}%` }} />
          ))}
        </div>
        <div className="time-label">
          <span>
            Simulated time <b>{fmtClock(t)}</b> of {fmtClock(total)}
          </span>
          <span>{status}</span>
        </div>
      </div>
      <div className="segmented" aria-label="Playback speed">
        {speeds.map((s) => (
          <button key={s} className={speed === s ? 'active' : ''} onClick={() => onSpeed(s)}>
            {s}×
          </button>
        ))}
      </div>
    </div>
  );
}
