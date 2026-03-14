import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function formatTime12(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour   = h % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Icons
// ─────────────────────────────────────────────────────────────────────────────
const WaterDropIcon = ({ size = 24, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2C12 2 4 9.5 4 14.5C4 18.6 7.6 22 12 22C16.4 22 20 18.6 20 14.5C20 9.5 12 2 12 2Z" />
  </svg>
);

const FootIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <ellipse cx="9" cy="6" rx="3" ry="4.5"/>
    <ellipse cx="15.5" cy="8" rx="2.2" ry="3.5"/>
    <path d="M6 13c0 3.5 2.5 8 6.5 8s7.5-3 7.5-7c0-2-1-3.5-3-4.5C15 8.5 12 9 10 11c-1.5 0-4 .5-4 2z"/>
  </svg>
);

const GearIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const BellIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const BellOffIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round">
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    <path d="M18.63 13A17.89 17.89 0 0 1 18 8"/>
    <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/>
    <path d="M18 8a6 6 0 0 0-9.33-5"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const TrashIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

const PlusIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const ClockIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const SunIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5"/>
    {[0,60,120,180,240,300].map((a,i)=>{
      const r=Math.PI*a/180;
      return <line key={i} x1={12+8*Math.cos(r)} y1={12+8*Math.sin(r)} x2={12+10*Math.cos(r)} y2={12+10*Math.sin(r)}/>;
    })}
  </svg>
);

const MoonIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#818cf8" stroke="#818cf8" strokeWidth="1">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Toggle
// ─────────────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, small }) {
  const w = small ? 38 : 48, h = small ? 22 : 26, thumb = small ? 16 : 20;
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width:w, height:h, borderRadius:h/2, border:"none", cursor:"pointer",
        background: checked ? "linear-gradient(135deg,#60a5fa,#818cf8)" : "#cbd5e1",
        position:"relative", transition:"background .3s", flexShrink:0,
        boxShadow: checked ? "0 0 10px rgba(99,102,241,.4)" : "none",
      }}
    >
      <span style={{
        position:"absolute", top:(h-thumb)/2,
        left: checked ? w-thumb-(h-thumb)/2 : (h-thumb)/2,
        width:thumb, height:thumb, borderRadius:"50%", background:"white",
        transition:"left .3s", boxShadow:"0 2px 6px rgba(0,0,0,.2)",
      }}/>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Settings Modal
// ─────────────────────────────────────────────────────────────────────────────
function SettingsModal({ settings, onSave, onClose }) {
  const [localGoal,      setLocalGoal]      = useState(settings.dailyGoal);
  const [localGlass,     setLocalGlass]     = useState(settings.glassSize);
  const [localReminders, setLocalReminders] = useState(settings.remindersOn);
  const goalOptions  = [1500, 2000, 2500, 3000];
  const glassOptions = [150, 200, 250, 300, 350];

  return (
    <div onClick={onClose} style={{
      position:"fixed",inset:0,zIndex:1000,
      background:"rgba(15,23,42,.55)",backdropFilter:"blur(4px)",
      display:"flex",alignItems:"flex-end",justifyContent:"center",
      animation:"fadeIn .2s ease",
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:"100%",maxWidth:420,background:"white",
        borderRadius:"24px 24px 0 0",padding:"0 20px 36px",
        boxShadow:"0 -8px 40px rgba(0,0,0,.2)",
        animation:"slideUp .32s cubic-bezier(.34,1.4,.64,1)",
      }}>
        <div style={{display:"flex",justifyContent:"center",padding:"14px 0 6px"}}>
          <div style={{width:40,height:4,borderRadius:99,background:"#e2e8f0"}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22,marginTop:6}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{background:"linear-gradient(135deg,#1d4ed8,#6d28d9)",borderRadius:10,width:38,height:38,
              display:"flex",alignItems:"center",justifyContent:"center",color:"white"}}>
              <GearIcon/>
            </div>
            <div>
              <h2 style={{margin:0,fontSize:17,fontWeight:800,fontFamily:"Nunito",color:"#1e293b"}}>Settings</h2>
              <p style={{margin:0,fontSize:11,color:"#94a3b8",fontFamily:"Nunito"}}>Customise your hydration goals</p>
            </div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",border:"none",
            background:"#f1f5f9",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",
            justifyContent:"center",color:"#64748b",fontWeight:700}}>✕</button>
        </div>

        <p style={{margin:"0 0 10px",fontSize:13,fontWeight:700,color:"#475569",fontFamily:"Nunito"}}>💧 Daily Water Goal</p>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {goalOptions.map(g=>(
            <button key={g} onClick={()=>setLocalGoal(g)} style={{
              flex:1,padding:"10px 0",borderRadius:12,
              border:`2px solid ${localGoal===g?"#3b82f6":"#e2e8f0"}`,
              background:localGoal===g?"linear-gradient(135deg,#eff6ff,#eef2ff)":"white",
              color:localGoal===g?"#1d4ed8":"#64748b",
              fontSize:12,fontWeight:700,fontFamily:"Nunito",cursor:"pointer",transition:"all .2s",
              boxShadow:localGoal===g?"0 4px 12px rgba(59,130,246,.2)":"none",
            }}>{g}<br/><span style={{fontSize:10}}>ml</span></button>
          ))}
        </div>

        <p style={{margin:"0 0 10px",fontSize:13,fontWeight:700,color:"#475569",fontFamily:"Nunito"}}>🥛 Glass Size</p>
        <div style={{display:"flex",gap:7,marginBottom:22}}>
          {glassOptions.map(g=>(
            <button key={g} onClick={()=>setLocalGlass(g)} style={{
              flex:1,padding:"10px 2px",borderRadius:12,
              border:`2px solid ${localGlass===g?"#3b82f6":"#e2e8f0"}`,
              background:localGlass===g?"linear-gradient(135deg,#eff6ff,#eef2ff)":"white",
              color:localGlass===g?"#1d4ed8":"#64748b",
              fontSize:11,fontWeight:700,fontFamily:"Nunito",cursor:"pointer",transition:"all .2s",
              boxShadow:localGlass===g?"0 4px 12px rgba(59,130,246,.2)":"none",
            }}>{g}<br/><span style={{fontSize:9}}>ml</span></button>
          ))}
        </div>

        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          background:"#f8fafc",borderRadius:14,padding:"14px 16px",marginBottom:24,border:"1px solid #e2e8f0"}}>
          <div>
            <p style={{margin:0,fontSize:14,fontWeight:700,color:"#1e293b",fontFamily:"Nunito"}}>🔔 Reminders</p>
            <p style={{margin:0,fontSize:11,color:"#94a3b8",fontFamily:"Nunito"}}>Hydration &amp; walk alerts</p>
          </div>
          <Toggle checked={localReminders} onChange={setLocalReminders}/>
        </div>

        <button onClick={()=>{onSave({dailyGoal:localGoal,glassSize:localGlass,remindersOn:localReminders});onClose();}}
          style={{width:"100%",padding:"14px 0",borderRadius:14,border:"none",cursor:"pointer",
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
  const [phase, setPhase] = useState("in");
  useEffect(()=>{
    const t1=setTimeout(()=>setPhase("stay"),600);
    const t2=setTimeout(()=>setPhase("out"),2400);
    const t3=setTimeout(()=>onDone(),3000);
    return()=>[t1,t2,t3].forEach(clearTimeout);
  },[]);
  const opacity = phase==="stay" ? 1 : 0;
  return (
    <div style={{
      position:"fixed",inset:0,zIndex:999,
      background:"linear-gradient(135deg,#1e3a8a 0%,#4c1d95 50%,#6d28d9 100%)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      transition:phase==="out"?"opacity .6s ease":"opacity .8s ease",
      opacity:phase==="out"?0:1,overflow:"hidden",
    }}>
      {[{size:180,x:"10%",y:"5%",c:"rgba(96,165,250,.15)",d:0},{size:120,x:"70%",y:"15%",c:"rgba(167,139,250,.2)",d:.5},
        {size:90,x:"5%",y:"70%",c:"rgba(129,140,248,.15)",d:.8},{size:150,x:"65%",y:"65%",c:"rgba(59,130,246,.12)",d:.3}]
        .map((b,i)=>(
          <div key={i} style={{position:"absolute",width:b.size,height:b.size,borderRadius:"50%",
            background:b.c,left:b.x,top:b.y,animation:`float 4s ease-in-out ${b.d}s infinite alternate`}}/>
        ))}
      <div style={{position:"relative",width:140,height:140,marginBottom:32,transition:"opacity .8s",opacity}}>
        {[{e:"💧",a:0},{e:"❤️",a:72},{e:"🌿",a:144},{e:"🏃",a:216},{e:"⭐",a:288}].map(({e,a},i)=>{
          const r=Math.PI*a/180,x=60+55*Math.cos(r-Math.PI/2),y=60+55*Math.sin(r-Math.PI/2);
          return <div key={i} style={{position:"absolute",left:x,top:y,fontSize:22,
            animation:`orbit ${3+i*.4}s ease-in-out ${i*.2}s infinite alternate`,
            transform:"translate(-50%,-50%)"}}>{e}</div>;
        })}
        <div style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",
          fontSize:52,animation:"pulse 1.5s ease-in-out infinite"}}>💧</div>
      </div>
      <div style={{textAlign:"center",color:"white",padding:"0 32px",transition:"opacity .8s",opacity}}>
        <p style={{fontSize:26,fontWeight:700,margin:0,lineHeight:1.4,fontFamily:"'Nunito',sans-serif"}}>Welcome Dear 👋</p>
        <p style={{fontSize:17,margin:"12px 0 0",color:"rgba(255,255,255,.85)",fontFamily:"'Nunito',sans-serif",fontWeight:500}}>
          Stay Healthy &amp; Stay Hydrated 💧
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Water Ring
// ─────────────────────────────────────────────────────────────────────────────
function WaterRing({ pct }) {
  const r=52, circ=2*Math.PI*r;
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
      <text x={65} y={60} textAnchor="middle" fill="white" fontSize={22} fontWeight="800" fontFamily="Nunito">{Math.round(pct)}%</text>
      <text x={65} y={78} textAnchor="middle" fill="rgba(255,255,255,.7)" fontSize={11} fontFamily="Nunito">hydrated</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hydration Section (unchanged logic)
// ─────────────────────────────────────────────────────────────────────────────
function HydrationSection({ consumed, setConsumed, settings, onOpenSettings }) {
  const { dailyGoal:GOAL, glassSize:ML } = settings;
  const GLASSES = Math.round(GOAL/ML);
  const [animate, setAnimate] = useState(false);
  const glasses = Math.floor(consumed/ML);
  const pct = Math.min((consumed/GOAL)*100, 100);
  const msg = consumed===0?"Let's start hydrating! 🌊":pct<25?"Great start! Keep sipping 💧":
    pct<50?"You're doing well! Halfway there 🌊":pct<75?"Excellent progress! Almost there ⭐":
    pct<100?"So close! One more push 🔥":"Goal achieved! Amazing work 🎉";

  const drink = () => {
    if (consumed>=GOAL) return;
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
        <h2 style={{fontSize:18,fontWeight:800,color:"#1e293b",fontFamily:"Nunito",margin:0}}>Water Reminder 💧</h2>
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
              <div style={{fontSize:30,fontWeight:900,lineHeight:1}}>{consumed}<span style={{fontSize:14,fontWeight:600}}> ml</span></div>
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
          transform:animate?"scale(.96)":"scale(1)",transition:"transform .2s",marginBottom:10,
        }}>{consumed>=GOAL?"🎉 Daily Goal Achieved!":`💧 Drink Water +${ML}ml`}</button>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onOpenSettings} style={{
            flex:1,padding:"11px 0",borderRadius:12,border:"1.5px solid rgba(255,255,255,.5)",
            background:"rgba(255,255,255,.18)",color:"white",fontSize:13,fontWeight:700,fontFamily:"Nunito",
            cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,
          }}><GearIcon/> Settings</button>
          <button onClick={()=>setConsumed(0)} style={{
            flex:1,padding:"11px 0",borderRadius:12,border:"1.5px solid rgba(255,255,255,.5)",
            background:"rgba(255,255,255,.18)",color:"white",fontSize:13,fontWeight:700,fontFamily:"Nunito",cursor:"pointer",
          }}>🔄 Reset</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Permission Banner
// ─────────────────────────────────────────────────────────────────────────────
function NotifBanner({ onGrant }) {
  const [status, setStatus] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );
  if (status === "granted" || status === "unsupported") return null;

  const request = async () => {
    const p = await Notification.requestPermission();
    setStatus(p);
    if (p === "granted") onGrant();
  };

  return (
    <div style={{
      background:"linear-gradient(135deg,#fef3c7,#fde68a)",
      borderRadius:16,padding:"14px 16px",marginBottom:14,
      border:"1px solid rgba(251,191,36,.4)",
      display:"flex",alignItems:"center",gap:12,
      animation:"fadeSlide .4s ease",
    }}>
      <div style={{fontSize:26,flexShrink:0}}>🔔</div>
      <div style={{flex:1}}>
        <p style={{margin:0,fontSize:13,fontWeight:800,color:"#78350f",fontFamily:"Nunito"}}>Enable Notifications</p>
        <p style={{margin:0,fontSize:11,color:"#92400e",fontFamily:"Nunito",lineHeight:1.4}}>
          Allow notifications so reminders fire at the right time.
        </p>
      </div>
      <button onClick={request} style={{
        padding:"8px 14px",borderRadius:10,border:"none",cursor:"pointer",
        background:"#d97706",color:"white",fontSize:12,fontWeight:800,fontFamily:"Nunito",
        whiteSpace:"nowrap",flexShrink:0,
      }}>Allow</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Walking Reminders (full alarm-clock system)
// ─────────────────────────────────────────────────────────────────────────────
function WalkingReminders({ reminders, setReminders }) {
  const [pickerTime,  setPickerTime]  = useState("");
  const [pickerLabel, setPickerLabel] = useState("");
  const [error,       setError]       = useState("");
  const [firedToday,  setFiredToday]  = useState({}); // id → "YYYY-MM-DD" last fired
  const tickRef = useRef(null);

  // ── Notification tick ──
  const checkReminders = useCallback(() => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const now = nowHHMM();
    const today = new Date().toLocaleDateString();
    reminders.forEach(r => {
      if (!r.enabled) return;
      if (r.time !== now) return;
      if (firedToday[r.id] === today) return;
      setFiredToday(p => ({ ...p, [r.id]: today }));
      new Notification("HydroWalk Reminder 🚶", {
        body: `${r.label ? r.label + " — " : ""}Time for your walk! Stay active and healthy.`,
        icon: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f6b6.png",
        badge:"https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4a7.png",
        tag: r.id,
      });
    });
  }, [reminders, firedToday]);

  useEffect(() => {
    tickRef.current = setInterval(checkReminders, 30_000);
    checkReminders(); // immediate check
    return () => clearInterval(tickRef.current);
  }, [checkReminders]);

  // ── Add reminder ──
  const addReminder = () => {
    setError("");
    if (!pickerTime) { setError("Please select a time."); return; }
    if (reminders.some(r => r.time === pickerTime)) {
      setError("A reminder already exists for this time."); return;
    }
    setReminders(p => [...p, {
      id: uid(), time: pickerTime,
      label: pickerLabel.trim() || "",
      enabled: true,
    }]);
    setPickerTime("");
    setPickerLabel("");
  };

  // ── Toggle / delete ──
  const toggle = (id) => setReminders(p => p.map(r => r.id===id ? {...r,enabled:!r.enabled} : r));
  const remove = (id) => setReminders(p => p.filter(r => r.id!==id));

  const sorted = [...reminders].sort((a,b) => a.time.localeCompare(b.time));

  // ── Time-of-day colour ──
  const getTimeGradient = (hhmm) => {
    const h = parseInt(hhmm.split(":")[0], 10);
    if (h >= 5  && h < 12) return { bg:"linear-gradient(135deg,#fef9c3,#fde68a)", dot:"#f59e0b", icon:<SunIcon/>  };
    if (h >= 12 && h < 18) return { bg:"linear-gradient(135deg,#dbeafe,#bfdbfe)", dot:"#3b82f6", icon:<ClockIcon size={16} color="#3b82f6"/> };
    return                          { bg:"linear-gradient(135deg,#ede9fe,#ddd6fe)", dot:"#7c3aed", icon:<MoonIcon/> };
  };

  return (
    <div style={{marginBottom:24}}>
      {/* Section header */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <div style={{background:"linear-gradient(135deg,#7c3aed,#4338ca)",borderRadius:10,width:34,height:34,
          display:"flex",alignItems:"center",justifyContent:"center",color:"white"}}>
          <FootIcon size={18} color="white"/>
        </div>
        <h2 style={{fontSize:18,fontWeight:800,color:"#1e293b",fontFamily:"Nunito",margin:0}}>
          Walking Reminders 🚶
        </h2>
      </div>

      {/* Card wrapper */}
      <div style={{background:"linear-gradient(150deg,#4c1d95 0%,#3730a3 60%,#1e40af 100%)",
        borderRadius:24,padding:20,boxShadow:"0 12px 40px rgba(76,29,149,.35)",position:"relative",overflow:"hidden"}}>

        {/* BG blobs */}
        {[[120,10,80,.07],[200,160,50,.06],[-10,100,60,.06]].map(([l,t,s,o],i)=>(
          <div key={i} style={{position:"absolute",left:l,top:t,width:s,height:s,
            borderRadius:"50%",background:`rgba(255,255,255,${o})`,pointerEvents:"none"}}/>
        ))}

        {/* Notification permission banner */}
        <NotifBanner onGrant={()=>{}}/>

        {/* ── Add Reminder Form ── */}
        <div style={{background:"rgba(255,255,255,.12)",borderRadius:18,padding:16,marginBottom:16,
          border:"1px solid rgba(255,255,255,.2)"}}>
          <p style={{margin:"0 0 12px",fontSize:13,fontWeight:800,color:"white",fontFamily:"Nunito",
            display:"flex",alignItems:"center",gap:6}}>
            <span>⏰</span> Set New Reminder
          </p>

          {/* Time picker */}
          <div style={{marginBottom:10}}>
            <label style={{fontSize:11,color:"rgba(255,255,255,.7)",fontFamily:"Nunito",fontWeight:700,
              display:"block",marginBottom:5}}>SELECT TIME</label>
            <div style={{position:"relative"}}>
              <div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",
                display:"flex",pointerEvents:"none"}}>
                <ClockIcon size={15} color="rgba(255,255,255,.6)"/>
              </div>
              <input
                type="time"
                value={pickerTime}
                onChange={e=>setPickerTime(e.target.value)}
                style={{
                  width:"100%",padding:"11px 12px 11px 36px",
                  borderRadius:12,border:"1.5px solid rgba(255,255,255,.3)",
                  background:"rgba(255,255,255,.15)",color:"white",
                  fontSize:16,fontFamily:"Nunito",fontWeight:700,
                  outline:"none",cursor:"pointer",
                  // colour the time-picker text on webkit
                  colorScheme:"dark",
                }}
              />
            </div>
          </div>

          {/* Optional label */}
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,color:"rgba(255,255,255,.7)",fontFamily:"Nunito",fontWeight:700,
              display:"block",marginBottom:5}}>LABEL (optional)</label>
            <input
              type="text"
              value={pickerLabel}
              onChange={e=>setPickerLabel(e.target.value)}
              placeholder="e.g. Morning walk, Evening stroll…"
              maxLength={30}
              style={{
                width:"100%",padding:"11px 14px",borderRadius:12,
                border:"1.5px solid rgba(255,255,255,.3)",
                background:"rgba(255,255,255,.15)",color:"white",
                fontSize:13,fontFamily:"Nunito",fontWeight:600,
                outline:"none",
              }}
            />
          </div>

          {error && (
            <p style={{margin:"0 0 10px",fontSize:12,color:"#fca5a5",fontFamily:"Nunito",fontWeight:700}}>
              ⚠️ {error}
            </p>
          )}

          <button onClick={addReminder} style={{
            width:"100%",padding:"12px 0",borderRadius:12,border:"none",cursor:"pointer",
            background:"white",color:"#4c1d95",fontSize:14,fontWeight:800,fontFamily:"Nunito",
            boxShadow:"0 4px 16px rgba(0,0,0,.2)",display:"flex",alignItems:"center",
            justifyContent:"center",gap:8,transition:"transform .15s",
          }}
            onMouseDown={e=>e.currentTarget.style.transform="scale(.97)"}
            onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
          >
            <PlusIcon/> Set Reminder
          </button>
        </div>

        {/* ── Reminders list ── */}
        {sorted.length === 0 ? (
          <div style={{textAlign:"center",padding:"20px 0",color:"rgba(255,255,255,.5)",
            fontFamily:"Nunito",fontSize:13,fontWeight:600}}>
            <div style={{fontSize:36,marginBottom:8}}>🔕</div>
            No reminders set yet.<br/>Add one above to get started.
          </div>
        ) : (
          <div>
            <p style={{margin:"0 0 10px",fontSize:11,fontWeight:700,color:"rgba(255,255,255,.6)",
              fontFamily:"Nunito",letterSpacing:.8,textTransform:"uppercase"}}>
              {sorted.length} reminder{sorted.length!==1?"s":""} scheduled
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {sorted.map(r => {
                const { bg, dot, icon } = getTimeGradient(r.time);
                return (
                  <div key={r.id} style={{
                    background: r.enabled ? bg : "rgba(255,255,255,.08)",
                    borderRadius:16,padding:"14px 14px",
                    border: r.enabled ? "1px solid rgba(255,255,255,.5)" : "1px solid rgba(255,255,255,.15)",
                    display:"flex",alignItems:"center",gap:12,
                    animation:"fadeSlide .3s ease",
                    opacity: r.enabled ? 1 : 0.6,
                    transition:"opacity .3s,background .3s",
                  }}>
                    {/* Time icon dot */}
                    <div style={{
                      width:42,height:42,borderRadius:12,flexShrink:0,
                      background: r.enabled ? "rgba(255,255,255,.6)" : "rgba(255,255,255,.15)",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      boxShadow: r.enabled ? `0 4px 12px rgba(0,0,0,.1)` : "none",
                    }}>
                      {r.enabled ? icon : <BellOffIcon size={16} color="#94a3b8"/>}
                    </div>

                    {/* Text */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{
                        fontSize:20,fontWeight:900,fontFamily:"Nunito",lineHeight:1,
                        color: r.enabled ? "#1e293b" : "rgba(255,255,255,.4)",
                      }}>
                        {formatTime12(r.time)}
                      </div>
                      {r.label && (
                        <div style={{fontSize:11,fontWeight:700,marginTop:2,
                          color: r.enabled ? "#64748b" : "rgba(255,255,255,.35)",
                          fontFamily:"Nunito",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          {r.label}
                        </div>
                      )}
                    </div>

                    {/* Toggle */}
                    <Toggle checked={r.enabled} onChange={()=>toggle(r.id)} small/>

                    {/* Delete */}
                    <button onClick={()=>remove(r.id)} style={{
                      width:32,height:32,borderRadius:10,border:"none",cursor:"pointer",
                      background: r.enabled ? "rgba(239,68,68,.15)" : "rgba(255,255,255,.08)",
                      color: r.enabled ? "#ef4444" : "rgba(255,255,255,.3)",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      flexShrink:0,transition:"background .2s",
                    }}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,.28)"}
                      onMouseLeave={e=>e.currentTarget.style.background=r.enabled?"rgba(239,68,68,.15)":"rgba(255,255,255,.08)"}
                    ><TrashIcon size={15}/></button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* How it works hint */}
        <div style={{marginTop:14,background:"rgba(255,255,255,.08)",borderRadius:12,
          padding:"10px 14px",display:"flex",gap:10,alignItems:"flex-start"}}>
          <span style={{fontSize:16,flexShrink:0}}>💡</span>
          <p style={{margin:0,fontSize:11,color:"rgba(255,255,255,.6)",fontFamily:"Nunito",lineHeight:1.5}}>
            Reminders fire as browser notifications when the time matches. Keep this tab open and allow notifications for best results. Checked every 30 seconds.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Motivation Card
// ─────────────────────────────────────────────────────────────────────────────
function MotivationCard() {
  return (
    <div style={{background:"linear-gradient(135deg,#ecfdf5 0%,#d1fae5 50%,#a7f3d0 100%)",
      borderRadius:20,padding:20,marginBottom:16,
      boxShadow:"0 8px 24px rgba(16,185,129,.2)",border:"1px solid rgba(255,255,255,.8)",
      animation:"fadeSlide .6s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <div style={{fontSize:28}}>{DAILY_MSG.icon}</div>
        <div>
          <h3 style={{margin:0,fontSize:15,fontWeight:800,fontFamily:"Nunito",color:"#065f46"}}>Daily Motivation</h3>
          <p style={{margin:0,fontSize:11,color:"#6ee7b7",fontFamily:"Nunito"}}>Your health mantra for today</p>
        </div>
      </div>
      <p style={{margin:0,fontSize:14,color:"#047857",fontFamily:"Nunito",lineHeight:1.6,fontWeight:600}}>
        "{DAILY_MSG.text}"
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Daily Summary
// ─────────────────────────────────────────────────────────────────────────────
function DailySummary({ consumed, goal, reminders }) {
  const pct = Math.min((consumed/goal)*100, 100);
  const active  = reminders.filter(r=>r.enabled).length;
  const total   = reminders.length;

  return (
    <div style={{background:"white",borderRadius:20,padding:20,marginBottom:20,
      boxShadow:"0 8px 24px rgba(0,0,0,.08)",border:"1px solid rgba(148,163,184,.15)"}}>
      <h3 style={{margin:"0 0 16px",fontSize:16,fontWeight:800,fontFamily:"Nunito",color:"#1e293b",
        display:"flex",alignItems:"center",gap:8}}><span>📊</span> Daily Summary</h3>

      {/* Water */}
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <WaterDropIcon size={16} color="#3b82f6"/>
            <span style={{fontSize:13,fontWeight:700,fontFamily:"Nunito",color:"#334155"}}>Water Consumed</span>
          </div>
          <span style={{fontSize:13,fontWeight:700,fontFamily:"Nunito",color:pct>=100?"#16a34a":"#3b82f6"}}>
            {consumed}ml / {goal}ml
          </span>
        </div>
        <div style={{background:"#e2e8f0",borderRadius:99,height:8,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:99,width:`${pct}%`,
            background:"linear-gradient(90deg,#60a5fa,#818cf8)",transition:"width .8s ease"}}/>
        </div>
      </div>

      {/* Reminders summary */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"12px 14px",borderRadius:12,background:"#f8fafc",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <BellIcon size={17} color="#7c3aed"/>
          <span style={{fontSize:13,fontWeight:700,fontFamily:"Nunito",color:"#334155"}}>Walk Reminders</span>
        </div>
        <span style={{fontSize:12,fontWeight:700,fontFamily:"Nunito",padding:"4px 10px",borderRadius:99,
          background:total===0?"#f1f5f9":active>0?"#ede9fe":"#fee2e2",
          color:total===0?"#94a3b8":active>0?"#7c3aed":"#dc2626"}}>
          {total===0?"None set":active===0?"All disabled":`${active} / ${total} active`}
        </span>
      </div>

      {/* Next reminder */}
      {(() => {
        const now = nowHHMM();
        const next = [...reminders]
          .filter(r=>r.enabled)
          .sort((a,b)=>a.time.localeCompare(b.time))
          .find(r=>r.time>now)
          || reminders.filter(r=>r.enabled).sort((a,b)=>a.time.localeCompare(b.time))[0];
        if (!next) return null;
        return (
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"12px 14px",borderRadius:12,background:"#f8fafc"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <FootIcon size={17} color="#3b82f6"/>
              <span style={{fontSize:13,fontWeight:700,fontFamily:"Nunito",color:"#334155"}}>Next Walk</span>
            </div>
            <span style={{fontSize:12,fontWeight:700,fontFamily:"Nunito",padding:"4px 10px",borderRadius:99,
              background:"#dbeafe",color:"#1d4ed8"}}>
              🕐 {formatTime12(next.time)}{next.label?` · ${next.label}`:""}
            </span>
          </div>
        );
      })()}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Header — live Day / Date / Time
// ─────────────────────────────────────────────────────────────────────────────
function Header() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const day   = now.toLocaleDateString("en-US", { weekday: "long" });
  const date  = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const hours = String(now.getHours()).padStart(2, "0");
  const mins  = String(now.getMinutes()).padStart(2, "0");
  const secs  = String(now.getSeconds()).padStart(2, "0");
  const ampm  = now.getHours() >= 12 ? "PM" : "AM";
  const h12   = String(now.getHours() % 12 || 12).padStart(2, "0");

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      marginBottom: 20, animation: "fadeSlide .5s ease .3s both",
    }}>
      {/* Left: app title */}
      <div>
        <p style={{ fontSize: 13, color: "#64748b", fontFamily: "Nunito", fontWeight: 600, margin: 0 }}>
          Your daily health companion
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#1e293b", fontFamily: "Nunito", lineHeight: 1.2, margin: 0 }}>
          HydroWalk 💧🚶
        </h1>
      </div>

      {/* Right: live date-time card */}
      <div style={{
        background: "linear-gradient(135deg,#1d4ed8 0%,#4338ca 60%,#6d28d9 100%)",
        borderRadius: 18,
        padding: "10px 14px",
        boxShadow: "0 6px 24px rgba(67,56,202,.4)",
        textAlign: "center",
        minWidth: 100,
        flexShrink: 0,
      }}>
        {/* Day */}
        <p style={{
          margin: 0, fontSize: 10, fontWeight: 800, fontFamily: "Nunito",
          color: "rgba(255,255,255,.65)", letterSpacing: 1, textTransform: "uppercase",
          lineHeight: 1,
        }}>
          {day}
        </p>

        {/* Live time — HH:MM:SS */}
        <p style={{
          margin: "4px 0 2px", fontFamily: "Nunito", fontWeight: 900,
          fontSize: 22, color: "white", lineHeight: 1,
          letterSpacing: -0.5,
        }}>
          {h12}:{mins}
          <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.75, marginLeft: 1 }}>
            :{secs}
          </span>
          <span style={{ fontSize: 11, fontWeight: 800, marginLeft: 4, color: "#bfdbfe" }}>
            {ampm}
          </span>
        </p>

        {/* Date: Month Day, Year */}
        <p style={{
          margin: 0, fontSize: 10, fontWeight: 700, fontFamily: "Nunito",
          color: "rgba(255,255,255,.6)", lineHeight: 1,
        }}>
          {date}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = { dailyGoal:2000, glassSize:250, remindersOn:true };

export default function App() {
  const [showWelcome,  setShowWelcome]  = useState(true);
  const [consumed,     setConsumed]     = useState(0);
  const [settings,     setSettings]     = useState(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [reminders,    setReminders]    = useState([]);

  const handleSaveSettings = ns => {
    setSettings(ns);
    setConsumed(p=>Math.min(p,ns.dailyGoal));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        html{min-height:100%}
        body{
          background:linear-gradient(160deg,#e0f2fe 0%,#ede9fe 50%,#f0fdf4 100%);
          min-height:100vh;font-family:'Nunito',sans-serif;
          display:flex;justify-content:center;align-items:flex-start;
        }
        #root{width:100%;max-width:420px;min-height:100vh;box-shadow:0 0 80px rgba(99,102,241,.10);}
        ::-webkit-scrollbar{display:none}
        input[type=time]{appearance:none;-webkit-appearance:none}
        input[type=time]::-webkit-calendar-picker-indicator{filter:invert(1);opacity:.6;cursor:pointer}
        input::placeholder{color:rgba(255,255,255,.4)}
        @keyframes float    {from{transform:translateY(0) scale(1)}     to{transform:translateY(-20px) scale(1.05)}}
        @keyframes orbit    {from{transform:translate(-50%,-50%) scale(1)} to{transform:translate(-50%,-50%) scale(1.3)}}
        @keyframes pulse    {0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.12)}}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn   {from{opacity:0} to{opacity:1}}
        @keyframes slideUp  {from{transform:translateY(100%)} to{transform:translateY(0)}}
        button:active{transform:scale(.97)!important}
      `}</style>

      {showWelcome && <WelcomeScreen onDone={()=>setShowWelcome(false)}/>}

      {showSettings && (
        <SettingsModal settings={settings} onSave={handleSaveSettings} onClose={()=>setShowSettings(false)}/>
      )}

      <div style={{padding:"20px 16px 40px",opacity:showWelcome?0:1,transition:"opacity .5s ease .2s"}}>

        {/* Header */}
        <Header/>

        {/* Hydration */}
        <div style={{animation:"fadeSlide .5s ease .4s both"}}>
          <HydrationSection consumed={consumed} setConsumed={setConsumed}
            settings={settings} onOpenSettings={()=>setShowSettings(true)}/>
        </div>

        {/* Walking reminders */}
        <div style={{animation:"fadeSlide .5s ease .5s both"}}>
          <WalkingReminders reminders={reminders} setReminders={setReminders}/>
        </div>

        {/* Motivation */}
        <div style={{animation:"fadeSlide .5s ease .6s both"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <div style={{background:"linear-gradient(135deg,#10b981,#34d399)",borderRadius:10,width:34,height:34,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🌟</div>
            <h2 style={{fontSize:18,fontWeight:800,color:"#1e293b",fontFamily:"Nunito",margin:0}}>Daily Motivation</h2>
          </div>
          <MotivationCard/>
        </div>

        {/* Summary */}
        <div style={{animation:"fadeSlide .5s ease .7s both"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <div style={{background:"linear-gradient(135deg,#f59e0b,#fbbf24)",borderRadius:10,width:34,height:34,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📊</div>
            <h2 style={{fontSize:18,fontWeight:800,color:"#1e293b",fontFamily:"Nunito",margin:0}}>Daily Summary</h2>
          </div>
          <DailySummary consumed={consumed} goal={settings.dailyGoal} reminders={reminders}/>
        </div>

        {/* Footer */}
        <footer style={{background:"linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",
          borderRadius:20,padding:"20px 16px",textAlign:"center",
          boxShadow:"0 8px 24px rgba(0,0,0,.15)",animation:"fadeSlide .5s ease .8s both"}}>
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