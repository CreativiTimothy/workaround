/**
 * WorkAround Crawler (Manual Run)
 * --------------------------------
 * This script crawls ALL cafes and libraries in Orange County using
 * Google Places API Nearby Search, using a 10×10 grid to ensure full coverage.
 *
 * It stores:
 *  - Normalized fields
 *  - Random defaults for study attributes
 *  - Raw Google JSON
 *
 * Run manually:
 *    node crawler.js
 *
 * Requires:
 *    GOOGLE_MAPS_API_KEY in .env
 */

require('dotenv').config();
const fetch = require('node-fetch');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// ---------------------------
// Database Setup
// ---------------------------

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS places (
      placeId TEXT PRIMARY KEY,
      name TEXT,
      type TEXT,
      address TEXT,
      lat REAL,
      lng REAL,
      rating REAL,
      reviewCount INTEGER,
      priceLevel INTEGER,
      hours TEXT,
      features TEXT,
      noiseLevel INTEGER,
      occupancyLevel INTEGER,
      wifiQuality INTEGER,
      outletAvailability INTEGER,
      parkingAvailability INTEGER,
      hasFood INTEGER,
      hasStudyRooms INTEGER,
      maxGroupSize INTEGER,
      rawJson TEXT,
      createdAt TEXT
    )
  `);
});

// ---------------------------
// Constants
// ---------------------------

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!API_KEY) {
  console.error("ERROR: GOOGLE_MAPS_API_KEY missing from .env");
  process.exit(1);
}

// Orange County bounding box
const OC_MIN_LAT = 33.4;
const OC_MAX_LAT = 33.9;
const OC_MIN_LNG = -118.1;
const OC_MAX_LNG = -117.5;

// Grid size (G2 = 10×10)
const GRID_SIZE = 10;

// ---------------------------
// Helper Functions
// ---------------------------

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateDefaults(type) {
  const isLibrary = type === 'library';

  return {
    noiseLevel: isLibrary ? randInt(1, 2) : randInt(2, 4),
    occupancyLevel: randInt(2, 4),
    wifiQuality: randInt(3, 4),
    outletAvailability: randInt(2, 4),
    parkingAvailability: randInt(2, 4),
    hasFood: isLibrary ? 0 : 1,
    hasStudyRooms: isLibrary ? (Math.random() < 0.7 ? 1 : 0) : 0,
    maxGroupSize: isLibrary ? 6 : 4
  };
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mapPlaceToRecord(place, forcedType) {
  const type = forcedType;
  const defaults = generateDefaults(type);

  const rating = place.rating != null ? place.rating : (type === 'library' ? 4.5 : 4.0);
  const reviewCount = place.user_ratings_total || randInt(20, 120);
  const priceLevel = place.price_level != null ? place.price_level : (type === 'library' ? 0 : 2);

  let hours = null;
  if (place.opening_hours && place.opening_hours.periods) {
    const today = new Date().getDay();
    const todayPeriod = place.opening_hours.periods.find(p => p.open && p.open.day === today);
    if (todayPeriod && todayPeriod.open && todayPeriod.close) {
      const openTime = todayPeriod.open.time || '0800';
      const closeTime = todayPeriod.close.time || '2000';
      hours = {
        open: `${openTime.slice(0, 2)}:${openTime.slice(2, 4)}`,
        close: `${closeTime.slice(0, 2)}:${closeTime.slice(2, 4)}`
      };
    }
  }
  if (!hours) {
    hours = type === 'library'
      ? { open: '10:00', close: '18:00' }
      : { open: '07:00', close: '21:00' };
  }

  const features = [];
  if (defaults.hasFood) features.push('Food');
  if (defaults.hasStudyRooms) features.push('Study rooms');
  features.push('Wi-Fi');
  features.push(type === 'library' ? 'Quiet' : 'Cafe vibe');

  return {
    placeId: place.place_id,
    name: place.name,
    type,
    address: place.vicinity || place.formatted_address || 'Address not available',
    lat: place.geometry?.location?.lat || null,
    lng: place.geometry?.location?.lng || null,
    rating,
    reviewCount,
    priceLevel,
    hours: JSON.stringify(hours),
    features: JSON.stringify(features),
    noiseLevel: defaults.noiseLevel,
    occupancyLevel: defaults.occupancyLevel,
    wifiQuality: defaults.wifiQuality,
    outletAvailability: defaults.outletAvailability,
    parkingAvailability: defaults.parkingAvailability,
    hasFood: defaults.hasFood,
    hasStudyRooms: defaults.hasStudyRooms,
    maxGroupSize: defaults.maxGroupSize,
    rawJson: JSON.stringify(place),
    createdAt: new Date().toISOString()
  };
}

function insertPlace(record) {
  return new Promise(resolve => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO places (
        placeId, name, type, address, lat, lng, rating, reviewCount, priceLevel,
        hours, features, noiseLevel, occupancyLevel, wifiQuality, outletAvailability,
        parkingAvailability, hasFood, hasStudyRooms, maxGroupSize, rawJson, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      record.placeId,
      record.name,
      record.type,
      record.address,
      record.lat,
      record.lng,
      record.rating,
      record.reviewCount,
      record.priceLevel,
      record.hours,
      record.features,
      record.noiseLevel,
      record.occupancyLevel,
      record.wifiQuality,
      record.outletAvailability,
      record.parkingAvailability,
      record.hasFood,
      record.hasStudyRooms,
      record.maxGroupSize,
      record.rawJson,
      record.createdAt,
      () => resolve()
    );
  });
}

// ---------------------------
// Google Places API
// ---------------------------

async function fetchPlaces(lat, lng, type) {
  const results = [];
  let nextPageToken = null;

  do {
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.set("location", `${lat},${lng}`);
    url.searchParams.set("radius", "5000");
    url.searchParams.set("type", type);
    url.searchParams.set("key", API_KEY);
    if (nextPageToken) url.searchParams.set("pagetoken", nextPageToken);

    const res = await fetch(url.toString());
    const json = await res.json();

    if (json.results) {
      results.push(...json.results);
    }

    nextPageToken = json.next_page_token || null;

    if (nextPageToken) {
      await sleep(2000);
    }
  } while (nextPageToken);

  return results;
}

// ---------------------------
// Main Crawler
// ---------------------------

async function runCrawler() {
  console.log("Starting WorkAround Orange County crawler…");

  const latStep = (OC_MAX_LAT - OC_MIN_LAT) / GRID_SIZE;
  const lngStep = (OC_MAX_LNG - OC_MIN_LNG) / GRID_SIZE;

  const seen = new Set();
  let totalInserted = 0;

  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const lat = OC_MIN_LAT + i * latStep;
      const lng = OC_MIN_LNG + j * lngStep;

      console.log(`Tile ${i + 1},${j + 1} — Fetching cafes…`);
      const cafes = await fetchPlaces(lat, lng, "cafe");

      console.log(`Tile ${i + 1},${j + 1} — Fetching libraries…`);
      const libraries = await fetchPlaces(lat, lng, "library");

      const all = [
        ...cafes.map(p => ({ place: p, type: "cafe" })),
        ...libraries.map(p => ({ place: p, type: "library" }))
      ];

      for (const { place, type } of all) {
        if (!place.place_id) continue;
        if (seen.has(place.place_id)) continue;
        seen.add(place.place_id);

        const record = mapPlaceToRecord(place, type);
        await insertPlace(record);
        totalInserted++;
      }
    }
  }

  console.log(`Crawler complete. Inserted or updated ${totalInserted} places.`);
  process.exit(0);
}

runCrawler();
