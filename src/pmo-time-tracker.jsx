import { useState, useMemo, useEffect, useRef, Fragment } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  navy: "#0B1C2E", navyMid: "#162840", navyLight: "#1E3A52",
  orange: "#F05A22", orangeLight: "#FF7A45",
  teal: "#0E8A7E", tealLight: "#14B5A6",
  cream: "#F8F6F1", white: "#FFFFFF",
  border: "#E4DDD3", muted: "#8C8278", text: "#1A1208",
  success: "#2D9B6F", warn: "#E8A020",
  purple: "#8B5CF6",
};

// ─── Constants ────────────────────────────────────────────────────────────────
const TEAM = [
  { id: "natalia", name: "Natalia", role: "PMO Project Manager", color: T.orange },
  { id: "member2", name: "Cara", role: "PMO Project Manager", color: T.teal },
  { id: "member3", name: "Quin", role: "PMO Manager", color: T.purple },
];
const WORK_TYPES = ["Project Work","Intake","Big Idea Planning","Stakeholder Communication","Documentation","Meetings","Risk & Issues","Reporting","Admin / Other","Personal Development"];
const PRODUCTIVE_TYPES = ["Project Work","Intake","Stakeholder Communication","Big Idea Planning"];
const OVERHEAD_TYPES   = ["Meetings","Admin / Other","Reporting","Risk & Issues","Documentation"];
const CAPACITY_TARGET_PCT = 0.70;
const WORK_WEEK_H = 40;
const CAPACITY_TARGET_H = Math.round(WORK_WEEK_H * CAPACITY_TARGET_PCT); // 28
const STATUSES = ["Active","FY26","On Hold","Complete","Planned"];
const PROJ_COLORS = [T.orange, T.teal, T.purple, T.warn, "#EC4899", T.success, "#6366F1", T.navyLight];

const PRIORITIES = ["High","Medium","Low"];
const LOE_SIZES = ["XS","S","M","L","XL","XXL"];
const LOE_LABELS = { XS:"< 1 week", S:"1-2 weeks", M:"2-6 weeks", L:"1-3 months", XL:"3-6 months", XXL:"6+ months" };

const CHANGELOG = [
  {
    version: "2.1", date: "May 2026", tag: "Update", tagColor: T.purple, released: null,
    whatsNew: [
      { title: "Project Spotlight on Dashboard", desc: "Pick any project from the Dashboard to instantly see total hours, period hours, breakdown by person, and breakdown by work type — no tab-switching needed." },
      { title: "FY26 Year-Round project status", desc: "New 'FY26' status for always-on initiatives (PMO Admin, Intake/Ideation, IT Admin Work). In the Exec View, these appear below a purple divider row clearly labeled 'FY26 Standing Initiatives · Run through the full fiscal year.'" },
      { title: "Project sections in Projects tab", desc: "Projects are now grouped into labeled sections — Active, FY26 Year-Round, On Hold, Planned, and Completed — with colored dot headers and project counts." },
      { title: "Exec View period filter", desc: "Exec View now has the same period selector as the Dashboard: This Week, Last Week, Month to Date, All Time, or pick any specific month." },
      { title: "Completed projects in Exec View scorecard", desc: "Projects completed within the selected period now appear at the bottom of the Portfolio Scorecard with a neon green 'Completed' badge." },
      { title: "Capacity by Project on Dashboard", desc: "New panel breaks down hours by project against a 70%/30% target split (project work vs. admin/FY26). Shows each project's share of productive capacity with a relative bar so you can see where time is actually going." },
    ],
    improvements: [
      { title: "Merge Team Data protects your edits", desc: "When merging a teammate's data, changed projects now default to unchecked — so your local updates (FY26 status, LOE sizes, etc.) are never accidentally overwritten." },
      { title: "Completed project cards fixed", desc: "Completed projects now show '✓ Complete' in teal instead of an 'overdue' warning. Progress bar fills to 100%." },
      { title: "Big Ideas show in entry edit", desc: "Editing a time entry now shows all global Big Ideas in the dropdown — previously it was incorrectly filtering to project-linked ideas only." },
      { title: "Exec View FY26 divider row", desc: "FY26 initiatives get a full-width purple gradient divider in the scorecard — 'Full Year' in the end date column, hours in purple." },
      { title: "Release Notes tab renamed", desc: "The 'What's New' tab is now called 'Release Notes' — more professional and easier to find." },
    ],
    removed: [],
  },
  {
    version: "2.0", date: "May 2026", tag: "Major Release", tagColor: T.orange, released: null,
    whatsNew: [
      { title: "Quick Log on Dashboard", desc: "Log time without switching tabs — inline form with quick-pick hour buttons (0.5h–4h) right on the Dashboard." },
      { title: "Period Summary Export", desc: "📋 Summary button generates a formatted text report for the selected period. Copy it straight into Teams or email." },
      { title: "LOE / T-Shirt Sizing on Projects", desc: "Projects now support effort sizing (XS → XXL) — visible on project cards, the edit form, and the Exec View scorecard." },
      { title: "Notes Search in All Entries", desc: "New search bar filters across all entry notes in real time." },
      { title: "Month Filter on Dashboard", desc: "Pick any historical month from the period selector to analyze data for that specific month." },
      { title: "Merge Team Data", desc: "Import a teammate's JSON export and merge their entries into your live data — with project change detection built in." },
      { title: "Release Notes (this tab)", desc: "Versioned changelog now lives inside the app. You're looking at it." },
    ],
    improvements: [
      { title: "Smarter Dashboard KPIs", desc: "Per Person and Contributors tiles replaced with Productive Time %, Overhead Ratio, and Top Project — all period-aware." },
      { title: "Work Type Breakdown shows %", desc: "Hours by work type now displays percentage alongside hours so you can see the split at a glance." },
      { title: "Team Capacity follows selected period", desc: "Capacity bars now reflect whatever period is selected on the Dashboard, not just the current month." },
      { title: "Exec View synced", desc: "Executive View now uses consistent work type definitions across the whole app — no more discrepancies." },
      { title: "Import auto-loads on file select", desc: "Uploading a JSON restore file loads immediately — no extra button click needed." },
      { title: "Export crash fixed", desc: "Backup export now works inside Claude artifacts — falls back to a copyable text box if direct download is blocked." },
      { title: "Top Project tile wraps text", desc: "Long project names no longer get cut off in the Dashboard KPI tile." },
      { title: "At-risk banner cleaned up", desc: "Removed misleading budget % from the attention banner — was showing inflated numbers from placeholder estimates." },
    ],
    removed: [
      { title: "Pilot Tracker tab", desc: "Pilot is live and running — the dedicated tracker tab has been removed." },
      { title: "Weekly Digest button", desc: "Replaced by the more flexible Period Summary export." },
      { title: "Per Person toggle & Contributors tile", desc: "Removed from Dashboard — team-level view is the default." },
      { title: "Project Lifecycle work type", desc: "Consolidated into Project Work to reduce categorization ambiguity." },
    ],
  },
  {
    version: "1.0", date: "March 2026", tag: "Pilot Launch", tagColor: T.teal, released: "March 10, 2026",
    whatsNew: [
      { title: "7-tab PMO tracker", desc: "Dashboard, Log Time, All Entries, Team, Projects, Big Ideas, and Pilot Tracker — full tracking suite built and deployed." },
      { title: "Auto-save to disk", desc: "All changes save automatically to pmo-tracker-live.json via a local file API. No manual export needed day-to-day." },
      { title: "Big Ideas pool", desc: "Global idea bank linkable to any project entry — available across all projects with no pre-linking step." },
      { title: "Team capacity tracking", desc: "Per-person capacity bars measured against a 70% billable target." },
      { title: "CSV export", desc: "Export any filtered view of entries to CSV for reporting." },
      { title: "Week-over-week comparisons", desc: "Dashboard shows week-on-week delta for hours, projects, and contributors." },
    ],
    improvements: [],
    removed: [],
  },
];

const INIT_GLOBAL_IDEAS = [
  { id: "bi001", title: "Real-time OMS sync across all store regions", notes: "Explore middleware approach for low-latency updates" },
  { id: "bi002", title: "Automated war room reconciliation via photo AI", notes: "Daily board to tracker diff without manual entry" },
  { id: "bi003", title: "Opt-in SMS flow triggered at POS checkout", notes: "Reduce friction for store associates during peak hours" },
];

const INIT_PROJECTS = [
  { id: "fluent", name: "Fluent OMS", color: T.orange, status: "Active",
    pm: "natalia", startDate: "2025-06-01", endDate: "2025-12-31",
    description: "Middleware integration launching Fluent OMS across all store regions with SSO, Aurus, and reporting workstreams.",
    priority: "High", sponsor: "VP Technology",
    bigIdeas: ["bi001","bi002"]
  },
  { id: "possms", name: "POS/SMS Service Invite", color: T.teal, status: "Active",
    pm: "member2", startDate: "2025-08-01", endDate: "2026-02-28",
    description: "Enable opt-in SMS service invitations triggered at point-of-sale checkout to drive customer engagement and NPS data collection.",
    priority: "Medium", sponsor: "VP Operations",
    bigIdeas: ["bi003"]
  },
  { id: "dtg", name: "DTG Process Improvements", color: "#8B5CF6", status: "Active",
    pm: "member3", startDate: "2025-09-01", endDate: "2026-03-31",
    description: "Streamline direct-to-garment order and fulfillment workflows, reduce turnaround time, and improve data integration with ERP systems.",
    priority: "Medium", sponsor: "VP Merchandise",
    bigIdeas: []
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 8); }
function today() { return new Date().toISOString().slice(0, 10); }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); }
function getMondayOf(dateStr) { const d = new Date(dateStr + "T12:00:00"); const dow = d.getDay(); d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow)); return d.toISOString().slice(0, 10); }
function getWeekDays(mondayStr) { return ["Mon","Tue","Wed","Thu","Fri"].map((lbl,i) => { const d = new Date(mondayStr + "T12:00:00"); d.setDate(d.getDate() + i); return { label: lbl, date: d.toISOString().slice(0, 10) }; }); }
function getWeekStart() { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().slice(0, 10); }
function getLastWeekStart() { const d = new Date(getWeekStart() + "T12:00:00"); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10); }
function getMonthStart() { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1).toISOString().slice(0, 10); }
function fmtH(h) {
  if (!h && h !== 0) return "—";
  const hrs = Math.floor(h), m = Math.round((h - hrs) * 60);
  if (hrs === 0) return `${m}m`; if (m === 0) return `${hrs}h`; return `${hrs}h ${m}m`;
}
function exportCSV(entries, projects, globalIdeas) {
  const pMap = Object.fromEntries(projects.map(p => [p.id, p.name]));
  const tMap = Object.fromEntries(TEAM.map(t => [t.id, t.name]));
  const biMap = {};
  globalIdeas.forEach(b => { biMap[b.id] = b.title; });
  const rows = [["Date","Team Member","Project","Work Type","Big Idea","Hours","Notes"],
    ...entries.map(e => [e.date, tMap[e.person]||e.person, pMap[e.project]||e.project, e.workType, e.bigIdea ? (biMap[e.bigIdea]||e.bigIdea) : "", e.hours, `"${(e.notes||"").replace(/"/g,'""')}"`])];
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" }));
  a.download = `pmo-time-${today()}.csv`; a.click();
}

const SEED = [];

// ─── Shared UI ────────────────────────────────────────────────────────────────
const INP = { padding:"10px 13px", border:`1.5px solid ${T.border}`, borderRadius:7, fontSize:13, fontFamily:"inherit", background:T.white, color:T.text, outline:"none", width:"100%" };

function Field({ label, error, children, span }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5,gridColumn:span?"span 2":undefined}}>
      <label style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:T.muted}}>{label}</label>
      {children}
      {error && <span style={{fontSize:11,color:T.orange,fontWeight:600}}>{error}</span>}
    </div>
  );
}

function Pill({ label, color, small }) {
  return <span style={{display:"inline-flex",alignItems:"center",padding:small?"2px 7px":"4px 10px",borderRadius:99,background:color+"22",border:`1px solid ${color}44`,fontSize:small?10.5:12,fontWeight:700,color,whiteSpace:"nowrap"}}>{label}</span>;
}

function StatTile({ label, value, sub, accent, delta, deltaPositive, progress, valueTruncate = true }) {
  const barColor = progress == null ? null : progress >= 100 ? T.success : progress >= 70 ? T.orange : T.navy;
  return (
    <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"20px 22px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:accent||T.orange,borderRadius:"12px 12px 0 0"}}/>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.09em",textTransform:"uppercase",color:T.muted,marginBottom:8}}>{label}</div>
      <div style={{fontSize: valueTruncate ? 30 : 18,fontWeight:800,color:T.navy,lineHeight: valueTruncate ? 1 : 1.2,letterSpacing:"-0.02em",wordBreak: valueTruncate ? "normal" : "break-word",whiteSpace: valueTruncate ? "nowrap" : "normal",overflow: valueTruncate ? "hidden" : "visible",textOverflow: valueTruncate ? "ellipsis" : "clip"}}>{value}</div>
      {sub && <div style={{fontSize:11.5,color:T.muted,marginTop:6}}>{sub}</div>}
      {delta && (
        <div style={{marginTop:6,fontSize:10.5,fontWeight:700,color:deltaPositive?T.success:"#EF4444"}}>
          {delta}
        </div>
      )}
      {progress != null && (
        <div style={{marginTop:10,height:4,background:T.border,borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${Math.min(progress,100)}%`,background:barColor,borderRadius:99,transition:"width 0.4s ease"}}/>
        </div>
      )}
    </div>
  );
}

const TTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:T.navy,border:`1px solid ${T.navyLight}`,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.white}}>
      <div style={{fontWeight:700,marginBottom:6,color:T.cream}}>{label}</div>
      {payload.map((p,i) => <div key={i} style={{color:p.color||T.orange}}>{p.name}: <b>{fmtH(p.value)}</b></div>)}
    </div>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ entries, projects, globalIdeas, setEntries }) {
  const [range, setRange] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(""); // "YYYY-MM"
  const [showDigest, setShowDigest] = useState(false);
  const [showQL, setShowQL] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [spotlightId, setSpotlightId] = useState("");
  const [qlForm, setQlForm] = useState({ person:"natalia", date:today(), project:"", workType:"", hours:"", notes:"" });
  const [qlErrors, setQlErrors] = useState({});
  const [qlFlash, setQlFlash] = useState(false);
  function qlSet(k,v){ setQlForm(f=>({...f,[k]:v})); setQlErrors(e=>({...e,[k]:""})); }
  function qlSubmit(){
    const e={};
    if(!qlForm.person) e.person="Required";
    if(!qlForm.project) e.project="Required";
    if(!qlForm.workType) e.workType="Required";
    const h=parseFloat(qlForm.hours);
    if(!qlForm.hours||isNaN(h)||h<=0||h>24) e.hours="Enter 0.25–24";
    if(Object.keys(e).length){setQlErrors(e);return;}
    setEntries(p=>[{...qlForm,hours:h,id:uid()},...p]);
    setQlFlash(true);
    setQlForm(f=>({...f,project:"",workType:"",hours:"",notes:""}));
    setTimeout(()=>setQlFlash(false),2500);
  }
  const pMap = useMemo(() => Object.fromEntries(projects.map(p => [p.id, p])), [projects]);

  // Unique months with data, newest first
  const availableMonths = useMemo(() => {
    const months = [...new Set(entries.map(e => e.date.slice(0, 7)))].sort().reverse();
    return months.map(m => {
      const [y, mo] = m.split("-");
      const label = new Date(parseInt(y), parseInt(mo) - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
      return { value: m, label };
    });
  }, [entries]);

  const filtered = useMemo(() => {
    if (range === "week") return entries.filter(e => e.date >= getWeekStart());
    if (range === "lastweek") { const ws = getWeekStart(), lws = getLastWeekStart(); return entries.filter(e => e.date >= lws && e.date < ws); }
    if (range === "month") return entries.filter(e => e.date >= getMonthStart());
    if (range === "specificMonth" && selectedMonth) return entries.filter(e => e.date.startsWith(selectedMonth));
    return entries.filter(e => e.date >= "2000-01-01");
  }, [entries, range, selectedMonth]);

  const totalH = filtered.reduce((s, e) => s + e.hours, 0);
  const days = [...new Set(filtered.map(e => e.date))].length;
  const byPerson = TEAM.map(t => ({ name:t.name.split(" ")[0], hours:filtered.filter(e=>e.person===t.id).reduce((s,e)=>s+e.hours,0), color:t.color }));
  const byProject = projects.map(p => ({ name:p.name.length>16?p.name.slice(0,14)+"…":p.name, hours:filtered.filter(e=>e.project===p.id).reduce((s,e)=>s+e.hours,0), color:p.color })).filter(p=>p.hours>0).sort((a,b)=>b.hours-a.hours);

  // ── New KPI metrics ───────────────────────────────────────────────────────
  const productiveH = filtered.filter(e=>PRODUCTIVE_TYPES.includes(e.workType)).reduce((s,e)=>s+e.hours,0);
  const overheadH   = filtered.filter(e=>OVERHEAD_TYPES.includes(e.workType)).reduce((s,e)=>s+e.hours,0);
  const productivePct = totalH > 0 ? Math.round((productiveH/totalH)*100) : 0;
  const overheadPct   = totalH > 0 ? Math.round((overheadH/totalH)*100)   : 0;
  const topProject    = byProject[0] || null;
  const TYPE_COLORS = [T.orange,T.teal,T.purple,T.warn,T.tealLight,"#EC4899",T.orangeLight,"#6366F1",T.success,"#14B8A6"];
  const byType = WORK_TYPES.map((wt,i) => ({ name:wt, value:filtered.filter(e=>e.workType===wt).reduce((s,e)=>s+e.hours,0), color:TYPE_COLORS[i%10] })).filter(t=>t.value>0);
  const trend = Array.from({length:7},(_,i) => {
    const d = daysAgo(6-i);
    const row = { date:d, label:new Date(d+"T12:00:00").toLocaleDateString("en-US",{weekday:"short"}) };
    TEAM.forEach(t => { row[t.name.split(" ")[0]] = entries.filter(e=>e.date===d&&e.person===t.id).reduce((s,e)=>s+e.hours,0); });
    return row;
  });
  const recent = [...filtered].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8);

  // ── Week-over-week comparison ──────────────────────────────────────────────
  const weekStart = getWeekStart();
  const prevWeekStart = (() => { const d = new Date(weekStart+"T12:00:00"); d.setDate(d.getDate()-7); return d.toISOString().slice(0,10); })();
  const thisWeekE = entries.filter(e => e.date >= weekStart);
  const prevWeekE = entries.filter(e => e.date >= prevWeekStart && e.date < weekStart);
  const thisWeekH = thisWeekE.reduce((s,e)=>s+e.hours,0);
  const prevWeekH = prevWeekE.reduce((s,e)=>s+e.hours,0);
  const thisWeekContrib = new Set(thisWeekE.map(e=>e.person)).size;
  const prevWeekContrib = new Set(prevWeekE.map(e=>e.person)).size;
  const thisWeekProjs = new Set(thisWeekE.map(e=>e.project)).size;
  const prevWeekProjs = new Set(prevWeekE.map(e=>e.project)).size;
  function wowDeltaH() {
    if (!prevWeekH) return null;
    const diff = thisWeekH - prevWeekH;
    return `${diff>=0?"+":"-"}${fmtH(Math.abs(diff))} vs last wk`;
  }
  function wowDeltaN(curr, prev) {
    if (!prev) return null;
    const diff = curr - prev;
    if (diff === 0) return null;
    return `${diff>0?"+":""}${diff} vs last wk`;
  }

  // ── Period capacity target ─────────────────────────────────────────────────
  const periodTarget = useMemo(() => {
    if (range === "week" || range === "lastweek") return CAPACITY_TARGET_H * TEAM.length;
    if (range === "month") {
      const dayOfMonth = new Date().getDate();
      return Math.round((dayOfMonth / 7) * CAPACITY_TARGET_H * TEAM.length);
    }
    if (range === "specificMonth" && selectedMonth) {
      // Full month target
      return Math.round((4.33) * CAPACITY_TARGET_H * TEAM.length);
    }
    return null;
  }, [range, selectedMonth]);
  const perPersonTarget = periodTarget != null ? periodTarget / TEAM.length : null;

  const periodLabel = useMemo(() => {
    if (range === "week") return "This Week";
    if (range === "lastweek") return "Last Week";
    if (range === "specificMonth" && selectedMonth) {
      const [y,mo] = selectedMonth.split("-");
      return new Date(parseInt(y),parseInt(mo)-1,1).toLocaleDateString("en-US",{month:"long",year:"numeric"});
    }
    return new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"}) + " (MTD)";
  }, [range, selectedMonth]);

  // ── At-risk projects ───────────────────────────────────────────────────────
  const atRisk = projects.filter(p => {
    if (!p.endDate || p.endDate==="TBD" || p.status==="Complete" || p.status==="On Hold") return false;
    const dl = Math.round((new Date(p.endDate+"T12:00:00") - new Date())/(1000*60*60*24));
    return dl <= 14;
  }).map(p => ({
    ...p,
    daysLeft: Math.round((new Date(p.endDate+"T12:00:00") - new Date())/(1000*60*60*24)),
    projH: entries.filter(e=>e.project===p.id).reduce((s,e)=>s+e.hours,0),
  })).sort((a,b) => a.daysLeft - b.daysLeft);

  // ── Weekly digest generator ────────────────────────────────────────────────
  function generateDigest() {
    const wEntries = entries.filter(e => e.date >= weekStart);
    if (!wEntries.length) return "No entries logged this week yet.";
    const wsDate = new Date(weekStart+"T12:00:00");
    const wfDate = new Date(weekStart+"T12:00:00"); wfDate.setDate(wfDate.getDate()+4);
    const fd = d => d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
    const totalWH = wEntries.reduce((s,e)=>s+e.hours,0);
    const header = `📊 PMO Weekly Digest — Week of ${fd(wsDate)} – ${fd(wfDate)}\nGenerated: ${new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}\n`;
    const teamLines = TEAM.map(t => {
      const h = wEntries.filter(e=>e.person===t.id).reduce((s,e)=>s+e.hours,0);
      const cnt = wEntries.filter(e=>e.person===t.id).length;
      if (!h) return null;
      return `  ${t.name.split(" ")[0].padEnd(12)}${fmtH(h).padStart(6)}  (${cnt} entr${cnt!==1?"ies":"y"})`;
    }).filter(Boolean);
    const teamSection = `TEAM SUMMARY\n${"─".repeat(42)}\n${teamLines.join("\n")}\n${"─".repeat(42)}\n  ${"Total".padEnd(12)}${fmtH(totalWH).padStart(6)}\n`;
    const projLines = projects.map(p => {
      const h = wEntries.filter(e=>e.project===p.id).reduce((s,e)=>s+e.hours,0);
      if (!h) return null;
      const pct = Math.round((h/totalWH)*100);
      return `  ${p.name.padEnd(30)}${fmtH(h).padStart(6)}  ${pct}%`;
    }).filter(Boolean);
    const projSection = projLines.length ? `\nHOURS BY PROJECT\n${"─".repeat(42)}\n${projLines.join("\n")}\n` : "";
    const typeLines = WORK_TYPES.map(wt => {
      const h = wEntries.filter(e=>e.workType===wt).reduce((s,e)=>s+e.hours,0);
      if (!h) return null;
      const pct = Math.round((h/totalWH)*100);
      return `  ${wt.padEnd(30)}${fmtH(h).padStart(6)}  ${pct}%`;
    }).filter(Boolean);
    const typeSection = typeLines.length ? `\nWORK TYPE BREAKDOWN\n${"─".repeat(42)}\n${typeLines.join("\n")}\n` : "";
    const noteLines = wEntries.filter(e=>e.notes).slice(0,10).map(e => {
      const person = TEAM.find(t=>t.id===e.person)?.name.split(" ")[0]||e.person;
      const proj = projects.find(p=>p.id===e.project)?.name||e.project;
      return `  [${person} · ${proj}] ${e.notes}`;
    });
    const notesSection = noteLines.length ? `\nRECENT NOTES\n${"─".repeat(42)}\n${noteLines.join("\n")}\n` : "";
    return `${header}\n${teamSection}${projSection}${typeSection}${notesSection}`;
  }

  function generateSummary() {
    if (!filtered.length) return "No entries for this period.";
    const rangeLabels = { week:"This Week", lastweek:"Last Week", month:"Month to Date", all:"All Time", specificMonth:"" };
    let periodLabel = rangeLabels[range] || "";
    if (range === "specificMonth" && selectedMonth) {
      const [y,mo] = selectedMonth.split("-");
      periodLabel = new Date(parseInt(y),parseInt(mo)-1,1).toLocaleDateString("en-US",{month:"long",year:"numeric"});
    }
    const totalSH = filtered.reduce((s,e)=>s+e.hours,0);
    const prodH = filtered.filter(e=>PRODUCTIVE_TYPES.includes(e.workType)).reduce((s,e)=>s+e.hours,0);
    const ovhH  = filtered.filter(e=>OVERHEAD_TYPES.includes(e.workType)).reduce((s,e)=>s+e.hours,0);
    const prodPct = totalSH>0?Math.round((prodH/totalSH)*100):0;
    const header = `📋 PMO Summary — ${periodLabel}\nGenerated: ${new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}\n`;
    const kpi = `KEY METRICS\n${"─".repeat(42)}\n  Total Hours      ${fmtH(totalSH).padStart(8)}\n  Productive Time  ${(prodPct+"%").padStart(8)}  (${fmtH(prodH)})\n  Overhead         ${(totalSH>0?Math.round((ovhH/totalSH)*100)+"%":"—").padStart(8)}  (${fmtH(ovhH)})\n`;
    const teamLines = TEAM.map(t => {
      const h = filtered.filter(e=>e.person===t.id).reduce((s,e)=>s+e.hours,0);
      const pct = totalSH>0?Math.round((h/totalSH)*100):0;
      if (!h) return null;
      return `  ${t.name.split(" ")[0].padEnd(14)}${fmtH(h).padStart(6)}  ${pct}%`;
    }).filter(Boolean);
    const teamSection = teamLines.length ? `\nHOURS BY PERSON\n${"─".repeat(42)}\n${teamLines.join("\n")}\n` : "";
    const projLines = projects.map(p => {
      const h = filtered.filter(e=>e.project===p.id).reduce((s,e)=>s+e.hours,0);
      if (!h) return null;
      const pct = Math.round((h/totalSH)*100);
      return `  ${p.name.padEnd(28)}${fmtH(h).padStart(6)}  ${pct}%`;
    }).filter(Boolean);
    const projSection = projLines.length ? `\nHOURS BY PROJECT\n${"─".repeat(42)}\n${projLines.join("\n")}\n` : "";
    const typeLines = WORK_TYPES.map(wt => {
      const h = filtered.filter(e=>e.workType===wt).reduce((s,e)=>s+e.hours,0);
      if (!h) return null;
      const pct = Math.round((h/totalSH)*100);
      return `  ${wt.padEnd(28)}${fmtH(h).padStart(6)}  ${pct}%`;
    }).filter(Boolean);
    const typeSection = typeLines.length ? `\nWORK TYPE BREAKDOWN\n${"─".repeat(42)}\n${typeLines.join("\n")}\n` : "";
    const noteLines = filtered.filter(e=>e.notes).slice(0,15).map(e => {
      const person = TEAM.find(t=>t.id===e.person)?.name.split(" ")[0]||e.person;
      const proj = projects.find(p=>p.id===e.project)?.name||e.project;
      return `  [${person} · ${proj} · ${e.date}] ${e.notes}`;
    });
    const notesSection = noteLines.length ? `\nNOTABLE NOTES\n${"─".repeat(42)}\n${noteLines.join("\n")}\n` : "";
    return `${header}\n${kpi}${teamSection}${projSection}${typeSection}${notesSection}`;
  }

  return (
    <div style={{display:"grid",gap:20}}>
      <div style={{display:"flex",gap:6,alignItems:"center",justifyContent:"space-between",flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:11,color:T.muted,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginRight:4}}>Period:</span>
          {[{v:"week",l:"This Week"},{v:"lastweek",l:"Last Week"},{v:"month",l:"Month to Date"},{v:"all",l:"All Time"}].map(r => (
            <button key={r.v} onClick={()=>setRange(r.v)} style={{padding:"7px 18px",borderRadius:7,border:`1.5px solid ${range===r.v&&range!=="specificMonth"?T.navy:T.border}`,background:range===r.v&&range!=="specificMonth"?T.navy:"transparent",color:range===r.v&&range!=="specificMonth"?T.white:T.muted,cursor:"pointer",fontSize:12.5,fontWeight:600}}>
              {r.l}
            </button>
          ))}
          <select
            value={range === "specificMonth" ? selectedMonth : ""}
            onChange={e => { if (e.target.value) { setSelectedMonth(e.target.value); setRange("specificMonth"); } }}
            style={{padding:"7px 14px",borderRadius:7,border:`1.5px solid ${range==="specificMonth"?T.navy:T.border}`,background:range==="specificMonth"?T.navy:"white",color:range==="specificMonth"?T.white:T.muted,cursor:"pointer",fontSize:12.5,fontWeight:600,outline:"none"}}>
            <option value="">📅 Pick Month…</option>
            {availableMonths.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setShowSummary(true)} style={{padding:"7px 16px",borderRadius:7,border:`1.5px solid ${T.border}`,background:"transparent",color:T.text,cursor:"pointer",fontSize:12.5,fontWeight:700}}>
            📋 Summary
          </button>
          <button onClick={()=>setShowQL(v=>!v)} style={{padding:"7px 16px",borderRadius:7,border:`1.5px solid ${showQL?T.orange:T.border}`,background:showQL?T.orange:"transparent",color:showQL?T.white:T.text,cursor:"pointer",fontSize:12.5,fontWeight:700,display:"flex",alignItems:"center",gap:5}}>
            ✚ Quick Log
          </button>
        </div>
      </div>
      {showQL && (
        <div style={{background:T.white,border:`1.5px solid ${T.orange}55`,borderRadius:12,padding:"20px 22px",display:"grid",gap:14}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:13,fontWeight:700,color:T.navy}}>⚡ Quick Log Entry</div>
            {qlFlash && <div style={{fontSize:12,fontWeight:700,color:T.success,background:"#D1FAE5",padding:"4px 12px",borderRadius:6}}>✓ Logged!</div>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 90px 1fr",gap:10,alignItems:"end"}}>
            <Field label="Person" error={qlErrors.person}>
              <select value={qlForm.person} onChange={e=>qlSet("person",e.target.value)} style={{...INP,fontSize:12}}>
                {TEAM.map(t=><option key={t.id} value={t.id}>{t.name.split(" ")[0]}</option>)}
              </select>
            </Field>
            <Field label="Date">
              <input type="date" value={qlForm.date} onChange={e=>qlSet("date",e.target.value)} style={{...INP,fontSize:12}}/>
            </Field>
            <Field label="Project" error={qlErrors.project}>
              <select value={qlForm.project} onChange={e=>qlSet("project",e.target.value)} style={{...INP,fontSize:12}}>
                <option value="">Select…</option>
                {projects.filter(p=>p.status==="Active").map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
            <Field label="Work Type" error={qlErrors.workType}>
              <select value={qlForm.workType} onChange={e=>qlSet("workType",e.target.value)} style={{...INP,fontSize:12}}>
                <option value="">Select…</option>
                {WORK_TYPES.map(w=><option key={w}>{w}</option>)}
              </select>
            </Field>
            <Field label="Hours" error={qlErrors.hours}>
              <input type="number" min="0.25" max="24" step="0.25" placeholder="0" value={qlForm.hours} onChange={e=>qlSet("hours",e.target.value)} style={{...INP,fontSize:12}}/>
            </Field>
            <Field label="Notes (optional)">
              <input type="text" placeholder="Brief note…" value={qlForm.notes} onChange={e=>qlSet("notes",e.target.value)} style={{...INP,fontSize:12}}/>
            </Field>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{display:"flex",gap:5}}>
              {[0.5,1,1.5,2,3,4].map(h=>(
                <button key={h} onClick={()=>qlSet("hours",String(h))} style={{padding:"4px 10px",borderRadius:5,border:`1px solid ${qlForm.hours===String(h)?T.orange:T.border}`,background:qlForm.hours===String(h)?T.orange+"22":"transparent",color:qlForm.hours===String(h)?T.orange:T.muted,cursor:"pointer",fontSize:11.5,fontWeight:600}}>
                  {h}h
                </button>
              ))}
            </div>
            <button onClick={qlSubmit} style={{marginLeft:"auto",padding:"9px 24px",background:T.orange,border:"none",borderRadius:7,color:T.white,cursor:"pointer",fontSize:13,fontWeight:700}}>
              Log Entry
            </button>
          </div>
        </div>
      )}
      <div style={{display:"grid",gap:14}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          <StatTile label="Team Hours" value={fmtH(totalH)}
            sub={periodTarget ? `of ${fmtH(periodTarget)} target · ${Math.round((totalH/periodTarget)*100)}%` : `${filtered.length} entries`}
            accent={T.navy} progress={periodTarget ? (totalH/periodTarget)*100 : null}
            delta={range==="week"?wowDeltaH():null} deltaPositive={thisWeekH>=prevWeekH}/>
          <StatTile label="Productive Time" value={`${productivePct}%`}
            sub={`${fmtH(productiveH)} on delivery · ${fmtH(overheadH)} overhead`}
            accent={T.teal} progress={productivePct}/>
          <StatTile label="Overhead Ratio" value={`${overheadPct}%`}
            sub={`${fmtH(overheadH)} in meetings & admin`}
            accent={overheadPct>40?"#EF4444":overheadPct>25?T.warn:T.success} progress={overheadPct}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
          <StatTile label="Top Project" value={topProject ? topProject.name : "—"} valueTruncate={false}
            sub={topProject ? `${fmtH(topProject.hours)} · ${byProject.length} project${byProject.length!==1?"s":""} with hours` : "no entries yet"}
            accent={topProject?.color||T.orange}/>
          <StatTile label="Active Projects" value={byProject.length}
            sub={`of ${projects.filter(p=>p.status==="Active").length} active projects`} accent={T.purple}
            delta={range==="week"?wowDeltaN(thisWeekProjs,prevWeekProjs):null} deltaPositive={thisWeekProjs>=prevWeekProjs}/>
        </div>
      </div>
      {atRisk.length > 0 && (
        <div style={{background:"#FFF7ED",border:`1.5px solid ${T.warn}88`,borderRadius:10,padding:"12px 18px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <span style={{fontSize:12,fontWeight:700,color:T.warn,flexShrink:0}}>⚠️ {atRisk.length} project{atRisk.length>1?"s":""} need{atRisk.length===1?"s":""} attention</span>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",flex:1}}>
            {atRisk.map(p => {
              const riskColor = p.daysLeft < 0 ? "#EF4444" : T.warn;
              return (
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 11px",background:T.white,borderRadius:7,border:`1px solid ${riskColor}55`,flexWrap:"wrap"}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:riskColor,flexShrink:0}}/>
                  <span style={{fontSize:12,fontWeight:700,color:T.text}}>{p.name}</span>
                  <span style={{fontSize:11,fontWeight:700,color:riskColor}}>
                    {p.daysLeft<0?`${Math.abs(p.daysLeft)}d overdue`:p.daysLeft===0?"due today":`${p.daysLeft}d left`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:16}}>
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"22px 20px 14px"}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted,marginBottom:14}}>7-Day Team Trend</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trend} margin={{top:4,right:8,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
              <XAxis dataKey="label" tick={{fontSize:11,fill:T.muted}}/>
              <YAxis tick={{fontSize:11,fill:T.muted}}/>
              <Tooltip content={<TTip/>}/>
              {TEAM.map(t => <Line key={t.id} type="monotone" dataKey={t.name.split(" ")[0]} stroke={t.color} strokeWidth={2.5} dot={{r:3,fill:t.color}} activeDot={{r:5}}/>)}
            </LineChart>
          </ResponsiveContainer>
          <div style={{display:"flex",gap:16,justifyContent:"center",marginTop:8}}>
            {TEAM.map(t => <div key={t.id} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.muted}}><span style={{width:14,height:3,background:t.color,display:"inline-block",borderRadius:2}}/>{t.name.split(" ")[0]}</div>)}
          </div>
        </div>
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"22px 20px 14px"}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted,marginBottom:14}}>Hours by Project</div>
          {byProject.length>0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byProject} layout="vertical" margin={{top:0,right:10,left:0,bottom:0}}>
                <XAxis type="number" tick={{fontSize:10,fill:T.muted}}/>
                <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:T.text}} width={90}/>
                <Tooltip content={<TTip/>}/>
                <Bar dataKey="hours" radius={[0,5,5,0]}>{byProject.map((p,i)=><Cell key={i} fill={p.color}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{padding:"60px 0",textAlign:"center",color:T.muted,fontSize:13}}>No project data yet.</div>}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"22px 24px"}}>
          {(() => {
            const isWeek = range==="week"||range==="lastweek";
            const capTarget = isWeek ? CAPACITY_TARGET_H : Math.round(4.33 * CAPACITY_TARGET_H);
            const capLabel  = isWeek ? `Target: ${fmtH(CAPACITY_TARGET_H)} / person` : `Target: ${fmtH(capTarget)} / person`;
            const periodLabel = range==="week"?"This Week":range==="lastweek"?"Last Week":range==="specificMonth"&&selectedMonth?new Date(selectedMonth+"-15").toLocaleDateString("en-US",{month:"long",year:"numeric"}):"This Month";
            return (<>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted}}>Team Capacity — {periodLabel}</div>
                <div style={{fontSize:10,color:T.muted}}>{capLabel}</div>
              </div>
              {TEAM.map(t => {
                const periodH = filtered.filter(e=>e.person===t.id).reduce((s,e)=>s+e.hours,0);
                const capPct = Math.min(Math.round((periodH/capTarget)*100),100);
                const atCap = periodH >= capTarget;
                const barColor = atCap ? "#EF4444" : T.success;
                return (
                  <div key={t.id} style={{marginBottom:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:13,fontWeight:600,color:T.text}}>{t.name.split(" ")[0]}</span>
                        <span style={{padding:"2px 8px",borderRadius:99,background:(atCap?"#EF4444":T.success)+"18",border:`1px solid ${(atCap?"#EF4444":T.success)}44`,fontSize:9.5,fontWeight:700,color:atCap?"#EF4444":T.success}}>
                          {atCap?"At Capacity":"Open for Work"}
                        </span>
                      </div>
                      <span style={{fontSize:12,color:T.muted}}>{fmtH(periodH)} <span style={{color:barColor,fontWeight:700}}>/ {fmtH(capTarget)}</span></span>
                    </div>
                    <div style={{height:8,background:T.cream,borderRadius:4,overflow:"hidden",border:`1px solid ${T.border}`}}>
                      <div style={{width:`${capPct}%`,height:"100%",background:barColor,borderRadius:4,transition:"width 0.4s ease"}}/>
                    </div>
                    <div style={{fontSize:10,color:T.muted,marginTop:3}}>{capPct}% of period target</div>
                  </div>
                );
              })}
            </>);
          })()}
        </div>
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"22px 24px"}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted,marginBottom:14}}>Work Type Breakdown</div>
          {byType.length>0 ? (
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={byType} dataKey="value" innerRadius={38} outerRadius={65} paddingAngle={2}>
                    {byType.map((t,i) => <Cell key={i} fill={t.color}/>)}
                  </Pie>
                  <Tooltip formatter={v=>fmtH(v)} contentStyle={{background:T.navy,border:"none",borderRadius:8,fontSize:12,color:T.white}}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{display:"grid",gap:6,flex:1}}>
                {byType.slice(0,7).map(t => (
                  <div key={t.name} style={{display:"flex",alignItems:"center",gap:7,fontSize:11.5}}>
                    <span style={{width:8,height:8,borderRadius:2,background:t.color,flexShrink:0}}/>
                    <span style={{color:T.text,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</span>
                    <span style={{color:T.muted,flexShrink:0}}>{fmtH(t.value)}</span>
                    <span style={{color:T.muted,flexShrink:0,fontSize:11,minWidth:32,textAlign:"right"}}>{totalH>0?Math.round((t.value/totalH)*100):0}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div style={{padding:"40px 0",textAlign:"center",color:T.muted,fontSize:13}}>No data yet.</div>}
        </div>
      </div>
      {/* ── Capacity by Project ── */}
      {(() => {
        const projTarget = periodTarget ? Math.round(periodTarget * 0.7) : null;
        const adminTarget = periodTarget ? Math.round(periodTarget * 0.3) : null;
        const byProjFull = projects
          .map(p => ({ ...p, hours: filtered.filter(e => e.project === p.id).reduce((s,e) => s+e.hours, 0) }))
          .filter(p => p.hours > 0)
          .sort((a,b) => b.hours - a.hours);
        const projectWork = byProjFull.filter(p => p.status !== "FY26");
        const fy26Work    = byProjFull.filter(p => p.status === "FY26");
        const maxH = byProjFull.length ? byProjFull[0].hours : 1;
        if (!byProjFull.length) return null;
        return (
          <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
            <div style={{padding:"14px 22px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
              <div>
                <div style={{fontSize:11,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase",color:T.muted}}>Capacity by Project</div>
                <div style={{fontSize:11,color:T.muted,marginTop:2}}>How team hours are distributed this period</div>
              </div>
              {periodTarget && (
                <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                  <div style={{fontSize:11,color:T.muted}}><span style={{fontWeight:700,color:T.success}}>70% target</span> = {fmtH(projTarget)} project work</div>
                  <div style={{fontSize:11,color:T.muted}}><span style={{fontWeight:700,color:T.warn}}>30% target</span> = {fmtH(adminTarget)} admin/other</div>
                  <div style={{fontSize:11,color:T.muted}}>Total capacity: <span style={{fontWeight:700,color:T.navy}}>{fmtH(periodTarget)}</span></div>
                </div>
              )}
            </div>
            <div style={{padding:"16px 22px",display:"grid",gap:10}}>
              {projectWork.length > 0 && (<>
                <div style={{fontSize:9.5,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:T.success,marginBottom:2}}>Project Work</div>
                {projectWork.map(p => {
                  const capPct  = periodTarget ? Math.round((p.hours/periodTarget)*100) : null;
                  const projPct = projTarget   ? Math.round((p.hours/projTarget)*100)   : null;
                  return (
                    <div key={p.id}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}>
                        <div style={{width:9,height:9,borderRadius:2,background:p.color,flexShrink:0}}/>
                        <span style={{fontSize:12.5,fontWeight:600,color:T.text,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span>
                        <span style={{fontSize:12,color:T.muted,flexShrink:0}}>{fmtH(p.hours)}</span>
                        {capPct!==null&&<span style={{fontSize:12,fontWeight:700,color:p.color,flexShrink:0,minWidth:52,textAlign:"right"}}>{capPct}% cap</span>}
                        {projPct!==null&&<span style={{fontSize:11,color:T.muted,flexShrink:0,minWidth:60,textAlign:"right"}}>{projPct}% of 70%</span>}
                      </div>
                      <div style={{height:6,background:T.cream,borderRadius:3,overflow:"hidden",border:`1px solid ${T.border}`}}>
                        <div style={{width:`${Math.min(100,Math.round((p.hours/maxH)*100))}%`,height:"100%",background:p.color,borderRadius:3}}/>
                      </div>
                    </div>
                  );
                })}
              </>)}
              {fy26Work.length > 0 && (<>
                <div style={{fontSize:9.5,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:T.purple,marginTop:6,marginBottom:2}}>FY26 Year-Round</div>
                {fy26Work.map(p => {
                  const capPct = periodTarget ? Math.round((p.hours/periodTarget)*100) : null;
                  return (
                    <div key={p.id}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}>
                        <div style={{width:9,height:9,borderRadius:2,background:T.purple,flexShrink:0}}/>
                        <span style={{fontSize:12.5,fontWeight:600,color:T.text,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span>
                        <span style={{fontSize:12,color:T.muted,flexShrink:0}}>{fmtH(p.hours)}</span>
                        {capPct!==null&&<span style={{fontSize:12,fontWeight:700,color:T.purple,flexShrink:0,minWidth:52,textAlign:"right"}}>{capPct}% cap</span>}
                      </div>
                      <div style={{height:6,background:T.cream,borderRadius:3,overflow:"hidden",border:`1px solid ${T.border}`}}>
                        <div style={{width:`${Math.min(100,Math.round((p.hours/maxH)*100))}%`,height:"100%",background:T.purple,borderRadius:3}}/>
                      </div>
                    </div>
                  );
                })}
              </>)}
              {periodTarget && (
                <div style={{marginTop:8,paddingTop:12,borderTop:`1px solid ${T.border}`,display:"flex",gap:24,flexWrap:"wrap"}}>
                  <div style={{fontSize:11,color:T.muted}}>
                    <span style={{fontWeight:700,color:T.success}}>Project work: </span>
                    {fmtH(projectWork.reduce((s,p)=>s+p.hours,0))} / {fmtH(projTarget)} target · {projTarget?Math.round((projectWork.reduce((s,p)=>s+p.hours,0)/projTarget)*100):0}%
                  </div>
                  <div style={{fontSize:11,color:T.muted}}>
                    <span style={{fontWeight:700,color:T.purple}}>FY26 / admin: </span>
                    {fmtH(fy26Work.reduce((s,p)=>s+p.hours,0))} / {fmtH(adminTarget)} target · {adminTarget?Math.round((fy26Work.reduce((s,p)=>s+p.hours,0)/adminTarget)*100):0}%
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
        <div style={{padding:"16px 22px",borderBottom:`1px solid ${T.border}`,fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted}}>Recent Activity</div>
        {recent.map((e,i) => {
          const person = TEAM.find(t=>t.id===e.person);
          const project = pMap[e.project];
          const bi = e.bigIdea ? globalIdeas.find(b=>b.id===e.bigIdea) : null;
          return (
            <div key={e.id} style={{display:"grid",gridTemplateColumns:"36px 1fr auto",gap:12,padding:"12px 22px",alignItems:"center",borderBottom:i<recent.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.white:T.cream}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:person?.color+"22",border:`2px solid ${person?.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:person?.color}}>{person?.name[0]}</div>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}>
                  <span style={{fontSize:13,fontWeight:600,color:T.text}}>{person?.name.split(" ")[0]}</span>
                  {project&&<Pill label={project.name} color={project.color} small/>}
                  <Pill label={e.workType} color={T.navy} small/>
                  {bi&&<Pill label={"💡 "+bi.title.slice(0,28)+(bi.title.length>28?"…":"")} color={T.warn} small/>}
                </div>
                <div style={{fontSize:11.5,color:T.muted}}>{e.notes||"No notes added"} · {e.date}</div>
              </div>
              <div style={{fontSize:17,fontWeight:800,color:T.navy}}>{fmtH(e.hours)}</div>
            </div>
          );
        })}
        {recent.length===0&&<div style={{padding:"40px",textAlign:"center",color:T.muted,fontSize:13}}>No entries for this period.</div>}
      </div>

      {/* ── Project Spotlight ── */}
      {(() => {
        const sp = spotlightId ? projects.find(p => p.id === spotlightId) : null;
        const spAll    = sp ? entries.filter(e => e.project === sp.id) : [];
        const spPeriod = sp ? filtered.filter(e => e.project === sp.id) : [];
        const spTotalH = spAll.reduce((s,e) => s+e.hours, 0);
        const spPeriodH = spPeriod.reduce((s,e) => s+e.hours, 0);
        const spDates  = spAll.map(e=>e.date).sort();
        const spByPerson = TEAM.map(t => ({ ...t, hours: spAll.filter(e=>e.person===t.id).reduce((s,e)=>s+e.hours,0) })).filter(t=>t.hours>0);
        const spByType = WORK_TYPES.map(wt => ({ name:wt, hours: spAll.filter(e=>e.workType===wt).reduce((s,e)=>s+e.hours,0) })).filter(t=>t.hours>0);
        const spPM = sp?.pm ? TEAM.find(t=>t.id===sp.pm) : null;
        const maxTypeH = spByType.length ? Math.max(...spByType.map(t=>t.hours)) : 1;
        return (
          <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
            {/* Header with picker */}
            <div style={{padding:"14px 22px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:14,flexWrap:"wrap",background:sp?`${sp.color}0a`:T.white}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                {sp && <div style={{width:10,height:10,borderRadius:3,background:sp.color,flexShrink:0}}/>}
                <span style={{fontSize:11,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase",color:T.muted}}>🔍 Project Spotlight</span>
              </div>
              <select value={spotlightId} onChange={e=>setSpotlightId(e.target.value)}
                style={{padding:"7px 14px",borderRadius:8,border:`1.5px solid ${sp?sp.color:T.border}`,background:"white",color:T.navy,fontSize:12.5,fontWeight:600,cursor:"pointer",outline:"none",minWidth:220}}>
                <option value="">— Pick a project —</option>
                {[...projects].sort((a,b)=>a.name.localeCompare(b.name)).map(p=>(
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {!sp && (
              <div style={{padding:"32px",textAlign:"center",color:T.muted,fontSize:13}}>Select a project above to see its stats.</div>
            )}

            {sp && (
              <div style={{padding:"20px 22px",display:"grid",gap:18}}>
                {/* KPI row */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                  {[
                    {label:"Total Hours",      value:fmtH(spTotalH),       sub:`${spAll.length} entries · all time`,  color:sp.color},
                    {label:`Hours (${periodLabel})`, value:fmtH(spPeriodH), sub:`${spPeriod.length} entries this period`, color:T.teal},
                    {label:"Date Range",       value:spDates.length ? new Date(spDates[0]+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"}) : "—",
                                              sub:spDates.length>1?`→ ${new Date(spDates[spDates.length-1]+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`:"Only one date",
                                              color:T.navy},
                    {label:"Project Manager",  value:spPM?.name.split(" ")[0]||"—", sub:sp.sponsor?`Sponsor: ${sp.sponsor}`:"No sponsor set", color:spPM?.color||T.muted},
                  ].map(tile=>(
                    <div key={tile.label} style={{background:T.cream,borderRadius:10,padding:"14px 16px",borderLeft:`3px solid ${tile.color}`}}>
                      <div style={{fontSize:9.5,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:T.muted,marginBottom:6}}>{tile.label}</div>
                      <div style={{fontSize:22,fontWeight:800,color:tile.color,lineHeight:1,marginBottom:4}}>{tile.value}</div>
                      <div style={{fontSize:10.5,color:T.muted}}>{tile.sub}</div>
                    </div>
                  ))}
                </div>

                {/* By person + by work type */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                  {/* By person */}
                  <div>
                    <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:T.muted,marginBottom:10}}>Hours by Person</div>
                    {spByPerson.length===0 ? <div style={{fontSize:12,color:T.muted,fontStyle:"italic"}}>No entries yet</div> : (
                      <div style={{display:"grid",gap:8}}>
                        {spByPerson.map(t=>(
                          <div key={t.id}>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                              <div style={{width:24,height:24,borderRadius:"50%",background:t.color+"33",border:`2px solid ${t.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:t.color,flexShrink:0}}>{t.name[0]}</div>
                              <span style={{fontSize:12.5,fontWeight:600,color:T.text,flex:1}}>{t.name.split(" ")[0]}</span>
                              <span style={{fontSize:12.5,fontWeight:700,color:T.navy}}>{fmtH(t.hours)}</span>
                            </div>
                            <div style={{height:5,background:T.border,borderRadius:3,overflow:"hidden"}}>
                              <div style={{width:`${Math.round((t.hours/spTotalH)*100)}%`,height:"100%",background:t.color,borderRadius:3}}/>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* By work type */}
                  <div>
                    <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:T.muted,marginBottom:10}}>Hours by Work Type</div>
                    {spByType.length===0 ? <div style={{fontSize:12,color:T.muted,fontStyle:"italic"}}>No entries yet</div> : (
                      <div style={{display:"grid",gap:7}}>
                        {spByType.sort((a,b)=>b.hours-a.hours).map(t=>(
                          <div key={t.name}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                              <span style={{fontSize:11.5,color:T.text}}>{t.name}</span>
                              <span style={{fontSize:11.5,fontWeight:700,color:T.navy}}>{fmtH(t.hours)}</span>
                            </div>
                            <div style={{height:4,background:T.border,borderRadius:3,overflow:"hidden"}}>
                              <div style={{width:`${Math.round((t.hours/maxTypeH)*100)}%`,height:"100%",background:sp.color,borderRadius:3}}/>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Period Summary Modal ── */}
      {showSummary && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}
          onClick={()=>setShowSummary(false)}>
          <div style={{background:T.white,borderRadius:16,padding:"28px 32px",width:600,maxWidth:"92vw",boxShadow:"0 20px 60px rgba(0,0,0,0.3)",maxHeight:"85vh",display:"flex",flexDirection:"column",gap:16}}
            onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:17,fontWeight:800,color:T.navy}}>📋 Period Summary</div>
                <div style={{fontSize:12,color:T.muted,marginTop:3}}>Copy into Teams, email, or your status report</div>
              </div>
              <button onClick={()=>setShowSummary(false)} style={{background:"transparent",border:"none",fontSize:20,color:T.muted,cursor:"pointer",lineHeight:1}}>✕</button>
            </div>
            <textarea
              readOnly
              value={generateSummary()}
              style={{padding:"14px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:11.5,fontFamily:"'JetBrains Mono',monospace",background:T.cream,color:T.text,resize:"none",lineHeight:1.7,flex:1,minHeight:360,outline:"none"}}
            />
            <div style={{display:"flex",gap:10}}>
              <button
                onClick={()=>navigator.clipboard.writeText(generateSummary())}
                style={{flex:1,padding:"11px",background:T.navy,border:"none",borderRadius:8,color:T.white,cursor:"pointer",fontSize:13.5,fontWeight:700}}>
                📋 Copy to Clipboard
              </button>
              <button onClick={()=>setShowSummary(false)}
                style={{padding:"11px 20px",border:`1.5px solid ${T.border}`,borderRadius:8,background:"transparent",color:T.muted,cursor:"pointer",fontSize:13}}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Weekly Digest Modal ── */}
      {showDigest && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}
          onClick={()=>setShowDigest(false)}>
          <div style={{background:T.white,borderRadius:16,padding:"28px 32px",width:580,maxWidth:"92vw",boxShadow:"0 20px 60px rgba(0,0,0,0.3)",maxHeight:"85vh",display:"flex",flexDirection:"column",gap:16}}
            onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:17,fontWeight:800,color:T.navy}}>📋 Weekly Digest</div>
                <div style={{fontSize:12,color:T.muted,marginTop:3}}>Ready to paste into Teams, email, or your status update</div>
              </div>
              <button onClick={()=>setShowDigest(false)} style={{background:"transparent",border:"none",fontSize:20,color:T.muted,cursor:"pointer",lineHeight:1}}>✕</button>
            </div>
            <textarea
              readOnly
              value={generateDigest()}
              style={{...{padding:"14px",border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:11.5,fontFamily:"'JetBrains Mono',monospace",background:T.cream,color:T.text,resize:"none",lineHeight:1.7,flex:1,minHeight:320,outline:"none"}}}
            />
            <div style={{display:"flex",gap:10}}>
              <button
                onClick={()=>{navigator.clipboard.writeText(generateDigest());}}
                style={{flex:1,padding:"11px",background:T.navy,border:"none",borderRadius:8,color:T.white,cursor:"pointer",fontSize:13.5,fontWeight:700}}>
                📋 Copy to Clipboard
              </button>
              <button onClick={()=>setShowDigest(false)}
                style={{padding:"11px 20px",border:`1.5px solid ${T.border}`,borderRadius:8,background:"transparent",color:T.muted,cursor:"pointer",fontSize:13}}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LOG TIME ─────────────────────────────────────────────────────────────────
function LogTime({ entries, setEntries, projects, globalIdeas }) {
  const blank = {person:"",date:today(),project:"",workType:"",bigIdea:"",hours:"",notes:""};
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [flash, setFlash] = useState(null);
  const [entryMode, setEntryMode] = useState("single"); // "single" | "week"
  const [weekOf, setWeekOf] = useState(() => getMondayOf(today()));
  const [weekHours, setWeekHours] = useState("");

  function set(k,v) { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:""})); }

  // When project changes, reset bigIdea
  function setProject(v) { setForm(f=>({...f,project:v,bigIdea:""})); setErrors(e=>({...e,project:""})); }

  const selectedProject = projects.find(p => p.id === form.project);
  // Show all global ideas when a project is selected — no need to pre-link via Projects tab
  const bigIdeas = form.project ? globalIdeas : [];

  function validate() {
    const e = {};
    if (!form.person) e.person = "Required";
    if (!form.date) e.date = "Required";
    if (!form.project) e.project = "Required";
    if (!form.workType) e.workType = "Required";
    const h = parseFloat(form.hours);
    if (!form.hours || isNaN(h) || h<=0 || h>24) e.hours = "Enter 0.25–24";
    return e;
  }

  function submit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const entry = {...form, hours:parseFloat(form.hours), id:uid()};
    setEntries(p => [entry, ...p]);
    setFlash(entry);
    setForm({...blank, person:form.person});
    setTimeout(() => setFlash(null), 3500);
  }

  function submitWeek() {
    const e = {};
    if (!form.person) e.person = "Required";
    if (!form.project) e.project = "Required";
    if (!form.workType) e.workType = "Required";
    const h = parseFloat(weekHours);
    if (!weekHours || isNaN(h) || h <= 0 || h > 168) e.hours = "Enter 0.25–168h";
    if (Object.keys(e).length) { setErrors(e); return; }
    const entry = { ...form, date: weekOf, hours: h, id: uid(), weekEntry: true };
    setEntries(p => [entry, ...p]);
    setFlash(entry);
    setWeekHours("");
    setForm({...blank, person: form.person});
    setTimeout(() => setFlash(null), 3500);
  }

  const todayEntries = entries.filter(e=>e.date===today()).sort((a,b)=>b.id.localeCompare(a.id));
  const todayTotal = todayEntries.reduce((s,e)=>s+e.hours,0);
  const pMap = Object.fromEntries(projects.map(p=>[p.id,p]));
  const allBiMap = {};
  globalIdeas.forEach(b => { allBiMap[b.id] = b.title; });

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:20,alignItems:"start"}}>
      <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:14,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.06)"}}>
        <div style={{background:T.navy,padding:"18px 26px",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:32,height:32,borderRadius:8,background:T.orange,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>⏱</div>
          <div style={{flex:1}}>
            <div style={{color:T.white,fontSize:15,fontWeight:700}}>Log Time Entry</div>
            <div style={{color:"rgba(255,255,255,0.45)",fontSize:11,marginTop:1}}>
              {entryMode==="week" ? `Week of ${new Date(weekOf+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})} – ${new Date(getWeekDays(weekOf)[4].date+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}` : today()}
            </div>
          </div>
          <div style={{display:"flex",gap:2,background:"rgba(255,255,255,0.08)",borderRadius:7,padding:3}}>
            {[{v:"single",l:"Single Day"},{v:"week",l:"Full Week"}].map(m=>(
              <button key={m.v} onClick={()=>{setEntryMode(m.v);setErrors({});}}
                style={{padding:"5px 14px",borderRadius:5,border:"none",background:entryMode===m.v?"rgba(255,255,255,0.18)":"transparent",color:entryMode===m.v?T.white:"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:11.5,fontWeight:600}}>
                {m.l}
              </button>
            ))}
          </div>
        </div>
        <div style={{padding:"26px",display:"grid",gap:18}}>
          <div style={{display:"grid",gridTemplateColumns:entryMode==="single"?"1fr 1fr":"1fr",gap:14}}>
            <Field label="Team Member" error={errors.person}>
              <select value={form.person} onChange={e=>set("person",e.target.value)} style={INP}>
                <option value="">Select member…</option>
                {TEAM.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            {entryMode==="single" && (
              <Field label="Date" error={errors.date}>
                <input type="date" value={form.date} onChange={e=>set("date",e.target.value)} style={INP}/>
              </Field>
            )}
          </div>
          <Field label="Project" error={errors.project}>
            <select value={form.project} onChange={e=>setProject(e.target.value)} style={INP}>
              <option value="">Select project…</option>
              {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <div style={{display:"grid",gridTemplateColumns:entryMode==="single"?"1fr 1fr":"1fr",gap:14}}>
            <Field label="Work Type" error={errors.workType}>
              <select value={form.workType} onChange={e=>set("workType",e.target.value)} style={INP}>
                <option value="">Select type…</option>
                {WORK_TYPES.map(w=><option key={w}>{w}</option>)}
              </select>
            </Field>
            {entryMode==="single" && (
              <Field label="Hours" error={errors.hours}>
                <input type="number" value={form.hours} onChange={e=>set("hours",e.target.value)} placeholder="e.g. 1.5" min="0.25" max="24" step="0.25" style={INP}/>
              </Field>
            )}
          </div>
          {/* Quick hour buttons — single mode only */}
          {entryMode==="single" && (
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {[0.25,0.5,1,1.5,2,3,4,6,8].map(h => (
                <button key={h} onClick={()=>set("hours",h.toString())}
                  style={{padding:"5px 11px",borderRadius:5,border:`1.5px solid ${parseFloat(form.hours)===h?T.navy:T.border}`,background:parseFloat(form.hours)===h?T.navy:"transparent",color:parseFloat(form.hours)===h?T.white:T.muted,cursor:"pointer",fontSize:11.5,fontWeight:600}}>
                  {h}h
                </button>
              ))}
            </div>
          )}
          {/* Week mode: week-of picker + total hours */}
          {entryMode==="week" && (
            <div style={{display:"grid",gap:14}}>
              <Field label="Week of">
                <input type="date" value={weekOf} onChange={e=>setWeekOf(getMondayOf(e.target.value))} style={INP}/>
                <div style={{fontSize:10.5,color:T.muted,marginTop:4}}>
                  {`${getWeekDays(weekOf)[0].date} → ${getWeekDays(weekOf)[4].date} · Pick any day — auto-snaps to Monday`}
                </div>
              </Field>
              <Field label="Total Hours for the Week" error={errors.hours}>
                <input type="number" value={weekHours} onChange={e=>{setWeekHours(e.target.value);setErrors(err=>({...err,hours:""}));}} placeholder="e.g. 28" min="0.25" max="168" step="0.25" style={INP}/>
              </Field>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {[4,8,12,16,20,24,28,32,40].map(h => (
                  <button key={h} onClick={()=>{setWeekHours(h.toString());setErrors(err=>({...err,hours:""}));}}
                    style={{padding:"5px 11px",borderRadius:5,border:`1.5px solid ${parseFloat(weekHours)===h?T.navy:T.border}`,background:parseFloat(weekHours)===h?T.navy:"transparent",color:parseFloat(weekHours)===h?T.white:T.muted,cursor:"pointer",fontSize:11.5,fontWeight:600}}>
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Big Idea field — always shown, populated from project's big ideas */}
          <Field label="💡 Big Idea (optional)">
            <select value={form.bigIdea} onChange={e=>set("bigIdea",e.target.value)} style={{...INP, borderColor: form.bigIdea ? T.warn : T.border, background: form.bigIdea ? T.warn+"0a" : T.white}}>
              <option value="">No Big Idea linked</option>
              {bigIdeas.map(b=><option key={b.id} value={b.id}>{b.title}</option>)}
              {!form.project && <option disabled>— Select a project first —</option>}
              {form.project && bigIdeas.length===0 && <option disabled>— No Big Ideas added yet — create them in the 💡 tab —</option>}
            </select>
            {form.bigIdea && (
              <div style={{marginTop:6,padding:"8px 12px",background:T.warn+"12",border:`1px solid ${T.warn}33`,borderRadius:6,fontSize:11.5,color:T.warn,fontWeight:600}}>
                💡 {bigIdeas.find(b=>b.id===form.bigIdea)?.notes}
              </div>
            )}
          </Field>
          <Field label="Notes (optional)">
            <textarea value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="What did you work on? Specific notes feed your status updates." rows={3} style={{...INP,resize:"vertical",lineHeight:1.6}}/>
          </Field>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:4}}>
            <button onClick={()=>{setForm(blank);setErrors({});setWeekHours(""); }} style={{padding:"10px 18px",border:`1.5px solid ${T.border}`,borderRadius:7,background:"transparent",cursor:"pointer",fontSize:13,color:T.muted,fontWeight:500}}>Clear</button>
            <button onClick={entryMode==="week"?submitWeek:submit} style={{padding:"11px 30px",border:"none",borderRadius:7,background:T.orange,cursor:"pointer",fontSize:14,fontWeight:700,color:T.white,boxShadow:`0 4px 14px ${T.orange}44`}}>
              {entryMode==="week"?"Save Week →":"Save Entry →"}
            </button>
          </div>
          {flash && (
            <div style={{background:T.success+"15",border:`1.5px solid ${T.success}44`,borderRadius:8,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>✓</span>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:T.success}}>
                  {flash.count > 1 ? `${flash.count} entries saved!` : "Entry saved!"}
                </div>
                <div style={{fontSize:11.5,color:T.muted}}>
                  {fmtH(flash.totalHours ?? flash.hours)} logged to {projects.find(p=>p.id===flash.project)?.name||flash.project}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div style={{display:"grid",gap:14}}>
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"14px 18px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted}}>Today's Log</span>
            <span style={{fontSize:17,fontWeight:800,color:T.navy}}>{fmtH(todayTotal)}</span>
          </div>
          <div style={{maxHeight:380,overflowY:"auto"}}>
            {todayEntries.length===0&&<div style={{padding:"28px",textAlign:"center",color:T.muted,fontSize:12}}>Nothing logged today yet.</div>}
            {todayEntries.map((e,i) => {
              const p = TEAM.find(t=>t.id===e.person);
              const proj = pMap[e.project];
              const biTitle = e.bigIdea ? allBiMap[e.bigIdea] : null;
              return (
                <div key={e.id} style={{padding:"10px 18px",borderBottom:i<todayEntries.length-1?`1px solid ${T.border}`:"none",background:i%2===0?T.white:T.cream}}>
                  <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3}}>
                        <span style={{width:7,height:7,borderRadius:"50%",background:p?.color,flexShrink:0}}/>
                        <span style={{fontSize:12,fontWeight:700,color:T.text}}>{p?.name.split(" ")[0]}</span>
                      </div>
                      <div style={{fontSize:11,color:T.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{proj?.name} · {e.workType}</div>
                      {biTitle&&<div style={{fontSize:10.5,color:T.warn,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:600}}>💡 {biTitle}</div>}
                      {e.notes&&<div style={{fontSize:10.5,color:T.muted,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.notes}</div>}
                    </div>
                    <span style={{fontSize:14,fontWeight:800,color:T.navy,whiteSpace:"nowrap"}}>{fmtH(e.hours)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"16px 18px"}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted,marginBottom:12}}>This Week</div>
          {TEAM.map(t => {
            const h = entries.filter(e=>e.person===t.id&&e.date>=getWeekStart()).reduce((s,e)=>s+e.hours,0);
            return (
              <div key={t.id} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:12,color:T.text,fontWeight:600}}>{t.name.split(" ")[0]}</span>
                  <span style={{fontSize:12,color:T.muted}}>{fmtH(h)}</span>
                </div>
                <div style={{height:5,background:T.cream,borderRadius:3,overflow:"hidden",border:`1px solid ${T.border}`}}>
                  <div style={{width:`${Math.min((h/40)*100,100)}%`,height:"100%",background:t.color,borderRadius:3}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── ALL ENTRIES ──────────────────────────────────────────────────────────────
function AllEntries({ entries, setEntries, projects, globalIdeas }) {
  const [fPerson,setFPerson]=useState("");
  const [fProject,setFProject]=useState("");
  const [fType,setFType]=useState("");
  const [fFrom,setFFrom]=useState("");
  const [fTo,setFTo]=useState("");
  const [fNotes,setFNotes]=useState("");
  const [sort,setSort]=useState({key:"date",dir:-1});
  const [confirmId,setConfirmId]=useState(null);
  const [editId,setEditId]=useState(null);
  const [editForm,setEditForm]=useState({});
  const pMap=useMemo(()=>Object.fromEntries(projects.map(p=>[p.id,p])),[projects]);
  const allBiMap = useMemo(()=>{const m={}; globalIdeas.forEach(b=>{m[b.id]=b.title;}); return m;},[globalIdeas]);

  const filtered=useMemo(()=>entries.filter(e=>
    (!fPerson||e.person===fPerson)&&(!fProject||e.project===fProject)&&
    (!fType||e.workType===fType)&&(!fFrom||e.date>=fFrom)&&(!fTo||e.date<=fTo)&&
    (!fNotes||(e.notes||"").toLowerCase().includes(fNotes.toLowerCase()))
  ).sort((a,b)=>{const va=a[sort.key]??"",vb=b[sort.key]??"";return va<vb?sort.dir:va>vb?-sort.dir:0;}),[entries,fPerson,fProject,fType,fFrom,fTo,fNotes,sort]);

  const totalH=filtered.reduce((s,e)=>s+e.hours,0);
  function toggleSort(key){setSort(s=>s.key===key?{key,dir:-s.dir}:{key,dir:-1});}
  function startEdit(e){setEditId(e.id);setEditForm({...e});}
  function saveEdit(){setEntries(p=>p.map(e=>e.id===editId?{...editForm,hours:parseFloat(editForm.hours)}:e));setEditId(null);}

  const TH=({k,label})=>(
    <th onClick={()=>toggleSort(k)} style={{padding:"11px 14px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:sort.key===k?T.orange:T.white,cursor:"pointer",userSelect:"none",whiteSpace:"nowrap",background:T.navy}}>
      {label}{sort.key===k?(sort.dir===-1?" ↓":" ↑"):""}
    </th>
  );

  return (
    <div style={{display:"grid",gap:16}}>
      <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"16px 20px"}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:T.muted,marginBottom:12}}>Filters</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr) auto",gap:10,alignItems:"end",marginBottom:10}}>
          <Field label="Member"><select value={fPerson} onChange={e=>setFPerson(e.target.value)} style={{...INP,fontSize:12}}><option value="">All</option>{TEAM.map(t=><option key={t.id} value={t.id}>{t.name.split(" ")[0]}</option>)}</select></Field>
          <Field label="Project"><select value={fProject} onChange={e=>setFProject(e.target.value)} style={{...INP,fontSize:12}}><option value="">All</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
          <Field label="Work Type"><select value={fType} onChange={e=>setFType(e.target.value)} style={{...INP,fontSize:12}}><option value="">All</option>{WORK_TYPES.map(w=><option key={w}>{w}</option>)}</select></Field>
          <Field label="From"><input type="date" value={fFrom} onChange={e=>setFFrom(e.target.value)} style={{...INP,fontSize:12}}/></Field>
          <Field label="To"><input type="date" value={fTo} onChange={e=>setFTo(e.target.value)} style={{...INP,fontSize:12}}/></Field>
          <button onClick={()=>{setFPerson("");setFProject("");setFType("");setFFrom("");setFTo("");setFNotes("");}} style={{padding:"10px 14px",border:`1.5px solid ${T.border}`,borderRadius:7,background:"transparent",color:T.muted,cursor:"pointer",fontSize:12,fontWeight:600}}>Reset</button>
        </div>
        <Field label="Search notes">
          <input type="text" placeholder="Search within notes…" value={fNotes} onChange={e=>setFNotes(e.target.value)}
            style={{...INP,fontSize:12,width:"100%"}}/>
        </Field>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <span style={{fontSize:13,color:T.muted}}><b style={{color:T.text}}>{filtered.length}</b> entries · <b style={{color:T.text}}>{fmtH(totalH)}</b> total</span>
        <button onClick={()=>exportCSV(filtered,projects)} style={{marginLeft:"auto",padding:"9px 20px",border:`1.5px solid ${T.navy}`,borderRadius:7,background:T.navy,color:T.white,cursor:"pointer",fontSize:12.5,fontWeight:700}}>↓ Export CSV</button>
      </div>
      {filtered.length>0 ? (
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr>
                <TH k="date" label="Date"/><TH k="person" label="Member"/><TH k="project" label="Project"/>
                <TH k="workType" label="Type"/><TH k="bigIdea" label="Big Idea"/>
                <TH k="hours" label="Hours"/><TH k="notes" label="Notes"/>
                <th style={{background:T.navy}}/>
              </tr></thead>
              <tbody>
                {filtered.map((e,i) => {
                  const person=TEAM.find(t=>t.id===e.person);
                  const proj=pMap[e.project];
                  const biTitle=e.bigIdea?allBiMap[e.bigIdea]:null;
                  const isEd=editId===e.id;
                  const editProjBigIdeas=isEd?globalIdeas:[];
                  return (
                    <tr key={e.id} style={{borderBottom:`1px solid ${T.border}`,background:i%2===0?T.white:T.cream}}>
                      <td style={{padding:"10px 14px",color:T.muted,fontSize:11.5,whiteSpace:"nowrap"}}>
                        {isEd?<input type="date" value={editForm.date} onChange={ev=>setEditForm(f=>({...f,date:ev.target.value}))} style={{...INP,width:130,padding:"5px 8px",fontSize:12}}/>:e.date}
                      </td>
                      <td style={{padding:"10px 14px"}}>
                        {isEd?<select value={editForm.person} onChange={ev=>setEditForm(f=>({...f,person:ev.target.value}))} style={{...INP,width:120,padding:"5px 8px",fontSize:12}}>{TEAM.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>:(
                          <div style={{display:"flex",alignItems:"center",gap:7}}><span style={{width:8,height:8,borderRadius:"50%",background:person?.color}}/><span style={{fontWeight:600,color:T.text}}>{person?.name.split(" ")[0]||e.person}</span></div>
                        )}
                      </td>
                      <td style={{padding:"10px 14px"}}>
                        {isEd?<select value={editForm.project} onChange={ev=>setEditForm(f=>({...f,project:ev.target.value,bigIdea:""}))} style={{...INP,width:140,padding:"5px 8px",fontSize:12}}>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>:proj?<Pill label={proj.name} color={proj.color} small/>:"—"}
                      </td>
                      <td style={{padding:"10px 14px",color:T.text,fontSize:12}}>
                        {isEd?<select value={editForm.workType} onChange={ev=>setEditForm(f=>({...f,workType:ev.target.value}))} style={{...INP,width:150,padding:"5px 8px",fontSize:12}}>{WORK_TYPES.map(w=><option key={w}>{w}</option>)}</select>:e.workType}
                      </td>
                      <td style={{padding:"10px 14px",maxWidth:160}}>
                        {isEd?(
                          <select value={editForm.bigIdea||""} onChange={ev=>setEditForm(f=>({...f,bigIdea:ev.target.value}))} style={{...INP,width:150,padding:"5px 8px",fontSize:11}}>
                            <option value="">None</option>
                            {editProjBigIdeas.map(b=><option key={b.id} value={b.id}>{b.title.slice(0,30)}</option>)}
                          </select>
                        ):biTitle?<span style={{display:"block",fontSize:11,color:T.warn,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>💡 {biTitle}</span>:<span style={{color:T.border,fontSize:12}}>—</span>}
                      </td>
                      <td style={{padding:"10px 14px",fontWeight:800,color:T.navy,whiteSpace:"nowrap"}}>
                        {isEd?<input type="number" value={editForm.hours} onChange={ev=>setEditForm(f=>({...f,hours:ev.target.value}))} step="0.25" min="0.25" max="24" style={{...INP,width:70,padding:"5px 8px",fontSize:12}}/>:fmtH(e.hours)}
                      </td>
                      <td style={{padding:"10px 14px",color:T.muted,fontSize:12,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {isEd?<input value={editForm.notes||""} onChange={ev=>setEditForm(f=>({...f,notes:ev.target.value}))} style={{...INP,padding:"5px 8px",fontSize:12}}/>:(e.notes||"—")}
                      </td>
                      <td style={{padding:"10px 14px",whiteSpace:"nowrap"}}>
                        {isEd?(
                          <span style={{display:"flex",gap:5}}>
                            <button onClick={saveEdit} style={{padding:"4px 10px",background:T.success,border:"none",borderRadius:5,color:T.white,cursor:"pointer",fontSize:11,fontWeight:700}}>Save</button>
                            <button onClick={()=>setEditId(null)} style={{padding:"4px 8px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:5,color:T.muted,cursor:"pointer",fontSize:11}}>Cancel</button>
                          </span>
                        ):confirmId===e.id?(
                          <span style={{display:"flex",gap:5}}>
                            <button onClick={()=>{setEntries(p=>p.filter(x=>x.id!==e.id));setConfirmId(null);}} style={{padding:"4px 10px",background:"#EF4444",border:"none",borderRadius:5,color:T.white,cursor:"pointer",fontSize:11,fontWeight:700}}>Delete</button>
                            <button onClick={()=>setConfirmId(null)} style={{padding:"4px 8px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:5,color:T.muted,cursor:"pointer",fontSize:11}}>✕</button>
                          </span>
                        ):(
                          <span style={{display:"flex",gap:5}}>
                            <button onClick={()=>startEdit(e)} style={{padding:"4px 10px",border:`1px solid ${T.border}`,borderRadius:5,background:"transparent",color:T.muted,cursor:"pointer",fontSize:11}}>Edit</button>
                            <button onClick={()=>setConfirmId(e.id)} style={{padding:"4px 8px",border:`1px solid ${T.border}`,borderRadius:5,background:"transparent",color:T.muted,cursor:"pointer",fontSize:11}}>✕</button>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ):<div style={{padding:"60px",textAlign:"center",color:T.muted,fontSize:13,background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12}}>No entries match your filters.</div>}
    </div>
  );
}

// ─── TEAM VIEW ────────────────────────────────────────────────────────────────
function TeamView({ entries, projects, globalIdeas }) {
  const [sel,setSel]=useState(TEAM[0].id);
  const person=TEAM.find(t=>t.id===sel);
  const pMap=Object.fromEntries(projects.map(p=>[p.id,p]));
  const allBiMap={}; globalIdeas.forEach(b=>{allBiMap[b.id]=b.title;});
  const mine=entries.filter(e=>e.person===sel);
  const weekH=mine.filter(e=>e.date>=getWeekStart()).reduce((s,e)=>s+e.hours,0);
  const monthH=mine.filter(e=>e.date>=getMonthStart()).reduce((s,e)=>s+e.hours,0);
  const totalH=mine.reduce((s,e)=>s+e.hours,0);
  const byProject=projects.map(p=>({name:p.name.length>16?p.name.slice(0,14)+"…":p.name,hours:mine.filter(e=>e.project===p.id).reduce((s,e)=>s+e.hours,0),color:p.color})).filter(p=>p.hours>0).sort((a,b)=>b.hours-a.hours);
  const TC=[T.orange,T.teal,T.purple,T.warn,T.tealLight,"#EC4899"];
  const byType=WORK_TYPES.map((wt,i)=>({name:wt,value:mine.filter(e=>e.workType===wt).reduce((s,e)=>s+e.hours,0),color:TC[i%6]})).filter(t=>t.value>0).sort((a,b)=>b.value-a.value);
  const daily=Array.from({length:14},(_,i)=>{const d=daysAgo(13-i);return{date:new Date(d+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"}),hours:mine.filter(e=>e.date===d).reduce((s,e)=>s+e.hours,0)};});
  const recent=[...mine].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,12);

  return (
    <div style={{display:"grid",gap:18}}>
      <div style={{display:"flex",gap:10}}>
        {TEAM.map(t=>(
          <button key={t.id} onClick={()=>setSel(t.id)}
            style={{display:"flex",alignItems:"center",gap:10,padding:"12px 20px",borderRadius:10,border:`2px solid ${sel===t.id?t.color:T.border}`,background:sel===t.id?t.color+"12":T.white,cursor:"pointer"}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:t.color+"30",border:`2px solid ${t.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:t.color}}>{t.name[0]}</div>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:13,fontWeight:700,color:T.text}}>{t.name}</div>
              <div style={{fontSize:11,color:T.muted}}>{t.role}</div>
            </div>
          </button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        <StatTile label="This Week" value={fmtH(weekH)} sub={`${mine.filter(e=>e.date>=getWeekStart()).length} entries`} accent={person?.color}/>
        <StatTile label="This Month" value={fmtH(monthH)} sub={`${mine.filter(e=>e.date>=getMonthStart()).length} entries`} accent={T.teal}/>
        <StatTile label="All Time" value={fmtH(totalH)} sub={`${mine.length} total entries`} accent={T.navy}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:16}}>
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"20px 20px 14px"}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted,marginBottom:14}}>Last 14 Days</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={daily} margin={{top:4,right:8,left:-24,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
              <XAxis dataKey="date" tick={{fontSize:10,fill:T.muted}} interval={2}/>
              <YAxis tick={{fontSize:10,fill:T.muted}}/>
              <Tooltip content={<TTip/>}/>
              <Bar dataKey="hours" fill={person?.color} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"20px 22px"}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted,marginBottom:14}}>Time by Work Type</div>
          <div style={{display:"grid",gap:10}}>
            {byType.slice(0,6).map((t,i)=>{
              const pct=totalH?Math.round((t.value/totalH)*100):0;
              return (
                <div key={t.name}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:11.5,color:T.text}}>{t.name}</span>
                    <span style={{fontSize:11,color:T.muted}}>{fmtH(t.value)} · {pct}%</span>
                  </div>
                  <div style={{height:6,background:T.cream,borderRadius:3,overflow:"hidden",border:`1px solid ${T.border}`}}>
                    <div style={{width:`${pct}%`,height:"100%",background:t.color,borderRadius:3}}/>
                  </div>
                </div>
              );
            })}
            {byType.length===0&&<div style={{color:T.muted,fontSize:12,textAlign:"center",paddingTop:20}}>No entries yet.</div>}
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1.6fr",gap:16}}>
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"20px 22px"}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted,marginBottom:14}}>By Project</div>
          {byProject.length>0?byProject.map(p=>(
            <div key={p.name} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:12.5,fontWeight:600,color:T.text}}>{p.name}</span>
                <span style={{fontSize:12,color:T.muted}}>{fmtH(p.hours)}</span>
              </div>
              <div style={{height:7,background:T.cream,borderRadius:3,overflow:"hidden",border:`1px solid ${T.border}`}}>
                <div style={{width:`${totalH?(p.hours/totalH)*100:0}%`,height:"100%",background:p.color,borderRadius:3}}/>
              </div>
            </div>
          )):<div style={{color:T.muted,fontSize:12,textAlign:"center",paddingTop:20}}>No project data.</div>}
        </div>
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`,fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted}}>Recent Entries</div>
          <div style={{maxHeight:280,overflowY:"auto"}}>
            {recent.map((e,i)=>{
              const proj=pMap[e.project];
              const biTitle=e.bigIdea?allBiMap[e.bigIdea]:null;
              return (
                <div key={e.id} style={{display:"grid",gridTemplateColumns:"1fr auto",padding:"10px 20px",borderBottom:i<recent.length-1?`1px solid ${T.border}`:"none",alignItems:"center",gap:10}}>
                  <div>
                    <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:2,flexWrap:"wrap"}}>
                      {proj&&<Pill label={proj.name} color={proj.color} small/>}
                      <span style={{fontSize:11,color:T.muted}}>{e.workType}</span>
                    </div>
                    {biTitle&&<div style={{fontSize:10.5,color:T.warn,fontWeight:600,marginBottom:2}}>💡 {biTitle.slice(0,40)}</div>}
                    <div style={{fontSize:11,color:T.muted}}>{e.date}{e.notes?` · ${e.notes}`:""}</div>
                  </div>
                  <span style={{fontSize:14,fontWeight:800,color:T.navy}}>{fmtH(e.hours)}</span>
                </div>
              );
            })}
            {recent.length===0&&<div style={{padding:"30px",textAlign:"center",color:T.muted,fontSize:12}}>No entries yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BIG IDEAS MANAGER (sub-component for projects) ───────────────────────────
// Shows globalIdeas as toggleable pills — checked ones are linked to this project
function BigIdeasManager({ project, onUpdate, globalIdeas }) {
  const linked = project.bigIdeas || [];

  function toggle(ideaId) {
    const updated = linked.includes(ideaId)
      ? linked.filter(id => id !== ideaId)
      : [...linked, ideaId];
    onUpdate({ ...project, bigIdeas: updated });
  }

  return (
    <div style={{marginTop:16,borderTop:`1px solid ${T.border}`,paddingTop:14}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
        <span style={{fontSize:14}}>💡</span>
        <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted}}>Big Ideas</span>
        <span style={{fontSize:11,color:T.muted,background:T.cream,border:`1px solid ${T.border}`,borderRadius:99,padding:"1px 7px",fontWeight:700}}>{linked.length}</span>
      </div>
      {globalIdeas.length === 0 ? (
        <div style={{color:T.muted,fontSize:11.5,fontStyle:"italic",paddingBottom:4}}>No Big Ideas in pool yet — add some in the 💡 Big Ideas tab first.</div>
      ) : (
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {globalIdeas.map(b => {
            const isLinked = linked.includes(b.id);
            return (
              <button key={b.id} onClick={()=>toggle(b.id)}
                style={{padding:"4px 12px",borderRadius:99,border:`1.5px solid ${isLinked?T.warn:T.border}`,background:isLinked?T.warn+"18":"transparent",color:isLinked?T.warn:T.muted,cursor:"pointer",fontSize:11.5,fontWeight:isLinked?700:500,transition:"all 0.15s"}}>
                {isLinked ? "✓ " : ""}{b.title}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── PROJECT FORM (defined outside panel to prevent remount / focus loss) ────
function ProjectForm({ data, onChange, onSubmit, onCancel, submitLabel, accentColor }) {
  return (
    <div style={{display:"grid",gap:13}}>
      <Field label="Project Name">
        <input value={data.name} onChange={e=>onChange("name",e.target.value)} placeholder="e.g. Q2 Workforce Initiative" style={INP} onKeyDown={e=>e.key==="Enter"&&onSubmit()}/>
      </Field>
      <Field label="Description">
        <textarea value={data.description} onChange={e=>onChange("description",e.target.value)} placeholder="What is this project trying to achieve?" rows={2} style={{...INP,resize:"vertical",fontSize:12.5,lineHeight:1.5}}/>
      </Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Project Manager">
          <select value={data.pm} onChange={e=>onChange("pm",e.target.value)} style={INP}>
            <option value="">Unassigned</option>
            {TEAM.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </Field>
        <Field label="Sponsor">
          <input value={data.sponsor} onChange={e=>onChange("sponsor",e.target.value)} placeholder="e.g. VP Technology" style={INP}/>
        </Field>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Start Date">
          <input type="date" value={data.startDate} onChange={e=>onChange("startDate",e.target.value)} style={INP}/>
        </Field>
        <Field label="End Date">
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input type="date" value={data.endDate==="TBD"?"":data.endDate} onChange={e=>onChange("endDate",e.target.value)} disabled={data.endDate==="TBD"} style={{...INP,flex:1,opacity:data.endDate==="TBD"?0.4:1,cursor:data.endDate==="TBD"?"not-allowed":"text"}}/>
            <label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",whiteSpace:"nowrap",fontSize:12.5,color:data.endDate==="TBD"?T.orange:T.muted,fontWeight:data.endDate==="TBD"?700:500,userSelect:"none",padding:"0 4px"}}>
              <input type="checkbox" checked={data.endDate==="TBD"} onChange={e=>onChange("endDate",e.target.checked?"TBD":"")} style={{cursor:"pointer",accentColor:T.orange,width:14,height:14}}/>
              TBD
            </label>
          </div>
        </Field>
      </div>
      <Field label="Budget — Est. Hours (optional)">
        <input type="number" value={data.estimatedHours||""} onChange={e=>onChange("estimatedHours",e.target.value)} placeholder="e.g. 200 — enables burn rate tracking" min="1" style={INP}/>
      </Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        <Field label="Status">
          <select value={data.status} onChange={e=>onChange("status",e.target.value)} style={INP}>
            {STATUSES.map(s=><option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Priority">
          <select value={data.priority} onChange={e=>onChange("priority",e.target.value)} style={INP}>
            {PRIORITIES.map(p=><option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Color">
          <div style={{display:"flex",gap:6,flexWrap:"wrap",paddingTop:4}}>
            {PROJ_COLORS.map(c=><button key={c} onClick={()=>onChange("color",c)} style={{width:26,height:26,borderRadius:5,background:c,border:`3px solid ${data.color===c?"#0B1C2E":"transparent"}`,cursor:"pointer"}}/>)}
          </div>
        </Field>
      </div>
      <Field label="Level of Effort — T-Shirt Size">
        <div style={{display:"flex",gap:6,flexWrap:"wrap",paddingTop:4}}>
          {LOE_SIZES.map(s=>(
            <button key={s} onClick={()=>onChange("loeSize",data.loeSize===s?"":s)}
              style={{padding:"5px 12px",borderRadius:6,border:`1.5px solid ${data.loeSize===s?T.teal:T.border}`,background:data.loeSize===s?T.teal+"18":"transparent",color:data.loeSize===s?T.teal:T.muted,cursor:"pointer",fontSize:12,fontWeight:700,lineHeight:1}}>
              {s}
            </button>
          ))}
          {data.loeSize && <span style={{fontSize:11,color:T.muted,alignSelf:"center",fontStyle:"italic"}}>{LOE_LABELS[data.loeSize]}</span>}
        </div>
      </Field>
      <div style={{display:"flex",gap:8,paddingTop:4}}>
        <button onClick={onSubmit} style={{flex:1,padding:"10px",background:accentColor||T.orange,border:"none",borderRadius:7,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700}}>{submitLabel}</button>
        <button onClick={onCancel} style={{padding:"10px 16px",border:`1.5px solid #E4DDD3`,borderRadius:7,background:"transparent",color:"#8C8278",cursor:"pointer",fontSize:13}}>Cancel</button>
      </div>
    </div>
  );
}

// ─── PROJECTS PANEL ───────────────────────────────────────────────────────────
function ProjectsPanel({ projects, setProjects, entries, globalIdeas }) {
  const BLANK_NEW = { name:"", color:T.teal, status:"Active", pm:"", startDate:"", endDate:"", description:"", priority:"Medium", sponsor:"", estimatedHours:"", loeSize:"" };
  const [adding, setAdding] = useState(false);
  const [newData, setNewData] = useState(BLANK_NEW);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  function setN(k,v){ setNewData(d=>({...d,[k]:v})); }
  function setE(k,v){ setEditData(d=>({...d,[k]:v})); }

  function addProject() {
    if (!newData.name.trim()) return;
    setProjects(p => [...p, { ...newData, id:uid(), name:newData.name.trim(), bigIdeas:[] }]);
    setNewData(BLANK_NEW); setAdding(false);
  }
  function startEdit(p) {
    setEditingId(p.id);
    setEditData({ name:p.name, color:p.color, status:p.status, pm:p.pm||"", startDate:p.startDate||"", endDate:p.endDate||"", description:p.description||"", priority:p.priority||"Medium", sponsor:p.sponsor||"", estimatedHours:p.estimatedHours||"", loeSize:p.loeSize||"" });
  }
  function saveEdit(id) {
    setProjects(prev => prev.map(p => p.id===id ? {...p,...editData} : p));
    setEditingId(null);
  }
  function updateProject(updated) {
    setProjects(prev => prev.map(p => p.id===updated.id ? updated : p));
  }

  function fmtDate(d){ if(!d)return null; if(d==="TBD")return "TBD"; const dt=new Date(d+"T12:00:00"); return dt.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); }
  function daysLeft(end){ if(!end||end==="TBD")return null; const diff=Math.round((new Date(end+"T12:00:00")-new Date())/(1000*60*60*24)); return diff; }
  function projectProgress(p){ if(!p.startDate||!p.endDate||p.endDate==="TBD")return null; const total=new Date(p.endDate+"T12:00:00")-new Date(p.startDate+"T12:00:00"); const elapsed=new Date()-new Date(p.startDate+"T12:00:00"); return Math.max(0,Math.min(100,Math.round((elapsed/total)*100))); }

  // The project being edited (for showing its name in the edit panel header)
  const editingProject = projects.find(p=>p.id===editingId);

  return (
    <div style={{display:"grid",gap:16}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:800,color:T.navy}}>Projects</h2>
          <p style={{fontSize:12.5,color:T.muted,marginTop:3}}>{projects.length} projects · {entries.length} total entries</p>
        </div>
        {!editingId && (
          <button onClick={()=>setAdding(a=>!a)} style={{padding:"10px 20px",background:adding?T.cream:T.orange,border:`1.5px solid ${adding?T.border:T.orange}`,borderRadius:8,color:adding?T.muted:T.white,cursor:"pointer",fontSize:13,fontWeight:700,boxShadow:adding?"none":`0 4px 12px ${T.orange}44`}}>
            {adding ? "Cancel" : "+ Add Project"}
          </button>
        )}
      </div>

      {/* Add form — full width above the grid */}
      {adding && !editingId && (
        <div style={{background:T.white,border:`2px solid ${T.orange}`,borderRadius:12,padding:"22px 28px"}}>
          <div style={{fontSize:11,fontWeight:700,color:T.orange,marginBottom:16,letterSpacing:"0.06em",textTransform:"uppercase"}}>New Project</div>
          <ProjectForm data={newData} onChange={setN} onSubmit={addProject} onCancel={()=>{setAdding(false);setNewData(BLANK_NEW);}} submitLabel="Create Project" accentColor={T.orange}/>
        </div>
      )}

      {/* Edit form — full width, replaces the card grid while editing */}
      {editingId && (
        <div style={{background:T.white,border:`2px solid ${T.success}`,borderRadius:12,padding:"22px 28px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:editingProject?.color||T.orange}}/>
            <span style={{fontSize:11,fontWeight:700,color:T.success,letterSpacing:"0.06em",textTransform:"uppercase"}}>Editing: {editingProject?.name}</span>
          </div>
          <ProjectForm data={editData} onChange={setE} onSubmit={()=>saveEdit(editingId)} onCancel={()=>setEditingId(null)} submitLabel="Save Changes" accentColor={T.success}/>
        </div>
      )}

      {/* Project cards — grouped by status */}
      <div style={{display:"grid",gap:28}}>
        {[
          {key:"Active",   label:"Active",             color:T.success},
          {key:"FY26",     label:"FY26 — Year-Round",  color:T.purple},
          {key:"On Hold",  label:"On Hold",             color:T.warn},
          {key:"Planned",  label:"Planned",             color:T.navy},
          {key:"Complete", label:"Completed",           color:T.teal},
        ].map(({key,label,color})=>{
          const group=projects.filter(p=>p.status===key);
          if(!group.length) return null;
          return (
            <div key={key}>
              {/* Section header */}
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:color,flexShrink:0}}/>
                <span style={{fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.1em",color}}>{label}</span>
                <span style={{fontSize:11,color:T.muted,fontWeight:500}}>{group.length} project{group.length!==1?"s":""}</span>
                <div style={{flex:1,height:1,background:T.border}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        {group.map(p => {
          const pe=entries.filter(e=>e.project===p.id);
          const pH=pe.reduce((s,e)=>s+e.hours,0);
          const wH=pe.filter(e=>e.date>=getWeekStart()).reduce((s,e)=>s+e.hours,0);
          const activeMembers=[...new Set(pe.map(e=>e.person))];
          const isBeingEdited=editingId===p.id;
          const statusColor={Active:T.success,FY26:T.purple,"On Hold":T.warn,Complete:T.teal,Planned:T.navy}[p.status]||T.muted;
          const priorityColor={High:"#EF4444",Medium:T.warn,Low:T.success}[p.priority||"Medium"];
          const pm=TEAM.find(t=>t.id===p.pm);
          const dl=daysLeft(p.endDate);
          const prog=projectProgress(p);
          const isComplete = p.status==="Complete";
          const dlColor = isComplete?T.teal : dl===null?T.muted : dl<0?"#EF4444" : dl<=14?T.warn : T.success;

          return (
            <div key={p.id} style={{background:T.white,border:`1.5px solid ${isBeingEdited?T.success:T.border}`,borderRadius:12,overflow:"hidden",display:"flex",flexDirection:"column",transition:"border-color 0.2s"}}>
              <div style={{height:5,background:p.color,flexShrink:0}}/>
              <div style={{padding:"18px 20px",flex:1,display:"flex",flexDirection:"column"}}>
                {/* Header row */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div style={{flex:1,minWidth:0,paddingRight:8}}>
                    <div style={{fontSize:14.5,fontWeight:800,color:T.navy,marginBottom:6,lineHeight:1.3}}>{p.name}</div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      <Pill label={p.status} color={statusColor} small/>
                      {p.priority && <Pill label={p.priority} color={priorityColor} small/>}
                      {p.loeSize && <Pill label={`${p.loeSize} · ${LOE_LABELS[p.loeSize]}`} color={T.teal} small/>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:4,flexShrink:0}}>
                    <button onClick={()=>isBeingEdited?setEditingId(null):startEdit(p)}
                      style={{padding:"5px 10px",border:`1px solid ${isBeingEdited?T.success:T.border}`,borderRadius:5,background:isBeingEdited?T.success+"18":"transparent",color:isBeingEdited?T.success:T.muted,cursor:"pointer",fontSize:11,fontWeight:600}}>
                      {isBeingEdited?"Editing…":"Edit"}
                    </button>
                    <button onClick={()=>setProjects(prev=>prev.filter(x=>x.id!==p.id))} style={{color:T.border,background:"transparent",border:"none",cursor:"pointer",fontSize:16,padding:"5px"}}>✕</button>
                  </div>
                </div>

                {/* Description */}
                {p.description && (
                  <div style={{fontSize:11.5,color:T.muted,lineHeight:1.6,marginBottom:12,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
                    {p.description}
                  </div>
                )}

                {/* PM + Sponsor */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                  <div style={{background:T.cream,borderRadius:7,padding:"8px 10px"}}>
                    <div style={{fontSize:9.5,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>PM</div>
                    {pm ? (
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:20,height:20,borderRadius:"50%",background:pm.color+"33",border:`2px solid ${pm.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:pm.color,flexShrink:0}}>{pm.name[0]}</div>
                        <span style={{fontSize:12,fontWeight:600,color:T.text}}>{pm.name}</span>
                      </div>
                    ) : <span style={{fontSize:11.5,color:T.muted,fontStyle:"italic"}}>Unassigned</span>}
                  </div>
                  <div style={{background:T.cream,borderRadius:7,padding:"8px 10px"}}>
                    <div style={{fontSize:9.5,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>Sponsor</div>
                    <span style={{fontSize:11.5,color:p.sponsor?T.text:T.muted,fontWeight:p.sponsor?600:400,fontStyle:p.sponsor?"normal":"italic"}}>{p.sponsor||"Not set"}</span>
                  </div>
                </div>

                {/* Dates + progress */}
                {(p.startDate||p.endDate) && (
                  <div style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                      <div style={{fontSize:11,color:T.muted}}>
                        {p.startDate && <span>{fmtDate(p.startDate)}</span>}
                        {p.startDate && p.endDate && <span style={{margin:"0 5px",color:T.border}}>→</span>}
                        {p.endDate && <span>{fmtDate(p.endDate)}</span>}
                      </div>
                      {dl!==null && (
                        <span style={{fontSize:10.5,fontWeight:700,color:dlColor}}>
                          {isComplete?"✓ Complete":dl<0?`${Math.abs(dl)}d overdue`:dl===0?"Due today":`${dl}d left`}
                        </span>
                      )}
                    </div>
                    {(prog!==null||isComplete) && (
                      <div style={{height:5,background:T.cream,borderRadius:3,overflow:"hidden",border:`1px solid ${T.border}`}}>
                        <div style={{width:`${isComplete?100:prog}%`,height:"100%",background:isComplete?T.teal:p.color,borderRadius:3}}/>
                      </div>
                    )}
                  </div>
                )}

                {/* Hours stats */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:p.estimatedHours?8:12}}>
                  <div style={{background:T.cream,borderRadius:7,padding:"9px 11px"}}>
                    <div style={{fontSize:9.5,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em"}}>Total Hours</div>
                    <div style={{fontSize:17,fontWeight:800,color:T.navy,marginTop:3}}>{fmtH(pH)}</div>
                    <div style={{fontSize:10,color:T.muted,marginTop:1}}>{pe.length} entries</div>
                  </div>
                  <div style={{background:T.cream,borderRadius:7,padding:"9px 11px"}}>
                    <div style={{fontSize:9.5,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em"}}>This Week</div>
                    <div style={{fontSize:17,fontWeight:800,color:p.color,marginTop:3}}>{fmtH(wH)}</div>
                    <div style={{fontSize:10,color:T.muted,marginTop:1}}>{pe.filter(e=>e.date>=getWeekStart()).length} entries</div>
                  </div>
                </div>
                {/* Budget burn rate — only shown when estimatedHours is set */}
                {p.estimatedHours && (() => {
                  const est = parseFloat(p.estimatedHours);
                  const burnPct = est ? Math.min(Math.round((pH/est)*100),999) : 0;
                  const burnColor = burnPct > 100 ? "#EF4444" : burnPct > 80 ? T.warn : T.success;
                  return (
                    <div style={{marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                        <span style={{fontSize:9.5,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em"}}>Budget Burn</span>
                        <span style={{fontSize:11,fontWeight:700,color:burnColor}}>{fmtH(pH)} / {fmtH(est)} · {burnPct}%</span>
                      </div>
                      <div style={{height:6,background:T.cream,borderRadius:3,overflow:"hidden",border:`1px solid ${T.border}`}}>
                        <div style={{width:`${Math.min(burnPct,100)}%`,height:"100%",background:burnColor,borderRadius:3,transition:"width 0.4s ease"}}/>
                      </div>
                      {burnPct > 100 && <div style={{fontSize:10,color:"#EF4444",fontWeight:700,marginTop:3}}>⚠️ {fmtH(pH - est)} over budget</div>}
                      {burnPct <= 100 && <div style={{fontSize:10,color:T.muted,marginTop:3}}>{fmtH(est - pH)} remaining</div>}
                    </div>
                  );
                })()}

                {/* Active contributors */}
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                  <span style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>Team:</span>
                  <div style={{display:"flex",gap:4}}>
                    {activeMembers.map(m=>{const t=TEAM.find(x=>x.id===m);return t?<div key={m} title={t.name} style={{width:22,height:22,borderRadius:"50%",background:t.color+"33",border:`2px solid ${t.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:t.color}}>{t.name[0]}</div>:null;})}
                    {activeMembers.length===0&&<span style={{fontSize:11,color:T.muted,fontStyle:"italic"}}>No entries yet</span>}
                  </div>
                </div>

                {/* Big Ideas */}
                <BigIdeasManager project={p} onUpdate={updateProject} globalIdeas={globalIdeas}/>
              </div>
            </div>
          );
        })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── BIG IDEAS TAB ────────────────────────────────────────────────────────────
function BigIdeasTab({ globalIdeas, setGlobalIdeas, projects, entries }) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  function addIdea() {
    if (!newTitle.trim()) return;
    setGlobalIdeas(prev => [...prev, { id: uid(), title: newTitle.trim(), notes: newNotes.trim() }]);
    setNewTitle(""); setNewNotes(""); setAdding(false);
  }
  function startEdit(idea) { setEditingId(idea.id); setEditTitle(idea.title); setEditNotes(idea.notes||""); setSelectedId(null); }
  function saveEdit() {
    setGlobalIdeas(prev => prev.map(b => b.id===editingId ? {...b, title:editTitle, notes:editNotes} : b));
    setEditingId(null);
  }
  function removeIdea(id) {
    setGlobalIdeas(prev => prev.filter(b => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  // For each idea, find which projects have it linked
  function linkedProjects(ideaId) {
    return projects.filter(p => (p.bigIdeas||[]).includes(ideaId));
  }
  function ideaHours(ideaId) {
    return entries.filter(e => e.bigIdea === ideaId).reduce((s,e) => s+e.hours, 0);
  }
  function ideaEntries(ideaId) {
    return entries.filter(e => e.bigIdea === ideaId);
  }

  const selectedIdea = globalIdeas.find(b => b.id === selectedId);
  const selectedLinked = selectedIdea ? linkedProjects(selectedIdea.id) : [];
  const selectedEntries = selectedIdea ? ideaEntries(selectedIdea.id) : [];
  const selectedHours = selectedEntries.reduce((s,e)=>s+e.hours,0);

  // Card color palette — cycle through brand colors for visual variety
  const cardAccents = [T.orange, T.teal, T.purple, T.warn, T.success, "#EC4899", "#6366F1"];

  return (
    <div style={{display:"grid",gap:20}}>

      {/* Header row */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:12,color:T.muted}}>{globalIdeas.length} idea{globalIdeas.length!==1?"s":""} in the pool · assign them to projects in the <strong>Projects tab</strong></div>
        <button onClick={()=>{setAdding(a=>!a);setSelectedId(null);setEditingId(null);}}
          style={{padding:"10px 22px",background:adding?T.cream:T.warn,border:`1.5px solid ${adding?T.border:T.warn}`,borderRadius:8,color:adding?T.muted:T.white,cursor:"pointer",fontSize:13,fontWeight:700,boxShadow:adding?"none":`0 4px 12px ${T.warn}44`}}>
          {adding ? "Cancel" : "+ Add Big Idea"}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div style={{background:T.white,border:`2px solid ${T.warn}`,borderRadius:12,padding:"20px 24px",display:"grid",gap:12}}>
          <div style={{fontSize:11,fontWeight:700,color:T.warn,letterSpacing:"0.06em",textTransform:"uppercase"}}>New Big Idea</div>
          <Field label="Title">
            <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="What's the big idea?" style={INP} autoFocus onKeyDown={e=>e.key==="Enter"&&addIdea()}/>
          </Field>
          <Field label="Notes (optional)">
            <textarea value={newNotes} onChange={e=>setNewNotes(e.target.value)} placeholder="Context, why it matters, next steps…" rows={2} style={{...INP,resize:"vertical",lineHeight:1.6}}/>
          </Field>
          <div style={{display:"flex",gap:8}}>
            <button onClick={addIdea} style={{padding:"9px 24px",background:T.warn,border:"none",borderRadius:7,color:T.white,cursor:"pointer",fontSize:13,fontWeight:700}}>Save</button>
            <button onClick={()=>{setAdding(false);setNewTitle("");setNewNotes("");}} style={{padding:"9px 16px",border:`1.5px solid ${T.border}`,borderRadius:7,background:"transparent",color:T.muted,cursor:"pointer",fontSize:13}}>Cancel</button>
          </div>
        </div>
      )}

      {/* Main content — cards + detail panel */}
      <div style={{display:"grid",gridTemplateColumns:selectedId?"1fr 360px":"1fr",gap:20,alignItems:"start"}}>

        {/* Cards grid */}
        <div>
          {globalIdeas.length === 0 && !adding ? (
            <div style={{background:T.white,border:`1.5px dashed ${T.border}`,borderRadius:12,padding:"60px 40px",textAlign:"center"}}>
              <div style={{fontSize:36,marginBottom:12}}>💡</div>
              <div style={{fontSize:14,fontWeight:700,color:T.muted}}>No Big Ideas yet</div>
              <div style={{fontSize:12,color:T.muted,marginTop:6,lineHeight:1.8}}>Add ideas here — they'll appear in the <strong>Log Time</strong> dropdown once you select a project.</div>
            </div>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:14}}>
              {globalIdeas.map((idea, i) => {
                const accent = cardAccents[i % cardAccents.length];
                const lp = linkedProjects(idea.id);
                const h = ideaHours(idea.id);
                const isSelected = selectedId === idea.id;
                const isEditing = editingId === idea.id;

                return (
                  <div key={idea.id}
                    onClick={()=>{ if(!isEditing){ setSelectedId(isSelected ? null : idea.id); setAdding(false); }}}
                    style={{background:T.white,border:`2px solid ${isSelected?accent:T.border}`,borderRadius:14,overflow:"hidden",cursor:"pointer",transition:"all 0.18s",boxShadow:isSelected?`0 4px 20px ${accent}33`:"0 1px 4px rgba(0,0,0,0.04)",transform:isSelected?"translateY(-2px)":"none"}}>

                    {/* Color bar */}
                    <div style={{height:5,background:accent}}/>

                    <div style={{padding:"16px 18px"}}>
                      {isEditing ? (
                        <div style={{display:"grid",gap:8}} onClick={e=>e.stopPropagation()}>
                          <input value={editTitle} onChange={e=>setEditTitle(e.target.value)} style={{...INP,fontSize:12,padding:"7px 10px"}} autoFocus/>
                          <textarea value={editNotes} onChange={e=>setEditNotes(e.target.value)} rows={2} style={{...INP,fontSize:11.5,padding:"7px 10px",resize:"vertical",lineHeight:1.5}}/>
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={saveEdit} style={{padding:"6px 14px",background:T.success,border:"none",borderRadius:6,color:T.white,cursor:"pointer",fontSize:11.5,fontWeight:700}}>Save</button>
                            <button onClick={()=>setEditingId(null)} style={{padding:"6px 10px",border:`1px solid ${T.border}`,borderRadius:6,background:"transparent",color:T.muted,cursor:"pointer",fontSize:11.5}}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Idea title */}
                          <div style={{fontSize:13.5,fontWeight:800,color:T.navy,lineHeight:1.4,marginBottom:8}}>💡 {idea.title}</div>

                          {/* Notes preview */}
                          {idea.notes && (
                            <div style={{fontSize:11.5,color:T.muted,lineHeight:1.6,marginBottom:10,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{idea.notes}</div>
                          )}

                          {/* Stats row */}
                          <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                            <span style={{fontSize:10.5,fontWeight:700,color:accent,background:accent+"18",border:`1px solid ${accent}33`,borderRadius:99,padding:"2px 9px"}}>
                              {lp.length} project{lp.length!==1?"s":""}
                            </span>
                            {h > 0 && (
                              <span style={{fontSize:10.5,fontWeight:700,color:T.muted,background:T.cream,border:`1px solid ${T.border}`,borderRadius:99,padding:"2px 9px"}}>
                                {fmtH(h)} logged
                              </span>
                            )}
                          </div>

                          {/* Project dots */}
                          {lp.length > 0 && (
                            <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
                              {lp.map(p=>(
                                <span key={p.id} style={{fontSize:10,fontWeight:700,color:p.color,background:p.color+"18",border:`1px solid ${p.color}33`,borderRadius:4,padding:"2px 7px"}}>{p.name}</span>
                              ))}
                            </div>
                          )}

                          {/* Edit / delete */}
                          <div style={{display:"flex",gap:6,borderTop:`1px solid ${T.border}`,paddingTop:10,marginTop:2}} onClick={e=>e.stopPropagation()}>
                            <button onClick={()=>startEdit(idea)} style={{flex:1,padding:"5px",border:`1px solid ${T.border}`,borderRadius:6,background:"transparent",color:T.muted,cursor:"pointer",fontSize:11,fontWeight:600}}>Edit</button>
                            <button onClick={()=>removeIdea(idea.id)} style={{padding:"5px 8px",border:`1px solid ${T.border}`,borderRadius:6,background:"transparent",color:T.muted,cursor:"pointer",fontSize:11}}>✕</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail panel — slides in when card is selected */}
        {selectedIdea && (
          <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:14,overflow:"hidden",position:"sticky",top:0}}>
            {/* Panel header */}
            <div style={{background:T.navy,padding:"20px 22px",position:"relative"}}>
              <button onClick={()=>setSelectedId(null)}
                style={{position:"absolute",top:14,right:14,background:"rgba(255,255,255,0.1)",border:"none",borderRadius:6,color:"rgba(255,255,255,0.5)",cursor:"pointer",fontSize:13,padding:"4px 9px",fontWeight:700}}>✕</button>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.4)",marginBottom:6}}>Big Idea</div>
              <div style={{fontSize:15,fontWeight:800,color:T.white,lineHeight:1.4,paddingRight:30}}>💡 {selectedIdea.title}</div>
            </div>

            <div style={{padding:"18px 22px",display:"grid",gap:18}}>

              {/* Notes */}
              {selectedIdea.notes && (
                <div>
                  <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:T.muted,marginBottom:6}}>Notes</div>
                  <div style={{fontSize:12.5,color:T.text,lineHeight:1.7}}>{selectedIdea.notes}</div>
                </div>
              )}

              {/* Hours + entries summary */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div style={{background:T.cream,borderRadius:8,padding:"12px 14px",textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:800,color:T.navy}}>{fmtH(selectedHours)}</div>
                  <div style={{fontSize:10,color:T.muted,marginTop:2,textTransform:"uppercase",letterSpacing:"0.06em"}}>Hours logged</div>
                </div>
                <div style={{background:T.cream,borderRadius:8,padding:"12px 14px",textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:800,color:T.navy}}>{selectedEntries.length}</div>
                  <div style={{fontSize:10,color:T.muted,marginTop:2,textTransform:"uppercase",letterSpacing:"0.06em"}}>Entries</div>
                </div>
              </div>

              {/* Linked projects */}
              <div>
                <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:T.muted,marginBottom:10}}>
                  Active on {selectedLinked.length} Project{selectedLinked.length!==1?"s":""}
                </div>
                {selectedLinked.length === 0 ? (
                  <div style={{fontSize:12,color:T.muted,fontStyle:"italic"}}>Not linked to any projects yet — assign it in the Projects tab.</div>
                ) : (
                  <div style={{display:"grid",gap:8}}>
                    {selectedLinked.map(p => {
                      const projH = selectedEntries.filter(e=>e.project===p.id).reduce((s,e)=>s+e.hours,0);
                      const projPm = TEAM.find(t=>t.id===p.pm);
                      return (
                        <div key={p.id} style={{border:`1.5px solid ${p.color}33`,borderLeft:`3px solid ${p.color}`,borderRadius:8,padding:"12px 14px",background:p.color+"08"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                            <div style={{fontSize:12.5,fontWeight:700,color:T.navy,lineHeight:1.3}}>{p.name}</div>
                            <span style={{fontSize:10,fontWeight:700,color:p.color,background:p.color+"18",borderRadius:99,padding:"2px 8px",flexShrink:0,marginLeft:6}}>{p.status}</span>
                          </div>
                          {p.description && <div style={{fontSize:11,color:T.muted,lineHeight:1.6,marginBottom:8}}>{p.description.slice(0,90)}{p.description.length>90?"…":""}</div>}
                          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                            {projPm && <span style={{fontSize:10.5,color:T.muted}}>PM: <strong style={{color:projPm.color}}>{projPm.name}</strong></span>}
                            {projH > 0 && <span style={{fontSize:10.5,color:T.muted}}>{fmtH(projH)} logged here</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Who's been logging this idea */}
              {selectedEntries.length > 0 && (
                <div>
                  <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:T.muted,marginBottom:8}}>Team Activity</div>
                  <div style={{display:"grid",gap:6}}>
                    {TEAM.map(t => {
                      const h = selectedEntries.filter(e=>e.person===t.id).reduce((s,e)=>s+e.hours,0);
                      if (!h) return null;
                      return (
                        <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div style={{display:"flex",alignItems:"center",gap:7}}>
                            <div style={{width:22,height:22,borderRadius:"50%",background:t.color+"33",border:`2px solid ${t.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:t.color}}>{t.name[0]}</div>
                            <span style={{fontSize:12,color:T.text}}>{t.name}</span>
                          </div>
                          <span style={{fontSize:12,fontWeight:700,color:t.color}}>{fmtH(h)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PILOT TRACKER ────────────────────────────────────────────────────────────
const PILOT_START = "2026-03-10";
const PILOT_END   = "2026-06-05";
const PILOT_WEEKS = 13;

// Generate all 13 Thursday check-in dates
function getPilotThursdays() {
  const thursdays = [];
  let d = new Date("2026-03-12T12:00:00"); // first Thursday after kickoff
  while (d <= new Date(PILOT_END + "T12:00:00")) {
    thursdays.push(d.toISOString().slice(0, 10));
    d = new Date(d); d.setDate(d.getDate() + 7);
  }
  return thursdays;
}

function PilotTracker({ entries, projects, globalIdeas }) {
  const today = new Date();
  const start = new Date(PILOT_START + "T12:00:00");
  const end   = new Date(PILOT_END   + "T12:00:00");
  const totalMs   = end - start;
  const elapsedMs = Math.min(today - start, totalMs);
  const pilotPct  = Math.max(0, Math.min(100, Math.round((elapsedMs / totalMs) * 100)));
  const daysRemaining = Math.max(0, Math.round((end - today) / (1000*60*60*24)));
  const weeksElapsed  = Math.max(0, Math.min(PILOT_WEEKS, Math.round(elapsedMs / (1000*60*60*24*7))));

  const thursdays = getPilotThursdays();
  const pastThursdays = thursdays.filter(d => d <= today.toISOString().slice(0,10));

  // Per-thursday participation: did each member log anything in the 7 days up to that thursday?
  function weekEntries(thursday) {
    const wStart = new Date(thursday + "T12:00:00"); wStart.setDate(wStart.getDate() - 6);
    const wStartStr = wStart.toISOString().slice(0,10);
    return entries.filter(e => e.date >= wStartStr && e.date <= thursday);
  }

  // Hours by week for the area chart
  const weeklyHours = thursdays.map(thu => {
    const we = weekEntries(thu);
    const row = { week: new Date(thu+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"}), total: we.reduce((s,e)=>s+e.hours,0) };
    TEAM.forEach(t => { row[t.name] = we.filter(e=>e.person===t.id).reduce((s,e)=>s+e.hours,0); });
    return row;
  });

  // Adoption: weeks each member has logged at least 1 entry
  const adoptionByMember = TEAM.map(t => ({
    ...t,
    weeksLogged: pastThursdays.filter(thu => weekEntries(thu).some(e=>e.person===t.id)).length,
    totalHours: entries.filter(e=>e.person===t.id).reduce((s,e)=>s+e.hours,0),
  }));

  // Big Idea linkage
  const entriesWithBI = entries.filter(e=>e.bigIdea&&e.bigIdea!=="").length;
  const biPct = entries.length ? Math.round((entriesWithBI/entries.length)*100) : 0;
  const allBigIdeas = projects.flatMap(p=>p.bigIdeas||[]);
  const linkedBIs = [...new Set(entries.filter(e=>e.bigIdea).map(e=>e.bigIdea))].length;

  // Hours by project
  const projHours = projects.map(p=>({ name:p.name, hours:entries.filter(e=>e.project===p.id).reduce((s,e)=>s+e.hours,0), color:p.color })).filter(p=>p.hours>0);
  const totalHours = entries.reduce((s,e)=>s+e.hours,0);

  // Milestones
  const MILESTONES = [
    { date:"2026-03-10", label:"🚀 Kickoff", sub:"Pilot begins" },
    { date:"2026-03-27", label:"📊 Week 3 Check", sub:"First full 2 weeks of data" },
    { date:"2026-04-17", label:"🔍 Mid-Pilot Review", sub:"5 weeks in — assess patterns" },
    { date:"2026-05-08", label:"📝 Draft ROI Notes", sub:"Start documenting findings" },
    { date:"2026-05-29", label:"✅ Final Data Week", sub:"Last full logging week" },
    { date:"2026-06-05", label:"🏁 Pilot Closes", sub:"Conclude testing, finalize ROI doc" },
  ];

  const statusColor = { Active:T.success, FY26:T.purple, "On Hold":T.warn, Complete:T.teal, Planned:T.navy };
  const MEMBER_COLORS = [T.orange, T.teal, T.purple];

  return (
    <div style={{display:"grid",gap:20}}>

      {/* Hero banner */}
      <div style={{background:T.navy,borderRadius:14,padding:"28px 32px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,right:0,width:300,height:"100%",background:`linear-gradient(135deg,transparent,${T.orange}18)`,pointerEvents:"none"}}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:20,alignItems:"center"}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:T.orange,marginBottom:8}}>PMO Time Tracker · Pilot Program</div>
            <div style={{fontSize:24,fontWeight:800,color:T.white,lineHeight:1.2,marginBottom:6}}>3-Month Testing Journey</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:18}}>March 10 – June 5, 2026 · 13 weeks · Thursday check-ins</div>
            {/* Progress bar */}
            <div style={{marginBottom:6}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:600}}>Kickoff Mar 10</span>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:600}}>Close Jun 5</span>
              </div>
              <div style={{height:10,background:"rgba(255,255,255,0.1)",borderRadius:5,overflow:"hidden"}}>
                <div style={{width:`${pilotPct}%`,height:"100%",background:`linear-gradient(90deg,${T.orange},${T.orangeLight})`,borderRadius:5,transition:"width 0.6s ease"}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                <span style={{fontSize:12,color:T.orange,fontWeight:700}}>{pilotPct}% complete</span>
                <span style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>{daysRemaining} days remaining</span>
              </div>
            </div>
          </div>
          <div style={{display:"grid",gap:10,textAlign:"center"}}>
            <div style={{background:"rgba(255,255,255,0.07)",borderRadius:10,padding:"14px 20px"}}>
              <div style={{fontSize:28,fontWeight:800,color:T.white,fontFamily:"'JetBrains Mono',monospace"}}>{weeksElapsed}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.08em",marginTop:2}}>of {PILOT_WEEKS} weeks</div>
            </div>
            <div style={{background:"rgba(255,255,255,0.07)",borderRadius:10,padding:"14px 20px"}}>
              <div style={{fontSize:28,fontWeight:800,color:T.orange,fontFamily:"'JetBrains Mono',monospace"}}>{fmtH(totalHours)}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.08em",marginTop:2}}>logged total</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"18px 20px",borderTop:`3px solid ${T.orange}`}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:T.muted,marginBottom:8}}>Weeks Active</div>
          <div style={{fontSize:28,fontWeight:800,color:T.navy}}>{pastThursdays.length}<span style={{fontSize:14,color:T.muted,fontWeight:500}}>/{PILOT_WEEKS}</span></div>
          <div style={{fontSize:11,color:T.muted,marginTop:4}}>check-in weeks completed</div>
        </div>
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"18px 20px",borderTop:`3px solid ${T.teal}`}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:T.muted,marginBottom:8}}>Total Entries</div>
          <div style={{fontSize:28,fontWeight:800,color:T.navy}}>{entries.length}</div>
          <div style={{fontSize:11,color:T.muted,marginTop:4}}>{entries.length>0?`avg ${(totalHours/entries.length).toFixed(1)}h per entry`:"no entries yet"}</div>
        </div>
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"18px 20px",borderTop:`3px solid ${T.purple}`}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:T.muted,marginBottom:8}}>Big Ideas Linked</div>
          <div style={{fontSize:28,fontWeight:800,color:T.navy}}>{linkedBIs}<span style={{fontSize:14,color:T.muted,fontWeight:500}}>/{allBigIdeas.length}</span></div>
          <div style={{fontSize:11,color:T.muted,marginTop:4}}>{biPct}% of entries tagged</div>
        </div>
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"18px 20px",borderTop:`3px solid ${T.warn}`}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:T.muted,marginBottom:8}}>Team Adoption</div>
          <div style={{fontSize:28,fontWeight:800,color:T.navy}}>{adoptionByMember.filter(m=>m.weeksLogged>0).length}<span style={{fontSize:14,color:T.muted,fontWeight:500}}>/3</span></div>
          <div style={{fontSize:11,color:T.muted,marginTop:4}}>members logging actively</div>
        </div>
      </div>

      {/* Weekly hours chart + adoption */}
      <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:16}}>
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"22px 24px"}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted,marginBottom:16}}>Hours Logged by Week</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyHours} margin={{top:4,right:8,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
              <XAxis dataKey="week" tick={{fontSize:10,fill:T.muted}} interval={1}/>
              <YAxis tick={{fontSize:10,fill:T.muted}}/>
              <Tooltip content={<TTip/>}/>
              {TEAM.map((t,i)=><Bar key={t.id} dataKey={t.name} stackId="a" fill={t.color} radius={i===TEAM.length-1?[4,4,0,0]:[0,0,0,0]}/>)}
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:"flex",gap:16,justifyContent:"center",marginTop:10}}>
            {TEAM.map(t=><div key={t.id} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.muted}}><span style={{width:10,height:10,borderRadius:2,background:t.color,display:"inline-block"}}/>{t.name}</div>)}
          </div>
        </div>

        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"22px 24px"}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted,marginBottom:16}}>Team Participation</div>
          <div style={{display:"grid",gap:14}}>
            {adoptionByMember.map(m => {
              const pct = pastThursdays.length ? Math.round((m.weeksLogged/pastThursdays.length)*100) : 0;
              const consistencyColor = pct>=80?T.success:pct>=50?T.warn:"#EF4444";
              return (
                <div key={m.id}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:28,height:28,borderRadius:"50%",background:m.color+"33",border:`2px solid ${m.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:m.color}}>{m.name[0]}</div>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:T.text}}>{m.name}</div>
                        <div style={{fontSize:10.5,color:T.muted}}>{m.role}</div>
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:13,fontWeight:800,color:consistencyColor}}>{pct}%</div>
                      <div style={{fontSize:10,color:T.muted}}>{m.weeksLogged}/{pastThursdays.length} wks</div>
                    </div>
                  </div>
                  <div style={{height:6,background:T.cream,borderRadius:3,overflow:"hidden",border:`1px solid ${T.border}`}}>
                    <div style={{width:`${pct}%`,height:"100%",background:consistencyColor,borderRadius:3,transition:"width 0.5s ease"}}/>
                  </div>
                  <div style={{fontSize:10.5,color:T.muted,marginTop:3}}>{fmtH(m.totalHours)} total · {entries.filter(e=>e.person===m.id).length} entries</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Project distribution + Big Idea health */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"22px 24px"}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted,marginBottom:14}}>PMO Time Visibility by Project</div>
          {projHours.length>0 ? projHours.map(p=>{
            const pct=totalHours?Math.round((p.hours/totalHours)*100):0;
            return (
              <div key={p.name} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:12.5,fontWeight:600,color:T.text}}>{p.name}</span>
                  <span style={{fontSize:12,color:T.muted}}>{fmtH(p.hours)} · <span style={{color:p.color,fontWeight:700}}>{pct}%</span></span>
                </div>
                <div style={{height:8,background:T.cream,borderRadius:4,overflow:"hidden",border:`1px solid ${T.border}`}}>
                  <div style={{width:`${pct}%`,height:"100%",background:p.color,borderRadius:4}}/>
                </div>
              </div>
            );
          }) : <div style={{color:T.muted,fontSize:12,fontStyle:"italic",paddingTop:8}}>No hours logged yet — start tracking to see where PMO time goes.</div>}
        </div>

        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"22px 24px"}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted,marginBottom:14}}>Big Idea Tracking Health</div>
          {projects.map(p=>{
            const pEntries=entries.filter(e=>e.project===p.id);
            const pLinked=pEntries.filter(e=>e.bigIdea&&e.bigIdea!=="").length;
            const pPct=pEntries.length?Math.round((pLinked/pEntries.length)*100):0;
            return (
              <div key={p.id} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{width:8,height:8,borderRadius:2,background:p.color,display:"inline-block"}}/>
                    <span style={{fontSize:12.5,fontWeight:600,color:T.text}}>{p.name}</span>
                  </div>
                  <span style={{fontSize:11,color:T.muted}}>{pLinked}/{pEntries.length} entries tagged</span>
                </div>
                <div style={{height:6,background:T.cream,borderRadius:3,overflow:"hidden",border:`1px solid ${T.border}`}}>
                  <div style={{width:`${pPct}%`,height:"100%",background:pPct>=50?T.warn:T.border,borderRadius:3}}/>
                </div>
                <div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"}}>
                  {(p.bigIdeas||[]).map(bId=>{
                    const b=globalIdeas.find(x=>x.id===bId);
                    if(!b) return null;
                    const used=entries.some(e=>e.bigIdea===bId);
                    return <span key={bId} style={{fontSize:10,padding:"2px 7px",borderRadius:99,background:used?T.warn+"22":T.cream,border:`1px solid ${used?T.warn+"66":T.border}`,color:used?T.warn:T.muted,fontWeight:600}}>💡 {b.title.slice(0,24)}{b.title.length>24?"…":""}</span>;
                  })}
                  {(p.bigIdeas||[]).length===0&&<span style={{fontSize:11,color:T.muted,fontStyle:"italic"}}>No Big Ideas yet</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone timeline */}
      <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"22px 28px"}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted,marginBottom:20}}>Pilot Milestones</div>
        <div style={{position:"relative"}}>
          {/* Track line */}
          <div style={{position:"absolute",top:16,left:16,right:16,height:2,background:T.border,zIndex:0}}/>
          <div style={{position:"absolute",top:16,left:16,height:2,background:T.orange,zIndex:1,width:`${pilotPct}%`,maxWidth:"calc(100% - 32px)",transition:"width 0.6s ease"}}/>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${MILESTONES.length},1fr)`,gap:0,position:"relative",zIndex:2}}>
            {MILESTONES.map((m,i)=>{
              const isPast = today >= new Date(m.date+"T12:00:00");
              const isCurrent = i < MILESTONES.length-1 && isPast && today < new Date(MILESTONES[i+1].date+"T12:00:00");
              return (
                <div key={m.date} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:isPast?T.orange:T.white,border:`2px solid ${isPast?T.orange:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,boxShadow:isCurrent?`0 0 0 4px ${T.orange}33`:"none",transition:"all 0.3s"}}>
                    {isPast?"✓":"○"}
                  </div>
                  <div style={{textAlign:"center",padding:"0 4px"}}>
                    <div style={{fontSize:11.5,fontWeight:700,color:isPast?T.navy:T.muted,lineHeight:1.3}}>{m.label}</div>
                    <div style={{fontSize:10,color:T.muted,marginTop:2}}>{new Date(m.date+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
                    <div style={{fontSize:10,color:T.muted,marginTop:1,fontStyle:"italic"}}>{m.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly check-in log */}
      <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
        <div style={{padding:"16px 24px",borderBottom:`1px solid ${T.border}`,fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted}}>Weekly Check-in Log — Every Thursday</div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{background:T.cream}}>
                <th style={{padding:"10px 16px",textAlign:"left",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",color:T.muted,whiteSpace:"nowrap"}}>Week</th>
                <th style={{padding:"10px 16px",textAlign:"left",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",color:T.muted}}>Date</th>
                {TEAM.map(t=><th key={t.id} style={{padding:"10px 16px",textAlign:"center",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",color:t.color}}>{t.name}</th>)}
                <th style={{padding:"10px 16px",textAlign:"right",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",color:T.muted}}>Total</th>
              </tr>
            </thead>
            <tbody>
              {thursdays.map((thu,i)=>{
                const we = weekEntries(thu);
                const isFuture = thu > today.toISOString().slice(0,10);
                const isCurrent = !isFuture && (i===thursdays.length-1 || thursdays[i+1] > today.toISOString().slice(0,10));
                const weekTotal = we.reduce((s,e)=>s+e.hours,0);
                return (
                  <tr key={thu} style={{borderBottom:`1px solid ${T.border}`,background:isCurrent?T.orange+"08":isFuture?T.cream:T.white}}>
                    <td style={{padding:"10px 16px",fontWeight:700,color:isFuture?T.muted:T.navy}}>
                      {isCurrent && <span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:T.orange,marginRight:6,verticalAlign:"middle"}}/>}
                      Wk {i+1}
                    </td>
                    <td style={{padding:"10px 16px",color:isFuture?T.muted:T.text,whiteSpace:"nowrap"}}>
                      {new Date(thu+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                    </td>
                    {TEAM.map(t=>{
                      const h=we.filter(e=>e.person===t.id).reduce((s,e)=>s+e.hours,0);
                      const logged=h>0;
                      return (
                        <td key={t.id} style={{padding:"10px 16px",textAlign:"center"}}>
                          {isFuture ? <span style={{color:T.border,fontSize:11}}>—</span> :
                           logged ? <span style={{color:t.color,fontWeight:700}}>{fmtH(h)}</span> :
                           <span style={{color:"#EF4444",fontSize:11,fontWeight:600}}>✗</span>}
                        </td>
                      );
                    })}
                    <td style={{padding:"10px 16px",textAlign:"right",fontWeight:800,color:isFuture?T.muted:T.navy}}>
                      {isFuture?"—":fmtH(weekTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// ─── CAPACITY FORECASTING ─────────────────────────────────────────────────────
function CapacityForecasting({ entries }) {
  const teamTarget = CAPACITY_TARGET_H * TEAM.length;

  const weeks = useMemo(() => {
    const currentMonday = getMondayOf(today());
    return Array.from({length:8}, (_,i) => {
      const d = new Date(currentMonday+"T12:00:00");
      d.setDate(d.getDate() - 7*(7-i));
      const monday = d.toISOString().slice(0,10);
      const fri = new Date(monday+"T12:00:00"); fri.setDate(fri.getDate()+4);
      const friday = fri.toISOString().slice(0,10);
      const label = new Date(monday+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"});
      const row = { monday, friday, label, isCurrent: i===7, target: CAPACITY_TARGET_H };
      TEAM.forEach(t => {
        row[t.name.split(" ")[0]] = entries.filter(e=>e.person===t.id&&e.date>=monday&&e.date<=friday).reduce((s,e)=>s+e.hours,0);
      });
      row.total = TEAM.reduce((s,t) => s + (row[t.name.split(" ")[0]]||0), 0);
      return row;
    });
  }, [entries]);

  const currentWeek = weeks[7];

  return (
    <div style={{display:"grid",gap:20}}>

      {/* ── Hero banner ── */}
      <div style={{background:`linear-gradient(135deg,${T.navy} 0%,${T.navyLight} 100%)`,borderRadius:14,padding:"24px 28px",display:"flex",gap:24,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{flex:1,minWidth:160}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.09em",textTransform:"uppercase",color:"rgba(255,255,255,0.4)",marginBottom:8}}>Team Hours — This Week</div>
          <div style={{fontSize:34,fontWeight:800,color:T.white,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"-0.02em"}}>{fmtH(currentWeek.total)}</div>
          <div style={{fontSize:11.5,color:"rgba(255,255,255,0.4)",marginTop:5}}>of {fmtH(teamTarget)} team target · {CAPACITY_TARGET_H}h × {TEAM.length} members</div>
          <div style={{marginTop:12,height:5,background:"rgba(255,255,255,0.1)",borderRadius:3,overflow:"hidden"}}>
            <div style={{width:`${Math.min((currentWeek.total/teamTarget)*100,100)}%`,height:"100%",background:T.orange,borderRadius:3}}/>
          </div>
          <div style={{fontSize:10.5,color:"rgba(255,255,255,0.3)",marginTop:6}}>
            {Math.round((currentWeek.total/teamTarget)*100)}% of team capacity used · {fmtH(Math.max(0,teamTarget-currentWeek.total))} remaining
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {TEAM.map(t => {
            const h = currentWeek[t.name.split(" ")[0]]||0;
            const atCap = h >= CAPACITY_TARGET_H;
            return (
              <div key={t.id} style={{background:"rgba(255,255,255,0.06)",border:`1px solid rgba(255,255,255,0.1)`,borderRadius:10,padding:"12px 14px",minWidth:100,textAlign:"center"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:t.color+"33",border:`2px solid ${t.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:t.color,margin:"0 auto 6px"}}>{t.name[0]}</div>
                <div style={{fontSize:11.5,fontWeight:700,color:T.white}}>{t.name.split(" ")[0]}</div>
                <div style={{fontSize:15,fontWeight:800,color:atCap?"#FCA5A5":T.tealLight,fontFamily:"'JetBrains Mono',monospace",margin:"4px 0 2px"}}>{fmtH(h)}</div>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.05em",color:atCap?"#FCA5A5":T.tealLight}}>{atCap?"AT CAPACITY":"AVAILABLE"}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Individual capacity cards ── */}
      <div style={{display:"grid",gridTemplateColumns:`repeat(${TEAM.length},1fr)`,gap:14}}>
        {TEAM.map(t => {
          const h = currentWeek[t.name.split(" ")[0]]||0;
          const remaining = CAPACITY_TARGET_H - h;
          const over = remaining < 0;
          const capPct = Math.min(Math.round((h/CAPACITY_TARGET_H)*100),100);
          const barColor = over ? "#EF4444" : capPct >= 80 ? T.warn : T.success;
          const avg8 = Math.round((weeks.reduce((s,wk) => s+(wk[t.name.split(" ")[0]]||0), 0) / weeks.length) * 10) / 10;

          // Top work type this week
          const thisWkEntries = entries.filter(e=>e.person===t.id&&e.date>=currentWeek.monday&&e.date<=currentWeek.friday);
          const byType = {};
          thisWkEntries.forEach(e => { byType[e.workType] = (byType[e.workType]||0) + e.hours; });
          const topType = Object.entries(byType).sort((a,b)=>b[1]-a[1])[0];

          return (
            <div key={t.id} style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:14,padding:"22px 20px",position:"relative",overflow:"hidden"}}>
              {/* Accent bar */}
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:t.color}}/>

              {/* Header */}
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:t.color+"22",border:`2px solid ${t.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:t.color,flexShrink:0}}>{t.name[0]}</div>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:T.text}}>{t.name.split(" ")[0]}</div>
                  <div style={{fontSize:10.5,color:T.muted}}>{t.role}</div>
                </div>
                <div style={{marginLeft:"auto",padding:"3px 9px",borderRadius:99,background:(over?"#EF4444":T.success)+"15",border:`1px solid ${(over?"#EF4444":T.success)}44`,fontSize:9.5,fontWeight:700,color:over?"#EF4444":T.success,whiteSpace:"nowrap"}}>
                  {over?"At Capacity":"Open for Work"}
                </div>
              </div>

              {/* Hours logged + gauge */}
              <div style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
                  <div>
                    <span style={{fontSize:28,fontWeight:800,color:T.navy,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"-0.02em"}}>{fmtH(h)}</span>
                    <span style={{fontSize:12,color:T.muted,marginLeft:5}}>logged</span>
                  </div>
                  <span style={{fontSize:12,fontWeight:700,color:barColor}}>{capPct}%</span>
                </div>
                <div style={{height:8,background:T.cream,borderRadius:4,overflow:"hidden",border:`1px solid ${T.border}`}}>
                  <div style={{width:`${capPct}%`,height:"100%",background:barColor,borderRadius:4,transition:"width 0.4s ease"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:5,fontSize:10.5}}>
                  <span style={{color:T.muted}}>0h</span>
                  <span style={{color:T.muted,fontWeight:600}}>target: {CAPACITY_TARGET_H}h</span>
                </div>
              </div>

              {/* Availability callout */}
              <div style={{background:over?"#FEF2F2":T.success+"0d",border:`1px solid ${over?"#FECACA":T.success+"33"}`,borderRadius:8,padding:"10px 14px",marginBottom:14,textAlign:"center"}}>
                <div style={{fontSize:20,fontWeight:800,color:over?"#EF4444":T.success,fontFamily:"'JetBrains Mono',monospace"}}>
                  {over ? `${fmtH(Math.abs(remaining))} over` : `${fmtH(remaining)} free`}
                </div>
                <div style={{fontSize:10.5,color:over?"#EF4444":T.success,fontWeight:600,marginTop:1}}>
                  {over ? "above weekly target" : "remaining this week"}
                </div>
              </div>

              {/* Secondary stats */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div style={{background:T.cream,borderRadius:7,padding:"10px 12px"}}>
                  <div style={{fontSize:9.5,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",color:T.muted,marginBottom:4}}>8-Wk Avg</div>
                  <div style={{fontSize:16,fontWeight:800,color:T.navy,fontFamily:"'JetBrains Mono',monospace"}}>{fmtH(avg8)}</div>
                  <div style={{fontSize:9.5,color:T.muted,marginTop:1}}>per week</div>
                </div>
                <div style={{background:T.cream,borderRadius:7,padding:"10px 12px"}}>
                  <div style={{fontSize:9.5,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",color:T.muted,marginBottom:4}}>Top This Week</div>
                  {topType ? (
                    <>
                      <div style={{fontSize:11,fontWeight:700,color:T.text,lineHeight:1.3}}>{topType[0]}</div>
                      <div style={{fontSize:9.5,color:T.muted,marginTop:2}}>{fmtH(topType[1])}</div>
                    </>
                  ) : <div style={{fontSize:11,color:T.muted}}>No entries yet</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 8-week history chart ── */}
      <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"22px 20px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted}}>8-Week History vs Target ({CAPACITY_TARGET_H}h)</div>
          <div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
            {TEAM.map(t=>(
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.muted}}>
                <span style={{width:14,height:3,background:t.color,display:"inline-block",borderRadius:2}}/>
                {t.name.split(" ")[0]}
              </div>
            ))}
            <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.muted}}>
              <span style={{width:14,height:0,borderTop:`2px dashed ${T.border}`,display:"inline-block"}}/>
              Target
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={weeks} margin={{top:4,right:8,left:-20,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
            <XAxis dataKey="label" tick={{fontSize:10,fill:T.muted}}/>
            <YAxis tick={{fontSize:10,fill:T.muted}}/>
            <Tooltip content={<TTip/>}/>
            <Line type="monotone" dataKey="target" stroke={T.muted} strokeWidth={1.5} strokeDasharray="5 4" dot={false} name="Target"/>
            {TEAM.map(t=>(
              <Line key={t.id} type="monotone" dataKey={t.name.split(" ")[0]} stroke={t.color} strokeWidth={2.5} dot={{r:3,fill:t.color}} activeDot={{r:5}}/>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Weekly breakdown table ── */}
      <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
        <div style={{padding:"16px 22px",borderBottom:`1px solid ${T.border}`,fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted}}>Weekly Breakdown</div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}>
            <thead>
              <tr style={{background:T.cream}}>
                <th style={{padding:"10px 16px",textAlign:"left",fontWeight:700,color:T.muted,fontSize:11,letterSpacing:"0.05em",textTransform:"uppercase"}}>Week of</th>
                {TEAM.map(t=>(
                  <th key={t.id} style={{padding:"10px 16px",textAlign:"right",fontWeight:700,color:t.color,fontSize:11,letterSpacing:"0.05em",textTransform:"uppercase"}}>{t.name.split(" ")[0]}</th>
                ))}
                <th style={{padding:"10px 16px",textAlign:"right",fontWeight:700,color:T.navy,fontSize:11,letterSpacing:"0.05em",textTransform:"uppercase"}}>Total</th>
                <th style={{padding:"10px 16px",textAlign:"right",fontWeight:700,color:T.muted,fontSize:11,letterSpacing:"0.05em",textTransform:"uppercase"}}>vs Target</th>
              </tr>
            </thead>
            <tbody>
              {[...weeks].reverse().map(wk => {
                const diff = wk.total - teamTarget;
                return (
                  <tr key={wk.monday} style={{background:wk.isCurrent?T.navy+"07":"transparent",borderTop:`1px solid ${T.border}`}}>
                    <td style={{padding:"10px 16px",fontWeight:wk.isCurrent?700:500,color:T.text}}>
                      {wk.label}
                      {wk.isCurrent && <span style={{marginLeft:7,fontSize:9,fontWeight:700,color:T.orange,letterSpacing:"0.07em",textTransform:"uppercase"}}>current</span>}
                    </td>
                    {TEAM.map(t => {
                      const h = wk[t.name.split(" ")[0]]||0;
                      const atCap = h >= CAPACITY_TARGET_H;
                      return (
                        <td key={t.id} style={{padding:"10px 16px",textAlign:"right",color:atCap?"#EF4444":h>0?T.success:T.muted,fontWeight:h>0?700:400}}>
                          {h>0 ? fmtH(h) : "—"}
                        </td>
                      );
                    })}
                    <td style={{padding:"10px 16px",textAlign:"right",fontWeight:700,color:wk.total>0?T.navy:T.muted}}>{wk.total>0?fmtH(wk.total):"—"}</td>
                    <td style={{padding:"10px 16px",textAlign:"right"}}>
                      {wk.total>0 ? (
                        <span style={{color:diff>0?"#EF4444":T.success,fontWeight:700}}>
                          {diff>0?"+":" "}{fmtH(Math.abs(diff))} {diff>0?"over":"under"}
                        </span>
                      ) : <span style={{color:T.muted}}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// ─── EXECUTIVE VIEW ───────────────────────────────────────────────────────────
function ExecView({ entries, projects }) {
  const now = new Date();
  const [range, setRange] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState("");

  const availableMonths = useMemo(() => {
    const months = [...new Set(entries.map(e => e.date.slice(0,7)))].sort().reverse();
    return months.map(m => {
      const [y,mo] = m.split("-");
      const label = new Date(parseInt(y),parseInt(mo)-1,1).toLocaleDateString("en-US",{month:"long",year:"numeric"});
      return { value: m, label };
    });
  }, [entries]);

  const filtered = useMemo(() => {
    if (range === "week") return entries.filter(e => e.date >= getWeekStart());
    if (range === "lastweek") { const ws = getWeekStart(), lws = getLastWeekStart(); return entries.filter(e => e.date >= lws && e.date < ws); }
    if (range === "month") return entries.filter(e => e.date >= getMonthStart());
    if (range === "specificMonth" && selectedMonth) return entries.filter(e => e.date.startsWith(selectedMonth));
    return entries;
  }, [entries, range, selectedMonth]);

  // Period label for header
  const periodLabel = useMemo(() => {
    if (range === "week") return "This Week";
    if (range === "lastweek") return "Last Week";
    if (range === "month") return now.toLocaleDateString("en-US",{month:"long",year:"numeric"}) + " (MTD)";
    if (range === "specificMonth" && selectedMonth) {
      const [y,mo] = selectedMonth.split("-");
      return new Date(parseInt(y),parseInt(mo)-1,1).toLocaleDateString("en-US",{month:"long",year:"numeric"});
    }
    return "All Time";
  }, [range, selectedMonth]);

  // Period utilization target
  const periodTarget = useMemo(() => {
    if (range === "week" || range === "lastweek") return CAPACITY_TARGET_H * TEAM.length;
    if (range === "month") {
      const weeksElapsed = Math.max(1, Math.ceil((now - new Date(getMonthStart()+"T12:00:00"))/(1000*60*60*24*7)));
      return CAPACITY_TARGET_H * TEAM.length * weeksElapsed;
    }
    if (range === "specificMonth") return Math.round(4.33 * CAPACITY_TARGET_H * TEAM.length);
    return null;
  }, [range, selectedMonth]);

  // Health classification per project
  function healthOf(p) {
    if (p.status === "Complete") return "completed";
    if (p.status === "FY26")    return "fy26";
    if (p.status === "On Hold") return "hold";
    if (!p.endDate || p.endDate === "TBD") return "active";
    const dLeft = Math.round((new Date(p.endDate + "T12:00:00") - now) / (1000*60*60*24));
    if (dLeft < 0) return "overdue";
    if (dLeft <= 14) return "at-risk";
    return "on-track";
  }

  const HEALTH = {
    "on-track":  { label: "On Track",        color: T.success  },
    "at-risk":   { label: "At Risk",          color: T.warn     },
    "overdue":   { label: "Overdue",          color: "#EF4444"  },
    "hold":      { label: "On Hold",          color: T.muted    },
    "active":    { label: "No Date",          color: "#0D1B2E"  },
    "completed": { label: "Completed",        color: "#39FF14"  },
    "fy26":      { label: "FY26 Year-Round",  color: T.purple   },
  };

  // Period date bounds — used to filter completed projects into the view
  const periodBounds = useMemo(() => {
    if (range === "week") return { start: getWeekStart(), end: null };
    if (range === "lastweek") return { start: getLastWeekStart(), end: getWeekStart() };
    if (range === "month") return { start: getMonthStart(), end: null };
    if (range === "specificMonth" && selectedMonth) {
      const [y,mo] = selectedMonth.split("-");
      const lastDay = new Date(parseInt(y),parseInt(mo),0).getDate();
      return { start:`${selectedMonth}-01`, end:`${selectedMonth}-${String(lastDay).padStart(2,"0")}` };
    }
    return null; // null = all time
  }, [range, selectedMonth]);

  // All projects for scorecard: active/on-hold + FY26 (always) + completed (period-filtered)
  const portfolioProjects = useMemo(() => {
    const active    = projects.filter(p => p.status === "Active" || p.status === "On Hold");
    const fy26      = projects.filter(p => p.status === "FY26");
    const completed = projects.filter(p => {
      if (p.status !== "Complete") return false;
      if (!periodBounds) return true;
      if (!p.endDate || p.endDate === "TBD") return false;
      return p.endDate >= periodBounds.start && (!periodBounds.end || p.endDate < periodBounds.end);
    });
    return [...active, ...fy26, ...completed];
  }, [projects, periodBounds]);

  const portfolioWithHealth = useMemo(() => portfolioProjects.map(p => ({
    ...p,
    health: healthOf(p),
    periodHours: filtered.filter(e => e.project === p.id).reduce((s, e) => s + e.hours, 0),
    pmMember: TEAM.find(t => t.id === p.pm),
  })), [portfolioProjects, filtered]);

  const onTrackCount   = portfolioWithHealth.filter(p => p.health === "on-track").length;
  const atRiskCount    = portfolioWithHealth.filter(p => p.health === "at-risk").length;
  const overdueCount   = portfolioWithHealth.filter(p => p.health === "overdue").length;
  const completedCount = portfolioWithHealth.filter(p => p.health === "completed").length;
  const datedProjects  = portfolioWithHealth.filter(p => p.endDate && p.endDate !== "TBD" && p.health !== "completed");
  const onTimeRate     = datedProjects.length ? Math.round((onTrackCount / datedProjects.length) * 100) : null;

  const totalPeriodHours = filtered.reduce((s, e) => s + e.hours, 0);
  const utilizationPct = periodTarget > 0 ? Math.round((totalPeriodHours / periodTarget) * 100) : 0;

  // Productivity split
  const productiveH    = filtered.filter(e => PRODUCTIVE_TYPES.includes(e.workType)).reduce((s, e) => s + e.hours, 0);
  const overheadH      = filtered.filter(e => OVERHEAD_TYPES.includes(e.workType)).reduce((s, e) => s + e.hours, 0);
  const investH        = filtered.filter(e => e.workType === "Personal Development").reduce((s, e) => s + e.hours, 0);
  const productivityRatio = totalPeriodHours > 0 ? Math.round((productiveH / totalPeriodHours) * 100) : 0;

  // Hours by priority
  const byPriority = PRIORITIES.map(pri => ({
    name: pri,
    hours: filtered.filter(e => {
      const proj = projects.find(p => p.id === e.project);
      return proj && proj.priority === pri;
    }).reduce((s, e) => s + e.hours, 0),
    color: pri === "High" ? "#EF4444" : pri === "Medium" ? T.warn : T.success,
  })).filter(p => p.hours > 0);

  // Time category chart
  const categoryData = [
    { name: "Project Work",  hours: productiveH, color: T.teal   },
    { name: "Overhead",      hours: overheadH,   color: T.warn   },
    { name: "Development",   hours: investH,     color: T.purple },
  ].filter(d => d.hours > 0);

  // Budget burn (always all-time — burn rate is cumulative)
  const burnProjects = projects
    .filter(p => p.estimatedHours && parseFloat(p.estimatedHours) > 0)
    .map(p => {
      const est    = parseFloat(p.estimatedHours);
      const logged = entries.filter(e => e.project === p.id).reduce((s, e) => s + e.hours, 0);
      const burnPct = Math.min(Math.round((logged / est) * 100), 100);
      return { ...p, est, logged, burnPct, over: logged > est };
    })
    .sort((a, b) => b.burnPct - a.burnPct);

  const topAccentColor = overdueCount > 0 ? "#EF4444" : atRiskCount > 0 ? T.warn : T.success;

  return (
    <div style={{display:"grid",gap:20}}>

      {/* ── Period selector ── */}
      <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{fontSize:11,color:T.muted,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginRight:4}}>Period:</span>
        {[{v:"week",l:"This Week"},{v:"lastweek",l:"Last Week"},{v:"month",l:"Month to Date"},{v:"all",l:"All Time"}].map(r=>(
          <button key={r.v} onClick={()=>setRange(r.v)} style={{padding:"7px 18px",borderRadius:7,border:`1.5px solid ${range===r.v&&range!=="specificMonth"?T.navy:T.border}`,background:range===r.v&&range!=="specificMonth"?T.navy:"transparent",color:range===r.v&&range!=="specificMonth"?T.white:T.muted,cursor:"pointer",fontSize:12.5,fontWeight:600}}>
            {r.l}
          </button>
        ))}
        <select value={range==="specificMonth"?selectedMonth:""} onChange={e=>{if(e.target.value){setSelectedMonth(e.target.value);setRange("specificMonth");}}}
          style={{padding:"7px 14px",borderRadius:7,border:`1.5px solid ${range==="specificMonth"?T.navy:T.border}`,background:range==="specificMonth"?T.navy:"white",color:range==="specificMonth"?T.white:T.muted,cursor:"pointer",fontSize:12.5,fontWeight:600,outline:"none"}}>
          <option value="">📅 Pick Month…</option>
          {availableMonths.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      {/* ── Header banner ── */}
      <div style={{background:`linear-gradient(135deg,${T.navy} 0%,${T.navyLight} 100%)`,borderRadius:14,padding:"24px 32px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:T.orange,marginBottom:6}}>Zumiez PMO · Executive Summary</div>
          <div style={{fontSize:22,fontWeight:800,color:T.white,letterSpacing:"-0.01em"}}>{periodLabel}</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:4}}>{TEAM.length}-person PMO team · {portfolioWithHealth.length - completedCount} active · {completedCount} completed</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:9.5,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>Generated</div>
          <div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.5)"}}>{now.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</div>
          <div style={{fontSize:10.5,color:"rgba(255,255,255,0.25)",marginTop:2}}>PMO Time Tracking</div>
        </div>
      </div>

      {/* ── 4 KPI tiles ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>

        {/* Portfolio Health */}
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"20px 22px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:topAccentColor}}/>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:T.muted,marginBottom:12}}>Portfolio Health</div>
          <div style={{display:"flex",gap:14,marginBottom:10}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:26,fontWeight:800,color:T.success,lineHeight:1}}>{onTrackCount}</div>
              <div style={{fontSize:9.5,color:T.success,fontWeight:700,marginTop:3}}>On Track</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:26,fontWeight:800,color:T.warn,lineHeight:1}}>{atRiskCount}</div>
              <div style={{fontSize:9.5,color:T.warn,fontWeight:700,marginTop:3}}>At Risk</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:26,fontWeight:800,color:"#EF4444",lineHeight:1}}>{overdueCount}</div>
              <div style={{fontSize:9.5,color:"#EF4444",fontWeight:700,marginTop:3}}>Overdue</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:26,fontWeight:800,color:"#39FF14",lineHeight:1}}>{completedCount}</div>
              <div style={{fontSize:9.5,color:"#39FF14",fontWeight:700,marginTop:3}}>Done</div>
            </div>
          </div>
          <div style={{fontSize:11,color:T.muted}}>{portfolioWithHealth.length - completedCount} active · {completedCount} completed this period</div>
        </div>

        {/* Team Utilization */}
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"20px 22px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:utilizationPct>=70?T.success:utilizationPct>=50?T.warn:"#EF4444"}}/>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:T.muted,marginBottom:12}}>Team Utilization</div>
          <div style={{fontSize:32,fontWeight:800,color:T.navy,letterSpacing:"-0.02em",lineHeight:1}}>{utilizationPct}%</div>
          <div style={{fontSize:11,color:T.muted,marginTop:6,marginBottom:10}}>{fmtH(totalPeriodHours)} of {periodTarget!=null?fmtH(periodTarget):"—"} target {periodLabel}</div>
          <div style={{height:5,background:T.cream,borderRadius:3,overflow:"hidden",border:`1px solid ${T.border}`}}>
            <div style={{width:`${Math.min(utilizationPct,100)}%`,height:"100%",background:utilizationPct>=70?T.success:utilizationPct>=50?T.warn:"#EF4444",borderRadius:3}}/>
          </div>
        </div>

        {/* On-Time Rate */}
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"20px 22px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:onTimeRate===null?T.border:onTimeRate>=80?T.success:onTimeRate>=50?T.warn:"#EF4444"}}/>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:T.muted,marginBottom:12}}>On-Time Rate</div>
          <div style={{fontSize:32,fontWeight:800,color:T.navy,letterSpacing:"-0.02em",lineHeight:1}}>{onTimeRate===null?"—":onTimeRate+"%"}</div>
          <div style={{fontSize:11,color:T.muted,marginTop:6}}>{onTrackCount} of {datedProjects.length} dated projects on schedule</div>
        </div>

        {/* Productive Time */}
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"20px 22px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:T.teal}}/>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:T.muted,marginBottom:12}}>Productive Time</div>
          <div style={{fontSize:32,fontWeight:800,color:T.navy,letterSpacing:"-0.02em",lineHeight:1}}>{productivityRatio}%</div>
          <div style={{fontSize:11,color:T.muted,marginTop:6}}>of hours on project delivery</div>
          <div style={{fontSize:10.5,color:T.muted,marginTop:2}}>{fmtH(overheadH)} overhead · {fmtH(investH)} dev</div>
        </div>

      </div>

      {/* ── Portfolio Scorecard table ── */}
      <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
        <div style={{padding:"16px 22px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted}}>Portfolio Scorecard</div>
          <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
            {[["On Track",T.success],["At Risk",T.warn],["Overdue","#EF4444"],["No Date","#0D1B2E"],["On Hold",T.muted],["Completed","#39FF14"],["FY26",T.purple]].map(([l,c])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:10.5,color:T.muted}}>
                <span style={{width:8,height:8,borderRadius:2,background:c,display:"inline-block"}}/>{l}
              </div>
            ))}
          </div>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}>
            <thead>
              <tr style={{background:T.cream}}>
                {[["Project","left"],["PM","left"],["Priority","center"],["LOE","center"],["Health","center"],["End Date","right"],["Hrs (Period)","right"]].map(([h,a])=>(
                  <th key={h} style={{padding:"10px 18px",textAlign:a,fontWeight:700,color:T.muted,fontSize:10.5,textTransform:"uppercase",letterSpacing:"0.05em",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...portfolioWithHealth].sort((a,b)=>{
                const o={overdue:0,"at-risk":1,"on-track":2,active:3,hold:4,completed:5,fy26:6};
                return (o[a.health]||5)-(o[b.health]||5);
              }).map((p,i,arr)=>{
                const h = HEALTH[p.health];
                const priColor = p.priority==="High"?"#EF4444":p.priority==="Medium"?T.warn:T.success;
                const isFY26 = p.health === "fy26";
                const isFirstFY26 = isFY26 && (i===0 || arr[i-1].health !== "fy26");
                return (
                  <Fragment key={p.id}>
                    {/* FY26 divider row — injected before the first FY26 project */}
                    {isFirstFY26 && (
                      <tr>
                        <td colSpan={7} style={{padding:0,background:`linear-gradient(90deg,${T.purple}22 0%,${T.purple}10 60%,transparent 100%)`,borderTop:`2px solid ${T.purple}60`,borderBottom:`1px solid ${T.purple}30`}}>
                          <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 18px"}}>
                            <div style={{width:8,height:8,borderRadius:"50%",background:T.purple,flexShrink:0}}/>
                            <span style={{fontSize:10,fontWeight:800,letterSpacing:"0.14em",textTransform:"uppercase",color:T.purple}}>FY26 Standing Initiatives</span>
                            <span style={{fontSize:10.5,color:T.purple+"99",fontWeight:500}}>· Run through the full fiscal year · No fixed deadline</span>
                          </div>
                        </td>
                      </tr>
                    )}
                    <tr style={{borderTop:isFirstFY26?"none":`1px solid ${T.border}`,background:isFY26?`${T.purple}07`:i%2===0?T.white:T.cream+"55"}}>
                      <td style={{padding:"12px 18px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{width:8,height:8,borderRadius:2,background:p.color,flexShrink:0}}/>
                          <span style={{fontWeight:600,color:T.text}}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{padding:"12px 18px",color:T.muted,fontSize:12}}>{p.pmMember?.name?.split(" ")[0]||"—"}</td>
                      <td style={{padding:"12px 18px",textAlign:"center"}}>
                        <span style={{padding:"2px 9px",borderRadius:99,background:priColor+"18",border:`1px solid ${priColor}44`,fontSize:10,fontWeight:700,color:priColor}}>{p.priority||"—"}</span>
                      </td>
                      <td style={{padding:"12px 18px",textAlign:"center"}}>
                        {p.loeSize ? <span style={{padding:"2px 9px",borderRadius:99,background:T.teal+"18",border:`1px solid ${T.teal}44`,fontSize:10,fontWeight:700,color:T.teal}}>{p.loeSize}</span> : <span style={{color:T.muted,fontSize:11}}>—</span>}
                      </td>
                      <td style={{padding:"12px 18px",textAlign:"center"}}>
                        <span style={{padding:"3px 10px",borderRadius:99,background:h.color+"18",border:`1px solid ${h.color}44`,fontSize:10.5,fontWeight:700,color:h.color}}>{h.label}</span>
                      </td>
                      <td style={{padding:"12px 18px",textAlign:"right",fontSize:12,color:isFY26?T.muted:p.health==="overdue"?"#EF4444":T.text,fontWeight:p.health==="overdue"?700:400}}>
                        {isFY26 ? "Full Year" : p.endDate&&p.endDate!=="TBD" ? new Date(p.endDate+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "TBD"}
                      </td>
                      <td style={{padding:"12px 18px",textAlign:"right",fontWeight:700,color:p.periodHours>0?isFY26?T.purple:T.navy:T.muted}}>
                        {p.periodHours>0 ? fmtH(p.periodHours) : "—"}
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Charts row ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

        {/* Hours by Priority */}
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"22px 20px 16px"}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted,marginBottom:4}}>Hours by Priority</div>
          <div style={{fontSize:11.5,color:T.muted,marginBottom:16}}>Are high-priority projects getting the most time?</div>
          {byPriority.length>0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={byPriority} layout="vertical" margin={{top:0,right:40,left:0,bottom:0}}>
                <XAxis type="number" tick={{fontSize:10,fill:T.muted}}/>
                <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:T.text}} width={60}/>
                <Tooltip formatter={v=>fmtH(v)} contentStyle={{background:T.navy,border:"none",borderRadius:8,fontSize:12,color:T.white}}/>
                <Bar dataKey="hours" radius={[0,5,5,0]}>
                  {byPriority.map((p,i)=><Cell key={i} fill={p.color}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{padding:"40px 0",textAlign:"center",color:T.muted,fontSize:13}}>No data this month yet.</div>}
        </div>

        {/* Where Time Goes */}
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"22px 20px 16px"}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted,marginBottom:4}}>Where Time Goes</div>
          <div style={{fontSize:11.5,color:T.muted,marginBottom:16}}>Project delivery vs. overhead vs. team development</div>
          {totalPeriodHours>0 ? (
            <div style={{display:"flex",gap:20,alignItems:"center"}}>
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={categoryData} dataKey="hours" innerRadius={32} outerRadius={56} paddingAngle={3}>
                    {categoryData.map((d,i)=><Cell key={i} fill={d.color}/>)}
                  </Pie>
                  <Tooltip formatter={v=>fmtH(v)} contentStyle={{background:T.navy,border:"none",borderRadius:8,fontSize:12,color:T.white}}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{display:"grid",gap:10,flex:1}}>
                {categoryData.map(d => {
                  const pct = Math.round((d.hours/totalPeriodHours)*100);
                  return (
                    <div key={d.name}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11.5,fontWeight:600,color:T.text}}>
                          <span style={{width:8,height:8,borderRadius:2,background:d.color,display:"inline-block"}}/>{d.name}
                        </div>
                        <span style={{fontSize:11.5,fontWeight:700,color:d.color}}>{pct}%</span>
                      </div>
                      <div style={{height:5,background:T.cream,borderRadius:3,overflow:"hidden",border:`1px solid ${T.border}`}}>
                        <div style={{width:`${pct}%`,height:"100%",background:d.color,borderRadius:3}}/>
                      </div>
                      <div style={{fontSize:10.5,color:T.muted,marginTop:2}}>{fmtH(d.hours)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : <div style={{padding:"40px 0",textAlign:"center",color:T.muted,fontSize:13}}>No data this month yet.</div>}
        </div>

      </div>

      {/* ── Budget Burn ── */}
      {burnProjects.length>0 && (
        <div style={{background:T.white,border:`1.5px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"16px 22px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:T.muted}}>Hours Budget Burn</div>
            <div style={{fontSize:11,color:T.muted}}>All-time logged vs. estimated</div>
          </div>
          <div style={{padding:"20px 22px",display:"grid",gap:16}}>
            {burnProjects.map(p => {
              const barColor = p.over?"#EF4444":p.burnPct>=80?T.warn:T.success;
              return (
                <div key={p.id}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{width:8,height:8,borderRadius:2,background:p.color,flexShrink:0}}/>
                      <span style={{fontSize:13,fontWeight:600,color:T.text}}>{p.name}</span>
                      {p.over&&<span style={{padding:"1px 7px",borderRadius:99,background:"#FEE2E2",border:"1px solid #FCA5A5",fontSize:9.5,fontWeight:700,color:"#EF4444"}}>Over Budget</span>}
                    </div>
                    <span style={{fontSize:12,color:T.muted}}>{fmtH(p.logged)} <span style={{color:T.muted}}>of</span> {fmtH(p.est)} est. <span style={{color:barColor,fontWeight:700}}>({p.burnPct}%)</span></span>
                  </div>
                  <div style={{height:8,background:T.cream,borderRadius:4,overflow:"hidden",border:`1px solid ${T.border}`}}>
                    <div style={{width:`${p.burnPct}%`,height:"100%",background:barColor,borderRadius:4}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{textAlign:"center",fontSize:11,color:T.muted,paddingBottom:8}}>
        Zumiez PMO · Time Tracking Pilot (Mar 10 – Jun 5, 2026) · Data current as of {now.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}
      </div>

    </div>
  );
}

// ─── WHAT'S NEW ───────────────────────────────────────────────────────────────
function WhatsNew() {
  const [copied, setCopied] = useState(false);
  const latest = CHANGELOG[0];

  function generateReleaseNote(v) {
    const line = "━".repeat(44);
    const sectionHeader = (emoji, label) => `\n${emoji} ${label}`;
    const bullets = arr => arr.map(i => `  • ${i.title} — ${i.desc}`).join("\n");
    const releasedLine = v.released ? `Released: ${v.released}` : `Status: Pending release`;
    let out = `PMO Time Tracker — Release Notes\nv${v.version} · ${v.date}\n${releasedLine}\n${line}\n`;
    if (v.whatsNew.length) out += `${sectionHeader("🆕","WHAT'S NEW")}\n${bullets(v.whatsNew)}\n`;
    if (v.improvements.length) out += `${sectionHeader("✨","IMPROVEMENTS")}\n${bullets(v.improvements)}\n`;
    if (v.removed.length) out += `${sectionHeader("🗑","REMOVED")}\n${bullets(v.removed)}\n`;
    out += `\n${line}\nHOW TO GET v${v.version}\n${line}\n`;
    out += `  1. Ask Natalia for the latest .jsx file and .json data file\n`;
    out += `  2. Go to claude.ai and start a new chat\n`;
    out += `  3. Upload the .jsx file and type: "Render this React component as an artifact"\n`;
    out += `  4. Once rendered, click ↑ Restore and upload the .json file Natalia sent\n`;
    out += `  5. You're in — all your team's data will be loaded\n`;
    out += `${line}\nQuestions? Ping Natalia.`;
    return out;
  }

  function copyLatest() {
    navigator.clipboard.writeText(generateReleaseNote(latest));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const SectionBlock = ({ emoji, label, items, accentColor }) => {
    if (!items.length) return null;
    return (
      <div style={{marginBottom:24}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <span style={{fontSize:16}}>{emoji}</span>
          <span style={{fontSize:11,fontWeight:800,letterSpacing:"0.09em",textTransform:"uppercase",color:accentColor}}>{label}</span>
        </div>
        <div style={{display:"grid",gap:8}}>
          {items.map((item,i) => (
            <div key={i} style={{display:"grid",gridTemplateColumns:"4px 1fr",gap:14,alignItems:"start"}}>
              <div style={{width:4,height:"100%",minHeight:18,background:accentColor,borderRadius:2,marginTop:3}}/>
              <div>
                <span style={{fontSize:13,fontWeight:700,color:T.navy}}>{item.title}</span>
                <span style={{fontSize:12.5,color:T.muted}}> — {item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{display:"grid",gap:20}}>
      {/* Header + Copy button */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:800,color:T.navy,marginBottom:3}}>Release Notes</h2>
          <p style={{fontSize:12.5,color:T.muted}}>What's changed in each version of the PMO Time Tracker</p>
        </div>
        <button onClick={copyLatest}
          style={{padding:"10px 20px",background:copied?T.success:T.navy,border:"none",borderRadius:8,color:T.white,cursor:"pointer",fontSize:13,fontWeight:700,transition:"background 0.2s"}}>
          {copied ? "✓ Copied!" : `📋 Copy v${latest.version} Release Note`}
        </button>
      </div>

      {/* Changelog entries */}
      {CHANGELOG.map((v, vi) => (
        <div key={v.version} style={{background:T.white,border:`1.5px solid ${vi===0?v.tagColor+"55":T.border}`,borderRadius:12,overflow:"hidden"}}>
          {/* Version header */}
          <div style={{background:vi===0?`linear-gradient(135deg,${T.navy} 0%,${T.navyLight} 100%)`:T.cream,padding:"20px 28px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4,flexWrap:"wrap"}}>
                <span style={{fontSize:22,fontWeight:900,color:vi===0?T.white:T.navy,letterSpacing:"-0.02em"}}>v{v.version}</span>
                <span style={{padding:"3px 10px",borderRadius:99,background:v.tagColor,color:T.white,fontSize:10,fontWeight:800,letterSpacing:"0.06em",textTransform:"uppercase"}}>{v.tag}</span>
                {v.released
                  ? <span style={{padding:"3px 10px",borderRadius:99,background:"rgba(45,155,111,0.2)",border:"1px solid rgba(45,155,111,0.4)",color:vi===0?"#6EE7B7":T.success,fontSize:10,fontWeight:700}}>✓ Released {v.released}</span>
                  : <span style={{padding:"3px 10px",borderRadius:99,background:"rgba(240,90,34,0.15)",border:"1px solid rgba(240,90,34,0.35)",color:vi===0?T.orangeLight:T.orange,fontSize:10,fontWeight:700}}>⏳ Pending release</span>
                }
              </div>
              <div style={{fontSize:12,color:vi===0?"rgba(255,255,255,0.5)":T.muted,fontWeight:600}}>{v.date}</div>
            </div>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              {v.whatsNew.length>0&&<div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:vi===0?T.orange:T.navy}}>{v.whatsNew.length}</div><div style={{fontSize:9.5,color:vi===0?"rgba(255,255,255,0.4)":T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em"}}>New</div></div>}
              {v.improvements.length>0&&<div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:vi===0?T.tealLight:T.teal}}>{v.improvements.length}</div><div style={{fontSize:9.5,color:vi===0?"rgba(255,255,255,0.4)":T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em"}}>Improved</div></div>}
              {v.removed.length>0&&<div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:vi===0?"#FC8181":"#EF4444"}}>{v.removed.length}</div><div style={{fontSize:9.5,color:vi===0?"rgba(255,255,255,0.4)":T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em"}}>Removed</div></div>}
            </div>
          </div>
          {/* Sections */}
          <div style={{padding:"24px 28px"}}>
            <SectionBlock emoji="🆕" label="What's New" items={v.whatsNew} accentColor={T.orange}/>
            <SectionBlock emoji="✨" label="Improvements" items={v.improvements} accentColor={T.teal}/>
            <SectionBlock emoji="🗑" label="Removed" items={v.removed} accentColor={T.muted}/>
            {vi===0&&(
              <div style={{marginTop:16,padding:"16px 20px",background:T.cream,borderRadius:9,border:`1px solid ${T.border}`}}>
                <div style={{fontSize:10,fontWeight:800,letterSpacing:"0.09em",textTransform:"uppercase",color:T.muted,marginBottom:10}}>How to get v{v.version}</div>
                {["Ask Natalia for the latest .jsx file and .json data file","Go to claude.ai and start a new chat","Upload the .jsx file and type: \"Render this React component as an artifact\"","Once rendered, click ↑ Restore and upload the .json file Natalia sent","You're in — all your team's data will be loaded"].map((step,i)=>(
                  <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:i<4?8:0}}>
                    <div style={{width:20,height:20,borderRadius:"50%",background:T.navy,color:T.white,fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{i+1}</div>
                    <span style={{fontSize:12.5,color:T.text,lineHeight:1.5}}>{step}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
const TABS = [
  {id:"dashboard",label:"Dashboard",icon:"◈"},
  {id:"log",label:"Log Time",icon:"+"},
  {id:"entries",label:"All Entries",icon:"≡"},
  {id:"team",label:"Team",icon:"◉"},
  {id:"projects",label:"Projects",icon:"⬡"},
  {id:"bigideas",label:"Big Ideas",icon:"💡"},
  {id:"capacity",label:"Capacity",icon:"⚡"},
  {id:"exec",label:"Exec View",icon:"📊"},
  {id:"whatsnew",label:"Release Notes",icon:"★"},
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [entries, setEntries] = useState(SEED);
  const [projects, setProjects] = useState(INIT_PROJECTS);
  const [globalIdeas, setGlobalIdeas] = useState(INIT_GLOBAL_IDEAS);
  const [showDataModal, setShowDataModal] = useState(false); // "export" | "import" | false
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const [saveStatus, setSaveStatus] = useState(""); // "saving" | "saved" | ""
  const [exportFallbackJson, setExportFallbackJson] = useState("");
  const [mergePreview, setMergePreview] = useState(null); // { toAdd, skipped, name, dateMin, dateMax, projectChanges }
  const [mergeProjectSelections, setMergeProjectSelections] = useState({}); // { [projectId]: true|false }
  const isFirstLoad = useRef(true);
  const saveTimer = useRef(null);

  // ── Load from disk on mount ──────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/data")
      .then(r => r.json())
      .then(data => {
        if (data && data.entries && data.projects && data.globalIdeas) {
          setEntries(data.entries);
          setProjects(data.projects);
          setGlobalIdeas(data.globalIdeas);
        }
        isFirstLoad.current = false;
      })
      .catch(() => { isFirstLoad.current = false; });
  }, []);

  // ── Auto-save to disk on change (1s debounce) ────────────────────────────
  useEffect(() => {
    if (isFirstLoad.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = setTimeout(() => {
      const snapshot = {
        version: "1.0",
        savedAt: new Date().toISOString(),
        entries,
        projects,
        globalIdeas,
      };
      fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot, null, 2),
      }).then(() => {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus(""), 2000);
      });
    }, 1000);
  }, [entries, projects, globalIdeas]);

  function exportAll() {
    const snapshot = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      entries,
      projects,
      globalIdeas,
    };
    const json = JSON.stringify(snapshot, null, 2);
    try {
      // Try native download first (works on local Vite server)
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pmo-tracker-backup-${today()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback for sandboxed environments (Claude artifact) — show copy modal
      setExportFallbackJson(json);
      setShowDataModal("export-fallback");
    }
  }

  function importAll(jsonText) {
    try {
      const data = JSON.parse(jsonText);
      if (!data.entries || !data.projects || !data.globalIdeas) {
        setImportError("Invalid file — missing entries, projects, or globalIdeas. Make sure you're using a file exported from this tool.");
        return;
      }
      setEntries(data.entries);
      setProjects(data.projects);
      setGlobalIdeas(data.globalIdeas);
      setImportSuccess(`✓ Loaded ${data.entries.length} entries, ${data.projects.length} projects, ${data.globalIdeas.length} Big Ideas${data.exportedAt ? " · Exported " + new Date(data.exportedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : ""}`);
      setImportError("");
      setTimeout(() => { setShowDataModal(false); setImportText(""); setImportSuccess(""); }, 2200);
    } catch(e) {
      setImportError("Could not parse file — make sure it's a valid JSON backup from this tool.");
    }
  }

  function handleMergeFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.entries) { alert("Invalid file — no entries found."); return; }

        // ── Entries: only pull non-Natalia entries ──────────────────────────
        const incoming = data.entries.filter(e => e.person !== "natalia");
        if (!incoming.length) { alert("No team member entries found in this file. Make sure Cara or Quin exported their own data."); return; }
        const persons = [...new Set(incoming.map(e => e.person))];
        const memberNames = persons.map(p => TEAM.find(t => t.id === p)?.name || p).join(" & ");
        const existingIds = new Set(entries.map(e => e.id));
        const toAdd = incoming.filter(e => !existingIds.has(e.id));
        const skipped = incoming.length - toAdd.length;
        const dates = toAdd.map(e => e.date).sort();

        // ── Projects: detect new + changed ──────────────────────────────────
        const COMPARE_FIELDS = ["name","status","priority","endDate","startDate","description","sponsor","color","pm"];
        const projectChanges = [];
        if (data.projects) {
          data.projects.forEach(inProj => {
            const existing = projects.find(p => p.id === inProj.id);
            if (!existing) {
              projectChanges.push({ type:"new", project: inProj, changes: [] });
            } else {
              const changed = COMPARE_FIELDS.filter(f => (inProj[f]||"") !== (existing[f]||""))
                .map(f => ({ field: f, from: existing[f]||"—", to: inProj[f]||"—" }));
              if (changed.length) projectChanges.push({ type:"updated", project: inProj, existing, changes: changed });
            }
          });
        }

        // Default: new projects accepted, changed projects rejected (protect local edits)
        const defaultSelections = {};
        projectChanges.forEach(c => { defaultSelections[c.project.id] = c.type === "new"; });
        setMergeProjectSelections(defaultSelections);
        setMergePreview({ toAdd, skipped, persons, name: memberNames,
          dateMin: dates[0], dateMax: dates[dates.length-1], projectChanges });
        setShowDataModal("merge-preview");
      } catch(err) {
        alert("Could not read file — make sure it's a valid JSON backup.");
      }
    };
    reader.readAsText(file);
  }

  function confirmMerge() {
    if (!mergePreview) return;
    // Add entries
    setEntries(prev => [...prev, ...mergePreview.toAdd]);
    // Apply accepted project changes
    const accepted = mergePreview.projectChanges.filter(c => mergeProjectSelections[c.project.id]);
    if (accepted.length) {
      setProjects(prev => {
        let updated = [...prev];
        accepted.forEach(c => {
          if (c.type === "new") {
            updated.push(c.project);
          } else {
            updated = updated.map(p => p.id === c.project.id ? { ...p, ...c.project } : p);
          }
        });
        return updated;
      });
    }
    setMergePreview(null);
    setMergeProjectSelections({});
    setShowDataModal(false);
  }

  function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      // Auto-load immediately on file select — no extra button click needed
      importAll(ev.target.result);
    };
    reader.readAsText(file);
  }
  const weekH = entries.filter(e=>e.date>=getWeekStart()).reduce((s,e)=>s+e.hours,0);
  const weekEntries = entries.filter(e=>e.date>=getWeekStart()).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:${T.cream};font-family:'Sora',sans-serif;}
        input:focus,select:focus,textarea:focus{border-color:${T.navy}!important;box-shadow:0 0 0 3px rgba(11,28,46,0.08)!important;outline:none;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:${T.cream};}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px;}
        button:active{transform:scale(0.97);}
      `}</style>
      <div style={{display:"flex",minHeight:"100vh",background:T.cream}}>
        {/* Sidebar */}
        <div style={{width:220,background:T.navy,display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0,height:"100vh"}}>
          <div style={{padding:"22px 20px 18px",borderBottom:`1px solid ${T.navyLight}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,borderRadius:9,background:T.orange,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>⏱</div>
              <div>
                <div style={{fontSize:13.5,fontWeight:800,color:T.white,letterSpacing:"0.01em",lineHeight:1.2}}>PMO Tracker</div>
                <div style={{fontSize:9.5,color:T.orange,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:1}}>Zumiez</div>
              </div>
            </div>
          </div>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.navyLight}`}}>
            <div style={{fontSize:9.5,color:"rgba(255,255,255,0.35)",fontWeight:700,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:6}}>This Week</div>
            <div style={{fontSize:24,fontWeight:800,color:T.white,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"-0.02em"}}>{fmtH(weekH)}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:2}}>{weekEntries} entries logged</div>
            <div style={{height:3,background:T.navyLight,borderRadius:2,marginTop:10,overflow:"hidden"}}>
              <div style={{width:`${Math.min((weekH/120)*100,100)}%`,height:"100%",background:T.orange,borderRadius:2}}/>
            </div>
          </div>
          <nav style={{padding:"10px 10px",flex:1,overflowY:"auto"}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)}
                style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 12px",borderRadius:8,border:"none",background:tab===t.id?T.orange:"transparent",color:tab===t.id?T.white:"rgba(255,255,255,0.45)",cursor:"pointer",fontSize:13,fontWeight:tab===t.id?700:500,marginBottom:2,textAlign:"left"}}>
                <span style={{fontSize:14,width:18,textAlign:"center",flexShrink:0}}>{t.icon}</span>{t.label}
              </button>
            ))}
          </nav>
          <div style={{padding:"12px 14px",borderTop:`1px solid ${T.navyLight}`}}>
            {saveStatus && (
              <div style={{textAlign:"center",fontSize:10,fontWeight:700,letterSpacing:"0.06em",marginBottom:6,color:saveStatus==="saved"?T.teal:"rgba(255,255,255,0.4)"}}>
                {saveStatus==="saving" ? "● saving…" : "✓ saved to disk"}
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6}}>
              <button onClick={exportAll}
                style={{padding:"8px 6px",background:T.teal,border:"none",borderRadius:7,color:T.white,cursor:"pointer",fontSize:11,fontWeight:700,textAlign:"center"}}>
                ↓ Backup
              </button>
              <button onClick={()=>{setShowDataModal("import");setImportText("");setImportError("");setImportSuccess("");}}
                style={{padding:"8px 6px",background:"rgba(255,255,255,0.1)",border:`1px solid rgba(255,255,255,0.15)`,borderRadius:7,color:"rgba(255,255,255,0.7)",cursor:"pointer",fontSize:11,fontWeight:700,textAlign:"center"}}>
                ↑ Restore
              </button>
            </div>
            <label style={{display:"block",padding:"8px 6px",background:"rgba(139,92,246,0.25)",border:"1px solid rgba(139,92,246,0.4)",borderRadius:7,color:"rgba(255,255,255,0.85)",cursor:"pointer",fontSize:11,fontWeight:700,textAlign:"center"}}>
              ⤵ Merge Team Data
              <input type="file" accept=".json" onChange={handleMergeFile} style={{display:"none"}}/>
            </label>
          </div>
          <div style={{padding:"14px 20px 20px",borderTop:`1px solid ${T.navyLight}`}}>
            <div style={{fontSize:9.5,color:"rgba(255,255,255,0.3)",fontWeight:700,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:10}}>Team</div>
            {TEAM.map(t=>{
              const wh=entries.filter(e=>e.person===t.id&&e.date>=getWeekStart()).reduce((s,e)=>s+e.hours,0);
              return (
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:9,marginBottom:8}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:t.color+"33",border:`2px solid ${t.color}66`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11.5,fontWeight:800,color:t.color,flexShrink:0}}>{t.name[0]}</div>
                  <div>
                    <div style={{fontSize:11.5,color:"rgba(255,255,255,0.7)",fontWeight:600,lineHeight:1.2}}>{t.name.split(" ")[0]}</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>{fmtH(wh)} this wk</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Main */}
        <div style={{flex:1,padding:"28px 30px",overflowY:"auto",minWidth:0}}>
          <div style={{marginBottom:22}}>
            <h1 style={{fontSize:22,fontWeight:800,color:T.navy,letterSpacing:"-0.02em"}}>{TABS.find(t=>t.id===tab)?.label}</h1>
            <div style={{fontSize:12,color:T.muted,marginTop:3}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</div>
          </div>
          {tab==="dashboard" && <Dashboard entries={entries} setEntries={setEntries} projects={projects} globalIdeas={globalIdeas}/>}
          {tab==="log" && <LogTime entries={entries} setEntries={setEntries} projects={projects} globalIdeas={globalIdeas}/>}
          {tab==="entries" && <AllEntries entries={entries} setEntries={setEntries} projects={projects} globalIdeas={globalIdeas}/>}
          {tab==="team" && <TeamView entries={entries} projects={projects} globalIdeas={globalIdeas}/>}
          {tab==="projects" && <ProjectsPanel projects={projects} setProjects={setProjects} entries={entries} globalIdeas={globalIdeas}/>}
          {tab==="bigideas" && <BigIdeasTab globalIdeas={globalIdeas} setGlobalIdeas={setGlobalIdeas} projects={projects} entries={entries}/>}
          {tab==="capacity" && <CapacityForecasting entries={entries}/>}
          {tab==="exec" && <ExecView entries={entries} projects={projects}/>}
          {tab==="whatsnew" && <WhatsNew/>}
        </div>
      </div>

      {/* ── Import Modal ── */}
      {showDataModal === "import" && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}
          onClick={()=>setShowDataModal(false)}>
          <div style={{background:T.white,borderRadius:16,padding:"28px 32px",width:520,maxWidth:"90vw",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}
            onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <div style={{fontSize:17,fontWeight:800,color:T.navy}}>↑ Import Backup</div>
                <div style={{fontSize:12,color:T.muted,marginTop:3}}>Restore a full session — entries, projects, and Big Ideas</div>
              </div>
              <button onClick={()=>setShowDataModal(false)} style={{background:"transparent",border:"none",fontSize:20,color:T.muted,cursor:"pointer",lineHeight:1}}>✕</button>
            </div>

            {/* File upload */}
            <div style={{border:`2px dashed ${T.border}`,borderRadius:10,padding:"20px",textAlign:"center",marginBottom:16,background:T.cream}}>
              <div style={{fontSize:28,marginBottom:8}}>📁</div>
              <div style={{fontSize:13,fontWeight:600,color:T.navy,marginBottom:6}}>Drop your backup JSON here or click to browse</div>
              <div style={{fontSize:11.5,color:T.muted,marginBottom:12}}>File should be named <code>pmo-tracker-backup-YYYY-MM-DD.json</code></div>
              <input type="file" accept=".json" onChange={handleImportFile}
                style={{display:"block",margin:"0 auto",fontSize:12,color:T.muted}}/>
            </div>

            {/* Or paste JSON */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Or paste JSON directly</div>
              <textarea
                value={importText}
                onChange={e=>{setImportText(e.target.value);setImportError("");setImportSuccess("");}}
                placeholder='{"version":"1.0","entries":[...],"projects":[...],"globalIdeas":[...]}'
                rows={5}
                style={{...INP,fontSize:11.5,fontFamily:"'JetBrains Mono',monospace",resize:"vertical",lineHeight:1.6}}
              />
            </div>

            {importError && <div style={{background:"#FEE2E2",border:"1px solid #FCA5A5",borderRadius:8,padding:"10px 14px",fontSize:12.5,color:"#B91C1C",marginBottom:14}}>{importError}</div>}
            {importSuccess && <div style={{background:"#D1FAE5",border:"1px solid #6EE7B7",borderRadius:8,padding:"10px 14px",fontSize:12.5,color:"#065F46",fontWeight:600,marginBottom:14}}>{importSuccess}</div>}

            <div style={{display:"flex",gap:10}}>
              <button
                onClick={()=>importAll(importText)}
                disabled={!importText.trim()}
                style={{flex:1,padding:"11px",background:importText.trim()?T.teal:"#ccc",border:"none",borderRadius:8,color:T.white,cursor:importText.trim()?"pointer":"not-allowed",fontSize:13.5,fontWeight:700}}>
                Load Data
              </button>
              <button onClick={()=>setShowDataModal(false)}
                style={{padding:"11px 20px",border:`1.5px solid ${T.border}`,borderRadius:8,background:"transparent",color:T.muted,cursor:"pointer",fontSize:13}}>
                Cancel
              </button>
            </div>

            <div style={{marginTop:16,padding:"12px 14px",background:T.cream,borderRadius:8,fontSize:11.5,color:T.muted,lineHeight:1.7}}>
              ⚠️ <strong>This will replace all current data</strong> — entries, projects, and Big Ideas will be overwritten with the imported file. Export first if you want to save what's currently loaded.
            </div>
          </div>
        </div>
      )}

      {/* ── Merge Preview Modal ── */}
      {showDataModal === "merge-preview" && mergePreview && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}
          onClick={()=>{setShowDataModal(false);setMergePreview(null);}}>
          <div style={{background:T.white,borderRadius:16,padding:"28px 32px",width:500,maxWidth:"90vw",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}
            onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <div style={{fontSize:17,fontWeight:800,color:T.navy}}>⤵ Merge Team Data</div>
                <div style={{fontSize:12,color:T.muted,marginTop:3}}>Review before merging — this adds entries without replacing your data</div>
              </div>
              <button onClick={()=>{setShowDataModal(false);setMergePreview(null);}} style={{background:"transparent",border:"none",fontSize:20,color:T.muted,cursor:"pointer",lineHeight:1}}>✕</button>
            </div>

            {/* Preview summary */}
            <div style={{background:"#F0FDF4",border:"1px solid #86EFAC",borderRadius:10,padding:"16px 18px",marginBottom:16}}>
              <div style={{fontSize:14,fontWeight:800,color:"#166534",marginBottom:10}}>
                ✓ Ready to merge {mergePreview.toAdd.length} entries from {mergePreview.name}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                <div style={{background:"white",borderRadius:8,padding:"10px 12px",textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:900,color:T.navy}}>{mergePreview.toAdd.length}</div>
                  <div style={{fontSize:11,color:T.muted,marginTop:2}}>New entries</div>
                </div>
                <div style={{background:"white",borderRadius:8,padding:"10px 12px",textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:900,color:T.navy}}>{mergePreview.skipped}</div>
                  <div style={{fontSize:11,color:T.muted,marginTop:2}}>Already exist (skip)</div>
                </div>
                <div style={{background:"white",borderRadius:8,padding:"10px 12px",textAlign:"center"}}>
                  <div style={{fontSize:13,fontWeight:800,color:T.navy,lineHeight:1.3}}>{mergePreview.dateMin}<br/>→ {mergePreview.dateMax}</div>
                  <div style={{fontSize:11,color:T.muted,marginTop:2}}>Date range</div>
                </div>
              </div>
            </div>

            {/* Who + hours */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              <div style={{background:T.cream,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.muted,lineHeight:1.7}}>
                👤 <strong>Source:</strong> {mergePreview.name}<br/>
                🔒 Your existing entries stay untouched
              </div>
              <div style={{padding:"10px 14px",background:"#EEF2FF",borderRadius:8,fontSize:12,color:"#3730A3",lineHeight:1.7}}>
                📊 <strong>{mergePreview.toAdd.reduce((s,e)=>s+e.hours,0).toFixed(1)}h</strong> total hours added<br/>
                📁 {mergePreview.toAdd.length} entries · {mergePreview.skipped} skipped
              </div>
            </div>

            {/* Project changes */}
            {mergePreview.projectChanges.length > 0 && (
              <div style={{marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:800,color:T.navy,marginBottom:4}}>
                  Project Changes ({mergePreview.projectChanges.length})
                </div>
                <div style={{fontSize:11,color:T.muted,marginBottom:8,background:"#FEF3C7",border:"1px solid #FDE68A",borderRadius:7,padding:"7px 10px"}}>
                  ⚠️ <strong style={{color:"#92400E"}}>New projects</strong> are pre-checked. <strong style={{color:"#92400E"}}>Updated projects</strong> are unchecked by default — your local edits are protected. Toggle to override.
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:220,overflowY:"auto"}}>
                  {mergePreview.projectChanges.map(c => (
                    <div key={c.project.id}
                      style={{borderRadius:9,border:`1.5px solid ${mergeProjectSelections[c.project.id]?T.teal:T.border}`,padding:"10px 14px",background:mergeProjectSelections[c.project.id]?"#F0FDF4":"#FAFAFA",cursor:"pointer"}}
                      onClick={()=>setMergeProjectSelections(prev=>({...prev,[c.project.id]:!prev[c.project.id]}))}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom: c.changes.length?6:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:10,height:10,borderRadius:2,background:c.project.color||T.navy,flexShrink:0}}/>
                          <span style={{fontSize:13,fontWeight:700,color:T.navy}}>{c.project.name}</span>
                          <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:4,
                            background:c.type==="new"?"#DBEAFE":"#FEF9C3",
                            color:c.type==="new"?"#1E40AF":"#92400E"}}>
                            {c.type==="new"?"NEW PROJECT":"UPDATED"}
                          </span>
                        </div>
                        <div style={{width:20,height:20,borderRadius:50,border:`2px solid ${mergeProjectSelections[c.project.id]?T.teal:T.border}`,background:mergeProjectSelections[c.project.id]?T.teal:"white",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:11,fontWeight:800,flexShrink:0}}>
                          {mergeProjectSelections[c.project.id]?"✓":""}
                        </div>
                      </div>
                      {c.changes.length > 0 && (
                        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:4}}>
                          {c.changes.map(ch => (
                            <span key={ch.field} style={{fontSize:10.5,background:"white",border:`1px solid ${T.border}`,borderRadius:5,padding:"2px 7px",color:T.muted}}>
                              <strong style={{color:T.navy}}>{ch.field}:</strong> {String(ch.from).slice(0,18)} → <strong style={{color:T.teal}}>{String(ch.to).slice(0,18)}</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mergePreview.projectChanges.length === 0 && (
              <div style={{marginBottom:16,padding:"10px 14px",background:T.cream,borderRadius:8,fontSize:12,color:T.muted}}>
                ✓ No project changes detected — projects are in sync
              </div>
            )}

            <div style={{display:"flex",gap:10}}>
              <button onClick={confirmMerge}
                style={{flex:1,padding:"11px",background:"#7C3AED",border:"none",borderRadius:8,color:T.white,cursor:"pointer",fontSize:13.5,fontWeight:700}}>
                ✓ Merge {mergePreview.toAdd.length} Entries
                {Object.values(mergeProjectSelections).filter(Boolean).length > 0 && ` + ${Object.values(mergeProjectSelections).filter(Boolean).length} Project Changes`}
              </button>
              <button onClick={()=>{setShowDataModal(false);setMergePreview(null);setMergeProjectSelections({});}}
                style={{padding:"11px 20px",border:`1.5px solid ${T.border}`,borderRadius:8,background:"transparent",color:T.muted,cursor:"pointer",fontSize:13}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Export Fallback Modal (sandboxed environments) ── */}
      {showDataModal === "export-fallback" && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}
          onClick={()=>setShowDataModal(false)}>
          <div style={{background:T.white,borderRadius:16,padding:"28px 32px",width:560,maxWidth:"90vw",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}
            onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div>
                <div style={{fontSize:17,fontWeight:800,color:T.navy}}>↓ Your Backup JSON</div>
                <div style={{fontSize:12,color:T.muted,marginTop:3}}>Download unavailable in this environment — copy the text below and save as a <code>.json</code> file</div>
              </div>
              <button onClick={()=>setShowDataModal(false)} style={{background:"transparent",border:"none",fontSize:20,color:T.muted,cursor:"pointer",lineHeight:1}}>✕</button>
            </div>
            <textarea
              readOnly
              value={exportFallbackJson}
              rows={12}
              style={{...INP,fontSize:11,fontFamily:"'JetBrains Mono',monospace",resize:"vertical",lineHeight:1.5,marginBottom:12}}
              onFocus={e=>e.target.select()}
            />
            <div style={{display:"flex",gap:10}}>
              <button
                onClick={()=>{ navigator.clipboard.writeText(exportFallbackJson).catch(()=>{}); }}
                style={{flex:1,padding:"11px",background:T.navy,border:"none",borderRadius:8,color:T.white,cursor:"pointer",fontSize:13.5,fontWeight:700}}>
                📋 Copy to Clipboard
              </button>
              <button onClick={()=>setShowDataModal(false)}
                style={{padding:"11px 20px",border:`1.5px solid ${T.border}`,borderRadius:8,background:"transparent",color:T.muted,cursor:"pointer",fontSize:13}}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
