# 🌿 EcoTrack — Carbon Footprint Awareness Platform

> **Google Prompt Wars – Challenge 3: Carbon Footprint Awareness Platform**

A comprehensive, gamified platform helping individuals **understand**, **track**, and **reduce** their carbon footprint through personalized insights, real emission data, and community engagement.

---

## 🚀 Live Features

### 📊 Carbon Score (0–1000)
Real-time score based on your annual emissions. Formula: `1000 × (1 – kg CO₂e / 20,000)`. Visual SVG gauge with colour-coded glow (green → amber → red).

### 🧮 Carbon Calculator (5-Step Wizard)
Complete footprint assessment across:
- **Transport** — car type, weekly miles, public transit, cycling
- **Home Energy** — electricity, gas, renewables %, household size
- **Food** — diet type (vegan → meat-heavy), food waste, local produce
- **Shopping** — clothing, electronics, general consumption
- **Flights** — short/medium/long haul per year

Uses real-world emission factors (IPCC/EPA data).

### 📅 Activity Tracker
- 12 quick-log preset actions (tap to add)
- Custom activity entry with CO₂ impact
- Daily/weekly/all-time views
- Monthly progress bar vs reduction target
- XP rewards on every log entry

### ⚡ Action Center (30+ Actions)
Curated reduction actions with real CO₂ savings, difficulty ratings, and practical tips. Filter by category and difficulty. Track commitments and mark actions as completed.

### 🌳 Carbon Offset Marketplace
Simulate purchasing verified carbon offsets across 6 project types:
Amazon Reforestation · Indian Solar Farm · Kenyan Wind Energy · US Methane Capture · Pacific Kelp Restoration · Uganda Biochar

### 🏆 Social Leaderboard
Compete with a community of eco-conscious users. See your rank, beat percentages, and participate in weekly challenges.

### 📰 Eco News Feed
12 curated climate news articles with category filters (Policy · Tech · Science · Tips), trending hashtags, daily rotating eco facts, and bookmark support.

### 🎮 Gamification
- **20 achievements** (Common / Rare / Epic / Legendary rarity)
- **Level system**: Eco Seedling → Eco Sapling → Eco Tree → Eco Forest → Planet Guardian → Carbon Champion
- **XP rewards** on every action
- **Streak counter** for daily logging

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Bundler | Vite 5 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts |
| Icons | Lucide React |
| State | React Context + useReducer |
| Storage | localStorage (no backend needed) |

---

## 📦 Setup & Run

```bash
# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build
```

---

## 🌍 Emission Factors Used

| Source | Factor |
|--------|--------|
| Petrol/Gas car | 0.21 kg CO₂e/mile |
| Electric car | 0.05 kg CO₂e/mile |
| Hybrid car | 0.11 kg CO₂e/mile |
| Bus | 0.089 kg CO₂e/mile |
| Electricity (US avg) | 0.386 kg CO₂e/kWh |
| Natural gas | 0.203 kg CO₂e/kWh |
| Short-haul flight | 255 kg CO₂e per trip |
| Medium-haul flight | 585 kg CO₂e per trip |
| Long-haul flight | 1,200 kg CO₂e per trip |
| Vegan diet | 1.5 kg CO₂e/day |
| Omnivore diet | 3.3 kg CO₂e/day |

*Sources: IPCC AR6, EPA eGRID, Oxford University Food & Climate Research*

---

## 🎯 Key Benchmarks

| Benchmark | Annual CO₂e |
|-----------|------------|
| 🇺🇸 US average | 16 tonnes |
| 🌍 World average | 4.7 tonnes |
| 🎯 Paris Agreement target | 2.3 tonnes |
| 🏆 EcoTrack score 1000 | 0 tonnes |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Onboarding.tsx      # Welcome + name setup
│   ├── Dashboard.tsx       # Main hub: score, charts, tips
│   ├── Calculator.tsx      # 5-step emissions wizard
│   ├── ActivityTracker.tsx # Daily eco-action logger
│   ├── ActionCenter.tsx    # Reduction actions + offset marketplace
│   ├── Community.tsx       # Leaderboard + news feed
│   ├── Profile.tsx         # Achievements, stats, history
│   └── Navbar.tsx          # Bottom tab navigation
├── context/
│   └── AppContext.tsx       # Global state (useReducer + localStorage)
├── data/
│   └── emissionData.ts     # All emission factors, actions, achievements, news
└── types/
    └── index.ts            # TypeScript type definitions
```

---

Built with ❤️ and Claude Code for Google Prompt Wars 2026.
