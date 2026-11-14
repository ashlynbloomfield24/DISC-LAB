import { useState, type ReactNode } from 'react';
import { DIRECTIONS, MAGNITUDE_RANGE, PRESETS } from '../data/presets';
import type { FrequencyMode, LoadInputs, LoadType } from '../models/types';
import InfoTip from './InfoTip';
import type { INFO } from '../data/glossary';

export type TestMode = 'loading' | 'creep' | 'relaxation';

export const DURATIONS = [10, 30, 60, 300, 600, 1800, 3600, 7200, 4 * 3600, 8 * 3600];
export const RECOVERIES = [0, 600, 1800, 3600, 7200, 4 * 3600, 8 * 3600, 12 * 3600, 24 * 3600];

export function fmtDuration(s: number) {
  if (s === 0) return 'None';
  if (s < 60) return `${s} s`;
  if (s < 3600) return `${Math.round(s / 60)} min`;
  const h = s / 3600;
  return `${Number.isInteger(h) ? h : h.toFixed(1)} h`;
}

const nearestIndex = (arr: number[], v: number) =>
  arr.reduce((best, x, i) => (Math.abs(x - v) < Math.abs(arr[best] - v) ? i : best), 0);

interface Props {
  inputs: LoadInputs;
  onChange: (next: LoadInputs) => void;
  activePreset: string | null;
  onPreset: (id: string) => void;
  testMode: TestMode;
  onTest: (mode: 'creep' | 'relaxation') => void;
  relaxStrain: number;
  onRelaxStrain: (v: number) => void;
  visualScale: number;
  onVisualScale: (v: number) => void;
  showStress: boolean;
  onShowStress: (v: boolean) => void;
  showDamage: boolean;
  onShowDamage: (v: boolean) => void;
  onReset: () => void;
}

export default function ForceControls(props: Props) {
  const { inputs, onChange, testMode } = props;
  const [advancedOpen, setAdvancedOpen] = useState(true);
  const set = (patch: Partial<LoadInputs>) => onChange({ ...inputs, ...patch });
  const range = MAGNITUDE_RANGE[inputs.loadType];
  const isMoment = inputs.loadType === 'bending' || inputs.loadType === 'torsion';
  const relax = testMode === 'relaxation';

  const changeType = (t: LoadType) => {
    set({
      loadType: t,
      direction: DIRECTIONS[t][0].value,
      magnitude: MAGNITUDE_RANGE[t].default,
      // Validation fix: a 750 N body-weight preload would cancel a 200 N tension and leave the
      // disc in net compression. Tension starts with no preload; other modes restore 750 N.
      preload: t === 'tension' ? 0 : inputs.loadType === 'tension' || inputs.preload === 0 ? 750 : inputs.preload,
    });
  };

  return (
    <aside className="card panel" aria-label="Loading controls">
      <section className="panel-section">
        <div className="section-title">
          Quick presets
          <button className="collapse-btn" onClick={props.onReset}>Reset to default</button>
        </div>
        <div className="preset-grid">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              className={`preset ${props.activePreset === p.id && testMode === 'loading' ? 'active' : ''}`}
              onClick={() => props.onPreset(p.id)}
              title={p.basis}
            >
              <span className="p-icon" aria-hidden>{p.icon}</span>
              <span className="p-label">{p.label}</span>
              <span className="p-sum">{p.summary}</span>
            </button>
          ))}
        </div>
        <div className="test-buttons">
          <button className={`btn btn-secondary ${testMode === 'creep' ? 'active' : ''}`} onClick={() => props.onTest('creep')}>
            Run creep test
          </button>
          <button className={`btn btn-secondary ${relax ? 'active' : ''}`} onClick={() => props.onTest('relaxation')}>
            Run relaxation test
          </button>
        </div>
        {testMode === 'creep' && (
          <p className="control-hint">Reproduces O'Connell et al. (2011): 1000 N for 4 h, 24 h unloaded recovery, then 4 h again.</p>
        )}
      </section>

      {relax ? (
        <section className="panel-section">
          <div className="section-title">
            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>Relaxation test <InfoTip id="relaxation" /></span>
          </div>
          <Slider
            label="Step strain"
            value={props.relaxStrain * 100}
            min={2}
            max={15}
            step={0.5}
            display={`${(props.relaxStrain * 100).toFixed(1)} %`}
            onChange={(v) => props.onRelaxStrain(v / 100)}
            hint="Held for 1800 s at three tissue sites, as in Ellingson & Nuckley (2012)."
          />
        </section>
      ) : (
        <section className="panel-section">
          <div className="section-title">
            Advanced loading
            <button className="collapse-btn" onClick={() => setAdvancedOpen((o) => !o)} aria-expanded={advancedOpen}>
              {advancedOpen ? 'Hide' : 'Show'}
            </button>
          </div>
          {advancedOpen && (
            <>
              <Control label="Force type" info="loadType">
                <div className="segmented full">
                  {(['compression', 'tension', 'shear', 'torsion', 'bending'] as LoadType[]).map((t) => (
                    <button key={t} className={inputs.loadType === t ? 'active' : ''} onClick={() => changeType(t)}>
                      {t[0].toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </Control>

              <Control label="Force direction" info="direction">
                <div className="segmented full">
                  {DIRECTIONS[inputs.loadType].map((d) => (
                    <button key={d.value} className={inputs.direction === d.value ? 'active' : ''} onClick={() => set({ direction: d.value })}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </Control>

              <Slider
                label={isMoment ? 'Moment magnitude' : 'Force magnitude'}
                info="magnitude"
                value={inputs.magnitude}
                min={range.min}
                max={range.max}
                step={range.step}
                display={`${inputs.magnitude.toFixed(isMoment ? 1 : 0)} ${range.unit}`}
                onChange={(v) => set({ magnitude: v })}
              />

              {inputs.loadType !== 'compression' && (
                <Slider
                  label="Body-weight preload"
                  info="preload"
                  value={inputs.preload}
                  min={0}
                  max={2000}
                  step={25}
                  display={`${inputs.preload.toFixed(0)} N`}
                  onChange={(v) => set({ preload: v })}
                />
              )}

              <Slider
                label="Loading duration"
                info="duration"
                value={nearestIndex(DURATIONS, inputs.duration)}
                min={0}
                max={DURATIONS.length - 1}
                step={1}
                display={fmtDuration(inputs.duration)}
                onChange={(i) => set({ duration: DURATIONS[i] })}
              />

              <Control label="Loading frequency" info="frequency">
                <div className="segmented full">
                  {(['single', 'repeated', 'cyclic'] as FrequencyMode[]).map((m) => (
                    <button key={m} className={inputs.frequencyMode === m ? 'active' : ''} onClick={() => set({ frequencyMode: m })}>
                      {m[0].toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </Control>
              {inputs.frequencyMode === 'repeated' && (
                <Slider
                  label="Load / rest blocks"
                  value={inputs.repeats}
                  min={2}
                  max={6}
                  step={1}
                  display={`${inputs.repeats} ×`}
                  onChange={(v) => set({ repeats: v })}
                />
              )}
              {inputs.frequencyMode === 'cyclic' && (
                <Slider
                  label="Cyclic frequency"
                  value={inputs.frequencyHz}
                  min={0.1}
                  max={5}
                  step={0.1}
                  display={`${inputs.frequencyHz.toFixed(1)} Hz`}
                  onChange={(v) => set({ frequencyHz: v })}
                  hint="Triangle wave between 5% and 100% of the load (Newell et al. 2020 used 0.05–5 Hz)."
                />
              )}

              <Slider
                label="Recovery time"
                info="recovery"
                value={nearestIndex(RECOVERIES, inputs.recovery)}
                min={0}
                max={RECOVERIES.length - 1}
                step={1}
                display={fmtDuration(inputs.recovery)}
                onChange={(i) => set({ recovery: RECOVERIES[i] })}
              />
            </>
          )}
        </section>
      )}

      <section className="panel-section">
        <div className="section-title">Display</div>
        <Control label="Visual scale" info="visualScale">
          <div className="segmented full">
            <button className={props.visualScale === 2 ? 'active' : ''} onClick={() => props.onVisualScale(2)}>2× magnified</button>
            <button className={props.visualScale === 1 ? 'active' : ''} onClick={() => props.onVisualScale(1)}>True scale</button>
          </div>
        </Control>
        <Toggle label="Show stress map" info="stress" checked={props.showStress} onChange={props.onShowStress} />
        {!relax && <Toggle label="Damage progression" info="damage" checked={props.showDamage} onChange={props.onShowDamage} />}
      </section>
    </aside>
  );
}

function Control({ label, info, children }: { label: string; info?: keyof typeof INFO; children: ReactNode }) {
  return (
    <div className="control">
      <div className="control-head">
        <span className="control-label">
          {label} {info && <InfoTip id={info} />}
        </span>
      </div>
      {children}
    </div>
  );
}

export function Slider(props: {
  label: string;
  info?: keyof typeof INFO;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
  hint?: string;
}) {
  const fill = ((props.value - props.min) / (props.max - props.min || 1)) * 100;
  return (
    <div className="control">
      <div className="control-head">
        <span className="control-label">
          {props.label} {props.info && <InfoTip id={props.info} />}
        </span>
        <span className="control-value">{props.display}</span>
      </div>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        aria-label={props.label}
        aria-valuetext={props.display}
        style={{ ['--fill' as string]: `${fill}%` }}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
      {props.hint && <div className="control-hint">{props.hint}</div>}
    </div>
  );
}

function Toggle({ label, info, checked, onChange }: { label: string; info?: keyof typeof INFO; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="control-head">
      <span className="control-label">
        {label} {info && <InfoTip id={info} />}
      </span>
      <label className="switch">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-label={label} />
        <span className="track" />
      </label>
    </div>
  );
}
