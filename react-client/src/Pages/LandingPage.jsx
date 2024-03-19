import { Link } from "react-router-dom";

import "../Styles/LandingPage/index.css";
import "../Styles/LandingPage/sections.css";
import "../Styles/LandingPage/cardstack.css";
import { ArrowBottomIcon, DiscordIcon, InstagramIcon, TiktokIcon, YoutubeIcon } from "../Styles/Svg";
import { useEffect } from "react";
import Editor from "./LandingPage/editor";
import Analytics from "./LandingPage/analytics";
import Section from "./LandingPage/section";

export default function LandingPage() {
  useEffect(() => {
    let stack = document.querySelector(".stack");
    [...stack.children].reverse().forEach((i) => stack.append(i));

    stack.addEventListener("click", swap);
    setInterval(() => {
      swap({
        target: stack.lastElementChild,
      });
    }, 5000);

    function swap(e) {
      let card = document.querySelector(".card:last-child");
      if (e.target !== card) return;
      card.style.animation = "swap 700ms forwards";

      setTimeout(() => {
        card.style.animation = "";
        stack.prepend(card);
      }, 700);
    }
  });

  return (
    <main className="landing-page">
      <section id="intro">
        <header>
          <Link href="/">
            <h3 className="brand-title">WidgetsGarden</h3>
            <img className="brand-logo" src="/logo/icon.svg" alt="Logo" />
          </Link>

          <nav>
            <a href="#library" className="link">
              Learn More
            </a>
            <a href="/dashboard" className="btn">
              Dashboard
            </a>
          </nav>
        </header>
        <div className="center">
          <div className="heading-wrapper">
            <h1 className="appear-land delay-02">WIDGETS</h1>
            <h1 className="highlight-blue appear-land delay-03">GROW</h1>
            <h1 className="appear-land delay-04">ON</h1>
            <h1 className="appear-land delay-05">TREES</h1>
          </div>
          <p className="fade-in heading-subtitle">
            With WidgetGarden you can import widgets <span className="highlight-orange highlight-hover">quickly</span> and <span className="highlight-orange highlight-hover">without coding</span>!
          </p>
        </div>

        <a className="bottom-arrow scroll" href="#library">
          <ArrowBottomIcon />
        </a>
      </section>

      <Section id={"library"} title={"Community Library"} subtitle={"Choose from hundreds of widgets from the Library."} description={"With our intuitive platform, you can easily share your creations with the community. Start exploring now and see where your imagination takes you!"} dashboardAction={"EXPLORE LIBRARY"} moreLink={"#editor"} moreAction={"HOW IT WORKS"}>
        <div className="center">
          <div className="stack">
            <div
              className="card"
              style={{
                backgroundImage: 'url("landing-page/widget-weather.png")',
              }}
            ></div>
            <div
              className="card"
              style={{
                backgroundImage: 'url("landing-page/widget-share.png")',
              }}
            ></div>
            <div
              className="card"
              style={{
                backgroundImage: 'url("landing-page/widget-youtube.png")',
              }}
            ></div>
            <div
              className="card"
              style={{
                backgroundImage: 'url("landing-page/widget-chatbot.png")',
              }}
            ></div>
          </div>
        </div>
      </Section>

      <Section dashboardAction={"TRY IT NOW"} moreAction={"WATCH A VIDEO"} moreLink={"/"} id={"editor"} title={"Widget Editor"} subtitle={"Create Widgets without limits."} description={"Unleash your creativity by installing and combining plugins to achieve your desired functionality. With our intuitive platform, the possibilities are endless. Let your imagination run wild and bring your ideas to life like never before. Start creating today!"} before>
        <div className="editor-wrapper">
          <Editor />
        </div>
      </Section>

      <Section dashboardAction={"GET STARTED NOW"} id={"analytics"} title={"All In One Analytics"} subtitle={"Elevate Your Performance."} description={"Gain valuable insights into user behavior, engagement, and conversions, all from one centralized dashboard."}>
        <div className="center">
          <Analytics />
        </div>
      </Section>

      <div className="section pricing">
        <h1>Pricing</h1>
        <div className="tiers">
          <div className="tier">
            <h2>Seedling Plan</h2>
            <div className="features">
              <p>Widgets Editor</p>
              <p>Analytics Access</p>
              <p className="disabled">Remove Watermark</p>
              <p className="price">Free Forever</p>
            </div>
          </div>
          <div className="tier">
            <h2>Premium Gardener</h2>
            <div className="features">
              <p>Widgets Editor</p>
              <p>Analytics Access</p>
              <p>Remove Watermark</p>
              <p className="price">Coming soon...</p>
            </div>
          </div>
        </div>
      </div>

      <footer>
        <div className="social">
          <DiscordIcon />
          <YoutubeIcon />
          <TiktokIcon />
          <InstagramIcon />
        </div>
        <div className="map">
          <a href="/">Home</a>
          <a href="/">Terms of Service</a>
          <a href="/dashboard">Dashboard</a>
        </div>
        <div className="bottom">WidgetsGarden 2024</div>
      </footer>
    </main>
  );
}
