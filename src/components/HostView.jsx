import React, { useState, useCallback, useEffect } from "react";
import { useGameSocket, createRoom } from "../useGameSocket.js";
import BearGuesser, { BEARS, SLOTS } from "./BearGuesser.jsx";

const dark = "#0f1623";
const gold = "#FFD700";

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).catch(() => {});
}

export default function HostView({ nickname, onHome }) {
  const [code, setCode] = useState(null);
  const [gameState, setGameState] = useState("loading"); // loading | lobby | playing | finished
  const [players, setPlayers] = useState([]);
  const [bearCounts, setBearCounts] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [won, setWon] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [secret, setSecret] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [finishedCount, setFinishedCount] = useState(0);

  useEffect(() => {
    createRoom()
      .then(({ code: c }) => setCode(c))
      .catch(() => setError("Could not create room. Is the worker deployed?"));
  }, []);

  const onMessage = useCallback((msg) => {
    if (msg.type === "joined") {
      setGameState(prev => {
        if (prev === "playing" && msg.gameState !== "playing" && msg.gameState !== "finished") return prev;
        return msg.gameState || "lobby";
      });
      setPlayers(msg.players || []);
      if (msg.bearCounts) setBearCounts(msg.bearCounts);
      if (msg.secret) setSecret(msg.secret);
    } else if (msg.type === "player_joined" || msg.type === "player_left") {
      setPlayers(msg.players || []);
    } else if (msg.type === "game_started") {
      setGameState("playing");
      setBearCounts(msg.bearCounts);
      setGuesses([]);
      setWon(false);
      setFinishedCount(0);
    } else if (msg.type === "guess_result") {
      setGuesses(g => [...g, { slots: msg.slots, score: msg.score }]);
      if (msg.finished) setWon(true);
    } else if (msg.type === "player_finished") {
      setFinishedCount(n => n + 1);
    } else if (msg.type === "game_over") {
      setGameState("finished");
      setLeaderboard(msg.leaderboard || []);
      setSecret(msg.secret);
    } else if (msg.type === "_disconnected") {
      setError("Disconnected from server.");
    }
  }, []);

  const { send } = useGameSocket({
    code,
    role: "host",
    nickname,
    onMessage,
    enabled: !!code,
  });

  function startGame() { send({ type: "start_game" }); }
  function endGame()   { send({ type: "end_game" }); }
  function submitGuess(slots) { send({ type: "guess", slots }); }

  function handleCopy() {
    copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const totalPlayers = players.length;

  if (error) {
    return (
      <Centered>
        <div style={{ fontSize: 32, marginBottom: 10 }}>⚠️</div>
        <div style={{ color: "#ff6b6b", fontFamily: "'Nunito', sans-serif", fontSize: 14, textAlign: "center", maxWidth: 280, marginBottom: 20 }}>{error}</div>
        <BackBtn onHome={onHome} />
      </Centered>
    );
  }

  if (!code || gameState === "loading") {
    return <Centered><div style={{ color: "rgba(255,255,255,.5)", fontSize: 14 }}>Creating room…</div></Centered>;
  }

  if (gameState === "finished") {
    return (
      <div style={{ minHeight: "100vh", background: dark, fontFamily: "'Fredoka One', cursive", color: "#fff", padding: "20px 12px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 32 }}>🏆</div>
          <div style={{ fontSize: 22, color: gold }}>Game Over!</div>
        </div>
        {secret && (
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", fontFamily: "'Nunito', sans-serif", marginBottom: 6 }}>The secret was</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              {secret.map((id, i) => {
                const b = BEARS.find(x => x.id === id);
                return <div key={i} style={{ width: 36, height: 36, borderRadius: "50%", background: b.color, border: "2px solid rgba(255,215,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{b.emoji}</div>;
              })}
            </div>
          </div>
        )}
        <Leaderboard leaderboard={leaderboard} myNickname={nickname} />
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 20 }}>
          <button onClick={() => { setGameState("lobby"); setGuesses([]); setWon(false); setFinishedCount(0); setLeaderboard([]); setSecret(null); setBearCounts(null); send({ type: "start_game" }); }} style={btnStyle(true)}>🔄 Play Again</button>
          <button onClick={onHome} style={btnStyle(false)}>🏠 Home</button>
        </div>
      </div>
    );
  }

  if (gameState === "lobby") {
    return (
      <div style={{ minHeight: "100vh", background: dark, fontFamily: "'Fredoka One', cursive", color: "#fff", padding: "24px 12px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.45)", fontFamily: "'Nunito', sans-serif", marginBottom: 6 }}>Room Code</div>
          <div style={{ fontSize: 44, color: gold, letterSpacing: 6, textShadow: "0 0 20px rgba(255,215,0,.3)" }}>{code}</div>
          <button onClick={handleCopy} style={{ ...btnStyle(false), marginTop: 8, padding: "6px 18px", fontSize: 13 }}>
            {copied ? "✓ Copied!" : "📋 Copy Code"}
          </button>
        </div>

        <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: "12px 14px", marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginBottom: 8 }}>Players in room ({totalPlayers})</div>
          {players.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: i < players.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
              <span style={{ fontSize: 16 }}>{p.role === "host" ? "👑" : "🎮"}</span>
              <span style={{ fontSize: 15 }}>{p.nickname}</span>
            </div>
          ))}
          {totalPlayers === 0 && <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)", fontFamily: "'Nunito', sans-serif" }}>Waiting for players to join…</div>}
        </div>

        <div style={{ textAlign: "center" }}>
          <button onClick={startGame} disabled={totalPlayers < 1} style={{ ...btnStyle(true), display: "inline-block", padding: "14px 32px", opacity: totalPlayers < 1 ? 0.4 : 1 }}>
            🚀 Start Game
          </button>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", fontFamily: "'Nunito', sans-serif", marginTop: 8 }}>
            You play too — you're on the leaderboard
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <BackBtn onHome={onHome} />
        </div>
      </div>
    );
  }

  // Playing state
  return (
    <div style={{ paddingBottom: 230, fontFamily: "'Fredoka One', cursive", color: "#fff", background: dark, minHeight: "100vh" }}>
      <div style={{ textAlign: "center", padding: "16px 12px 10px" }}>
        <div style={{ fontSize: 22, color: gold }}>Bear Colour Quest</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontFamily: "'Nunito', sans-serif", marginTop: 2 }}>
          Room: {code} · {finishedCount}/{totalPlayers} finished
        </div>
      </div>

      <BearGuesser
        bearCounts={bearCounts}
        guesses={guesses}
        onSubmit={submitGuess}
        disabled={won}
        won={won}
      />

      {!won && (
        <div style={{ textAlign: "center", padding: "8px 12px" }}>
          <button onClick={endGame} style={{ ...btnStyle(false), display: "inline-block", padding: "6px 20px", fontSize: 12 }}>
            ⏹ End Game
          </button>
        </div>
      )}
    </div>
  );
}

function Centered({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0f1623", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Fredoka One', cursive", color: "#fff" }}>
      {children}
    </div>
  );
}

function BackBtn({ onHome }) {
  return (
    <button onClick={onHome} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,.4)", fontFamily: "'Fredoka One', cursive", fontSize: 13, cursor: "pointer" }}>
      ← Home
    </button>
  );
}

function btnStyle(primary) {
  return {
    border: primary ? "none" : "1px solid rgba(255,255,255,.18)",
    borderRadius: 20,
    padding: "8px 20px",
    background: primary ? "linear-gradient(135deg,#FFD700,#FF8C00)" : "rgba(255,255,255,.06)",
    color: primary ? "#111" : "#fff",
    fontFamily: "'Fredoka One', cursive",
    fontSize: 15,
    cursor: "pointer",
  };
}

function Leaderboard({ leaderboard, myNickname }) {
  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      {leaderboard.map((p, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", marginBottom: 6,
          background: p.nickname === myNickname ? "rgba(255,215,0,.1)" : "rgba(255,255,255,.04)",
          border: p.nickname === myNickname ? "1px solid rgba(255,215,0,.3)" : "1px solid rgba(255,255,255,.07)",
          borderRadius: 12,
        }}>
          <div style={{ fontSize: 20, width: 28 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}</div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 15 }}>{p.role === "host" ? "👑 " : ""}{p.nickname}</span>
          </div>
          <div style={{ textAlign: "right" }}>
            {p.finished
              ? <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", fontFamily: "'Nunito', sans-serif" }}>{p.guessCount} {p.guessCount === 1 ? "guess" : "guesses"}</div>
              : <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)", fontFamily: "'Nunito', sans-serif" }}>Did not solve</div>
            }
          </div>
        </div>
      ))}
    </div>
  );
}
