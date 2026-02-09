/**
 * WorkAround Server
 * -----------------
 * This server powers the WorkAround web app.
 *
 * It reads all study spaces from the SQLite `places` table,
 * which is populated by crawler.js.
 *
 * Features:
 *  - Authentication (signup/login/logout)
 *  - User preferences
 *  - Bookmarks
 *  - Ranking + filtering
 *  - Open Now filter
 *  - Map-bounds filtering
 *  - WorkAround branding
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const bcrypt = require('bcrypt');

const {
  createUser,
  findUserByEmail,
  findUserById,
  saveUserPreferences,
  getUserPreferences,
  recordSearch,
  addBookmark,
  removeBookmark,
  listBookmarks,
  getAllPlaces,
  getPlaceById
} = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------
// Ranking Weights
// ---------------------------

let rankingWeights = {
  noiseLevel: 0.3,
  occupancyLevel: 0.25,
  wifiQuality: 0.2,
  outletAvailability: 0.15,
  parkingAvailability: 0.1
};

// ---------------------------
// Middleware
// ---------------------------

app.use(express.json());
app.use(
  session({
    secret: 'workaround-secret',
    resave: false,
    saveUninitialized: false
  })
);
app.use('/public', express.static(path.join(__dirname, 'public')));

// ---------------------------
// Serve index.html
// ---------------------------

app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error loading index.html');
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    res.send(data.replace('{{GOOGLE_MAPS_API_KEY}}', apiKey));
  });
});

// ---------------------------
// Helper Functions
// ---------------------------

function booleanTextMatch(space, query) {
  if (!query || query.trim() === '') return true;
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = [
    space.name,
    space.type,
    space.address,
    ...(space.features || [])
  ]
    .join(' ')
    .toLowerCase();

  return terms.every(term => haystack.includes(term));
}

function isOpenAtTime(space, timeStr) {
  if (!timeStr || !space.hours) return true;
  const [h, m] = timeStr.split(':').map(Number);
  const minutes = h * 60 + m;

  const [oh, om] = space.hours.open.split(':').map(Number);
  const [ch, cm] = space.hours.close.split(':').map(Number);
  const openMinutes = oh * 60 + om;
  const closeMinutes = ch * 60 + cm;

  return minutes >= openMinutes && minutes <= closeMinutes;
}

function normalizeFeature(value, min, max, invert = false) {
  if (value == null) return 0.0;
  const clamped = Math.max(min, Math.min(max, value));
  let norm = (clamped - min) / (max - min || 1);
  return invert ? 1 - norm : norm;
}

// ---------------------------
// Ranking
// ---------------------------

function rankSpaces(spaces, filters) {
  const {
    minRating = 0,
    preferredType,
    maxGroupSize,
    query,
    minParking,
    minOutlets,
    minWifi,
    requireFood,
    requireStudyRooms,
    onlyOpenNow
  } = filters;

  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const timeOfDay = `${hh}:${mm}`;

  let filtered = spaces.filter(space => {
    if (space.rating < minRating) return false;

    if (preferredType !== 'any' && space.type !== preferredType) return false;

    if (maxGroupSize && space.maxGroupSize < maxGroupSize) return false;

    if (onlyOpenNow && !isOpenAtTime(space, timeOfDay)) return false;

    if (minParking && space.parkingAvailability < minParking) return false;
    if (minOutlets && space.outletAvailability < minOutlets) return false;
    if (minWifi && space.wifiQuality < minWifi) return false;

    if (requireFood && !space.hasFood) return false;
    if (requireStudyRooms && !space.hasStudyRooms) return false;

    if (!booleanTextMatch(space, query)) return false;

    return true;
  });

  filtered = filtered.map(space => {
    const noiseScore = normalizeFeature(space.noiseLevel, 1, 5, true);
    const occupancyScore = normalizeFeature(space.occupancyLevel, 1, 5, true);
    const wifiScore = normalizeFeature(space.wifiQuality, 1, 5, false);
    const outletScore = normalizeFeature(space.outletAvailability, 1, 5, false);
    const parkingScore = normalizeFeature(space.parkingAvailability, 1, 5, false);

    const score =
      rankingWeights.noiseLevel * noiseScore +
      rankingWeights.occupancyLevel * occupancyScore +
      rankingWeights.wifiQuality * wifiScore +
      rankingWeights.outletAvailability * outletScore +
      rankingWeights.parkingAvailability * parkingScore;

    return { ...space, score };
  });

  filtered.sort((a, b) => b.score - a.score);

  return filtered;
}

// ---------------------------
// API: Get Ranked Spaces
// ---------------------------

app.get('/api/spaces', (req, res) => {
  const {
    minRating,
    preferredType,
    maxGroupSize,
    q,
    minParking,
    minOutlets,
    minWifi,
    requireFood,
    requireStudyRooms,
    onlyOpenNow
  } = req.query;

  // Map bounds (optional)
  const {
    minLat,
    maxLat,
    minLng,
    maxLng
  } = req.query;

  const filters = {
    minRating: Number(minRating || 0),
    preferredType: preferredType || 'any',
    maxGroupSize: maxGroupSize ? Number(maxGroupSize) : undefined,
    query: q || '',
    minParking: minParking ? Number(minParking) : undefined,
    minOutlets: minOutlets ? Number(minOutlets) : undefined,
    minWifi: minWifi ? Number(minWifi) : undefined,
    requireFood: requireFood === 'true',
    requireStudyRooms: requireStudyRooms === 'true',
    onlyOpenNow: onlyOpenNow !== 'false'
  };

  getAllPlaces((err, places) => {
    if (err) return res.status(500).json({ error: 'Failed to load places' });

    // Filter by map bounds if provided
    if (minLat && maxLat && minLng && maxLng) {
      places = places.filter(p =>
        p.lat >= Number(minLat) &&
        p.lat <= Number(maxLat) &&
        p.lng >= Number(minLng) &&
        p.lng <= Number(maxLng)
      );
    }

    const ranked = rankSpaces(places, filters);

    if (req.session.userId) {
      recordSearch(req.session.userId, filters, () => {});
    }

    res.json(ranked);
  });
});

// ---------------------------
// API: Get Single Space
// ---------------------------

app.get('/api/spaces/:id', (req, res) => {
  getPlaceById(req.params.id, (err, place) => {
    if (err) return res.status(500).json({ error: 'Failed to load place' });
    if (!place) return res.status(404).json({ error: 'Place not found' });
    res.json(place);
  });
});

// ---------------------------
// Ranking Weights
// ---------------------------

app.get('/api/ranking-weights', (req, res) => res.json(rankingWeights));

app.post('/api/ranking-weights', (req, res) => {
  Object.assign(rankingWeights, req.body);
  res.json({ success: true, rankingWeights });
});

// ---------------------------
// Authentication
// ---------------------------

app.post('/api/auth/signup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  findUserByEmail(email, async (err, existing) => {
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const hash = await bcrypt.hash(password, 10);
    createUser({ firstName, lastName, email, passwordHash: hash }, (err2, userId) => {
      if (err2) return res.status(500).json({ error: 'Failed to create user' });
      req.session.userId = userId;
      res.json({ success: true, userId });
    });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  findUserByEmail(email, async (err, user) => {
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    req.session.userId = user.id;
    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.get('/api/auth/me', (req, res) => {
  if (!req.session.userId) return res.json({ user: null });

  findUserById(req.session.userId, (err, user) => {
    if (!user) return res.json({ user: null });
    res.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  });
});

// ---------------------------
// Preferences
// ---------------------------

app.post('/api/user/preferences', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });

  saveUserPreferences(req.session.userId, req.body, err => {
    if (err) return res.status(500).json({ error: 'Failed to save preferences' });
    res.json({ success: true });
  });
});

app.get('/api/user/preferences', (req, res) => {
  if (!req.session.userId) return res.json({});

  getUserPreferences(req.session.userId, (err, prefs) => {
    if (err) return res.status(500).json({ error: 'Failed to load preferences' });
    res.json(prefs || {});
  });
});

// ---------------------------
// Bookmarks
// ---------------------------

app.get('/api/bookmarks', (req, res) => {
  if (!req.session.userId) return res.json([]);
  listBookmarks(req.session.userId, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to load bookmarks' });
    res.json(rows);
  });
});

app.post('/api/bookmarks/:placeId', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
  const { placeId } = req.params;
  const { action, place } = req.body || {};

  if (action === 'add') {
    addBookmark(req.session.userId, placeId, place || {}, err => {
      if (err) return res.status(500).json({ error: 'Failed to add bookmark' });
      res.json({ success: true });
    });
  } else if (action === 'remove') {
    removeBookmark(req.session.userId, placeId, err => {
      if (err) return res.status(500).json({ error: 'Failed to remove bookmark' });
      res.json({ success: true });
    });
  } else {
    res.status(400).json({ error: 'Invalid action' });
  }
});

// ---------------------------
// Start Server
// ---------------------------

app.listen(PORT, () =>
  console.log(`WorkAround server running on http://localhost:${PORT}`)
);
