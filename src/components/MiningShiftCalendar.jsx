import { useState, useMemo } from "react";

/* ─── Configuración de Turnos ─── */
const SHIFT_TYPES = {
  NOCHE: {
    label: "Turno Noche",
    short: "N",
    hours: "20:00 – 08:00",
    dot: "#475569",
    barBg: "#1e293b",
    barText: "#fff",
  },
  DIA: {
    label: "Turno Día",
    short: "D",
    hours: "08:00 – 20:00",
    dot: "#2563eb",
    barBg: "#2563eb",
    barText: "#fff",
  },
  DESCANSO: {
    label: "Descanso",
    short: "—",
    hours: "Libre",
    dot: "#10b981",
    barBg: "#e2e8f0",
    barText: "#9ca3af",
  },
};

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DAYS_ES = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

/* ─── Lógica del Ciclo 28 días ───
 *  Ancla: 18 Feb 2026 = Día 0 del ciclo
 *  [0..6]   → NOCHE
 *  [7..13]  → DESCANSO
 *  [14..20] → DIA
 *  [21..27] → DESCANSO
 */
function getShiftForDate(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const anchor = new Date(2026, 1, 18);
  const diffDays = Math.round((d - anchor) / 86400000);
  const idx = ((diffDays % 28) + 28) % 28;
  if (idx < 7) return "NOCHE";
  if (idx < 14) return "DESCANSO";
  if (idx < 21) return "DIA";
  return "DESCANSO";
}

/* ─── Utilidades ─── */
function getDaysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

function getFirstDayOfWeek(y, m) {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1; // Lunes = 0
}

function isToday(y, m, d) {
  const n = new Date();
  return n.getFullYear() === y && n.getMonth() === m && n.getDate() === d;
}

/* ─── Componente: Mes del Calendario ─── */
function CalendarMonth({ year, month, selectedDate, onSelect }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const cells = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(<td key={`e${i}`} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const shift = getShiftForDate(new Date(year, month, day));
    const info = SHIFT_TYPES[shift];
    const today = isToday(year, month, day);
    const sel =
      selectedDate &&
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === day;
    const isWeekend = [5, 6].includes((firstDay + day - 1) % 7);

    cells.push(
      <td
        key={day}
        onClick={() => onSelect(new Date(year, month, day))}
        style={{ padding: 0, textAlign: "center", verticalAlign: "top" }}
      >
        <div
          style={{
            position: "relative",
            margin: 2,
            padding: "6px 2px 8px",
            borderRadius: 6,
            cursor: "pointer",
            background: sel ? "#2563eb" : today ? "#f0f4ff" : "transparent",
            border:
              today && !sel
                ? "1px solid #2563eb"
                : "1px solid transparent",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            if (!sel) e.currentTarget.style.background = "#f1f5f9";
          }}
          onMouseLeave={(e) => {
            if (!sel)
              e.currentTarget.style.background = today
                ? "#f0f4ff"
                : "transparent";
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: today || sel ? 700 : 500,
              color: sel
                ? "#fff"
                : today
                ? "#2563eb"
                : isWeekend
                ? "#94a3b8"
                : "#334155",
              lineHeight: 1,
              marginBottom: 4,
            }}
          >
            {day}
          </div>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: sel ? "#fff" : info.dot,
              margin: "0 auto",
              opacity: shift === "DESCANSO" ? 0.5 : 1,
            }}
          />
        </div>
      </td>
    );
  }

  const rows = [];
  let week = [];
  cells.forEach((c, i) => {
    week.push(c);
    if (week.length === 7) {
      rows.push(<tr key={i}>{week}</tr>);
      week = [];
    }
  });
  while (week.length < 7) week.push(<td key={`f${week.length}`} />);
  if (week.length) rows.push(<tr key="last">{week}</tr>);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        padding: "16px 14px 12px",
        minWidth: 260,
        flex: "1 1 280px",
        maxWidth: 320,
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#111827",
          marginBottom: 12,
          letterSpacing: -0.3,
        }}
      >
        {MONTHS_ES[month]}{" "}
        <span style={{ color: "#9ca3af", fontWeight: 500 }}>{year}</span>
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
        }}
      >
        <thead>
          <tr>
            {DAYS_ES.map((d) => (
              <th
                key={d}
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#9ca3af",
                  padding: "0 0 6px",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

/* ─── Componente: Detalle del Día Seleccionado ─── */
function ShiftDetail({ date }) {
  if (!date) return null;
  const shift = getShiftForDate(date);
  const info = SHIFT_TYPES[shift];
  const dayNames = [
    "Domingo", "Lunes", "Martes", "Miércoles",
    "Jueves", "Viernes", "Sábado",
  ];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background:
            shift === "NOCHE"
              ? "#1e293b"
              : shift === "DIA"
              ? "#2563eb"
              : "#f0fdf4",
          border: shift === "DESCANSO" ? "1px solid #d1fae5" : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          fontWeight: 800,
          color: shift === "DESCANSO" ? "#10b981" : "#fff",
          flexShrink: 0,
        }}
      >
        {info.short}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
          {info.label}
        </div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
          {dayNames[date.getDay()]} {date.getDate()} de{" "}
          {MONTHS_ES[date.getMonth()]} {date.getFullYear()} · {info.hours}
        </div>
      </div>
    </div>
  );
}

/* ─── Componente: Estadísticas ─── */
function StatsRow({ months }) {
  const stats = useMemo(() => {
    let n = 0,
      d = 0,
      r = 0;
    months.forEach(({ year, month }) => {
      const days = getDaysInMonth(year, month);
      for (let i = 1; i <= days; i++) {
        const s = getShiftForDate(new Date(year, month, i));
        if (s === "NOCHE") n++;
        else if (s === "DIA") d++;
        else r++;
      }
    });
    return { noche: n, dia: d, descanso: r, total: n + d + r, trabajo: n + d };
  }, [months]);

  const items = [
    {
      label: "Días Noche",
      val: stats.noche,
      color: "#475569",
      pct: ((stats.noche / stats.total) * 100).toFixed(0),
    },
    {
      label: "Días Día",
      val: stats.dia,
      color: "#2563eb",
      pct: ((stats.dia / stats.total) * 100).toFixed(0),
    },
    {
      label: "Descanso",
      val: stats.descanso,
      color: "#10b981",
      pct: ((stats.descanso / stats.total) * 100).toFixed(0),
    },
    {
      label: "Días Trabajo",
      val: stats.trabajo,
      color: "#111827",
      pct: ((stats.trabajo / stats.total) * 100).toFixed(0),
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 10,
      }}
    >
      {items.map((s) => (
        <div
          key={s.label}
          style={{
            background: "#fff",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: 1,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            {s.label}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: s.color,
                lineHeight: 1,
              }}
            >
              {s.val}
            </span>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>{s.pct}%</span>
          </div>
          <div
            style={{
              marginTop: 8,
              height: 3,
              background: "#f1f5f9",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${s.pct}%`,
                background: s.color,
                borderRadius: 2,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Componente: Timeline de Bloques ─── */
function TimelineBar({ months }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        padding: "16px 20px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#111827",
          marginBottom: 12,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Vista de Bloques
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {months.map(({ year, month }) => {
          const daysInMonth = getDaysInMonth(year, month);
          const blocks = [];
          let cur = null;
          for (let d = 1; d <= daysInMonth; d++) {
            const s = getShiftForDate(new Date(year, month, d));
            if (cur && cur.shift === s) cur.end = d;
            else {
              if (cur) blocks.push(cur);
              cur = { shift: s, start: d, end: d };
            }
          }
          if (cur) blocks.push(cur);

          return (
            <div
              key={`${year}-${month}`}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <span
                style={{
                  fontSize: 10,
                  color: "#9ca3af",
                  width: 28,
                  textAlign: "right",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {MONTHS_ES[month].slice(0, 3).toUpperCase()}
              </span>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  gap: 2,
                  height: 22,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                {blocks.map((b, i) => {
                  const info = SHIFT_TYPES[b.shift];
                  const span = b.end - b.start + 1;
                  return (
                    <div
                      key={i}
                      style={{
                        flex: span,
                        background: info.barBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: 0.3,
                        color: info.barText,
                      }}
                    >
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

/* ─── Componente Principal ─── */
export default function MiningShiftCalendar() {
  const [baseMonth, setBaseMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState(new Date());

  const months = useMemo(() => {
    const r = [];
    let y = baseMonth.year,
      m = baseMonth.month;
    for (let i = 0; i < 6; i++) {
      r.push({ year: y, month: m });
      m++;
      if (m > 11) {
        m = 0;
        y++;
      }
    }
    return r;
  }, [baseMonth]);

  const nav = (dir) => {
    setBaseMonth((p) => {
      let m = p.month + dir * 3,
        y = p.year;
      while (m < 0) {
        m += 12;
        y--;
      }
      while (m > 11) {
        m -= 12;
        y++;
      }
      return { year: y, month: m };
    });
  };

  const goToday = () => {
    const now = new Date();
    setBaseMonth({ year: now.getFullYear(), month: now.getMonth() });
    setSelectedDate(now);
  };

  const btnBase = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    color: "#374151",
    borderRadius: 6,
    padding: "7px 14px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* ── Header ── */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#1e293b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: -0.5,
            }}
          >
            SG
          </div>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#111827",
                letterSpacing: -0.3,
              }}
            >
              Sierra Gorda SCM
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>
              Calendario de Turnos · Rotación 7×7
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {[
            { l: "Noche", c: "#475569" },
            { l: "Día", c: "#2563eb" },
            { l: "Descanso", c: "#10b981" },
          ].map((x) => (
            <div
              key={x.l}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: x.c,
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>
                {x.l}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Contenido ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>
        {/* Navegación */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => nav(-1)} style={btnBase}>
              ← Anterior
            </button>
            <button
              onClick={goToday}
              style={{
                ...btnBase,
                background: "#2563eb",
                color: "#fff",
                border: "1px solid #2563eb",
              }}
            >
              Hoy
            </button>
            <button onClick={() => nav(1)} style={btnBase}>
              Siguiente →
            </button>
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>
            {MONTHS_ES[months[0].month]} {months[0].year} —{" "}
            {MONTHS_ES[months[5].month]} {months[5].year}
          </div>
        </div>

        {/* Detalle día seleccionado */}
        <div style={{ marginBottom: 16 }}>
          <ShiftDetail date={selectedDate} />
        </div>

        {/* Estadísticas */}
        <div style={{ marginBottom: 16 }}>
          <StatsRow months={months} />
        </div>

        {/* Timeline */}
        <div style={{ marginBottom: 20 }}>
          <TimelineBar months={months} />
        </div>

        {/* Grilla de calendarios */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "center",
          }}
        >
          {months.map(({ year, month }) => (
            <CalendarMonth
              key={`${year}-${month}`}
              year={year}
              month={month}
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
            />
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: 28,
            paddingTop: 16,
            borderTop: "1px solid #e5e7eb",
            fontSize: 11,
            color: "#9ca3af",
          }}
        >
          Ciclo 28 días: 7 Noche → 7 Descanso → 7 Día → 7 Descanso · Fecha
          ancla: 18 Feb 2026 (Noche)
        </div>
      </div>
    </div>
  );
}
