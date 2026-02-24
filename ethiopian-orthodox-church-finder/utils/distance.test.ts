import { describe, it, expect } from 'vitest';
import { calculateDistance } from './distance';

describe('calculateDistance', () => {
  it('returns 0 for same point', () => {
    const lat = 34.0522;
    const lng = -118.2437;
    expect(calculateDistance(lat, lng, lat, lng)).toBe(0);
  });

  it('returns positive distance for two different points', () => {
    // LA (approx) to San Francisco (approx)
    const la = { lat: 34.0522, lng: -118.2437 };
    const sf = { lat: 37.7749, lng: -122.4194 };
    const miles = calculateDistance(la.lat, la.lng, sf.lat, sf.lng);
    expect(miles).toBeGreaterThan(300);
    expect(miles).toBeLessThan(400);
  });

  it('is symmetric (A to B equals B to A)', () => {
    const a = { lat: 33.9088, lng: -118.3712 };
    const b = { lat: 34.0728, lng: -118.2754 };
    const distAB = calculateDistance(a.lat, a.lng, b.lat, b.lng);
    const distBA = calculateDistance(b.lat, b.lng, a.lat, a.lng);
    expect(distAB).toBe(distBA);
  });

  it('returns small distance for nearby points (Hawthorne area churches)', () => {
    // Two churches in Hawthorne from constants
    const stMary = { lat: 33.9088, lng: -118.3712 };
    const stGabriel = { lat: 33.9061, lng: -118.3406 };
    const miles = calculateDistance(stMary.lat, stMary.lng, stGabriel.lat, stGabriel.lng);
    expect(miles).toBeGreaterThan(0);
    expect(miles).toBeLessThan(5);
  });
});
