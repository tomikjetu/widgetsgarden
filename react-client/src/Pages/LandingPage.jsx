import { Link } from "react-router-dom"

import "../Styles/LandingPage/index.css"
import "../Styles/LandingPage/sections.css"
import { ArrowBottomIcon } from "../Styles/Svg"


export default function LandingPage() {
  return <main className="landing-page">

    <section id="intro">
      <header>
        <Link href="/">
          <h3>WidgetsGarden</h3>
        </Link>

        <nav>
          <a href="#widgets" className="link">Widgets</a>
          <a href="/dashboard" className="btn">Dashboard</a>
        </nav>

      </header>
      <div className="center">

        <div className="wrapper">
          <h1 className="appear-land delay-02">WIDGETS</h1>
          <h1 className="highlight-blue appear-land delay-03">GROW</h1>
          <h1 className="appear-land delay-04">ON</h1>
          <h1 className="appear-land delay-05">TREES</h1>

        </div>
        <p className="fade-in">With WidgetGarden you can import widgets <span
          className="highlight-orange highlight-hover">quickly</span> and <span
            className="highlight-orange highlight-hover">without coding</span>!</p>
      </div>

      <a className="bottom-arrow scroll" href="#widgets">
        <ArrowBottomIcon />
      </a>

    </section>

    <section id="widgets">
      <div className="center">
        Login to get widgets now
      </div>
    </section>

  </main>
}