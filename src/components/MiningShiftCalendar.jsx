import { useState, useMemo, createContext, useContext } from "react";

/* ═══════════════════════════════════════════
   SISTEMA DE TEMAS — Claro / Oscuro (iOS Deep Blue)
   ═══════════════════════════════════════════ */
const themes = {
  light: {
    bg: "#f8f9fb",
    card: "#fff",
    cardBorder: "#e5e7eb",
    headerBg: "#fff",
    headerBorder: "#e5e7eb",
    text: "#111827",
    textSecondary: "#6b7280",
    textMuted: "#9ca3af",
    textDay: "#334155",
    textWeekend: "#94a3b8",
    logoBg: "#1e293b",
    logoText: "#fff",
    btnBg: "#fff",
    btnBorder: "#e5e7eb",
    btnText: "#374151",
    btnActiveBg: "#2563eb",
    btnActiveText: "#fff",
    hoverBg: "#f1f5f9",
    todayBg: "#eff6ff",
    todayBorder: "#3b82f6",
    selectedBg: "#2563eb",
    selectedText: "#fff",
    barDescanso: "#e2e8f0",
    barDescansoText: "#9ca3af",
    progressBg: "#f1f5f9",
    footerBorder: "#e5e7eb",
    toggleBg: "#f1f5f9",
    toggleActive: "#1e293b",
    toggleActiveText: "#fff",
    toggleInactiveText: "#6b7280",
    descansoCardBg: "#f0fdf4",
    descansoBorder: "#d1fae5",
    teamSelectorBg: "#f1f5f9",
    teamActive: "#2563eb",
    teamActiveText: "#fff",
    teamInactive: "transparent",
    teamInactiveText: "#6b7280",
    teamInactiveBorder: "#e5e7eb",
    coordBadge: "#f1f5f9",
    coordText: "#6b7280",
    noche: { dot: "#475569", barBg: "#1e293b", barText: "#fff", badge: "#1e293b", badgeText: "#fff" },
    dia: { dot: "#2563eb", barBg: "#2563eb", barText: "#fff", badge: "#2563eb", badgeText: "#fff" },
    descanso: { dot: "#10b981", barBg: null, barText: null, badge: null, badgeText: "#10b981" },
  },
  dark: {
    bg: "#0a1628",
    card: "rgba(255,255,255,0.05)",
    cardBorder: "rgba(255,255,255,0.08)",
    headerBg: "rgba(10,22,40,0.92)",
    headerBorder: "rgba(255,255,255,0.06)",
    text: "#f5f5f7",
    textSecondary: "#98a2b3",
    textMuted: "#5b6578",
    textDay: "#e5e7eb",
    textWeekend: "#5b6578",
    logoBg: "#0a84ff",
    logoText: "#fff",
    btnBg: "rgba(255,255,255,0.07)",
    btnBorder: "rgba(255,255,255,0.1)",
    btnText: "#e5e7eb",
    btnActiveBg: "#0a84ff",
    btnActiveText: "#fff",
    hoverBg: "rgba(255,255,255,0.08)",
    todayBg: "rgba(10,132,255,0.15)",
    todayBorder: "#0a84ff",
    selectedBg: "#0a84ff",
    selectedText: "#fff",
    barDescanso: "rgba(255,255,255,0.06)",
    barDescansoText: "#5b6578",
    progressBg: "rgba(255,255,255,0.06)",
    footerBorder: "rgba(255,255,255,0.06)",
    toggleBg: "rgba(255,255,255,0.07)",
    toggleActive: "#0a84ff",
    toggleActiveText: "#fff",
    toggleInactiveText: "#5b6578",
    descansoCardBg: "rgba(48,209,88,0.1)",
    descansoBorder: "rgba(48,209,88,0.2)",
    teamSelectorBg: "rgba(255,255,255,0.05)",
    teamActive: "#0a84ff",
    teamActiveText: "#fff",
    teamInactive: "transparent",
    teamInactiveText: "#5b6578",
    teamInactiveBorder: "rgba(255,255,255,0.1)",
    coordBadge: "rgba(255,255,255,0.06)",
    coordText: "#5b6578",
    noche: { dot: "#bf5af2", barBg: "linear-gradient(135deg, #1c1c4e, #2d1b69)", barText: "#e5d4ff", badge: "#2d1b69", badgeText: "#bf5af2" },
    dia: { dot: "#ff9f0a", barBg: "linear-gradient(135deg, #ff9f0a, #e08600)", barText: "#1a1a1a", badge: "#3a2800", badgeText: "#ff9f0a" },
    descanso: { dot: "#30d158", barBg: null, barText: null, badge: null, badgeText: "#30d158" },
  },
};

const ThemeContext = createContext();

/* ═══════════════════════════════════════════
   CONFIGURACIÓN DE EQUIPOS Y TURNOS
   ═══════════════════════════════════════════
   Ciclo 28 días desde ancla 18-Feb-2026:
   
   Período  | Team 1 | Team 2 | Team 3 | Team 4
   ---------|--------|--------|--------|--------
   Días 0-6 | DIA    | NOCHE  | DESC   | DESC
   Días 7-13| DESC   | DESC   | NOCHE  | DIA
   Días14-20| NOCHE  | DIA    | DESC   | DESC
   Días21-27| DESC   | DESC   | DIA    | NOCHE
   
   Coordinación A: Team 1 + Team 2
   Coordinación B: Team 3 + Team 4
   ═══════════════════════════════════════════ */

const TEAM_PATTERNS = {
  1: ["DIA", "DESCANSO", "NOCHE", "DESCANSO"],
  2: ["NOCHE", "DESCANSO", "DIA", "DESCANSO"],
  3: ["DESCANSO", "NOCHE", "DESCANSO", "DIA"],
  4: ["DESCANSO", "DIA", "DESCANSO", "NOCHE"],
};

const TEAM_INFO = {
  1: { name: "Team 1", coord: "A" },
  2: { name: "Team 2", coord: "A" },
  3: { name: "Team 3", coord: "B" },
  4: { name: "Team 4", coord: "B" },
};

const SHIFT_TYPES = {
  NOCHE: { label: "Turno Noche", short: "N", hours: "20:00 – 08:00" },
  DIA: { label: "Turno Día", short: "D", hours: "08:00 – 20:00" },
  DESCANSO: { label: "Descanso", short: "—", hours: "Libre" },
};

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DAYS_ES = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

/* ═══════════════════════════════════════════
   LÓGICA DEL CICLO 28 DÍAS POR EQUIPO
   ═══════════════════════════════════════════ */
function getShiftForDate(date, team) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const anchor = new Date(2026, 1, 18);
  const diffDays = Math.round((d - anchor) / 86400000);
  const idx = ((diffDays % 28) + 28) % 28;
  const weekIdx = Math.floor(idx / 7); // 0, 1, 2, 3
  return TEAM_PATTERNS[team][weekIdx];
}

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfWeek(y, m) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }
function isToday(y, m, d) { const n = new Date(); return n.getFullYear() === y && n.getMonth() === m && n.getDate() === d; }
function getShiftColors(t) { return { NOCHE: t.noche, DIA: t.dia, DESCANSO: t.descanso }; }

/* ═══════════════════════════════════════════
   COMPONENTE: Toggle de Tema
   ═══════════════════════════════════════════ */
function ThemeToggle({ mode, setMode }) {
  const t = useContext(ThemeContext);
  return (
    <div style={{
      display: "flex", background: t.toggleBg, borderRadius: 10,
      padding: 3, gap: 2, border: `1px solid ${t.cardBorder}`,
    }}>
      {[
        { key: "light", label: "☀️" },
        { key: "dark", label: "🌙" },
      ].map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setMode(key)}
          style={{
            padding: "5px 14px", borderRadius: 8, border: "none",
            fontSize: 14, cursor: "pointer", transition: "all 0.25s ease",
            background: mode === key ? t.toggleActive : "transparent",
            color: mode === key ? t.toggleActiveText : t.toggleInactiveText,
            fontWeight: 600,
          }}
        >{label}</button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   COMPONENTE: Selector de Equipo
   ═══════════════════════════════════════════ */
function TeamSelector({ team, setTeam }) {
  const t = useContext(ThemeContext);

  return (
    <div style={{
      background: t.card, borderRadius: 16,
      border: `1px solid ${t.cardBorder}`,
      padding: "16px 20px",
      backdropFilter: "blur(20px)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 14, flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: t.text, textTransform: "uppercase", letterSpacing: 0.8 }}>
          Selecciona tu Equipo
        </div>
        <div style={{
          fontSize: 11, fontWeight: 600, color: t.coordText,
          background: t.coordBadge, borderRadius: 6, padding: "3px 10px",
        }}>
          Coordinación {TEAM_INFO[team].coord}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {/* Coordinación A */}
        <div style={{ display: "flex", gap: 6, flex: 1, minWidth: 200 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: t.textMuted,
            writingMode: "vertical-lr", textOrientation: "mixed",
            transform: "rotate(180deg)", letterSpacing: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 2px",
          }}>A</div>
          {[1, 2].map(id => (
            <button
              key={id}
              onClick={() => setTeam(id)}
              style={{
                flex: 1,
                padding: "10px 8px",
                borderRadius: 12,
                border: team === id ? `2px solid ${t.teamActive}` : `1.5px solid ${t.teamInactiveBorder}`,
                background: team === id ? t.teamActive : t.teamInactive,
                color: team === id ? t.teamActiveText : t.teamInactiveText,
                cursor: "pointer",
                transition: "all 0.25s ease",
                fontFamily: "inherit",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>Team {id}</div>
              <div style={{ fontSize: 10, marginTop: 3, opacity: 0.8 }}>
                {(() => {
                  const today = new Date();
                  const shift = getShiftForDate(today, id);
                  return shift === "DIA" ? "Hoy: Día" : shift === "NOCHE" ? "Hoy: Noche" : "Hoy: Descanso";
                })()}
              </div>
            </button>
          ))}
        </div>

        {/* Separador */}
        <div style={{
          width: 1, background: t.cardBorder, margin: "0 4px",
          alignSelf: "stretch",
        }} />

        {/* Coordinación B */}
        <div style={{ display: "flex", gap: 6, flex: 1, minWidth: 200 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: t.textMuted,
            writingMode: "vertical-lr", textOrientation: "mixed",
            transform: "rotate(180deg)", letterSpacing: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 2px",
          }}>B</div>
          {[3, 4].map(id => (
            <button
              key={id}
              onClick={() => setTeam(id)}
              style={{
                flex: 1,
                padding: "10px 8px",
                borderRadius: 12,
                border: team === id ? `2px solid ${t.teamActive}` : `1.5px solid ${t.teamInactiveBorder}`,
                background: team === id ? t.teamActive : t.teamInactive,
                color: team === id ? t.teamActiveText : t.teamInactiveText,
                cursor: "pointer",
                transition: "all 0.25s ease",
                fontFamily: "inherit",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>Team {id}</div>
              <div style={{ fontSize: 10, marginTop: 3, opacity: 0.8 }}>
                {(() => {
                  const today = new Date();
                  const shift = getShiftForDate(today, id);
                  return shift === "DIA" ? "Hoy: Día" : shift === "NOCHE" ? "Hoy: Noche" : "Hoy: Descanso";
                })()}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   COMPONENTE: Mes del Calendario
   ═══════════════════════════════════════════ */
function CalendarMonth({ year, month, selectedDate, onSelect, team }) {
  const t = useContext(ThemeContext);
  const sc = getShiftColors(t);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const cells = [];

  for (let i = 0; i < firstDay; i++) cells.push(<td key={`e${i}`} />);

  for (let day = 1; day <= daysInMonth; day++) {
    const shift = getShiftForDate(new Date(year, month, day), team);
    const colors = sc[shift];
    const today = isToday(year, month, day);
    const sel = selectedDate && selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month && selectedDate.getDate() === day;
    const isWeekend = [5, 6].includes((firstDay + day - 1) % 7);

    cells.push(
      <td key={day} onClick={() => onSelect(new Date(year, month, day))}
        style={{ padding: 0, textAlign: "center", verticalAlign: "top" }}>
        <div
          style={{
            position: "relative", margin: 2, padding: "7px 2px 9px",
            borderRadius: 10, cursor: "pointer",
            background: sel ? t.selectedBg : today ? t.todayBg : "transparent",
            border: today && !sel ? `1.5px solid ${t.todayBorder}` : "1.5px solid transparent",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => { if (!sel) e.currentTarget.style.background = t.hoverBg; }}
          onMouseLeave={e => { if (!sel) e.currentTarget.style.background = today ? t.todayBg : "transparent"; }}
        >
          <div style={{
            fontSize: 13, fontWeight: today || sel ? 700 : 400,
            color: sel ? t.selectedText : today ? t.todayBorder : isWeekend ? t.textWeekend : t.textDay,
            lineHeight: 1, marginBottom: 5, letterSpacing: -0.2,
          }}>{day}</div>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: sel ? t.selectedText : colors.dot,
            margin: "0 auto", opacity: shift === "DESCANSO" ? 0.45 : 0.9,
          }} />
        </div>
      </td>
    );
  }

  const rows = [];
  let week = [];
  cells.forEach((c, i) => {
    week.push(c);
    if (week.length === 7) { rows.push(<tr key={i}>{week}</tr>); week = []; }
  });
  while (week.length < 7) week.push(<td key={`f${week.length}`} />);
  if (week.length) rows.push(<tr key="last">{week}</tr>);

  return (
    <div style={{
      background: t.card, borderRadius: 16, border: `1px solid ${t.cardBorder}`,
      padding: "18px 16px 14px", minWidth: 260, flex: "1 1 280px", maxWidth: 320,
      backdropFilter: "blur(20px)",
    }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 14, letterSpacing: -0.3 }}>
        {MONTHS_ES[month]} <span style={{ color: t.textMuted, fontWeight: 400 }}>{year}</span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <thead>
          <tr>{DAYS_ES.map(d => (
            <th key={d} style={{
              fontSize: 11, fontWeight: 600, color: t.textMuted,
              padding: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.5,
            }}>{d}</th>
          ))}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════
   COMPONENTE: Detalle del Día
   ═══════════════════════════════════════════ */
function ShiftDetail({ date, team }) {
  const t = useContext(ThemeContext);
  const sc = getShiftColors(t);

  if (!date) return null;
  const shift = getShiftForDate(date, team);
  const info = SHIFT_TYPES[shift];
  const colors = sc[shift];
  const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  // Get companion team info
  const companion = { 1: 2, 2: 1, 3: 4, 4: 3 }[team];
  const companionShift = getShiftForDate(date, companion);
  const companionInfo = SHIFT_TYPES[companionShift];

  return (
    <div style={{
      background: t.card, borderRadius: 16, border: `1px solid ${t.cardBorder}`,
      padding: "18px 22px", display: "flex", alignItems: "center", gap: 16,
      backdropFilter: "blur(20px)",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: shift === "DESCANSO" ? t.descansoCardBg : (colors.badge || t.card),
        border: shift === "DESCANSO" ? `1px solid ${t.descansoBorder}` : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, fontWeight: 700, color: colors.badgeText, flexShrink: 0,
      }}>{info.short}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: t.text, letterSpacing: -0.3 }}>
            {info.label}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, color: t.textMuted,
            background: t.coordBadge, borderRadius: 5, padding: "2px 8px",
          }}>
            Team {team}
          </span>
        </div>
        <div style={{ fontSize: 13, color: t.textSecondary, marginTop: 3, letterSpacing: -0.1 }}>
          {dayNames[date.getDay()]} {date.getDate()} de {MONTHS_ES[date.getMonth()]} {date.getFullYear()} · {info.hours}
        </div>
        <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>
          Team {companion}: {companionInfo.label} ({companionInfo.hours})
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   COMPONENTE: Estadísticas
   ═══════════════════════════════════════════ */
function StatsRow({ months, team }) {
  const t = useContext(ThemeContext);
  const sc = getShiftColors(t);

  const stats = useMemo(() => {
    let n = 0, d = 0, r = 0;
    months.forEach(({ year, month }) => {
      const days = getDaysInMonth(year, month);
      for (let i = 1; i <= days; i++) {
        const s = getShiftForDate(new Date(year, month, i), team);
        if (s === "NOCHE") n++;
        else if (s === "DIA") d++;
        else r++;
      }
    });
    return { noche: n, dia: d, descanso: r, total: n + d + r, trabajo: n + d };
  }, [months, team]);

  const items = [
    { label: "Días Noche", val: stats.noche, color: sc.NOCHE.dot, pct: ((stats.noche / stats.total) * 100).toFixed(0) },
    { label: "Días Día", val: stats.dia, color: sc.DIA.dot, pct: ((stats.dia / stats.total) * 100).toFixed(0) },
    { label: "Descanso", val: stats.descanso, color: sc.DESCANSO.dot, pct: ((stats.descanso / stats.total) * 100).toFixed(0) },
    { label: "Días Trabajo", val: stats.trabajo, color: t.text, pct: ((stats.trabajo / stats.total) * 100).toFixed(0) },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
      {items.map(s => (
        <div key={s.label} style={{
          background: t.card, borderRadius: 16,
          border: `1px solid ${t.cardBorder}`, padding: "16px 18px",
          backdropFilter: "blur(20px)",
        }}>
          <div style={{
            fontSize: 11, color: t.textMuted, textTransform: "uppercase",
            letterSpacing: 0.8, fontWeight: 600, marginBottom: 6,
          }}>{s.label}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: s.color, lineHeight: 1, letterSpacing: -1 }}>{s.val}</span>
            <span style={{ fontSize: 12, color: t.textMuted, fontWeight: 500 }}>{s.pct}%</span>
          </div>
          <div style={{ marginTop: 10, height: 4, background: t.progressBg, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${s.pct}%`, background: s.color, borderRadius: 2, transition: "width 0.5s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   COMPONENTE: Timeline de Bloques
   ═══════════════════════════════════════════ */
function TimelineBar({ months, team }) {
  const t = useContext(ThemeContext);
  const sc = getShiftColors(t);

  return (
    <div style={{
      background: t.card, borderRadius: 16,
      border: `1px solid ${t.cardBorder}`, padding: "18px 22px",
      backdropFilter: "blur(20px)",
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: t.text,
        marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.8,
      }}>Vista de Bloques — Team {team}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {months.map(({ year, month }) => {
          const daysInMonth = getDaysInMonth(year, month);
          const blocks = [];
          let cur = null;
          for (let d = 1; d <= daysInMonth; d++) {
            const s = getShiftForDate(new Date(year, month, d), team);
            if (cur && cur.shift === s) cur.end = d;
            else { if (cur) blocks.push(cur); cur = { shift: s, start: d, end: d }; }
          }
          if (cur) blocks.push(cur);

          return (
            <div key={`${year}-${month}`} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                fontSize: 11, color: t.textMuted, width: 30,
                textAlign: "right", fontWeight: 600, flexShrink: 0,
              }}>
                {MONTHS_ES[month].slice(0, 3).toUpperCase()}
              </span>
              <div style={{
                flex: 1, display: "flex", gap: 2,
                height: 24, borderRadius: 6, overflow: "hidden",
              }}>
                {blocks.map((b, i) => {
                  const colors = sc[b.shift];
                  const span = b.end - b.start + 1;
                  return (
                    <div key={i} style={{
                      flex: span,
                      background: colors.barBg || t.barDescanso,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700, letterSpacing: 0.3,
                      color: colors.barText || t.barDescansoText,
                    }}>
                      {span >= 4 ? `${b.start}–${b.end}` : ""}
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

/* ═══════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════ */
export default function MiningShiftCalendar() {
  const [mode, setMode] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    return "light";
  });
  const [team, setTeam] = useState(2);
  const [baseMonth, setBaseMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState(new Date());

  const t = themes[mode];

  const months = useMemo(() => {
    const r = [];
    let y = baseMonth.year, m = baseMonth.month;
    for (let i = 0; i < 6; i++) {
      r.push({ year: y, month: m });
      m++;
      if (m > 11) { m = 0; y++; }
    }
    return r;
  }, [baseMonth]);

  const nav = (dir) => {
    setBaseMonth(p => {
      let m = p.month + dir * 3, y = p.year;
      while (m < 0) { m += 12; y--; }
      while (m > 11) { m -= 12; y++; }
      return { year: y, month: m };
    });
  };

  const goToday = () => {
    const now = new Date();
    setBaseMonth({ year: now.getFullYear(), month: now.getMonth() });
    setSelectedDate(now);
  };

  const btnBase = {
    background: t.btnBg, border: `1px solid ${t.btnBorder}`, color: t.btnText,
    borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600,
    cursor: "pointer", transition: "all 0.2s ease", fontFamily: "inherit", letterSpacing: -0.2,
  };

  return (
    <ThemeContext.Provider value={t}>
      <div style={{
        minHeight: "100vh", background: t.bg,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif",
        color: t.text, transition: "background 0.35s ease, color 0.35s ease",
        WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale",
      }}>

        {/* Header */}
        <div style={{
          background: t.headerBg, borderBottom: `1px solid ${t.headerBorder}`,
          padding: "14px 24px", display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: 12,
          position: "sticky", top: 0, zIndex: 50,
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, background: t.logoBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 800, color: t.logoText, letterSpacing: -0.5,
            }}>SG</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: t.text, letterSpacing: -0.4 }}>
                Sierra Gorda SCM
              </div>
              <div style={{ fontSize: 12, color: t.textMuted, letterSpacing: -0.1 }}>
                Calendario de Turnos · Rotación 7×7
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            {[
              { l: "Noche", c: t.noche.dot },
              { l: "Día", c: t.dia.dot },
              { l: "Descanso", c: t.descanso.dot },
            ].map(x => (
              <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: x.c, display: "inline-block" }} />
                <span style={{ fontSize: 12, color: t.textSecondary, fontWeight: 500, letterSpacing: -0.1 }}>{x.l}</span>
              </div>
            ))}
            <ThemeToggle mode={mode} setMode={setMode} />
          </div>
        </div>

        {/* Contenido */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "22px 16px" }}>

          {/* Team Selector */}
          <div style={{ marginBottom: 16 }}>
            <TeamSelector team={team} setTeam={setTeam} />
          </div>

          {/* Nav */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 18, flexWrap: "wrap", gap: 8,
          }}>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => nav(-1)} style={btnBase}>← Anterior</button>
              <button onClick={goToday} style={{
                ...btnBase, background: t.btnActiveBg, color: t.btnActiveText,
                border: `1px solid ${t.btnActiveBg}`,
              }}>Hoy</button>
              <button onClick={() => nav(1)} style={btnBase}>Siguiente →</button>
            </div>
            <div style={{ fontSize: 14, color: t.textSecondary, fontWeight: 600, letterSpacing: -0.2 }}>
              {MONTHS_ES[months[0].month]} {months[0].year} — {MONTHS_ES[months[5].month]} {months[5].year}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}><ShiftDetail date={selectedDate} team={team} /></div>
          <div style={{ marginBottom: 16 }}><StatsRow months={months} team={team} /></div>
          <div style={{ marginBottom: 22 }}><TimelineBar months={months} team={team} /></div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            {months.map(({ year, month }) => (
              <CalendarMonth key={`${year}-${month}`} year={year} month={month}
                selectedDate={selectedDate} onSelect={setSelectedDate} team={team} />
            ))}
          </div>

          <div style={{
            textAlign: "center", marginTop: 30, paddingTop: 18,
            borderTop: `1px solid ${t.footerBorder}`, fontSize: 12, color: t.textMuted, letterSpacing: -0.1,
          }}>
            Ciclo 28 días · Coord. A (Team 1 + 2) · Coord. B (Team 3 + 4) · Ancla: 18 Feb 2026
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
