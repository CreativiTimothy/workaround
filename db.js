/**
 * WorkAround Database Module
 * --------------------------
 * This module initializes and manages all SQLite tables:
 *
 *  - users
 *  - searches
 *  - bookmarks
 *  - places   (populated by crawler.js)
 *
 * It also exports helper functions for CRUD operations.
 */

const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

// --------------------------------------
// Initialize Tables
// --------------------------------------

db.serialize(() => {
  // Users
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT,
      lastName TEXT,
      email TEXT UNIQUE,
      passwordHash TEXT,
      preferences TEXT,
      createdAt TEXT
    )
  `);

  // Searches (history)
  db.run(`
    CREATE TABLE IF NOT EXISTS searches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      filters TEXT,
      createdAt TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Bookmarks
  db.run(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      placeId TEXT,
      placeData TEXT,
      createdAt TEXT,
      UNIQUE(userId, placeId),
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Places (populated by crawler.js)
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

// --------------------------------------
// User Functions
// --------------------------------------

function createUser({ firstName, lastName, email, passwordHash }, cb) {
  const stmt = db.prepare(
    `INSERT INTO users (firstName, lastName, email, passwordHash, createdAt)
     VALUES (?, ?, ?, ?, datetime('now'))`
  );
  stmt.run(firstName, lastName, email, passwordHash, function (err) {
    cb(err, this ? this.lastID : null);
  });
}

function findUserByEmail(email, cb) {
  db.get(`SELECT * FROM users WHERE email = ?`, [email], cb);
}

function findUserById(id, cb) {
  db.get(`SELECT * FROM users WHERE id = ?`, [id], cb);
}

function saveUserPreferences(userId, preferences, cb) {
  const prefsJson = JSON.stringify(preferences || {});
  db.run(`UPDATE users SET preferences = ? WHERE id = ?`, [prefsJson, userId], cb);
}

function getUserPreferences(userId, cb) {
  db.get(`SELECT preferences FROM users WHERE id = ?`, [userId], (err, row) => {
    if (err) return cb(err);
    if (!row || !row.preferences) return cb(null, {});
    try {
      cb(null, JSON.parse(row.preferences));
    } catch {
      cb(null, {});
    }
  });
}

// --------------------------------------
// Search History
// --------------------------------------

function recordSearch(userId, filters, cb) {
  const filtersJson = JSON.stringify(filters || {});
  db.run(
    `INSERT INTO searches (userId, filters, createdAt)
     VALUES (?, ?, datetime('now'))`,
    [userId, filtersJson],
    cb
  );
}

// --------------------------------------
// Bookmarks
// --------------------------------------

function addBookmark(userId, placeId, placeData, cb) {
  const dataJson = JSON.stringify(placeData || {});
  db.run(
    `INSERT OR IGNORE INTO bookmarks (userId, placeId, placeData, createdAt)
     VALUES (?, ?, ?, datetime('now'))`,
    [userId, placeId, dataJson],
    cb
  );
}

function removeBookmark(userId, placeId, cb) {
  db.run(
    `DELETE FROM bookmarks WHERE userId = ? AND placeId = ?`,
    [userId, placeId],
    cb
  );
}

function listBookmarks(userId, cb) {
  db.all(
    `SELECT placeId, placeData FROM bookmarks WHERE userId = ? ORDER BY createdAt DESC`,
    [userId],
    (err, rows) => {
      if (err) return cb(err);
      const result = rows.map(r => {
        try {
          return { placeId: r.placeId, ...JSON.parse(r.placeData || '{}') };
        } catch {
          return { placeId: r.placeId };
        }
      });
      cb(null, result);
    }
  );
}

// --------------------------------------
// Places (read-only for server; crawler writes)
// --------------------------------------

function getAllPlaces(cb) {
  db.all(`SELECT * FROM places`, [], (err, rows) => {
    if (err) return cb(err);
    const mapped = rows.map(r => ({
      placeId: r.placeId,
      name: r.name,
      type: r.type,
      address: r.address,
      lat: r.lat,
      lng: r.lng,
      rating: r.rating,
      reviewCount: r.reviewCount,
      priceLevel: r.priceLevel,
      hours: JSON.parse(r.hours || "{}"),
      features: JSON.parse(r.features || "[]"),
      noiseLevel: r.noiseLevel,
      occupancyLevel: r.occupancyLevel,
      wifiQuality: r.wifiQuality,
      outletAvailability: r.outletAvailability,
      parkingAvailability: r.parkingAvailability,
      hasFood: !!r.hasFood,
      hasStudyRooms: !!r.hasStudyRooms,
      maxGroupSize: r.maxGroupSize,
      rawJson: JSON.parse(r.rawJson || "{}"),
      createdAt: r.createdAt
    }));
    cb(null, mapped);
  });
}

function getPlaceById(placeId, cb) {
  db.get(`SELECT * FROM places WHERE placeId = ?`, [placeId], (err, r) => {
    if (err) return cb(err);
    if (!r) return cb(null, null);
    const mapped = {
      placeId: r.placeId,
      name: r.name,
      type: r.type,
      address: r.address,
      lat: r.lat,
      lng: r.lng,
      rating: r.rating,
      reviewCount: r.reviewCount,
      priceLevel: r.priceLevel,
      hours: JSON.parse(r.hours || "{}"),
      features: JSON.parse(r.features || "[]"),
      noiseLevel: r.noiseLevel,
      occupancyLevel: r.occupancyLevel,
      wifiQuality: r.wifiQuality,
      outletAvailability: r.outletAvailability,
      parkingAvailability: r.parkingAvailability,
      hasFood: !!r.hasFood,
      hasStudyRooms: !!r.hasStudyRooms,
      maxGroupSize: r.maxGroupSize,
      rawJson: JSON.parse(r.rawJson || "{}"),
      createdAt: r.createdAt
    };
    cb(null, mapped);
  });
}

// --------------------------------------
// Exports
// --------------------------------------

module.exports = {
  db,
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
};
