import LearnDiagram from '../components/LearnDiagrams';
import { RichText } from '../components/Term';
import { TOPICS, type LearnTopic, type SimLaunch } from '../data/learnContent';
import { REFERENCES } from '../data/references';

export function launchToHash(l: SimLaunch) {
  const q = new URLSearchParams();
  if (l.preset) q.set('preset', l.preset);
  if (l.condition) q.set('condition', l.condition);
  if (l.severity !== undefined) q.set('severity', String(l.severity));
  if (l.compare) q.set('compare', '1');
  if (l.stress) q.set('stress', '1');
  if (l.damage) q.set('damage', '1');
  return `#/simulation?${q.toString()}`;
}

const TILE_COLORS = ['#0071e3', '#2a6fc4', '#30b0c7', '#3d8bef', '#5e5ce6', '#0a84ff', '#30b0c7', '#0071e3', '#2a6fc4', '#ff9f0a', '#ff453a', '#34c759'];

export default function Learn({ topicId, onOpen }: { topicId: string | null; onOpen: (id: string | null) => void }) {
  const idx = topicId ? TOPICS.findIndex((t) => t.id === topicId) : -1;
  if (idx >= 0) return <Article topic={TOPICS[idx]} index={idx} onOpen={onOpen} />;
  return (
    <main className="page">
      <div className="sim-header">
        <div>
          <h1>Learn</h1>
          <p>Twelve short lessons on intervertebral disc anatomy, biomechanics and mechanobiology. Each links to the Simulation.</p>
        </div>
      </div>
      <div className="learn-grid">
        {TOPICS.map((t, i) => (
          <button key={t.id} className="card learn-card" onClick={() => onOpen(t.id)}>
            <span className="learn-num" style={{ background: TILE_COLORS[i % TILE_COLORS.length] }}>{i + 1}</span>
            <span className="learn-card-title">{t.title}</span>
            <span className="learn-card-blurb">{t.blurb}</span>
            <span className="learn-card-go">Read lesson →</span>
          </button>
        ))}
      </div>
      <section className="card learn-refs">
        <h3>Reference library</h3>
        <p className="control-hint">
          Lessons are based on these papers. Studies they cite are named as "via" the paper they come from.
        </p>
        <ol>
          {Object.values(REFERENCES).map((r) => (
            <li key={r.key}>
              {r.full}{' '}
              {r.doi && (
                <a href={`https://doi.org/${r.doi}`} target="_blank" rel="noreferrer">
                  doi:{r.doi}
                </a>
              )}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}

function Article({ topic: t, index, onOpen }: { topic: LearnTopic; index: number; onOpen: (id: string | null) => void }) {
  const prev = TOPICS[index - 1];
  const next = TOPICS[index + 1];
  return (
    <main className="page article-page">
      <button className="btn btn-ghost back-btn" onClick={() => onOpen(null)}>
        ← All lessons
      </button>
      <article className="card article">
        <div className="article-kicker">
          Lesson {index + 1} of {TOPICS.length}
        </div>
        <h1>{t.title}</h1>
        <p className="article-lead">{t.lead}</p>

        <figure className="article-figure">
          <LearnDiagram id={t.diagram} />
          <figcaption>{t.caption}</figcaption>
        </figure>

        {t.body.map((p, i) => (
          <p key={i} className="article-p">
            <RichText text={p} />
          </p>
        ))}

        <div className="callout">
          <div className="callout-title">Structure → function</div>
          <p>
            <RichText text={t.structureFunction} />
          </p>
        </div>

        {t.deeper.map((d) => (
          <details key={d.title} className="deeper">
            <summary>Go deeper: {d.title}</summary>
            {d.body.map((p, i) => (
              <p key={i}>
                <RichText text={p} />
              </p>
            ))}
          </details>
        ))}

        <div className="takeaways">
          <div className="callout-title">Key takeaways</div>
          <ul>
            {t.takeaways.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </div>

        <div className="try-sim">
          <div>
            <div className="callout-title">Try it in the Simulation</div>
            <p>{t.sim.text}</p>
          </div>
          <a className="btn btn-primary" href={launchToHash(t.sim.launch)}>
            {t.sim.cta} →
          </a>
        </div>

        <div className="article-sources">
          <b>Sources:</b> {t.sources.map((k) => REFERENCES[k].short).join(' · ')}. Tap a highlighted term for its definition.
        </div>
      </article>
      <nav className="article-nav" aria-label="Lesson navigation">
        {prev ? (
          <button className="card nav-card" onClick={() => onOpen(prev.id)}>
            <span className="nav-dir">← Previous</span>
            <span>{prev.title}</span>
          </button>
        ) : (
          <span />
        )}
        {next ? (
          <button className="card nav-card right" onClick={() => onOpen(next.id)}>
            <span className="nav-dir">Next →</span>
            <span>{next.title}</span>
          </button>
        ) : (
          <a className="card nav-card right" href="#/quiz">
            <span className="nav-dir">Finished →</span>
            <span>Test yourself in the Quiz</span>
          </a>
        )}
      </nav>
    </main>
  );
}
