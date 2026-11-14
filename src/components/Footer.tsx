export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <b>DISC LAB</b> is a simplified educational model of intervertebral disc mechanics built from published research. It is not
          clinically validated and must not be used for diagnosis or treatment.
        </div>
        <nav className="footer-links" aria-label="Footer">
          <a href="#/simulation">Simulation</a>
          <a href="#/learn">Learn</a>
          <a href="#/quiz">Quiz</a>
          <a href="#/references">References</a>
          <a href="#/model">Model documentation</a>
        </nav>
      </div>
    </footer>
  );
}
