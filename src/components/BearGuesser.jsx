import React, { useState, useRef, useEffect } from "react";

const BEARS = [
  { id: "honey",   color: "#D4860A", name: "Honey",   emoji: "🐻" },
  { id: "polar",   color: "#B0CFD8", name: "Polar",   emoji: "🐻‍❄️" },
  { id: "panda",   color: "#2C2C2C", name: "Panda",   emoji: "🐼" },
  { id: "grizzly", color: "#7B4F2E", name: "Grizzly", emoji: "🐻" },
  { id: "red",     color: "#C0392B", name: "Red",     emoji: "🦊" },
  { id: "blue",    color: "#2471A3", name: "Blue",    emoji: "💙" },
];
const SLOTS = 4;

export { BEARS, SLOTS };

export default function BearGuesser({ bearCounts, guesses, onSubmit, disabled, won }) {
  const [slots, setSlots] = useState(Array(SLOTS).fill(null));
  const [active, setActive] = useState(0);
  const [picked, setPicked] = useState(null);
  const [shake, setShake] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [guesses?.length]);

  function pick(id) {
    if (disabled || won) return;
    const s = [...slots];
    s[active] = id;
    setSlots(s);
    setPicked(id);
    let next = s.findIndex((v, i) => i > active && !v);
    if (next === -1) next = s.findIndex((v, i) => i < active && !v);
    if (next !== -1) setActive(next);
  }

  function check() {
    if (disabled || won) return;
    if (slots.some(v => !v)) { setShake(true); setTimeout(() => setShake(false), 400); return; }
    onSubmit(slots);
    // Reset immediately so the next guess can be started without waiting for server response
    setSlots(Array(SLOTS).fill(null));
    setActive(0);
    setPicked(null);
  }

  const counts = bearCounts
    ? BEARS.filter(b => bearCounts[b.id] > 0).map(b => ({ ...b, n: bearCounts[b.id] }))
    : [];

  return (
    <>
      <style>{`
        .pop { animation:pop .18s ease; }
        @keyframes pop { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        .sk  { animation:sk .35s ease; }
        @keyframes sk  { 0%,100%{transform:translateX(0)} 30%{transform:translateX(-5px)} 70%{transform:translateX(5px)} }
      `}</style>

      {/* Bear count hints */}
      {counts.length > 0 && (
        <div style={{
          display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center",
          background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 12, padding: "6px 10px", margin: "0 12px 12px",
        }}>
          {counts.map(b => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,.07)", borderRadius: 20, padding: "2px 8px 2px 3px" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: b.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{b.emoji}</div>
              <span style={{ fontSize: 12, fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>×{b.n}</span>
            </div>
          ))}
        </div>
      )}

      {/* Past guesses */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, padding: "0 12px", marginBottom: 8 }}>
        {(guesses || []).map((g, i) => (
          <div key={i} ref={i === (guesses.length - 1) ? endRef : null} className="pop" style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 10px", borderRadius: 12,
            background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)",
          }}>
            <div style={{ display: "flex", gap: 6 }}>
              {g.slots.map((id, j) => {
                const b = BEARS.find(x => x.id === id);
                return <div key={j} style={{ width: 32, height: 32, borderRadius: "50%", background: b.color, border: "2px solid rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{b.emoji}</div>;
              })}
            </div>
            <div style={{
              marginLeft: "auto",
              background: g.score === SLOTS ? "linear-gradient(135deg,#FFD700,#FF8C00)" : g.score > 0 ? "linear-gradient(135deg,#2ecc71,#27ae60)" : "rgba(255,255,255,.1)",
              borderRadius: 20, padding: "3px 12px", fontSize: 15, fontWeight: 700,
              color: g.score > 0 ? "#fff" : "#555",
            }}>{g.score} ✓</div>
          </div>
        ))}
      </div>

      {/* Win banner */}
      {won && (
        <div style={{ margin: "0 12px 12px", background: "rgba(255,215,0,.12)", border: "1px solid rgba(255,215,0,.35)", borderRadius: 14, padding: "10px 14px", textAlign: "center" }}>
          <div style={{ fontSize: 17, color: "#FFD700" }}>🎉 Cracked in {guesses.length} {guesses.length === 1 ? "try" : "tries"}!</div>
        </div>
      )}

      {/* Fixed bottom panel */}
      {!won && !disabled && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 999,
          background: "#0f1623", borderTop: "1px solid rgba(255,255,255,.09)",
          padding: "8px 12px 18px", fontFamily: "'Fredoka One', cursive",
        }}>
          <div className={shake ? "sk" : ""} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,215,0,.07)", border: "1px solid rgba(255,215,0,.3)",
            borderRadius: 14, padding: "7px 10px", marginBottom: 8,
          }}>
            {slots.map((id, i) => {
              const b = BEARS.find(x => x.id === id);
              return (
                <div key={i} onClick={() => !won && setActive(i)} style={{
                  width: 38, height: 38, borderRadius: "50%", cursor: "pointer",
                  background: b ? b.color : "rgba(255,255,255,.07)",
                  border: i === active ? "2.5px solid #FFD700" : "2px dashed rgba(255,255,255,.25)",
                  boxShadow: i === active ? "0 0 0 3px rgba(255,215,0,.2)" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                  transition: "all .12s",
                }}>{b ? b.emoji : ""}</div>
              );
            })}
            <button onClick={check} style={{
              marginLeft: "auto", border: "none", borderRadius: 20, padding: "6px 14px",
              background: slots.every(Boolean) ? "linear-gradient(135deg,#FFD700,#FF8C00)" : "rgba(255,255,255,.08)",
              color: slots.every(Boolean) ? "#111" : "#555",
              fontFamily: "'Fredoka One', cursive", fontSize: 14,
              cursor: slots.every(Boolean) ? "pointer" : "default",
            }}>Check →</button>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 4,
            background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 12, padding: "7px 8px",
          }}>
            {BEARS.map(b => (
              <div key={b.id} onClick={() => pick(b.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer" }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", background: b.color,
                  border: picked === b.id ? "3px solid #FFD700" : "2px solid rgba(255,255,255,.15)",
                  boxShadow: picked === b.id ? "0 0 10px rgba(255,215,0,.55)" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                  transition: "all .12s",
                }}>{b.emoji}</div>
                <span style={{ fontSize: 9, fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: picked === b.id ? "#FFD700" : "rgba(255,255,255,.35)" }}>{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
