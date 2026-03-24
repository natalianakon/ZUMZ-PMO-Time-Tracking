# PMO Time Tracker — Claude Code Context

> **Project:** PMO Time Tracking Tool
> **Last Updated:** 2026-03-11
> **Status:** Pilot Active — Week 1 of 13 (Mar 10 – Jun 5, 2026)
> **Owner:** Natalia Nakonieczny
> **Read this file first.** It is the primary context file for all work in this project.

---

## Intake

| Question | Answer |
|----------|--------|
| **Spark** | No lightweight way to track how the PMO team is spending time across projects — spreadsheets or nothing |
| **Problem** | Without time tracking, it's impossible to report on team capacity, prove where effort is going, or make data-driven staffing/prioritization decisions |
| **The Dream** | A dashboard where Natalia can see team hours by project, work type, and person — with a "Big Ideas" layer that ties strategic initiatives to actual time investment. Eventually: SharePoint-backed persistence, Slack/Teams integration, weekly digest exports |
| **Who Benefits** | Natalia (PMO Lead), Cara (PMO Analyst), Quin (PMO Coordinator) — 3-person PMO team |
| **Why Now** | Pilot started March 10, 2026 — 13 weeks of real data to build ROI case |
| **Smallest Version** | ✅ Built — React/Vite app with 7 tabs, file-system persistence via local API, auto-save |

---

## 1. What It Is

A full-featured React time tracking tool for the Zumiez PMO team. Runs locally via Vite dev server with a built-in file API — data auto-saves to `data/pmo-tracker-live.json` on every change. No manual import/export needed for day-to-day use.

**Current state:** Pilot active as of 2026-03-11. Real projects and Big Ideas loaded. Auto-save to disk working.

---

## 2. Team

| Person | Role | Tracker ID | Color |
|--------|------|-----------|-------|
| Natalia Nakonieczny | PMO Lead | `natalia` | Orange `#F05A22` |
| Cara | PMO Analyst | `member2` | Teal `#0E8A7E` |
| Quin Tuckman | PMO Manager | `member3` | Purple `#8B5CF6` |

---

## 3. Active Projects (as of 2026-03-11)

| Project | ID | Priority | PM | Sponsor | End Date |
|---------|----|---------|-----|---------|----------|
| Fluent HQ - SWARM | `1ua0rk` | High | Natalia | Greg Zeck | 2026-03-24 |
| PMO Time Tracking Tool | `teobb2` | Low | Natalia | Paul Kisicki, Quin Tuckman | 2026-06-11 |

---

## 4. Big Ideas Pool (as of 2026-03-11)

| ID | Title |
|----|-------|
| `sijxko` | Platform - Data |
| `7fz9fv` | Platform - DTG |
| `4v8aom` | Trade Area |
| `xhn2ip` | Hatch |
| `7xahjv` | Customer Data |
| `3hif37` | N/A - Other |

---

## 5. Features

### 7 Navigation Tabs

| Tab | Purpose |
|-----|---------|
| **Dashboard** | KPI tiles, 7-day trend chart, hours by project, work type donut, recent activity |
| **Log Time** | Entry form with quick-pick hours, Big Idea linking (all global ideas available) |
| **All Entries** | Full log with filters, sort, inline edit, delete, CSV export |
| **Team** | Per-person KPIs, 14-day chart, work type + project breakdowns |
| **Projects** | Project cards with timeline progress |
| **💡 Big Ideas** | Master add/edit/delete list |
| **Pilot Tracker** | 13-week pilot progress (Mar 10 – Jun 5, 2026) |

### Key Concept: Big Ideas
Big Ideas live in a **global pool** (`globalIdeas`). All ideas are available in Log Time when any project is selected — no pre-linking step required.

---

## 6. Data Model

### Entry
```json
{
  "id": "string",
  "person": "natalia | member2 | member3",
  "date": "YYYY-MM-DD",
  "project": "project_id",
  "workType": "string",
  "bigIdea": "bigIdea_id | empty string",
  "hours": 1.5,
  "notes": "string"
}
```

### Project
```json
{
  "id": "string",
  "name": "string",
  "color": "#hex",
  "status": "Active | On Hold | Complete | Planned",
  "priority": "High | Medium | Low",
  "pm": "team_member_id",
  "sponsor": "string",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "description": "string",
  "bigIdeas": []
}
```

### Global Idea
```json
{ "id": "string", "title": "string", "notes": "string" }
```

### Work Types
Project Work · Big Idea Planning · Project Lifecycle · Stakeholder Communication · Documentation · Meetings · Risk & Issues · Reporting · Admin / Other

---

## 7. Files

| File | Location | Description |
|------|----------|-------------|
| `pmo-time-tracker.jsx` | `src/` | Live source — edit this to change the app |
| `pmo-time-tracker-2026-03-11.jsx` | root | Portable standalone copy — share or paste into Claude |
| `pmo-tracker-live.json` | `data/` | **Always-current data** — auto-saved by the app |
| `pmo-tracker-backup-2026-03-11.json` | `data/` | Dated snapshot — pilot Day 1 with real data |
| `pmo-tracker-backup-2026-03-10.json` | `data/` | Dated snapshot — clean slate (pilot start) |
| `pmo-time-tracker-README.md` | `docs/` | Tool architecture + workflow |
| `LOG-daily-changes.md` | `docs/` | Running change log |

> **Portable copy naming:** `pmo-time-tracker-YYYY-MM-DD.jsx` — saved at root whenever a significant version is cut.
> **Backup naming:** `pmo-tracker-backup-YYYY-MM-DD.json` — cut on demand, drop into `data/`.

---

## 8. How to Run

**Via Claude Code (recommended):**
> Say "start the PMO tracker" — TARS fires up the Vite server and renders it in the Preview panel.

**Portable / sharing:**
1. Grab `pmo-time-tracker-YYYY-MM-DD.jsx` from the root
2. Paste into a Claude chat → ask it to render as an artifact
3. Use ↑ Restore to load a backup JSON if you want real data in it

**Local Vite (manual):**
```bash
cd Natalia/time-tracking
npm run dev
```

---

## GitHub — Pushing Updates

**Repo:** `https://github.com/natalianakon/ZUMZ-PMO-Time-Tracking`

**Push changes (this machine — Keychain handles auth):**
```bash
cd "/Users/natalian/Desktop/ZUMIEZ/Natalia/time-tracking"
git add .
git commit -m "what you changed"
git push
```

**Push on a new machine (token required first time):**
```bash
cd "/Users/natalian/Desktop/ZUMIEZ/Natalia/time-tracking"
git add .
git commit -m "what you changed"
git push https://YOUR_TOKEN@github.com/natalianakon/ZUMZ-PMO-Time-Tracking.git main
```
> Token expires Apr 17, 2026 — regenerate at GitHub → Settings → Developer Settings → Fine-grained tokens.

**Clone fresh on a new machine:**
```bash
cd ~/Desktop
git clone https://github.com/natalianakon/ZUMZ-PMO-Time-Tracking.git
cd ZUMZ-PMO-Time-Tracking
npm install
npm run dev
```

---

## 9. Persistence Architecture

```
App change → auto-save (1s debounce) → pmo-tracker-live.json
"Save a backup" → TARS runs full 4-file backup (see below)
↓ Backup button → dated export download (in-app)
↑ Restore button → load from a backup JSON file (in-app)
```

### "Save a Backup" — Full Backup Protocol

When Natalia says **"save a backup"**, TARS saves all 4 of the following dated files:

| # | File | Saved To | What It Is |
|---|------|----------|-----------|
| 1 | `pmo-tracker-backup-YYYY-MM-DD.json` | `data/` | Live data snapshot — entries, projects, Big Ideas |
| 2 | `pmo-time-tracker-YYYY-MM-DD.jsx` | root | Tool code snapshot — portable, shareable, pasteable into Claude |
| 3 | `CLAUDE-backup-YYYY-MM-DD.md` | `docs/` | Project context snapshot — architecture, projects, roadmap |
| 4 | `LOG-backup-YYYY-MM-DD.md` | `docs/` | Change log snapshot — everything that had happened up to that date |

> Files 1 + 2 are the critical ones. Files 3 + 4 are for project history and retros.
> If the same date already exists, TARS overwrites it with the latest version.

---

## 10. Roadmap

- [ ] SharePoint or real backend (graduation criteria)
- [ ] Cara and Quin onboarded and logging weekly
- [ ] Weekly digest export for status updates
- [ ] Budget tracking per project (actual vs. estimated hours)
- [ ] MCP integration with Teams/Slack

---

## 11. Graduation Criteria

Graduates from Natalia's folder → `zumiez-delivery/active/` when:
- Data persistence solved (SharePoint or equivalent)
- All 3 team members logging weekly
- Reporting cadence established (weekly digest, monthly summary)

---

## 12. Known Bugs Fixed

| Bug | Root Cause | Fix Applied |
|-----|-----------|-------------|
| Sponsor input losing focus | `ProjectForm` defined inside `ProjectsPanel` — remounting on every render | Moved `ProjectForm` to top-level |
| Edit form overflow / cut off | Edit UI in fixed-width card | Edit panel renders full-width above card grid |
| Big Ideas empty in Log Time | Filter only showed project-linked ideas — hidden 2-step UX | Now shows all globalIdeas when any project selected |
| globalIdeas not defined errors | Various scope issues in earlier version | Fixed in JSX rebuild (2026-03-10) |
