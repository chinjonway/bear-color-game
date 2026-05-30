import { useState, useRef, useEffect } from "react";

const BEARS = [
  { id: "honey",   color: "#D4860A", name: "Honey",   emoji: "🐻" },
  { id: "polar",   color: "#B0CFD8", name: "Polar",   emoji: "🐻‍❄️" },
  { id: "panda",   color: "#2C2C2C", name: "Panda",   emoji: "🐼" },
  { id: "grizzly", color: "#7B4F2E", name: "Grizzly", emoji: "🐻" },
  { id: "red",     color: "#C0392B", name: "Red",     emoji: "🦊" },
  { id: "blue",    color: "#2471A3", name: "Blue",    emoji: "💙" },
];
const SLOTS = 4;

function newSecret() {
  return Array.from({ length: SLOTS }, () => BEARS[Math.floor(Math.random() * BEARS.length)].id);
}

// ── RENAMED to BearV9 so cache cannot reuse old component ──
export default function BearV9() {
  const [secret, setSecret]   = useState(newSecret);
  const [guesses, setGuesses] = useState([]);
  const [slots, setSlots]     = useState(Array(SLOTS).fill(null));
  const [active, setActive]   = useState(0);
  const [won, setWon]         = useState(false);
  const [picked, setPicked]   = useState(null);
  const [shake, setShake]     = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [guesses.length]);

  function pick(id) {
    if (won) return;
    const s = [...slots];
    s[active] = id;
    setSlots(s);
    setPicked(id);
    let next = s.findIndex((v, i) => i > active && !v);
    if (next === -1) next = s.findIndex((v, i) => i < active && !v);
    if (next !== -1) setActive(next);
  }

  function check() {
    if (won) return;
    if (slots.some(v => !v)) { setShake(true); setTimeout(() => setShake(false), 400); return; }
    const score = slots.filter((id, i) => id === secret[i]).length;
    setGuesses(g => [...g, { slots: [...slots], score }]);
    if (score === SLOTS) { setWon(true); return; }
    setSlots(Array(SLOTS).fill(null));
    setActive(0);
    setPicked(null);
  }

  function reset() {
    setSecret(newSecret());
    setGuesses([]);
    setSlots(Array(SLOTS).fill(null));
    setActive(0);
    setWon(false);
    setPicked(null);
    setShake(false);
  }

  const counts = BEARS
    .map(b => ({ ...b, n: secret.filter(id => id === b.id).length }))
    .filter(b => b.n > 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700&display=swap');
        html, body { margin:0; padding:0; background:#0f1623; }
        .pop { animation:pop .18s ease; }
        @keyframes pop { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        .sk  { animation:sk .35s ease; }
        @keyframes sk  { 0%,100%{transform:translateX(0)} 30%{transform:translateX(-5px)} 70%{transform:translateX(5px)} }
      `}</style>

      {/* ── FIXED BOTTOM PANEL ── */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:999,
        background:"#0f1623", borderTop:"1px solid rgba(255,255,255,.09)",
        padding:"8px 12px 18px", fontFamily:"'Fredoka One',cursive",
      }}>
        {/* 4 slots + Check button */}
        <div className={shake ? "sk" : ""} style={{
          display:"flex", alignItems:"center", gap:6,
          background:"rgba(255,215,0,.07)", border:"1px solid rgba(255,215,0,.3)",
          borderRadius:14, padding:"7px 10px", marginBottom:8,
        }}>
          {slots.map((id, i) => {
            const b = BEARS.find(x => x.id === id);
            return (
              <div key={i} onClick={() => !won && setActive(i)} style={{
                width:38, height:38, borderRadius:"50%", cursor:"pointer",
                background: b ? b.color : "rgba(255,255,255,.07)",
                border: i===active ? "2.5px solid #FFD700" : "2px dashed rgba(255,255,255,.25)",
                boxShadow: i===active ? "0 0 0 3px rgba(255,215,0,.2)" : "none",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
                transition:"all .12s",
              }}>{b ? b.emoji : ""}</div>
            );
          })}
          <button onClick={check} style={{
            marginLeft:"auto", border:"none", borderRadius:20, padding:"6px 14px",
            background: slots.every(Boolean) ? "linear-gradient(135deg,#FFD700,#FF8C00)" : "rgba(255,255,255,.08)",
            color: slots.every(Boolean) ? "#111" : "#555",
            fontFamily:"'Fredoka One',cursive", fontSize:14,
            cursor: slots.every(Boolean) ? "pointer" : "default",
          }}>Check →</button>
        </div>

        {/* Bear palette */}
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:4,
          background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)",
          borderRadius:12, padding:"7px 8px", marginBottom:8,
        }}>
          {BEARS.map(b => (
            <div key={b.id} onClick={() => pick(b.id)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, cursor:"pointer" }}>
              <div style={{
                width:38, height:38, borderRadius:"50%", background:b.color,
                border: picked===b.id ? "3px solid #FFD700" : "2px solid rgba(255,255,255,.15)",
                boxShadow: picked===b.id ? "0 0 10px rgba(255,215,0,.55)" : "none",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
                transition:"all .12s",
              }}>{b.emoji}</div>
              <span style={{ fontSize:9, fontFamily:"'Nunito',sans-serif", fontWeight:700, color: picked===b.id ? "#FFD700" : "rgba(255,255,255,.35)" }}>{b.name}</span>
            </div>
          ))}
        </div>

        {/* New game */}
        <div style={{ textAlign:"center" }}>
          <button onClick={reset} style={{
            background:"transparent", border:"1px solid rgba(255,255,255,.18)",
            borderRadius:20, padding:"4px 20px", color:"rgba(255,255,255,.4)",
            fontFamily:"'Fredoka One',cursive", fontSize:12, cursor:"pointer",
          }}>🔄 New Game</button>
        </div>
      </div>

      {/* ── SCROLLABLE TOP AREA ── */}
      <div style={{ paddingBottom:230, fontFamily:"'Fredoka One',cursive", color:"#fff" }}>

        {/* Header */}
        <div style={{ textAlign:"center", padding:"16px 12px 10px" }}>
          <div style={{ fontSize:30 }}>🐻</div>
          <div style={{ fontSize:22, color:"#FFD700", textShadow:"0 0 20px rgba(255,215,0,.35)" }}>Bear Colour Quest</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", fontFamily:"'Nunito',sans-serif", marginTop:2 }}>
            Guess the 4-bear sequence · unlimited tries
          </div>
        </div>

        {/* Bear count hints */}
        <div style={{
          display:"flex", gap:6, flexWrap:"wrap", justifyContent:"center",
          background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)",
          borderRadius:12, padding:"6px 10px", margin:"0 12px 12px",
        }}>
          {counts.map(b => (
            <div key={b.id} style={{ display:"flex", alignItems:"center", gap:4, background:"rgba(255,255,255,.07)", borderRadius:20, padding:"2px 8px 2px 3px" }}>
              <div style={{ width:20, height:20, borderRadius:"50%", background:b.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>{b.emoji}</div>
              <span style={{ fontSize:12, fontFamily:"'Nunito',sans-serif", fontWeight:700 }}>×{b.n}</span>
            </div>
          ))}
        </div>

        {/* Past guesses — ONLY renders rows that have been submitted */}
        <div style={{ display:"flex", flexDirection:"column", gap:5, padding:"0 12px" }}>
          {guesses.map((g, i) => (
            <div key={i} ref={i===guesses.length-1 ? endRef : null} className="pop" style={{
              display:"flex", alignItems:"center", gap:8,
              padding:"6px 10px", borderRadius:12,
              background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)",
            }}>
              <div style={{ display:"flex", gap:6 }}>
                {g.slots.map((id, j) => {
                  const b = BEARS.find(x => x.id === id);
                  return <div key={j} style={{ width:32, height:32, borderRadius:"50%", background:b.color, border:"2px solid rgba(255,255,255,.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{b.emoji}</div>;
                })}
              </div>
              <div style={{ marginLeft:"auto",
                background: g.score===SLOTS ? "linear-gradient(135deg,#FFD700,#FF8C00)" : g.score>0 ? "linear-gradient(135deg,#2ecc71,#27ae60)" : "rgba(255,255,255,.1)",
                borderRadius:20, padding:"3px 12px", fontSize:15, fontWeight:700,
                color: g.score>0 ? "#fff" : "#555",
              }}>{g.score} ✓</div>
            </div>
          ))}
        </div>

        {/* Win banner */}
        {won && (
          <div style={{ margin:"10px 12px 0", background:"rgba(255,215,0,.12)", border:"1px solid rgba(255,215,0,.35)", borderRadius:14, padding:"10px 14px", textAlign:"center" }}>
            <div style={{ fontSize:17, color:"#FFD700", marginBottom:6 }}>🎉 Cracked in {guesses.length} {guesses.length===1?"try":"tries"}!</div>
            <div style={{ display:"flex", gap:7, justifyContent:"center" }}>
              {secret.map((id,i) => { const b=BEARS.find(x=>x.id===id); return <div key={i} style={{ width:30, height:30, borderRadius:"50%", background:b.color, border:"2px solid rgba(255,215,0,.5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{b.emoji}</div>; })}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
