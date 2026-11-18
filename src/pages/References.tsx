import { useState } from 'react';
import { REFERENCE_DETAILS, SECONDARY } from '../data/referenceDetails';
import { REFERENCES } from '../data/references';

export default function References() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  };
  return (
    <main className="page refs-page">
      <div className="sim-header">
        <div>
          <h1>References</h1>
          <p>The eight papers DISC LAB is built on, what each one contributes, and the studies they cite.</p>
        </div>
      </div>

      <section className="card refs-intro">
        <p>
          Every number, equation and statement in DISC LAB comes from these papers or is labelled as a simplification. When a fact
          comes from a study that one of these papers cites, DISC LAB says so (“via”) rather than claiming to have read the original.
          See the <a href="#/model">Model Documentation</a> for how each value is used.
        </p>
      </section>

      <div className="refs-layout">
      <aside className="card author-card" aria-label="About the author">
        <div className="ref-kind">About this project</div>
        <dl>
          <dt>Name</dt>
          <dd>Ashlyn Bloomfield</dd>
          <dt>Email</dt>
          <dd>
            <a href="mailto:ashlynbloomfield24@gmail.com">ashlynbloomfield24@gmail.com</a>
          </dd>
          <dt>GitHub</dt>
          <dd>
            <a href="https://github.com/ashlynbloomfield24/DISC-LAB" target="_blank" rel="noreferrer">
              ashlynbloomfield24/DISC-LAB ↗
            </a>
          </dd>
          <dt>Course</dt>
          <dd>BME 5313 Cell Mechanobiology</dd>
        </dl>
      </aside>
      <div className="refs-list">
        {REFERENCE_DETAILS.map((d, i) => {
          const r = REFERENCES[d.key];
          const citation = `${r.full}${r.doi ? ` https://doi.org/${r.doi}` : ''}`;
          return (
            <article key={d.key} className="card ref-card">
              <div className="ref-num">{i + 1}</div>
              <div className="ref-body">
                <div className="ref-kind">{d.kind}</div>
                <h3>{r.short}</h3>
                <p className="ref-full">{r.full}</p>
                <p className="ref-summary">{d.summary}</p>
                <div className="ref-used">
                  <b>Used in DISC LAB for</b>
                  <ul>
                    {d.usedFor.map((u) => (
                      <li key={u}>{u}</li>
                    ))}
                  </ul>
                </div>
                <div className="ref-actions">
                  {r.doi && (
                    <a className="btn btn-secondary" href={`https://doi.org/${r.doi}`} target="_blank" rel="noreferrer">
                      doi:{r.doi} ↗
                    </a>
                  )}
                  <button className="btn btn-ghost" onClick={() => copy(d.key, citation)}>
                    {copied === d.key ? 'Copied ✓' : 'Copy citation'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      </div>

      <section className="card refs-secondary">
        <h3>Studies cited through these papers</h3>
        <p className="control-hint">These were not read directly. DISC LAB reports their findings as described by the paper listed.</p>
        <table className="param-table">
          <thead>
            <tr>
              <td><b>Study</b></td>
              <td style={{ textAlign: 'left' }}><b>Reported via</b></td>
              <td style={{ textAlign: 'left' }}><b>Topic</b></td>
            </tr>
          </thead>
          <tbody>
            {SECONDARY.map((s) => (
              <tr key={s.cite}>
                <td>{s.cite}</td>
                <td style={{ textAlign: 'left', fontWeight: 500 }}>{s.via}</td>
                <td style={{ textAlign: 'left', fontWeight: 400, whiteSpace: 'normal' }}>{s.topic}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
