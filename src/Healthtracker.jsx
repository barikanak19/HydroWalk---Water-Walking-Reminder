import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Data
// ─────────────────────────────────────────────────────────────────────────────
const MOTIVATIONS = [
  { text: "Drink water and keep your body energized 💧", icon: "💧" },
  { text: "A small walk every day keeps your body strong 🚶", icon: "🚶" },
  { text: "Healthy habits create a healthy life 🌿", icon: "🌿" },
  { text: "Your body is your temple — nourish it well 🏛️", icon: "🏛️" },
  { text: "Small steps lead to big health wins 🎯", icon: "🎯" },
  { text: "Hydration is the key to a glowing you ✨", icon: "✨" },
  { text: "Move more, drink more, live more 🌟", icon: "🌟" },
];
const DAILY_MSG = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const STEP_GOAL  = 6000;

// ─────────────────────────────────────────────────────────────────────────────
// Theme tokens  (light / dark)
// ─────────────────────────────────────────────────────────────────────────────
const LT = {
  pageBg:    "linear-gradient(160deg,#e0f2fe 0%,#ede9fe 50%,#f0fdf4 100%)",
  cardBg:    "white",
  cardBorder:"rgba(148,163,184,.15)",
  rowBg:     "#f8fafc",
  textPri:   "#1e293b",
  textSec:   "#64748b",
  textMid:   "#334155",
  inputBg:   "#f1f5f9",
  inputBorder:"#e2e8f0",
  barTrack:  "#e2e8f0",
  shadow:    "0 8px 24px rgba(0,0,0,.08)",
};
const DK = {
  pageBg:    "linear-gradient(160deg,#0f172a 0%,#1e1b4b 60%,#0f2027 100%)",
  cardBg:    "#1e293b",
  cardBorder:"rgba(255,255,255,.07)",
  rowBg:     "#0f172a",
  textPri:   "#f1f5f9",
  textSec:   "#94a3b8",
  textMid:   "#cbd5e1",
  inputBg:   "#0f172a",
  inputBorder:"rgba(255,255,255,.12)",
  barTrack:  "rgba(255,255,255,.1)",
  shadow:    "0 8px 24px rgba(0,0,0,.35)",
};

// ─────────────────────────────────────────────────────────────────────────────
// LocalStorage helpers
// ─────────────────────────────────────────────────────────────────────────────
const LS = {
  get: (k, fallback) => {
    try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

function todayStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

// Build / maintain rolling 7-day water log
function buildWeekLog(existing) {
  const today = new Date();
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const found = existing?.find(e => e.date === key);
    return { date: key, day: DAYS_SHORT[d.getDay()], ml: found?.ml ?? 0 };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Misc helpers
// ─────────────────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 9); }
function formatTime12(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  return `${String(h % 12 || 12).padStart(2,"0")}:${String(m).padStart(2,"0")} ${h>=12?"PM":"AM"}`;
}
function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Icons
// ─────────────────────────────────────────────────────────────────────────────
const WaterDropIcon = ({ size=24, color="white" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2C12 2 4 9.5 4 14.5C4 18.6 7.6 22 12 22C16.4 22 20 18.6 20 14.5C20 9.5 12 2 12 2Z"/>
  </svg>
);
const FootIcon = ({ size=20, color="currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <ellipse cx="9" cy="6" rx="3" ry="4.5"/>
    <ellipse cx="15.5" cy="8" rx="2.2" ry="3.5"/>
    <path d="M6 13c0 3.5 2.5 8 6.5 8s7.5-3 7.5-7c0-2-1-3.5-3-4.5C15 8.5 12 9 10 11c-1.5 0-4 .5-4 2z"/>
  </svg>
);
const GearIcon = ({ size=15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const BellIcon    = ({ size=18, color="currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const BellOffIcon = ({ size=18, color="currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round">
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/>
    <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/><path d="M18 8a6 6 0 0 0-9.33-5"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const TrashIcon   = ({ size=16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const PlusIcon    = ({ size=16, color="currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const ClockIcon   = ({ size=16, color="currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const SunIconSVG  = ({ size=18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5"/>
    {[0,60,120,180,240,300].map((a,i)=>{const r=Math.PI*a/180;return(
      <line key={i} x1={12+8*Math.cos(r)} y1={12+8*Math.sin(r)} x2={12+10*Math.cos(r)} y2={12+10*Math.sin(r)}/>
    );})}
  </svg>
);
const MoonIconSVG = ({ size=16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#818cf8" stroke="#818cf8" strokeWidth="1">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const StepIcon    = ({ size=20, color="currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/>
  </svg>
);
const FireIcon    = ({ size=20, color="#f97316" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2C8.5 7 6 10 6 14a6 6 0 0 0 12 0c0-1.5-.5-3-1.5-4.5C15.5 11 15 12 14 12c0-3-1-7-2-10z"/>
    <path d="M12 18c-1.7 0-3-1.3-3-3 0-1.2.7-2.5 2-3.5-.2 1 .3 2 1 2.5.5-1 .5-2 0-3 1.5 1 2 2.5 2 4 0 1.7-1.3 3-2 3z" fill="white" opacity=".6"/>
  </svg>
);
const DownloadIcon = ({ size=18, color="currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const MoonToggleIcon = ({ size=16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const SunToggleIcon = ({ size=16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5"/>
    {[0,45,90,135,180,225,270,315].map((a,i)=>{const r=Math.PI*a/180;return(
      <line key={i} x1={12+8*Math.cos(r)} y1={12+8*Math.sin(r)} x2={12+10*Math.cos(r)} y2={12+10*Math.sin(r)}/>
    );})}
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Toggle Switch
// ─────────────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, small }) {
  const w=small?38:48, h=small?22:26, thumb=small?16:20;
  return (
    <button onClick={()=>onChange(!checked)} style={{
      width:w,height:h,borderRadius:h/2,border:"none",cursor:"pointer",
      background:checked?"linear-gradient(135deg,#60a5fa,#818cf8)":"#cbd5e1",
      position:"relative",transition:"background .3s",flexShrink:0,
      boxShadow:checked?"0 0 10px rgba(99,102,241,.4)":"none",
    }}>
      <span style={{
        position:"absolute",top:(h-thumb)/2,
        left:checked?w-thumb-(h-thumb)/2:(h-thumb)/2,
        width:thumb,height:thumb,borderRadius:"50%",background:"white",
        transition:"left .3s",boxShadow:"0 2px 6px rgba(0,0,0,.2)",
      }}/>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Label Row
// ─────────────────────────────────────────────────────────────────────────────
function SectionLabel({ icon, emoji, gradient, children, dm }) {
  const T = dm ? DK : LT;
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
      <div style={{background:gradient,borderRadius:10,width:34,height:34,
        display:"flex",alignItems:"center",justifyContent:"center",
        color:"white",fontSize:emoji?18:undefined}}>
        {emoji||icon}
      </div>
      <h2 style={{fontSize:18,fontWeight:800,color:T.textPri,fontFamily:"Nunito",margin:0}}>
        {children}
      </h2>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Settings Modal
// ─────────────────────────────────────────────────────────────────────────────
function SettingsModal({ settings, onSave, onClose, dm }) {
  const T = dm ? DK : LT;
  const [lg, setLg] = useState(settings.dailyGoal);
  const [ll, setLl] = useState(settings.glassSize);
  const [lr, setLr] = useState(settings.remindersOn);
  const goals  = [1500,2000,2500,3000];
  const glasses= [150,200,250,300,350];

  return (
    <div onClick={onClose} style={{
      position:"fixed",inset:0,zIndex:1000,
      background:"rgba(15,23,42,.6)",backdropFilter:"blur(4px)",
      display:"flex",alignItems:"flex-end",justifyContent:"center",
      animation:"fadeIn .2s ease",
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:"100%",maxWidth:420,background:T.cardBg,
        borderRadius:"24px 24px 0 0",padding:"0 20px 36px",
        boxShadow:"0 -8px 40px rgba(0,0,0,.3)",
        animation:"slideUp .32s cubic-bezier(.34,1.4,.64,1)",
      }}>
        <div style={{display:"flex",justifyContent:"center",padding:"14px 0 6px"}}>
          <div style={{width:40,height:4,borderRadius:99,background:T.barTrack}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22,marginTop:6}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{background:"linear-gradient(135deg,#1d4ed8,#6d28d9)",borderRadius:10,width:38,height:38,
              display:"flex",alignItems:"center",justifyContent:"center",color:"white"}}>
              <GearIcon/>
            </div>
            <div>
              <h2 style={{margin:0,fontSize:17,fontWeight:800,fontFamily:"Nunito",color:T.textPri}}>Settings</h2>
              <p style={{margin:0,fontSize:11,color:T.textSec,fontFamily:"Nunito"}}>Customise your hydration goals</p>
            </div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",border:"none",
            background:T.rowBg,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",
            justifyContent:"center",color:T.textSec,fontWeight:700}}>✕</button>
        </div>

        <p style={{margin:"0 0 10px",fontSize:13,fontWeight:700,color:T.textSec,fontFamily:"Nunito"}}>💧 Daily Water Goal</p>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {goals.map(g=>(
            <button key={g} onClick={()=>setLg(g)} style={{
              flex:1,padding:"10px 0",borderRadius:12,
              border:`2px solid ${lg===g?"#3b82f6":T.inputBorder}`,
              background:lg===g?"linear-gradient(135deg,#eff6ff,#eef2ff)":T.inputBg,
              color:lg===g?"#1d4ed8":T.textSec,
              fontSize:12,fontWeight:700,fontFamily:"Nunito",cursor:"pointer",transition:"all .2s",
              boxShadow:lg===g?"0 4px 12px rgba(59,130,246,.2)":"none",
            }}>{g}<br/><span style={{fontSize:10}}>ml</span></button>
          ))}
        </div>

        <p style={{margin:"0 0 10px",fontSize:13,fontWeight:700,color:T.textSec,fontFamily:"Nunito"}}>🥛 Glass Size</p>
        <div style={{display:"flex",gap:7,marginBottom:22}}>
          {glasses.map(g=>(
            <button key={g} onClick={()=>setLl(g)} style={{
              flex:1,padding:"10px 2px",borderRadius:12,
              border:`2px solid ${ll===g?"#3b82f6":T.inputBorder}`,
              background:ll===g?"linear-gradient(135deg,#eff6ff,#eef2ff)":T.inputBg,
              color:ll===g?"#1d4ed8":T.textSec,
              fontSize:11,fontWeight:700,fontFamily:"Nunito",cursor:"pointer",transition:"all .2s",
              boxShadow:ll===g?"0 4px 12px rgba(59,130,246,.2)":"none",
            }}>{g}<br/><span style={{fontSize:9}}>ml</span></button>
          ))}
        </div>

        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          background:T.rowBg,borderRadius:14,padding:"14px 16px",marginBottom:24,
          border:`1px solid ${T.inputBorder}`}}>
          <div>
            <p style={{margin:0,fontSize:14,fontWeight:700,color:T.textPri,fontFamily:"Nunito"}}>🔔 Reminders</p>
            <p style={{margin:0,fontSize:11,color:T.textSec,fontFamily:"Nunito"}}>Hydration &amp; walk alerts</p>
          </div>
          <Toggle checked={lr} onChange={setLr}/>
        </div>

        <button onClick={()=>{onSave({dailyGoal:lg,glassSize:ll,remindersOn:lr});onClose();}} style={{
          width:"100%",padding:"14px 0",borderRadius:14,border:"none",cursor:"pointer",
          background:"linear-gradient(135deg,#1d4ed8,#6d28d9)",color:"white",
          fontSize:15,fontWeight:800,fontFamily:"Nunito",boxShadow:"0 6px 20px rgba(29,78,216,.35)"}}>
          ✅ Save Settings
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Welcome Screen
// ─────────────────────────────────────────────────────────────────────────────
function WelcomeScreen({ onDone }) {
  const [phase,setPhase]=useState("in");
  useEffect(()=>{
    const t1=setTimeout(()=>setPhase("stay"),600);
    const t2=setTimeout(()=>setPhase("out"),2400);
    const t3=setTimeout(()=>onDone(),3000);
    return()=>[t1,t2,t3].forEach(clearTimeout);
  },[]);
  const op=phase==="stay"?1:0;
  return (
    <div style={{position:"fixed",inset:0,zIndex:999,
      background:"linear-gradient(135deg,#1e3a8a 0%,#4c1d95 50%,#6d28d9 100%)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      transition:phase==="out"?"opacity .6s ease":"opacity .8s ease",
      opacity:phase==="out"?0:1,overflow:"hidden"}}>
      {[{s:180,x:"10%",y:"5%",c:"rgba(96,165,250,.15)",d:0},{s:120,x:"70%",y:"15%",c:"rgba(167,139,250,.2)",d:.5},
        {s:90,x:"5%",y:"70%",c:"rgba(129,140,248,.15)",d:.8},{s:150,x:"65%",y:"65%",c:"rgba(59,130,246,.12)",d:.3}]
        .map((b,i)=><div key={i} style={{position:"absolute",width:b.s,height:b.s,borderRadius:"50%",
          background:b.c,left:b.x,top:b.y,animation:`float 4s ease-in-out ${b.d}s infinite alternate`}}/>)}
      <div style={{position:"relative",width:140,height:140,marginBottom:32,transition:"opacity .8s",opacity:op}}>
        {[{e:"💧",a:0},{e:"❤️",a:72},{e:"🌿",a:144},{e:"🏃",a:216},{e:"⭐",a:288}].map(({e,a},i)=>{
          const r=Math.PI*a/180,x=60+55*Math.cos(r-Math.PI/2),y=60+55*Math.sin(r-Math.PI/2);
          return <div key={i} style={{position:"absolute",left:x,top:y,fontSize:22,
            animation:`orbit ${3+i*.4}s ease-in-out ${i*.2}s infinite alternate`,
            transform:"translate(-50%,-50%)"}}>{e}</div>;
        })}
        <div style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",
          fontSize:52,animation:"pulse 1.5s ease-in-out infinite"}}>💧</div>
      </div>
      <div style={{textAlign:"center",color:"white",padding:"0 32px",transition:"opacity .8s",opacity:op}}>
        <p style={{fontSize:26,fontWeight:700,margin:0,lineHeight:1.4,fontFamily:"'Nunito',sans-serif"}}>Welcome Dear 👋</p>
        <p style={{fontSize:17,margin:"12px 0 0",color:"rgba(255,255,255,.85)",fontFamily:"'Nunito',sans-serif",fontWeight:500}}>
          Stay Healthy &amp; Stay Hydrated 💧
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Header  (live clock + dark mode toggle)
// ─────────────────────────────────────────────────────────────────────────────
function Header({ dm, setDm }) {
  const T = dm ? DK : LT;
  const [now,setNow]=useState(new Date());
  useEffect(()=>{const id=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(id);},[]);
  const day  = now.toLocaleDateString("en-US",{weekday:"long"});
  const date = now.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
  const h12  = String(now.getHours()%12||12).padStart(2,"0");
  const mins = String(now.getMinutes()).padStart(2,"0");
  const secs = String(now.getSeconds()).padStart(2,"0");
  const ampm = now.getHours()>=12?"PM":"AM";

  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
      marginBottom:20,animation:"fadeSlide .5s ease .3s both"}}>
      <div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
          <p style={{fontSize:13,color:T.textSec,fontFamily:"Nunito",fontWeight:600,margin:0}}>
            Your daily health companion
          </p>
          {/* Dark mode toggle inline */}
          <button onClick={()=>setDm(p=>!p)} title={dm?"Switch to Light":"Switch to Dark"} style={{
            display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:20,border:"none",
            background:dm?"linear-gradient(135deg,#1e293b,#334155)":"linear-gradient(135deg,#fbbf24,#f59e0b)",
            cursor:"pointer",fontSize:11,fontWeight:700,color:dm?"#e2e8f0":"#78350f",
            fontFamily:"Nunito",boxShadow:"0 2px 8px rgba(0,0,0,.15)",transition:"all .3s",
          }}>
            {dm?<><MoonToggleIcon size={12}/>Dark</>:<><SunToggleIcon size={12}/>Light</>}
          </button>
        </div>
        <h1 style={{fontSize:22,fontWeight:900,color:T.textPri,fontFamily:"Nunito",lineHeight:1.2,margin:0}}>
          HydroWalk 💧🚶
        </h1>
      </div>
      {/* Clock card */}
      <div style={{background:"linear-gradient(135deg,#1d4ed8 0%,#4338ca 60%,#6d28d9 100%)",
        borderRadius:18,padding:"10px 14px",boxShadow:"0 6px 24px rgba(67,56,202,.4)",
        textAlign:"center",minWidth:100,flexShrink:0}}>
        <p style={{margin:0,fontSize:10,fontWeight:800,fontFamily:"Nunito",
          color:"rgba(255,255,255,.65)",letterSpacing:1,textTransform:"uppercase",lineHeight:1}}>{day}</p>
        <p style={{margin:"4px 0 2px",fontFamily:"Nunito",fontWeight:900,fontSize:22,color:"white",lineHeight:1,letterSpacing:-.5}}>
          {h12}:{mins}<span style={{fontSize:13,fontWeight:700,opacity:.75,marginLeft:1}}>:{secs}</span>
          <span style={{fontSize:11,fontWeight:800,marginLeft:4,color:"#bfdbfe"}}>{ampm}</span>
        </p>
        <p style={{margin:0,fontSize:10,fontWeight:700,fontFamily:"Nunito",color:"rgba(255,255,255,.6)",lineHeight:1}}>{date}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Water Ring
// ─────────────────────────────────────────────────────────────────────────────
function WaterRing({ pct }) {
  const r=52,circ=2*Math.PI*r;
  return (
    <svg width={130} height={130} viewBox="0 0 130 130">
      <defs>
        <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa"/><stop offset="100%" stopColor="#818cf8"/>
        </linearGradient>
      </defs>
      <circle cx={65} cy={65} r={r} fill="none" stroke="rgba(255,255,255,.15)" strokeWidth={10}/>
      <circle cx={65} cy={65} r={r} fill="none" stroke="url(#rg)" strokeWidth={10}
        strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)}
        strokeLinecap="round" transform="rotate(-90 65 65)"
        style={{transition:"stroke-dashoffset .8s cubic-bezier(.4,0,.2,1)"}}/>
      <text x={65} y={60} textAnchor="middle" fill="white" fontSize={22} fontWeight="800" fontFamily="Nunito">
        {Math.round(pct)}%
      </text>
      <text x={65} y={78} textAnchor="middle" fill="rgba(255,255,255,.7)" fontSize={11} fontFamily="Nunito">hydrated</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hydration Section
// ─────────────────────────────────────────────────────────────────────────────
function HydrationSection({ consumed, setConsumed, settings, onOpenSettings }) {
  const { dailyGoal:GOAL, glassSize:ML } = settings;
  const GLASSES = Math.round(GOAL/ML);
  const [animate,setAnimate]=useState(false);
  const glasses=Math.floor(consumed/ML);
  const pct=Math.min((consumed/GOAL)*100,100);
  const msg=consumed===0?"Let's start hydrating! 🌊":pct<25?"Great start! Keep sipping 💧":
    pct<50?"You're doing well! Halfway there 🌊":pct<75?"Excellent progress! Almost there ⭐":
    pct<100?"So close! One more push 🔥":"Goal achieved! Amazing work 🎉";

  const drink=()=>{
    if(consumed>=GOAL)return;
    setAnimate(true);
    setConsumed(p=>Math.min(p+ML,GOAL));
    setTimeout(()=>setAnimate(false),400);
  };

  return (
    <div style={{marginBottom:24}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <div style={{background:"linear-gradient(135deg,#1d4ed8,#4338ca)",borderRadius:10,width:34,height:34,
          display:"flex",alignItems:"center",justifyContent:"center"}}>
          <WaterDropIcon size={18}/>
        </div>
        <h2 style={{fontSize:18,fontWeight:800,color:"inherit",fontFamily:"Nunito",margin:0}}>Water Reminder 💧</h2>
      </div>
      <div style={{background:"linear-gradient(150deg,#1d4ed8 0%,#4338ca 60%,#6d28d9 100%)",
        borderRadius:24,padding:24,boxShadow:"0 12px 40px rgba(29,78,216,.35)",position:"relative",overflow:"hidden"}}>
        {[[80,20,60,.08],[160,140,40,.06],[20,120,30,.07]].map(([l,t,s,o],i)=>(
          <div key={i} style={{position:"absolute",left:l,top:t,width:s,height:s,
            borderRadius:"50%",background:`rgba(255,255,255,${o})`,pointerEvents:"none"}}/>
        ))}
        <div style={{marginBottom:4,position:"relative"}}>
          <h2 style={{margin:0,color:"white",fontSize:18,fontWeight:800,fontFamily:"Nunito"}}>Water Reminder</h2>
          <p style={{margin:0,color:"rgba(255,255,255,.7)",fontSize:12,fontFamily:"Nunito"}}>
            Goal: {GOAL}ml · Glass: {ML}ml · Stay hydrated 💙
          </p>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",margin:"20px 0 16px"}}>
          <WaterRing pct={pct}/>
          <div style={{flex:1,marginLeft:20}}>
            <div style={{color:"white",fontFamily:"Nunito"}}>
              <div style={{fontSize:13,color:"rgba(255,255,255,.7)",marginBottom:4}}>Consumed</div>
              <div style={{fontSize:30,fontWeight:900,lineHeight:1}}>{consumed}
                <span style={{fontSize:14,fontWeight:600}}> ml</span></div>
              <div style={{fontSize:13,color:"rgba(255,255,255,.65)"}}>of {GOAL}ml</div>
            </div>
            <div style={{marginTop:14,color:"white",fontFamily:"Nunito"}}>
              <div style={{fontSize:12,color:"rgba(255,255,255,.7)",marginBottom:6}}>{glasses} of {GLASSES} glasses</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {Array.from({length:Math.min(GLASSES,10)}).map((_,i)=>(
                  <div key={i} style={{width:20,height:20,borderRadius:5,
                    background:i<glasses?"rgba(255,255,255,.9)":"rgba(255,255,255,.2)",
                    display:"flex",alignItems:"center",justifyContent:"center",transition:"background .4s",fontSize:9}}>
                    {i<glasses&&<span style={{color:"#3b82f6"}}>💧</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{background:"rgba(255,255,255,.2)",borderRadius:99,height:8,marginBottom:8,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:99,background:"linear-gradient(90deg,#bfdbfe,white)",
            width:`${pct}%`,transition:"width .8s cubic-bezier(.4,0,.2,1)"}}/>
        </div>
        <p style={{color:"rgba(255,255,255,.8)",fontSize:12,fontFamily:"Nunito",margin:"0 0 18px",textAlign:"center"}}>{msg}</p>
        <button onClick={drink} style={{
          width:"100%",padding:"14px 0",borderRadius:14,border:"none",cursor:"pointer",
          background:consumed>=GOAL?"rgba(255,255,255,.3)":"white",
          color:consumed>=GOAL?"rgba(255,255,255,.6)":"#1d4ed8",
          fontSize:15,fontWeight:800,fontFamily:"Nunito",boxShadow:"0 4px 20px rgba(0,0,0,.15)",
          transform:animate?"scale(.96)":"scale(1)",transition:"transform .2s",marginBottom:10}}>
          {consumed>=GOAL?"🎉 Daily Goal Achieved!":`💧 Drink Water +${ML}ml`}
        </button>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onOpenSettings} style={{flex:1,padding:"11px 0",borderRadius:12,
            border:"1.5px solid rgba(255,255,255,.5)",background:"rgba(255,255,255,.18)",
            color:"white",fontSize:13,fontWeight:700,fontFamily:"Nunito",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <GearIcon/> Settings
          </button>
          <button onClick={()=>setConsumed(0)} style={{flex:1,padding:"11px 0",borderRadius:12,
            border:"1.5px solid rgba(255,255,255,.5)",background:"rgba(255,255,255,.18)",
            color:"white",fontSize:13,fontWeight:700,fontFamily:"Nunito",cursor:"pointer"}}>
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hydration Streak Card  🔥
// ─────────────────────────────────────────────────────────────────────────────
function HydrationStreak({ streak, dm }) {
  const T = dm ? DK : LT;
  const milestones = [3,7,14,30,60,100];
  const next = milestones.find(m=>m>streak) || milestones[milestones.length-1];
  const pct  = Math.min((streak/next)*100,100);

  const getBadge = () => {
    if(streak>=100) return {label:"Legendary 🏆",color:"#f59e0b"};
    if(streak>=60)  return {label:"Elite 💎",color:"#818cf8"};
    if(streak>=30)  return {label:"Champion 🥇",color:"#f97316"};
    if(streak>=14)  return {label:"Dedicated 🌟",color:"#10b981"};
    if(streak>=7)   return {label:"On Fire 🔥",color:"#ef4444"};
    if(streak>=3)   return {label:"Building 💪",color:"#3b82f6"};
    return {label:"Just Started 🌱",color:"#6b7280"};
  };
  const badge = getBadge();

  return (
    <div style={{background:dm
      ?"linear-gradient(135deg,#431407,#7c2d12,#9a3412)"
      :"linear-gradient(135deg,#fff7ed,#fed7aa,#fb923c)",
      borderRadius:20,padding:20,marginBottom:16,
      boxShadow:dm?"0 8px 24px rgba(251,146,60,.2)":"0 8px 24px rgba(251,146,60,.3)",
      border:dm?"1px solid rgba(251,146,60,.2)":"1px solid rgba(255,255,255,.7)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{background:dm?"rgba(251,146,60,.3)":"rgba(255,255,255,.6)",borderRadius:12,
            width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:"0 4px 12px rgba(249,115,22,.3)",fontSize:24}}>
            🔥
          </div>
          <div>
            <h3 style={{margin:0,fontSize:17,fontWeight:800,fontFamily:"Nunito",
              color:dm?"#fed7aa":"#7c2d12"}}>Hydration Streak</h3>
            <p style={{margin:0,fontSize:11,color:dm?"rgba(254,215,170,.7)":"#9a3412",fontFamily:"Nunito"}}>
              Keep hitting your daily goal!
            </p>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:36,fontWeight:900,lineHeight:1,fontFamily:"Nunito",
            color:dm?"#fb923c":"#c2410c"}}>{streak}</div>
          <div style={{fontSize:11,fontWeight:700,fontFamily:"Nunito",
            color:dm?"rgba(254,215,170,.7)":"#9a3412"}}>{streak===1?"Day":"Days"}</div>
        </div>
      </div>

      {/* Progress to next milestone */}
      <div style={{marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <span style={{fontSize:11,fontWeight:700,fontFamily:"Nunito",
            color:dm?"rgba(254,215,170,.8)":"#9a3412"}}>Next milestone: {next} days</span>
          <span style={{fontSize:11,fontWeight:700,fontFamily:"Nunito",
            color:dm?"#fb923c":"#c2410c"}}>{streak}/{next}</span>
        </div>
        <div style={{background:dm?"rgba(255,255,255,.1)":"rgba(255,255,255,.5)",borderRadius:99,height:8,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:99,
            background:dm?"linear-gradient(90deg,#f97316,#fbbf24)":"linear-gradient(90deg,#ea580c,#f97316)",
            width:`${pct}%`,transition:"width .8s ease"}}/>
        </div>
      </div>

      {/* Badge */}
      <div style={{display:"inline-flex",alignItems:"center",gap:6,
        background:dm?"rgba(255,255,255,.1)":"rgba(255,255,255,.55)",
        borderRadius:99,padding:"4px 12px"}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:badge.color}}/>
        <span style={{fontSize:12,fontWeight:800,fontFamily:"Nunito",
          color:dm?"#fed7aa":"#7c2d12"}}>{badge.label}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step Counter Card  — DeviceMotion pedometer 🚶
// ─────────────────────────────────────────────────────────────────────────────

/*  Algorithm
    ─────────
    We listen to the DeviceMotion `acceleration` vector (no gravity).
    If that isn't available we fall back to `accelerationIncludingGravity`
    and subtract a running baseline so we work on the gravity-free delta.

    Step detection (peak-valley method):
      • Compute magnitude = √(x²+y²+z²) of the *filtered* signal.
      • Apply a light low-pass filter to smooth high-frequency noise.
      • A step is counted when:
          – the smoothed magnitude rises above STEP_THRESHOLD   (peak)
          – AND at least STEP_MIN_GAP ms have elapsed since the last step
          – AND the signal was below LOW_THRESHOLD before the spike (valley)
    This gives reliable ~1 count per footfall without double-counting.
*/

const STEP_THRESHOLD = 2.8;   // m/s²  – spike needed to register a step
const LOW_THRESHOLD  = 1.2;   // m/s²  – must dip below this between steps
const STEP_MIN_GAP   = 280;   // ms    – ignore spikes closer than this

function StepCounter({ steps, setSteps, dm }) {
  const T = dm ? DK : LT;
  const pct = Math.min((steps / STEP_GOAL) * 100, 100);

  // sensor / UI state
  const [tracking,    setTracking]    = useState(false);
  const [sensorState, setSensorState] = useState("idle");
  // "idle" | "requesting" | "active" | "unavailable" | "denied"

  // ripple animation when a step is counted
  const [ripple, setRipple] = useState(false);

  // ── internals kept in refs so event handler closure stays stable ──
  const smoothRef      = useRef(0);   // low-pass filtered magnitude
  const wasLowRef      = useRef(true);// true when signal was in valley
  const lastStepTsRef  = useRef(0);   // timestamp of last counted step
  const baselineRef    = useRef(null);// running mean for grav fallback
  const stepAccumRef   = useRef(0);   // pending steps to flush to state
  const flushTimerRef  = useRef(null);

  // Batch step increments to reduce re-renders (flush every 500ms)
  const flushSteps = useCallback(() => {
    if (stepAccumRef.current > 0) {
      setSteps(p => p + stepAccumRef.current);
      setRipple(true);
      setTimeout(() => setRipple(false), 350);
      stepAccumRef.current = 0;
    }
  }, [setSteps]);

  const handleMotion = useCallback((e) => {
    // Prefer pure acceleration (no gravity) – available on Android + modern iOS
    let ax = e.acceleration?.x;
    let ay = e.acceleration?.y;
    let az = e.acceleration?.z;

    // Fallback: use accelerationIncludingGravity and subtract running mean
    if (ax == null || (ax === 0 && ay === 0 && az === 0)) {
      const gx = e.accelerationIncludingGravity?.x ?? 0;
      const gy = e.accelerationIncludingGravity?.y ?? 0;
      const gz = e.accelerationIncludingGravity?.z ?? 0;

      if (baselineRef.current === null) {
        baselineRef.current = { x: gx, y: gy, z: gz };
      } else {
        // Slowly track the gravity component (0.98 low-pass, 0.02 new sample)
        baselineRef.current.x = 0.98 * baselineRef.current.x + 0.02 * gx;
        baselineRef.current.y = 0.98 * baselineRef.current.y + 0.02 * gy;
        baselineRef.current.z = 0.98 * baselineRef.current.z + 0.02 * gz;
      }
      ax = gx - baselineRef.current.x;
      ay = gy - baselineRef.current.y;
      az = gz - baselineRef.current.z;
    }

    // Magnitude + low-pass filter (alpha = 0.3 → keeps 30% of new sample)
    const mag = Math.sqrt(ax * ax + ay * ay + az * az);
    const ALPHA = 0.3;
    smoothRef.current = ALPHA * mag + (1 - ALPHA) * smoothRef.current;
    const s = smoothRef.current;

    const now = Date.now();
    const gap = now - lastStepTsRef.current;

    if (wasLowRef.current && s > STEP_THRESHOLD && gap > STEP_MIN_GAP) {
      // ─ count a step ─
      lastStepTsRef.current = now;
      wasLowRef.current = false;
      stepAccumRef.current += 1;

      // Flush after a short delay so rapid footfalls batch together
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = setTimeout(flushSteps, 500);
    } else if (s < LOW_THRESHOLD) {
      wasLowRef.current = true;
    }
  }, [flushSteps]);

  // ── Start / stop sensor ──
  const startTracking = async () => {
    setSensorState("requesting");

    // iOS 13+ requires explicit permission for DeviceMotion
    if (typeof DeviceMotionEvent === "undefined") {
      setSensorState("unavailable"); return;
    }
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      try {
        const perm = await DeviceMotionEvent.requestPermission();
        if (perm !== "granted") { setSensorState("denied"); return; }
      } catch {
        setSensorState("denied"); return;
      }
    }

    window.addEventListener("devicemotion", handleMotion, { passive: true });
    setTracking(true);
    setSensorState("active");
  };

  const stopTracking = () => {
    window.removeEventListener("devicemotion", handleMotion);
    clearTimeout(flushTimerRef.current);
    flushSteps();             // flush any remaining buffered steps
    setTracking(false);
    setSensorState("idle");
  };

  // Cleanup on unmount
  useEffect(() => () => {
    window.removeEventListener("devicemotion", handleMotion);
    clearTimeout(flushTimerRef.current);
  }, [handleMotion]);

  // ── Check desktop (no motion support) on mount ──
  useEffect(() => {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile && typeof DeviceMotionEvent === "undefined") {
      setSensorState("unavailable");
    }
  }, []);

  const getMsg = () => {
    if (steps === 0)  return "Tap Start to begin tracking 📱";
    if (pct < 25)     return "Warming up! Keep moving 💪";
    if (pct < 50)     return "Great momentum! 🌟";
    if (pct < 75)     return "You're killing it! ⚡";
    if (pct < 100)    return "Almost there! Final push 🔥";
    return "Daily goal crushed! 🎉";
  };

  const kmApprox  = ((steps * 0.762) / 1000).toFixed(2);
  const calApprox = Math.round(steps * 0.04);

  const accentGreen = dm ? "#34d399" : "#047857";
  const mutedGreen  = dm ? "rgba(167,243,208,.7)" : "#065f46";
  const statBg      = dm ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.55)";
  const statText    = dm ? "#a7f3d0" : "#064e3b";

  return (
    <div style={{
      background: dm
        ? "linear-gradient(135deg,#064e3b,#065f46,#047857)"
        : "linear-gradient(135deg,#ecfdf5,#d1fae5,#6ee7b7)",
      borderRadius: 20, padding: 20, marginBottom: 16,
      boxShadow: dm ? "0 8px 24px rgba(16,185,129,.2)" : "0 8px 24px rgba(16,185,129,.25)",
      border: dm ? "1px solid rgba(16,185,129,.2)" : "1px solid rgba(255,255,255,.7)",
      position: "relative", overflow: "hidden",
    }}>

      {/* Ripple flash when step counted */}
      {ripple && (
        <div style={{
          position:"absolute",inset:0,borderRadius:20,pointerEvents:"none",
          background:"rgba(52,211,153,.18)",animation:"fadeIn .35s ease",
        }}/>
      )}

      {/* ── Header row ── */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{
            background: dm ? "rgba(52,211,153,.25)" : "rgba(255,255,255,.6)",
            borderRadius:12, width:44, height:44,
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 4px 12px rgba(16,185,129,.25)",
            animation: tracking ? "pulse2 1.4s ease-in-out infinite" : "none",
          }}>
            <StepIcon size={22} color={accentGreen}/>
          </div>
          <div>
            <h3 style={{margin:0,fontSize:17,fontWeight:800,fontFamily:"Nunito",color:statText}}>
              Step Counter
            </h3>
            <p style={{margin:0,fontSize:11,fontFamily:"Nunito",color:mutedGreen}}>
              {tracking ? "🟢 Sensor active — walk now!" : `Goal: ${STEP_GOAL.toLocaleString()} steps`}
            </p>
          </div>
        </div>
        {/* Live step count */}
        <div style={{textAlign:"right"}}>
          <div style={{
            fontSize:32,fontWeight:900,lineHeight:1,fontFamily:"Nunito",color:accentGreen,
            transition:"transform .15s",
            transform: ripple ? "scale(1.12)" : "scale(1)",
          }}>{steps.toLocaleString()}</div>
          <div style={{fontSize:11,fontWeight:700,fontFamily:"Nunito",color:mutedGreen}}>steps</div>
        </div>
      </div>

      {/* ── Unavailable banner (desktop) ── */}
      {sensorState === "unavailable" && (
        <div style={{
          background:"rgba(0,0,0,.12)",borderRadius:14,padding:"12px 14px",marginBottom:14,
          display:"flex",alignItems:"center",gap:10,
        }}>
          <span style={{fontSize:22}}>📵</span>
          <div>
            <p style={{margin:0,fontSize:13,fontWeight:800,fontFamily:"Nunito",color:statText}}>
              Step tracking works on mobile devices.
            </p>
            <p style={{margin:0,fontSize:11,fontFamily:"Nunito",color:mutedGreen,lineHeight:1.4}}>
              Open HydroWalk on your smartphone and walk with it to auto-count steps.
            </p>
          </div>
        </div>
      )}

      {/* ── Permission denied banner ── */}
      {sensorState === "denied" && (
        <div style={{
          background:"rgba(239,68,68,.15)",borderRadius:14,padding:"12px 14px",marginBottom:14,
        }}>
          <p style={{margin:0,fontSize:13,fontWeight:800,fontFamily:"Nunito",color:"#ef4444"}}>
            ⚠️ Motion permission denied.
          </p>
          <p style={{margin:0,fontSize:11,fontFamily:"Nunito",color:mutedGreen,lineHeight:1.4,marginTop:3}}>
            Go to Settings → Safari → Motion &amp; Orientation Access and allow it, then reload.
          </p>
        </div>
      )}

      {/* ── Stats row ── */}
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {[
          {label:"Distance", val:`${kmApprox} km`,   icon:"📍"},
          {label:"Calories",  val:`${calApprox} kcal`,icon:"🔥"},
          {label:"Goal",      val:`${Math.round(pct)}%`,icon:"🎯"},
        ].map((s,i)=>(
          <div key={i} style={{flex:1,background:statBg,borderRadius:12,padding:"8px 6px",textAlign:"center"}}>
            <div style={{fontSize:14,marginBottom:2}}>{s.icon}</div>
            <div style={{fontSize:13,fontWeight:800,fontFamily:"Nunito",color:statText}}>{s.val}</div>
            <div style={{fontSize:9,fontFamily:"Nunito",color:mutedGreen}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Progress bar ── */}
      <div style={{background:dm?"rgba(255,255,255,.1)":"rgba(255,255,255,.5)",
        borderRadius:99,height:10,marginBottom:8,overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:99,
          background:dm?"linear-gradient(90deg,#34d399,#6ee7b7)":"linear-gradient(90deg,#059669,#10b981)",
          width:`${pct}%`,transition:"width .6s cubic-bezier(.4,0,.2,1)"}}/>
      </div>
      <p style={{fontSize:12,fontFamily:"Nunito",margin:"0 0 14px",textAlign:"center",
        color:dm?"rgba(167,243,208,.8)":"#065f46",fontWeight:600}}>{getMsg()}</p>

      {/* ── Controls ── */}
      <div style={{display:"flex",gap:10}}>
        {sensorState !== "unavailable" && (
          <button
            onClick={tracking ? stopTracking : startTracking}
            disabled={sensorState === "requesting"}
            style={{
              flex:1,padding:"12px 0",borderRadius:14,border:"none",cursor:"pointer",
              background: tracking
                ? "rgba(239,68,68,.18)"
                : dm ? "rgba(52,211,153,.22)" : "rgba(255,255,255,.75)",
              color: tracking ? "#ef4444" : accentGreen,
              fontSize:14,fontWeight:800,fontFamily:"Nunito",
              boxShadow:"0 4px 16px rgba(0,0,0,.1)",
              transition:"all .25s",
              display:"flex",alignItems:"center",justifyContent:"center",gap:7,
              opacity: sensorState==="requesting" ? 0.7 : 1,
            }}
          >
            {sensorState === "requesting" ? (
              <>⏳ Requesting…</>
            ) : tracking ? (
              <>⏹ Stop Tracking</>
            ) : (
              <>▶️ Start Tracking</>
            )}
          </button>
        )}
        <button
          onClick={()=>setSteps(0)}
          style={{
            padding:"12px 16px",borderRadius:14,border:"none",cursor:"pointer",
            background:dm?"rgba(255,255,255,.08)":"rgba(255,255,255,.5)",
            color:mutedGreen,fontSize:13,fontWeight:700,fontFamily:"Nunito",
            transition:"background .2s",
          }}
        >
          Reset
        </button>
      </div>

      {/* Pulse keyframe for active icon */}
      <style>{`
        @keyframes pulse2 {
          0%,100%{box-shadow:0 4px 12px rgba(16,185,129,.25)}
          50%{box-shadow:0 4px 22px rgba(52,211,153,.55)}
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Weekly Water Chart  (custom SVG bars)
// ─────────────────────────────────────────────────────────────────────────────
function WeeklyWaterChart({ weekLog, goal, dm }) {
  const T = dm ? DK : LT;
  const W=320, H=140, PAD_L=36, PAD_B=28, PAD_T=10, PAD_R=8;
  const innerW=W-PAD_L-PAD_R, innerH=H-PAD_B-PAD_T;
  const maxVal=Math.max(goal, ...weekLog.map(d=>d.ml), 1);
  const barW = innerW/7*0.55, barGap = innerW/7;
  const todayKey = todayStr();

  const yLine = (ml) => PAD_T + innerH - (ml/maxVal)*innerH;

  // Guide lines at 0, 50%, 100%
  const guides = [0, goal*0.5, goal].map(v=>({v, y:yLine(v)}));

  return (
    <div style={{background:T.cardBg,borderRadius:20,padding:20,marginBottom:16,
      boxShadow:T.shadow,border:`1px solid ${T.cardBorder}`}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div>
          <h3 style={{margin:0,fontSize:16,fontWeight:800,fontFamily:"Nunito",color:T.textPri}}>
            📈 Weekly Water Intake
          </h3>
          <p style={{margin:0,fontSize:11,color:T.textSec,fontFamily:"Nunito"}}>Last 7 days · Goal: {goal}ml/day</p>
        </div>
        <div style={{background:"linear-gradient(135deg,#1d4ed8,#4338ca)",borderRadius:10,
          padding:"4px 10px",fontSize:11,fontWeight:800,color:"white",fontFamily:"Nunito"}}>
          {weekLog.filter(d=>d.ml>=goal).length}/7 ✅
        </div>
      </div>

      <div style={{overflowX:"auto"}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{display:"block",margin:"0 auto",overflow:"visible"}}>
          <defs>
            <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa"/><stop offset="100%" stopColor="#818cf8"/>
            </linearGradient>
            <linearGradient id="barGoal" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34d399"/><stop offset="100%" stopColor="#10b981"/>
            </linearGradient>
            <linearGradient id="barToday" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#f59e0b"/>
            </linearGradient>
          </defs>

          {/* Guide lines */}
          {guides.map(({v,y},i)=>(
            <g key={i}>
              <line x1={PAD_L} y1={y} x2={W-PAD_R} y2={y} stroke={dm?"rgba(255,255,255,.08)":"rgba(0,0,0,.06)"} strokeWidth={1} strokeDasharray={i>0?"4,3":""}/>
              <text x={PAD_L-4} y={y+4} textAnchor="end" fill={dm?"#64748b":"#94a3b8"} fontSize={8} fontFamily="Nunito">
                {v===0?"0":v>=1000?`${(v/1000).toFixed(1)}L`:`${v}ml`}
              </text>
            </g>
          ))}

          {/* Goal dashed line */}
          <line x1={PAD_L} y1={yLine(goal)} x2={W-PAD_R} y2={yLine(goal)}
            stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="5,3" opacity={.7}/>

          {/* Bars */}
          {weekLog.map((d,i)=>{
            const barH=Math.max((d.ml/maxVal)*innerH,2);
            const x=PAD_L+i*barGap+(barGap-barW)/2;
            const y=PAD_T+innerH-barH;
            const isToday=d.date===todayKey;
            const metGoal=d.ml>=goal;
            const grad=isToday?"url(#barToday)":metGoal?"url(#barGoal)":"url(#barGrad)";
            return (
              <g key={d.date}>
                {/* Bar shadow */}
                <rect x={x+2} y={y+2} width={barW} height={barH} rx={4} fill="rgba(0,0,0,.12)"/>
                {/* Bar */}
                <rect x={x} y={y} width={barW} height={barH} rx={4} fill={d.ml>0?grad:dm?"rgba(255,255,255,.06)":"rgba(0,0,0,.06)"}
                  style={{transition:"height .6s ease,y .6s ease"}}/>
                {/* Value label */}
                {d.ml>0&&(
                  <text x={x+barW/2} y={y-4} textAnchor="middle" fill={dm?"#94a3b8":"#64748b"} fontSize={7.5} fontWeight="700" fontFamily="Nunito">
                    {d.ml>=1000?`${(d.ml/1000).toFixed(1)}L`:`${d.ml}`}
                  </text>
                )}
                {/* Day label */}
                <text x={x+barW/2} y={H-4} textAnchor="middle" fontFamily="Nunito" fontSize={9} fontWeight="700"
                  fill={isToday?"#3b82f6":dm?"#64748b":"#94a3b8"}>
                  {d.day}{isToday?"*":""}
                </text>
                {/* Today dot */}
                {isToday&&<circle cx={x+barW/2} cy={H-16} r={2.5} fill="#3b82f6"/>}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:8,flexWrap:"wrap"}}>
        {[
          {color:"#60a5fa",label:"Below goal"},
          {color:"#34d399",label:"Goal reached ✅"},
          {color:"#fbbf24",label:"Today"},
        ].map((l,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:10,height:10,borderRadius:3,background:l.color}}/>
            <span style={{fontSize:10,fontFamily:"Nunito",fontWeight:700,color:T.textSec}}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Install PWA Button
// ─────────────────────────────────────────────────────────────────────────────
function InstallPWA({ dm }) {
  const T = dm ? DK : LT;
  const [prompt,   setPrompt]   = useState(null);
  const [installed,setInstalled]= useState(false);
  const [status,   setStatus]   = useState("idle"); // idle | success | unavailable

  useEffect(()=>{
    const handler = e => { e.preventDefault(); setPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", ()=>setInstalled(true));
    return()=>window.removeEventListener("beforeinstallprompt", handler);
  },[]);

  const install = async () => {
    if(!prompt){ setStatus("unavailable"); return; }
    prompt.prompt();
    const choice = await prompt.userChoice;
    if(choice.outcome==="accepted"){ setInstalled(true); setStatus("success"); }
    setPrompt(null);
  };

  if(installed) return (
    <div style={{background:dm?"linear-gradient(135deg,#1e3a5f,#1e40af)":"linear-gradient(135deg,#dbeafe,#bfdbfe)",
      borderRadius:20,padding:18,marginBottom:16,textAlign:"center",
      border:dm?"1px solid rgba(59,130,246,.25)":"1px solid rgba(59,130,246,.2)"}}>
      <div style={{fontSize:32,marginBottom:6}}>✅</div>
      <p style={{margin:0,fontSize:14,fontWeight:800,fontFamily:"Nunito",
        color:dm?"#93c5fd":"#1d4ed8"}}>HydroWalk is Installed!</p>
      <p style={{margin:"4px 0 0",fontSize:12,fontFamily:"Nunito",color:dm?"#60a5fa":"#3b82f6"}}>
        Open it from your home screen anytime.
      </p>
    </div>
  );

  return (
    <div style={{background:dm
      ?"linear-gradient(135deg,#1e1b4b,#2e1065,#1e3a8a)"
      :"linear-gradient(135deg,#eef2ff,#ede9fe,#dbeafe)",
      borderRadius:20,padding:20,marginBottom:16,
      boxShadow:dm?"0 8px 24px rgba(99,102,241,.2)":"0 8px 24px rgba(99,102,241,.15)",
      border:dm?"1px solid rgba(99,102,241,.2)":"1px solid rgba(255,255,255,.8)"}}>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
        <div style={{background:dm?"rgba(99,102,241,.3)":"rgba(255,255,255,.7)",borderRadius:14,
          width:52,height:52,display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:"0 4px 14px rgba(99,102,241,.25)",fontSize:26}}>💧</div>
        <div>
          <h3 style={{margin:0,fontSize:16,fontWeight:800,fontFamily:"Nunito",
            color:dm?"#a5b4fc":"#3730a3"}}>Install HydroWalk</h3>
          <p style={{margin:0,fontSize:11,fontFamily:"Nunito",
            color:dm?"rgba(165,180,252,.7)":"#6b7280"}}>Add to home screen · Works offline</p>
        </div>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {["⚡ Fast","📴 Offline","🔔 Notifications","📱 Native feel"].map((f,i)=>(
          <div key={i} style={{flex:1,background:dm?"rgba(255,255,255,.08)":"rgba(255,255,255,.6)",
            borderRadius:10,padding:"6px 4px",textAlign:"center",fontSize:10,fontWeight:700,
            fontFamily:"Nunito",color:dm?"#a5b4fc":"#4338ca",lineHeight:1.4}}>{f}</div>
        ))}
      </div>

      {status==="unavailable"&&(
        <div style={{background:dm?"rgba(251,191,36,.15)":"rgba(251,191,36,.2)",borderRadius:12,
          padding:"10px 12px",marginBottom:12,fontSize:12,fontFamily:"Nunito",
          color:dm?"#fbbf24":"#92400e",fontWeight:700}}>
          ℹ️ Install prompt not available. Open in Chrome on Android, or Safari on iOS → Share → Add to Home Screen.
        </div>
      )}

      <button onClick={install} style={{
        width:"100%",padding:"13px 0",borderRadius:14,border:"none",cursor:"pointer",
        background:"linear-gradient(135deg,#4f46e5,#7c3aed)",
        color:"white",fontSize:14,fontWeight:800,fontFamily:"Nunito",
        boxShadow:"0 6px 20px rgba(79,70,229,.4)",
        display:"flex",alignItems:"center",justifyContent:"center",gap:8,
        transition:"transform .15s",
      }}
        onMouseDown={e=>e.currentTarget.style.transform="scale(.97)"}
        onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
      >
        <DownloadIcon size={17} color="white"/> Install HydroWalk App
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Permission Banner
// ─────────────────────────────────────────────────────────────────────────────
function NotifBanner() {
  const [status,setStatus]=useState(typeof Notification!=="undefined"?Notification.permission:"unsupported");
  if(status==="granted"||status==="unsupported") return null;
  const request=async()=>{const p=await Notification.requestPermission();setStatus(p);};
  return (
    <div style={{background:"linear-gradient(135deg,#fef3c7,#fde68a)",borderRadius:16,padding:"14px 16px",
      marginBottom:14,border:"1px solid rgba(251,191,36,.4)",display:"flex",alignItems:"center",gap:12,
      animation:"fadeSlide .4s ease"}}>
      <div style={{fontSize:26,flexShrink:0}}>🔔</div>
      <div style={{flex:1}}>
        <p style={{margin:0,fontSize:13,fontWeight:800,color:"#78350f",fontFamily:"Nunito"}}>Enable Notifications</p>
        <p style={{margin:0,fontSize:11,color:"#92400e",fontFamily:"Nunito",lineHeight:1.4}}>
          Allow notifications so reminders fire at the right time.
        </p>
      </div>
      <button onClick={request} style={{padding:"8px 14px",borderRadius:10,border:"none",cursor:"pointer",
        background:"#d97706",color:"white",fontSize:12,fontWeight:800,fontFamily:"Nunito",whiteSpace:"nowrap",flexShrink:0}}>
        Allow
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Walking Reminders
// ─────────────────────────────────────────────────────────────────────────────
function WalkingReminders({ reminders, setReminders, dm }) {
  const [pickerTime, setPickerTime] = useState("");
  const [pickerLabel,setPickerLabel]= useState("");
  const [error,      setError]      = useState("");
  const [firedToday, setFiredToday] = useState({});
  const tickRef = useRef(null);

  const checkReminders = useCallback(()=>{
    if(typeof Notification==="undefined"||Notification.permission!=="granted") return;
    const now=nowHHMM(), today=new Date().toLocaleDateString();
    reminders.forEach(r=>{
      if(!r.enabled||r.time!==now||firedToday[r.id]===today) return;
      setFiredToday(p=>({...p,[r.id]:today}));
      new Notification("HydroWalk Reminder 🚶",{
        body:`${r.label?r.label+" — ":""}Time for your walk! Stay active and healthy.`,
        icon:"https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f6b6.png",
        tag:r.id,
      });
    });
  },[reminders,firedToday]);

  useEffect(()=>{
    tickRef.current=setInterval(checkReminders,30_000);
    checkReminders();
    return()=>clearInterval(tickRef.current);
  },[checkReminders]);

  const addReminder=()=>{
    setError("");
    if(!pickerTime){setError("Please select a time.");return;}
    if(reminders.some(r=>r.time===pickerTime)){setError("A reminder already exists for this time.");return;}
    setReminders(p=>[...p,{id:uid(),time:pickerTime,label:pickerLabel.trim()||"",enabled:true}]);
    setPickerTime(""); setPickerLabel("");
  };
  const toggle=(id)=>setReminders(p=>p.map(r=>r.id===id?{...r,enabled:!r.enabled}:r));
  const remove=(id)=>setReminders(p=>p.filter(r=>r.id!==id));
  const sorted=[...reminders].sort((a,b)=>a.time.localeCompare(b.time));

  const getTimeStyle=(hhmm)=>{
    const h=parseInt(hhmm.split(":")[0],10);
    if(h>=5&&h<12) return {bg:"linear-gradient(135deg,#fef9c3,#fde68a)",icon:<SunIconSVG size={16}/>};
    if(h>=12&&h<18) return {bg:"linear-gradient(135deg,#dbeafe,#bfdbfe)",icon:<ClockIcon size={16} color="#3b82f6"/>};
    return {bg:"linear-gradient(135deg,#ede9fe,#ddd6fe)",icon:<MoonIconSVG size={16}/>};
  };

  return (
    <div style={{marginBottom:24}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <div style={{background:"linear-gradient(135deg,#7c3aed,#4338ca)",borderRadius:10,width:34,height:34,
          display:"flex",alignItems:"center",justifyContent:"center",color:"white"}}>
          <FootIcon size={18} color="white"/>
        </div>
        <h2 style={{fontSize:18,fontWeight:800,color:"inherit",fontFamily:"Nunito",margin:0}}>
          Walking Reminders 🚶
        </h2>
      </div>
      <div style={{background:"linear-gradient(150deg,#4c1d95 0%,#3730a3 60%,#1e40af 100%)",
        borderRadius:24,padding:20,boxShadow:"0 12px 40px rgba(76,29,149,.35)",position:"relative",overflow:"hidden"}}>
        {[[120,10,80,.07],[200,160,50,.06],[-10,100,60,.06]].map(([l,t,s,o],i)=>(
          <div key={i} style={{position:"absolute",left:l,top:t,width:s,height:s,
            borderRadius:"50%",background:`rgba(255,255,255,${o})`,pointerEvents:"none"}}/>
        ))}
        <NotifBanner/>
        {/* Form */}
        <div style={{background:"rgba(255,255,255,.12)",borderRadius:18,padding:16,marginBottom:16,
          border:"1px solid rgba(255,255,255,.2)"}}>
          <p style={{margin:"0 0 12px",fontSize:13,fontWeight:800,color:"white",fontFamily:"Nunito",
            display:"flex",alignItems:"center",gap:6}}>⏰ Set New Reminder</p>
          <div style={{marginBottom:10}}>
            <label style={{fontSize:11,color:"rgba(255,255,255,.7)",fontFamily:"Nunito",fontWeight:700,display:"block",marginBottom:5}}>
              SELECT TIME
            </label>
            <div style={{position:"relative"}}>
              <div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",display:"flex",pointerEvents:"none"}}>
                <ClockIcon size={15} color="rgba(255,255,255,.6)"/>
              </div>
              <input type="time" value={pickerTime} onChange={e=>setPickerTime(e.target.value)} style={{
                width:"100%",padding:"11px 12px 11px 36px",borderRadius:12,
                border:"1.5px solid rgba(255,255,255,.3)",background:"rgba(255,255,255,.15)",
                color:"white",fontSize:16,fontFamily:"Nunito",fontWeight:700,outline:"none",
                cursor:"pointer",colorScheme:"dark",
              }}/>
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,color:"rgba(255,255,255,.7)",fontFamily:"Nunito",fontWeight:700,display:"block",marginBottom:5}}>
              LABEL (optional)
            </label>
            <input type="text" value={pickerLabel} onChange={e=>setPickerLabel(e.target.value)}
              placeholder="e.g. Morning walk, Evening stroll…" maxLength={30} style={{
                width:"100%",padding:"11px 14px",borderRadius:12,
                border:"1.5px solid rgba(255,255,255,.3)",background:"rgba(255,255,255,.15)",
                color:"white",fontSize:13,fontFamily:"Nunito",fontWeight:600,outline:"none",
              }}/>
          </div>
          {error&&<p style={{margin:"0 0 10px",fontSize:12,color:"#fca5a5",fontFamily:"Nunito",fontWeight:700}}>⚠️ {error}</p>}
          <button onClick={addReminder} style={{
            width:"100%",padding:"12px 0",borderRadius:12,border:"none",cursor:"pointer",
            background:"white",color:"#4c1d95",fontSize:14,fontWeight:800,fontFamily:"Nunito",
            boxShadow:"0 4px 16px rgba(0,0,0,.2)",display:"flex",alignItems:"center",
            justifyContent:"center",gap:8,transition:"transform .15s"}}
            onMouseDown={e=>e.currentTarget.style.transform="scale(.97)"}
            onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
            <PlusIcon/> Set Reminder
          </button>
        </div>
        {/* List */}
        {sorted.length===0?(
          <div style={{textAlign:"center",padding:"20px 0",color:"rgba(255,255,255,.5)",fontFamily:"Nunito",fontSize:13,fontWeight:600}}>
            <div style={{fontSize:36,marginBottom:8}}>🔕</div>
            No reminders set yet.<br/>Add one above to get started.
          </div>
        ):(
          <div>
            <p style={{margin:"0 0 10px",fontSize:11,fontWeight:700,color:"rgba(255,255,255,.6)",
              fontFamily:"Nunito",letterSpacing:.8,textTransform:"uppercase"}}>
              {sorted.length} reminder{sorted.length!==1?"s":""} scheduled
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {sorted.map(r=>{
                const {bg,icon}=getTimeStyle(r.time);
                return (
                  <div key={r.id} style={{
                    background:r.enabled?bg:"rgba(255,255,255,.08)",borderRadius:16,padding:"14px 14px",
                    border:r.enabled?"1px solid rgba(255,255,255,.5)":"1px solid rgba(255,255,255,.15)",
                    display:"flex",alignItems:"center",gap:12,animation:"fadeSlide .3s ease",
                    opacity:r.enabled?1:.6,transition:"opacity .3s,background .3s"}}>
                    <div style={{width:42,height:42,borderRadius:12,flexShrink:0,
                      background:r.enabled?"rgba(255,255,255,.6)":"rgba(255,255,255,.15)",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      boxShadow:r.enabled?"0 4px 12px rgba(0,0,0,.1)":"none"}}>
                      {r.enabled?icon:<BellOffIcon size={16} color="#94a3b8"/>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:20,fontWeight:900,fontFamily:"Nunito",lineHeight:1,
                        color:r.enabled?"#1e293b":"rgba(255,255,255,.4)"}}>{formatTime12(r.time)}</div>
                      {r.label&&<div style={{fontSize:11,fontWeight:700,marginTop:2,
                        color:r.enabled?"#64748b":"rgba(255,255,255,.35)",fontFamily:"Nunito",
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.label}</div>}
                    </div>
                    <Toggle checked={r.enabled} onChange={()=>toggle(r.id)} small/>
                    <button onClick={()=>remove(r.id)} style={{
                      width:32,height:32,borderRadius:10,border:"none",cursor:"pointer",
                      background:r.enabled?"rgba(239,68,68,.15)":"rgba(255,255,255,.08)",
                      color:r.enabled?"#ef4444":"rgba(255,255,255,.3)",
                      display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background .2s"}}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,.28)"}
                      onMouseLeave={e=>e.currentTarget.style.background=r.enabled?"rgba(239,68,68,.15)":"rgba(255,255,255,.08)"}>
                      <TrashIcon size={15}/>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div style={{marginTop:14,background:"rgba(255,255,255,.08)",borderRadius:12,
          padding:"10px 14px",display:"flex",gap:10,alignItems:"flex-start"}}>
          <span style={{fontSize:16,flexShrink:0}}>💡</span>
          <p style={{margin:0,fontSize:11,color:"rgba(255,255,255,.6)",fontFamily:"Nunito",lineHeight:1.5}}>
            Reminders fire as browser notifications when the time matches. Keep this tab open and allow notifications.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Motivation Card
// ─────────────────────────────────────────────────────────────────────────────
function MotivationCard({ dm }) {
  const T = dm ? DK : LT;
  return (
    <div style={{background:dm
      ?"linear-gradient(135deg,#064e3b,#065f46)"
      :"linear-gradient(135deg,#ecfdf5,#d1fae5,#a7f3d0)",
      borderRadius:20,padding:20,marginBottom:16,
      boxShadow:T.shadow,border:`1px solid ${T.cardBorder}`,
      animation:"fadeSlide .6s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <div style={{fontSize:28}}>{DAILY_MSG.icon}</div>
        <div>
          <h3 style={{margin:0,fontSize:15,fontWeight:800,fontFamily:"Nunito",
            color:dm?"#a7f3d0":"#065f46"}}>Daily Motivation</h3>
          <p style={{margin:0,fontSize:11,fontFamily:"Nunito",
            color:dm?"#6ee7b7":"#6ee7b7"}}>Your health mantra for today</p>
        </div>
      </div>
      <p style={{margin:0,fontSize:14,color:dm?"#6ee7b7":"#047857",fontFamily:"Nunito",lineHeight:1.6,fontWeight:600}}>
        "{DAILY_MSG.text}"
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Daily Summary
// ─────────────────────────────────────────────────────────────────────────────
function DailySummary({ consumed, goal, reminders, streak, steps, dm }) {
  const T = dm ? DK : LT;
  const waterPct = Math.min((consumed/goal)*100,100);
  const stepPct  = Math.min((steps/STEP_GOAL)*100,100);
  const active   = reminders.filter(r=>r.enabled).length;

  const rows = [
    { icon:<WaterDropIcon size={16} color="#3b82f6"/>, label:"Water", right:`${consumed}ml / ${goal}ml`,
      pct:waterPct, barColor:"linear-gradient(90deg,#60a5fa,#818cf8)" },
    { icon:<StepIcon size={16} color="#10b981"/>, label:"Steps", right:`${steps.toLocaleString()} / ${STEP_GOAL.toLocaleString()}`,
      pct:stepPct, barColor:"linear-gradient(90deg,#34d399,#10b981)" },
  ];

  return (
    <div style={{background:T.cardBg,borderRadius:20,padding:20,marginBottom:20,
      boxShadow:T.shadow,border:`1px solid ${T.cardBorder}`}}>
      <h3 style={{margin:"0 0 16px",fontSize:16,fontWeight:800,fontFamily:"Nunito",color:T.textPri,
        display:"flex",alignItems:"center",gap:8}}><span>📊</span> Daily Summary</h3>

      {rows.map((row,i)=>(
        <div key={i} style={{marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              {row.icon}
              <span style={{fontSize:13,fontWeight:700,fontFamily:"Nunito",color:T.textMid}}>{row.label}</span>
            </div>
            <span style={{fontSize:13,fontWeight:700,fontFamily:"Nunito",
              color:row.pct>=100?"#16a34a":"#3b82f6"}}>{row.right}</span>
          </div>
          <div style={{background:T.barTrack,borderRadius:99,height:8,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:99,width:`${row.pct}%`,
              background:row.barColor,transition:"width .8s ease"}}/>
          </div>
        </div>
      ))}

      <div style={{display:"flex",gap:8}}>
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"10px 12px",borderRadius:12,background:T.rowBg}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:16}}>🔥</span>
            <span style={{fontSize:12,fontWeight:700,fontFamily:"Nunito",color:T.textMid}}>Streak</span>
          </div>
          <span style={{fontSize:12,fontWeight:800,fontFamily:"Nunito",padding:"3px 8px",borderRadius:99,
            background:"rgba(249,115,22,.15)",color:"#f97316"}}>{streak} {streak===1?"day":"days"}</span>
        </div>
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"10px 12px",borderRadius:12,background:T.rowBg}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <BellIcon size={14} color="#7c3aed"/>
            <span style={{fontSize:12,fontWeight:700,fontFamily:"Nunito",color:T.textMid}}>Alarms</span>
          </div>
          <span style={{fontSize:12,fontWeight:800,fontFamily:"Nunito",padding:"3px 8px",borderRadius:99,
            background:"rgba(124,58,237,.15)",color:"#7c3aed"}}>
            {reminders.length===0?"None":`${active}/${reminders.length}`}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = { dailyGoal:2000, glassSize:250, remindersOn:true };

export default function App() {
  // ── Theme
  const [dm, setDm] = useState(()=>LS.get("hw_darkMode", false));

  // ── Water / streak
  const [consumed,  setConsumed]  = useState(()=>LS.get("hw_consumed", 0));
  const [streak,    setStreak]    = useState(()=>LS.get("hw_streak", 0));

  // ── Steps
  const [steps, setSteps] = useState(()=>LS.get("hw_steps", 0));

  // ── Settings / reminders
  const [settings,     setSettings]     = useState(()=>LS.get("hw_settings", DEFAULT_SETTINGS));
  const [showSettings, setShowSettings] = useState(false);
  const [reminders,    setReminders]    = useState(()=>LS.get("hw_reminders", []));

  // ── Weekly chart
  const [weekLog, setWeekLog] = useState(()=>buildWeekLog(LS.get("hw_weekLog", [])));

  // ── Misc UI
  const [showWelcome, setShowWelcome] = useState(true);

  // ── Persist to localStorage
  useEffect(()=>LS.set("hw_darkMode",  dm),         [dm]);
  useEffect(()=>LS.set("hw_consumed",  consumed),   [consumed]);
  useEffect(()=>LS.set("hw_streak",    streak),     [streak]);
  useEffect(()=>LS.set("hw_steps",     steps),      [steps]);
  useEffect(()=>LS.set("hw_settings",  settings),   [settings]);
  useEffect(()=>LS.set("hw_reminders", reminders),  [reminders]);
  useEffect(()=>LS.set("hw_weekLog",   weekLog),    [weekLog]);

  // ── Daily reset check (new day)
  useEffect(()=>{
    const lastDate  = LS.get("hw_lastDate",  null);
    const lastStepD = LS.get("hw_lastStepDate", null);
    const today     = todayStr();

    if(lastDate && lastDate !== today) {
      // Update weekly log with yesterday's value
      setWeekLog(prev => {
        const updated = buildWeekLog(prev);
        const yest = updated.find(d=>d.date===lastDate);
        if(yest) yest.ml = LS.get("hw_consumed", 0);
        return [...updated];
      });

      // Streak logic: did they complete the goal yesterday?
      const prevConsumed = LS.get("hw_consumed", 0);
      const prevGoal     = (LS.get("hw_settings", DEFAULT_SETTINGS)).dailyGoal;
      if(prevConsumed >= prevGoal) {
        setStreak(p => p + 1);
      } else {
        setStreak(0);
      }
      setConsumed(0);
    }
    if(lastStepD && lastStepD !== today) setSteps(0);

    LS.set("hw_lastDate",     today);
    LS.set("hw_lastStepDate", today);
  }, []);

  // ── Keep today's ml synced into weekLog live
  useEffect(()=>{
    setWeekLog(prev=>{
      const updated=[...prev];
      const idx=updated.findIndex(d=>d.date===todayStr());
      if(idx!==-1) updated[idx]={...updated[idx],ml:consumed};
      return updated;
    });
  },[consumed]);

  const handleSaveSettings = ns => {
    setSettings(ns);
    setConsumed(p=>Math.min(p,ns.dailyGoal));
  };

  const T = dm ? DK : LT;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        html{min-height:100%}
        body{
          background:${T.pageBg};
          min-height:100vh;font-family:'Nunito',sans-serif;
          display:flex;justify-content:center;align-items:flex-start;
          transition:background .4s ease;
        }
        #root{
          width:100%;max-width:420px;min-height:100vh;
          box-shadow:0 0 80px rgba(99,102,241,.10);
          color:${T.textPri};
          transition:color .3s;
        }
        ::-webkit-scrollbar{display:none}
        input[type=time]{appearance:none;-webkit-appearance:none}
        input[type=time]::-webkit-calendar-picker-indicator{filter:invert(1);opacity:.6;cursor:pointer}
        input::placeholder{color:rgba(255,255,255,.4)}
        @keyframes float    {from{transform:translateY(0) scale(1)}      to{transform:translateY(-20px) scale(1.05)}}
        @keyframes orbit    {from{transform:translate(-50%,-50%) scale(1)} to{transform:translate(-50%,-50%) scale(1.3)}}
        @keyframes pulse    {0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.12)}}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(12px)}  to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn   {from{opacity:0}                              to{opacity:1}}
        @keyframes slideUp  {from{transform:translateY(100%)}             to{transform:translateY(0)}}
        button:active{transform:scale(.97)!important}
      `}</style>

      {showWelcome && <WelcomeScreen onDone={()=>setShowWelcome(false)}/>}

      {showSettings && (
        <SettingsModal settings={settings} onSave={handleSaveSettings}
          onClose={()=>setShowSettings(false)} dm={dm}/>
      )}

      <div style={{padding:"20px 16px 40px",opacity:showWelcome?0:1,transition:"opacity .5s ease .2s"}}>

        {/* ── Header */}
        <Header dm={dm} setDm={setDm}/>

        {/* ── Water Reminder */}
        <div style={{animation:"fadeSlide .5s ease .4s both"}}>
          <HydrationSection consumed={consumed} setConsumed={setConsumed}
            settings={settings} onOpenSettings={()=>setShowSettings(true)}/>
        </div>

        {/* ── Hydration Streak */}
        <div style={{animation:"fadeSlide .5s ease .45s both"}}>
          <SectionLabel gradient="linear-gradient(135deg,#ea580c,#f97316)" emoji="🔥" dm={dm}>
            Hydration Streak 🔥
          </SectionLabel>
          <HydrationStreak streak={streak} dm={dm}/>
        </div>

        {/* ── Step Counter */}
        <div style={{animation:"fadeSlide .5s ease .5s both"}}>
          <SectionLabel gradient="linear-gradient(135deg,#059669,#10b981)" emoji="👟" dm={dm}>
            Step Counter 👟
          </SectionLabel>
          <StepCounter steps={steps} setSteps={setSteps} dm={dm}/>
        </div>

        {/* ── Weekly Chart */}
        <div style={{animation:"fadeSlide .5s ease .52s both"}}>
          <SectionLabel gradient="linear-gradient(135deg,#0284c7,#0ea5e9)" emoji="📈" dm={dm}>
            Weekly Water Chart
          </SectionLabel>
          <WeeklyWaterChart weekLog={weekLog} goal={settings.dailyGoal} dm={dm}/>
        </div>

        {/* ── Install PWA */}
        <div style={{animation:"fadeSlide .5s ease .54s both"}}>
          <SectionLabel gradient="linear-gradient(135deg,#4f46e5,#7c3aed)" emoji="📲" dm={dm}>
            Install App 📲
          </SectionLabel>
          <InstallPWA dm={dm}/>
        </div>

        {/* ── Walking Reminders */}
        <div style={{animation:"fadeSlide .5s ease .56s both"}}>
          <WalkingReminders reminders={reminders} setReminders={setReminders} dm={dm}/>
        </div>

        {/* ── Motivation */}
        <div style={{animation:"fadeSlide .5s ease .6s both"}}>
          <SectionLabel gradient="linear-gradient(135deg,#10b981,#34d399)" emoji="🌟" dm={dm}>
            Daily Motivation
          </SectionLabel>
          <MotivationCard dm={dm}/>
        </div>

        {/* ── Daily Summary */}
        <div style={{animation:"fadeSlide .5s ease .65s both"}}>
          <SectionLabel gradient="linear-gradient(135deg,#f59e0b,#fbbf24)" emoji="📊" dm={dm}>
            Daily Summary
          </SectionLabel>
          <DailySummary consumed={consumed} goal={settings.dailyGoal}
            reminders={reminders} streak={streak} steps={steps} dm={dm}/>
        </div>

        {/* ── Footer */}
        <footer style={{background:"linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",
          borderRadius:20,padding:"20px 16px",textAlign:"center",
          boxShadow:"0 8px 24px rgba(0,0,0,.2)",animation:"fadeSlide .5s ease .7s both"}}>
          <div style={{fontSize:28,marginBottom:6}}>💧</div>
          <p style={{color:"white",fontSize:14,fontWeight:800,fontFamily:"Nunito",marginBottom:4}}>
            Built By — Kanak Bari Team
          </p>
          <p style={{color:"rgba(255,255,255,.5)",fontSize:12,fontFamily:"Nunito",fontWeight:500}}>
            Stay Healthy, Stay Hydrated 💧
          </p>
        </footer>
      </div>
    </>
  );
}