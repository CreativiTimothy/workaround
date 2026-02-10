/**
 * WorkAround Frontend Script
 * --------------------------
 * This file handles:
 *  - Map initialization
 *  - Fetching spaces from /api/spaces
 *  - Rendering sidebar + markers
 *  - Rendering details panel
 *  - Filters
 *  - Login / Signup
 *  - Bookmarks
 *  - Preferences
 */

let map;
let markers = [];
let spacesCache = [];
let currentUser = null;
let bookmarksCache = [];

// ---------------------------
// Map Initialization
// ---------------------------

function initMap() {
  const ocCenter = { lat: 33.7, lng: -117.8 };

  // Try to center map on user's current location
  navigator.geolocation.getCurrentPosition(
    pos => {
      const userLatLng = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };

      // Add user location marker
      new google.maps.Marker({
        position: userLatLng,
        map,
        title: "Your Location",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#2563eb",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2
        }
      });

      // Center map on user
      map.setCenter(userLatLng);

      // ~5 mile radius ≈ zoom 12
      map.setZoom(12);

      // Load spaces after centering
      fetchAndRenderSpaces();
    },
    err => {
      console.warn("Geolocation failed, using default OC center.");
      fetchAndRenderSpaces();
    }
  );

  map = new google.maps.Map(document.getElementById('map'), {
    center: ocCenter,
    zoom: 11,
    mapTypeControl: false,
    streetViewControl: false
  });

  initUI();
  loadCurrentUser().then(() => {
    Promise.all([restoreFiltersFromStorageOrServer(), loadBookmarksIfLoggedIn()])
      .then(() => fetchAndRenderSpaces());
  });
}

window.initMap = initMap;

// ---------------------------
// DOM References
// ---------------------------

const spaceListEl = document.getElementById('space-list');
const spaceDetailsEl = document.getElementById('space-details');

const filtersPanel = document.getElementById('filters-panel');
const openFiltersBtn = document.getElementById('btn-open-filters');
const closeFiltersBtn = document.getElementById('btn-close-filters');

const minRatingEl = document.getElementById('filter-min-rating');
const typeEl = document.getElementById('filter-type');
const maxGroupEl = document.getElementById('filter-max-group');
const minParkingEl = document.getElementById('filter-min-parking');
const minOutletsEl = document.getElementById('filter-min-outlets');
const minWifiEl = document.getElementById('filter-min-wifi');
const requireFoodEl = document.getElementById('filter-require-food');
const requireStudyRoomsEl = document.getElementById('filter-require-studyrooms');
const openNowEl = document.getElementById('filter-open-now');
const queryEl = document.getElementById('filter-query');

const searchBtn = document.getElementById('btn-search');
const resetBtn = document.getElementById('btn-reset');

const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const openLoginBtn = document.getElementById('btn-open-login');
const closeLoginBtn = document.getElementById('btn-close-login');
const closeSignupBtn = document.getElementById('btn-close-signup');
const switchToSignupBtn = document.getElementById('btn-switch-to-signup');
const switchToLoginBtn = document.getElementById('btn-switch-to-login');
const loginEmailEl = document.getElementById('login-email');
const loginPasswordEl = document.getElementById('login-password');
const loginSubmitBtn = document.getElementById('btn-login-submit');
const loginErrorEl = document.getElementById('login-error');
const signupFirstNameEl = document.getElementById('signup-firstname');
const signupLastNameEl = document.getElementById('signup-lastname');
const signupEmailEl = document.getElementById('signup-email');
const signupPasswordEl = document.getElementById('signup-password');
const signupSubmitBtn = document.getElementById('btn-signup-submit');
const signupErrorEl = document.getElementById('signup-error');
const userGreetingEl = document.getElementById('user-greeting');

const bookmarksModal = document.getElementById('bookmarks-modal');
const openBookmarksBtn = document.getElementById('btn-open-bookmarks');
const closeBookmarksBtn = document.getElementById('btn-close-bookmarks');
const bookmarksListEl = document.getElementById('bookmarks-list');

// ---------------------------
// UI Initialization
// ---------------------------

function initUI() {
  openFiltersBtn.addEventListener('click', () => {
    filtersPanel.classList.remove('hidden');
  });

  closeFiltersBtn.addEventListener('click', () => {
    filtersPanel.classList.add('hidden');
  });

  searchBtn.addEventListener('click', () => {
    saveFiltersToStorage();
    saveFiltersToServerIfLoggedIn();
    filtersPanel.classList.add('hidden');
    fetchAndRenderSpaces();
  });

  resetBtn.addEventListener('click', () => {
    minRatingEl.value = '0';
    typeEl.value = 'any';
    maxGroupEl.value = '';
    minParkingEl.value = '';
    minOutletsEl.value = '';
    minWifiEl.value = '';
    requireFoodEl.checked = false;
    requireStudyRoomsEl.checked = false;
    openNowEl.checked = true;
    queryEl.value = '';
    saveFiltersToStorage();
    saveFiltersToServerIfLoggedIn();
    fetchAndRenderSpaces();
  });

  openLoginBtn.addEventListener('click', () => {
    if (currentUser) {
      logout();
    } else {
      loginModal.classList.remove('hidden');
    }
  });

  closeLoginBtn.addEventListener('click', () => {
    loginModal.classList.add('hidden');
  });

  closeSignupBtn.addEventListener('click', () => {
    signupModal.classList.add('hidden');
  });

  switchToSignupBtn.addEventListener('click', () => {
    loginModal.classList.add('hidden');
    signupModal.classList.remove('hidden');
  });

  switchToLoginBtn.addEventListener('click', () => {
    signupModal.classList.add('hidden');
    loginModal.classList.remove('hidden');
  });

  loginSubmitBtn.addEventListener('click', handleLogin);
  signupSubmitBtn.addEventListener('click', handleSignup);

  openBookmarksBtn.addEventListener('click', () => {
    if (!currentUser) {
      loginModal.classList.remove('hidden');
      return;
    }
    renderBookmarksList();
    bookmarksModal.classList.remove('hidden');
  });

  closeBookmarksBtn.addEventListener('click', () => {
    bookmarksModal.classList.add('hidden');
  });
}

// ---------------------------
// Authentication
// ---------------------------

async function loadCurrentUser() {
  const res = await fetch('/api/auth/me');
  const data = await res.json();
  currentUser = data.user;
  updateUserUI();
}

function updateUserUI() {
  if (currentUser) {
    openLoginBtn.textContent = 'LOG OUT';
    userGreetingEl.textContent = `Hi, ${currentUser.firstName || currentUser.email}`;
    userGreetingEl.classList.remove('hidden');
  } else {
    openLoginBtn.textContent = 'LOG IN';
    userGreetingEl.classList.add('hidden');
  }
}

async function handleLogin() {
  loginErrorEl.textContent = '';
  const email = loginEmailEl.value.trim();
  const password = loginPasswordEl.value;

  if (!email || !password) {
    loginErrorEl.textContent = 'Please enter email and password.';
    return;
  }

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!data.success) {
    loginErrorEl.textContent = data.error || 'Login failed.';
    return;
  }

  currentUser = data.user;
  updateUserUI();
  loginModal.classList.add('hidden');

  await restoreFiltersFromStorageOrServer();
  await loadBookmarksIfLoggedIn();
  fetchAndRenderSpaces();
}

async function handleSignup() {
  signupErrorEl.textContent = '';
  const firstName = signupFirstNameEl.value.trim();
  const lastName = signupLastNameEl.value.trim();
  const email = signupEmailEl.value.trim();
  const password = signupPasswordEl.value;

  if (!email || !password) {
    signupErrorEl.textContent = 'Email and password required.';
    return;
  }

  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, email, password })
  });

  const data = await res.json();
  if (!data.success) {
    signupErrorEl.textContent = data.error || 'Signup failed.';
    return;
  }

  signupModal.classList.add('hidden');

  await loadCurrentUser();
  await restoreFiltersFromStorageOrServer();
  await loadBookmarksIfLoggedIn();
  fetchAndRenderSpaces();
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  currentUser = null;
  bookmarksCache = [];
  updateUserUI();
  fetchAndRenderSpaces();
}

// ---------------------------
// Filters
// ---------------------------

function getFiltersFromUI() {
  return {
    minRating: minRatingEl.value,
    type: typeEl.value,
    maxGroup: maxGroupEl.value,
    minParking: minParkingEl.value,
    minOutlets: minOutletsEl.value,
    minWifi: minWifiEl.value,
    requireFood: requireFoodEl.checked,
    requireStudyRooms: requireStudyRoomsEl.checked,
    openNow: openNowEl.checked,
    query: queryEl.value
  };
}

function applyFiltersToUI(filters) {
  if (!filters) return;
  minRatingEl.value = filters.minRating ?? '0';
  typeEl.value = filters.type ?? 'any';
  maxGroupEl.value = filters.maxGroup ?? '';
  minParkingEl.value = filters.minParking ?? '';
  minOutletsEl.value = filters.minOutlets ?? '';
  minWifiEl.value = filters.minWifi ?? '';
  requireFoodEl.checked = !!filters.requireFood;
  requireStudyRoomsEl.checked = !!filters.requireStudyRooms;
  openNowEl.checked = filters.openNow ?? true;
  queryEl.value = filters.query ?? '';
}

function saveFiltersToStorage() {
  const filters = getFiltersFromUI();
  localStorage.setItem('workaroundFilters', JSON.stringify(filters));
}

async function saveFiltersToServerIfLoggedIn() {
  if (!currentUser) return;
  const filters = getFiltersFromUI();
  await fetch('/api/user/preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters)
  });
}

async function restoreFiltersFromStorageOrServer() {
  let filters = null;

  if (currentUser) {
    const res = await fetch('/api/user/preferences');
    const prefs = await res.json();
    if (Object.keys(prefs || {}).length > 0) {
      filters = prefs;
    }
  }

  if (!filters) {
    const raw = localStorage.getItem('workaroundFilters');
    if (raw) {
      try {
        filters = JSON.parse(raw);
      } catch {}
    }
  }

  if (filters) applyFiltersToUI(filters);
}

// ---------------------------
// Bookmarks
// ---------------------------

async function loadBookmarksIfLoggedIn() {
  if (!currentUser) {
    bookmarksCache = [];
    return;
  }
  const res = await fetch('/api/bookmarks');
  const data = await res.json();
  bookmarksCache = Array.isArray(data) ? data : [];
}

function isBookmarked(placeId) {
  return bookmarksCache.some(b => b.placeId === placeId);
}

async function toggleBookmark(space) {
  if (!currentUser) {
    loginModal.classList.remove('hidden');
    return;
  }

  const bookmarked = isBookmarked(space.placeId);
  const action = bookmarked ? 'remove' : 'add';

  await fetch(`/api/bookmarks/${encodeURIComponent(space.placeId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, place: space })
  });

  await loadBookmarksIfLoggedIn();
  renderSidebar(spacesCache);
  renderBookmarksList();
}

function renderBookmarksList() {
  bookmarksListEl.innerHTML = '';

  if (!bookmarksCache.length) {
    const li = document.createElement('li');
    li.textContent = 'No bookmarks yet.';
    li.style.color = '#6b7280';
    bookmarksListEl.appendChild(li);
    return;
  }

  bookmarksCache.forEach(b => {
    const li = document.createElement('li');
    li.textContent = b.name || b.placeId;
    li.addEventListener('click', () => {
      bookmarksModal.classList.add('hidden');
      const space = spacesCache.find(s => s.placeId === b.placeId);
      if (space) selectSpace(space.placeId);
    });
    bookmarksListEl.appendChild(li);
  });
}

// ---------------------------
// Fetch + Render Spaces
// ---------------------------

async function fetchAndRenderSpaces() {
  const params = new URLSearchParams();

  // Add map bounds to query
  const bounds = map.getBounds();
  if (bounds) {
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    params.append("minLat", sw.lat());
    params.append("maxLat", ne.lat());
    params.append("minLng", sw.lng());
    params.append("maxLng", ne.lng());
  }

  if (minRatingEl.value) params.append('minRating', minRatingEl.value);
  if (typeEl.value) params.append('preferredType', typeEl.value);
  if (maxGroupEl.value) params.append('maxGroupSize', maxGroupEl.value);
  if (minParkingEl.value) params.append('minParking', minParkingEl.value);
  if (minOutletsEl.value) params.append('minOutlets', minOutletsEl.value);
  if (minWifiEl.value) params.append('minWifi', minWifiEl.value);
  if (requireFoodEl.checked) params.append('requireFood', 'true');
  if (requireStudyRoomsEl.checked) params.append('requireStudyRooms', 'true');
  params.append('onlyOpenNow', openNowEl.checked ? 'true' : 'false');
  if (queryEl.value) params.append('q', queryEl.value);

  const res = await fetch(`/api/spaces?${params.toString()}`);
  const spaces = await res.json();

  spacesCache = spaces;
  renderMarkers(spaces);
  renderSidebar(spaces);
  hideSpaceDetails();
}

// ---------------------------
// Markers
// ---------------------------

function clearMarkers() {
  markers.forEach(m => m.setMap(null));
  markers = [];
}

function renderMarkers(spaces) {
  clearMarkers();
  if (!spaces || spaces.length === 0) return;

  const bounds = new google.maps.LatLngBounds();

  spaces.forEach((space, index) => {
    const position = { lat: space.lat, lng: space.lng };
    const marker = new google.maps.Marker({
      position,
      map,
      title: space.name,
      label: `${index + 1}`
    });

    marker.addListener('click', () => {
      selectSpace(space.placeId);
    });

    markers.push(marker);
    bounds.extend(position);
  });

  map.fitBounds(bounds);
}

// ---------------------------
// Sidebar
// ---------------------------

function renderSidebar(spaces) {
  spaceListEl.innerHTML = '';

  if (!spaces || spaces.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No spaces match your filters yet.';
    li.style.fontSize = '0.85rem';
    li.style.color = '#6b7280';
    spaceListEl.appendChild(li);
    return;
  }

  spaces.forEach((space, index) => {
    const li = document.createElement('li');
    li.className = 'space-item';
    li.dataset.id = space.placeId;

    const header = document.createElement('div');
    header.className = 'space-item-header';

    const title = document.createElement('div');
    title.className = 'space-item-title';
    title.textContent = `${index + 1}. ${space.name}`;

    const bookmarkBtn = document.createElement('button');
    bookmarkBtn.className = 'space-item-bookmark-btn';
    if (isBookmarked(space.placeId)) {
      bookmarkBtn.classList.add('bookmarked');
      bookmarkBtn.textContent = '★';
    } else {
      bookmarkBtn.textContent = '☆';
    }
    bookmarkBtn.addEventListener('click', e => {
      e.stopPropagation();
      toggleBookmark(space);
    });

    header.appendChild(title);
    header.appendChild(bookmarkBtn);

    const ratingLine = document.createElement('div');
    ratingLine.className = 'space-item-rating-line';
    const price = space.priceLevel > 0 ? '$'.repeat(space.priceLevel) : 'Free';
    ratingLine.textContent = `${space.rating.toFixed(1)} ★ (${space.reviewCount}) · ${price}`;

    const metaLine = document.createElement('div');
    metaLine.className = 'space-item-meta-line';
    const typeLabel = space.type === 'library' ? 'Library' : 'Cafe';
    let hoursText = 'Hours N/A';
    if (space.hours && space.hours.open && space.hours.close) {
      const open12 = to12Hour(space.hours.open);
      const close12 = to12Hour(space.hours.close);
      hoursText = `${open12} – ${close12}`;
    }

    metaLine.textContent = `${space.address} · ${typeLabel} · ${hoursText}`;


    const featuresLine = document.createElement('div');
    featuresLine.className = 'space-item-features';
    featuresLine.textContent = (space.features || []).slice(0, 3).join(' · ');

    li.appendChild(header);
    li.appendChild(ratingLine);
    li.appendChild(metaLine);
    li.appendChild(featuresLine);

    li.addEventListener('click', () => {
      selectSpace(space.placeId);
    });

    spaceListEl.appendChild(li);
  });
}

// ---------------------------
// Details Panel
// ---------------------------

function selectSpace(placeId) {
  const space = spacesCache.find(s => s.placeId === placeId);
  if (!space) return;

  map.panTo({ lat: space.lat, lng: space.lng });
  map.setZoom(14);

  showSpaceDetails(space);
}

// Convert "HH:MM" (24-hour) → "h:MM AM/PM"
function to12Hour(timeStr) {
  if (!timeStr || !timeStr.includes(":")) return timeStr;
  let [h, m] = timeStr.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${suffix}`;
}

function showSpaceDetails(space) {
  spaceDetailsEl.innerHTML = '';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', hideSpaceDetails);

  const title = document.createElement('h3');
  title.textContent = space.name;

  const ratingLine = document.createElement('p');
  const price = space.priceLevel > 0 ? '$'.repeat(space.priceLevel) : 'Free';
  ratingLine.textContent = `${space.rating.toFixed(1)} ★ (${space.reviewCount}) · ${price}`;

  const address = document.createElement('p');
  address.textContent = space.address;

  const type = document.createElement('p');
  type.textContent = `Type: ${space.type === 'library' ? 'Library' : 'Cafe'}`;

  const hours = document.createElement('p');
  if (space.hours && space.hours.open && space.hours.close) {
    const open12 = to12Hour(space.hours.open);
    const close12 = to12Hour(space.hours.close);
    hours.textContent = `Hours: ${open12} – ${close12}`;
  } else {
    hours.textContent = 'Hours: Not available';
  }

  const noise = document.createElement('p');
  noise.textContent = `Noise level: ${space.noiseLevel} (1=quiet, 5=loud)`;

  const occupancy = document.createElement('p');
  occupancy.textContent = `Occupancy: ${space.occupancyLevel} (1=empty, 5=packed)`;

  const wifi = document.createElement('p');
  wifi.textContent = `Wi-Fi: ${space.wifiQuality}`;

  const outlets = document.createElement('p');
  outlets.textContent = `Outlets: ${space.outletAvailability}`;

  const parking = document.createElement('p');
  parking.textContent = `Parking: ${space.parkingAvailability}`;

  const amenities = document.createElement('p');
  const amen = [];
  if (space.hasFood) amen.push('Food');
  if (space.hasStudyRooms) amen.push('Study rooms');
  amenities.textContent = `Amenities: ${amen.length ? amen.join(', ') : 'None listed'}`;

  spaceDetailsEl.appendChild(closeBtn);
  spaceDetailsEl.appendChild(title);
  spaceDetailsEl.appendChild(ratingLine);
  spaceDetailsEl.appendChild(address);
  spaceDetailsEl.appendChild(type);
  spaceDetailsEl.appendChild(hours);
  spaceDetailsEl.appendChild(noise);
  spaceDetailsEl.appendChild(occupancy);
  spaceDetailsEl.appendChild(wifi);
  spaceDetailsEl.appendChild(outlets);
  spaceDetailsEl.appendChild(parking);
  spaceDetailsEl.appendChild(amenities);

  // Directions button
  const directionsBtn = document.createElement('button');
  directionsBtn.className = 'primary-button';
  directionsBtn.style.marginTop = '0.5rem';
  directionsBtn.textContent = 'Directions';

  directionsBtn.addEventListener('click', () => {
    const lat = space.lat;
    const lng = space.lng;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      // Try Google Maps app
      const appUrl = `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`;
      window.location.href = appUrl;

      // Fallback to browser after 500ms
      setTimeout(() => {
        const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(webUrl, "_blank");
      }, 500);
    } else {
      // Desktop → open in new tab
      const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(webUrl, "_blank");
    }
  });

  spaceDetailsEl.appendChild(directionsBtn);

  spaceDetailsEl.classList.remove('hidden');
}

function hideSpaceDetails() {
  spaceDetailsEl.classList.add('hidden');
}
