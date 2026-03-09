import { useState, useRef } from "react";
import "./App.css";

/* ── TAT Scenes ─────────────────────────────────────────── */
const SCENES = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=800&q=80",
    alt: "Person standing alone at cliff edge overlooking vast landscape",
    prompt: "Look at this scene. Tell a story — who is this person, what brought them here, what are they thinking and feeling right now, and what happens next?",
    theme: "solitude & reflection",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
    alt: "Two people sitting together but facing away",
    prompt: "Describe what's happening between these two people. What is their relationship? What led to this moment? What are they each feeling, and what will they do?",
    theme: "relationships & connection",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80",
    alt: "Stormy sea with dark clouds and rough waves",
    prompt: "You are looking at this scene. Tell a story — is there someone here? What do the waves mean to them? What led to this moment and what happens next?",
    theme: "emotional turbulence",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80",
    alt: "A path through a dense misty forest",
    prompt: "Someone is walking through this forest. Who are they? Where are they going? What are they feeling as they walk deeper in, and what will they find?",
    theme: "journey & uncertainty",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    alt: "Person sitting alone watching a sunrise over water",
    prompt: "Tell a story about this person. What are they thinking about? What happened before this moment that brought them here, and what will they carry forward?",
    theme: "hope & new beginnings",
  },
];

const MIN_WORDS = 30;

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/* ── Small helpers ─────────────────────────────────────────── */
function tx(size, weight, color, spacing, lineH, align) {
  return {
    fontSize: size, fontWeight: weight, color,
    letterSpacing: spacing || undefined,
    lineHeight: lineH || 1, textAlign: align || "left", margin: 0,
  };
}

/* ── Progress bar ─────────────────────────────────────────── */
function ProgressBar({ current, total }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={tx(11,600,"#aaa","0.1em")}>SCENE {current} OF {total}</span>
        <span style={tx(11,600,"var(--accent)")}>
          {Math.round((current/total)*100)}% complete
        </span>
      </div>
      <div style={{ height:4, borderRadius:99, background:"rgba(0,0,0,.08)", overflow:"hidden" }}>
        <div style={{
          height:"100%", borderRadius:99,
          background:"linear-gradient(90deg,#a78bfa,#6366f1)",
          width:`${(current/total)*100}%`,
          transition:"width 0.6s cubic-bezier(.4,0,.2,1)",
        }}/>
      </div>
    </div>
  );
}

/* ── Trait pill ───────────────────────────────────────────── */
function TraitPill({ label, value, color }) {
  return (
    <div style={{
      background:"rgba(255,255,255,.6)", borderRadius:14,
      padding:"12px 14px", border:"1px solid rgba(255,255,255,.9)",
      boxShadow:"0 2px 8px rgba(0,0,0,.05)",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={tx(12,700,"#374151")}>{label}</span>
        <span style={tx(12,800,color)}>{value}%</span>
      </div>
      <div style={{ height:6, borderRadius:99, background:"rgba(0,0,0,.07)" }}>
        <div style={{
          height:"100%", borderRadius:99,
          background:`linear-gradient(90deg,${color}88,${color})`,
          width:`${value}%`,
          transition:"width 1.2s cubic-bezier(.4,0,.2,1) 0.3s",
        }}/>
      </div>
    </div>
  );
}

/* ── Scene card ───────────────────────────────────────────── */
function SceneCard({ scene, story, onChange, onNext, isLast }) {
  const wc     = wordCount(story);
  const tooShort = wc < MIN_WORDS;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* Image */}
      <div style={{
        borderRadius:20, overflow:"hidden",
        boxShadow:"0 8px 32px rgba(0,0,0,.15)",
        position:"relative", aspectRatio:"16/7",
      }}>
        <img src={scene.url} alt={scene.alt}
          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
        />
        <div style={{
          position:"absolute", inset:0,
          background:"linear-gradient(to top,rgba(0,0,0,.45) 0%,transparent 55%)",
        }}/>
        <div style={{
          position:"absolute", bottom:14, left:16,
          background:"rgba(0,0,0,.45)", backdropFilter:"blur(8px)",
          borderRadius:99, padding:"4px 12px",
        }}>
          <span style={tx(10,700,"rgba(255,255,255,.85)","0.1em")}>{scene.theme.toUpperCase()}</span>
        </div>
      </div>

      {/* Prompt */}
      <div style={{
        background:"rgba(99,102,241,.06)", borderRadius:14,
        border:"1px solid rgba(99,102,241,.15)", padding:"14px 16px",
      }}>
        <p style={tx(13,500,"#374151",0,1.65)}>{scene.prompt}</p>
      </div>

      {/* Textarea */}
      <div style={{ position:"relative" }}>
        <textarea
          value={story}
          onChange={e => onChange(e.target.value)}
          placeholder="Start writing your story… there are no right or wrong answers. Just let your imagination flow freely."
          rows={6}
          autoFocus
          style={{
            width:"100%", padding:"16px", borderRadius:16, boxSizing:"border-box",
            background:"rgba(255,255,255,.78)", backdropFilter:"blur(12px)",
            border:"1.5px solid rgba(255,255,255,.9)",
            boxShadow:"0 2px 12px rgba(0,0,0,.06)",
            fontFamily:"'Figtree',sans-serif", fontSize:14,
            color:"var(--text)", resize:"vertical", outline:"none", lineHeight:1.7,
          }}
          onFocus={e=>e.target.style.borderColor="rgba(99,102,241,.4)"}
          onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.9)"}
        />
        <span style={{
          position:"absolute", bottom:10, right:14,
          ...tx(11,600, tooShort && story.trim() ? "#e9a825" : "#b0b0c0"),
        }}>
          {wc} / {MIN_WORDS} words
        </span>
      </div>

      {tooShort && story.trim() && (
        <p style={tx(11,500,"#d97706",0,1.5,"center")}>
          Write at least {MIN_WORDS} words for a meaningful analysis — {MIN_WORDS - wc} more to go
        </p>
      )}

      <button
        onClick={onNext}
        disabled={tooShort}
        style={{
          padding:"14px", borderRadius:99, border:"none",
          background: tooShort
            ? "rgba(0,0,0,.08)"
            : "linear-gradient(135deg,#6366f1,#8b5cf6)",
          color: tooShort ? "#bbb" : "#fff",
          fontFamily:"'Figtree',sans-serif", fontSize:14, fontWeight:700,
          cursor: tooShort ? "not-allowed" : "pointer",
          boxShadow: tooShort ? "none" : "0 6px 20px rgba(99,102,241,.35)",
          transition:"all .2s",
        }}
      >
        {isLast ? "✦ Analyse My Stories" : "Next Scene →"}
      </button>
    </div>
  );
}

/* ── Report view ──────────────────────────────────────────── */
function ReportView({ report, onRetake, onClose }) {
  const [tab, setTab] = useState("overview");
  const tabs = ["overview","traits","themes","growth"];
  const tabLabels = { overview:"Overview", traits:"Personality", themes:"Themes", growth:"Growth Areas" };

  return (
    <div style={{ animation:"fadeUp .5s ease" }}>

      {/* Header card */}
      <div style={{
        background:"linear-gradient(135deg,#1c1c2e,#2d2b55)",
        borderRadius:22, padding:"28px 28px 22px", marginBottom:20,
        position:"relative", overflow:"hidden",
      }}>
        <div style={{
          position:"absolute", top:-50, right:-50,
          width:200, height:200, borderRadius:"50%",
          background:"rgba(139,92,246,.25)", filter:"blur(50px)",
        }}/>
        <p style={tx(10,700,"rgba(255,255,255,.45)","0.15em")}>TAT ANALYSIS REPORT</p>
        <h2 style={{ fontSize:"clamp(1.3rem,2.5vw,1.8rem)", fontWeight:800, color:"#fff", margin:"8px 0 4px" }}>
          Your Psychological Profile
        </h2>
        <p style={tx(13,400,"rgba(255,255,255,.55)",0,1.5)}>
          Based on {SCENES.length} scene interpretations
        </p>

        {report.emotionalTone && (
          <div style={{ display:"flex", gap:8, marginTop:16, flexWrap:"wrap" }}>
            {Object.entries(report.emotionalTone).map(([tone, pct]) => (
              <div key={tone} style={{
                background:"rgba(255,255,255,.1)", borderRadius:99,
                padding:"4px 12px", backdropFilter:"blur(8px)",
              }}>
                <span style={tx(11,700,"#fff")}>{tone} </span>
                <span style={tx(11,400,"rgba(255,255,255,.55)")}>{pct}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        display:"flex", gap:4, background:"rgba(0,0,0,.05)",
        borderRadius:12, padding:4, marginBottom:20,
      }}>
        {tabs.map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{
            flex:1, padding:"8px 4px", border:"none", cursor:"pointer",
            borderRadius:10, fontFamily:"'Figtree',sans-serif",
            fontSize:12, fontWeight:600,
            background: tab===t ? "#fff" : "transparent",
            color: tab===t ? "var(--text)" : "var(--text-soft)",
            boxShadow: tab===t ? "0 1px 6px rgba(0,0,0,.1)" : "none",
            transition:"all .15s",
          }}>
            {tabLabels[t]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        background:"rgba(255,255,255,.7)", backdropFilter:"blur(16px)",
        border:"1px solid rgba(255,255,255,.9)", borderRadius:20,
        padding:"22px", boxShadow:"0 4px 20px rgba(0,0,0,.06)",
        marginBottom:20, minHeight:220,
        animation:"fadeUp .3s ease",
      }}>
        {tab === "overview" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <h3 style={tx(16,800,"var(--text)")}>Summary</h3>
            <p style={tx(14,400,"#374151",0,1.75)}>{report.summary}</p>
            {report.headline && (
              <div style={{
                background:"rgba(99,102,241,.07)", borderRadius:14,
                border:"1px solid rgba(99,102,241,.15)", padding:"14px 16px",
              }}>
                <p style={tx(13,600,"var(--accent)","0.01em",1.6)}>✦ {report.headline}</p>
              </div>
            )}
          </div>
        )}

        {tab === "traits" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <h3 style={{ ...tx(16,800,"var(--text)"), marginBottom:4 }}>Personality Traits</h3>
            {report.traits?.map((t,i) => (
              <TraitPill key={i} label={t.name} value={t.score} color={t.color}/>
            ))}
          </div>
        )}

        {tab === "themes" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <h3 style={{ ...tx(16,800,"var(--text)"), marginBottom:4 }}>Recurring Themes</h3>
            {report.themes?.map((th,i) => (
              <div key={i} style={{
                display:"flex", gap:12, alignItems:"flex-start",
                paddingBottom:14,
                borderBottom: i<report.themes.length-1 ? "1px solid rgba(0,0,0,.07)" : "none",
              }}>
                <div style={{
                  width:38, height:38, borderRadius:10, flexShrink:0,
                  background:(th.color||"#6366f1")+"22",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:18,
                }}>{th.icon}</div>
                <div>
                  <p style={tx(13,700,"var(--text)")}>{th.name}</p>
                  <p style={tx(12,400,"#6b7280",0,1.6)}>{th.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "growth" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <h3 style={{ ...tx(16,800,"var(--text)"), marginBottom:4 }}>Areas for Growth</h3>
            {report.growthAreas?.map((g,i) => (
              <div key={i} style={{
                display:"flex", gap:12, alignItems:"flex-start",
                background:"rgba(99,102,241,.04)", borderRadius:14,
                border:"1px solid rgba(99,102,241,.1)", padding:"14px",
              }}>
                <span style={{ fontSize:20, flexShrink:0 }}>{g.icon}</span>
                <div>
                  <p style={tx(13,700,"var(--text)")}>{g.area}</p>
                  <p style={tx(12,400,"#6b7280",0,1.6)}>{g.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div style={{
        background:"rgba(251,191,36,.08)", borderRadius:12,
        border:"1px solid rgba(251,191,36,.2)", padding:"12px 14px", marginBottom:20,
      }}>
        <p style={tx(11,500,"#92400e",0,1.5)}>
          ⚠️ This is an AI-assisted reflective exercise, not a clinical diagnosis. For professional support, please consult a licensed psychiatrist or psychologist.
        </p>
      </div>

      {/* Actions */}
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onRetake} style={{
          flex:1, padding:"12px", borderRadius:99,
          background:"rgba(0,0,0,.06)", border:"none",
          fontFamily:"'Figtree',sans-serif", fontSize:13, fontWeight:700,
          color:"var(--text-soft)", cursor:"pointer",
        }}>↺ Retake</button>
        <button onClick={onClose} style={{
          flex:2, padding:"12px", borderRadius:99,
          background:"var(--text)", border:"none", color:"#fff",
          fontFamily:"'Figtree',sans-serif", fontSize:13, fontWeight:700,
          cursor:"pointer", boxShadow:"0 4px 14px rgba(28,28,46,.25)",
        }}>← Back to MindSpace</button>
      </div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────── */
export default function TATPage({ onClose }) {
  const [phase,      setPhase]      = useState("intro");
  const [sceneIdx,   setSceneIdx]   = useState(0);
  const [stories,    setStories]    = useState(Array(SCENES.length).fill(""));
  const [report,     setReport]     = useState(null);
  const [error,      setError]      = useState("");
  const topRef = useRef(null);

  const scrollTop = () => setTimeout(() => topRef.current?.scrollIntoView({ behavior:"smooth" }), 50);

  const handleNext = () => {
    if (sceneIdx < SCENES.length - 1) {
      setSceneIdx(i => i + 1);
      scrollTop();
    } else {
      runAnalysis();
    }
  };

  const runAnalysis = async () => {
    setPhase("loading");
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/tat-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenes: SCENES.map((sc, i) => ({
            theme: sc.theme,
            story: stories[i] || "",
          })),
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Backend error response:", errText);
        throw new Error(`Backend returned ${res.status}: ${errText}`);
      }

      const parsed = await res.json();
      console.log("TAT response:", parsed);

      if (!parsed || !parsed.traits) {
        throw new Error("Backend returned unexpected data — check terminal logs");
      }

      setReport(parsed);
      setPhase("report");
      scrollTop();
    } catch (err) {
      console.error("TAT error:", err.message);
      setError(`Failed: ${err.message}`);
      setPhase("test");
    }
  };

  const handleRetake = () => {
    setStories(Array(SCENES.length).fill(""));
    setSceneIdx(0);
    setReport(null);
    setError("");
    setPhase("intro");
    scrollTop();
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:50,
      overflowY:"auto", overflowX:"hidden",
      fontFamily:"'Figtree',sans-serif",
    }}>
      <div className="bg-base"/>
      <div className="bg-grad g1"/>
      <div className="bg-grad g2"/>
      <div className="bg-grad g3"/>

      {/* Nav */}
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

      <div ref={topRef} style={{ position:"relative", zIndex:1, maxWidth:720, margin:"0 auto", padding:"20px 24px 60px" }}>

        {/* ── INTRO ── */}
        {phase === "intro" && (
          <div style={{
            background:"rgba(255,255,255,.72)", backdropFilter:"blur(20px) saturate(180%)",
            border:"1px solid rgba(255,255,255,.85)", borderRadius:24,
            padding:"32px 28px",
            boxShadow:"0 2px 0 rgba(255,255,255,.9) inset,0 20px 60px rgba(100,80,180,.1)",
            animation:"fadeUp .5s ease",
          }}>
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{
                width:64, height:64, borderRadius:18,
                background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
                display:"flex", alignItems:"center", justifyContent:"center",
                margin:"0 auto 16px", fontSize:28,
                boxShadow:"0 8px 24px rgba(99,102,241,.35)",
              }}>🧠</div>
              <h1 style={{ fontSize:"clamp(1.4rem,2.5vw,2rem)", fontWeight:800, color:"var(--text)", marginBottom:8 }}>
                Mental Check
              </h1>
              <p style={tx(14,400,"var(--text-soft)",0,1.65)}>
                A TAT-inspired reflective exercise. You'll see <strong>{SCENES.length} ambiguous scenes</strong> and write a short story for each. There are no right or wrong answers — your imagination reveals your inner world.
              </p>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
              {[
                { icon:"🖼️", label:"View a scene",          desc:"An ambiguous photograph is shown" },
                { icon:"✍️", label:"Write your story",      desc:`Minimum ${MIN_WORDS} words per scene` },
                { icon:"🔍", label:"AI analyses patterns",  desc:"Your language, themes and tone" },
                { icon:"📊", label:"Receive your report",   desc:"Traits, themes and growth areas" },
              ].map((step,i) => (
                <div key={i} style={{
                  display:"flex", gap:12, alignItems:"center",
                  background:"rgba(99,102,241,.04)", borderRadius:12,
                  border:"1px solid rgba(99,102,241,.1)", padding:"11px 14px",
                }}>
                  <span style={{ fontSize:20 }}>{step.icon}</span>
                  <div>
                    <p style={tx(13,700,"var(--text)")}>{step.label}</p>
                    <p style={tx(11,400,"var(--text-soft)")}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background:"rgba(251,191,36,.08)", borderRadius:12,
              border:"1px solid rgba(251,191,36,.2)", padding:"11px 14px", marginBottom:24,
            }}>
              <p style={tx(11,500,"#92400e",0,1.5)}>
                ⚠️ This is a reflective tool, not a clinical test. It does not replace professional mental health care.
              </p>
            </div>

            <button onClick={() => setPhase("test")} style={{
              width:"100%", padding:"14px", borderRadius:99, border:"none",
              background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
              color:"#fff", fontFamily:"'Figtree',sans-serif",
              fontSize:15, fontWeight:700, cursor:"pointer",
              boxShadow:"0 6px 20px rgba(99,102,241,.35)",
            }}>
              Begin the Test →
            </button>
          </div>
        )}

        {/* ── TEST ── */}
        {phase === "test" && (
          <div>
            <ProgressBar current={sceneIdx+1} total={SCENES.length}/>
            {error && (
              <div style={{
                background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)",
                borderRadius:12, padding:"10px 14px", marginBottom:16,
              }}>
                <p style={tx(12,600,"#dc2626")}>{error}</p>
              </div>
            )}
            <SceneCard
              scene={SCENES[sceneIdx]}
              story={stories[sceneIdx]}
              onChange={val => setStories(s => s.map((x,i)=>i===sceneIdx?val:x))}
              onNext={handleNext}
              isLast={sceneIdx === SCENES.length-1}
            />
          </div>
        )}

        {/* ── LOADING ── */}
        {phase === "loading" && (
          <div style={{ textAlign:"center", padding:"70px 20px", animation:"fadeUp .4s ease" }}>
            <div style={{
              width:72, height:72, borderRadius:"50%",
              background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
              margin:"0 auto 24px",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:32, animation:"orbFloat 2s ease-in-out infinite",
              boxShadow:"0 8px 32px rgba(99,102,241,.4)",
            }}>🧠</div>
            <h2 style={{ fontSize:"1.3rem", fontWeight:800, color:"var(--text)", marginBottom:10 }}>
              Analysing your stories…
            </h2>
            <p style={tx(13,400,"var(--text-soft)",0,1.65)}>
              Reading your narratives and detecting emotional patterns, personality signals and recurring themes. This takes a moment.
            </p>
            <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:24, flexWrap:"wrap" }}>
              {["Emotional tone","Personality","Recurring themes","Growth areas"].map((l,i) => (
                <span key={i} style={{
                  fontSize:11, fontWeight:600, padding:"4px 10px",
                  borderRadius:99, background:"rgba(99,102,241,.1)", color:"var(--accent)",
                }}>{l}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── REPORT ── */}
        {phase === "report" && (
          <ReportView report={report} onRetake={handleRetake} onClose={onClose}/>
        )}

      </div>
    </div>
  );
}
