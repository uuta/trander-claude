import { 
  GeoapifyPlace, 
  GeoapifyResponse, 
  FavoritePlace, 
  Position, 
  IPLocationResponse, 
  CategoryDefinition,
  GeoDBCity,
  GeoDBSearchResponse,
  Country,
  WorldLocationData
} from './types';

const API_KEY: string = "d92832c85a1c47698a7ae2ee96fc26c5";
const GEODB_API_KEY: string = "2061b2ae41mshc000819c9f4b8d6p130b92jsna0eae2c1e974";
const SEARCH_RADIUS: number = 200000; // 200km in meters
const WORLD_SEARCH_RADIUS: number = 5000; // 5km in meters for world search

let currentLocation: GeoapifyPlace | null = null;
let favorites: FavoritePlace[] = JSON.parse(localStorage.getItem("favorites") || "[]");

const discoverBtn = document.getElementById("discover-btn") as HTMLButtonElement;
const countryInput = document.getElementById("country-input") as HTMLInputElement;
const countrySuggestions = document.getElementById("country-suggestions") as HTMLElement;
const localModeBtn = document.getElementById("local-mode-btn") as HTMLButtonElement;
const worldModeBtn = document.getElementById("world-mode-btn") as HTMLButtonElement;
const localSearchOptions = document.getElementById("local-search-options") as HTMLElement;
const worldSearchOptions = document.getElementById("world-search-options") as HTMLElement;
const discoverText = document.getElementById("discover-text") as HTMLElement;
const discoverIcon = document.getElementById("discover-icon") as HTMLElement;
const locationDisplay = document.getElementById("location-display") as HTMLElement;
const welcomeMessage = document.getElementById("welcome-message") as HTMLElement;
const errorMessage = document.getElementById("error-message") as HTMLElement;
const favoriteBtn = document.getElementById("favorite-btn") as HTMLButtonElement;
const shareBtn = document.getElementById("share-btn") as HTMLButtonElement;
const favoritesList = document.getElementById("favorites-list") as HTMLElement;
const favoritesItems = document.getElementById("favorites-items") as HTMLUListElement;

discoverBtn.addEventListener("click", handleDiscoverClick);
favoriteBtn.addEventListener("click", toggleFavorite);
shareBtn.addEventListener("click", shareLocation);
countryInput.addEventListener("input", handleCountryInput);
countryInput.addEventListener("focus", handleCountryFocus);
countryInput.addEventListener("blur", handleCountryBlur);
countryInput.addEventListener("keydown", handleCountryKeydown);
localModeBtn.addEventListener("click", () => switchMode('local'));
worldModeBtn.addEventListener("click", () => switchMode('world'));
let categoryCheckboxes = document.querySelectorAll('.category-checkbox') as NodeListOf<HTMLInputElement>;
const selectAllCheckbox = document.getElementById('select-all-checkbox') as HTMLInputElement;
const toggleDetailedBtn = document.getElementById('toggle-detailed') as HTMLButtonElement;
const detailedCategories = document.getElementById('detailed-categories') as HTMLElement;
const detailedGrid = document.getElementById('detailed-grid') as HTMLElement;
const categoryHeader = document.getElementById('category-header') as HTMLElement;
const categoryContent = document.getElementById('category-content') as HTMLElement;

toggleDetailedBtn.addEventListener('click', toggleDetailedCategories);
selectAllCheckbox.addEventListener('change', handleSelectAll);

let currentMode: 'local' | 'world' = 'local';
let selectedCountryCode: string = '';
let highlightedIndex: number = -1;
let filteredCountries: Country[] = [];

function switchMode(mode: 'local' | 'world'): void {
  currentMode = mode;
  
  // Update tab appearance
  if (mode === 'local') {
    localModeBtn.classList.add('active');
    worldModeBtn.classList.remove('active');
    localSearchOptions.classList.remove('hidden');
    worldSearchOptions.classList.add('hidden');
    discoverText.textContent = 'Discover Places';
    discoverIcon.textContent = '🔍';
    discoverBtn.disabled = false;
  } else {
    worldModeBtn.classList.add('active');
    localModeBtn.classList.remove('active');
    worldSearchOptions.classList.remove('hidden');
    localSearchOptions.classList.add('hidden');
    discoverText.textContent = 'Discover Places';
    discoverIcon.textContent = '🔍';
    discoverBtn.disabled = !selectedCountryCode;
  }
}

function handleDiscoverClick(): void {
  if (currentMode === 'local') {
    discoverNewLocation();
  } else {
    discoverWorldLocation();
  }
}

function handleCountryInput(): void {
  const query = countryInput.value.toLowerCase().trim();
  
  if (query.length === 0) {
    countrySuggestions.classList.add('hidden');
    selectedCountryCode = '';
    updateDiscoverButton();
    return;
  }
  
  filteredCountries = POPULAR_COUNTRIES.filter(country => 
    country.name.toLowerCase().includes(query)
  );
  
  if (filteredCountries.length > 0) {
    displayCountrySuggestions(filteredCountries);
    highlightedIndex = -1;
  } else {
    countrySuggestions.classList.add('hidden');
  }
  
  // Check for exact match
  const exactMatch = POPULAR_COUNTRIES.find(country => 
    country.name.toLowerCase() === query
  );
  
  selectedCountryCode = exactMatch ? exactMatch.code : '';
  updateDiscoverButton();
}

function handleCountryFocus(): void {
  if (countryInput.value.trim() && filteredCountries.length > 0) {
    countrySuggestions.classList.remove('hidden');
  }
}

function handleCountryBlur(): void {
  // Delay hiding to allow clicks on suggestions
  setTimeout(() => {
    countrySuggestions.classList.add('hidden');
  }, 150);
}

function handleCountryKeydown(e: KeyboardEvent): void {
  if (!filteredCountries.length) return;
  
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      highlightedIndex = Math.min(highlightedIndex + 1, filteredCountries.length - 1);
      updateHighlight();
      break;
    case 'ArrowUp':
      e.preventDefault();
      highlightedIndex = Math.max(highlightedIndex - 1, -1);
      updateHighlight();
      break;
    case 'Enter':
      e.preventDefault();
      if (highlightedIndex >= 0) {
        selectCountry(filteredCountries[highlightedIndex]);
      }
      break;
    case 'Escape':
      countrySuggestions.classList.add('hidden');
      countryInput.blur();
      break;
  }
}

function displayCountrySuggestions(countries: Country[]): void {
  countrySuggestions.innerHTML = '';
  
  countries.slice(0, 8).forEach((country, index) => {
    const suggestion = document.createElement('div');
    suggestion.className = 'country-suggestion';
    suggestion.textContent = country.name;
    suggestion.addEventListener('click', () => selectCountry(country));
    countrySuggestions.appendChild(suggestion);
  });
  
  countrySuggestions.classList.remove('hidden');
}

function updateHighlight(): void {
  const suggestions = countrySuggestions.querySelectorAll('.country-suggestion');
  suggestions.forEach((suggestion, index) => {
    suggestion.classList.toggle('highlighted', index === highlightedIndex);
  });
}

function selectCountry(country: Country): void {
  countryInput.value = country.name;
  selectedCountryCode = country.code;
  countrySuggestions.classList.add('hidden');
  highlightedIndex = -1;
  updateDiscoverButton();
}

function updateDiscoverButton(): void {
  if (currentMode === 'world') {
    discoverBtn.disabled = !selectedCountryCode;
  }
}

function toggleCategorySection(): void {
  const isCollapsed = categoryContent.classList.contains('collapsed');
  
  if (isCollapsed) {
    categoryContent.classList.remove('collapsed');
    categoryHeader.classList.remove('collapsed');
  } else {
    categoryContent.classList.add('collapsed');
    categoryHeader.classList.add('collapsed');
  }
}

function updateCategoryCheckboxes(): void {
  categoryCheckboxes = document.querySelectorAll('.category-checkbox') as NodeListOf<HTMLInputElement>;
  categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateCategorySelection);
  });
}

function toggleDetailedCategories(): void {
  const isHidden = detailedCategories.classList.contains('hidden');
  
  if (isHidden) {
    populateDetailedCategories();
    detailedCategories.classList.remove('hidden');
    toggleDetailedBtn.textContent = 'Hide detailed categories';
  } else {
    detailedCategories.classList.add('hidden');
    toggleDetailedBtn.textContent = 'Show detailed categories';
  }
}

function populateDetailedCategories(): void {
  if (detailedGrid.children.length > 0) return; // Already populated
  
  Object.entries(AVAILABLE_CATEGORIES).forEach(([value, label]) => {
    // Skip main categories that are already shown above
    if (['accommodation', 'catering', 'entertainment', 'tourism', 'commercial', 'sport', 'natural', 'service', 'religion', 'education'].includes(value)) {
      return;
    }
    
    const labelElement = document.createElement('label');
    labelElement.className = 'category-item';
    labelElement.innerHTML = `
      <input type="checkbox" class="category-checkbox" value="${value}">
      <span>${label}</span>
    `;
    detailedGrid.appendChild(labelElement);
  });
  
  updateCategoryCheckboxes();
}

updateCategoryCheckboxes();

function init(): void {
  updateFavoritesList();
  if (favorites.length > 0) {
    favoritesList.classList.remove("hidden");
  }
  populateCountryDropdown();
  
  // Setup category header click listener
  if (categoryHeader && categoryContent) {
    categoryHeader.addEventListener('click', toggleCategorySection);
  }
}

function populateCountryDropdown(): void {
  // No longer needed - countries are filtered from POPULAR_COUNTRIES array
}

function handleCountrySelection(): void {
  // No longer needed - handled by updateDiscoverButton()
}

async function discoverWorldLocation(): Promise<void> {
  if (!selectedCountryCode) return;

  try {
    errorMessage.classList.add("hidden");
    discoverBtn.disabled = true;
    discoverBtn.innerHTML =
      '<span class="button-text">Searching...</span> <span class="button-icon loading-spinner">◐</span>';

    const worldData = await searchWorldLocation(selectedCountryCode);

    if (worldData.places.length > 0) {
      const randomPlace = worldData.places[Math.floor(Math.random() * worldData.places.length)];
      displayWorldLocation(worldData, randomPlace);
    } else {
      showError("No places found in this city area");
    }
  } catch (error) {
    console.error("Error in world location discovery:", error);
    const errorMsg = error instanceof Error ? error.message : "An error occurred in worldwide search";
    showError(errorMsg);
  } finally {
    discoverBtn.disabled = !selectedCountryCode;
    discoverBtn.innerHTML =
      '<span class="button-text">Discover Places</span> <span class="button-icon">🔍</span>';
  }
}

async function discoverNewLocation(): Promise<void> {
  try {
    errorMessage.classList.add("hidden");
    discoverBtn.disabled = true;
    discoverBtn.innerHTML =
      '<span class="button-text">Searching...</span> <span class="button-icon loading-spinner">◐</span>';

    let lat: number, lon: number;

    try {
      const position = await getCurrentPosition();
      lat = position.coords.latitude;
      lon = position.coords.longitude;
    } catch (geoError) {
      const ipLocation = await getLocationByIP();
      lat = ipLocation.lat;
      lon = ipLocation.lon;
    }

    const places = await searchNearbyPlaces(lat, lon);

    if (places.length > 0) {
      const randomPlace = places[Math.floor(Math.random() * places.length)];
      displayLocation(randomPlace, lat, lon);
    } else {
      showError("No places found nearby");
    }
  } catch (error) {
    console.error("Error in discoverNewLocation:", error);
    const errorMsg = error instanceof Error ? error.message : "An unknown error occurred";
    showError(errorMsg);
  } finally {
    discoverBtn.disabled = false;
    discoverBtn.innerHTML =
      '<span class="button-text">Discover Places</span> <span class="button-icon">🔍</span>';
  }
}

function getCurrentPosition(): Promise<Position> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Your browser does not support geolocation"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position as Position);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let message = "Failed to get location information";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message =
              "Location access denied. Please check your browser settings";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable";
            break;
          case error.TIMEOUT:
            message = "Location request timed out";
            break;
        }
        reject(new Error(message));
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}

async function searchNearbyPlaces(lat: number, lon: number, selectedCategories: string[] | null = null, radius: number = SEARCH_RADIUS): Promise<GeoapifyPlace[]> {
  const categories = selectedCategories || getSelectedCategories();
  const category = Array.isArray(categories) ? categories.join(',') : categories;

  const url = `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${lon},${lat},${radius}&limit=50&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error("Failed to search for places");
    }

    const data: GeoapifyResponse = await response.json();
    return data.features || [];
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
}

function displayLocation(place: GeoapifyPlace, userLat: number, userLon: number): void {
  currentLocation = place;

  const properties = place.properties;
  const distance = calculateDistance(
    userLat,
    userLon,
    properties.lat,
    properties.lon,
  );

  const locationNameEl = document.getElementById("location-name") as HTMLElement;
  const locationAddressEl = document.getElementById("location-address") as HTMLElement;
  const locationDistanceEl = document.getElementById("location-distance") as HTMLElement;
  const locationDetailsEl = document.getElementById("location-details") as HTMLElement;

  locationNameEl.textContent = properties.name || "Unknown name";
  locationAddressEl.textContent = formatAddress(properties);
  locationDistanceEl.textContent = `About ${distance.toFixed(1)} km from your location`;

  const details: string[] = [];
  if (properties.categories) {
    details.push(`Category: ${formatCategories(properties.categories)}`);
  }
  if (properties.opening_hours) {
    details.push(`Opening hours: ${properties.opening_hours}`);
  }
  if (properties.website) {
    details.push(
      `<a href="${properties.website}" target="_blank" rel="noopener">Website</a>`,
    );
  }
  locationDetailsEl.innerHTML = details.join("<br>");

  // Try to get image from API response first, then fallback to placeholder
  let imageUrl: string;
  if (properties.image || properties.photo) {
    imageUrl = properties.image || properties.photo || '';
  } else if (properties.name) {
    // Use a more reliable image service
    imageUrl = `https://picsum.photos/600/400?random=${Date.now()}`;
  } else {
    // Fallback to a default placeholder
    imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+';
  }
  
  const locationImage = document.getElementById("location-image") as HTMLImageElement;
  locationImage.src = imageUrl;
  
  // Add error handling for image loading
  locationImage.onerror = function() {
    (this as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+';
  };

  const isFavorite = favorites.some(
    (fav) => fav.place_id === properties.place_id,
  );
  favoriteBtn.classList.toggle("active", isFavorite);

  welcomeMessage.classList.add("hidden");
  locationDisplay.classList.remove("hidden");
}

function displayWorldLocation(worldData: WorldLocationData, place: GeoapifyPlace): void {
  currentLocation = place;

  const properties = place.properties;
  const city = worldData.city;
  const distance = calculateDistance(
    city.latitude,
    city.longitude,
    properties.lat,
    properties.lon,
  );

  const locationNameEl = document.getElementById("location-name") as HTMLElement;
  const locationAddressEl = document.getElementById("location-address") as HTMLElement;
  const locationDistanceEl = document.getElementById("location-distance") as HTMLElement;
  const locationDetailsEl = document.getElementById("location-details") as HTMLElement;

  locationNameEl.textContent = properties.name || "Unknown name";
  locationAddressEl.textContent = formatAddress(properties);
  locationDistanceEl.textContent = `About ${distance.toFixed(1)} km from ${city.name}, ${city.country}`;

  const details: string[] = [];
  details.push(`🏙️ City: ${city.name}, ${city.country}`);
  details.push(`👥 Population: ${city.population.toLocaleString()}`);
  if (properties.categories) {
    details.push(`📍 Category: ${formatCategories(properties.categories)}`);
  }
  if (properties.opening_hours) {
    details.push(`🕒 Opening hours: ${properties.opening_hours}`);
  }
  if (properties.website) {
    details.push(
      `🌐 <a href="${properties.website}" target="_blank" rel="noopener">Website</a>`,
    );
  }
  locationDetailsEl.innerHTML = details.join("<br>");

  // Handle image display (same as local search)
  let imageUrl: string;
  if (properties.image || properties.photo) {
    imageUrl = properties.image || properties.photo || '';
  } else if (properties.name) {
    imageUrl = `https://picsum.photos/600/400?random=${Date.now()}`;
  } else {
    imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+';
  }
  
  const locationImage = document.getElementById("location-image") as HTMLImageElement;
  locationImage.src = imageUrl;
  
  locationImage.onerror = function() {
    (this as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+';
  };

  const isFavorite = favorites.some(
    (fav) => fav.place_id === properties.place_id,
  );
  favoriteBtn.classList.toggle("active", isFavorite);

  welcomeMessage.classList.add("hidden");
  locationDisplay.classList.remove("hidden");
}

function formatAddress(properties: any): string {
  const parts: string[] = [];
  if (properties.street) parts.push(properties.street);
  if (properties.city) parts.push(properties.city);
  if (properties.state) parts.push(properties.state);
  if (properties.country) parts.push(properties.country);
  return parts.join(", ") || "Address unknown";
}

function formatCategories(categories: string[]): string {
  const categoryMap: { [key: string]: string } = {
    tourism: "Tourism",
    entertainment: "Entertainment",
    catering: "Dining",
    "commercial.shopping": "Shopping",
  };

  return categories
    .map((cat) => {
      const mainCategory = cat.split(".")[0];
      return categoryMap[mainCategory] || cat;
    })
    .join(", ");
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toggleFavorite(): void {
  if (!currentLocation) return;

  const properties = currentLocation.properties;
  const favoriteIndex = favorites.findIndex(
    (fav) => fav.place_id === properties.place_id,
  );

  if (favoriteIndex === -1) {
    favorites.push({
      place_id: properties.place_id,
      name: properties.name || "Unknown name",
      address: formatAddress(properties),
    });
    favoriteBtn.classList.add("active");
  } else {
    favorites.splice(favoriteIndex, 1);
    favoriteBtn.classList.remove("active");
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavoritesList();
}

function updateFavoritesList(): void {
  favoritesItems.innerHTML = "";

  if (favorites.length === 0) {
    favoritesList.classList.add("hidden");
    return;
  }

  favoritesList.classList.remove("hidden");

  favorites.forEach((fav) => {
    const li = document.createElement("li");
    li.textContent = `${fav.name} - ${fav.address}`;
    favoritesItems.appendChild(li);
  });
}

function shareLocation(): void {
  if (!currentLocation) return;

  const properties = currentLocation.properties;
  const text = `I found ${properties.name || "an amazing place"}!\n${formatAddress(properties)}`;

  if (navigator.share) {
    navigator
      .share({
        title: "Trander - Sharing Location",
        text: text,
      })
      .catch(() => console.log("Sharing was cancelled"));
  } else {
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    alert("Copied to clipboard!");
  }
}

function showError(message: string): void {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

async function getLocationByIP(): Promise<{ lat: number; lon: number }> {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data: IPLocationResponse = await response.json();
    return {
      lat: data.latitude,
      lon: data.longitude,
    };
  } catch (error) {
    console.error("IP location failed:", error);
    return { lat: 35.6762, lon: 139.6503 };
  }
}

// Available categories with English labels
const AVAILABLE_CATEGORIES: CategoryDefinition = {
  'accommodation': 'Accommodation',
  'accommodation.hotel': 'Hotel',
  'accommodation.motel': 'Motel',
  'accommodation.apartment': 'Apartment',
  'accommodation.chalet': 'Chalet',
  'accommodation.guest_house': 'Guest House',
  'catering': 'Dining',
  'catering.restaurant': 'Restaurant',
  'catering.cafe': 'Cafe',
  'catering.bar': 'Bar',
  'catering.pub': 'Pub',
  'catering.fast_food': 'Fast Food',
  'catering.ice_cream': 'Ice Cream',
  'catering.biergarten': 'Beer Garden',
  'entertainment': 'Entertainment',
  'entertainment.museum': 'Museum',
  'entertainment.theatre': 'Theatre',
  'entertainment.cinema': 'Cinema',
  'entertainment.zoo': 'Zoo',
  'entertainment.aquarium': 'Aquarium',
  'entertainment.theme_park': 'Theme Park',
  'entertainment.casino': 'Casino',
  'entertainment.nightclub': 'Nightclub',
  'tourism': 'Tourism',
  'tourism.sights': 'Sights',
  'tourism.attraction': 'Attraction',
  'tourism.information': 'Tourist Information',
  'commercial': 'Commercial',
  'commercial.shopping_mall': 'Shopping Mall',
  'commercial.supermarket': 'Supermarket',
  'commercial.marketplace': 'Marketplace',
  'commercial.department_store': 'Department Store',
  'sport': 'Sports',
  'sport.fitness': 'Fitness',
  'sport.swimming': 'Swimming',
  'sport.tennis': 'Tennis',
  'sport.golf': 'Golf',
  'sport.skiing': 'Skiing',
  'natural': 'Nature',
  'natural.beach': 'Beach',
  'natural.park': 'Park',
  'natural.forest': 'Forest',
  'natural.mountain': 'Mountain',
  'natural.lake': 'Lake',
  'natural.river': 'River',
  'service': 'Service',
  'service.banking': 'Banking',
  'service.healthcare': 'Healthcare',
  'service.pharmacy': 'Pharmacy',
  'service.post': 'Post Office',
  'service.police': 'Police Station',
  'service.fire_station': 'Fire Station',
  'religion': 'Religious Sites',
  'religion.christian': 'Christian',
  'religion.buddhist': 'Buddhist',
  'religion.hindu': 'Hindu',
  'religion.jewish': 'Jewish',
  'religion.muslim': 'Muslim',
  'education': 'Education',
  'education.school': 'School',
  'education.university': 'University',
  'education.college': 'College',
  'education.kindergarten': 'Kindergarten',
  'education.library': 'Library'
};

function getSelectedCategories(): string[] {
  const selectedCategories: string[] = [];
  const regularCheckboxes = document.querySelectorAll('.category-checkbox:not(#select-all-checkbox)') as NodeListOf<HTMLInputElement>;
  
  regularCheckboxes.forEach(checkbox => {
    if (checkbox.checked && checkbox.value) {
      selectedCategories.push(checkbox.value);
    }
  });
  
  // If no categories selected, use default random selection
  if (selectedCategories.length === 0) {
    const defaultCategories = ["tourism", "entertainment", "catering", "commercial"];
    return [defaultCategories[Math.floor(Math.random() * defaultCategories.length)]];
  }
  
  return selectedCategories;
}

function handleSelectAll(): void {
  const isChecked = selectAllCheckbox.checked;
  const regularCheckboxes = document.querySelectorAll('.category-checkbox:not(#select-all-checkbox)') as NodeListOf<HTMLInputElement>;
  
  regularCheckboxes.forEach(checkbox => {
    checkbox.checked = isChecked;
  });
  
  updateCategorySelection();
}

function updateCategorySelection(): void {
  const regularCheckboxes = document.querySelectorAll('.category-checkbox:not(#select-all-checkbox)') as NodeListOf<HTMLInputElement>;
  const selectedCount = document.querySelectorAll('.category-checkbox:not(#select-all-checkbox):checked').length;
  const totalCount = regularCheckboxes.length;
  
  // Update select all checkbox state
  if (selectedCount === 0) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  } else if (selectedCount === totalCount) {
    selectAllCheckbox.checked = true;
    selectAllCheckbox.indeterminate = false;
  } else {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = true;
  }
  
  // Update status text
  const categoryStatus = document.getElementById('category-status') as HTMLElement;
  if (categoryStatus) {
    if (selectedCount === 0) {
      categoryStatus.textContent = 'Search with random category';
    } else if (selectedCount === totalCount) {
      categoryStatus.textContent = 'Search all categories';
    } else {
      categoryStatus.textContent = `${selectedCount} categories selected`;
    }
  }
}

// Popular countries list
const POPULAR_COUNTRIES: Country[] = [
  { code: 'JP', name: 'Japan' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'TH', name: 'Thailand' },
  { code: 'SG', name: 'Singapore' },
  { code: 'BR', name: 'Brazil' },
  { code: 'IN', name: 'India' },
  { code: 'RU', name: 'Russia' },
  { code: 'MX', name: 'Mexico' },
  { code: 'TR', name: 'Turkey' },
  { code: 'EG', name: 'Egypt' },
  { code: 'ZA', name: 'South Africa' }
];

// GeoDB Cities API functions
async function getRandomCityFromCountry(countryCode: string): Promise<GeoDBCity> {
  const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?countryIds=${countryCode}&minPopulation=100000&limit=10`;
  
  const headers = {
    'x-rapidapi-key': GEODB_API_KEY,
    'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com',
    'Accept': 'application/json',
    'User-Agent': 'Trander-App/1.0'
  };
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        return getMockCity(countryCode);
      }
      
      const errorText = await response.text();
      throw new Error(`GeoDB Cities API request failed: ${response.status} ${errorText}`);
    }
    
    const data: GeoDBSearchResponse = await response.json();
    
    if (!data.data || data.data.length === 0) {
      throw new Error('No cities found in this country');
    }
    
    // Return random city from the results
    const randomIndex = Math.floor(Math.random() * data.data.length);
    return data.data[randomIndex];
  } catch (error) {
    console.error('Error fetching city data:', error);
    throw error;
  }
}

async function searchWorldLocation(countryCode: string): Promise<WorldLocationData> {
  try {
    const city = await getRandomCityFromCountry(countryCode);
    const lat = city.latitude;
    const lon = city.longitude;
    const places = await searchNearbyPlaces(lat, lon, null, WORLD_SEARCH_RADIUS);
    
    return {
      city,
      places
    };
  } catch (error) {
    console.error('Error in world location search:', error);
    throw error;
  }
}

// Fallback mock cities for testing when API is not available
function getMockCity(countryCode: string): GeoDBCity {
  const mockCities: { [key: string]: GeoDBCity } = {
    'JP': { id: 1850147, name: 'Tokyo', country: 'Japan', countryCode: 'JP', latitude: 35.6762, longitude: 139.6503, population: 13960000 },
    'US': { id: 5128581, name: 'New York', country: 'United States', countryCode: 'US', latitude: 40.7128, longitude: -74.0060, population: 8419000 },
    'GB': { id: 2643743, name: 'London', country: 'United Kingdom', countryCode: 'GB', latitude: 51.5074, longitude: -0.1278, population: 8982000 },
    'FR': { id: 2988507, name: 'Paris', country: 'France', countryCode: 'FR', latitude: 48.8566, longitude: 2.3522, population: 2161000 },
    'DE': { id: 2950159, name: 'Berlin', country: 'Germany', countryCode: 'DE', latitude: 52.5200, longitude: 13.4050, population: 3669000 },
    'IT': { id: 3173435, name: 'Rome', country: 'Italy', countryCode: 'IT', latitude: 41.9028, longitude: 12.4964, population: 2873000 },
    'ES': { id: 3117735, name: 'Madrid', country: 'Spain', countryCode: 'ES', latitude: 40.4168, longitude: -3.7038, population: 3223000 },
    'CA': { id: 6167865, name: 'Toronto', country: 'Canada', countryCode: 'CA', latitude: 43.6532, longitude: -79.3832, population: 2731000 },
    'AU': { id: 2147714, name: 'Sydney', country: 'Australia', countryCode: 'AU', latitude: -33.8688, longitude: 151.2093, population: 5312000 },
    'KR': { id: 1835848, name: 'Seoul', country: 'South Korea', countryCode: 'KR', latitude: 37.5665, longitude: 126.9780, population: 9776000 }
  };
  
  return mockCities[countryCode] || mockCities['US'];
}

init();