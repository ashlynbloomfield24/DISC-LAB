import { useEffect, useRef, useState } from 'react';
import { INFO } from '../data/glossary';

export default function InfoTip({ id, align = 'center' }: { id: keyof typeof INFO; align?: 'center' | 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const e = INFO[id];
  useEffect(() => {
    if (!open) return;
    const close = (ev: MouseEvent) => {
      if (ref.current && !ref.current.contains(ev.target as Node)) setOpen(false);
    };
    const esc = (ev: KeyboardEvent) => ev.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);
  if (!e) return null;
  return (
    <span className="info-wrap" ref={ref} onClick={(ev) => ev.stopPropagation()}>
      <button
        type="button"
        className={`info-btn ${open ? 'open' : ''}`}
        aria-label={`About ${e.title}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        i
      </button>
      {open && (
        <span className={`info-pop ${align === 'right' ? 'right' : ''}`} role="dialog">
          <h5>{e.title}</h5>
          <dl>
            <dt>What it is</dt>
            <dd>{e.what}</dd>
            <dt>Why it matters</dt>
            <dd>{e.why}</dd>
            <dt>In the model</dt>
            <dd>{e.how}</dd>
          </dl>
          {e.source && <div className="src">Source: {e.source}</div>}
        </span>
      )}
    </span>
  );
}
