export default function AmbientBackground() {
  return (
    <div className="bt-ambient" aria-hidden="true">
      <span className="bt-ambient__orb bt-ambient__orb--near" />
      <span className="bt-ambient__orb bt-ambient__orb--far" />
      <span className="bt-ambient__stars" />
      <span className="bt-ambient__grain" />
    </div>
  );
}
