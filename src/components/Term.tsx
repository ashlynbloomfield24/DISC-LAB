import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { TERMS } from '../data/learnContent';

/** A highlighted glossary term; tap or click to see its definition. */
export function Term({ k, children }: { k: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const t = TERMS[k];
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);
  if (!t) return <>{children}</>;
  return (
    <span className="term-wrap" ref={ref}>
      <button type="button" className={`term ${open ? 'open' : ''}`} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {children}
      </button>
      {open && (
        <span className="term-pop" role="dialog">
          <b>{t.term}</b>
          <span>{t.def}</span>
        </span>
      )}
    </span>
  );
}

/** Render text containing {{key}} or {{key|display text}} markers as Term buttons. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\{\{[^}]+\}\})/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\{\{([^|}]+)(?:\|([^}]+))?\}\}$/);
        if (!m) return <Fragment key={i}>{p}</Fragment>;
        const [, a, b] = m;
        // {{key}} → shows the term name; {{key|display}} → shows the display text
        const key = a;
        const label = b ?? TERMS[a]?.term ?? a;
        return (
          <Term key={i} k={key}>
            {label}
          </Term>
        );
      })}
    </>
  );
}
