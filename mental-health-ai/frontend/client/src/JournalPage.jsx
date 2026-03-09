import { useState, useMemo, useCallback } from "react";
import "./App.css";

const MONTH_NAMES = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE",
                     "JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
const MONTH_SHORT = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const DAY_NAMES   = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];
const MOODS       = ["😊","🙂","😐","😕","😞"];
const MEAL_EMOJIS = ["🍜","🍱","🥗","🍛","🥘","🍝","🥪","🌮","🍣","🥩"];

/* ── Date helpers ─────────────────────────────────────────── */
function dateKey(date) {
  // Unique string key per calendar day — used as storage key
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

function getWeekMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0,0,0,0);
  return d;
}

function getWeekDays(monday) {
  return Array.from({length:7}, (_,i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const y = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - y) / 86400000) + 1) / 7);
}

function buildCalendar(year, month) {
  const firstDay  = new Date(year, month, 1);
  const lastDay   = new Date(year, month+1, 0);
  const startPad  = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const cells     = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i+7));
  return weeks;
}

const EMPTY_DAY = () => ({ priority:"", mood:"", tasks:[{done:false,text:""}], note:"" });

/* ── Mini Calendar ────────────────────────────────────────── */
function MiniCal({ calYear, calMonth, setCalYear, setCalMonth, weekMonday, onSelectWeek }) {
  const weeks   = useMemo(() => buildCalendar(calYear, calMonth), [calYear, calMonth]);
  const weekEnd = useMemo(() => { const d = new Date(weekMonday); d.setDate(d.getDate()+6); return d; }, [weekMonday]);
  const today   = new Date();

  const isHighlighted = (day) => {
    if (!day) return false;
    const d = new Date(calYear, calMonth, day);
    return d >= weekMonday && d <= weekEnd;
  };
  const prevMonth = () => calMonth===0 ? (setCalMonth(11),setCalYear(y=>y-1)) : setCalMonth(m=>m-1);
  const nextMonth = () => calMonth===11 ? (setCalMonth(0),setCalYear(y=>y+1)) : setCalMonth(m=>m+1);
  const clickDay  = (day) => { if (day) onSelectWeek(getWeekMonday(new Date(calYear, calMonth, day))); };

  return (
    <div style={s.calCard}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <button onClick={prevMonth} style={s.calNavBtn}>‹</button>
        <span style={s.calMonth}>{MONTH_SHORT[calMonth]} {calYear}</span>
        <button onClick={nextMonth} style={s.calNavBtn}>›</button>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead>
          <tr>
            <th style={s.calTh}>W</th>
            {["M","T","W","T","F","S","S"].map((d,i)=><th key={i} style={s.calTh}>{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week,wi) => {
            const first = week.find(Boolean);
            const wNum  = first ? getWeekNumber(new Date(calYear,calMonth,first)) : "—";
            return (
              <tr key={wi}>
                <td style={{...s.calTd,...s.weekNum}}>W{wNum}</td>
                {week.map((day,di) => {
                  const isToday = day && calYear===today.getFullYear() && calMonth===today.getMonth() && day===today.getDate();
                  const hi      = isHighlighted(day);
                  const isFirst = hi && (di===0 || !week[di-1]);
                  const isLast  = hi && (di===6 || !week[di+1]);
                  return (
                    <td key={di} onClick={()=>clickDay(day)} style={{
                      ...s.calTd,
                      ...(hi ? s.calHighlight : {}),
                      ...(isFirst ? {borderRadius:"6px 0 0 6px"} : {}),
                      ...(isLast  ? {borderRadius:"0 6px 6px 0"} : {}),
                      ...(isToday ? {fontWeight:800,outline:"2px solid rgba(99,102,241,.5)",outlineOffset:-1,borderRadius:6} : {}),
                      cursor: day ? "pointer" : "default",
                    }}>{day||""}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Day Card — receives data & updater, owns NO local state ── */
function DayCard({ date, data, onChange }) {
  const today   = new Date();
  const isToday = date.getDate()===today.getDate() && date.getMonth()===today.getMonth() && date.getFullYear()===today.getFullYear();

  const { priority, mood, tasks, note } = data;

  const setPri  = (p) => onChange({ ...data, priority: priority===p ? "" : p });
  const setMood = (m) => onChange({ ...data, mood: mood===m ? "" : m });
  const setNote = (v) => onChange({ ...data, note: v });

  const toggleTask = (i) => onChange({
    ...data,
    tasks: tasks.map((t,j) => j===i ? {...t,done:!t.done} : t),
  });

  const setTaskText = (i, v) => {
    let next = tasks.map((t,j) => j===i ? {...t,text:v} : t);
    if (i===tasks.length-1 && v) next = [...next, {done:false,text:""}];
    onChange({ ...data, tasks: next });
  };

  const deleteTask = (i) => {
    const next = tasks.filter((_,j)=>j!==i);
    onChange({ ...data, tasks: next.length ? next : [{done:false,text:""}] });
  };

  return (
    <div style={{...s.dayCard, ...(isToday?s.dayCardToday:{})}}>
      <div style={s.dayHeader}>
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <span style={s.dayNum}>{date.getDate()}</span>
          {isToday && <span style={s.todayBadge}>TODAY</span>}
        </div>
        <span style={s.dayName}>{DAY_NAMES[date.getDay()===0?6:date.getDay()-1]}</span>
        <span style={s.bookmarkIcon}>🔖</span>
      </div>

      {/* Priority + mood */}
      <div style={{display:"flex",gap:5,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
        {["high","medium","low"].map(p=>(
          <button key={p} onClick={()=>setPri(p)} style={{
            ...s.priorityTag,
            background: priority===p ? (p==="high"?"#ff6b6b":p==="medium"?"#ffd93d":"#a8e6cf") : "rgba(0,0,0,.06)",
            color: priority===p ? "#fff" : "#aaa",
            fontWeight: priority===p ? 700 : 500,
          }}>{p}</button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",gap:2}}>
          {MOODS.map(m=>(
            <button key={m} onClick={()=>setMood(m)} style={{
              ...s.moodBtn,
              background: mood===m ? "rgba(99,102,241,.12)" : "transparent",
              transform:  mood===m ? "scale(1.3)" : "scale(1)",
            }}>{m}</button>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div style={{display:"flex",flexDirection:"column",gap:3,marginBottom:8}}>
        {tasks.map((t,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
            <button onClick={()=>toggleTask(i)} style={s.checkbox}>
              {t.done ? "✓" : "○"}
            </button>
            <input
              value={t.text}
              onChange={e=>setTaskText(i,e.target.value)}
              placeholder="add task…"
              style={{
                ...s.taskInput,
                textDecoration: t.done?"line-through":"none",
                color: t.done?"#ccc":"var(--text)",
              }}
            />
            {t.text && (
              <button onClick={()=>deleteTask(i)} style={s.deleteTaskBtn}>✕</button>
            )}
          </div>
        ))}
      </div>

      {/* Note */}
      <textarea
        value={note}
        onChange={e=>setNote(e.target.value)}
        placeholder="notes, thoughts, reminders…"
        rows={2}
        style={s.noteArea}
      />
    </div>
  );
}

/* ── Right Panel ──────────────────────────────────────────── */
function RightPanel({ weekKey, weekData, onWeekDataChange, onStartChat }) {
  const { weekNote, meals, quote } = weekData;

  const setWeekNote = (v)      => onWeekDataChange({...weekData, weekNote:v});
  const setQuote    = (v)      => onWeekDataChange({...weekData, quote:v});
  const addMeal     = ()       => onWeekDataChange({...weekData, meals:[...meals,{name:"",desc:""}]});
  const deleteMeal  = (i)      => onWeekDataChange({...weekData, meals: meals.filter((_,j)=>j!==i).length ? meals.filter((_,j)=>j!==i) : [{name:"",desc:""}]});
  const updateMeal  = (i,f,v)  => onWeekDataChange({...weekData, meals: meals.map((m,j)=>j===i?{...m,[f]:v}:m)});

  return (
    <div style={s.rightPanel}>
      {/* Weekly notes */}
      <div style={s.rightCard}>
        <div style={{marginBottom:10}}>
          <span style={s.weeklyNotesLabel}>WEEKLY NOTES</span>
        </div>
        <textarea
          value={weekNote}
          onChange={e=>setWeekNote(e.target.value)}
          placeholder="How was your week? Reflect on your mood, energy, wins and struggles…"
          rows={5}
          style={s.noteArea}
        />
      </div>

      {/* Meal plan */}
      <div style={s.rightCard}>
        <div style={s.mealPlanTitle}>Meal Plan</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {meals.map((meal,i)=>(
            <div key={i} style={{...s.mealRow}}>
              <div style={s.mealDot}>{MEAL_EMOJIS[i%MEAL_EMOJIS.length]}</div>
              <div style={{flex:1,minWidth:0}}>
                <input
                  value={meal.name}
                  onChange={e=>updateMeal(i,"name",e.target.value)}
                  placeholder="meal name…"
                  style={s.mealInput}
                />
                <input
                  value={meal.desc}
                  onChange={e=>updateMeal(i,"desc",e.target.value)}
                  placeholder="ingredients or notes…"
                  style={{...s.mealInput,fontSize:11,color:"#aaa",marginTop:3}}
                />
              </div>
              <button onClick={()=>deleteMeal(i)} style={s.deleteMealBtn} title="remove">✕</button>
            </div>
          ))}
          <button onClick={addMeal} style={s.addMealBtn}>+ add meal</button>
        </div>
      </div>

      {/* Affirmation */}
      <div style={{...s.rightCard,...s.affirmCard}}>
        <textarea
          value={quote}
          onChange={e=>setQuote(e.target.value)}
          style={s.affirmText}
          rows={2}
        />
        <p style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:6,textAlign:"center",fontFamily:"'Figtree',sans-serif"}}>
          your weekly affirmation
        </p>
      </div>

      <button onClick={onStartChat} style={s.chatCta}>
        💬 Talk to MindSpace AI about your week
      </button>
    </div>
  );
}

const EMPTY_WEEK_DATA = () => ({
  weekNote: "",
  meals: [{name:"",desc:""},{name:"",desc:""}],
  quote: "APPRECIATE EVERYTHING",
});

/* ── Main ─────────────────────────────────────────────────── */
export default function JournalPage({ onClose, onStartChat }) {
  const today = new Date();

  const [weekMonday, setWeekMonday] = useState(() => getWeekMonday(today));
  const [calYear,    setCalYear]    = useState(today.getFullYear());
  const [calMonth,   setCalMonth]   = useState(today.getMonth());

  // ALL day data stored here keyed by dateKey — never lost when navigating weeks
  const [allDayData,  setAllDayData]  = useState({});
  // Per-week right panel data keyed by weekMonday dateKey
  const [allWeekData, setAllWeekData] = useState({});

  const weekDays = useMemo(() => getWeekDays(weekMonday), [weekMonday]);
  const weekEnd  = weekDays[6];
  const weekKey  = dateKey(weekMonday);

  // Get or create data for a specific day
  const getDayData = useCallback((date) => {
    const k = dateKey(date);
    return allDayData[k] || EMPTY_DAY();
  }, [allDayData]);

  // Update data for a specific day
  const setDayData = useCallback((date, data) => {
    const k = dateKey(date);
    setAllDayData(prev => ({...prev, [k]: data}));
  }, []);

  // Get or create week panel data
  const weekData = allWeekData[weekKey] || EMPTY_WEEK_DATA();
  const setWeekData = (data) => setAllWeekData(prev => ({...prev, [weekKey]: data}));

  const handleSelectWeek = (monday) => {
    setWeekMonday(monday);
    setCalYear(monday.getFullYear());
    setCalMonth(monday.getMonth());
  };
  const prevWeek = () => { const m=new Date(weekMonday); m.setDate(m.getDate()-7); handleSelectWeek(m); };
  const nextWeek = () => { const m=new Date(weekMonday); m.setDate(m.getDate()+7); handleSelectWeek(m); };
  const goToday  = () => handleSelectWeek(getWeekMonday(today));

  const weekLabel = (() => {
    const sameMonth = weekMonday.getMonth()===weekEnd.getMonth();
    const sameYear  = weekMonday.getFullYear()===weekEnd.getFullYear();
    if (sameMonth && sameYear)
      return `WEEK OF ${MONTH_NAMES[weekMonday.getMonth()]} ${weekMonday.getDate()} – ${weekEnd.getDate()}, ${weekMonday.getFullYear()}`;
    if (sameYear)
      return `${MONTH_SHORT[weekMonday.getMonth()]} ${weekMonday.getDate()} – ${MONTH_SHORT[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekMonday.getFullYear()}`;
    return `${MONTH_SHORT[weekMonday.getMonth()]} ${weekMonday.getDate()}, ${weekMonday.getFullYear()} – ${MONTH_SHORT[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
  })();

  return (
    <div style={s.page}>
      <div className="bg-base"/>
      <div className="bg-grad g1"/><div className="bg-grad g2"/><div className="bg-grad g3"/>

      <nav className="nav" style={{position:"relative",zIndex:20}}>
        <div className="nav-logo"><span className="logo-mark">M</span><span>MindSpace</span></div>
        <ul className="nav-links">
          <li><a href="#">Home</a></li><li><a href="#">Features</a></li>
          <li><a href="#">Research</a></li><li><a href="#">Contact</a></li>
        </ul>
        <div style={{marginLeft:"auto"}}>
          <button onClick={onClose} className="nav-history-btn">← Back</button>
        </div>
      </nav>

      <div style={s.journal}>
        {/* LEFT */}
        <div style={s.leftPanel}>
          <div style={s.weekHeader}>
            <span style={s.weekDots}>●●●</span>
            <span style={s.weekTitle}>{weekLabel}</span>
            <div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center"}}>
              <button onClick={goToday}  style={s.weekNavToday}>Today</button>
              <button onClick={prevWeek} style={s.weekNavBtn}>‹</button>
              <button onClick={nextWeek} style={s.weekNavBtn}>›</button>
            </div>
          </div>

          <MiniCal
            calYear={calYear} calMonth={calMonth}
            setCalYear={setCalYear} setCalMonth={setCalMonth}
            weekMonday={weekMonday} onSelectWeek={handleSelectWeek}
          />

          <div style={s.daysGrid}>
            {weekDays.map(date => (
              <DayCard
                key={dateKey(date)}
                date={date}
                data={getDayData(date)}
                onChange={(data) => setDayData(date, data)}
              />
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div style={s.rightWrapper}>
          <div style={s.monthTimeline}>
            {MONTH_SHORT.map((m,i)=>(
              <div key={m} onClick={()=>{setCalMonth(i);setCalYear(today.getFullYear());}} style={{
                ...s.monthLabel,
                fontWeight: i===calMonth && calYear===today.getFullYear() ? 800 : 400,
                color: i===calMonth && calYear===today.getFullYear() ? "var(--text)" : "#ccc",
                cursor:"pointer",
              }}>{m}</div>
            ))}
          </div>
          <RightPanel
            weekKey={weekKey}
            weekData={weekData}
            onWeekDataChange={setWeekData}
            onStartChat={onStartChat}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────── */
const s = {
  page:       { position:"fixed",inset:0,zIndex:50,overflowY:"auto",overflowX:"hidden",fontFamily:"'Figtree',sans-serif" },
  journal:    { position:"relative",zIndex:1,display:"grid",gridTemplateColumns:"1fr 320px",maxWidth:1300,margin:"0 auto",padding:"0 24px 48px",alignItems:"start" },
  leftPanel:  { paddingRight:24,borderRight:"1px solid rgba(0,0,0,.07)" },
  weekHeader: { display:"flex",alignItems:"center",gap:10,padding:"14px 0",marginBottom:12,borderBottom:"2px solid var(--text)",flexWrap:"wrap" },
  weekDots:   { fontSize:10,letterSpacing:2,color:"var(--text)" },
  weekTitle:  { fontSize:12,fontWeight:800,letterSpacing:"0.07em",color:"var(--text)" },
  weekNavBtn: { width:28,height:28,borderRadius:"50%",border:"1.5px solid rgba(0,0,0,.12)",background:"rgba(255,255,255,.7)",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text)",fontWeight:700 },
  weekNavToday: { padding:"4px 12px",borderRadius:99,border:"1.5px solid rgba(99,102,241,.3)",background:"rgba(99,102,241,.08)",color:"var(--accent)",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Figtree',sans-serif" },
  calCard:    { background:"rgba(255,255,255,.6)",borderRadius:16,padding:"14px 16px",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,.85)",marginBottom:16,boxShadow:"0 2px 12px rgba(0,0,0,.05)" },
  calMonth:   { fontSize:11,fontWeight:800,letterSpacing:"0.1em",color:"var(--text)" },
  calNavBtn:  { background:"none",border:"none",cursor:"pointer",fontSize:16,fontWeight:700,color:"var(--text-soft)",padding:"0 4px",lineHeight:1 },
  calTh:      { fontSize:10,fontWeight:700,color:"#bbb",textAlign:"center",padding:"2px 0",width:28 },
  calTd:      { fontSize:11,textAlign:"center",padding:"3px 0",color:"var(--text)",lineHeight:1.8 },
  weekNum:    { fontSize:10,color:"#ccc",fontWeight:600 },
  calHighlight:{ background:"rgba(99,102,241,.1)",color:"var(--accent)",fontWeight:700 },
  daysGrid:   { display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10 },
  dayCard:    { background:"rgba(255,255,255,.65)",backdropFilter:"blur(14px)",border:"1px solid rgba(255,255,255,.9)",borderRadius:16,padding:"12px 14px",boxShadow:"0 2px 12px rgba(0,0,0,.05)",display:"flex",flexDirection:"column" },
  dayCardToday:{ border:"1.5px solid rgba(99,102,241,.3)",boxShadow:"0 0 0 3px rgba(99,102,241,.08),0 2px 12px rgba(0,0,0,.05)" },
  dayHeader:  { display:"flex",alignItems:"center",gap:8,marginBottom:8,borderBottom:"1px solid rgba(0,0,0,.07)",paddingBottom:8 },
  dayNum:     { fontSize:18,fontWeight:800,color:"var(--text)",lineHeight:1 },
  todayBadge: { fontSize:8,fontWeight:800,letterSpacing:"0.1em",background:"rgba(99,102,241,.15)",color:"var(--accent)",borderRadius:4,padding:"1px 5px",marginLeft:4,verticalAlign:"middle" },
  dayName:    { fontSize:9,fontWeight:700,letterSpacing:"0.12em",color:"var(--text-soft)",flex:1 },
  bookmarkIcon:{ fontSize:13,opacity:.3 },
  priorityTag:{ fontSize:8,fontWeight:600,padding:"2px 7px",borderRadius:99,border:"none",cursor:"pointer",letterSpacing:"0.06em",textTransform:"uppercase",transition:"all .15s" },
  moodBtn:    { background:"none",border:"none",cursor:"pointer",fontSize:13,padding:"1px 2px",borderRadius:5,transition:"all .15s" },
  checkbox:   { background:"none",border:"1px solid #e0e0e0",borderRadius:4,width:16,height:16,cursor:"pointer",fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--accent)",flexShrink:0,fontWeight:700 },
  taskInput:  { flex:1,background:"transparent",border:"none",outline:"none",fontFamily:"'Figtree',sans-serif",fontSize:12,color:"var(--text)",width:"100%" },
  deleteTaskBtn:{ background:"none",border:"none",cursor:"pointer",color:"#ccc",fontSize:10,padding:"0 2px",flexShrink:0 },
  noteArea:   { width:"100%",background:"transparent",border:"none",borderTop:"1px dashed rgba(0,0,0,.08)",outline:"none",fontFamily:"'Figtree',sans-serif",fontSize:12,color:"var(--text-soft)",resize:"none",paddingTop:6,lineHeight:1.6,boxSizing:"border-box" },
  rightWrapper:{ display:"flex",paddingLeft:0,position:"sticky",top:20,maxHeight:"100vh",overflowY:"auto" },
  monthTimeline:{ display:"flex",flexDirection:"column",alignItems:"center",paddingLeft:10,paddingRight:6,paddingTop:8,borderLeft:"1px solid rgba(0,0,0,.07)" },
  monthLabel: { fontSize:8,fontWeight:400,letterSpacing:"0.14em",padding:"8px 0",writingMode:"vertical-rl",textOrientation:"mixed",transition:"all .15s" },
  rightPanel: { flex:1,display:"flex",flexDirection:"column",gap:14,padding:"0 0 0 12px" },
  rightCard:  { background:"rgba(255,255,255,.65)",backdropFilter:"blur(14px)",border:"1px solid rgba(255,255,255,.9)",borderRadius:18,padding:"16px 18px",boxShadow:"0 2px 12px rgba(0,0,0,.05)" },
  weeklyNotesLabel:{ display:"inline-block",fontSize:10,fontWeight:800,letterSpacing:"0.1em",background:"rgba(99,102,241,.09)",color:"var(--accent)",border:"1.5px solid rgba(99,102,241,.2)",borderRadius:7,padding:"3px 9px" },
  mealPlanTitle:{ fontSize:15,fontWeight:800,fontFamily:"Georgia,serif",marginBottom:12,color:"var(--text)",borderBottom:"1px solid rgba(0,0,0,.06)",paddingBottom:8 },
  mealRow:    { display:"flex",alignItems:"flex-start",gap:10 },
  mealDot:    { width:30,height:30,borderRadius:9,background:"rgba(99,102,241,.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0 },
  mealInput:  { width:"100%",background:"transparent",border:"none",borderBottom:"1px dashed rgba(0,0,0,.09)",outline:"none",fontFamily:"'Figtree',sans-serif",fontSize:13,color:"var(--text)",padding:"2px 0",boxSizing:"border-box" },
  deleteMealBtn:{ background:"rgba(255,100,100,.08)",border:"1px solid rgba(255,100,100,.15)",borderRadius:6,color:"#ff6b6b",fontSize:10,fontWeight:700,cursor:"pointer",padding:"2px 6px",flexShrink:0,alignSelf:"center" },
  addMealBtn: { background:"none",border:"1px dashed rgba(99,102,241,.3)",borderRadius:8,color:"var(--accent)",fontSize:11,fontWeight:600,cursor:"pointer",padding:"5px 10px",fontFamily:"'Figtree',sans-serif" },
  affirmCard: { background:"linear-gradient(135deg,#1c1c2e,#2d2b55)",border:"none",textAlign:"center" },
  affirmText: { width:"100%",background:"transparent",border:"none",outline:"none",fontFamily:"Georgia,serif",fontWeight:800,fontSize:"clamp(15px,1.8vw,20px)",color:"#fff",textAlign:"center",letterSpacing:"0.05em",lineHeight:1.3,resize:"none",textTransform:"uppercase",boxSizing:"border-box" },
  chatCta:    { padding:"13px 20px",background:"var(--text)",color:"#fff",border:"none",borderRadius:99,fontFamily:"'Figtree',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 14px rgba(28,28,46,.25)",width:"100%" },
};
