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
const worldDiscoverBtn = document.getElementById("world-discover-btn") as HTMLButtonElement;
const countrySelect = document.getElementById("country-select") as HTMLSelectElement;
const locationDisplay = document.getElementById("location-display") as HTMLElement;
const welcomeMessage = document.getElementById("welcome-message") as HTMLElement;
const errorMessage = document.getElementById("error-message") as HTMLElement;
const favoriteBtn = document.getElementById("favorite-btn") as HTMLButtonElement;
const shareBtn = document.getElementById("share-btn") as HTMLButtonElement;
const favoritesList = document.getElementById("favorites-list") as HTMLElement;
const favoritesItems = document.getElementById("favorites-items") as HTMLUListElement;

discoverBtn.addEventListener("click", discoverNewLocation);
worldDiscoverBtn.addEventListener("click", discoverWorldLocation);
favoriteBtn.addEventListener("click", toggleFavorite);
shareBtn.addEventListener("click", shareLocation);
countrySelect.addEventListener("change", handleCountrySelection);
let categoryCheckboxes = document.querySelectorAll('.category-checkbox') as NodeListOf<HTMLInputElement>;
const selectAllCheckbox = document.getElementById('select-all-checkbox') as HTMLInputElement;
const toggleDetailedBtn = document.getElementById('toggle-detailed') as HTMLButtonElement;
const detailedCategories = document.getElementById('detailed-categories') as HTMLElement;
const detailedGrid = document.getElementById('detailed-grid') as HTMLElement;

toggleDetailedBtn.addEventListener('click', toggleDetailedCategories);
selectAllCheckbox.addEventListener('change', handleSelectAll);

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
    toggleDetailedBtn.textContent = '詳細カテゴリを非表示';
  } else {
    detailedCategories.classList.add('hidden');
    toggleDetailedBtn.textContent = '詳細カテゴリを表示';
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
}

function populateCountryDropdown(): void {
  POPULAR_COUNTRIES.forEach(country => {
    const option = document.createElement('option');
    option.value = country.code;
    option.textContent = country.name;
    countrySelect.appendChild(option);
  });
}

function handleCountrySelection(): void {
  const selectedCountry = countrySelect.value;
  worldDiscoverBtn.disabled = !selectedCountry;
}

async function discoverWorldLocation(): Promise<void> {
  const selectedCountry = countrySelect.value;
  if (!selectedCountry) return;

  try {
    errorMessage.classList.add("hidden");
    worldDiscoverBtn.disabled = true;
    worldDiscoverBtn.innerHTML =
      '<span class="button-text">検索中...</span> <span class="button-icon loading-spinner">◐</span>';

    const worldData = await searchWorldLocation(selectedCountry);

    if (worldData.places.length > 0) {
      const randomPlace = worldData.places[Math.floor(Math.random() * worldData.places.length)];
      displayWorldLocation(worldData, randomPlace);
    } else {
      showError("この都市周辺に場所が見つかりませんでした。");
    }
  } catch (error) {
    console.error("Error in world location discovery:", error);
    const errorMsg = error instanceof Error ? error.message : "世界検索でエラーが発生しました";
    showError(errorMsg);
  } finally {
    worldDiscoverBtn.disabled = false;
    worldDiscoverBtn.innerHTML =
      '<span class="button-text">世界から探す</span> <span class="button-icon">🌍</span>';
  }
}

async function discoverNewLocation(): Promise<void> {
  try {
    errorMessage.classList.add("hidden");
    discoverBtn.disabled = true;
    discoverBtn.innerHTML =
      '<span class="button-text">検索中...</span> <span class="button-icon loading-spinner">◐</span>';

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
      showError("周辺に場所が見つかりませんでした。");
    }
  } catch (error) {
    console.error("Error in discoverNewLocation:", error);
    const errorMsg = error instanceof Error ? error.message : "不明なエラーが発生しました";
    showError(errorMsg);
  } finally {
    discoverBtn.disabled = false;
    discoverBtn.innerHTML =
      '<span class="button-text">新しい場所を探す</span> <span class="button-icon">🎲</span>';
  }
}

function getCurrentPosition(): Promise<Position> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("お使いのブラウザは位置情報をサポートしていません。"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position as Position);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let message = "位置情報の取得に失敗しました。";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message =
              "位置情報の使用が許可されていません。ブラウザの設定を確認してください。";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "位置情報が利用できません。";
            break;
          case error.TIMEOUT:
            message = "位置情報の取得がタイムアウトしました。";
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
      throw new Error("場所の検索に失敗しました。");
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

  locationNameEl.textContent = properties.name || "名称不明";
  locationAddressEl.textContent = formatAddress(properties);
  locationDistanceEl.textContent = `現在地から約 ${distance.toFixed(1)} km`;

  const details: string[] = [];
  if (properties.categories) {
    details.push(`カテゴリ: ${formatCategories(properties.categories)}`);
  }
  if (properties.opening_hours) {
    details.push(`営業時間: ${properties.opening_hours}`);
  }
  if (properties.website) {
    details.push(
      `<a href="${properties.website}" target="_blank" rel="noopener">ウェブサイト</a>`,
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
    imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWgtOaJgOeUu+WDjzwvdGV4dD48L3N2Zz4=';
  }
  
  const locationImage = document.getElementById("location-image") as HTMLImageElement;
  locationImage.src = imageUrl;
  
  // Add error handling for image loading
  locationImage.onerror = function() {
    (this as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWgtOaJgOeUu+WDjzwvdGV4dD48L3N2Zz4=';
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

  locationNameEl.textContent = properties.name || "名称不明";
  locationAddressEl.textContent = formatAddress(properties);
  locationDistanceEl.textContent = `${city.name}, ${city.country}から約 ${distance.toFixed(1)} km`;

  const details: string[] = [];
  details.push(`🏙️ 都市: ${city.name}, ${city.country}`);
  details.push(`👥 人口: ${city.population.toLocaleString()}人`);
  if (properties.categories) {
    details.push(`📍 カテゴリ: ${formatCategories(properties.categories)}`);
  }
  if (properties.opening_hours) {
    details.push(`🕒 営業時間: ${properties.opening_hours}`);
  }
  if (properties.website) {
    details.push(
      `🌐 <a href="${properties.website}" target="_blank" rel="noopener">ウェブサイト</a>`,
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
    imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWgtOaJgOeUu+WDjzwvdGV4dD48L3N2Zz4=';
  }
  
  const locationImage = document.getElementById("location-image") as HTMLImageElement;
  locationImage.src = imageUrl;
  
  locationImage.onerror = function() {
    (this as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWgtOaJgOeUu+WDjzwvdGV4dD48L3N2Zz4=';
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
  return parts.join(", ") || "住所不明";
}

function formatCategories(categories: string[]): string {
  const categoryMap: { [key: string]: string } = {
    tourism: "観光",
    entertainment: "エンターテイメント",
    catering: "飲食",
    "commercial.shopping": "ショッピング",
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
      name: properties.name || "名称不明",
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
  const text = `${properties.name || "素敵な場所"}を見つけました！\n${formatAddress(properties)}`;

  if (navigator.share) {
    navigator
      .share({
        title: "Trander - 場所の共有",
        text: text,
      })
      .catch(() => console.log("共有がキャンセルされました"));
  } else {
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    alert("クリップボードにコピーしました！");
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

// Available categories with Japanese labels
const AVAILABLE_CATEGORIES: CategoryDefinition = {
  'accommodation': '宿泊施設',
  'accommodation.hotel': 'ホテル',
  'accommodation.motel': 'モーテル',
  'accommodation.apartment': 'アパートメント',
  'accommodation.chalet': 'シャレー',
  'accommodation.guest_house': 'ゲストハウス',
  'catering': '飲食',
  'catering.restaurant': 'レストラン',
  'catering.cafe': 'カフェ',
  'catering.bar': 'バー',
  'catering.pub': 'パブ',
  'catering.fast_food': 'ファストフード',
  'catering.ice_cream': 'アイスクリーム',
  'catering.biergarten': 'ビアガーデン',
  'entertainment': 'エンターテイメント',
  'entertainment.museum': '美術館・博物館',
  'entertainment.theatre': '劇場',
  'entertainment.cinema': '映画館',
  'entertainment.zoo': '動物園',
  'entertainment.aquarium': '水族館',
  'entertainment.theme_park': 'テーマパーク',
  'entertainment.casino': 'カジノ',
  'entertainment.nightclub': 'ナイトクラブ',
  'tourism': '観光',
  'tourism.sights': '観光地',
  'tourism.attraction': 'アトラクション',
  'tourism.information': '観光案内所',
  'commercial': '商業施設',
  'commercial.shopping_mall': 'ショッピングモール',
  'commercial.supermarket': 'スーパーマーケット',
  'commercial.marketplace': 'マーケットプレイス',
  'commercial.department_store': 'デパート',
  'sport': 'スポーツ',
  'sport.fitness': 'フィットネス',
  'sport.swimming': '水泳',
  'sport.tennis': 'テニス',
  'sport.golf': 'ゴルフ',
  'sport.skiing': 'スキー',
  'natural': '自然',
  'natural.beach': 'ビーチ',
  'natural.park': '公園',
  'natural.forest': '森林',
  'natural.mountain': '山',
  'natural.lake': '湖',
  'natural.river': '川',
  'service': 'サービス',
  'service.banking': '銀行',
  'service.healthcare': '医療',
  'service.pharmacy': '薬局',
  'service.post': '郵便局',
  'service.police': '警察署',
  'service.fire_station': '消防署',
  'religion': '宗教施設',
  'religion.christian': 'キリスト教',
  'religion.buddhist': '仏教',
  'religion.hindu': 'ヒンドゥー教',
  'religion.jewish': 'ユダヤ教',
  'religion.muslim': 'イスラム教',
  'education': '教育',
  'education.school': '学校',
  'education.university': '大学',
  'education.college': 'カレッジ',
  'education.kindergarten': '幼稚園',
  'education.library': '図書館'
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
      categoryStatus.textContent = 'ランダムカテゴリで検索';
    } else if (selectedCount === totalCount) {
      categoryStatus.textContent = 'すべてのカテゴリで検索';
    } else {
      categoryStatus.textContent = `${selectedCount}個のカテゴリを選択中`;
    }
  }
}

// Popular countries list
const POPULAR_COUNTRIES: Country[] = [
  { code: 'JP', name: '日本' },
  { code: 'US', name: 'アメリカ' },
  { code: 'GB', name: 'イギリス' },
  { code: 'FR', name: 'フランス' },
  { code: 'DE', name: 'ドイツ' },
  { code: 'IT', name: 'イタリア' },
  { code: 'ES', name: 'スペイン' },
  { code: 'CA', name: 'カナダ' },
  { code: 'AU', name: 'オーストラリア' },
  { code: 'KR', name: '韓国' },
  { code: 'CN', name: '中国' },
  { code: 'TH', name: 'タイ' },
  { code: 'SG', name: 'シンガポール' },
  { code: 'BR', name: 'ブラジル' },
  { code: 'IN', name: 'インド' },
  { code: 'RU', name: 'ロシア' },
  { code: 'MX', name: 'メキシコ' },
  { code: 'TR', name: 'トルコ' },
  { code: 'EG', name: 'エジプト' },
  { code: 'ZA', name: '南アフリカ' }
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