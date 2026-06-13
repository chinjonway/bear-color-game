import React, { useState } from "react";
import Home from "./components/Home.jsx";
import HostView from "./components/HostView.jsx";
import PlayerView from "./components/PlayerView.jsx";
import BearV9 from "../bear-colour-game.jsx";

export default function App() {
  const [mode, setMode] = useState("home"); // home | solo | host | player
  const [hostNickname, setHostNickname] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinNickname, setJoinNickname] = useState("");

  if (mode === "solo") {
    return (
      <div>
        <div style={{ position: "fixed", top: 8, left: 12, zIndex: 9999 }}>
          <button
            onClick={() => setMode("home")}
            style={{
              background: "rgba(255,255,255,.08)",
              border: "1px solid rgba(255,255,255,.15)",
              borderRadius: 20,
              padding: "4px 12px",
              color: "rgba(255,255,255,.6)",
              fontFamily: "'Fredoka One', cursive",
              fontSize: 12,
              cursor: "pointer",
            }}
          >← Home</button>
        </div>
        <BearV9 />
      </div>
    );
  }

  if (mode === "host") {
    return <HostView nickname={hostNickname} onHome={() => setMode("home")} />;
  }

  if (mode === "player") {
    return <PlayerView code={joinCode} nickname={joinNickname} onHome={() => setMode("home")} />;
  }

  return (
    <Home
      onSolo={() => setMode("solo")}
      onHost={(nick) => { setHostNickname(nick); setMode("host"); }}
      onJoin={(code, nick) => { setJoinCode(code); setJoinNickname(nick); setMode("player"); }}
    />
  );
}
