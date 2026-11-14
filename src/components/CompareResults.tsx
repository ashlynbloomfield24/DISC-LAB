import { compareRows, explainComparison } from '../models/compare';
import type { DiscParams, SimResult, SimSample } from '../models/types';

interface Props {
  pH: DiscParams;
  pD: DiscParams;
  h: SimSample;
  d: SimSample;
  resH: SimResult;
  resD: SimResult;
  t: number;
  showDamage: boolean;
  relaxation: boolean;
  colors: [string, string];
}

export default function CompareResults(props: Props) {
  const { h, d, colors, relaxation } = props;
  const rows = relaxation
    ? [{ label: 'Nucleus stress (held strain)', unit: 'kPa', healthy: h.pNP * 1000, degenerated: d.pNP * 1000, digits: 1, illustrative: false }]
    : compareRows(h, d, props.showDamage);
  const text = explainComparison(props);

  return (
    <div className="compare-results">
      <section className="card compare-table-card">
        <h3 className="compare-h">Side-by-side results</h3>
        <table className="compare-table">
          <thead>
            <tr>
              <th />
              <th style={{ color: colors[0] }}>Healthy</th>
              <th style={{ color: colors[1] }}>Degenerated</th>
              <th>Difference</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const diff = r.degenerated - r.healthy;
              // Differences of percentages are shown in percentage points, without a relative %.
              const isPct = r.unit === '%';
              const rel = !isPct && Math.abs(r.healthy) > 1e-6 ? (diff / Math.abs(r.healthy)) * 100 : null;
              return (
                <tr key={r.label}>
                  <td>
                    {r.label} {r.illustrative && <span className="tag">Illustr.</span>}
                  </td>
                  <td>
                    {r.healthy.toFixed(r.digits)} <span className="u">{r.unit}</span>
                  </td>
                  <td>
                    {r.degenerated.toFixed(r.digits)} <span className="u">{r.unit}</span>
                  </td>
                  <td className="diff">
                    <span className={`delta ${diff > 0 ? 'up' : diff < 0 ? 'down' : ''}`}>
                      {diff > 0 ? '▲' : diff < 0 ? '▼' : '–'} {Math.abs(diff).toFixed(r.digits)} {isPct ? 'pts' : r.unit}
                    </span>
                    {rel !== null && Math.abs(diff) > 1e-9 && <span className="u"> ({rel > 0 ? '+' : ''}{rel.toFixed(0)}%)</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      <section className="card compare-explain" aria-live="polite">
        <h3 className="compare-h">Why the responses differ</h3>
        {text.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p className="control-hint">
          Updated automatically from the model outputs. Both discs receive exactly the same loading; every difference comes from the
          simplified degeneration parameters (see "Model parameters"). Real degenerated discs vary widely.
        </p>
      </section>
    </div>
  );
}
