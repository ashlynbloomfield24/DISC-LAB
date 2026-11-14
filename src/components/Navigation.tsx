export type PageId = 'simulation' | 'learn' | 'quiz' | 'references' | 'model';

const TABS: { id: PageId; label: string }[] = [
  { id: 'simulation', label: 'Simulation' },
  { id: 'learn', label: 'Learn' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'references', label: 'References' },
];

export default function Navigation({ page, onNavigate }: { page: PageId; onNavigate: (p: PageId) => void }) {
  return (
    <header className="nav">
      <div className="nav-inner">
        <a className="brand" href="#/simulation" aria-label="DISC LAB home">
          <svg className="brand-mark" viewBox="0 0 64 64" aria-hidden>
            <rect x="8" y="4" width="48" height="16" rx="5" fill="#E9DFC9" />
            <rect x="8" y="44" width="48" height="16" rx="5" fill="#E9DFC9" />
            <rect x="6" y="22" width="52" height="20" rx="9" fill="#9DBCE0" />
            <ellipse cx="32" cy="32" rx="12" ry="7" fill="#0071E3" />
          </svg>
          <span className="brand-text">DISC LAB</span> <small>Intervertebral disc mechanobiology</small>
        </a>
        <nav className="tabs" aria-label="Main">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab ${page === t.id ? 'active' : ''}`}
              aria-current={page === t.id ? 'page' : undefined}
              onClick={() => onNavigate(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
