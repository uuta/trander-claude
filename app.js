const API_KEY = "d92832c85a1c47698a7ae2ee96fc26c5";
const SEARCH_RADIUS = 50000; // 50km in meters

let currentLocation = null;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const discoverBtn = document.getElementById("discover-btn");
const locationDisplay = document.getElementById("location-display");
const welcomeMessage = document.getElementById("welcome-message");
const errorMessage = document.getElementById("error-message");
const favoriteBtn = document.getElementById("favorite-btn");
const shareBtn = document.getElementById("share-btn");
const favoritesList = document.getElementById("favorites-list");
const favoritesItems = document.getElementById("favorites-items");

discoverBtn.addEventListener("click", discoverNewLocation);
favoriteBtn.addEventListener("click", toggleFavorite);
shareBtn.addEventListener("click", shareLocation);

// Category selection event listeners
let categoryCheckboxes = document.querySelectorAll('.category-checkbox');
const selectAllCheckbox = document.getElementById('select-all-checkbox');
const toggleDetailedBtn = document.getElementById('toggle-detailed');
const detailedCategories = document.getElementById('detailed-categories');
const detailedGrid = document.getElementById('detailed-grid');

toggleDetailedBtn.addEventListener('click', toggleDetailedCategories);
selectAllCheckbox.addEventListener('change', handleSelectAll);

function updateCategoryCheckboxes() {
  categoryCheckboxes = document.querySelectorAll('.category-checkbox');
  categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateCategorySelection);
  });
}

function toggleDetailedCategories() {
  const isHidden = detailedCategories.classList.contains('hidden');
  
  if (isHidden) {
    // Show detailed categories
    populateDetailedCategories();
    detailedCategories.classList.remove('hidden');
    toggleDetailedBtn.textContent = '詳細カテゴリを非表示';
  } else {
    // Hide detailed categories
    detailedCategories.classList.add('hidden');
    toggleDetailedBtn.textContent = '詳細カテゴリを表示';
  }
}

function populateDetailedCategories() {
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

function init() {
  updateFavoritesList();
  if (favorites.length > 0) {
    favoritesList.classList.remove("hidden");
  }
}

async function discoverNewLocation() {
  try {
    console.log("Starting location discovery...");
    errorMessage.classList.add("hidden");
    discoverBtn.disabled = true;
    discoverBtn.innerHTML =
      '<span class="button-text">検索中...</span> <span class="button-icon loading-spinner">◐</span>';

    let lat, lon;

    try {
      console.log("Getting current position...");
      const position = await getCurrentPosition();
      lat = position.coords.latitude;
      lon = position.coords.longitude;
      console.log(`Position obtained: ${lat}, ${lon}`);
    } catch (geoError) {
      console.log("Geolocation failed, using IP-based location...");
      const ipLocation = await getLocationByIP();
      lat = ipLocation.lat;
      lon = ipLocation.lon;
      console.log(`IP-based location: ${lat}, ${lon}`);
    }

    console.log("Searching nearby places...");
    const places = await searchNearbyPlaces(lat, lon);
    console.log(`Found ${places.length} places`);

    if (places.length > 0) {
      const randomPlace = places[Math.floor(Math.random() * places.length)];
      console.log("Selected place:", randomPlace);
      displayLocation(randomPlace, lat, lon);
    } else {
      showError("周辺に場所が見つかりませんでした。");
    }
  } catch (error) {
    console.error("Error in discoverNewLocation:", error);
    showError(error.message);
  } finally {
    discoverBtn.disabled = false;
    discoverBtn.innerHTML =
      '<span class="button-text">新しい場所を探す</span> <span class="button-icon">🎲</span>';
  }
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    console.log("Checking geolocation support...");
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      reject(new Error("お使いのブラウザは位置情報をサポートしていません。"));
      return;
    }

    console.log("Requesting geolocation permission...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Geolocation success:", position);
        resolve(position);
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

async function searchNearbyPlaces(lat, lon, selectedCategories = null) {
  const categories = selectedCategories || getSelectedCategories();
  const category = Array.isArray(categories) ? categories.join(',') : categories;

  const url = `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${lon},${lat},${SEARCH_RADIUS}&limit=50&apiKey=${API_KEY}`;
  console.log("API URL:", url);

  try {
    const response = await fetch(url);
    console.log("API Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error("場所の検索に失敗しました。");
    }

    const data = await response.json();
    console.log("API Response data:", data);
    return data.features || [];
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
}

function displayLocation(place, userLat, userLon) {
  currentLocation = place;

  const properties = place.properties;
  const distance = calculateDistance(
    userLat,
    userLon,
    properties.lat,
    properties.lon,
  );

  document.getElementById("location-name").textContent =
    properties.name || "名称不明";
  document.getElementById("location-address").textContent =
    formatAddress(properties);
  document.getElementById("location-distance").textContent =
    `現在地から約 ${distance.toFixed(1)} km`;

  const details = [];
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
  document.getElementById("location-details").innerHTML = details.join("<br>");

  // Try to get image from API response first, then fallback to placeholder
  let imageUrl;
  if (properties.image || properties.photo) {
    imageUrl = properties.image || properties.photo;
  } else if (properties.name) {
    // Use a more reliable image service
    imageUrl = `https://picsum.photos/600/400?random=${Date.now()}`;
  } else {
    // Fallback to a default placeholder
    imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWgtOaJgOeUu+WDjzwvdGV4dD48L3N2Zz4=';
  }
  
  const locationImage = document.getElementById("location-image");
  locationImage.src = imageUrl;
  
  // Add error handling for image loading
  locationImage.onerror = function() {
    this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWgtOaJgOeUu+WDjzwvdGV4dD48L3N2Zz4=';
  };

  const isFavorite = favorites.some(
    (fav) => fav.place_id === properties.place_id,
  );
  favoriteBtn.classList.toggle("active", isFavorite);

  welcomeMessage.classList.add("hidden");
  locationDisplay.classList.remove("hidden");
}

function formatAddress(properties) {
  const parts = [];
  if (properties.street) parts.push(properties.street);
  if (properties.city) parts.push(properties.city);
  if (properties.state) parts.push(properties.state);
  if (properties.country) parts.push(properties.country);
  return parts.join(", ") || "住所不明";
}

function formatCategories(categories) {
  const categoryMap = {
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

function calculateDistance(lat1, lon1, lat2, lon2) {
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

function toggleFavorite() {
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

function updateFavoritesList() {
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

function shareLocation() {
  if (!currentLocation) return;

  const properties = currentLocation.properties;
  const text = `${properties.name || "素敵な場所"}を見つけました！\n${formatAddress(properties)}`;

  if (navigator.share) {
    navigator
      .share({
        title: "Trander - 場所の共有",
        text: text,
      })
      .catch((err) => console.log("共有がキャンセルされました"));
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

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

async function getLocationByIP() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    return {
      lat: data.latitude,
      lon: data.longitude,
    };
  } catch (error) {
    console.error("IP location failed:", error);
    // Default to Tokyo if everything fails
    return { lat: 35.6762, lon: 139.6503 };
  }
}

// Available categories with Japanese labels
const AVAILABLE_CATEGORIES = {
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

function getSelectedCategories() {
  const selectedCategories = [];
  const regularCheckboxes = document.querySelectorAll('.category-checkbox:not(#select-all-checkbox)');
  
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

function handleSelectAll() {
  const isChecked = selectAllCheckbox.checked;
  const regularCheckboxes = document.querySelectorAll('.category-checkbox:not(#select-all-checkbox)');
  
  regularCheckboxes.forEach(checkbox => {
    checkbox.checked = isChecked;
  });
  
  updateCategorySelection();
}

function updateCategorySelection() {
  const regularCheckboxes = document.querySelectorAll('.category-checkbox:not(#select-all-checkbox)');
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
  const categoryStatus = document.getElementById('category-status');
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

init();
