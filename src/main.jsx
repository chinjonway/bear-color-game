import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import BearColorGame from "../bear-colour-game.jsx";
import "./styles.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed", error);
    });
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BearColorGame />
  </StrictMode>
);