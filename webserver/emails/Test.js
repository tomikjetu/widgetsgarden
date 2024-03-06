// emails/src/Test.jsx
import { Button, Html } from "@react-email/components";
import * as React from "react";
function Email({ name }) {
  return /* @__PURE__ */ React.createElement(Html, null, /* @__PURE__ */ React.createElement(
    Button,
    {
      href: "https://example.com",
      style: { background: "#000", color: "#fff", padding: "12px 20px" }
    },
    "Click ",
    name
  ));
}
export {
  Email as default
};
