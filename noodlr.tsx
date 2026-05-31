import { useState, useEffect, useContext, createContext } from "react";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";
document.head.appendChild(fontLink);

// ── Theme ─────────────────────────────────────────────────────────────────────
// Color roles per branding spec:
//   Sage Green  = primary CTA (buttons, checkboxes, progress)
//   Amethyst    = status tags, highlights, "pick up here" accent
// Light: sage #6B8E23, amethyst #9966CC
// Dark:  sage #9EB384, amethyst #D1C4E9

const BRAND = {
  sageLight:     "#6B8E23",
  sageDark:      "#9EB384",
  amethystLight: "#9966CC",
  amethystDark:  "#D1C4E9",
};

const DARK = {
  bg:            "#1A1D23",
  bgCard:        "#252A32",
  bgElevated:    "#2E3440",
  bgInput:       "#2E3440",
  bgModal:       "#252A32",
  bgCover:       "#252A32",
  border:        "#333948",
  borderStrong:  "#444c5c",
  text:          "#E0E0E0",
  textSub:       "#A8B2C0",
  textMuted:     "#7a8694",
  textFaint:     "#4a5260",
  textDisabled:  "#5a6474",
  checkLabel:    "#1A1D23",
  primary:       BRAND.sageDark,
  amethyst:      BRAND.amethystDark,
  headerBg:      "#1A1D23",
  tabInactive:   "#5a6474",
  tabCountBg:    "#2E3440",
  emptyBtn:      "#252A32",
  emptyBtnBorder:"#333948",
  upgradeBox:    "#252A32",
  upgradeBorder: "#D1C4E955",
  warnBg:        "#2a1f0e",
  warnBorder:    "#7a4f10",
  warnText:      "#e8b84b",
  toggleBg:      "#2E3440",
  toggleIcon:    "#A8B2C0",
};

const LIGHT = {
  bg:            "#F8F9FA",
  bgCard:        "#FFFFFF",
  bgElevated:    "#eef0f2",
  bgInput:       "#eef0f2",
  bgModal:       "#FFFFFF",
  bgCover:       "#eef0f2",
  border:        "#dde1e6",
  borderStrong:  "#c4cad2",
  text:          "#2D3436",
  textSub:       "#4a5568",
  textMuted:     "#6b7280",
  textFaint:     "#9ca3af",
  textDisabled:  "#9ca3af",
  checkLabel:    "#FFFFFF",
  primary:       BRAND.sageLight,
  amethyst:      BRAND.amethystLight,
  headerBg:      "#F8F9FA",
  tabInactive:   "#9ca3af",
  tabCountBg:    "#eef0f2",
  emptyBtn:      "#FFFFFF",
  emptyBtnBorder:"#dde1e6",
  upgradeBox:    "#fafbfc",
  upgradeBorder: "#9966CC55",
  warnBg:        "#fffbeb",
  warnBorder:    "#fcd34d",
  warnText:      "#92400e",
  toggleBg:      "#eef0f2",
  toggleIcon:    "#6b7280",
};

const ThemeCtx = createContext({ theme: DARK, dark: true, toggle: () => {} });
const useTheme = () => useContext(ThemeCtx);

function ThemeProvider({ children }) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [dark, setDark] = useState(prefersDark);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggle = () => setDark((d) => !d);
  const theme = dark ? DARK : LIGHT;

  return (
    <ThemeCtx.Provider value={{ theme, dark, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10);

function stepIndicator(steps) {
  if (!steps || steps.length === 0) return null;
  const incomplete = steps.filter((s) => !s.completed);
  if (incomplete.length === 0) return { type: "done", text: "✓ All steps complete" };

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const pastDue = incomplete.filter((s) => s.dueDate && new Date(s.dueDate) < now);
  if (pastDue.length > 0) {
    const worst = pastDue.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
    return { type: "overdue", text: `⚠ ${worst.title} overdue` };
  }

  const withDue = incomplete
    .filter((s) => s.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  if (withDue.length > 0) {
    const d = new Date(withDue[0].dueDate);
    const diff = Math.round((d - now) / 86400000);
    const label = diff === 0 ? "today" : diff === 1 ? "tomorrow" : `in ${diff}d`;
    return { type: "soon", text: `→ ${withDue[0].title} (${label})` };
  }

  return { type: "next", text: `→ ${incomplete[0].title}` };
}

function formatDeadline(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const STATUS_ORDER = ["Active", "Paused", "Someday", "Done"];
const STATUS_COLORS = {
  Active:  "#6B8E23",
  Paused:  "#E8A020",
  Someday: "#9966CC",
  Done:    "#94a3b8",
};
const FREE_LIMIT = 5;

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED_PROJECTS = [
  {
    id: uid(),
    title: "Autumn Throw Blanket",
    description: "Knitted blanket for the living room couch, rust and cream colorway.",
    status: "Active",
    deadline: "2026-11-01",
    pickUpHere: "Cast on row 47 — switch to rust yarn at row 50. Needles in the knitting bag.",
    coverColor: "#b45309",
    steps: [
      { id: uid(), title: "Buy yarn", completed: true, dueDate: null, notes: "", sortOrder: 0 },
      { id: uid(), title: "Swatch and gauge check", completed: true, dueDate: null, notes: "", sortOrder: 1 },
      { id: uid(), title: "Cast on and knit body", completed: false, dueDate: "2026-07-15", notes: "Rows 1–200", sortOrder: 2 },
      { id: uid(), title: "Weave in ends", completed: false, dueDate: null, notes: "", sortOrder: 3 },
      { id: uid(), title: "Block finished piece", completed: false, dueDate: null, notes: "", sortOrder: 4 },
    ],
    supplies: [
      { id: uid(), item: "Rust yarn (bulky)", qtyNeeded: 4, qtyOnHand: 4, unit: "skeins", cost: 28, acquired: true },
      { id: uid(), item: "Cream yarn (bulky)", qtyNeeded: 2, qtyOnHand: 2, unit: "skeins", cost: 14, acquired: true },
      { id: uid(), item: "US 13 circular needles", qtyNeeded: 1, qtyOnHand: 1, unit: "", cost: 12, acquired: true },
    ],
  },
  {
    id: uid(),
    title: "Lino Print — Heron",
    description: "A5 reduction linocut of a great blue heron. Planning 4-color edition of 20.",
    status: "Active",
    deadline: null,
    pickUpHere: "Key block is carved. Transfer drawing for the water layer next.",
    coverColor: "#0f4c75",
    steps: [
      { id: uid(), title: "Final reference sketch", completed: true, dueDate: null, notes: "", sortOrder: 0 },
      { id: uid(), title: "Transfer to lino block", completed: true, dueDate: null, notes: "", sortOrder: 1 },
      { id: uid(), title: "Carve key block (black)", completed: true, dueDate: null, notes: "", sortOrder: 2 },
      { id: uid(), title: "Carve water layer (blue)", completed: false, dueDate: null, notes: "", sortOrder: 3 },
      { id: uid(), title: "Test print edition", completed: false, dueDate: null, notes: "", sortOrder: 4 },
      { id: uid(), title: "Full edition print", completed: false, dueDate: null, notes: "", sortOrder: 5 },
    ],
    supplies: [
      { id: uid(), item: "A5 lino blocks", qtyNeeded: 4, qtyOnHand: 3, unit: "blocks", cost: 16, acquired: false },
      { id: uid(), item: "Blue ink", qtyNeeded: 1, qtyOnHand: 1, unit: "tube", cost: 8, acquired: true },
      { id: uid(), item: "Black ink", qtyNeeded: 1, qtyOnHand: 1, unit: "tube", cost: 8, acquired: true },
    ],
  },
  {
    id: uid(),
    title: "Ceramic Mugs — Spring Set",
    description: "Hand-built mugs for a gift set. Aiming for 4 matching pieces with speckled glaze.",
    status: "Paused",
    deadline: "2026-09-01",
    pickUpHere: "Waiting for kiln time at the studio — check back after the 15th.",
    coverColor: "#7c6d5a",
    steps: [
      { id: uid(), title: "Wedge and prepare clay", completed: true, dueDate: null, notes: "", sortOrder: 0 },
      { id: uid(), title: "Hand-build all 4 mugs", completed: true, dueDate: null, notes: "", sortOrder: 1 },
      { id: uid(), title: "Bisque fire", completed: false, dueDate: "2026-06-20", notes: "Book kiln time at studio", sortOrder: 2 },
      { id: uid(), title: "Apply speckled glaze", completed: false, dueDate: null, notes: "", sortOrder: 3 },
      { id: uid(), title: "Glaze fire", completed: false, dueDate: null, notes: "", sortOrder: 4 },
    ],
    supplies: [
      { id: uid(), item: "Stoneware clay", qtyNeeded: 5, qtyOnHand: 5, unit: "lbs", cost: 15, acquired: true },
      { id: uid(), item: "Speckled glaze", qtyNeeded: 1, qtyOnHand: 0, unit: "pint", cost: 18, acquired: false },
    ],
  },
];

// ── Shared style helpers ──────────────────────────────────────────────────────

function makeInputStyle(theme) {
  return {
    width: "100%",
    background: theme.bgInput,
    border: `1px solid ${theme.borderStrong}`,
    borderRadius: 8,
    padding: "10px 12px",
    color: theme.text,
    fontSize: 14,
    marginBottom: 14,
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "Inter, sans-serif",
  };
}

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  marginBottom: 5,
  fontFamily: "Inter, sans-serif",
};

function smallBtn(bg, color) {
  return {
    padding: "8px 14px",
    borderRadius: 7,
    background: bg,
    color,
    fontWeight: 600,
    fontSize: 13,
    border: "none",
    cursor: "pointer",
    fontFamily: "Inter, sans-serif",
  };
}

// ── Wordmark ──────────────────────────────────────────────────────────────────

function Wordmark({ theme, size = "md" }) {
  const sizes = { sm: 18, md: 22, lg: 26 };
  const fs = sizes[size];
  return (
    <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: fs, letterSpacing: "-0.03em", lineHeight: 1 }}>
      <span style={{ color: theme.text }}>noodlr</span>
      <span style={{ color: theme.amethyst }}>.</span>
    </span>
  );
}

// ── CoverSwatch ───────────────────────────────────────────────────────────────

function CoverSwatch({ color, size = 52 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        background: `linear-gradient(135deg, ${color}ee 0%, ${color}88 100%)`,
        flexShrink: 0,
        boxShadow: `0 2px 10px ${color}44`,
      }}
    />
  );
}

// ── StatusPill ────────────────────────────────────────────────────────────────

function StatusPill({ status }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 9px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 600,
        background: STATUS_COLORS[status] + "22",
        color: STATUS_COLORS[status],
        letterSpacing: "0.04em",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {status}
    </span>
  );
}

// ── ThemeToggle ───────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { theme, dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        background: theme.toggleBg,
        border: "none",
        borderRadius: 8,
        width: 34,
        height: 34,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: 15,
        flexShrink: 0,
        transition: "background 0.2s",
      }}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}

// ── StepRow ───────────────────────────────────────────────────────────────────

function StepRow({ step, onToggle }) {
  const { theme } = useTheme();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "9px 0",
        borderBottom: `1px solid ${theme.border}`,
        cursor: "pointer",
      }}
      onClick={() => onToggle(step.id)}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: 5,
          border: step.completed ? "none" : `2px solid ${theme.borderStrong}`,
          background: step.completed ? theme.primary : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 2,
          transition: "all 0.15s",
        }}
      >
        {step.completed && <span style={{ fontSize: 11, color: theme.checkLabel, fontWeight: 700 }}>✓</span>}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 14,
            color: step.completed ? theme.textDisabled : theme.text,
            textDecoration: step.completed ? "line-through" : "none",
            lineHeight: 1.35,
          }}
        >
          {step.title}
        </div>
        {step.dueDate && !step.completed && (
          <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
            Due {formatDeadline(step.dueDate)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── SupplyRow ─────────────────────────────────────────────────────────────────

function SupplyRow({ supply, onToggle }) {
  const { theme } = useTheme();
  const shortfall = supply.qtyNeeded - supply.qtyOnHand;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 0",
        borderBottom: `1px solid ${theme.border}`,
        cursor: "pointer",
      }}
      onClick={() => onToggle(supply.id)}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: 5,
          border: supply.acquired ? "none" : `2px solid ${theme.borderStrong}`,
          background: supply.acquired ? theme.primary : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
      >
        {supply.acquired && <span style={{ fontSize: 11, color: theme.checkLabel, fontWeight: 700 }}>✓</span>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: supply.acquired ? theme.textDisabled : theme.text }}>
          {supply.item}
        </div>
        <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 1 }}>
          {supply.qtyOnHand} / {supply.qtyNeeded} {supply.unit}
          {shortfall > 0 && !supply.acquired && (
            <span style={{ color: "#f59e0b", marginLeft: 6 }}>need {shortfall} more</span>
          )}
        </div>
      </div>
      {supply.cost > 0 && (
        <div style={{ fontSize: 12, color: theme.textMuted }}>${supply.cost}</div>
      )}
    </div>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────────

function SectionHeader({ title, count, onAdd, style: extraStyle }) {
  const { theme } = useTheme();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
        paddingTop: 4,
        ...extraStyle,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: theme.textFaint,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {title}{" "}
        {count > 0 && <span style={{ color: theme.textDisabled }}>({count})</span>}
      </div>
      <button
        onClick={onAdd}
        style={{
          background: theme.primary + "22",
          border: "none",
          borderRadius: 6,
          color: theme.primary,
          width: 26,
          height: 26,
          fontSize: 18,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
        }}
      >
        +
      </button>
    </div>
  );
}

// ── ProjectCard ───────────────────────────────────────────────────────────────

function ProjectCard({ project, onOpen, onStatusChange }) {
  const { theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const indicator = stepIndicator(project.steps);
  const completedSteps = project.steps.filter((s) => s.completed).length;

  const indicatorColor =
    indicator?.type === "overdue" ? "#ef4444"
    : indicator?.type === "soon"  ? "#f59e0b"
    : indicator?.type === "done"  ? theme.primary
    : theme.textSub;

  return (
    <div
      style={{
        background: theme.bgCard,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        border: `1px solid ${theme.border}`,
        position: "relative",
        cursor: "pointer",
        transition: "border-color 0.15s, background 0.2s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
      onClick={() => onOpen(project.id)}
    >
      {/* Top row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
        <CoverSwatch color={project.coverColor} size={50} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: theme.text,
              lineHeight: 1.25,
              marginBottom: 5,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {project.title}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <StatusPill status={project.status} />
            {project.deadline && (
              <span style={{ fontSize: 11, color: theme.textMuted }}>
                due {formatDeadline(project.deadline)}
              </span>
            )}
          </div>
        </div>

        {/* ⋯ menu */}
        <div
          style={{ position: "relative" }}
          onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.textMuted,
              fontSize: 18,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            ⋯
          </div>
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 32,
                background: theme.bgElevated,
                borderRadius: 12,
                border: `1px solid ${theme.borderStrong}`,
                zIndex: 100,
                minWidth: 150,
                overflow: "hidden",
                boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
              }}
            >
              {STATUS_ORDER.filter((s) => s !== project.status).map((s) => (
                <div
                  key={s}
                  style={{
                    padding: "10px 14px",
                    fontSize: 13,
                    color: STATUS_COLORS[s],
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 600,
                    fontFamily: "Inter, sans-serif",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(project.id, s);
                    setMenuOpen(false);
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: STATUS_COLORS[s],
                      display: "inline-block",
                    }}
                  />
                  Move to {s}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pick up here — amethyst accent */}
      {project.pickUpHere && (
        <div
          style={{
            background: theme.bgElevated,
            borderRadius: 8,
            padding: "8px 10px",
            fontSize: 12,
            color: theme.textSub,
            marginBottom: 8,
            lineHeight: 1.45,
            borderLeft: `3px solid ${theme.amethyst}`,
          }}
        >
          {project.pickUpHere}
        </div>
      )}

      {/* Step indicator + progress */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {indicator && (
          <div style={{ fontSize: 12, color: indicatorColor, flex: 1, minWidth: 0, paddingRight: 8 }}>
            {indicator.text}
          </div>
        )}
        {project.steps.length > 0 && (
          <div style={{ fontSize: 11, color: theme.textDisabled, flexShrink: 0 }}>
            {completedSteps}/{project.steps.length} steps
          </div>
        )}
      </div>
    </div>
  );
}

// ── NewProjectModal ───────────────────────────────────────────────────────────

const SWATCH_COLORS = [
  "#b45309", "#0f4c75", "#7c6d5a", "#15803d", "#be185d",
  "#7e22ce", "#0369a1", "#9a3412", "#1e3a5f", "#4a7c59",
];

function NewProjectModal({ onSave, onClose, projectCount }) {
  const { theme } = useTheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pickUpHere, setPickUpHere] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("Active");
  const [color, setColor] = useState(SWATCH_COLORS[0]);

  const atLimit = projectCount >= FREE_LIMIT;
  const inputStyle = makeInputStyle(theme);

  const handleSave = () => {
    if (!title.trim() || atLimit) return;
    onSave({
      id: uid(),
      title: title.trim(),
      description,
      pickUpHere,
      deadline: deadline || null,
      status,
      coverColor: color,
      steps: [],
      supplies: [],
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 200,
        display: "flex",
        alignItems: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          background: theme.bgModal,
          borderRadius: "20px 20px 0 0",
          padding: "20px 20px 44px",
          maxHeight: "90vh",
          overflowY: "auto",
          border: `1px solid ${theme.border}`,
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: 36, height: 4, borderRadius: 99, background: theme.borderStrong, margin: "0 auto 20px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: theme.text, margin: 0, fontFamily: "Inter, sans-serif" }}>
            New Project
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: theme.textMuted, fontSize: 22, cursor: "pointer" }}>
            ×
          </button>
        </div>

        {atLimit && (
          <div
            style={{
              background: theme.warnBg,
              border: `1px solid ${theme.warnBorder}`,
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 16,
              fontSize: 13,
              color: theme.warnText,
              lineHeight: 1.5,
            }}
          >
            You've reached the 5-project limit on the free tier. Remove a project to make room, or upgrade for unlimited projects.
          </div>
        )}

        <label style={{ ...labelStyle, color: theme.textMuted }}>Project title *</label>
        <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Autumn Throw Blanket" autoFocus disabled={atLimit} />

        <label style={{ ...labelStyle, color: theme.textMuted }}>Pick up here</label>
        <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={pickUpHere} onChange={(e) => setPickUpHere(e.target.value)} placeholder="Where did you leave off?" disabled={atLimit} />

        <label style={{ ...labelStyle, color: theme.textMuted }}>Description (optional)</label>
        <textarea style={{ ...inputStyle, minHeight: 50, resize: "vertical" }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Purpose, goal, or any context" disabled={atLimit} />

        <div style={{ display: "flex", gap: 12, marginBottom: 0 }}>
          <div style={{ flex: 1 }}>
            <label style={{ ...labelStyle, color: theme.textMuted }}>Status</label>
            <select style={inputStyle} value={status} onChange={(e) => setStatus(e.target.value)} disabled={atLimit}>
              {STATUS_ORDER.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ ...labelStyle, color: theme.textMuted }}>Deadline</label>
            <input type="date" style={inputStyle} value={deadline} onChange={(e) => setDeadline(e.target.value)} disabled={atLimit} />
          </div>
        </div>

        <label style={{ ...labelStyle, color: theme.textMuted }}>Cover color</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {SWATCH_COLORS.map((c) => (
            <div
              key={c}
              onClick={() => !atLimit && setColor(c)}
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                background: c,
                cursor: atLimit ? "not-allowed" : "pointer",
                border: color === c ? `3px solid ${theme.amethyst}` : "3px solid transparent",
                boxSizing: "border-box",
                transition: "border-color 0.12s",
              }}
            />
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={!title.trim() || atLimit}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 10,
            background: !title.trim() || atLimit ? theme.bgElevated : theme.primary,
            color: !title.trim() || atLimit ? theme.textDisabled : theme.checkLabel,
            fontWeight: 700,
            fontSize: 15,
            border: "none",
            cursor: !title.trim() || atLimit ? "not-allowed" : "pointer",
            transition: "all 0.15s",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Create Project
        </button>
      </div>
    </div>
  );
}

// ── ProjectDetail ─────────────────────────────────────────────────────────────

function ProjectDetail({ project, onBack, onUpdate }) {
  const { theme } = useTheme();
  const [pickUpHere, setPickUpHere] = useState(project.pickUpHere || "");
  const [editingPickUp, setEditingPickUp] = useState(false);
  const [addingStep, setAddingStep] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState("");
  const [addingSupply, setAddingSupply] = useState(false);
  const [newSupply, setNewSupply] = useState({ item: "", qtyNeeded: 1, qtyOnHand: 0, unit: "", cost: "" });

  const completedSteps = project.steps.filter((s) => s.completed).length;
  const stepPct = project.steps.length ? Math.round((completedSteps / project.steps.length) * 100) : 0;
  const inputStyle = makeInputStyle(theme);

  const savePickUp = () => { onUpdate({ ...project, pickUpHere }); setEditingPickUp(false); };

  const toggleStep = (id) =>
    onUpdate({ ...project, steps: project.steps.map((s) => s.id === id ? { ...s, completed: !s.completed } : s) });

  const toggleSupply = (id) =>
    onUpdate({ ...project, supplies: project.supplies.map((s) => s.id === id ? { ...s, acquired: !s.acquired } : s) });

  const addStep = () => {
    if (!newStepTitle.trim()) return;
    onUpdate({ ...project, steps: [...project.steps, { id: uid(), title: newStepTitle.trim(), completed: false, dueDate: null, notes: "", sortOrder: project.steps.length }] });
    setNewStepTitle("");
    setAddingStep(false);
  };

  const addSupply = () => {
    if (!newSupply.item.trim()) return;
    onUpdate({ ...project, supplies: [...project.supplies, { id: uid(), item: newSupply.item.trim(), qtyNeeded: parseFloat(newSupply.qtyNeeded) || 1, qtyOnHand: parseFloat(newSupply.qtyOnHand) || 0, unit: newSupply.unit, cost: parseFloat(newSupply.cost) || 0, acquired: false }] });
    setNewSupply({ item: "", qtyNeeded: 1, qtyOnHand: 0, unit: "", cost: "" });
    setAddingSupply(false);
  };

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", paddingBottom: 60, transition: "background 0.2s", fontFamily: "Inter, sans-serif" }}>
      {/* Cover band */}
      <div style={{ height: 150, background: `linear-gradient(150deg, ${project.coverColor}cc 0%, ${project.coverColor}44 100%)`, position: "relative" }}>
        <button
          onClick={onBack}
          style={{ position: "absolute", top: 16, left: 16, background: "rgba(0,0,0,0.3)", border: "none", borderRadius: 8, color: "#f1f5f9", padding: "6px 12px", fontSize: 13, cursor: "pointer", fontWeight: 600, fontFamily: "Inter, sans-serif" }}
        >
          ← Back
        </button>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: "0 0 6px", fontFamily: "Inter, sans-serif", lineHeight: 1.2 }}>
          {project.title}
        </h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
          <StatusPill status={project.status} />
          {project.deadline && <span style={{ fontSize: 12, color: theme.textMuted }}>Due {formatDeadline(project.deadline)}</span>}
          {project.steps.length > 0 && <span style={{ fontSize: 12, color: theme.textDisabled }}>{completedSteps}/{project.steps.length} steps done</span>}
        </div>

        {/* Step progress bar — sage green */}
        {project.steps.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ height: 4, background: theme.bgElevated, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${stepPct}%`, background: theme.primary, borderRadius: 99, transition: "width 0.4s ease" }} />
            </div>
          </div>
        )}

        {/* Pick up here — amethyst accent */}
        <div
          style={{
            background: theme.bgCard,
            borderRadius: 12,
            padding: "12px 14px",
            marginBottom: 20,
            border: `1px solid ${theme.amethyst}33`,
            borderLeft: `4px solid ${theme.amethyst}`,
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: theme.amethyst, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8, fontFamily: "Inter, sans-serif" }}>
            Pick up here
          </div>
          {editingPickUp ? (
            <>
              <textarea style={{ ...inputStyle, marginBottom: 8, minHeight: 70 }} value={pickUpHere} onChange={(e) => setPickUpHere(e.target.value)} autoFocus />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={savePickUp} style={smallBtn(theme.primary, theme.checkLabel)}>Save</button>
                <button onClick={() => { setPickUpHere(project.pickUpHere || ""); setEditingPickUp(false); }} style={smallBtn(theme.bgElevated, theme.textSub)}>Cancel</button>
              </div>
            </>
          ) : (
            <div
              onClick={() => setEditingPickUp(true)}
              style={{ fontSize: 14, color: pickUpHere ? theme.text : theme.textDisabled, lineHeight: 1.5, cursor: "pointer", fontStyle: pickUpHere ? "normal" : "italic" }}
            >
              {pickUpHere || "Tap to add a note on where you left off…"}
            </div>
          )}
        </div>

        {/* Steps */}
        <SectionHeader title="Steps" count={project.steps.length} onAdd={() => setAddingStep(true)} />
        {project.steps.map((step) => <StepRow key={step.id} step={step} onToggle={toggleStep} />)}
        {addingStep && (
          <div style={{ padding: "10px 0" }}>
            <input style={inputStyle} value={newStepTitle} onChange={(e) => setNewStepTitle(e.target.value)} placeholder="Step name" autoFocus onKeyDown={(e) => e.key === "Enter" && addStep()} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addStep} style={smallBtn(theme.primary, theme.checkLabel)}>Add</button>
              <button onClick={() => setAddingStep(false)} style={smallBtn(theme.bgElevated, theme.textSub)}>Cancel</button>
            </div>
          </div>
        )}
        {!addingStep && project.steps.length === 0 && (
          <div style={{ fontSize: 13, color: theme.textFaint, padding: "8px 0 12px", fontStyle: "italic" }}>No steps yet — tap + to add one.</div>
        )}

        {/* Supplies */}
        <SectionHeader title="Supplies" count={project.supplies.length} onAdd={() => setAddingSupply(true)} style={{ marginTop: 22 }} />
        {project.supplies.map((s) => <SupplyRow key={s.id} supply={s} onToggle={toggleSupply} />)}
        {addingSupply && (
          <div style={{ padding: "10px 0" }}>
            <input style={inputStyle} placeholder="Item name" value={newSupply.item} onChange={(e) => setNewSupply({ ...newSupply, item: e.target.value })} autoFocus />
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...inputStyle, flex: 1 }} placeholder="Need" type="number" value={newSupply.qtyNeeded} onChange={(e) => setNewSupply({ ...newSupply, qtyNeeded: e.target.value })} />
              <input style={{ ...inputStyle, flex: 1 }} placeholder="Have" type="number" value={newSupply.qtyOnHand} onChange={(e) => setNewSupply({ ...newSupply, qtyOnHand: e.target.value })} />
              <input style={{ ...inputStyle, flex: 1 }} placeholder="Unit" value={newSupply.unit} onChange={(e) => setNewSupply({ ...newSupply, unit: e.target.value })} />
            </div>
            <input style={inputStyle} placeholder="Est. cost ($)" type="number" value={newSupply.cost} onChange={(e) => setNewSupply({ ...newSupply, cost: e.target.value })} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addSupply} style={smallBtn(theme.primary, theme.checkLabel)}>Add</button>
              <button onClick={() => setAddingSupply(false)} style={smallBtn(theme.bgElevated, theme.textSub)}>Cancel</button>
            </div>
          </div>
        )}
        {!addingSupply && project.supplies.length === 0 && (
          <div style={{ fontSize: 13, color: theme.textFaint, padding: "8px 0 12px", fontStyle: "italic" }}>No supplies yet — tap + to add one.</div>
        )}

        {/* Progress photos — upgrade prompt */}
        <div style={{ marginTop: 26 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: theme.textFaint, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 10, fontFamily: "Inter, sans-serif" }}>
            Progress Photos
          </div>
          <div style={{ background: theme.upgradeBox, borderRadius: 14, padding: "20px 16px", textAlign: "center", border: `1px dashed ${theme.upgradeBorder}` }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>📷</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: theme.textMuted, marginBottom: 4, fontFamily: "Inter, sans-serif" }}>Progress photo gallery</div>
            <div style={{ fontSize: 12, color: theme.textFaint, marginBottom: 14, lineHeight: 1.5 }}>Document your work as you go — available with the paid upgrade.</div>
            <button style={{ background: theme.primary, border: "none", borderRadius: 10, padding: "9px 20px", fontSize: 13, fontWeight: 700, color: theme.checkLabel, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              Unlock for $7 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Home Screen ───────────────────────────────────────────────────────────────

function HomeScreen({ projects, setProjects }) {
  const { theme } = useTheme();
  const [activeCol, setActiveCol] = useState("Active");
  const [showNewModal, setShowNewModal] = useState(false);
  const [openProjectId, setOpenProjectId] = useState(null);

  const openProject = openProjectId ? projects.find((p) => p.id === openProjectId) : null;

  const updateProject = (updated) => setProjects((ps) => ps.map((p) => (p.id === updated.id ? updated : p)));
  const changeStatus = (id, newStatus) => setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));
  const addProject = (proj) => { setProjects((ps) => [...ps, proj]); setShowNewModal(false); setActiveCol(proj.status); };

  if (openProject) {
    return <ProjectDetail project={openProject} onBack={() => setOpenProjectId(null)} onUpdate={updateProject} />;
  }

  const grouped = STATUS_ORDER.reduce((acc, s) => { acc[s] = projects.filter((p) => p.status === s); return acc; }, {});
  const pct = Math.min(100, (projects.length / FREE_LIMIT) * 100);
  const atOrNearLimit = projects.length >= FREE_LIMIT;

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", fontFamily: "Inter, sans-serif", color: theme.text, maxWidth: 430, margin: "0 auto", position: "relative", transition: "background 0.2s, color 0.2s" }}>
      {/* Header */}
      <div style={{ padding: "16px 16px 0", position: "sticky", top: 0, background: theme.headerBg, zIndex: 10, borderBottom: `1px solid ${theme.border}`, transition: "background 0.2s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <Wordmark theme={theme} size="lg" />
            <div style={{ fontSize: 10, fontWeight: 600, color: theme.textFaint, letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 3 }}>
              creativity tracker
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <ThemeToggle />
            <button
              onClick={() => setShowNewModal(true)}
              style={{ background: theme.primary, border: "none", borderRadius: 10, color: theme.checkLabel, fontWeight: 700, fontSize: 22, width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              +
            </button>
          </div>
        </div>

        {/* Column tabs */}
        <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 12 }}>
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => setActiveCol(s)}
              style={{
                background: activeCol === s ? STATUS_COLORS[s] + "18" : "transparent",
                border: activeCol === s ? `1px solid ${STATUS_COLORS[s]}55` : "1px solid transparent",
                borderRadius: 8,
                padding: "5px 12px",
                fontSize: 13,
                fontWeight: 600,
                color: activeCol === s ? STATUS_COLORS[s] : theme.tabInactive,
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {s}
              {grouped[s].length > 0 && (
                <span style={{ background: activeCol === s ? STATUS_COLORS[s] + "28" : theme.tabCountBg, color: activeCol === s ? STATUS_COLORS[s] : theme.tabInactive, borderRadius: 99, fontSize: 10, padding: "1px 6px", fontWeight: 700 }}>
                  {grouped[s].length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Project list */}
      <div style={{ padding: "14px 16px" }}>
        {/* Free tier bar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: theme.textFaint }}>{projects.length} of {FREE_LIMIT} projects (free)</span>
            {atOrNearLimit && <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 600 }}>Limit reached</span>}
          </div>
          <div style={{ height: 3, background: theme.bgElevated, borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: atOrNearLimit ? "#ef4444" : theme.primary, borderRadius: 99, transition: "width 0.3s" }} />
          </div>
        </div>

        {grouped[activeCol].length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: theme.textFaint, fontSize: 14, fontStyle: "italic" }}>
            No {activeCol.toLowerCase()} projects yet.
            {activeCol === "Active" && (
              <div style={{ marginTop: 14 }}>
                <button
                  onClick={() => setShowNewModal(true)}
                  style={{ background: theme.primary + "18", border: `1px solid ${theme.primary}44`, borderRadius: 10, color: theme.primary, padding: "9px 18px", fontSize: 13, cursor: "pointer", fontWeight: 600, fontFamily: "Inter, sans-serif" }}
                >
                  + Start a project
                </button>
              </div>
            )}
          </div>
        ) : (
          grouped[activeCol].map((p) => <ProjectCard key={p.id} project={p} onOpen={setOpenProjectId} onStatusChange={changeStatus} />)
        )}
      </div>

      {showNewModal && <NewProjectModal projectCount={projects.length} onSave={addProject} onClose={() => setShowNewModal(false)} />}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [projects, setProjects] = useState(SEED_PROJECTS);
  return (
    <ThemeProvider>
      <HomeScreen projects={projects} setProjects={setProjects} />
    </ThemeProvider>
  );
}
