import { useEffect, useMemo, useState } from 'react';
import AnatomyTap from '../components/AnatomyTap';
import Flashcards from '../components/Flashcards';
import { CATEGORIES, QUESTIONS, REGION_NAMES, type Category, type Question, type Region } from '../data/quizQuestions';

type Mode = 'home' | 'quiz' | 'results' | 'flashcards';
type Answer = number | boolean | Region;

interface Attempt {
  q: Question;
  given: Answer;
  correct: boolean;
}

const LETTERS = ['A', 'B', 'C', 'D'];
const BEST_KEY = 'disclab.quiz.best';

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function isCorrect(q: Question, given: Answer) {
  return q.answer === given;
}

function readBest(): number | null {
  try {
    const v = localStorage.getItem(BEST_KEY);
    return v === null ? null : Number(v);
  } catch {
    return null;
  }
}
function writeBest(v: number) {
  try {
    localStorage.setItem(BEST_KEY, String(v));
  } catch {
    /* storage unavailable: ignore */
  }
}

export default function Quiz() {
  const [mode, setMode] = useState<Mode>('home');
  const [cats, setCats] = useState<Category[]>(CATEGORIES.map((c) => c.id));
  const [length, setLength] = useState<number>(10);
  const [deck, setDeck] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [given, setGiven] = useState<Answer | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [best, setBest] = useState<number | null>(readBest);

  const pool = useMemo(() => QUESTIONS.filter((q) => cats.includes(q.category)), [cats]);

  const start = () => {
    const n = length === 0 ? pool.length : Math.min(length, pool.length);
    setDeck(shuffle(pool).slice(0, n));
    setIdx(0);
    setGiven(null);
    setAttempts([]);
    setMode('quiz');
    window.scrollTo({ top: 0 });
  };

  const q = deck[idx];
  const answered = given !== null;

  const choose = (a: Answer) => {
    if (answered || !q) return;
    setGiven(a);
    setAttempts((prev) => [...prev, { q, given: a, correct: isCorrect(q, a) }]);
  };

  const next = () => {
    if (idx + 1 >= deck.length) {
      const score = attempts.filter((a) => a.correct).length / deck.length;
      if (best === null || score > best) {
        setBest(score);
        writeBest(score);
      }
      setMode('results');
    } else {
      setIdx(idx + 1);
      setGiven(null);
    }
    window.scrollTo({ top: 0 });
  };

  // Keyboard: 1–4 / A–D to answer, T/F for true–false, Enter for next.
  useEffect(() => {
    if (mode !== 'quiz' || !q) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (answered && e.key === 'Enter') return next();
      if (answered) return;
      if (q.type === 'mc') {
        const k = e.key.toUpperCase();
        const i = ['1', '2', '3', '4'].indexOf(k) >= 0 ? Number(k) - 1 : LETTERS.indexOf(k);
        if (i >= 0) choose(i);
      } else if (q.type === 'tf') {
        if (e.key.toLowerCase() === 't') choose(true);
        if (e.key.toLowerCase() === 'f') choose(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (mode === 'flashcards') return <Flashcards onExit={() => setMode('home')} />;

  if (mode === 'home')
    return (
      <main className="page quiz-page">
        <div className="sim-header">
          <div>
            <h1>Quiz</h1>
            <p>Test what you have learned, or review key terms with flashcards.</p>
          </div>
        </div>
        <div className="quiz-modes">
          <section className="card quiz-mode-card">
            <div className="quiz-mode-icon" aria-hidden>✓</div>
            <h2>Quiz</h2>
            <p>Multiple choice, true/false, tap-the-structure and simulation questions, with an explanation after every answer.</p>
            <div className="control">
              <div className="control-label">Categories</div>
              <div className="chip-row">
                <button className={`chip ${cats.length === CATEGORIES.length ? 'on' : ''}`} onClick={() => setCats(CATEGORIES.map((c) => c.id))}>
                  All
                </button>
                {CATEGORIES.map((c) => {
                  const on = cats.includes(c.id) && cats.length !== CATEGORIES.length;
                  return (
                    <button
                      key={c.id}
                      className={`chip ${on ? 'on' : ''}`}
                      aria-pressed={on}
                      onClick={() =>
                        setCats((prev) =>
                          prev.length === CATEGORIES.length ? [c.id] : prev.includes(c.id) ? (prev.length > 1 ? prev.filter((x) => x !== c.id) : prev) : [...prev, c.id],
                        )
                      }
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="control">
              <div className="control-label">Length</div>
              <div className="segmented">
                {[10, 20, 0].map((n) => (
                  <button key={n} className={length === n ? 'active' : ''} onClick={() => setLength(n)}>
                    {n === 0 ? `All (${pool.length})` : `${Math.min(n, pool.length)} questions`}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn-primary big" onClick={start}>
              Start quiz
            </button>
            {best !== null && <div className="control-hint">Your best score on this device: {Math.round(best * 100)}%</div>}
          </section>
          <section className="card quiz-mode-card">
            <div className="quiz-mode-icon alt" aria-hidden>⧉</div>
            <h2>Flashcards</h2>
            <p>Flip through the DISC LAB glossary. Mark each card as known or needing review, and focus on the ones you have not mastered.</p>
            <button className="btn btn-secondary big" onClick={() => setMode('flashcards')}>
              Open flashcards
            </button>
          </section>
        </div>
      </main>
    );

  if (mode === 'results') {
    const correct = attempts.filter((a) => a.correct).length;
    const pct = Math.round((correct / deck.length) * 100);
    const byCat = CATEGORIES.map((c) => {
      const items = attempts.filter((a) => a.q.category === c.id);
      return { ...c, n: items.length, ok: items.filter((a) => a.correct).length };
    }).filter((c) => c.n > 0);
    const missed = attempts.filter((a) => !a.correct);
    return (
      <main className="page quiz-page">
        <section className="card results-card">
          <div className="score-ring" style={{ ['--p' as string]: `${pct}%` }}>
            <div>
              <b>{pct}%</b>
              <span>
                {correct} / {deck.length}
              </span>
            </div>
          </div>
          <h2>{pct >= 80 ? 'Excellent work!' : pct >= 60 ? 'Good job, keep reviewing.' : 'Keep practising.'}</h2>
          <div className="cat-scores">
            {byCat.map((c) => (
              <div key={c.id} className="cat-score">
                <span>{c.label}</span>
                <div className="meter">
                  <div style={{ width: `${(c.ok / c.n) * 100}%`, background: 'var(--accent)' }} />
                </div>
                <b>
                  {c.ok}/{c.n}
                </b>
              </div>
            ))}
          </div>
          <div className="results-actions">
            <button className="btn btn-primary" onClick={start}>
              Retake quiz
            </button>
            <button className="btn btn-secondary" onClick={() => setMode('home')}>
              Change settings
            </button>
            <button className="btn btn-secondary" onClick={() => setMode('flashcards')}>
              Review flashcards
            </button>
          </div>
        </section>
        {missed.length > 0 && (
          <section className="card review-card">
            <h3>Review the ones you missed</h3>
            {missed.map((a) => (
              <div key={a.q.id} className="review-item">
                <div className="review-q">{a.q.prompt}</div>
                <div className="review-a">
                  <span className="bad">Your answer: {answerText(a.q, a.given)}</span>
                  <span className="good">Correct: {answerText(a.q, a.q.answer)}</span>
                </div>
                <p>{a.q.explanation}</p>
              </div>
            ))}
          </section>
        )}
      </main>
    );
  }

  // ---------------- question screen ----------------
  if (!q) return null;
  const cat = CATEGORIES.find((c) => c.id === q.category)!;
  const ok = answered && isCorrect(q, given!);
  const score = attempts.filter((a) => a.correct).length;
  return (
    <main className="page quiz-page">
      <div className="quiz-top">
        <button className="btn btn-ghost" onClick={() => setMode('home')}>
          ✕ Quit
        </button>
        <div className="quiz-progress">
          <div className="quiz-progress-label">
            <span>
              Question {idx + 1} of {deck.length}
            </span>
            <span>Score {score}</span>
          </div>
          <div className="meter">
            <div style={{ width: `${((idx + (answered ? 1 : 0)) / deck.length) * 100}%`, background: 'var(--accent)' }} />
          </div>
        </div>
      </div>

      <section className="card question-card" key={q.id}>
        <div className="q-meta">
          <span className="q-cat">{cat.label}</span>
          <span className="q-type">{q.type === 'mc' ? ('scenario' in q && q.scenario ? 'Scenario' : 'Multiple choice') : q.type === 'tf' ? 'True or false' : 'Identify the structure'}</span>
        </div>
        <h2 className="q-prompt">{q.prompt}</h2>
        {q.simLink && (
          <a className="sim-link" href={q.simLink} target="_blank" rel="noreferrer">
            Open this setup in the Simulation (new tab) ↗
          </a>
        )}

        {q.type === 'mc' && (
          <div className="answers">
            {q.options.map((o, i) => {
              const state = !answered ? '' : i === q.answer ? 'correct' : i === given ? 'wrong' : 'dim';
              return (
                <button key={i} className={`answer ${state}`} onClick={() => choose(i)} disabled={answered} aria-label={`${LETTERS[i]}: ${o}`}>
                  <span className="answer-letter">{LETTERS[i]}</span>
                  <span className="answer-text">{o}</span>
                  {answered && i === q.answer && <span className="answer-mark">✓</span>}
                  {answered && i === given && i !== q.answer && <span className="answer-mark">✕</span>}
                </button>
              );
            })}
          </div>
        )}
        {q.type === 'tf' && (
          <div className="answers tf">
            {[true, false].map((v) => {
              const state = !answered ? '' : v === q.answer ? 'correct' : v === given ? 'wrong' : 'dim';
              return (
                <button key={String(v)} className={`answer ${state}`} onClick={() => choose(v)} disabled={answered}>
                  <span className="answer-text big">{v ? 'True' : 'False'}</span>
                </button>
              );
            })}
          </div>
        )}
        {q.type === 'tap' && (
          <div className="tap-wrap">
            <AnatomyTap chosen={(given as Region) ?? null} answer={q.answer} revealed={answered} onPick={(r) => choose(r)} />
            {answered && (
              <div className="tap-legend">
                You tapped: <b>{REGION_NAMES[given as Region]}</b>
              </div>
            )}
          </div>
        )}

        {answered && (
          <div className={`feedback ${ok ? 'ok' : 'no'}`} role="status">
            <div className="feedback-head">{ok ? '✓ Correct' : `✕ Not quite. The answer is: ${answerText(q, q.answer)}`}</div>
            <p>{q.explanation}</p>
            {q.type === 'mc' && q.why && (
              <ul className="why-list">
                {q.options.map((_, i) =>
                  i !== q.answer && q.why![i] ? (
                    <li key={i}>
                      <b>{LETTERS[i]}.</b> {q.why![i]}
                    </li>
                  ) : null,
                )}
              </ul>
            )}
            <div className="feedback-src">Source: {q.source}</div>
            <button className="btn btn-primary" onClick={next} autoFocus>
              {idx + 1 >= deck.length ? 'See results' : 'Next question →'}
            </button>
          </div>
        )}
      </section>
      {!answered && (
        <p className="control-hint quiz-keys">
          Tip: press {q.type === 'mc' ? 'A–D or 1–4' : q.type === 'tf' ? 'T or F' : 'Tab and Enter'} to answer.
        </p>
      )}
    </main>
  );
}

function answerText(q: Question, a: Answer): string {
  if (q.type === 'mc') return `${LETTERS[a as number]}. ${q.options[a as number]}`;
  if (q.type === 'tf') return a ? 'True' : 'False';
  return REGION_NAMES[a as Region];
}
