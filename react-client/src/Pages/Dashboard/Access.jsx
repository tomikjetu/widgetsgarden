import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { setCookie } from "../../Misc/Cookies";

import axios from "axios";

import { CloseIcon, HomeIcon, PlusIcon } from "../../Styles/Svg";
import "../../Styles/Dashboard/access.css";
import CodeCopy from "../../Elements/CodeCopy";
import { GridSettings, TimeSettings, getDashboardSetting } from "../Dashboard";
import TimeLineSeries from "../../Misc/Charts/TimeLineSeries";

export default function Access() {
  axios.defaults.withCredentials = true;

  var [apiKey, setApiKey] = useState("");
  var [stats, setStats] = useState(null);

  var [GridCollumns, setGridCollumns] = useState(2);
  var [timespan, setTimespan] = useState(30);
  var [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 14)));
  var [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    setGridCollumns(getDashboardSetting("dashboard-collumns"));
    setTimespan(getDashboardSetting("dashboard-timespan"));

    getDomains();
    axios.get(`${process.env.REACT_APP_SERVER_URL}/dashboard/access/stats`).then((res) => {
      setStats(res.data);
    });
    axios.get(`${process.env.REACT_APP_SERVER_URL}/dashboard/apikey`).then((res) => {
      setApiKey(res.data);
    });
  }, []);

  useEffect(() => {
    if (GridCollumns == null) return;
    setCookie("dashboard-collumns", GridCollumns, null, "/dashboard");
  }, [GridCollumns]);

  useEffect(() => {
    if (timespan == null) return;
    setCookie("dashboard-timespan", timespan, null, "/dashboard");
    setStartDate(new Date().setDate(new Date().getDate() - timespan));
    setEndDate(new Date());
  }, [timespan]);

  var [allowedDomains, setAllowedDomains] = useState([]);
  var [restrictedDomains, setRestrictedDomains] = useState([]);

  var domainInputRef = useRef(null);
  function addFormDomain() {
    addDomain(domainInputRef.current.value);
    domainInputRef.current.value = "";
  }

  async function getDomains() {
    return new Promise((resolve, reject) => {
      axios({
        method: "GET",
        url: `${process.env.REACT_APP_SERVER_URL}/dashboard/domains`,
      }).then((res) => {
        var domains = res.data;
        setAllowedDomains(domains.allowed);
        setRestrictedDomains(domains.restricted);
      });
    });
  }

  function addDomain(domain) {
    axios({
      method: "PUT",
      data: { domain },
      url: `${process.env.REACT_APP_SERVER_URL}/dashboard/domains/allowed`,
    }).then(() => {
      getDomains();
    });
  }

  function removeDomain(domain) {
    axios({
      method: "DELETE",
      data: { domain },
      url: `${process.env.REACT_APP_SERVER_URL}/dashboard/domains/allowed`,
    }).then(() => {
      getDomains();
    });
  }

  function removeRestrictedDomain(domain) {
    axios({
      method: "DELETE",
      data: { domain },
      url: `${process.env.REACT_APP_SERVER_URL}/dashboard/domains/restricted`,
    }).then(() => {
      getDomains();
    });
  }

  return (
    <div className="editor">
      <header>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "flex-end",
          }}
        >
          <Link to="/dashboard">
            <span style={{ fontSize: "2rem" }}>
              <HomeIcon />
            </span>
          </Link>
          <h1>Access</h1>
        </div>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "2rem",
          }}
        >
          <GridSettings setGridCollumns={setGridCollumns} GridCollumns={GridCollumns} />
          <TimeSettings timespan={timespan} setTimespan={setTimespan} />
        </div>
      </header>
      <div className="dashboard-content">
        <div
          className="dashboard-container"
          style={{
            marginBottom: "1rem",
          }}
        >
          <h1>Installation</h1>
          <p>
            To track analytics or display a widget on your website, include this script in every page you want to track or display a widget:
          </p>

          {apiKey && <CodeCopy code={`<script defer src="${process.env.REACT_APP_SERVER_URL}/widgetsgarden.js?apiKey=${apiKey}"></script>`} />}
        </div>
        <div
          className="dashboard-grid"
          style={{
            gridTemplateColumns: `repeat(${GridCollumns}, 1fr)`,
          }}
        >
          <div className="dashboard-container">
            <div>
              <h1>Authenitcated Domains</h1>
              <p>Only these domains can access widgets through your access code.</p>

              <div className="addDomainForm">
                <input ref={domainInputRef} type="text" name="addDomain" id="addDomain" placeholder="subdomain.domain.com" />
                <button className="btn" onClick={addFormDomain}>
                  Add
                </button>
              </div>
              <ul className="domains">
                {allowedDomains.map((domain, index) => {
                  return (
                    <li key={index} className="domain-item">
                      <div className="domain-text">{domain}</div>
                      <div className="links-wrapper">
                        <button
                          onClick={() => {
                            removeDomain(domain);
                          }}
                        >
                          <CloseIcon />
                        </button>
                      </div>
                    </li>
                  );
                })}
                {allowedDomains.length == 0 && (
                  <div className="domain-item">
                    <p>None</p>
                  </div>
                )}
              </ul>

              <div>
                <h1>Restricted Domains</h1>
                <p>These are the domains removed from authenitcated domains, or domains trying to using your api key.</p>

                <ul className="domains">
                  {restrictedDomains.map((domain, index) => {
                    return (
                      <li key={index} className="domain-item">
                        <div className="domain-text">{domain}</div>
                        <div className="links-wrapper">
                          <button
                            onClick={() => {
                              addDomain(domain);
                            }}
                          >
                            <PlusIcon />
                          </button>
                          <button
                            onClick={() => {
                              removeRestrictedDomain(domain);
                            }}
                          >
                            <CloseIcon />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                  {restrictedDomains.length == 0 && (
                    <div className="domain-item">
                      <p>None</p>
                    </div>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <TimeLineSeries title={"ApiKey Usage"} id={"apiKeyUsage"} labels={["Authorized", "Restricted"]} colorSet={["#008000", "#FF0000"]} setTimespan={setTimespan} timespan={timespan} startDate={startDate} endDate={endDate} source={stats} noData={"Loading usage..."} />
        </div>
      </div>
    </div>
  );
}
