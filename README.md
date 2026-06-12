# 🌿 EcoTrack — Carbon Footprint Awareness Platform

> **Google Prompt Wars – Challenge 3: Carbon Footprint Awareness Platform**

A comprehensive, gamified platform helping individuals **understand**, **track**, and **reduce** their carbon footprint through personalized insights, real emission data, and community engagement.

---

## 🏆 Prompt Wars Submission Details

### Chosen Vertical
**Carbon Footprint Awareness Platform**
We chose this vertical to create a highly engaging, data-driven application that takes the complex global issue of carbon emissions and makes it personal, understandable, and actionable for the everyday user.

### Approach and Logic
Our approach heavily leans into **Gamification and Behavioral Economics**. 
Instead of just showing users a daunting number, we break down their footprint into a 5-step interactive wizard (Transport, Home, Food, Shopping, Flights). We calculate a unified **Carbon Score (0-1000)** based on real-world IPCC/EPA emission factors to provide a clear baseline. From there, users are incentivized to return daily through XP, streak shields, and a leveling system that rewards logging low-carbon activities and committing to reduction actions.

### How the Solution Works
EcoTrack is a fully client-side React 18 application using Vite and Tailwind CSS.
1. **Onboarding & Calculation:** Users complete a wizard to establish their baseline kg CO₂e/year.
2. **Dashboard:** Visualizes the user's score, category breakdown, and compares them to global averages using Recharts.
3. **Daily Tracking:** Users log preset or custom activities to earn XP and build streaks.
4. **Action Center & Offsets:** Users can commit to long-term reductions (e.g., "Switch to LED bulbs") or simulate purchasing carbon offsets to lower their net footprint.
5. **Community:** Users can see how they rank against others on a leaderboard and read a curated eco-news feed.
*Note: All data is securely persisted in the user's browser via `localStorage` with robust type-validation to prevent tampering.*

### Assumptions Made
1. **Data Averages:** We assume standard IPCC/EPA averages for vehicle emissions and dietary impacts (e.g., 0.21 kg/mile for a gas car), which serve as accurate approximations rather than exact scientific measurements.
2. **Storage Constraints:** We assume the user relies on a single device, as `localStorage` does not sync across multiple devices without a backend.
3. **Offset Pricing:** Simulated carbon offsets use a flat rate (e.g., $10-$25/tonne) reflective of current voluntary carbon market prices.

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
