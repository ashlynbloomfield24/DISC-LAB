import { useEffect, useMemo, useState } from 'react';
import { TERMS } from '../data/learnContent';

type Mark = 'known' | 'review';
type Filter = 'all' | 'review' | 'unmarked';
const KEY = 'disclab.flashcards';

function load(): Record<string, Mark> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}');
  } catch {
    return {};
  }
}
function save(m: Record<string, Mark>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    /* storage unavailable: marks last for this visit only */
  }
}

const CARDS = Object.entries(TERMS).map(([id, t]) => ({ id, front: t.term, back: t.def }));

export default function Flashcards({ onExit }: { onExit: () => void }) {
  const [marks, setMarks] = useState<Record<string, Mark>>(load);
  const [filter, setFilter] = useState<Filter>('all');
  const [order, setOrder] = useState(CARDS.map((c) => c.id));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const deck = useMemo(
    () =>
      order
        .map((id) => CARDS.find((c) => c.id === id)!)
        .filter((c) => (filter === 'all' ? true : filter === 'review' ? marks[c.id] === 'review' : !marks[c.id])),
    [order, filter, marks],
  );
  const card = deck[Math.min(pos, deck.length - 1)];
  const known = CARDS.filter((c) => marks[c.id] === 'known').length;
  const review = CARDS.filter((c) => marks[c.id] === 'review').length;

  useEffect(() => {
    if (pos > deck.length - 1) setPos(Math.max(0, deck.length - 1));
  }, [deck.length, pos]);

  const go = (d: number) => {
    setFlipped(false);
    setPos((p) => (deck.length ? (p + d + deck.length) % deck.length : 0));
  };
  const mark = (m: Mark) => {
    if (!card) return;
    const next = { ...marks, [card.id]: m };
    setMarks(next);
    save(next);
    // In filtered views the card may leave the deck; otherwise advance.
    if (filter === 'all') go(1);
    else setFlipped(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <main className="page quiz-page">
      <div className="quiz-top">
        <button className="btn btn-ghost" onClick={onExit}>
          ← Quiz home
        </button>
        <div className="fc-stats">
          <span className="good">{known} known</span>
          <span className="warnc">{review} to review</span>
          <span>{CARDS.length - known - review} not yet marked</span>
        </div>
      </div>
      <div className="fc-toolbar">
        <div className="segmented">
          {(['all', 'review', 'unmarked'] as Filter[]).map((f) => (
            <button key={f} className={filter === f ? 'active' : ''} onClick={() => { setFilter(f); setPos(0); setFlipped(false); }}>
              {f === 'all' ? 'All cards' : f === 'review' ? 'To review' : 'Not yet marked'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => { setOrder((o) => [...o].sort(() => Math.random() - 0.5)); setPos(0); setFlipped(false); }}>
            Shuffle
          </button>
          <button className="btn btn-ghost" onClick={() => { setMarks({}); save({}); }}>
            Reset marks
          </button>
        </div>
      </div>

      {card ? (
        <>
          <button className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped((f) => !f)} aria-label={flipped ? 'Show term' : 'Reveal definition'}>
            <span className="fc-inner">
              <span className="fc-face fc-front">
                <span className="fc-label">Term</span>
                <span className="fc-term">{card.front}</span>
                <span className="fc-hint">Click or press Space to reveal</span>
                {marks[card.id] && <span className={`fc-badge ${marks[card.id]}`}>{marks[card.id] === 'known' ? 'Known' : 'Review'}</span>}
              </span>
              <span className="fc-face fc-back">
                <span className="fc-label">Definition</span>
                <span className="fc-def">{card.back}</span>
              </span>
            </span>
          </button>
          <div className="fc-controls">
            <button className="icon-btn" onClick={() => go(-1)} aria-label="Previous card">
              ←
            </button>
            <span className="fc-count">
              {Math.min(pos, deck.length - 1) + 1} / {deck.length}
            </span>
            <button className="icon-btn" onClick={() => go(1)} aria-label="Next card">
              →
            </button>
          </div>
          <div className="fc-mark">
            <button className="btn fc-review" onClick={() => mark('review')}>
              Needs review
            </button>
            <button className="btn fc-known" onClick={() => mark('known')}>
              I know this ✓
            </button>
          </div>
        </>
      ) : (
        <div className="card placeholder">
          <h2>No cards here</h2>
          <p>{filter === 'review' ? 'Nothing is marked for review.' : 'Every card has been marked.'} Switch to “All cards” to keep studying.</p>
        </div>
      )}
    </main>
  );
}
