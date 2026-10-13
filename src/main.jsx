import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Tarayıcı sekme ikonunun (favicon) yerel önbelleğe takılmasını engellemek için dinamik cache-buster
try {
  const ts = Date.now();
  let link = document.querySelector("link[rel='icon'][type='image/png']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    document.head.appendChild(link);
  }
  link.href = `/brand-icon-32.png?t=${ts}`;

  let shortcut = document.querySelector("link[rel='shortcut icon']");
  if (shortcut) {
    shortcut.href = `/brand-icon.ico?t=${ts}`;
  }
} catch (e) {
  console.warn("Favicon update:", e);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);