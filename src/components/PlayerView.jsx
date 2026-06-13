import React, { useState, useCallback } from "react";
import { useGameSocket } from "../useGameSocket.js";
import BearGuesser, { BEARS } from "./BearGuesser.jsx";

const dark = "#0f1623";
const gold = "#FFD700";

export default function PlayerView({ code, nickname, onHome }) {
  const [gameState, setGameState] = useState("connecting"); // connecting | lobby | playing | finished
  const [players, setPlayers] = useState([]);
  const [bearCounts, setBearCounts] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [won, setWon] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [secret, setSecret] = useState(null);
  const [finishedCount, setFinishedCount] = useState(0);
  const [error, setError] = useState(null);

  const onMessage = useCallback((msg) => {
    if (msg.type === "joined") {
      // Only transition to a new gameState if moving forward — never regress from "playing" to "lobby"
      setGameState(prev => {
        if (prev === "playing" && msg.gameState !== "playing" && msg.gameState !== "finished") return prev;
        return msg.gameState === "playing" ? "playing" : (msg.gameState === "finished" ? "finished" : "lobby");
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
    } else if (msg.type === "_disconnected" || msg.type === "_error") {
      setError("Connection lost. Please rejoin.");
    }
  }, []);

  const { send } = useGameSocket({ code, role: "player", nickname, onMessage });

  function submitGuess(slots) { send({ type: "guess", slots }); }

  if (error) {
    return (
      <Centered>
        <div style={{ fontSize: 32, marginBottom: 10 }}>⚠️</div>
        <div style={{ color: "#ff6b6b", fontFamily: "'Nunito', sans-serif", fontSize: 14, textAlign: "center", maxWidth: 280, marginBottom: 20 }}>{error}</div>
        <button onClick={onHome} style={smallBtn(false)}>← Home</button>
      </Centered>
    );
  }

  if (gameState === "connecting") {
    return <Centered><div style={{ color: "rgba(255,255,255,.5)", fontSize: 14 }}>Connecting…</div></Centered>;
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
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={onHome} style={smallBtn(true)}>🏠 Home</button>
        </div>
      </div>
    );
  }

  if (gameState === "lobby") {
    return (
      <Centered>
        <div style={{ fontSize: 36, marginBottom: 8 }}>⏳</div>
        <div style={{ fontSize: 18, color: gold, marginBottom: 6 }}>Room: {code}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", fontFamily: "'Nunito', sans-serif", marginBottom: 20 }}>
          Waiting for the host to start…
        </div>
        <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: "10px 16px", minWidth: 220, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 6 }}>Players ({players.length})</div>
          {players.map((p, i) => (
            <div key={i} style={{ fontSize: 14, padding: "3px 0" }}>
              {p.role === "host" ? "👑 " : "🎮 "}{p.nickname}
            </div>
          ))}
        </div>
        <button onClick={onHome} style={smallBtn(false)}>← Home</button>
      </Centered>
    );
  }

  // Playing
  const totalPlayers = players.length;
  return (
    <div style={{ paddingBottom: won ? 20 : 230, fontFamily: "'Fredoka One', cursive", color: "#fff", background: dark, minHeight: "100vh" }}>
      <div style={{ textAlign: "center", padding: "16px 12px 10px" }}>
        <div style={{ fontSize: 22, color: gold }}>Bear Colour Quest</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontFamily: "'Nunito', sans-serif", marginTop: 2 }}>
          {nickname} · {finishedCount}/{totalPlayers} finished
        </div>
      </div>

      <BearGuesser
        bearCounts={bearCounts}
        guesses={guesses}
        onSubmit={submitGuess}
        disabled={won}
        won={won}
      />

      {won && (
        <div style={{ textAlign: "center", padding: "8px 12px", color: "rgba(255,255,255,.4)", fontSize: 13, fontFamily: "'Nunito', sans-serif" }}>
          Waiting for others to finish…
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

function smallBtn(primary) {
  return {
    border: primary ? "none" : "1px solid rgba(255,255,255,.18)",
    borderRadius: 20, padding: "8px 20px",
    background: primary ? "linear-gradient(135deg,#FFD700,#FF8C00)" : "rgba(255,255,255,.06)",
    color: primary ? "#111" : "#fff",
    fontFamily: "'Fredoka One', cursive", fontSize: 14, cursor: "pointer",
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
