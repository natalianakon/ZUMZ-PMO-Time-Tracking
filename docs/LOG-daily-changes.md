# Daily Change Log — PMO Time Tracker

> Running log of all changes. One entry per session, append-only.

---

## 2026-05-06

- **What's New tab** — New `★ What's New` tab added with full versioned changelog (v1.0 pilot launch + v2.0 major release)
- **Release note generator** — `📋 Copy v2.0 Release Note` button generates formatted text report (What's New / Improvements / Removed + How to get this version instructions) and copies to clipboard
- **CHANGELOG constant** — Structured release data added as a module-level constant for easy future version additions

---

## 2026-05-05

- **StatTile** — Added `valueTruncate={false}` prop; long project names (Top Project tile) now wrap instead of overflowing at 30px font
- **Dashboard — at-risk banner** — Removed `burnPct` (budget % used) display; was showing misleading 1300%+ values from placeholder estimatedHours
- **Dashboard — Quick Log panel** — Added `✚ Quick Log` toggle button; inline form with person, date, project, work type, hours (quick-pick buttons: 0.5h–4h), notes; fires `setEntries` directly from Dashboard
- **Dashboard — Period Summary** — Added `📋 Summary` button; generates copyable text report for the currently selected period (team hours, productive %, breakdown by person/project/work type, notes)
- **Dashboard — setEntries prop** — Dashboard now receives `setEntries` from App (required for Quick Log)
- **All Entries — Notes search** — Added `fNotes` filter state and "Search notes" text input to Filters panel; filters entry notes case-insensitively
- **Projects — LOE t-shirt sizing** — Added `LOE_SIZES` / `LOE_LABELS` constants (XS/S/M/L/XL/XXL); LOE field on ProjectForm (pill toggle + duration label); loeSize stored in project data model; displayed as teal badge on project cards
- **Exec View — sync** — Replaced local PRODUCTIVE/OVERHEAD arrays with global PRODUCTIVE_TYPES/OVERHEAD_TYPES; removed "Project Lifecycle" from productive classification; added LOE column to Portfolio Scorecard table
- **Pilot Tracker tab** — Removed from TABS array and render tree; PilotTracker component remains in file but is no longer accessible
- **Backup** — 4-file backup saved: JSX, JSON, CLAUDE, LOG (all dated 2026-05-05, overwrites earlier same-day backup)

---

## 2026-03-10

- **Project created** — Labs project workspace scaffolded by TARS. Intake captured from session notes.
- **CLAUDE.md** (NEW) — Project context file created: intake, team, features, data model, file index, run instructions, roadmap, graduation criteria, known bugs.
- **Folder structure** — `src/`, `data/`, `docs/` created.
- **pmo-time-tracker.jsx** — Moved from ZUMIEZ root → `src/`. Full React component, 5 tabs, Recharts, inline styles.
- **pmo-time-tracker-projects.json** — Moved from ZUMIEZ root → `data/`. Seed data: 3 projects, team, work types.
- **pmo-time-tracker-entries.json** — Moved from ZUMIEZ root → `data/`. 20 seed time entries.
- **pmo-time-tracker-session-notes.md** — Moved from ZUMIEZ root → `docs/`. Original build notes from 2026-03-05.

---

## 2026-03-05

- **Initial build** — Full prototype built in a single Claude session. See `docs/pmo-time-tracker-session-notes.md` for full session log.
