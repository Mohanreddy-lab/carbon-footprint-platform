import { describe, it, expect } from 'vitest';
import { calculateEmissions, calculateCarbonScore } from './emissionData';
import type { CarbonBaseline } from '../types';

const defaultBaseline: CarbonBaseline = {
  transport: { carMilesPerWeek: 100, carType: 'gasoline', publicTransitMilesPerWeek: 20, bikeMilesPerWeek: 5 },
  home: { electricityKwhPerMonth: 350, gasKwhPerMonth: 150, renewablePercentage: 0, householdSize: 2 },
  food: { dietType: 'omnivore', foodWasteLevel: 'medium', localFoodPercentage: 20 },
  shopping: { clothingItemsPerYear: 15, electronicsPerYear: 1, shoppingLevel: 'average' },
  flights: { shortHaulPerYear: 2, mediumHaulPerYear: 1, longHaulPerYear: 0 },
};

describe('Emission Logic', () => {
  it('should calculate emissions correctly for the default baseline', () => {
    const emissions = calculateEmissions(defaultBaseline);
    expect(emissions.transport).toBeGreaterThan(0);
    expect(emissions.home).toBeGreaterThan(0);
    expect(emissions.food).toBeGreaterThan(0);
    expect(emissions.shopping).toBeGreaterThan(0);
    expect(emissions.flights).toBeGreaterThan(0);
    expect(emissions.total).toBe(emissions.transport + emissions.home + emissions.food + emissions.shopping + emissions.flights);
  });

  it('should calculate a score of 1000 for 0 emissions', () => {
    const score = calculateCarbonScore(0);
    expect(score).toBe(1000);
  });

  it('should calculate a score of 0 for emissions >= 20000', () => {
    const score1 = calculateCarbonScore(20000);
    const score2 = calculateCarbonScore(25000);
    expect(score1).toBe(0);
    expect(score2).toBe(0);
  });
});
