<div align="center">

# 💧 HydroWalk

### A modern mobile-first health tracker web app built with React.js

**Stay Hydrated · Stay Active · Stay Healthy**

![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5+-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-Animations-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

## ✨ Overview

**HydroWalk** is a lightweight, fully front-end health reminder web application designed for mobile screens. It helps users track their daily water intake, set walking reminders, stay motivated with daily health quotes, and view a quick summary of their day — all with a beautiful animated UI and zero backend required.

> Built with ❤️ by the **Kanak Bari Team**

---

## 📱 Features

### 💧 Water Reminder Dashboard
- Animated SVG circular progress ring showing hydration percentage
- Track consumed ml against a customisable daily goal (default 2000ml)
- Visual glass-by-glass tracker (up to 10 glasses shown)
- Animated progress bar with dynamic motivational messages
- **Drink Water** button adds one glass at a time
- **Reset** clears today's progress instantly

### ⚙️ Settings Modal
- Change daily water goal — 1500 / 2000 / 2500 / 3000 ml
- Change glass size — 150 / 200 / 250 / 300 / 350 ml
- Toggle reminders on or off
- Smooth bottom-sheet slide-up animation with backdrop blur
- Changes apply instantly and clamp existing progress to the new goal

### 🚶 Walking Reminders
- **Morning Walk card** — 6:00 AM–7:00 AM with toggle switch and confirmation banner
- **Night Walk card** — selectable time (10:00 PM / 11:00 PM / 12:00 AM) with toggle and confirmation

### 🌟 Daily Motivation
- One of 7 health mantras chosen randomly on each page load
- Soft pastel green card with fade-in animation

### 📊 Daily Summary
- Live-synced water progress bar
- Morning walk status (Completed / Not Done)
- Night walk status (time set / Pending)

### 🎬 Welcome Screen
- 3-second animated splash screen on first load
- Gradient background with orbiting health emoji icons
- Smooth fade-in text, auto-transitions to dashboard

---

## 🖥️ Screenshots

| Welcome Screen | Water Dashboard | Settings Modal |
|:-:|:-:|:-:|
| Animated splash with floating icons | Progress ring, glass tracker & buttons | Bottom-sheet with goal & glass size pickers |

| Morning Walk | Night Walk | Daily Summary |
|:-:|:-:|:-:|
| Amber card with toggle | Dark purple card with time selector | Live-synced activity overview |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/hydrowalk.git
cd hydrowalk

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Then open (https://hydrowalk.vercel.app/) in your browser.

### Build for Production

```bash
npm run build
```

The optimised output will be in the `dist/` folder — ready to deploy to Netlify, Vercel, GitHub Pages, or any static host.

---

## 🗂️ Project Structure

```
hydrowalk/
├── public/
│   └── favicon.ico
├── src/
│   ├── HealthTracker.jsx   ← All components in one file
│   └── main.jsx            ← Entry point
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

### Component Map

```
App  (root — owns all shared state)
├── WelcomeScreen
├── SettingsModal
├── HydrationSection
│   └── WaterRing
├── MorningWalkCard
│   └── Toggle
├── NightWalkCard
│   └── Toggle
├── MotivationCard
└── DailySummary
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18+ (functional components + hooks) |
| Build Tool | Vite 5 |
| Styling | Inline CSS-in-JS + global `<style>` keyframes |
| Fonts | Google Fonts — Nunito |
| Animations | Pure CSS keyframes (`fadeSlide`, `float`, `orbit`, `pulse`, `slideUp`) |
| State | `useState`, `useEffect` — no external state library |
| Backend | None — 100% client-side |

---

## ⚙️ Configuration & Defaults

All defaults live in `HealthTracker.jsx` and can be changed before building:

```js
// Default settings object (App component)
const DEFAULT_SETTINGS = {
  dailyGoal:   2000,   // ml
  glassSize:   250,    // ml per drink
  remindersOn: true,
};
```

To add more goal or glass-size options, extend the arrays inside `SettingsModal`:

```js
const goalOptions  = [1500, 2000, 2500, 3000];   // add e.g. 3500
const glassOptions = [150, 200, 250, 300, 350];   // add e.g. 400
```

---

## 🎨 Design Tokens

The app uses a consistent palette defined inline. Key colours:

| Role | Value |
|---|---|
| Primary gradient | `#1d4ed8` → `#4338ca` → `#6d28d9` |
| Page background | `#e0f2fe` → `#ede9fe` → `#f0fdf4` |
| Morning card | `#fef3c7` → `#fbbf24` |
| Night card | `#1e1b4b` → `#4c1d95` |
| Motivation card | `#ecfdf5` → `#a7f3d0` |
| Footer | `#0f172a` → `#1e293b` |

---

## 📐 Responsive Behaviour

- **Mobile** (`≤ 420px`) — fills the full screen width, native app feel
- **Tablet / Desktop** — content is capped at `420px` and horizontally centred via `body { display:flex; justify-content:center }`, with a soft indigo glow shadow making it look like a phone frame

No media queries are required; the single `max-width` rule handles everything.

---

## 🙌 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m "feat: add your feature"`
4. Push to the branch — `git push origin feature/your-feature`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 💙 Acknowledgements

- [Google Fonts — Nunito](https://fonts.google.com/specimen/Nunito) for the friendly typography
- [React](https://react.dev/) for the component model
- [Vite](https://vitejs.dev/) for the lightning-fast dev experience

---

<div align="center">

**Built By — Kanak Bari Team**

*Stay Healthy, Stay Hydrated 💧*

</div>
