# 🎮 Developer Player 1 — Retro Portfolio & Dashboard

Welcome to **Mosa**, a retro 8-bit NES-style developer portfolio and live personal metrics tracker dashboard. This website showcases the work, hobbies, and live activity tracking of **Omar Morales** (Developer Player 1), built with a pixel-art aesthetic.

The site is fully responsive and integrates with a live "JARVIS" backend to sync workouts, expenses, and system status telemetry in real-time.

---

## 🚀 Key Features

*   **🎮 Retro 8-bit NES Styling:** Built using `nes.css` to deliver a nostalgic, interactive gaming console experience complete with pixelated borders, retro buttons, and arcade components.
*   **💬 Interactive Dialogues:** Dynamic dialogue boxes with custom blinking block cursors and typewriter effects for the advisor and fitness coach characters.
*   **📊 Live Jarvis Telemetry Sync:** Connects to a live FastAPI + Telegram bot backend (`jarvis-life-tracker`) to retrieve and render statistics for the last 7 days.
*   **🏃 Fitness RPG (Workout Quest Log):**
    *   Tracks workout count, consistency, and active duration.
    *   Gamified level system where **1 minute of activity = 1 XP**.
    *   Features a custom interactive **Quest Map** (GitHub-style contribution grid) showing daily training volume.
*   **💰 Financial Analytics Dashboard:**
    *   Breakdown of monthly spending categories and payment method metrics.
    *   Detailed merchant leaderboards and tiny purchases highlights (under $100 MXN).
    *   Fully protected by a secure **Auth Gate** (PIN challenge-response verification).
*   **🏆 Inventory & Collectibles:** Showcases active software equipment (projects) and achievements inventory (hobbies) synced directly from the cloud.

---

## 🛠️ Technology Stack

*   **Framework:** [Astro](https://astro.build/) (Static Site Generation / Hydration)
*   **Interactive Components:** React (used for complex state, charts, grids, and dashboard elements)
*   **Design System:** [NES.css](https://nostalgic-css.github.io/NES.css/) (NES-style CSS framework)
*   **Styling:** Vanilla CSS (custom pixel typography, smooth transitions, and responsive grid layouts)
*   **Data Integration:** Fetch APIs syncing with the FastAPI `jarvis-life-tracker` endpoints.

---

## 📁 Project Structure

```text
├── public/                  # Static assets (favicons, pixel sprites, avatar)
│   ├── profile.png          # Player 1 Avatar
│   ├── advisor.png          # Finance advisor character sprite
│   └── trainer.png          # Fitness coach character sprite
├── src/
│   ├── components/          # Reusable Retro UI widgets (React & Astro)
│   │   ├── AboutMe.astro    # Player character bio and dialogue box
│   │   ├── JarvisDashboard  # Summarized telemetry card hub
│   │   ├── WorkoutTracker   # Fitness RPG level tracker & Quest Map grid
│   │   └── FinanceCharts    # Spending breakdowns, charts, and terminal ledgers
│   ├── layouts/
│   │   └── Layout.astro     # Core page layout, global CSS, and Boot preloader
│   ├── lib/
│   │   └── analytics.js     # Finance/Workout stats parsing & calculation utilities
│   └── pages/               # Routing directories
│       ├── index.astro      # Main Portfolio Landing Page
│       ├── finances.astro   # Financial Analytics (PIN Protected)
│       └── workouts.astro   # Workout Analytics
├── package.json             # Build configurations & npm packages
└── .env                     # App keys & authentication parameters
```

---

## ⚙️ Development & Local Setup

### 1. Prerequisites
- Node.js (version `>= 20.0.0`)
- npm or yarn

### 2. Environment Configuration
Create a `.env` file in the root directory and add the following keys:
```env
PUBLIC_API_TOKEN="your-api-token"
PUBLIC_FINANCE_PIN="sha256-hashed-pin-string"
```

### 3. Local Development Run
Install the dependencies and start the development server:
```sh
# Install npm dependencies
npm install

# Start local server at http://localhost:4321
npm run dev
```

### 4. Build for Production
To generate a static build bundle inside `./dist/`:
```sh
npm run build
```

---

## 🧞 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local dev server at `localhost:4321` |
| `npm run build` | Compiles your production site to `./dist/` |
| `npm run preview` | Previews your build locally before deploying |
| `npm run astro ...` | Runs CLI commands (e.g. `astro check`, `astro add`) |
