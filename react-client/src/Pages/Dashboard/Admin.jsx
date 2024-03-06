import React, { useEffect, useState } from "react";
import axios from "axios";

class DashboardComponent extends React.Component {
  constructor({ data }) {
    super();
    this.data = data;
    this.data = this.data.replace(/{{{SERVER_URL}}}/g, process.env.REACT_APP_SERVER_URL);
    this.extractscript = /<script>([\s\S]+)<\/script>/gi.exec(this.data);
    if (!this.extractscript) throw "CHYBA";
    this.data = data.replace(this.extractscript[0], "");
  }

  render() {
    return (
      <>
        <div dangerouslySetInnerHTML={{ __html: this.data }} />
      </>
    );
  }

  componentDidMount() {
    const script = document.createElement("script");

    script.src = "https://cdn.jsdelivr.net/npm/ag-grid-enterprise@29.3.5/dist/ag-grid-enterprise.min.js";
    script.async = true;

    document.body.appendChild(script);

    const script2 = document.createElement("script");

    script2.src = "https://cdnjs.cloudflare.com/ajax/libs/axios/1.3.5/axios.min.js";
    script2.async = true;

    document.body.appendChild(script2);

    var a = false;
    var b = false;

    script2.onload = () => {
      a = true;
    };
    script.onload = () => {
      b = true;
    };
    var tester = setInterval(() => {
      if (a && b) {
        clearInterval(tester);
        window.eval(this.extractscript[1]);
      }
    });
  }
}

export default function Admin() {
  axios.defaults.withCredentials = true;

  useEffect(() => {
    LoadOverview();
  }, []);

  var [adminData, setAdminData] = useState(null);

  async function LoadOverview() {
    var adminResponse = await axios.get(`${process.env.REACT_APP_SERVER_URL}/admin/html`);
    setAdminData(adminResponse.data);
  }

  return (
    <div className="dashboard-content">
      <div className="dashboard-status">
        <h2 className="dashboard-container">Admin Dashboard</h2>
      </div>
      {adminData && <DashboardComponent data={adminData} />}
    </div>
  );
}
