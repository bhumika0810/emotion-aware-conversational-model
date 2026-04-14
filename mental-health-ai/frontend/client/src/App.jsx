import { useState, useRef, useEffect } from "react";
import "./App.css";
import MoodChart from "./MoodChart";
import JournalPage from "./JournalPage";
import TATPage from "./TATPage";
import CrisisPage from "./CrisisPage";

/* ── Orb ─────────────────────────────────────────────────── */
function Orb() {
  return (
    <div className="orb-wrap" aria-hidden="true">
      <div className="orb">
        <div className="orb-layer l1"/><div className="orb-layer l2"/>
        <div className="orb-layer l3"/><div className="orb-layer l4"/>
        <div className="orb-shine"/><div className="orb-gloss"/>
      </div>
    </div>
  );
}

/* ── Typing indicator ────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="msg-row ai">
      <div className="bubble ai-bubble typing-bubble">
        <span className="dot"/><span className="dot"/><span className="dot"/>
      </div>
    </div>
  );
}

/* ── AI card ─────────────────────────────────────────────── */
function AiCard({ severity, score, support_message }) {
  const colors = { high:"#ef4444", moderate:"#f97316", low:"#22c55e" };
  return (
    <div className="ai-card">
      <div className="ai-card-top">
        <span className="sev-badge" style={{background: colors[severity?.toLowerCase()]||"#94a3b8"}}>{severity}</span>
        <span className="score-chip">Score <strong>{score}</strong></span>
      </div>
      <p className="support-msg">{support_message}</p>
    </div>
  );
}

/* ── Friend bubble (Alex mode) ───────────────────────────── */
function FriendBubble({ text, mood }) {
  const moodConfig = {
    crisis:  { emoji: "💜", bg: "#f3f0ff", border: "#c4b5fd", label: "here for you" },
    low:     { emoji: "🫂",  bg: "#fff7ed", border: "#fed7aa", label: "checking in" },
    okay:    { emoji: "☁️",  bg: "#f0f9ff", border: "#bae6fd", label: null },
    good:    { emoji: null,  bg: null,      border: null,      label: null },
  };
  const cfg = moodConfig[mood] || moodConfig.good;

  return (
    <div style={{
      background: cfg.bg || "transparent",
      border: cfg.border ? `1px solid ${cfg.border}` : "none",
      borderRadius: 16,
      padding: cfg.bg ? "10px 14px" : "0",
      maxWidth: "100%",
    }}>
      {cfg.label && (
        <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
          {cfg.emoji} <span>{cfg.label}</span>
        </div>
      )}
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#1f2937", whiteSpace: "pre-wrap" }}>
        {text}
      </p>
    </div>
  );
}
/* ── Signup modal ────────────────────────────────────────── */
function SignupModal({ onClose }) {
  const [tab, setTab]       = useState("signup"); // "signup" | "login"
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [pass, setPass]     = useState("");

  const handleSubmit = () => {
    // Placeholder — wire to your auth later
    alert(tab === "signup"
      ? `Account created for ${name || email}!`
      : `Welcome back, ${email}!`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{position:"relative"}} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Tabs */}
        <div style={{display:"flex",gap:0,background:"rgba(0,0,0,.05)",borderRadius:12,padding:4,marginBottom:4}}>
          {["signup","login"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex:1, padding:"8px 0", border:"none", cursor:"pointer",
              borderRadius:10, fontFamily:"var(--font)", fontSize:".85rem", fontWeight:600,
              background: tab===t ? "#fff" : "transparent",
              color: tab===t ? "var(--text)" : "var(--text-soft)",
              boxShadow: tab===t ? "0 1px 6px rgba(0,0,0,.1)" : "none",
              transition:"all .15s",
            }}>
              {t === "signup" ? "Create account" : "Sign in"}
            </button>
          ))}
        </div>

        <h2 className="modal-title">
          {tab==="signup" ? "Join MindSpace" : "Welcome back"}
        </h2>
        <p className="modal-sub">
          {tab==="signup"
            ? "Your personal AI mental health companion"
            : "Sign in to access your history and insights"}
        </p>

        {tab==="signup" && (
          <div className="modal-field">
            <label>Full name</label>
            <input placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/>
          </div>
        )}
        <div className="modal-field">
          <label>Email</label>
          <input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
        </div>
        <div className="modal-field">
          <label>Password</label>
          <input type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)}/>
        </div>

        <button className="modal-submit" onClick={handleSubmit}>
          {tab==="signup" ? "Create account →" : "Sign in →"}
        </button>

        <p className="modal-divider">
          {tab==="signup" ? "Already have an account? " : "Don't have an account? "}
          <span style={{color:"var(--accent)",cursor:"pointer",fontWeight:600}}
            onClick={() => setTab(tab==="signup"?"login":"signup")}>
            {tab==="signup" ? "Sign in" : "Sign up"}
          </span>
        </p>
      </div>
    </div>
  );
}

/* ── History drawer ──────────────────────────────────────── */
function HistoryDrawer({ sessions, onClose, onRestore }) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:60,background:"rgba(0,0,0,.3)",backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div style={{
        position:"absolute",top:0,right:0,bottom:0,width:"min(340px,90vw)",
        background:"rgba(255,255,255,.97)",backdropFilter:"blur(20px)",
        boxShadow:"-8px 0 40px rgba(0,0,0,.12)",display:"flex",flexDirection:"column",
        padding:"24px 0",
      }} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 20px 16px",borderBottom:"1px solid rgba(0,0,0,.07)"}}>
          <span style={{fontSize:17,fontWeight:700}}>Chat History</span>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#6b7280"}}>✕</button>
        </div>
        <div style={{flex:1,overflowY:"auto"}}>
          {sessions.length===0 ? (
            <p style={{color:"#9ca3af",fontSize:13,padding:"20px"}}>No previous chats.</p>
          ) : sessions.map((s,i) => {
            const firstMsg = s.find(m=>m.role==="user")?.text || "Empty chat";
            const last     = [...s].reverse().find(m=>m.role==="ai"&&m.type==="response");
            const sevColor = {high:"#ef4444",moderate:"#f97316",low:"#22c55e"}[last?.severity?.toLowerCase()]||"#94a3b8";  
            return (
              <button key={i} onClick={()=>{onRestore(i);onClose();}} style={{
                display:"flex",alignItems:"center",gap:12,padding:"13px 20px",
                background:"none",border:"none",borderBottom:"1px solid rgba(0,0,0,.05)",
                cursor:"pointer",textAlign:"left",width:"100%",
              }}>
                <span style={{fontSize:20}}>💬</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                    <span style={{fontSize:13,fontWeight:700,color:"#374151"}}>Chat {sessions.length-i}</span>
                    {last && <span style={{fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:99,background:sevColor+"22",color:sevColor,textTransform:"uppercase"}}>{last.severity}</span>}
                  </div>
                  <span style={{fontSize:11,color:"#9ca3af",display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {firstMsg.slice(0,50)}{firstMsg.length>50?"…":""}
                  </span>
                </div>
                <span style={{color:"#d1d5db",fontSize:16}}>›</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Action pills config ─────────────────────────────────── */
const ACTIONS = [
  {icon:"💬",label:"Start chat"},
  {icon:"📊",label:"Analyze mood"},
  {icon:"🧠",label:"Mental check"},
  {icon:"✨",label:"Get support"},
  {icon:"📝",label:"Journal entry"},
  {icon:"···",label:"More"},
];

/* ── Main App ────────────────────────────────────────────── */
export default function App() {
  const [messages,      setMessages]      = useState([]);
  const [input,         setInput]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [chatOpen,      setChatOpen]      = useState(false);
  const [showMoodChart, setShowMoodChart] = useState(false);
  const [showJournal,   setShowJournal]   = useState(false);
  const [showTAT,       setShowTAT]       = useState(false);
  const [showCrisis,    setShowCrisis]    = useState(false);
  const [showSignup,    setShowSignup]    = useState(false);
  const [showHistory,   setShowHistory]   = useState(false);
  const [friendMode,    setFriendMode]    = useState(false);
  // chatSessions persists across "Start chat" restarts
  const [chatSessions,  setChatSessions]  = useState([]);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior:"smooth"});
  }, [messages, loading]);
  

// Show data.reply as Alex's message
// Use data.mood to quietly update a vibe indicator
// If data.is_crisis === true, show a soft "you're not alone" banner
  // Replace your existing send() function with this:
  const send = async (text) => {
  text = (text || input).trim();
  if (!text || loading) return;
  setChatOpen(true);
  setMessages(p => [...p, { role: "user", type: "text", text }]);
  setInput("");
  setLoading(true);
  try {
    const endpoint = friendMode ? "/chat" : "/predict";
    const res = await fetch(`http://127.0.0.1:8000${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error();
    const data = await res.json();

    if (data.is_crisis) setShowCrisis(true);

    if (friendMode) {
      // Alex replies like a friend — no clinical card shown
      setMessages(p => [...p, {
        role: "ai",
        type: "friend",
        text: data.reply,
        mood: data.mood,
        is_crisis: data.is_crisis,
        severity: data.mood === "crisis" ? "High" : data.mood === "low" ? "High" : data.mood === "okay" ? "Moderate" : "Low",
      }]);
    } else {
      setMessages(p => [...p, {
        role: "ai",
        type: "response",
        risk_score: data.risk_score,
        severity: data.severity,
        mood: data.mood,
        support_message: data.support_message,
        is_crisis: data.is_crisis,
      }]);
    }
  } catch {
    setMessages(p => [...p, { role: "ai", type: "text", text: "⚠️ Couldn't reach the server. Please try again." }]);
  } finally { setLoading(false); }
  };


  // Save current chat to history FIRST, then reset — history is never lost
  const handleStartChat = () => {
    if (messages.length > 0) {
      // Attach real timestamp so MoodChart knows which day this session happened
      const sessionWithTime = Object.assign([...messages], { timestamp: Date.now() });
      setChatSessions(prev => [sessionWithTime, ...prev]);
    }
    setMessages([]);
    setChatOpen(false);
    setShowMoodChart(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleRestoreSession = (index) => {
    if (messages.length > 0) {
      const sessionWithTime = Object.assign([...messages], { timestamp: Date.now() });
      setChatSessions(prev => [sessionWithTime, ...prev]);
    }
    const restored = chatSessions[index];
    setChatSessions(prev => prev.filter((_,i) => i!==index));
    setMessages(restored);
    setChatOpen(true);
  };

  const handlePillClick = (label) => {
    if (label==="Analyze mood")   { setShowMoodChart(true); return; }
    if (label==="Journal entry")  { setShowJournal(true);   return; }
    if (label==="Mental check")   { setShowTAT(true);       return; }
    if (label==="Get support")    { setShowCrisis(true);    return; }
    if (label==="Start chat")   { handleStartChat();      return; }
    inputRef.current?.focus();
  };
  if(showCrisis){
    return(
      <CrisisPage
        onClose={() => setShowCrisis(false)}
        onStartChat={() => { setShowCrisis(false); setChatOpen(true); }}
      />
    );
  }

  if (showTAT) {
    return (
      <TATPage
        onClose={() => setShowTAT(false)}
        onStartChat={handleStartChat}
      />
    );
  }

  if (showJournal) {
    return (
      <JournalPage
        onClose={() => setShowJournal(false)}
        onStartChat={handleStartChat}
      />
    );
  }

  if (showMoodChart) {
    return (
      <MoodChart
        onClose={() => setShowMoodChart(false)}
        chatSessions={chatSessions}
        onStartChat={handleStartChat}
      />
    );
  }

  return (
    <div className="page">
      <div className="bg-base"/>
      <div className="bg-grad g1"/><div className="bg-grad g2"/><div className="bg-grad g3"/>

      {/* Nav */}
      <nav className="nav">
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
        <div className="nav-right">
          {chatSessions.length > 0 && (
            <button className="nav-history-btn" onClick={() => setShowHistory(true)}>
              🕐 History ({chatSessions.length})
            </button>
          )}
          <button className="nav-cta" onClick={() => setShowSignup(true)}>
            Get Started ↗
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="hero">
        <Orb/>

        {!chatOpen && (
          <div className="hero-text">
            <p className="hero-eyebrow">MindSpace AI</p>
            <h1 className="hero-title">
              Your personal <span className="hero-accent">mental health</span><br/>
              companion, powered by AI
            </h1>
          </div>
        )}

        {/* Chat card */}
        <div className={`center-card ${chatOpen?"expanded":""}`}>
          {chatOpen && (
            <div className="messages">
              {messages.map((m,i) =>
                m.role==="user" ? (
                  <div className="msg-row user" key={i}>
                    <div className="bubble user-bubble">{m.text}</div>
                  </div>
                ) : (
                  <div className="msg-row ai" key={i}>
                    <div className="bubble ai-bubble">
                      {m.type === "response" ? <AiCard severity={m.severity} score={m.risk_score} support_message={m.support_message} /> : m.type === "friend" ? <FriendBubble text={m.text} mood={m.mood} /> : m.text}
                    </div>
                  </div>
                )
              )}
              {loading && <TypingIndicator/>}
              <div ref={bottomRef}/>
            </div>
          )}

          <div className="input-bar">
            <button className="input-icon-btn" aria-label="attach">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>
            <input
              ref={inputRef}
              className="main-input"
              placeholder={chatOpen ? "Continue the conversation…" : "Share how you're feeling, or ask anything…"}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==="Enter" && send()}
              disabled={loading}
            />
            <div className="input-right">
              <span className="model-tag">Model <strong>MindAI 1.4</strong></span>
              <button className="send-pill" onClick={() => send()} disabled={loading||!input.trim()}>
                {loading ? "…" : "Send ↗"}
              </button>
              <button className="style-btn" onClick={() => setFriendMode(f => !f)}
              style={{ 
                background: friendMode ? "linear-gradient(135deg,#818cf8,#a78bfa)" : "", 
                color: friendMode ? "#fff" : "",
                border: friendMode ? "none" : "",
              }}
              >
                {friendMode ? "🤙 Alex mode" : "✦ Wellness mode"}
              </button>
            </div>
          </div>
        </div>
        {/* Action pills */}
        <div className="action-pills">
          {ACTIONS.map(a => (
            <button key={a.label} className="action-pill" onClick={() => handlePillClick(a.label)}>
              <span className="pill-icon">{a.icon}</span>{a.label}
            </button>
          ))}
        </div>
      </main>

      {/* Overlays */}
      {showSignup  && <SignupModal onClose={() => setShowSignup(false)}/>}
      {showHistory && (
        <HistoryDrawer
          sessions={chatSessions}
          onClose={() => setShowHistory(false)}
          onRestore={handleRestoreSession}
        />
      )}
    </div>
  );
}
