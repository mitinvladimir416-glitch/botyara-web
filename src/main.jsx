import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/tokens.css";
import "./styles/reset.css";
import "./styles/motion.css";
import "./styles/responsive.css";
import "./components/ui/ui.css";
import "./App.css";
import "./components/layout/layout.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
