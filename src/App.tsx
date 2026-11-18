import { useEffect, useState } from 'react';
import Footer from './components/Footer';
import Navigation, { type PageId } from './components/Navigation';
import Tutorial, { TUTORIAL_EVENT, tutorialSeen } from './components/Tutorial';
import Learn from './pages/Learn';
import ModelDocs from './pages/ModelDocs';
import Quiz from './pages/Quiz';
import References from './pages/References';
import Simulation from './pages/Simulation';

interface Route {
  page: PageId;
  sub: string | null; // lesson id for #/learn/<id>
  query: string; // e.g. preset=standing&compare=1 for #/simulation?…
}

function parseHash(): Route {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [path, query = ''] = raw.split('?');
  const [page, sub] = path.split('/');
  const p: PageId = page === 'learn' || page === 'quiz' || page === 'references' || page === 'model' ? page : 'simulation';
  return { page: p, sub: sub || null, query };
}

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash);
  // The how-to-use tutorial opens on a visitor's first visit and can be reopened at any time.
  const [tourOpen, setTourOpen] = useState(() => !tutorialSeen());
  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash());
      window.scrollTo({ top: 0 });
    };
    const onTour = () => setTourOpen(true);
    window.addEventListener('hashchange', onHash);
    window.addEventListener(TUTORIAL_EVENT, onTour);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener(TUTORIAL_EVENT, onTour);
    };
  }, []);
  const go = (hash: string) => {
    window.location.hash = hash;
  };
  return (
    <>
      <Navigation page={route.page} onNavigate={(p) => go(`/${p}`)} />
      {route.page === 'simulation' && <Simulation key={route.query} launchQuery={route.query} />}
      {route.page === 'learn' && <Learn topicId={route.sub} onOpen={(id) => go(id ? `/learn/${id}` : '/learn')} />}
      {route.page === 'quiz' && <Quiz />}
      {route.page === 'references' && <References />}
      {route.page === 'model' && <ModelDocs />}
      <Footer />
      <Tutorial open={tourOpen} onClose={() => setTourOpen(false)} />
    </>
  );
}
