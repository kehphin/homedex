import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const rootElement = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(rootElement);
console.log("REACT_APP_HOST:", process.env.REACT_APP_HOST);
console.log(
  "REACT_APP_STRIPE_PUBLIC_KEY:",
  process.env.REACT_APP_STRIPE_PUBLIC_KEY
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
