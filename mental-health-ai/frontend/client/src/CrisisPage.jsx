import { useState, useEffect } from "react";
import "./App.css";

/* ── Breathing Orb ────────────────────────────────────────── */
function BreathingOrb() {
  const [phase, setPhase] = useState("inhale");
  const [count, setCount] = useState(4);

  useEffect(() => {
    let timer, countdown;
    const run = (p) => {
      setPhase(p);
      const duration = p === "inhale" ? 4000 : 6000;
      let c = Math.round(duration / 1000);
      setCount(c);
      countdown = setInterval(() => { c -= 1; if (c >= 0) setCount(c); }, 1000);
      timer = setTimeout(() => { clearInterval(countdown); run(p === "inhale" ? "exhale" : "inhale"); }, duration);
    };
    run("inhale");
    return () => { clearTimeout(timer); clearInterval(countdown); };
  }, []);

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, padding:"20px 0" }}>
      <div style={{ position:"relative", width:150, height:150, display:"flex", alignItems:"center", justifyContent:"center" }}>
        {/* Soft glow ring */}
        <div style={{
          position:"absolute", inset:-12, borderRadius:"50%",
          background: "radial-gradient(circle, rgba(99,102,241,.1) 0%, transparent 70%)",
          animation: phase==="inhale" ? "cRingGrow 4s ease-in-out forwards" : "cRingShrink 6s ease-in-out forwards",
        }}/>
        {/* Orb */}
        <div style={{
          width:110, height:110, borderRadius:"50%",
          background: "linear-gradient(135deg, rgba(255,255,255,.95) 0%, rgba(220,225,255,.8) 100%)",
          border: "1.5px solid rgba(99,102,241,.25)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 40px rgba(99,102,241,.2), inset 0 1px 0 rgba(255,255,255,.9)",
          display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column",
          animation: phase==="inhale" ? "cOrbGrow 4s ease-in-out forwards" : "cOrbShrink 6s ease-in-out forwards",
        }}>
          <span style={{ fontSize:26, fontWeight:800, color:"var(--accent)", lineHeight:1, fontFamily:"'Figtree',sans-serif" }}>{count}</span>
        </div>
      </div>
      <p style={{
        fontSize:13, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase",
        color: "var(--accent)", fontFamily:"'Figtree',sans-serif", margin:0,
        opacity: phase==="inhale" ? 1 : 0.6, transition:"opacity 1s",
      }}>
        {phase === "inhale" ? "Breathe in slowly…" : "Breathe out…"}
      </p>
      <style>{`
        @keyframes cOrbGrow   { from{transform:scale(.82)} to{transform:scale(1.06)} }
        @keyframes cOrbShrink { from{transform:scale(1.06)} to{transform:scale(.82)} }
        @keyframes cRingGrow  { from{transform:scale(.7);opacity:0} to{transform:scale(1.4);opacity:1} }
        @keyframes cRingShrink{ from{transform:scale(1.4);opacity:1} to{transform:scale(.7);opacity:0} }
      `}</style>
    </div>
  );
}

/* ── 5-4-3-2-1 Grounding ──────────────────────────────────── */
function GroundingExercise() {
  const steps = [
    { n:5, sense:"SEE",   icon:"👁️",  color:"#6366f1", bg:"rgba(99,102,241,.08)",  border:"rgba(99,102,241,.2)",  q:"Name 5 things you can see right now" },
    { n:4, sense:"TOUCH", icon:"🤲",  color:"#10b981", bg:"rgba(16,185,129,.08)",  border:"rgba(16,185,129,.2)",  q:"Name 4 things you can physically feel" },
    { n:3, sense:"HEAR",  icon:"👂",  color:"#f59e0b", bg:"rgba(245,158,11,.08)",  border:"rgba(245,158,11,.2)",  q:"Name 3 things you can hear" },
    { n:2, sense:"SMELL", icon:"🌿",  color:"#ec4899", bg:"rgba(236,72,153,.08)",  border:"rgba(236,72,153,.2)",  q:"Name 2 things you can smell" },
    { n:1, sense:"TASTE", icon:"🍃",  color:"#8b5cf6", bg:"rgba(139,92,246,.08)",  border:"rgba(139,92,246,.2)",  q:"Name 1 thing you can taste" },
  ];
  const [active, setActive] = useState(0);
  const [done,   setDone]   = useState(new Set());

  const markDone = (i) => {
    setDone(d => new Set([...d, i]));
    if (i < steps.length - 1) setActive(i + 1);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {steps.map((step, i) => {
        const isDone   = done.has(i);
        const isActive = active === i && !isDone;
        return (
          <div key={i} onClick={() => !isDone && setActive(i)} style={{
            borderRadius:14, padding:"12px 16px",
            background: isDone ? "rgba(16,185,129,.06)" : isActive ? step.bg : "rgba(255,255,255,.5)",
            border: isDone ? "1px solid rgba(16,185,129,.2)" : isActive ? `1.5px solid ${step.border}` : "1px solid rgba(255,255,255,.8)",
            backdropFilter:"blur(10px)",
            cursor: isDone ? "default" : "pointer",
            transition:"all .25s",
            boxShadow: isActive ? `0 4px 16px ${step.color}18` : "0 2px 8px rgba(0,0,0,.04)",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{
                width:36, height:36, borderRadius:10, flexShrink:0,
                background: isDone ? "rgba(16,185,129,.12)" : step.bg,
                border: `1px solid ${isDone ? "rgba(16,185,129,.25)" : step.border}`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:17,
              }}>{isDone ? "✓" : step.icon}</div>
              <div style={{ flex:1 }}>
                <span style={{
                  fontSize:10, fontWeight:800, letterSpacing:"0.12em",
                  color: isDone ? "#10b981" : step.color, fontFamily:"'Figtree',sans-serif",
                  display:"block", marginBottom:2,
                }}>{step.n} — {step.sense}</span>
                <p style={{
                  fontSize:13, color: isDone ? "var(--text-soft)" : "var(--text)",
                  margin:0, fontFamily:"'Figtree',sans-serif", lineHeight:1.4,
                  textDecoration: isDone ? "line-through" : "none",
                }}>{step.q}</p>
              </div>
              {isActive && (
                <button onClick={(e) => { e.stopPropagation(); markDone(i); }} style={{
                  padding:"6px 14px", borderRadius:99, border:"none", cursor:"pointer",
                  background: step.color, color:"#fff", fontSize:11, fontWeight:700,
                  fontFamily:"'Figtree',sans-serif", flexShrink:0,
                  boxShadow:`0 3px 10px ${step.color}40`,
                }}>Done ✓</button>
              )}
            </div>
          </div>
        );
      })}
      {done.size === steps.length && (
        <div style={{
          textAlign:"center", padding:"14px 16px", borderRadius:14, marginTop:4,
          background:"rgba(16,185,129,.08)", border:"1px solid rgba(16,185,129,.25)",
          animation:"cFadeUp .5s ease",
        }}>
          <p style={{ fontSize:14, color:"#10b981", fontWeight:700, fontFamily:"'Figtree',sans-serif", margin:0 }}>
            ✦ You grounded yourself. That took real courage.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Helpline Card ────────────────────────────────────────── */
function HelplineCard({ name, number, desc, color, flag }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(number); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div style={{
      borderRadius:16, padding:"16px 18px",
      background:"rgba(255,255,255,.65)", backdropFilter:"blur(14px)",
      border:"1px solid rgba(255,255,255,.9)",
      boxShadow:"0 2px 12px rgba(0,0,0,.05)",
      display:"flex", alignItems:"center", gap:12,
      transition:"box-shadow .2s, transform .2s",
    }}
    onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 6px 24px ${color}20`;e.currentTarget.style.transform="translateY(-1px)";}}
    onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,.05)";e.currentTarget.style.transform="translateY(0)";}}>
      <div style={{
        width:42, height:42, borderRadius:12, flexShrink:0,
        background:`${color}12`, border:`1px solid ${color}30`,
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:22,
      }}>{flag}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:13, fontWeight:700, color:"var(--text)", fontFamily:"'Figtree',sans-serif", margin:"0 0 2px" }}>{name}</p>
        <p style={{ fontSize:11, color:"var(--text-soft)", fontFamily:"'Figtree',sans-serif", margin:0 }}>{desc}</p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5 }}>
        <a href={`tel:${number.replace(/[\s-]/g,"")}`} style={{
          fontSize:15, fontWeight:800, color, fontFamily:"'Figtree',sans-serif",
          textDecoration:"none", letterSpacing:"0.02em",
        }}>{number}</a>
        <button onClick={copy} style={{
          background:`${color}12`, border:`1px solid ${color}30`,
          borderRadius:99, padding:"2px 10px", fontSize:10, fontWeight:700,
          color: copied ? "#10b981" : color, cursor:"pointer",
          fontFamily:"'Figtree',sans-serif", transition:"all .2s",
        }}>{copied ? "Copied ✓" : "Copy"}</button>
      </div>
    </div>
  );
}

/* ── Main Crisis Page ─────────────────────────────────────── */
export default function CrisisPage({ onClose, onStartChat }) {
  const [tab, setTab] = useState("breathe");

  const helplines = [
    { name:"iCall",               number:"9152987821",   desc:"Mon–Sat, 8am–10pm • Free & confidential",    color:"#6366f1", flag:"🇮🇳" },
    { name:"Vandrevala Foundation",number:"1860-2662-345",desc:"24/7 • All languages • Free",               color:"#10b981", flag:"🇮🇳" },
    { name:"AASRA",               number:"9820466627",   desc:"24/7 crisis support",                        color:"#ec4899", flag:"🇮🇳" },
    { name:"Snehi",               number:"044-24640050", desc:"Mon–Sat, 8am–10pm",                          color:"#f59e0b", flag:"🇮🇳" },
  ];

  const tabs = [
    { id:"breathe", icon:"🌊", label:"Breathe"   },
    { id:"ground",  icon:"🌿", label:"Ground"    },
    { id:"help",    icon:"📞", label:"Get Help"  },
  ];

  return (
    <div style={{ position:"fixed", inset:0, zIndex:100, overflowY:"auto", overflowX:"hidden", fontFamily:"'Figtree',sans-serif" }}>
      {/* Same background as the rest of the site */}
      <div className="bg-base"/>
      <div className="bg-grad g1"/>
      <div className="bg-grad g2"/>
      <div className="bg-grad g3"/>

      {/* Nav — matches site nav exactly */}
      <nav className="nav" style={{ position:"relative", zIndex:20 }}>
        <div className="nav-logo">
          <span className="logo-mark">M</span>
          <span>MindSpace</span>
        </div>
        <ul className="nav-links">
          <li><a href="#">Home</a></li>
          <li><a href="#">Features</a></li>
          <li><a href="#">Research</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
        <div style={{ marginLeft:"auto" }}>
          <button onClick={onClose} className="nav-history-btn">← Back</button>
        </div>
      </nav>

      <div style={{ position:"relative", zIndex:1, maxWidth:740, margin:"0 auto", padding:"0 24px 80px" }}>

        {/* Hero header */}
        <div style={{ textAlign:"center", padding:"32px 0 36px", animation:"cFadeUp .6s ease both" }}>
          {/* Soft badge */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(255,255,255,.7)", backdropFilter:"blur(12px)",
            border:"1px solid rgba(255,255,255,.9)", borderRadius:99,
            padding:"6px 16px", marginBottom:20,
            boxShadow:"0 2px 12px rgba(0,0,0,.06)",
          }}>
            <span style={{ fontSize:14 }}>🤍</span>
            <span style={{ fontSize:11, fontWeight:800, letterSpacing:"0.12em", color:"var(--accent)" }}>SAFE SPACE · CRISIS SUPPORT</span>
          </div>

          <h1 style={{
            fontSize:"clamp(1.9rem,4.5vw,2.8rem)", fontWeight:800,
            color:"var(--text)", letterSpacing:"-0.03em", lineHeight:1.15, margin:"0 0 14px",
          }}>
            You reached out.<br/>
            <span style={{ color:"var(--accent)" }}>That took strength.</span>
          </h1>
          <p style={{
            fontSize:15, color:"var(--text-soft)", lineHeight:1.75,
            maxWidth:460, margin:"0 auto",
          }}>
            You are not alone right now. Take a breath with us —
            we'll get through this moment together.
          </p>
        </div>

        {/* Emergency banner */}
        <div style={{
          borderRadius:20, padding:"16px 20px", marginBottom:28,
          background:"rgba(255,255,255,.65)", backdropFilter:"blur(16px)",
          border:"1.5px solid rgba(239,68,68,.2)",
          boxShadow:"0 4px 20px rgba(239,68,68,.08)",
          display:"flex", alignItems:"center", gap:14,
          animation:"cFadeUp .6s .1s ease both",
        }}>
          <div style={{
            width:44, height:44, borderRadius:12, flexShrink:0,
            background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.2)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
          }}>🚨</div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:13, fontWeight:700, color:"#dc2626", margin:"0 0 3px" }}>
              If you are in immediate danger
            </p>
            <p style={{ fontSize:12, color:"var(--text-soft)", margin:0 }}>
              Call <strong style={{color:"#dc2626"}}>112</strong> (India emergency) or go to your nearest hospital immediately.
            </p>
          </div>
          <a href="tel:112" style={{
            padding:"10px 22px", borderRadius:99,
            background:"#ef4444", color:"#fff",
            fontSize:13, fontWeight:800, textDecoration:"none",
            fontFamily:"'Figtree',sans-serif", flexShrink:0,
            boxShadow:"0 4px 14px rgba(239,68,68,.3)",
          }}>Call 112</a>
        </div>

        {/* Tab switcher */}
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:20,
          animation:"cFadeUp .6s .2s ease both",
        }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:"14px 8px", borderRadius:16, border:"none", cursor:"pointer",
              background: tab===t.id
                ? "rgba(255,255,255,.85)"
                : "rgba(255,255,255,.45)",
              backdropFilter:"blur(14px)",
              border: tab===t.id
                ? "1.5px solid rgba(99,102,241,.25)"
                : "1px solid rgba(255,255,255,.8)",
              boxShadow: tab===t.id
                ? "0 4px 20px rgba(99,102,241,.12)"
                : "0 2px 8px rgba(0,0,0,.04)",
              transition:"all .2s",
              fontFamily:"'Figtree',sans-serif",
            }}>
              <div style={{ fontSize:20, marginBottom:4 }}>{t.icon}</div>
              <div style={{
                fontSize:12, fontWeight: tab===t.id ? 800 : 600,
                color: tab===t.id ? "var(--accent)" : "var(--text-soft)",
                letterSpacing:"0.04em",
              }}>{t.label}</div>
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div key={tab} style={{ animation:"cFadeUp .35s ease both" }}>

          {/* BREATHE */}
          {tab === "breathe" && (
            <div style={{
              borderRadius:24, padding:"28px 24px",
              background:"rgba(255,255,255,.65)", backdropFilter:"blur(16px)",
              border:"1px solid rgba(255,255,255,.9)",
              boxShadow:"0 4px 24px rgba(0,0,0,.06)",
              textAlign:"center",
            }}>
              <p style={{ fontSize:10, fontWeight:800, letterSpacing:"0.15em", color:"var(--accent)", textTransform:"uppercase", marginBottom:6 }}>BOX BREATHING</p>
              <p style={{ fontSize:14, color:"var(--text-soft)", margin:"0 0 4px", lineHeight:1.6 }}>
                Follow the orb. Let it guide your breath.
              </p>
              <BreathingOrb/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:16, textAlign:"left" }}>
                {[
                  { icon:"🧠", title:"Why it works",    text:"Slow breathing activates your parasympathetic nervous system, reducing cortisol and calming your heart rate in minutes." },
                  { icon:"⏱️", title:"How long",         text:"3–5 full cycles is enough to noticeably shift your nervous system out of fight-or-flight mode." },
                ].map(c => (
                  <div key={c.title} style={{
                    borderRadius:14, padding:"14px 16px",
                    background:"rgba(255,255,255,.5)", border:"1px solid rgba(255,255,255,.9)",
                  }}>
                    <p style={{ fontSize:12, fontWeight:700, color:"var(--text)", margin:"0 0 5px" }}>{c.icon} {c.title}</p>
                    <p style={{ fontSize:12, color:"var(--text-soft)", margin:0, lineHeight:1.5 }}>{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GROUND */}
          {tab === "ground" && (
            <div style={{
              borderRadius:24, padding:"24px",
              background:"rgba(255,255,255,.65)", backdropFilter:"blur(16px)",
              border:"1px solid rgba(255,255,255,.9)",
              boxShadow:"0 4px 24px rgba(0,0,0,.06)",
            }}>
              <p style={{ fontSize:10, fontWeight:800, letterSpacing:"0.15em", color:"var(--accent)", textTransform:"uppercase", margin:"0 0 6px" }}>5-4-3-2-1 GROUNDING</p>
              <p style={{ fontSize:14, color:"var(--text-soft)", margin:"0 0 20px", lineHeight:1.6 }}>
                This technique brings your mind back to the present moment. Work through each sense at your own pace.
              </p>
              <GroundingExercise/>
            </div>
          )}

          {/* HELP */}
          {tab === "help" && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{
                borderRadius:18, padding:"14px 18px", marginBottom:4,
                background:"rgba(255,255,255,.65)", backdropFilter:"blur(14px)",
                border:"1px solid rgba(99,102,241,.15)",
                boxShadow:"0 2px 12px rgba(0,0,0,.04)",
              }}>
                <p style={{ fontSize:13, color:"var(--text-soft)", margin:0, lineHeight:1.7 }}>
                  These are real people trained to listen. You don't need to be in crisis to call —
                  feeling overwhelmed is more than enough.{" "}
                  <strong style={{color:"var(--text)"}}>All calls are confidential.</strong>
                </p>
              </div>
              {helplines.map(h => <HelplineCard key={h.name} {...h}/>)}
              <div style={{
                borderRadius:16, padding:"14px 18px", marginTop:4, textAlign:"center",
                background:"rgba(255,255,255,.5)", border:"1px solid rgba(255,255,255,.8)",
              }}>
                <p style={{ fontSize:12, color:"var(--text-soft)", margin:0, lineHeight:1.6 }}>
                  Not in India? Search <strong style={{color:"var(--text)"}}>
                  "crisis helpline [your country]"</strong> for local support.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom comfort card */}
        <div style={{
          marginTop:28, borderRadius:24, padding:"28px 32px",
          background:"rgba(255,255,255,.65)", backdropFilter:"blur(16px)",
          border:"1px solid rgba(255,255,255,.9)",
          boxShadow:"0 4px 24px rgba(0,0,0,.06)",
          animation:"cFadeUp .6s .35s ease both",
        }}>
          <p style={{
            fontSize:"1.05rem", lineHeight:1.85, color:"var(--text-soft)",
            margin:"0 0 22px", fontStyle:"italic",
            borderLeft:"3px solid rgba(99,102,241,.25)", paddingLeft:16,
          }}>
            "What you're feeling right now is temporary. Pain this intense does not last forever.
            You have survived hard things before — and you are not alone in this one."
          </p>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <button onClick={onStartChat} style={{
              padding:"12px 26px", borderRadius:99,
              background:"var(--text)", color:"#fff",
              border:"none", cursor:"pointer", fontFamily:"'Figtree',sans-serif",
              fontSize:13, fontWeight:700,
              boxShadow:"0 4px 16px rgba(28,28,46,.2)",
            }}>💬 Talk to MindSpace AI</button>
            <button onClick={() => setTab("breathe")} style={{
              padding:"12px 22px", borderRadius:99, cursor:"pointer",
              background:"rgba(99,102,241,.08)", border:"1.5px solid rgba(99,102,241,.2)",
              color:"var(--accent)", fontSize:13, fontWeight:600,
              fontFamily:"'Figtree',sans-serif",
            }}>🌊 Try breathing exercise</button>
            <button onClick={onClose} style={{
              padding:"12px 22px", borderRadius:99, cursor:"pointer",
              background:"rgba(255,255,255,.6)", border:"1px solid rgba(0,0,0,.08)",
              color:"var(--text-soft)", fontSize:13, fontWeight:600,
              fontFamily:"'Figtree',sans-serif",
            }}>← Back to home</button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
