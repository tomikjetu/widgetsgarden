export default function Section({ before, id, children, title, subtitle, description, dashboardAction, moreLink, moreAction }) {
  return (
    <section className="section split-section" id={id}>
      {before && <>{children}</>}
      <div className="center">
        <div className="section-description">
          <h1 className="title">{title}</h1>
          <p className="subtitle">{subtitle}</p>
          <div className="description">
            <div>{description}</div>
          </div>
          <div className="actions">
            <a href="/dashboard" className="btn btn-join">
              {dashboardAction}
            </a>
            {moreAction && (
              <a href={moreLink} className="btn btn-more">
                {moreAction}
              </a>
            )}
          </div>
        </div>
      </div>
      {!before && <>{children}</>}
    </section>
  );
}
