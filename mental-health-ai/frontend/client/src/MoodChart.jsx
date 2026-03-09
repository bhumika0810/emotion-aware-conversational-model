import { useState } from "react";
import "./App.css";

import { SEV_TO_MOOD, MOOD_TO_DISPLAY, DEFAULT_MOOD } from "./moodConstants";

const DAYS = ["MON","TUE","WED","THU","FRI","SAT","SUN"];

const MOOD_OPTIONS = [
  { label:"AWFUL", emoji:"😠", color:"#5B6EAE", bg:"#5B6EAE" },
  { label:"BAD",   emoji:"😕", color:"#6BAED6", bg:"#6BAED6" },
  { label:"OKAY",  emoji:"😐", color:"#E8B84B", bg:"#E8B84B" },
  { label:"GOOD",  emoji:"🙂", color:"#7BC67E", bg:"#7BC67E" },
  { label:"GREAT", emoji:"😊", color:"#4CAF72", bg:"#4CAF72" },
];

/* Build 7-day mood data grouped by ACTUAL date of each session */
function buildMoodData(chatSessions, weekOffset) {
  const now = new Date();
  const todayDow = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (todayDow === 0 ? 6 : todayDow - 1) + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const dayMap = {};
  chatSessions.forEach(s => {
    if (!s.timestamp) return;
    const date = new Date(s.timestamp);
    if (date < monday || date > sunday) return;
    const last = [...s].reverse().find(m => m.role==="ai" && m.type==="response");
    if (!last) return;
    const mood = last?.mood ? MOOD_TO_DISPLAY[last.mood] : SEV_TO_MOOD[last?.severity?.toLowerCase()] || DEFAULT_MOOD;
    const dow = date.getDay();
    const dayLabel = DAYS[dow === 0 ? 6 : dow - 1];
    if (!dayMap[dayLabel]) dayMap[dayLabel] = [];
    dayMap[dayLabel].push(mood.value);
  });

  return DAYS.map(day => {
    const values = dayMap[day];
    if (!values || values.length === 0) return { day, value: null, emoji: null, color: null, label: null };
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const rounded = Math.round(avg);
    const allMoods = Object.values(MOOD_TO_DISPLAY);
    const match = allMoods.find(m => m.value === rounded) || DEFAULT_MOOD;
    return { day, value: avg, emoji: match.emoji, color: match.color, label: match.label || "Okay" };
  });
}

/* Compute influence percentages ONLY from real session data */
function computeInfluences(chatSessions) {
  const counts = { low:0, moderate:0, high:0 };
  chatSessions.forEach(s => {
    const last = [...s].reverse().find(m => m.role==="ai" && m.type==="response");
    if (last?.severity) counts[last.severity.toLowerCase()] = (counts[last.severity.toLowerCase()]||0) + 1;
  });
  const total = chatSessions.length || 1;
  const positiveRate = Math.round((counts.low / total) * 100);
  const negativeRate = Math.round(((counts.moderate + counts.high) / total) * 100);
  return { positiveRate, negativeRate, total };
}

export default function MoodChart({ onClose, chatSessions, onStartChat }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [weekOffset,   setWeekOffset]   = useState(0);

  const hasSessions  = chatSessions.length > 0;
  const moodData = hasSessions ? buildMoodData(chatSessions, weekOffset) : [];
  const pts          = moodData.map((d,i) => ({...d,i})).filter(d => d.value !== null);
  const influences   = hasSessions ? computeInfluences(chatSessions) : null;

  // Stats
  const validMoods = moodData.filter(d => d.value !== null);
  const avgMood    = validMoods.length
    ? (validMoods.reduce((s,d) => s+d.value,0) / validMoods.length).toFixed(1) : "—";
  const bestDay    = validMoods.length ? validMoods.reduce((b,d) => d.value>(b?.value||0)?d:b, null) : null;
  const worstDay   = validMoods.length ? validMoods.reduce((w,d) => d.value<(w?.value||99)?d:w, null) : null;
  const todayLabel = DAYS[new Date().getDay()===0?6:new Date().getDay()-1];

  // SVG chart
  const CW=800, CH=160;
  const toX = i => (i/(DAYS.length-1))*CW;
  const toY = v => CH - ((v-1)/4)*(CH-40) - 24;
  const buildPath = arr => {
    if (arr.length < 2) return "";
    let d = `M ${toX(arr[0].i)} ${toY(arr[0].value)}`;
    for (let k=1;k<arr.length;k++) {
      const p=arr[k-1],c=arr[k],cx=(toX(p.i)+toX(c.i))/2;
      d += ` C ${cx} ${toY(p.value)}, ${cx} ${toY(c.value)}, ${toX(c.i)} ${toY(c.value)}`;
    }
    return d;
  };
  const linePath = buildPath(pts);

  const SEV_COLOR = {
  low:"#22c55e",
  moderate:"#f97316",
  high:"#ef4444"
  };

  return (
    <div className="mc-page">
      <div className="bg-base"/>
      <div className="bg-grad g1"/><div className="bg-grad g2"/><div className="bg-grad g3"/>

      {/* Nav */}
      <nav className="nav" style={{position:"relative",zIndex:20}}>
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
          <button onClick={onClose} className="nav-history-btn">← Back</button>
        </div>
      </nav>

      <div className="mc-content">

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:20}}>
          <p style={{fontSize:11,letterSpacing:"0.15em",color:"#aaa",fontWeight:700,fontFamily:"monospace",marginBottom:4}}>MOOD TRACKING</p>
          <h1 style={{fontSize:"clamp(1.4rem,3vw,2rem)",fontWeight:800,color:"var(--text)"}}>Mood Analysis</h1>
          <p style={{fontSize:13,color:"var(--text-soft)",marginTop:4}}>
            {hasSessions
              ? `Based on ${chatSessions.length} session${chatSessions.length>1?"s":""}`
              : "Complete a chat session to unlock your mood insights"}
          </p>
        </div>

        {/* Stats row */}
        <div className="mc-stats">
          {[
            { label:"Avg Mood",  value: avgMood,              sub:"this week"          },
            { label:"Best Day",  value: bestDay?.day  || "—", sub: bestDay?.label  || "" },
            { label:"Worst Day", value: worstDay?.day || "—", sub: worstDay?.label || "" },
            { label:"Sessions",  value: chatSessions.length,  sub:"recorded"           },
          ].map(s => (
            <div key={s.label} className="mc-stat-card">
              <span className="mc-stat-val">{s.value}</span>
              <span className="mc-stat-label">{s.label}</span>
              {s.sub && <span className="mc-stat-sub">{s.sub}</span>}
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="mc-grid">

          {/* LEFT */}
          <div className="mc-left">

            {/* Check-in card */}
            <div className="mc-card">
              <p className="mc-eyebrow">{hasSessions ? `${chatSessions.length}TH CHECK-IN` : "CHECK-IN"}</p>
              <h2 className="mc-card-title" style={{marginBottom:20}}>How are you today?</h2>
              <div style={{display:"flex",justifyContent:"space-around",alignItems:"flex-end"}}>
                {MOOD_OPTIONS.map(m => (
                  <button key={m.label} onClick={() => setSelectedMood(m.label)} style={{
                    display:"flex",flexDirection:"column",alignItems:"center",gap:8,
                    background: selectedMood===m.label ? "rgba(255,255,255,.7)" : "transparent",
                    border:"none",cursor:"pointer",padding:"8px 10px",borderRadius:14,
                    transition:"all .2s",
                    transform: selectedMood===m.label ? "scale(1.12)" : "scale(1)",
                    opacity: selectedMood && selectedMood!==m.label ? 0.4 : 1,
                  }}>
                    <div style={{
                      width:56,height:56,borderRadius:"50%",background:m.bg,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      boxShadow: selectedMood===m.label
                        ? `0 0 0 3px white,0 0 0 5px ${m.bg}55,0 8px 20px ${m.bg}66`
                        : "0 3px 10px rgba(0,0,0,.12)",
                      transition:"box-shadow .2s",
                    }}>
                      <span style={{fontSize:26}}>{m.emoji}</span>
                    </div>
                    <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",fontFamily:"monospace",color:m.color}}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chart card */}
            <div className="mc-card">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                <div>
                  <h2 className="mc-card-title">Weekly Mood</h2>
                  <p style={{fontSize:12,color:"var(--text-soft)"}}>
                    {weekOffset===0 ? "This week" : `${Math.abs(weekOffset)}w ago`}
                  </p>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button style={wBtn} onClick={() => setWeekOffset(w=>w-1)}>‹</button>
                  <button style={wBtn} onClick={() => setWeekOffset(w => Math.min(w + 1, 0))}>›</button>
                </div>
              </div>

              {!hasSessions ? (
                <div className="mc-empty">
                  <span className="mc-empty-icon">📊</span>
                  <p className="mc-empty-title">No mood data yet</p>
                  <p className="mc-empty-sub">Start a chat session and your mood will be tracked here automatically.</p>
                  <button className="mc-empty-btn" onClick={onStartChat}>Start chatting →</button>
                </div>
              ) : pts.length === 0 ? (
              <div className="mc-empty" style={{padding:"24px 0"}}>
              <span className="mc-empty-icon">📅</span>
              <p className="mc-empty-title">No sessions this week</p>
              <p className="mc-empty-sub">Use ‹ to go back to a week with sessions.</p>
                </div>
              ) : (
                <>
                  <div style={{width:"100%",overflowX:"auto"}}>
                    <svg width="100%" viewBox={`-10 -20 ${CW+20} ${CH+50}`} style={{overflow:"visible",minWidth:320}}>
                      <defs>
                        <linearGradient id="lgLine" x1="0%" y1="0%" x2="100%" y2="0%">
                          {pts.length>1 ? pts.map((p,i)=>(
                            <stop key={i} offset={`${(i/(pts.length-1))*100}%`} stopColor={p.color}/>
                          )) : <stop offset="0%" stopColor="#a78bfa"/>}
                        </linearGradient>
                        <linearGradient id="lgArea" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#a78bfa" stopOpacity=".12"/>
                          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      {[1,2,3,4,5].map(v=>(
                        <line key={v} x1={0} y1={toY(v)} x2={CW} y2={toY(v)} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5 4"/>
                      ))}
                      {linePath && pts.length>1 && (
                        <path d={`${linePath} L ${toX(pts[pts.length-1].i)} ${CH+10} L ${toX(pts[0].i)} ${CH+10} Z`} fill="url(#lgArea)"/>
                      )}
                      {linePath && (
                        <path d={linePath} fill="none" stroke="url(#lgLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      )}
                      {pts.map(p=>(
                        <g key={p.day}>
                          <circle cx={toX(p.i)} cy={toY(p.value)} r="19" fill={p.color} opacity=".15"/>
                          <circle cx={toX(p.i)} cy={toY(p.value)} r="17" fill={p.color}/>
                          <text x={toX(p.i)} y={toY(p.value)+6} textAnchor="middle" fontSize="15">{p.emoji}</text>
                        </g>
                      ))}
                      {DAYS.map((d,i)=>(
                        <text key={d} x={toX(i)} y={CH+20} textAnchor="middle" fontSize="11"
                          fontFamily="monospace" letterSpacing=".05em"
                          fontWeight={d===todayLabel?"700":"400"}
                          fill={moodData[i]?.value ? "#374151" : "#d1d5db"}>
                          {d}
                        </text>
                      ))}
                    </svg>
                  </div>
                  {/* Legend */}
                  <div style={{display:"flex",gap:12,marginTop:12,flexWrap:"wrap"}}>
                    {MOOD_OPTIONS.map(m=>(
                      <div key={m.label} style={{display:"flex",alignItems:"center",gap:5}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:m.bg}}/>
                        <span style={{fontSize:11,color:"var(--text-soft)"}}>{m.label}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="mc-right">

            {/* Session history */}
            <div className="mc-card">
              <h2 className="mc-card-title" style={{marginBottom:14}}>Session History</h2>
              {!hasSessions ? (
                <div className="mc-empty" style={{padding:"20px 0"}}>
                  <span className="mc-empty-icon">💬</span>
                  <p className="mc-empty-title">No sessions yet</p>
                  <p className="mc-empty-sub">Your chat history will appear here.</p>
                  <button className="mc-empty-btn" onClick={onStartChat}>Start chatting →</button>
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {chatSessions.map((session,i) => {
                    const last     = [...session].reverse().find(m=>m.role==="ai"&&m.type==="response");
                    const mood     = last ? (SEV_TO_MOOD[last.severity?.toLowerCase()]||DEFAULT_MOOD) : DEFAULT_MOOD;
                    const firstMsg = session.find(m=>m.role==="user")?.text || "";
                    const sevColor = SEV_COLOR[last?.severity?.toLowerCase()] || "#94a3b8";
                    return (
                      <div key={i} className="mc-session">
                        <div className="mc-session-dot" style={{background:mood.color}}>
                          <span>{mood.emoji}</span>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                            <span style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>
                              Session {chatSessions.length-i}
                            </span>
                            {last && (
                              <span className="mc-sev-badge" style={{background:sevColor+"22",color:sevColor}}>
                                {last.severity}
                              </span>
                            )}
                          </div>
                          <p style={{fontSize:11,color:"#9ca3af",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            {firstMsg.slice(0,55)}{firstMsg.length>55?"…":""}
                          </p>
                        </div>
                        {last?.risk_score  != null && (
                          <span style={{fontSize:12,fontWeight:700,color:"var(--text)",flexShrink:0}}>
                            {last.risk_score.toFixed(1)} / 5
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mood insights — only from real data */}
            <div className="mc-card">
              <h2 className="mc-card-title" style={{marginBottom:4}}>Mood Insights</h2>
              <p style={{fontSize:12,color:"var(--text-soft)",marginBottom:16}}>
                Based on your session history
              </p>

              {!hasSessions ? (
                <div style={{textAlign:"center",padding:"16px 0",color:"#aaa",fontSize:13}}>
                  Complete sessions to see your mood breakdown
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  {/* Positive sessions */}
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div className="mc-inf-icon" style={{background:"#f0fdf4"}}>😊</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <span style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>Positive sessions</span>
                        <span style={{fontSize:12,fontWeight:700,color:"#4CAF72"}}>+{influences.positiveRate}%</span>
                      </div>
                      <div className="mc-bar-bg">
                        <div className="mc-bar-fill" style={{width:`${influences.positiveRate}%`,background:"linear-gradient(90deg,#86efac,#4CAF72)"}}/>
                      </div>
                    </div>
                  </div>
                  {/* Negative sessions */}
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div className="mc-inf-icon" style={{background:"#fff1f2"}}>😔</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <span style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>Negative sessions</span>
                        <span style={{fontSize:12,fontWeight:700,color:"#EF5350"}}>-{influences.negativeRate}%</span>
                      </div>
                      <div className="mc-bar-bg">
                        <div className="mc-bar-fill" style={{width:`${influences.negativeRate}%`,background:"linear-gradient(90deg,#fca5a5,#EF5350)"}}/>
                      </div>
                    </div>
                  </div>
                  {/* Severity breakdown */}
                  <div style={{marginTop:4,padding:"12px 14px",background:"rgba(99,102,241,.05)",borderRadius:12,border:"1px solid rgba(99,102,241,.1)"}}>
                    <p style={{fontSize:11,fontWeight:700,color:"var(--text-soft)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em"}}>Severity breakdown</p>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {Object.entries(
                        chatSessions.reduce((acc,s) => {
                          const last = [...s].reverse().find(m=>m.role==="ai"&&m.type==="response");
                          if (last?.severity) acc[last.severity.toLowerCase()] = (acc[last.severity.toLowerCase()]||0)+1;
                          return acc;
                        },{})
                      ).map(([sev,count]) => (
                        <span key={sev} style={{
                          fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:99,
                          background:(SEV_COLOR[sev]||"#94a3b8")+"22",
                          color:SEV_COLOR[sev]||"#94a3b8",
                          textTransform:"capitalize",
                        }}>
                          {sev}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

const wBtn = {
  width:32,height:32,borderRadius:"50%",border:"1.5px solid rgba(0,0,0,.1)",
  background:"rgba(255,255,255,.8)",cursor:"pointer",fontSize:16,
  display:"flex",alignItems:"center",justifyContent:"center",color:"#374151",
};

const SEV_COLOR = {
  low:"#22c55e",
  moderate:"#f97316",
  high:"#ef4444"
};