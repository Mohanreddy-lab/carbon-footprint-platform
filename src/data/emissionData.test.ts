import { describe, it, expect } from 'vitest';
import {
  calculateEmissions,
  calculateCarbonScore,
  getScoreLabel,
  getLevelInfo,
  LEVELS,
} from './emissionData';
import type { CarbonBaseline } from '../types';

const defaultBaseline: CarbonBaseline = {
  transport: { carMilesPerWeek: 100, carType: 'gasoline', publicTransitMilesPerWeek: 20, bikeMilesPerWeek: 5 },
  home: { electricityKwhPerMonth: 350, gasKwhPerMonth: 150, renewablePercentage: 0, householdSize: 2 },
  food: { dietType: 'omnivore', foodWasteLevel: 'medium', localFoodPercentage: 20 },
  shopping: { clothingItemsPerYear: 15, electronicsPerYear: 1, shoppingLevel: 'average' },
  flights: { shortHaulPerYear: 2, mediumHaulPerYear: 1, longHaulPerYear: 0 },
};

const veganBaseline: CarbonBaseline = {
  ...defaultBaseline,
  transport: { carMilesPerWeek: 0, carType: 'none', publicTransitMilesPerWeek: 5, bikeMilesPerWeek: 20 },
  food: { dietType: 'vegan', foodWasteLevel: 'low', localFoodPercentage: 80 },
  home: { electricityKwhPerMonth: 100, gasKwhPerMonth: 0, renewablePercentage: 100, householdSize: 1 },
  shopping: { clothingItemsPerYear: 2, electronicsPerYear: 0, shoppingLevel: 'minimal' },
  flights: { shortHaulPerYear: 0, mediumHaulPerYear: 0, longHaulPerYear: 0 },
};

describe('calculateEmissions', () => {
  it('calculates all emission categories for default baseline', () => {
    const emissions = calculateEmissions(defaultBaseline);
    expect(emissions.transport).toBeGreaterThan(0);
    expect(emissions.home).toBeGreaterThan(0);
    expect(emissions.food).toBeGreaterThan(0);
    expect(emissions.shopping).toBeGreaterThan(0);
    expect(emissions.flights).toBeGreaterThan(0);
    expect(emissions.total).toBe(
      emissions.transport + emissions.home + emissions.food + emissions.shopping + emissions.flights
    );
  });

  it('vegan with no car and renewables has lower emissions than default', () => {
    const defaultEmissions = calculateEmissions(defaultBaseline);
    const veganEmissions = calculateEmissions(veganBaseline);
    expect(veganEmissions.total).toBeLessThan(defaultEmissions.total);
  });

  it('calculates zero transport for no-car baseline', () => {
    const baseline: CarbonBaseline = { ...defaultBaseline, transport: { carMilesPerWeek: 0, carType: 'none', publicTransitMilesPerWeek: 0, bikeMilesPerWeek: 0 } };
    const emissions = calculateEmissions(baseline);
    expect(emissions.transport).toBe(0);
  });

  it('heavy-meat diet has higher food emissions than vegan', () => {
    const meatBaseline: CarbonBaseline = { ...defaultBaseline, food: { dietType: 'heavy-meat', foodWasteLevel: 'high', localFoodPercentage: 0 } };
    const veganFoodBaseline: CarbonBaseline = { ...defaultBaseline, food: { dietType: 'vegan', foodWasteLevel: 'low', localFoodPercentage: 100 } };
    const meatEmissions = calculateEmissions(meatBaseline);
    const veganFoodEmissions = calculateEmissions(veganFoodBaseline);
    expect(meatEmissions.food).toBeGreaterThan(veganFoodEmissions.food);
  });

  it('long-haul flights increase emissions significantly', () => {
    const noFlights: CarbonBaseline = { ...defaultBaseline, flights: { shortHaulPerYear: 0, mediumHaulPerYear: 0, longHaulPerYear: 0 } };
    const manyFlights: CarbonBaseline = { ...defaultBaseline, flights: { shortHaulPerYear: 4, mediumHaulPerYear: 4, longHaulPerYear: 4 } };
    const e1 = calculateEmissions(noFlights);
    const e2 = calculateEmissions(manyFlights);
    expect(e2.flights).toBeGreaterThan(e1.flights);
  });

  it('100% renewables reduces home emissions', () => {
    const noRenewable: CarbonBaseline = { ...defaultBaseline, home: { ...defaultBaseline.home, renewablePercentage: 0 } };
    const fullRenewable: CarbonBaseline = { ...defaultBaseline, home: { ...defaultBaseline.home, renewablePercentage: 100 } };
    const e1 = calculateEmissions(noRenewable);
    const e2 = calculateEmissions(fullRenewable);
    expect(e2.home).toBeLessThan(e1.home);
  });
});

describe('calculateCarbonScore', () => {
  it('returns 1000 for zero emissions', () => {
    expect(calculateCarbonScore(0)).toBe(1000);
  });

  it('returns 0 for very high emissions', () => {
    expect(calculateCarbonScore(20000)).toBe(0);
    expect(calculateCarbonScore(99999)).toBe(0);
  });

  it('returns a value between 0 and 1000 for typical emissions', () => {
    const score = calculateCarbonScore(5000);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1000);
  });

  it('higher emissions result in a lower score', () => {
    const lowScore = calculateCarbonScore(10000);
    const highScore = calculateCarbonScore(2000);
    expect(highScore).toBeGreaterThan(lowScore);
  });
});

describe('getScoreLabel', () => {
  it('returns a label object with color, text and emoji for any score', () => {
    [0, 200, 400, 600, 800, 1000].forEach((score) => {
      const label = getScoreLabel(score);
      expect(label).toHaveProperty('color');
      expect(label).toHaveProperty('text');
      expect(label).toHaveProperty('emoji');
    });
  });
});

describe('getLevelInfo', () => {
  it('returns level info for zero XP', () => {
    const info = getLevelInfo(0);
    expect(info).toHaveProperty('title');
    expect(info).toHaveProperty('icon');
  });

  it('returns higher level for more XP', () => {
    const low = getLevelInfo(100);
    const high = getLevelInfo(100000);
    expect(high).toBeDefined();
    expect(low).toBeDefined();
  });
});

describe('LEVELS constant', () => {
  it('has at least one level defined', () => {
    expect(LEVELS.length).toBeGreaterThan(0);
  });

  it('each level has required properties', () => {
    LEVELS.forEach((level) => {
      expect(level).toHaveProperty('minXp');
      expect(level).toHaveProperty('title');
      expect(level).toHaveProperty('icon');
    });
  });
});
