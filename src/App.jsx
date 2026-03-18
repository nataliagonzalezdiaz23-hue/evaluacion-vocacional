import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════
// FIREBASE CONFIG — REEMPLAZA CON TUS DATOS (ver GUIA.md)
// ═══════════════════════════════════════════════════════
const DB_URL = "https://evaluacion-pablo-neruda-default-rtdb.firebaseio.com";

// ── Firebase REST helpers (no SDK needed) ──
const fbGet = async (path) => {
  try {
    const r = await fetch(`${DB_URL}/${path}.json`);
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
};
const fbSet = async (path, data) => {
  try {
    await fetch(`${DB_URL}/${path}.json`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  } catch (e) { console.error(e); }
};

// ═══════════════════════════════════════
// INSTRUMENT DATA
// ═══════════════════════════════════════

const ROSENBERG_ITEMS = [
  { id: 1, text: "Me siento una persona tan valiosa como las otras", reversed: false },
  { id: 2, text: "Generalmente me inclino a pensar que soy un fracaso", reversed: true },
  { id: 3, text: "Creo que tengo algunas cualidades buenas", reversed: false },
  { id: 4, text: "Soy capaz de hacer las cosas tan bien como los demás", reversed: false },
  { id: 5, text: "Creo que no tengo mucho de lo que estar orgulloso", reversed: true },
  { id: 6, text: "Tengo una actitud positiva hacia mí mismo", reversed: false },
  { id: 7, text: "En general me siento satisfecho conmigo mismo", reversed: false },
  { id: 8, text: "Me gustaría tener más respeto por mí mismo", reversed: true },
  { id: 9, text: "Realmente me siento inútil en algunas ocasiones", reversed: true },
  { id: 10, text: "A veces pienso que no sirvo para nada", reversed: true },
];
const ROSENBERG_OPTIONS = [
  { value: 1, label: "Muy en desacuerdo" },
  { value: 2, label: "En desacuerdo" },
  { value: 3, label: "De acuerdo" },
  { value: 4, label: "Muy de acuerdo" },
];

const MSPSS_ITEMS = [
  { id: 1, text: "Hay una persona especial que está cerca cuando lo necesito", sub: "otros" },
  { id: 2, text: "Hay una persona especial con quien puedo compartir alegrías y tristezas", sub: "otros" },
  { id: 3, text: "Mi familia realmente intenta ayudarme", sub: "familia" },
  { id: 4, text: "Recibo la ayuda emocional y el apoyo que necesito de mi familia", sub: "familia" },
  { id: 5, text: "Tengo una persona especial que es una verdadera fuente de consuelo para mí", sub: "otros" },
  { id: 6, text: "Mis amigos realmente tratan de ayudarme", sub: "amigos" },
  { id: 7, text: "Puedo contar con mis amigos cuando las cosas van mal", sub: "amigos" },
  { id: 8, text: "Puedo hablar de mis problemas con mi familia", sub: "familia" },
  { id: 9, text: "Tengo amigos con quienes puedo compartir alegrías y tristezas", sub: "amigos" },
  { id: 10, text: "Hay una persona especial en mi vida a quien le importo", sub: "otros" },
  { id: 11, text: "Mi familia está dispuesta a ayudarme a tomar decisiones", sub: "familia" },
  { id: 12, text: "Puedo hablar de mis problemas con mis amigos", sub: "amigos" },
];
const MSPSS_OPTIONS = [
  { value: 1, label: "1 – Muy en desacuerdo" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4 – Ni de acuerdo ni en desacuerdo" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7 – Muy de acuerdo" },
];

const AETDC_ITEMS = [
  { id: 1, text: "Hacer un listado de profesiones en las que estés interesado/a", sub: "autoconocimiento" },
  { id: 2, text: "Describir los aspectos claves que para ti tienen más importancia en una profesión", sub: "autoconocimiento" },
  { id: 3, text: "Reconocer qué habilidades son más convenientes para alcanzar tus objetivos profesionales", sub: "autoconocimiento" },
  { id: 4, text: "Elegir unos estudios o profesión que concuerden con tus capacidades e intereses", sub: "autoconocimiento" },
  { id: 5, text: "Identificar qué tipo de trabajos te interesan, en los que se manejan números, las relaciones personales, etc.", sub: "autoconocimiento" },
  { id: 6, text: "Elegir una única opción académica o profesional de una lista de alternativas que estés considerando", sub: "metas" },
  { id: 7, text: "Enumerar tus metas profesionales justificándolas con el ajuste entre las mismas y tus características personales", sub: "metas" },
  { id: 8, text: "Elegir una profesión que conecte con el estilo de vida que quieres llevar", sub: "metas" },
  { id: 9, text: "Tomar decisiones con seguridad en relación con tus metas profesionales", sub: "metas" },
  { id: 10, text: "Elegir una profesión que conecte con tus metas profesionales", sub: "metas" },
  { id: 11, text: "Hacer una planificación de tus metas profesionales para los próximos cinco años", sub: "planificacion" },
  { id: 12, text: "Escribir los pasos que tienes que dar para estudiar lo que quieres y trabajar en lo que deseas", sub: "planificacion" },
  { id: 13, text: "Planificar tu futuro profesional", sub: "planificacion" },
  { id: 14, text: "Secuenciar tareas que debes realizar para acceder a los estudios que desees y/o solicitar trabajo", sub: "planificacion" },
  { id: 15, text: "Realizar un itinerario académico y profesional que te guíe hasta la consecución de tus objetivos profesionales", sub: "planificacion" },
  { id: 16, text: "Planificar la recogida de información sobre empresas o instituciones que podrían ser importantes para encontrar trabajo", sub: "planificacion" },
  { id: 17, text: "Luchar por lograr tus metas profesionales a pesar de los problemas", sub: "conflictos_internos" },
  { id: 18, text: "Ante una dificultad, analizar objetivamente los pros y contras de esa situación y generar alternativas", sub: "conflictos_internos" },
  { id: 19, text: "Especificar qué posibles sacrificios y ventajas personales puede conllevar tu elección académico/profesional", sub: "conflictos_internos" },
  { id: 20, text: "Generar estrategias para enfrentarte a un posible fracaso académico o profesional", sub: "conflictos_internos" },
  { id: 21, text: "Escoger unos estudios y/o una profesión que tú quieres, aunque tu familia no lo apruebe", sub: "conflictos_externos" },
  { id: 22, text: "Defender ante tu familia y amigos tu decisión académico-profesional aún cuando ellos opinan que debes hacer otra cosa", sub: "conflictos_externos" },
  { id: 23, text: "Encontrar información sobre las instituciones o empresas que contratan personas con los estudios que te interesan", sub: "informacion" },
  { id: 24, text: "Encontrar información sobre los lugares que ofrecen la formación o el trabajo que te interesa", sub: "informacion" },
  { id: 25, text: "Nombrar algunas fuentes de información sobre los estudios y profesiones a los que puedes acceder", sub: "informacion" },
  { id: 26, text: "Conseguir información sobre las oportunidades de trabajo que tienes con los estudios que has elegido o elegirás", sub: "informacion" },
  { id: 27, text: "Buscar información sobre las tendencias de empleo en las profesiones en las que estás interesado", sub: "informacion" },
  { id: 28, text: "Encontrar el mayor número de información sobre las profesiones que te interesan", sub: "informacion" },
  { id: 29, text: "Buscar información sobre estudios y profesiones, a través de personas que estén dentro de ese mundo", sub: "informacion" },
  { id: 30, text: "Encontrar información sobre los centros que imparten los estudios en los que estás interesado/a", sub: "informacion" },
];
const AETDC_OPTIONS = [
  { value: 1, label: "1 – Ninguna habilidad" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7 – Mucha habilidad" },
];

// ═══════════════════════════════════════
// ENCUESTA DE PERCEPCIÓN FINAL (8 preguntas abiertas)
// ═══════════════════════════════════════
const PERCEPCION_ITEMS = [
  { id: 1, text: "¿Cómo describirías con tus propias palabras lo que viviste durante estas sesiones?", bloque: "Experiencia general" },
  { id: 2, text: "¿Qué actividad o momento te pareció más significativo y por qué?", bloque: "Propuesta pedagógica" },
  { id: 3, text: "¿Cómo te sentiste contigo mismo/a durante el proceso? ¿Reconociste alguna fortaleza que antes no habías notado?", bloque: "Autoestima" },
  { id: 4, text: "¿Cambió algo en la claridad que tenías sobre tu futuro después del grado 11? ¿Qué te ayudó a eso?", bloque: "Toma de decisiones vocacionales" },
  { id: 5, text: "¿Sentiste el apoyo de tus compañeros, docentes o familia durante el proceso? ¿Cómo se manifestó?", bloque: "Apoyo social" },
  { id: 6, text: "¿Las herramientas digitales que usaron te ayudaron a explorar tus intereses y opciones? ¿Por qué sí o por qué no?", bloque: "TIC y formas de aprender" },
  { id: 7, text: "¿Qué cambiarías o mejorarías de la experiencia?", bloque: "Retroalimentación" },
  { id: 8, text: "¿Qué te llevas de esto para tu vida?", bloque: "Cierre y reflexión" },
];

// ═══════════════════════════════════════
// SCORING
// ═══════════════════════════════════════
const scoreRosenberg = (ans) => {
  let t = 0;
  ROSENBERG_ITEMS.forEach((it) => { const v = ans[it.id]; if (v != null) t += it.reversed ? (5 - v) : v; });
  return { total: t, level: t >= 30 ? "Alta" : t >= 20 ? "Media" : "Baja", max: 40 };
};

const scoreMSPSS = (ans) => {
  const s = { familia: [], amigos: [], otros: [] };
  MSPSS_ITEMS.forEach((it) => { if (ans[it.id] != null) s[it.sub].push(ans[it.id]); });
  const avg = (a) => a.length ? +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : 0;
  const total = Object.values(ans).reduce((x, y) => x + y, 0);
  return { total, familia: avg(s.familia), amigos: avg(s.amigos), otros: avg(s.otros), promedio: +(total / 12).toFixed(1), level: total / 12 >= 5 ? "Alto" : total / 12 >= 3 ? "Medio" : "Bajo", max: 84 };
};

const scoreAETDC = (ans) => {
  const s = { autoconocimiento: [], metas: [], planificacion: [], conflictos_internos: [], conflictos_externos: [], informacion: [] };
  AETDC_ITEMS.forEach((it) => { if (ans[it.id] != null) s[it.sub].push(ans[it.id]); });
  const avg = (a) => a.length ? +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : 0;
  const total = Object.values(ans).reduce((x, y) => x + y, 0);
  return { total, autoconocimiento: avg(s.autoconocimiento), metas: avg(s.metas), planificacion: avg(s.planificacion), conflictos_internos: avg(s.conflictos_internos), conflictos_externos: avg(s.conflictos_externos), informacion: avg(s.informacion), promedio: +(total / 30).toFixed(1), level: total / 30 >= 5 ? "Alta" : total / 30 >= 3 ? "Media" : "Baja", max: 210 };
};

// ═══════════════════════════════════════
// GROUP MAPPING (students see A/B, admin sees 11-01/11-02)
// ═══════════════════════════════════════
const GROUP_MAP = { "A": "11-01", "B": "11-02" };
const GROUP_DISPLAY = { "11-01": "A", "11-02": "B" };

// ═══════════════════════════════════════
// COLORS
// ═══════════════════════════════════════
const C = {
  bg: "#0a0f1c", card: "#111827", accent: "#f59e0b", accentLight: "#fbbf24", accentDark: "#d97706",
  green: "#10b981", greenDark: "#059669", red: "#ef4444", blue: "#3b82f6", purple: "#8b5cf6",
  text: "#f1f5f9", muted: "#94a3b8", dim: "#64748b", border: "#1e293b", input: "#0f172a",
};

// ═══════════════════════════════════════
// SMALL COMPONENTS
// ═══════════════════════════════════════
const ProgressBar = ({ current, total, color = C.accent }) => (
  <div style={{ width: "100%", height: 6, background: C.border, borderRadius: 3, overflow: "hidden", marginBottom: 16 }}>
    <div style={{ width: `${(current / total) * 100}%`, height: "100%", background: `linear-gradient(90deg,${color},${C.accentLight})`, borderRadius: 3, transition: "width .4s" }} />
  </div>
);

const LikertItem = ({ item, options, value, onChange, idx, total }) => (
  <div style={{ background: C.card, borderRadius: 12, padding: "20px 24px", marginBottom: 12, border: `1px solid ${value != null ? C.accent + "40" : C.border}`, transition: "all .3s" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
      <span style={{ color: C.muted, fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>ÍTEM {idx + 1} DE {total}</span>
      {value != null && <span style={{ color: C.green, fontSize: 12 }}>✓</span>}
    </div>
    <p style={{ color: C.text, fontSize: 15, lineHeight: 1.5, marginBottom: 16 }}>{item.text}</p>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(item.id, o.value)} style={{
          flex: "1 1 auto", minWidth: 80, padding: "10px 14px", borderRadius: 8,
          border: `2px solid ${value === o.value ? C.accent : C.border}`,
          background: value === o.value ? C.accent + "20" : C.input,
          color: value === o.value ? C.accent : C.muted,
          fontSize: 13, fontWeight: value === o.value ? 600 : 400, cursor: "pointer", transition: "all .2s",
        }}>{o.label}</button>
      ))}
    </div>
  </div>
);

const ScoreCard = ({ label, value, max, level, color = C.accent }) => (
  <div style={{ background: C.card, borderRadius: 12, padding: 20, border: `1px solid ${C.border}`, textAlign: "center", minWidth: 130 }}>
    <div style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}</div>
    {max && <div style={{ color: C.dim, fontSize: 12 }}>de {max}</div>}
    {level && <div style={{ display: "inline-block", marginTop: 8, padding: "4px 12px", borderRadius: 20, background: color + "20", color, fontSize: 12, fontWeight: 600 }}>{level}</div>}
  </div>
);

const BarChart = ({ data, maxVal = 7 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    {data.map((d, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 130, fontSize: 12, color: C.muted, textAlign: "right", flexShrink: 0 }}>{d.label}</div>
        <div style={{ flex: 1, height: 24, background: C.border, borderRadius: 4, overflow: "hidden", position: "relative" }}>
          <div style={{ width: `${(d.value / maxVal) * 100}%`, height: "100%", background: `linear-gradient(90deg,${d.color || C.accent},${d.color || C.accentLight})`, borderRadius: 4, transition: "width .6s" }} />
          <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 11, fontWeight: 600, color: C.text }}>{d.value}</span>
        </div>
      </div>
    ))}
  </div>
);

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("login");
  const [student, setStudent] = useState(null);
  const [allData, setAllData] = useState({});
  const [mode, setMode] = useState(null);
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [doc, setDoc] = useState("");
  const [name, setName] = useState("");
  const [group, setGroup] = useState("A");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [percepcionAnswers, setPercepcionAnswers] = useState({});
  const [percepcionDone, setPercepcionDone] = useState(false);

  useEffect(() => { fbGet("students").then((d) => setAllData(d || {})); }, []);

  // Styles
  const container = { minHeight: "100vh", background: `linear-gradient(135deg,${C.bg} 0%,#0f1629 50%,${C.bg} 100%)`, color: C.text, fontFamily: "'Segoe UI',system-ui,-apple-system,sans-serif" };
  const page = { maxWidth: 640, margin: "0 auto", padding: "24px 16px" };
  const header = { textAlign: "center", padding: "32px 16px 24px", borderBottom: `1px solid ${C.border}`, marginBottom: 24 };
  const btnP = { width: "100%", padding: "14px 24px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${C.accent},${C.accentDark})`, color: "#000", fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: .5, transition: "all .2s" };
  const btnS = { ...btnP, background: C.card, color: C.text, border: `1px solid ${C.border}` };

  const handleLogin = async () => {
    setError("");
    if (doc === "admin2025") { setIsAdmin(true); const d = await fbGet("students"); setAllData(d || {}); setScreen("admin"); return; }
    if (!doc.trim() || !name.trim()) { setError("Ingresa tu documento y nombre completo."); return; }
    setLoading(true);
    let s = await fbGet(`students/${doc}`);
    const realGroup = GROUP_MAP[group];
    if (!s) {
      s = { doc, name, group: realGroup, createdAt: new Date().toISOString(), pre: {}, post: {}, eft: null };
    } else {
      s.name = name; s.group = realGroup;
    }
    await fbSet(`students/${doc}`, s);
    setStudent(s);
    setLoading(false);
    setScreen("selectMode");
  };

  const handleAnswer = (id, val) => setAnswers((p) => ({ ...p, [id]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    let scores;
    if (test === "rosenberg") scores = scoreRosenberg(answers);
    else if (test === "mspss") scores = scoreMSPSS(answers);
    else if (test === "aetdc") scores = scoreAETDC(answers);

    const payload = { answers, scores, completedAt: new Date().toISOString() };
    const path = `students/${student.doc}/${mode}/${test}`;
    await fbSet(path, payload);

    const updated = await fbGet(`students/${student.doc}`);
    setStudent(updated);
    setLoading(false);
    setDone(true);
  };

  const handleSubmitPercepcion = async () => {
    setLoading(true);
    const allAnswered = PERCEPCION_ITEMS.every((it) => (percepcionAnswers[it.id] || "").trim().length > 0);
    if (!allAnswered) { setLoading(false); return; }
    const payload = { answers: percepcionAnswers, completedAt: new Date().toISOString() };
    await fbSet(`students/${student.doc}/percepcion`, payload);
    const updated = await fbGet(`students/${student.doc}`);
    setStudent(updated);
    setLoading(false);
    setPercepcionDone(true);
  };

  const isPercepcionDone = () => !!student?.percepcion; if (!student) return false; return !!student[m]?.[t]; };
  const getTotal = (t) => ({ rosenberg: 10, mspss: 12, aetdc: 30 }[t] || 0);
  const answered = Object.keys(answers).length;
  const total = test ? getTotal(test) : 0;
  const allDone = answered >= total;

  const exportCSV = () => {
    // Hoja 1: datos cuantitativos
    const rows = [["Documento", "Nombre", "Grupo_Interno", "Grupo_Visible", "Momento", "Prueba", "Puntaje_Total", "Puntaje_Max", "Nivel", "Detalles", "Fecha"]];
    Object.values(allData).forEach((s) => {
      ["pre", "post"].forEach((m) => {
        ["rosenberg", "mspss", "aetdc"].forEach((t) => {
          if (s[m]?.[t]) {
            const sc = s[m][t].scores;
            let det = "";
            if (t === "mspss") det = `Familia:${sc.familia}|Amigos:${sc.amigos}|Otros:${sc.otros}|Prom:${sc.promedio}`;
            if (t === "aetdc") det = `Autoc:${sc.autoconocimiento}|Metas:${sc.metas}|Plan:${sc.planificacion}|ConfInt:${sc.conflictos_internos}|ConfExt:${sc.conflictos_externos}|Info:${sc.informacion}|Prom:${sc.promedio}`;
            rows.push([s.doc, s.name, s.group, GROUP_DISPLAY[s.group] || s.group, m, t.toUpperCase(), sc.total, sc.max, sc.level, det, s[m][t].completedAt]);
          }
        });
      });
    });

    // Hoja 2: encuesta de percepción (mismo CSV, sección separada)
    rows.push([]);
    rows.push(["=== ENCUESTA DE PERCEPCIÓN FINAL ==="]);
    const percHeaders = ["Documento", "Nombre", "Grupo", "Fecha", ...PERCEPCION_ITEMS.map((it) => `P${it.id}: ${it.bloque}`)];
    rows.push(percHeaders);
    Object.values(allData).forEach((s) => {
      if (s.percepcion) {
        const ans = s.percepcion.answers || {};
        const row = [s.doc, s.name, GROUP_DISPLAY[s.group] || s.group, s.percepcion.completedAt,
          ...PERCEPCION_ITEMS.map((it) => `"${(ans[it.id] || "").replace(/"/g, '""')}"`)];
        rows.push(row);
      }
    });

    const blob = new Blob(["\uFEFF" + rows.map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `resultados_pablo_neruda_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };

  // ═══════════════════════
  // LOGIN
  // ═══════════════════════
  if (screen === "login") return (
    <div style={container}>
      <div style={page}>
        <div style={{ textAlign: "center", paddingTop: 40, marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.accent, marginBottom: 4, letterSpacing: -.5 }}>I.E. Pablo Neruda</h1>
          <p style={{ color: C.muted, fontSize: 14, marginBottom: 4 }}>Plataforma de Evaluación Vocacional</p>
          <p style={{ color: C.dim, fontSize: 12 }}>Grado 11° — Medellín, Comuna 2</p>
        </div>
        <div style={{ background: C.card, borderRadius: 16, padding: 28, border: `1px solid ${C.border}` }}>
          <label style={{ color: C.muted, fontSize: 12, fontWeight: 600, letterSpacing: 1, display: "block", marginBottom: 6 }}>NÚMERO DE DOCUMENTO</label>
          <input type="text" value={doc} onChange={(e) => setDoc(e.target.value)} placeholder="Ej: 1001234567"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.input, color: C.text, fontSize: 16, marginBottom: 16, outline: "none", boxSizing: "border-box" }} />

          <label style={{ color: C.muted, fontSize: 12, fontWeight: 600, letterSpacing: 1, display: "block", marginBottom: 6 }}>NOMBRE COMPLETO</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: María López Gómez"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.input, color: C.text, fontSize: 16, marginBottom: 16, outline: "none", boxSizing: "border-box" }} />

          <label style={{ color: C.muted, fontSize: 12, fontWeight: 600, letterSpacing: 1, display: "block", marginBottom: 6 }}>GRUPO</label>
          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            {["A", "B"].map((g) => (
              <button key={g} onClick={() => setGroup(g)} style={{
                flex: 1, padding: "12px", borderRadius: 8,
                border: `2px solid ${group === g ? C.accent : C.border}`,
                background: group === g ? C.accent + "20" : C.input,
                color: group === g ? C.accent : C.muted, fontSize: 15, fontWeight: 600, cursor: "pointer",
              }}>Grupo {g}</button>
            ))}
          </div>
          {error && <p style={{ color: C.red, fontSize: 13, marginBottom: 12, textAlign: "center" }}>{error}</p>}
          <button onClick={handleLogin} disabled={loading} style={{ ...btnP, opacity: loading ? .6 : 1 }}>
            {loading ? "Cargando..." : "Ingresar"}
          </button>
        </div>
        <p style={{ textAlign: "center", color: C.dim, fontSize: 11, marginTop: 24 }}>Maestría en Innovación Educativa — Politécnico Grancolombiano 2025</p>
      </div>
    </div>
  );

  // ═══════════════════════
  // SELECT MODE
  // ═══════════════════════
  if (screen === "selectMode") {
    const preDone = ["rosenberg", "mspss", "aetdc"].every((t) => isDone(t, "pre"));
    const postDone = ["rosenberg", "mspss", "aetdc"].every((t) => isDone(t, "post"));
    return (
      <div style={container}>
        <div style={page}>
          <div style={header}>
            <div style={{ fontSize: 14, color: C.accent, fontWeight: 600, marginBottom: 4 }}>Bienvenido/a</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{student.name}</h2>
            <p style={{ color: C.muted, fontSize: 13 }}>Grupo {GROUP_DISPLAY[student.group] || student.group}</p>
          </div>
          <h3 style={{ fontSize: 16, color: C.muted, marginBottom: 16, fontWeight: 600 }}>Selecciona el momento de evaluación:</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button onClick={() => { setMode("pre"); setScreen("selectTest"); }} style={{
              ...btnP, background: preDone ? C.greenDark : `linear-gradient(135deg,${C.accent},${C.accentDark})`,
              padding: 20, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div><div style={{ fontSize: 16, fontWeight: 700 }}>📋 Pre-test</div><div style={{ fontSize: 12, fontWeight: 400, opacity: .8, marginTop: 4 }}>Evaluación inicial</div></div>
              {preDone && <span style={{ fontSize: 20 }}>✅</span>}
            </button>
            <button onClick={() => { setMode("post"); setScreen("selectTest"); }} style={{
              ...btnS, background: postDone ? C.greenDark : C.card, color: postDone ? "#000" : C.text,
              padding: 20, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div><div style={{ fontSize: 16, fontWeight: 700 }}>📋 Post-test</div><div style={{ fontSize: 12, fontWeight: 400, opacity: .8, marginTop: 4 }}>Evaluación final</div></div>
              {postDone && <span style={{ fontSize: 20 }}>✅</span>}
            </button>
            <button onClick={() => { setPercepcionAnswers({}); setPercepcionDone(false); setScreen("percepcion"); }} style={{
              ...btnS, background: isPercepcionDone() ? C.greenDark : C.card,
              color: isPercepcionDone() ? "#000" : C.text,
              padding: 20, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center",
              border: `1px solid ${isPercepcionDone() ? C.green + "60" : C.purple + "60"}`,
            }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>💬 Encuesta de percepción</div>
                <div style={{ fontSize: 12, fontWeight: 400, opacity: .8, marginTop: 4 }}>Cuestionario final — 8 preguntas abiertas</div>
              </div>
              {isPercepcionDone() ? <span style={{ fontSize: 20 }}>✅</span> : <span style={{ color: C.purple, fontSize: 12, fontWeight: 600 }}>Nuevo</span>}
            </button>
          </div>
          <button onClick={() => { setScreen("login"); setStudent(null); setIsAdmin(false); }}
            style={{ ...btnS, marginTop: 20, padding: 12, fontSize: 13, background: "transparent", border: "none", color: C.dim }}>
            ← Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════
  // SELECT TEST
  // ═══════════════════════
  if (screen === "selectTest") {
    const tests = [
      { id: "rosenberg", name: "Escala de Autoestima", desc: "Rosenberg — 10 ítems", icon: "💛", },
      { id: "mspss", name: "Apoyo Social Percibido", desc: "MSPSS — 12 ítems", icon: "🤝", },
      { id: "aetdc", name: "Autoeficacia en Toma de Decisiones", desc: "AETDC — 30 ítems", icon: "🎯", },
    ];

    return (
      <div style={container}>
        <div style={page}>
          <div style={header}>
            <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, background: (mode === "pre" ? C.accent : C.blue) + "30", color: mode === "pre" ? C.accent : C.blue, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
              {mode === "pre" ? "PRE-TEST" : "POST-TEST"}
            </span>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Selecciona una prueba</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tests.map((t) => {
              const d = isDone(t.id, mode);
              return (
                <button key={t.id} onClick={() => { if (!d) { setTest(t.id); setAnswers({}); setDone(false); setShowInstructions(true); setScreen("test"); } }}
                  style={{ padding: 18, borderRadius: 12, border: `1px solid ${d ? C.green + "40" : C.border}`, background: d ? C.green + "10" : C.card, color: C.text, textAlign: "left", cursor: d ? "default" : "pointer", opacity: d ? .7 : 1, display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 28 }}>{t.icon}</span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 600 }}>{t.name}</div><div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{t.desc}</div></div>
                  {d && <span style={{ color: C.green, fontSize: 14, fontWeight: 600 }}>✅ Completada</span>}
                </button>
              );
            })}
          </div>
          <button onClick={() => setScreen("selectMode")} style={{ ...btnS, marginTop: 20, padding: 12, fontSize: 13, background: "transparent", border: "none", color: C.dim }}>← Volver</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════
  // TEST SCREEN
  // ═══════════════════════
  if (screen === "test") {
    // Completion message
    if (done) return (
      <div style={container}>
        <div style={page}>
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.green, marginBottom: 8 }}>¡Prueba completada!</h2>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 12 }}>Tus respuestas han sido guardadas correctamente.</p>
            <p style={{ color: C.dim, fontSize: 13, marginBottom: 32 }}>Los resultados serán revisados por tu docente en un espacio de acompañamiento presencial.</p>
            <button onClick={() => { setScreen("selectTest"); setTest(null); setAnswers({}); setDone(false); }} style={{ ...btnP, maxWidth: 300 }}>Continuar con otra prueba</button>
          </div>
        </div>
      </div>
    );

    // Likert tests
    let items, options, label, icon, color;
    if (test === "rosenberg") { items = ROSENBERG_ITEMS; options = ROSENBERG_OPTIONS; label = "Autoestima (Rosenberg)"; icon = "💛"; color = C.accent; }
    else if (test === "mspss") { items = MSPSS_ITEMS; options = MSPSS_OPTIONS; label = "Apoyo Social (MSPSS)"; icon = "🤝"; color = C.blue; }
    else { items = AETDC_ITEMS; options = AETDC_OPTIONS; label = "Autoeficacia Vocacional (AETDC)"; icon = "🎯"; color = C.green; }

    // Instruction screens
    if (showInstructions) {
      let instrTitle, instrIcon, instrColor, instrText;

      if (test === "rosenberg") {
        instrTitle = "Escala de Autoestima de Rosenberg";
        instrIcon = "💛"; instrColor = C.accent;
        instrText = (
          <>
            <p style={{ marginBottom: 12 }}><strong style={{ color: C.accent }}>¿En qué consiste?</strong></p>
            <p style={{ marginBottom: 12 }}>Esta prueba mide cómo te sientes contigo mismo/a. Contiene <strong>10 afirmaciones</strong> sobre ti. No hay respuestas buenas ni malas, lo importante es que respondas con sinceridad.</p>
            <p style={{ marginBottom: 12 }}><strong style={{ color: C.accent }}>¿Cómo responder?</strong></p>
            <p style={{ marginBottom: 8 }}>Para cada afirmación, selecciona la opción que mejor refleje cómo te sientes <strong>habitualmente</strong>:</p>
            <div style={{ background: C.card, borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <p style={{ marginBottom: 6 }}>🔹 <strong>Muy en desacuerdo</strong> — No me identifico para nada</p>
              <p style={{ marginBottom: 6 }}>🔹 <strong>En desacuerdo</strong> — No me identifico mucho</p>
              <p style={{ marginBottom: 6 }}>🔹 <strong>De acuerdo</strong> — Me identifico bastante</p>
              <p style={{ marginBottom: 0 }}>🔹 <strong>Muy de acuerdo</strong> — Me identifico totalmente</p>
            </div>
            <p>Responde de forma espontánea, sin pensar demasiado en cada frase.</p>
          </>
        );
      } else if (test === "mspss") {
        instrTitle = "Escala de Apoyo Social Percibido (MSPSS)";
        instrIcon = "🤝"; instrColor = C.blue;
        instrText = (
          <>
            <p style={{ marginBottom: 12 }}><strong style={{ color: C.blue }}>¿En qué consiste?</strong></p>
            <p style={{ marginBottom: 12 }}>Esta prueba evalúa cómo percibes el apoyo que recibes de las personas importantes en tu vida: <strong>familia, amigos y otras personas significativas</strong>. Contiene <strong>12 afirmaciones</strong>.</p>
            <p style={{ marginBottom: 12 }}><strong style={{ color: C.blue }}>¿Cómo responder?</strong></p>
            <p style={{ marginBottom: 8 }}>Para cada afirmación, selecciona el número que mejor represente <strong>qué tan de acuerdo estás</strong>:</p>
            <div style={{ background: C.card, borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <p style={{ marginBottom: 6 }}>🔹 <strong>1 = Muy en desacuerdo</strong> — No es así en absoluto</p>
              <p style={{ marginBottom: 6 }}>🔹 <strong>2 - 3</strong> — Más bien en desacuerdo</p>
              <p style={{ marginBottom: 6 }}>🔹 <strong>4 = Ni de acuerdo ni en desacuerdo</strong> — Neutral</p>
              <p style={{ marginBottom: 6 }}>🔹 <strong>5 - 6</strong> — Más bien de acuerdo</p>
              <p style={{ marginBottom: 0 }}>🔹 <strong>7 = Muy de acuerdo</strong> — Totalmente de acuerdo</p>
            </div>
            <p>No hay respuestas correctas ni incorrectas. Responde según lo que sientes realmente.</p>
          </>
        );
      } else {
        instrTitle = "Autoeficacia en la Toma de Decisiones de Carrera (AETDC)";
        instrIcon = "🎯"; instrColor = C.green;
        instrText = (
          <>
            <p style={{ marginBottom: 12 }}><strong style={{ color: C.green }}>¿En qué consiste?</strong></p>
            <p style={{ marginBottom: 12 }}>Esta prueba evalúa <strong>cuánta habilidad crees que tienes</strong> para realizar distintas actividades relacionadas con la elección de tu carrera o futuro profesional. Contiene <strong>30 situaciones</strong>.</p>
            <p style={{ marginBottom: 12 }}><strong style={{ color: C.green }}>¿Cómo responder?</strong></p>
            <p style={{ marginBottom: 8 }}>Para cada situación, selecciona el número que mejor represente <strong>cuánta habilidad sientes que tienes</strong> para resolverla:</p>
            <div style={{ background: C.card, borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <p style={{ marginBottom: 6 }}>🔹 <strong>1 = Ninguna habilidad</strong> — No sabría cómo hacerlo</p>
              <p style={{ marginBottom: 6 }}>🔹 <strong>2 - 3</strong> — Poca habilidad</p>
              <p style={{ marginBottom: 6 }}>🔹 <strong>4</strong> — Habilidad intermedia</p>
              <p style={{ marginBottom: 6 }}>🔹 <strong>5 - 6</strong> — Bastante habilidad</p>
              <p style={{ marginBottom: 0 }}>🔹 <strong>7 = Mucha habilidad</strong> — Me siento muy capaz</p>
            </div>
            <p>Responde pensando en lo que sientes ahora, no en lo que te gustaría sentir.</p>
          </>
        );
      }

      return (
        <div style={container}>
          <div style={page}>
            <div style={{ background: C.card, borderRadius: 16, padding: 28, border: `1px solid ${C.border}` }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <span style={{ fontSize: 48 }}>{instrIcon}</span>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: instrColor, marginTop: 12 }}>{instrTitle}</h2>
                <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>{items.length} ítems</p>
              </div>
              <div style={{ background: C.input, borderRadius: 10, padding: 18, marginBottom: 16, lineHeight: 1.7, fontSize: 14, color: C.text }}>
                {instrText}
              </div>
              <button onClick={() => setShowInstructions(false)} style={btnP}>Comenzar prueba →</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={container}>
        <div style={page}>
          <ProgressBar current={answered} total={items.length} color={color} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 20, background: color + "30", color, fontSize: 12, fontWeight: 700 }}>{icon} {label}</span>
            <span style={{ color: C.muted, fontSize: 13, fontWeight: 600 }}>{answered}/{items.length}</span>
          </div>
          {items.map((it, i) => <LikertItem key={it.id} item={it} options={options} value={answers[it.id]} onChange={handleAnswer} idx={i} total={items.length} />)}
          <div style={{ position: "sticky", bottom: 0, padding: "16px 0", background: C.bg + "ee", backdropFilter: "blur(10px)" }}>
            <button onClick={handleSubmit} disabled={!allDone || loading} style={{
              ...btnP, background: allDone ? `linear-gradient(135deg,${C.green},${C.greenDark})` : C.border,
              color: allDone ? "#fff" : C.dim, cursor: allDone ? "pointer" : "not-allowed",
            }}>{loading ? "Guardando..." : allDone ? "Enviar respuestas ✓" : `Faltan ${items.length - answered} respuestas`}</button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════
  // ENCUESTA DE PERCEPCIÓN
  // ═══════════════════════
  if (screen === "percepcion") {
    if (percepcionDone || isPercepcionDone()) return (
      <div style={container}>
        <div style={page}>
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>💬</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.green, marginBottom: 8 }}>¡Encuesta completada!</h2>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>Tus respuestas han sido guardadas. ¡Gracias por tu participación en este proceso!</p>
            <button onClick={() => setScreen("selectMode")} style={{ ...btnP, maxWidth: 300 }}>← Volver al inicio</button>
          </div>
        </div>
      </div>
    );

    const allAnswered = PERCEPCION_ITEMS.every((it) => (percepcionAnswers[it.id] || "").trim().length > 0);

    return (
      <div style={container}>
        <div style={page}>
          <div style={header}>
            <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, background: C.purple + "30", color: C.purple, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>ENCUESTA FINAL</span>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>💬 Encuesta de Percepción</h2>
            <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Responde con sinceridad — no hay respuestas correctas o incorrectas</p>
          </div>

          {PERCEPCION_ITEMS.map((it, i) => (
            <div key={it.id} style={{ background: C.card, borderRadius: 12, padding: "20px 24px", marginBottom: 14, border: `1px solid ${(percepcionAnswers[it.id] || "").trim() ? C.purple + "50" : C.border}`, transition: "all .3s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: C.purple, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{it.bloque}</span>
                <span style={{ color: C.muted, fontSize: 11 }}>{i + 1} / {PERCEPCION_ITEMS.length}</span>
              </div>
              <p style={{ color: C.text, fontSize: 15, lineHeight: 1.5, marginBottom: 12 }}>{it.text}</p>
              <textarea
                value={percepcionAnswers[it.id] || ""}
                onChange={(e) => setPercepcionAnswers((p) => ({ ...p, [it.id]: e.target.value }))}
                placeholder="Escribe tu respuesta aquí..."
                rows={3}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 8, border: `1px solid ${(percepcionAnswers[it.id] || "").trim() ? C.purple + "60" : C.border}`,
                  background: C.input, color: C.text, fontSize: 14, lineHeight: 1.5, resize: "vertical",
                  outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border .2s",
                }}
              />
            </div>
          ))}

          <div style={{ position: "sticky", bottom: 0, padding: "16px 0", background: C.bg + "ee", backdropFilter: "blur(10px)" }}>
            <button onClick={handleSubmitPercepcion} disabled={!allAnswered || loading} style={{
              ...btnP, background: allAnswered ? `linear-gradient(135deg,${C.purple},#7c3aed)` : C.border,
              color: allAnswered ? "#fff" : C.dim, cursor: allAnswered ? "pointer" : "not-allowed",
            }}>{loading ? "Guardando..." : allAnswered ? "Enviar encuesta ✓" : `Faltan ${PERCEPCION_ITEMS.filter((it) => !(percepcionAnswers[it.id] || "").trim()).length} respuestas`}</button>
          </div>

          <button onClick={() => setScreen("selectMode")} style={{ ...btnS, marginTop: 8, padding: 12, fontSize: 13, background: "transparent", border: "none", color: C.dim }}>← Volver</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════
  // ADMIN DASHBOARD
  // ═══════════════════════
  if (screen === "admin") {
    const students = Object.values(allData || {});
    const g1 = students.filter((s) => s.group === "11-01");
    const g2 = students.filter((s) => s.group === "11-02");
    const avg = (grp, mom, tst, field) => {
      const vals = grp.filter((s) => s[mom]?.[tst]?.scores).map((s) => +s[mom][tst].scores[field]);
      return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "—";
    };

    return (
      <div style={container}>
        <div style={{ ...page, maxWidth: 800 }}>
          <div style={header}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.accent }}>🔐 Panel Administrador</h2>
            <p style={{ color: C.muted, fontSize: 13 }}>Resultados de la investigación</p>
          </div>

          <button onClick={async () => { const d = await fbGet("students"); setAllData(d || {}); }} style={{ ...btnS, marginBottom: 16, padding: 10, fontSize: 13 }}>🔄 Actualizar datos</button>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
            <ScoreCard label="Total registrados" value={students.length} color={C.accent} />
            <ScoreCard label="11-01 (Grupo A)" value={g1.length} color={C.green} />
            <ScoreCard label="11-02 (Grupo B)" value={g2.length} color={C.blue} />
            <ScoreCard label="Encuestas percepción" value={students.filter(s => s.percepcion).length} color={C.purple} />
          </div>

          <div style={{ background: C.card, borderRadius: 12, padding: 20, border: `1px solid ${C.border}`, marginBottom: 20, overflowX: "auto" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.accent, marginBottom: 12 }}>Promedios por grupo y momento</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ color: C.muted }}>
                <th style={{ textAlign: "left", padding: 8, borderBottom: `1px solid ${C.border}` }}>Prueba</th>
                <th style={{ padding: 8, borderBottom: `1px solid ${C.border}` }}>11-01 Pre</th>
                <th style={{ padding: 8, borderBottom: `1px solid ${C.border}` }}>11-01 Post</th>
                <th style={{ padding: 8, borderBottom: `1px solid ${C.border}` }}>11-02 Pre</th>
                <th style={{ padding: 8, borderBottom: `1px solid ${C.border}` }}>11-02 Post</th>
              </tr></thead>
              <tbody>
                {[{ l: "Rosenberg", t: "rosenberg", f: "total" }, { l: "MSPSS", t: "mspss", f: "total" }, { l: "AETDC", t: "aetdc", f: "total" }].map((r) => (
                  <tr key={r.t}>
                    <td style={{ padding: 8, borderBottom: `1px solid ${C.border}`, fontWeight: 600 }}>{r.l}</td>
                    <td style={{ padding: 8, borderBottom: `1px solid ${C.border}`, textAlign: "center", color: C.accent }}>{avg(g1, "pre", r.t, r.f)}</td>
                    <td style={{ padding: 8, borderBottom: `1px solid ${C.border}`, textAlign: "center", color: C.green }}>{avg(g1, "post", r.t, r.f)}</td>
                    <td style={{ padding: 8, borderBottom: `1px solid ${C.border}`, textAlign: "center", color: C.accent }}>{avg(g2, "pre", r.t, r.f)}</td>
                    <td style={{ padding: 8, borderBottom: `1px solid ${C.border}`, textAlign: "center", color: C.green }}>{avg(g2, "post", r.t, r.f)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: C.card, borderRadius: 12, padding: 20, border: `1px solid ${C.border}`, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.accent, marginBottom: 12 }}>Estudiantes ({students.length})</h3>
            {students.length === 0 ? <p style={{ color: C.dim }}>Aún no hay registros.</p> : (
              <div style={{ maxHeight: 400, overflowY: "auto" }}>
                {students.map((s) => {
                  const pre = ["rosenberg", "mspss", "aetdc"].filter((t) => s.pre?.[t]).length;
                  const post = ["rosenberg", "mspss", "aetdc"].filter((t) => s.post?.[t]).length;
                  const perc = !!s.percepcion;
                  return (
                    <div key={s.doc} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                      <div><span style={{ fontWeight: 600 }}>{s.name}</span><span style={{ color: C.dim, marginLeft: 8 }}>{s.group} ({GROUP_DISPLAY[s.group]})</span></div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ color: pre === 3 ? C.green : C.dim, fontSize: 11 }}>Pre: {pre}/3</span>
                        <span style={{ color: post === 3 ? C.green : C.dim, fontSize: 11 }}>Post: {post}/3</span>
                        <span style={{ color: perc ? C.purple : C.dim, fontSize: 11 }}>💬 {perc ? "✓" : "—"}</span>
                        <button onClick={async () => {
                          if (confirm(`¿Eliminar a ${s.name} (${s.doc})? Se borrarán todas sus respuestas.`)) {
                            await fetch(`${DB_URL}/students/${s.doc}.json`, { method: "DELETE" });
                            const d = await fbGet("students"); setAllData(d || {});
                          }
                        }} style={{ background: C.red + "20", color: C.red, border: `1px solid ${C.red}40`, borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>🗑️</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button onClick={exportCSV} style={{ ...btnP, marginBottom: 12 }}>📥 Exportar todos los datos (CSV)</button>
          <button onClick={() => { setScreen("login"); setIsAdmin(false); setStudent(null); }} style={{ ...btnS, background: "transparent", border: "none", color: C.dim }}>← Cerrar sesión</button>
        </div>
      </div>
    );
  }

  return null;
}
