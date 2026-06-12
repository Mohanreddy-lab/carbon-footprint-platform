import type {
  CarbonBaseline, EmissionBreakdown, CarbonAction, Achievement,
  OffsetProject, NewsArticle, LeaderboardEntry, MonthlyData, Activity
} from '../types';

export const CAR_FACTORS: Record<string, number> = {
  none: 0,
  electric: 0.05,
  hybrid: 0.11,
  gasoline: 0.21,
  diesel: 0.19,
};

export const DIET_DAILY_KG: Record<string, number> = {
  vegan: 1.5,
  vegetarian: 2.0,
  flexitarian: 2.5,
  omnivore: 3.3,
  'heavy-meat': 4.5,
};

export const WASTE_MULTIPLIER: Record<string, number> = {
  low: 0.9,
  medium: 1.0,
  high: 1.15,
};

export const SHOPPING_BASE_KG: Record<string, number> = {
  minimal: 100,
  average: 400,
  frequent: 800,
};

export function calculateEmissions(b: CarbonBaseline): EmissionBreakdown {
  const carKg = b.transport.carMilesPerWeek * (CAR_FACTORS[b.transport.carType] ?? 0) * 52;
  const transitKg = b.transport.publicTransitMilesPerWeek * 0.089 * 52;
  const transport = Math.round(carKg + transitKg);

  const gridFactor = 0.386 * (1 - b.home.renewablePercentage / 100);
  const elecKg = (b.home.electricityKwhPerMonth * gridFactor * 12) / b.home.householdSize;
  const gasKg = (b.home.gasKwhPerMonth * 0.203 * 12) / b.home.householdSize;
  const home = Math.round(elecKg + gasKg);

  const dietKg = DIET_DAILY_KG[b.food.dietType] * 365;
  const wasteAdj = WASTE_MULTIPLIER[b.food.foodWasteLevel];
  const localAdj = 1 - b.food.localFoodPercentage * 0.001;
  const food = Math.round(dietKg * wasteAdj * localAdj);

  const clothingKg = b.shopping.clothingItemsPerYear * 15;
  const electronicsKg = b.shopping.electronicsPerYear * 300;
  const shopping = Math.round(clothingKg + electronicsKg + SHOPPING_BASE_KG[b.shopping.shoppingLevel]);

  const flights = Math.round(
    b.flights.shortHaulPerYear * 255 +
    b.flights.mediumHaulPerYear * 585 +
    b.flights.longHaulPerYear * 1200
  );

  const total = transport + home + food + shopping + flights;
  return { transport, home, food, shopping, flights, total };
}

export function calculateCarbonScore(totalKg: number): number {
  return Math.max(0, Math.round(1000 * (1 - totalKg / 20000)));
}

export function generateMonthlyData(annualKg: number): MonthlyData[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyBase = annualKg / 12;
  const target = monthlyBase * 0.85;
  const variance = [1.12, 1.08, 1.05, 0.97, 0.92, 0.88, 0.90, 0.93, 0.96, 1.00, 1.06, 1.13];
  return months.map((month, i) => ({
    month,
    emissions: Math.round(monthlyBase * variance[i]),
    target: Math.round(target),
  }));
}

export function getTopCategory(emissions: EmissionBreakdown): string {
  const cats = [
    { key: 'transport', val: emissions.transport },
    { key: 'home', val: emissions.home },
    { key: 'food', val: emissions.food },
    { key: 'shopping', val: emissions.shopping },
    { key: 'flights', val: emissions.flights },
  ];
  return cats.sort((a, b) => b.val - a.val)[0].key;
}

export function getPersonalizedTip(emissions: EmissionBreakdown | null): string {
  if (!emissions) return 'Complete the carbon calculator to get personalized tips!';
  const top = getTopCategory(emissions);
  const tips: Record<string, string> = {
    transport: 'Your transportation is your biggest carbon source. Try replacing one weekly car trip with public transit — it can save 450 kg CO₂ per year.',
    home: 'Home energy is your top emission driver. A smart thermostat can cut heating and cooling emissions by up to 500 kg/year with zero lifestyle change.',
    food: 'Your diet has the biggest impact. Adding 3 plant-based days per week saves 300 kg CO₂ annually — that\'s like planting 14 trees.',
    shopping: 'Shopping habits are a major contributor. Buying second-hand clothing for a year saves roughly 350 kg CO₂ vs buying new.',
    flights: 'Flying is your top source. Skipping just one short-haul flight saves 255 kg CO₂ — equivalent to 3 weeks of an average diet.',
  };
  return tips[top] ?? 'Small changes add up! Air-drying your laundry instead of using a dryer can save 150 kg CO₂ per year with zero effort.';
}

export const QUICK_ACTIVITIES: Omit<Activity, 'id' | 'date'>[] = [
  { category: 'transport', description: 'Took bus or train', co2Impact: -2.5, icon: '🚌', points: 10 },
  { category: 'transport', description: 'Rode bike instead of drove', co2Impact: -3.0, icon: '🚲', points: 12 },
  { category: 'transport', description: 'Walked instead of drove', co2Impact: -2.0, icon: '🚶', points: 8 },
  { category: 'transport', description: 'Worked from home today', co2Impact: -3.5, icon: '🏠', points: 14 },
  { category: 'food', description: 'Ate a fully vegan meal', co2Impact: -1.5, icon: '🥗', points: 6 },
  { category: 'food', description: 'Ate a vegetarian meal', co2Impact: -0.8, icon: '🌱', points: 4 },
  { category: 'food', description: 'Avoided beef today', co2Impact: -2.0, icon: '🥩', points: 8 },
  { category: 'energy', description: 'Air-dried laundry', co2Impact: -0.7, icon: '👗', points: 3 },
  { category: 'energy', description: 'Turned off unused lights & devices', co2Impact: -0.3, icon: '💡', points: 2 },
  { category: 'energy', description: 'Saved 5 min on shower', co2Impact: -0.2, icon: '🚿', points: 2 },
  { category: 'shopping', description: 'Bought second-hand item', co2Impact: -3.0, icon: '♻️', points: 12 },
  { category: 'other', description: 'Composted food scraps', co2Impact: -0.5, icon: '🌿', points: 3 },
];

export const DEFAULT_ACTIONS: CarbonAction[] = [

  {
    id: 'a1', title: 'Walk or Bike Short Trips', description: 'Replace short car trips under 2 miles with walking or cycling.', category: 'transport',
    co2SavedPerYear: 400, difficulty: 'easy', timeToImplement: 'Today', committed: false,
    icon: '🚲', tips: ['Keep a bike lock handy', 'Use Google Maps cycling directions', 'Pack a light backpack'],
  },
  {
    id: 'a2', title: 'Use Public Transit Once a Week', description: 'Swap your car commute for a bus or train one day each week.', category: 'transport',
    co2SavedPerYear: 450, difficulty: 'easy', timeToImplement: 'This week', committed: false,
    icon: '🚌', tips: ['Download your local transit app', 'Use travel time to read or podcast', 'Keep a transit card loaded'],
  },
  {
    id: 'a3', title: 'Carpool to Work', description: 'Share your commute with a colleague or neighbor.', category: 'transport',
    co2SavedPerYear: 900, difficulty: 'medium', timeToImplement: 'This month', committed: false,
    icon: '🚗', tips: ['Use apps like Waze Carpool or BlaBlaCar', 'Agree on a flexible schedule', 'Share fuel costs evenly'],
  },
  {
    id: 'a4', title: 'Work From Home 2 Days/Week', description: 'Remote work eliminates commute emissions on those days.', category: 'transport',
    co2SavedPerYear: 680, difficulty: 'medium', timeToImplement: 'This month', committed: false,
    icon: '💻', tips: ['Discuss with your manager', 'Set up a productive home workspace', 'Batch meetings on office days'],
  },
  {
    id: 'a5', title: 'Switch to Electric Vehicle', description: 'Replace your petrol/diesel car with a battery-electric vehicle.', category: 'transport',
    co2SavedPerYear: 2500, difficulty: 'hard', timeToImplement: '6–12 months', committed: false,
    icon: '⚡', tips: ['Check government EV incentives', 'Calculate charging costs vs fuel', 'Find local charging infrastructure'],
  },
  {
    id: 'a6', title: 'Go Car-Free', description: 'Rely entirely on public transit, cycling, and walking.', category: 'transport',
    co2SavedPerYear: 3000, difficulty: 'hard', timeToImplement: '3–6 months', committed: false,
    icon: '🚶', tips: ['Try for one month first', 'Combine transit with a folding bike', 'Use car-share for rare long trips'],
  },
  {
    id: 'a7', title: 'Maintain Tire Pressure', description: 'Properly inflated tires improve fuel efficiency by up to 3%.', category: 'transport',
    co2SavedPerYear: 100, difficulty: 'easy', timeToImplement: 'Today', committed: false,
    icon: '🔧', tips: ['Check pressure monthly', 'Many gas stations have free air pumps', 'Under-inflated tires also wear faster'],
  },

  {
    id: 'a8', title: 'Switch to LED Bulbs', description: 'Replace all incandescent bulbs with LEDs — they use 75% less energy.', category: 'home',
    co2SavedPerYear: 63, difficulty: 'easy', timeToImplement: 'Today', committed: false,
    icon: '💡', tips: ['LEDs last 25x longer than incandescents', 'Start with the most-used rooms', 'Look for ENERGY STAR certified'],
  },
  {
    id: 'a9', title: 'Unplug Electronics When Not in Use', description: 'Standby power ("vampire power") accounts for 5–10% of home electricity use.', category: 'home',
    co2SavedPerYear: 50, difficulty: 'easy', timeToImplement: 'Today', committed: false,
    icon: '🔌', tips: ['Use smart power strips', 'Unplug chargers when not charging', 'Enable auto-sleep on computers'],
  },
  {
    id: 'a10', title: 'Air Dry Clothes', description: 'Skip the tumble dryer and line-dry or rack-dry your laundry.', category: 'home',
    co2SavedPerYear: 150, difficulty: 'easy', timeToImplement: 'Today', committed: false,
    icon: '👗', tips: ['Use a drying rack indoors in winter', 'Clothes last longer when air dried', 'Spin at higher speed before drying'],
  },
  {
    id: 'a11', title: 'Reduce Shower Time by 5 Minutes', description: 'Shorter showers save both water heating energy and water itself.', category: 'home',
    co2SavedPerYear: 17, difficulty: 'easy', timeToImplement: 'Today', committed: false,
    icon: '🚿', tips: ['Use a shower timer or playlist', 'Turn off water while soaping up', 'Cold finishes are refreshing'],
  },
  {
    id: 'a12', title: 'Install a Smart Thermostat', description: 'Automatically optimises heating/cooling schedules to avoid waste.', category: 'home',
    co2SavedPerYear: 500, difficulty: 'medium', timeToImplement: '1 week', committed: false,
    icon: '🌡️', tips: ['Models: Nest, Ecobee, Honeywell', 'Saves $50–150/year on bills too', 'Set "away" schedules when travelling'],
  },
  {
    id: 'a13', title: 'Switch to Green Energy Provider', description: 'Source your electricity from certified renewable suppliers.', category: 'home',
    co2SavedPerYear: 1200, difficulty: 'medium', timeToImplement: '1 month', committed: false,
    icon: '☀️', tips: ['Look for 100% renewable tariffs', 'Check green energy certificates', 'Often costs similar to standard tariffs'],
  },
  {
    id: 'a14', title: 'Install Solar Panels', description: 'Generate your own clean electricity and reduce grid dependence.', category: 'home',
    co2SavedPerYear: 1500, difficulty: 'hard', timeToImplement: '3–6 months', committed: false,
    icon: '🌞', tips: ['Check local solar incentives/tax credits', 'South-facing roof is ideal', 'Payback period is typically 5–8 years'],
  },
  {
    id: 'a15', title: 'Improve Home Insulation', description: 'Proper insulation cuts heating and cooling energy by up to 30%.', category: 'home',
    co2SavedPerYear: 1000, difficulty: 'hard', timeToImplement: '1–3 months', committed: false,
    icon: '🏠', tips: ['Start with loft/attic insulation', 'Draught-proof doors and windows', 'Check for government grants first'],
  },
  {
    id: 'a16', title: 'Install a Heat Pump', description: 'Replace gas boiler with an air-source or ground-source heat pump.', category: 'home',
    co2SavedPerYear: 800, difficulty: 'hard', timeToImplement: '1–3 months', committed: false,
    icon: '🌀', tips: ['Check heat pump grants in your region', 'Pair with solar for maximum impact', 'Great for underfloor heating'],
  },

  {
    id: 'a17', title: 'Reduce Food Waste by 25%', description: 'Plan meals, use leftovers, and freeze food before it spoils.', category: 'food',
    co2SavedPerYear: 80, difficulty: 'easy', timeToImplement: 'This week', committed: false,
    icon: '♻️', tips: ['Use the FIFO rule in your fridge', 'Plan weekly meals before shopping', 'Freeze bread before it goes stale'],
  },
  {
    id: 'a18', title: 'Buy Local Produce', description: 'Local food has a lower transport footprint and supports farmers.', category: 'food',
    co2SavedPerYear: 100, difficulty: 'easy', timeToImplement: 'This week', committed: false,
    icon: '🌿', tips: ['Visit a weekly farmers market', 'Join a local CSA (veg box scheme)', 'Seasonal produce is cheapest & freshest'],
  },
  {
    id: 'a19', title: 'Start Composting', description: 'Divert food scraps from landfill (which produces methane) to compost.', category: 'food',
    co2SavedPerYear: 60, difficulty: 'easy', timeToImplement: '1 week', committed: false,
    icon: '🌱', tips: ['Use a small kitchen caddy', 'Community composting sites accept most food waste', 'Worm bins work well in apartments'],
  },
  {
    id: 'a20', title: 'Eat Plant-Based 3 Days/Week', description: 'Replacing meat with plants on three days saves significant CO₂.', category: 'food',
    co2SavedPerYear: 300, difficulty: 'medium', timeToImplement: 'This week', committed: false,
    icon: '🥗', tips: ['Start with cuisines you already enjoy (Indian dals, pasta primavera)', 'Try lentil-based versions of favourites', 'Batch cook plant-based lunches'],
  },
  {
    id: 'a21', title: 'Cut Beef Consumption by Half', description: 'Beef has the highest emissions of any food — reducing it makes a big impact.', category: 'food',
    co2SavedPerYear: 400, difficulty: 'medium', timeToImplement: 'This week', committed: false,
    icon: '🥩', tips: ['Try chicken or pork as a transition step', 'Mushroom and lentil bolognese is satisfying', 'Beef-free weeks are a growing trend'],
  },
  {
    id: 'a22', title: 'Go Vegetarian', description: 'A vegetarian diet cuts food emissions by up to 50% vs average omnivore.', category: 'food',
    co2SavedPerYear: 600, difficulty: 'hard', timeToImplement: '1–3 months', committed: false,
    icon: '🌾', tips: ['Ensure adequate protein: eggs, dairy, legumes, tofu', 'Explore world cuisines — most have rich vegetarian traditions', 'Gradual transition is easier than overnight'],
  },
  {
    id: 'a23', title: 'Go Fully Vegan', description: 'A vegan diet has the lowest food-related carbon footprint of any diet.', category: 'food',
    co2SavedPerYear: 900, difficulty: 'hard', timeToImplement: '3–6 months', committed: false,
    icon: '🥦', tips: ['Supplement B12, D3, and Omega-3', 'Nutritional yeast adds cheesy flavour', 'Tofu, tempeh, seitan are versatile proteins'],
  },

  {
    id: 'a24', title: 'Buy Second-Hand Clothing', description: 'Thrift shops and apps like Vinted, Depop, and ThredUp extend garment life.', category: 'shopping',
    co2SavedPerYear: 350, difficulty: 'easy', timeToImplement: 'This week', committed: false,
    icon: '👗', tips: ['Apps: Vinted, Depop, eBay, ThredUp', 'Charity shops have hidden gems', 'Wash and air out before wearing'],
  },
  {
    id: 'a25', title: 'Repair Instead of Replace Electronics', description: 'Fix phones, appliances, and gadgets rather than buying new ones.', category: 'shopping',
    co2SavedPerYear: 200, difficulty: 'easy', timeToImplement: 'When needed', committed: false,
    icon: '🔧', tips: ['iFixit has repair guides for everything', 'Many cities have repair cafés', 'Phone screen repairs cost $50–100 vs $800+ for new'],
  },
  {
    id: 'a26', title: 'Buy Quality, Buy Once', description: 'Invest in durable, long-lasting goods instead of cheap disposables.', category: 'shopping',
    co2SavedPerYear: 250, difficulty: 'medium', timeToImplement: 'Ongoing', committed: false,
    icon: '🏆', tips: ['Read reviews for longevity (not just features)', 'Consider cost-per-use not sticker price', 'Brands with lifetime warranties are often worth it'],
  },
  {
    id: 'a27', title: 'Minimise Fast Fashion', description: 'The fashion industry accounts for 10% of global CO₂ — buy less, choose better.', category: 'shopping',
    co2SavedPerYear: 400, difficulty: 'medium', timeToImplement: 'This month', committed: false,
    icon: '👚', tips: ['Do a "30 wears" test before buying', 'Capsule wardrobes reduce decision fatigue', 'Clothing swaps with friends are fun & free'],
  },

  {
    id: 'a28', title: 'Skip One Short-Haul Flight', description: 'Replace a trip under 3 hours with train, bus, or video call.', category: 'flights',
    co2SavedPerYear: 255, difficulty: 'medium', timeToImplement: 'Next trip', committed: false,
    icon: '✈️', tips: ['Trains are often faster door-to-door for <500km', 'Night trains save a hotel night', 'Video calls work for many meetings'],
  },
  {
    id: 'a29', title: 'Choose Train Over Short-Haul Flight', description: 'European trains emit up to 90% less CO₂ per km than flying.', category: 'flights',
    co2SavedPerYear: 170, difficulty: 'easy', timeToImplement: 'Next trip', committed: false,
    icon: '🚂', tips: ['Book rail via Trainline or Omio', 'Night sleeper trains are a travel experience', 'Eurostar Paris–London: 2.4 hrs vs 4+ hrs airport time'],
  },
  {
    id: 'a30', title: 'Reduce Long-Haul Flights by 1/Year', description: 'A single long-haul round trip can exceed 3 months of driving emissions.', category: 'flights',
    co2SavedPerYear: 2400, difficulty: 'hard', timeToImplement: 'Ongoing', committed: false,
    icon: '🌏', tips: ['Explore local destinations — "staycations" can be amazing', 'When you do fly, go business class less or choose newer aircraft', 'Video conferences save thousands of kg and travel days'],
  },
  {
    id: 'a31', title: 'Offset All Your Flights', description: 'Purchase verified carbon offsets for every flight you take.', category: 'flights',
    co2SavedPerYear: 510, difficulty: 'easy', timeToImplement: 'Next booking', committed: false,
    icon: '🌳', tips: ['Use Gold Standard or VCS-certified offsets', 'Many booking sites now offer offset at checkout', 'Costs typically $5–20 per flight'],
  },
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'ach1', title: 'First Steps', description: 'Complete the carbon calculator', icon: '👣', rarity: 'common', points: 50, unlocked: false, category: 'setup' },
  { id: 'ach2', title: 'Carbon Conscious', description: 'Log your first activity', icon: '🌱', rarity: 'common', points: 25, unlocked: false, category: 'tracking' },
  { id: 'ach3', title: 'Daily Tracker', description: 'Log activities 3 days in a row', icon: '📅', rarity: 'common', points: 75, unlocked: false, category: 'tracking' },
  { id: 'ach4', title: 'Week Warrior', description: '7-day logging streak', icon: '🔥', rarity: 'rare', points: 200, unlocked: false, category: 'tracking' },
  { id: 'ach5', title: 'Month Master', description: '30-day logging streak', icon: '⚡', rarity: 'epic', points: 500, unlocked: false, category: 'tracking' },
  { id: 'ach6', title: 'Action Taker', description: 'Commit to your first reduction action', icon: '✅', rarity: 'common', points: 50, unlocked: false, category: 'actions' },
  { id: 'ach7', title: 'Action Hero', description: 'Commit to 5 or more actions', icon: '🦸', rarity: 'rare', points: 200, unlocked: false, category: 'actions' },
  { id: 'ach8', title: 'Big Saver', description: 'Commit to saving 500+ kg CO₂/year', icon: '💰', rarity: 'rare', points: 300, unlocked: false, category: 'actions' },
  { id: 'ach9', title: 'Eco Champion', description: 'Achieve a carbon score of 700+', icon: '🏆', rarity: 'epic', points: 400, unlocked: false, category: 'score' },
  { id: 'ach10', title: 'Planet Guardian', description: 'Achieve a carbon score of 900+', icon: '🌍', rarity: 'legendary', points: 1000, unlocked: false, category: 'score' },
  { id: 'ach11', title: 'Transit Trooper', description: 'Log 10 public transit trips', icon: '🚌', rarity: 'rare', points: 150, unlocked: false, category: 'tracking' },
  { id: 'ach12', title: 'Plant Power', description: 'Log 10 plant-based meals', icon: '🥗', rarity: 'rare', points: 150, unlocked: false, category: 'tracking' },
  { id: 'ach13', title: 'Carbon Crusher', description: 'Save 1000+ kg CO₂ total via actions', icon: '💪', rarity: 'epic', points: 400, unlocked: false, category: 'actions' },
  { id: 'ach14', title: 'Offset Champion', description: 'Offset 1 tonne (1,000 kg) of CO₂', icon: '🌳', rarity: 'rare', points: 250, unlocked: false, category: 'offset' },
  { id: 'ach15', title: 'Community Star', description: 'Reach top 5 on the leaderboard', icon: '⭐', rarity: 'rare', points: 200, unlocked: false, category: 'social' },
  { id: 'ach16', title: 'Data Nerd', description: 'Fill in all calculator sections accurately', icon: '📊', rarity: 'common', points: 50, unlocked: false, category: 'setup' },
  { id: 'ach17', title: 'Early Adopter', description: 'Join EcoTrack and start your journey', icon: '🐦', rarity: 'common', points: 25, unlocked: false, category: 'setup' },
  { id: 'ach18', title: 'Zero Waster', description: 'Log composting or waste-reduction 7 times', icon: '♻️', rarity: 'rare', points: 150, unlocked: false, category: 'tracking' },
  { id: 'ach19', title: 'Solar Citizen', description: 'Commit to switching to renewable energy', icon: '☀️', rarity: 'epic', points: 300, unlocked: false, category: 'actions' },
  { id: 'ach20', title: 'Flight Free', description: 'Skip all flights for 30 days', icon: '✈️', rarity: 'epic', points: 300, unlocked: false, category: 'tracking' },
];

export const OFFSET_PROJECTS: OffsetProject[] = [
  {
    id: 'op1', name: 'Amazon Reforestation', description: 'Protect and restore tropical rainforest in the Brazilian Amazon, sequestering carbon and preserving biodiversity.',
    location: 'Brazil', costPerTonne: 12, availableTonnes: 500, icon: '🌳', sdgs: [13, 15, 6], category: 'Forestry',
  },
  {
    id: 'op2', name: 'Indian Solar Farm', description: 'Fund expansion of utility-scale solar power in Rajasthan, displacing coal-fired electricity generation.',
    location: 'India', costPerTonne: 15, availableTonnes: 2000, icon: '☀️', sdgs: [7, 13, 11], category: 'Renewable Energy',
  },
  {
    id: 'op3', name: 'Kenyan Wind Energy', description: 'Scale up wind farms on the Kenyan coast, providing clean electricity to 150,000 homes.',
    location: 'Kenya', costPerTonne: 10, availableTonnes: 1500, icon: '💨', sdgs: [7, 8, 13], category: 'Renewable Energy',
  },
  {
    id: 'op4', name: 'US Methane Capture', description: 'Capture and convert methane from dairy farms in Wisconsin, preventing potent greenhouse gas emissions.',
    location: 'USA', costPerTonne: 8, availableTonnes: 800, icon: '🏭', sdgs: [13, 12, 9], category: 'Methane Capture',
  },
  {
    id: 'op5', name: 'Pacific Kelp Restoration', description: 'Restore giant kelp forests in the Pacific Ocean — kelp absorbs CO₂ and provides vital marine habitat.',
    location: 'Pacific Ocean', costPerTonne: 20, availableTonnes: 300, icon: '🌊', sdgs: [14, 13, 15], category: 'Blue Carbon',
  },
  {
    id: 'op6', name: 'Uganda Biochar Agriculture', description: 'Produce biochar from agricultural waste in Uganda, improving soil fertility while locking carbon underground for centuries.',
    location: 'Uganda', costPerTonne: 25, availableTonnes: 200, icon: '🌿', sdgs: [2, 13, 15], category: 'Biochar',
  },
];

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'n1', title: 'Global Solar Capacity Hits 1.5 Terawatts in 2025', summary: 'The world\'s installed solar power capacity crossed 1.5 terawatts in 2025 — a 30% jump from the previous year — driven by massive deployments in China, India, and the US.',
    category: 'tech', date: 'Jan 2026', readingTime: 3, source: 'CleanTech Review', saved: false, tags: ['#SolarEnergy', '#Renewables', '#CleanTech'],
  },
  {
    id: 'n2', title: 'EU Carbon Tax Reduces Emissions 15% in First Year', summary: 'The expanded EU Carbon Border Adjustment Mechanism, in force since 2025, has already cut emissions from key sectors by 15%, exceeding early projections.',
    category: 'policy', date: 'Dec 2025', readingTime: 4, source: 'Climate Policy Journal', saved: false, tags: ['#CarbonTax', '#EUPolicy', '#ClimateAction'],
  },
  {
    id: 'n3', title: 'Electric Vehicle Sales Surpass Petrol Cars Globally', summary: 'For the first time in history, EVs outsold petrol-powered vehicles globally in Q3 2025, marking a historic tipping point in the automotive transition.',
    category: 'tech', date: 'Nov 2025', readingTime: 3, source: 'EV Outlook', saved: false, tags: ['#EVs', '#ElectricVehicles', '#NetZero'],
  },
  {
    id: 'n4', title: 'Plant-Based Diet Cuts Food Footprint by 73%, Study Finds', summary: 'Oxford University researchers confirmed that shifting to a vegan diet reduces food-related carbon emissions by 73% — with a vegetarian diet cutting emissions by 55%.',
    category: 'science', date: 'Oct 2025', readingTime: 5, source: 'Nature Food', saved: false, tags: ['#PlantBased', '#FoodScience', '#DietAndClimate'],
  },
  {
    id: 'n5', title: 'Arctic Sea Ice Reaches 40-Year Summer Low', summary: 'Arctic sea ice extent this summer reached its lowest recorded summer minimum in 40 years, alarming scientists and accelerating calls for faster emissions reductions.',
    category: 'science', date: 'Sep 2025', readingTime: 4, source: 'Arctic Research Centre', saved: false, tags: ['#ArcticIce', '#ClimateScience', '#GlobalWarming'],
  },
  {
    id: 'n6', title: '10 Easiest Ways to Reduce Your Home Carbon Footprint', summary: 'From LED bulbs to smart thermostats — we break down the ten simplest changes you can make at home today, ranked by impact and ease of implementation.',
    category: 'tips', date: 'Jan 2026', readingTime: 6, source: 'EcoLife Magazine', saved: false, tags: ['#HomeCarbon', '#EcoTips', '#Sustainability'],
  },
  {
    id: 'n7', title: 'Carbon Capture Costs Drop 60% Over Five Years', summary: 'Direct air capture technology has seen a 60% cost reduction since 2020, with several startups now offering commercial-scale CO₂ removal at under $200/tonne.',
    category: 'tech', date: 'Dec 2025', readingTime: 3, source: 'Carbon Tech Weekly', saved: false, tags: ['#CarbonCapture', '#DAC', '#ClimateInnovation'],
  },
  {
    id: 'n8', title: 'COP30: 190 Nations Pledge Net-Zero by 2050', summary: 'At the landmark COP30 summit in Belém, Brazil, 190 countries signed the Belém Accord — a binding commitment to achieve net-zero emissions by 2050 with a $5 trillion green transition fund.',
    category: 'policy', date: 'Nov 2025', readingTime: 5, source: 'UN Climate', saved: false, tags: ['#COP30', '#NetZero', '#ClimatePolicy'],
  },
  {
    id: 'n9', title: 'Livestock Responsible for 18% of Global Emissions', summary: 'A comprehensive UN study confirms that the global livestock sector contributes 18% of all greenhouse gas emissions — more than the entire transport sector combined.',
    category: 'science', date: 'Oct 2025', readingTime: 4, source: 'FAO Research', saved: false, tags: ['#FoodSystems', '#MeatEmissions', '#Livestock'],
  },
  {
    id: 'n10', title: 'Best Electric Vehicles of 2026: Range vs Carbon Savings', summary: 'Our guide to the top-rated EVs of 2026, comparing real-world range, total cost of ownership, and lifetime carbon savings compared to equivalent petrol models.',
    category: 'tech', date: 'Jan 2026', readingTime: 7, source: 'EV Consumer Guide', saved: false, tags: ['#EVReview', '#ElectricCars', '#CleanTransport'],
  },
  {
    id: 'n11', title: 'How One Family Reduced Their Carbon Footprint by 60% in a Year', summary: 'The Martínez family from Vancouver shares their journey from average-emitting household to climate leaders — the changes that were easy, the ones that were hard, and the surprising benefits.',
    category: 'tips', date: 'Dec 2025', readingTime: 8, source: 'Green Living Stories', saved: false, tags: ['#PersonalCarbon', '#LowCarbon', '#EcoFamily'],
  },
  {
    id: 'n12', title: 'Carbon Markets Hit $1 Trillion in Annual Transactions', summary: 'Global carbon markets exceeded $1 trillion in annual transactions for the first time in 2025, signalling growing corporate commitment to climate action and nature-based solutions.',
    category: 'policy', date: 'Nov 2025', readingTime: 4, source: 'Bloomberg Green', saved: false, tags: ['#CarbonMarkets', '#Offsets', '#ClimateFinance'],
  },
];

export const COMMUNITY_MEMBERS: LeaderboardEntry[] = [
  { id: 'u1', name: 'Sarah K.', location: 'Stockholm', score: 842, level: 4, streak: 45 },
  { id: 'u2', name: 'Raj P.', location: 'Amsterdam', score: 798, level: 4, streak: 32 },
  { id: 'u3', name: 'Emma L.', location: 'Vancouver', score: 756, level: 3, streak: 28 },
  { id: 'u4', name: 'Carlos M.', location: 'São Paulo', score: 723, level: 3, streak: 21 },
  { id: 'u5', name: 'Yuki T.', location: 'Tokyo', score: 701, level: 3, streak: 15 },
  { id: 'u6', name: 'Aisha O.', location: 'Nairobi', score: 689, level: 3, streak: 12 },
  { id: 'u7', name: 'Lucas B.', location: 'Berlin', score: 654, level: 2, streak: 8 },
  { id: 'u8', name: 'Priya S.', location: 'Singapore', score: 632, level: 2, streak: 6 },
  { id: 'u9', name: 'John D.', location: 'New York', score: 598, level: 2, streak: 4 },
  { id: 'u10', name: 'Maria R.', location: 'Madrid', score: 545, level: 2, streak: 2 },
];

export const ECO_FACTS: string[] = [
  'The average American generates 16 tonnes of CO₂/year — 4× the global average of 4 tonnes.',
  'Producing 1 kg of beef generates 27 kg of CO₂ — the same as driving 115 miles.',
  'Solar panel prices have dropped 99% since 1976, making clean energy cheaper than coal.',
  'Trees absorb about 21 kg of CO₂ per year on average — every one you plant counts.',
  'The fashion industry accounts for 10% of annual global carbon emissions.',
  'Turning off your PC instead of sleep saves up to 65 kg CO₂ per year.',
  'A single long-haul flight can generate more CO₂ than 2 months of daily driving.',
  'Wind energy generates 50× less CO₂ per kWh than coal-fired power plants.',
  'If one million people switched to plant-based diets it would save 1.5 million tonnes CO₂/year.',
  'Electric vehicles have 50–70% lower lifetime emissions than petrol cars even on today\'s grid.',
];

export const LEVELS = [
  { level: 0, title: 'Eco Seedling', minXp: 0, maxXp: 200, icon: '🌱' },
  { level: 1, title: 'Eco Sapling', minXp: 200, maxXp: 500, icon: '🌿' },
  { level: 2, title: 'Eco Tree', minXp: 500, maxXp: 1000, icon: '🌳' },
  { level: 3, title: 'Eco Forest', minXp: 1000, maxXp: 2000, icon: '🏕️' },
  { level: 4, title: 'Planet Guardian', minXp: 2000, maxXp: 3500, icon: '🌍' },
  { level: 5, title: 'Carbon Champion', minXp: 3500, maxXp: 99999, icon: '🏆' },
];

export function getLevelInfo(xp: number) {
  return LEVELS.find((l, i) => xp >= l.minXp && (i === LEVELS.length - 1 || xp < LEVELS[i + 1].minXp)) ?? LEVELS[0];
}

export function getScoreLabel(score: number): { text: string; emoji: string; color: string } {
  if (score >= 900) return { text: 'Excellent', emoji: '🌟', color: '#10b981' };
  if (score >= 700) return { text: 'Good', emoji: '🌿', color: '#34d399' };
  if (score >= 500) return { text: 'Average', emoji: '🌍', color: '#f59e0b' };
  if (score >= 300) return { text: 'Below Average', emoji: '⚠️', color: '#f97316' };
  return { text: 'Critical', emoji: '🔴', color: '#ef4444' };
}

export function getScoreGlowColor(score: number): string {
  if (score >= 700) return 'rgba(16,185,129,0.5)';
  if (score >= 500) return 'rgba(245,158,11,0.5)';
  return 'rgba(239,68,68,0.5)';
}
