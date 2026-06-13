import React, { useState } from "react";

const S = {
  wrap: {
    minHeight: "100vh",
    background: "#0f1623",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 20px",
    fontFamily: "'Fredoka One', cursive",
    color: "#fff",
  },
  title: { fontSize: 28, color: "#FFD700", textShadow: "0 0 20px rgba(255,215,0,.35)", marginBottom: 4 },
  sub: { fontSize: 13, color: "rgba(255,255,255,.45)", fontFamily: "'Nunito', sans-serif", marginBottom: 36 },
  btn: (primary) => ({
    width: "100%",
    maxWidth: 320,
    padding: "14px 20px",
    borderRadius: 16,
    border: primary ? "none" : "1px solid rgba(255,255,255,.18)",
    background: primary ? "linear-gradient(135deg,#FFD700,#FF8C00)" : "rgba(255,255,255,.06)",
    color: primary ? "#111" : "#fff",
    fontFamily: "'Fredoka One', cursive",
    fontSize: 17,
    cursor: "pointer",
    marginBottom: 10,
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    gap: 12,
  }),
  icon: { fontSize: 26 },
  input: {
    width: "100%",
    maxWidth: 320,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,215,0,.4)",
    background: "rgba(255,215,0,.06)",
    color: "#fff",
    fontFamily: "'Fredoka One', cursive",
    fontSize: 18,
    letterSpacing: 3,
    textTransform: "uppercase",
    outline: "none",
    marginBottom: 10,
    boxSizing: "border-box",
  },
  nicknameInput: {
    width: "100%",
    maxWidth: 320,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.2)",
    background: "rgba(255,255,255,.06)",
    color: "#fff",
    fontFamily: "'Fredoka One', cursive",
    fontSize: 16,
    outline: "none",
    marginBottom: 10,
    boxSizing: "border-box",
  },
  error: { color: "#ff6b6b", fontSize: 13, fontFamily: "'Nunito', sans-serif", marginBottom: 8 },
  back: {
    background: "transparent",
    border: "none",
    color: "rgba(255,255,255,.4)",
    fontFamily: "'Fredoka One', cursive",
    fontSize: 13,
    cursor: "pointer",
    marginTop: 8,
  },
};

export default function Home({ onSolo, onHost, onJoin }) {
  const [screen, setScreen] = useState("main"); // main | join
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [hostNickname, setHostNickname] = useState("");
  const [error, setError] = useState("");
  const [screen2, setScreen2] = useState("main"); // main | host-name

  function handleJoin(e) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    const n = nickname.trim();
    if (c.length !== 6) { setError("Enter a 6-letter room code"); return; }
    if (!n) { setError("Enter a nickname"); return; }
    onJoin(c, n);
  }

  function handleHostStart(e) {
    e.preventDefault();
    const n = hostNickname.trim();
    if (!n) { setError("Enter your nickname"); return; }
    onHost(n);
  }

  if (screen === "join") {
    return (
      <div style={S.wrap}>
        <div style={{ fontSize: 34, marginBottom: 8 }}>🚪</div>
        <div style={S.title}>Join a Game</div>
        <div style={S.sub}>Enter the 6-letter room code</div>
        <form onSubmit={handleJoin} style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <input
            style={S.input}
            placeholder="ROOM CODE"
            maxLength={6}
            value={code}
            onChange={e => { setCode(e.target.value); setError(""); }}
            autoFocus
          />
          <input
            style={S.nicknameInput}
            placeholder="Your nickname"
            maxLength={20}
            value={nickname}
            onChange={e => { setNickname(e.target.value); setError(""); }}
          />
          {error && <div style={S.error}>{error}</div>}
          <button type="submit" style={S.btn(true)}>
            <span style={S.icon}>🎮</span> Join Game
          </button>
        </form>
        <button style={S.back} onClick={() => { setScreen("main"); setError(""); }}>← Back</button>
      </div>
    );
  }

  if (screen === "host") {
    return (
      <div style={S.wrap}>
        <div style={{ fontSize: 34, marginBottom: 8 }}>👑</div>
        <div style={S.title}>Host a Game</div>
        <div style={S.sub}>Choose a nickname for yourself</div>
        <form onSubmit={handleHostStart} style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <input
            style={S.nicknameInput}
            placeholder="Your nickname"
            maxLength={20}
            value={hostNickname}
            onChange={e => { setHostNickname(e.target.value); setError(""); }}
            autoFocus
          />
          {error && <div style={S.error}>{error}</div>}
          <button type="submit" style={S.btn(true)}>
            <span style={S.icon}>🚀</span> Create Room
          </button>
        </form>
        <button style={S.back} onClick={() => { setScreen("main"); setError(""); }}>← Back</button>
      </div>
    );
  }

  return (
    <div style={S.wrap}>
      <div style={{ fontSize: 48, marginBottom: 10 }}>🐻</div>
      <div style={S.title}>Bear Colour Quest</div>
      <div style={S.sub}>Guess the secret bear sequence</div>

      <button style={S.btn(true)} onClick={onSolo}>
        <span style={S.icon}>🎯</span>
        <div>
          <div>Solo Play</div>
          <div style={{ fontSize: 11, fontFamily: "'Nunito', sans-serif", opacity: 0.7 }}>Play alone, unlimited tries</div>
        </div>
      </button>

      <button style={S.btn(false)} onClick={() => setScreen("host")}>
        <span style={S.icon}>👑</span>
        <div>
          <div>Host a Game</div>
          <div style={{ fontSize: 11, fontFamily: "'Nunito', sans-serif", opacity: 0.7 }}>Create a room, invite friends</div>
        </div>
      </button>

      <button style={S.btn(false)} onClick={() => setScreen("join")}>
        <span style={S.icon}>🚪</span>
        <div>
          <div>Join a Game</div>
          <div style={{ fontSize: 11, fontFamily: "'Nunito', sans-serif", opacity: 0.7 }}>Enter a room code to play</div>
        </div>
      </button>
    </div>
  );
}
