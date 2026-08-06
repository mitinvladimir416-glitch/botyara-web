export default function AuthHero() {
  return (
    <section className="auth-hero" aria-labelledby="auth-hero-title">
      <picture className="auth-hero__media" aria-hidden="true">
        <source media="(max-width: 767px)" srcSet="/auth/botyara-auth-scene-mobile.png" />
        <img src="/auth/botyara-auth-scene-desktop.png" alt="" fetchPriority="high" />
      </picture>
      <div className="auth-hero__scrim" aria-hidden="true" />

      <div className="auth-hero__content">
        <a className="auth-wordmark" href="/" aria-label="БОТЯРА, главная">
          <span className="auth-wordmark__mark" aria-hidden="true">
            <span>Б</span>
          </span>
          <span>БОТЯРА</span>
        </a>

        <div className="auth-hero__message">
          <h1 id="auth-hero-title">AI, который<br />всегда рядом</h1>
          <p>Общайся, создавай и находи идеи в одном пространстве.</p>
        </div>
      </div>
    </section>
  );
}
