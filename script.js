// ==========================================
// 1. GLOBAL VARIABLES & STATE
// ==========================================
let mediaVault = JSON.parse(localStorage.getItem("mediaVault")) || [];
let currentFilter = "All";
let cardIdToDelete = null;
let debounceTimer;
let selectedImageUrl = "";

// SVG Icon for the delete button
const deleteSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M262.2 48C248.9 48 236.9 56.3 232.2 68.8L216 112L120 112C106.7 112 96 122.7 96 136C96 149.3 106.7 160 120 160L520 160C533.3 160 544 149.3 544 136C544 122.7 533.3 112 520 112L424 112L407.8 68.8C403.1 56.3 391.2 48 377.8 48L262.2 48zM128 208L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 208L464 208L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 208L128 208zM288 280C288 266.7 277.3 256 264 256C250.7 256 240 266.7 240 280L240 456C240 469.3 250.7 480 264 480C277.3 480 288 469.3 288 456L288 280zM400 280C400 266.7 389.3 256 376 256C362.7 256 352 266.7 352 280L352 456C352 469.3 362.7 480 376 480C389.3 480 400 469.3 400 456L400 280z"/></svg>';

// DOM Elements
const body = document.body;
const filterLinks = document.querySelectorAll(".nav-links a");
const gallery = document.getElementById("media-gallery");
const toastNotification = document.getElementById("toast-notification");

// Form Elements
const mediaForm = document.getElementById("media-form");
const titleInput = document.getElementById("title-input");
const typeInput = document.getElementById("type-input");
const statusInput = document.getElementById("status-input");
const submitBtn = document.getElementById("submit-btn");

// Autocomplete & Search Elements
const suggestionsList = document.getElementById("suggestions-list");
const searchWrapper = document.getElementById("search-wrapper");
const searchIconBtn = document.getElementById("search-icon-btn");
const searchInput = document.getElementById("search-input");

// Modal Elements
const deleteModal = document.getElementById("delete-modal");
const dashboardModal = document.getElementById("dashboard-modal");
const navDashboard = document.getElementById("nav-dashboard");
const statsContainer = document.getElementById("stats-container");
const themeToggleBtn = document.getElementById("theme-toggle");

// ==========================================
// 2. INITIALIZATION
// ==========================================
// Check Local Storage for theme on page load
const savedTheme = localStorage.getItem("mediaVaultTheme");
if (savedTheme === "light") {
  body.classList.add("light-mode");
  themeToggleBtn.innerHTML = `<i class="fa-solid fa-moon"></i>`; // Change icon to moon
}

// Initial render of the gallery
displayMedia();

// ==========================================
// 3. THEME TOGGLE
// ==========================================
themeToggleBtn.addEventListener("click", function (e) {
  e.preventDefault();
  body.classList.toggle("light-mode");

  if (body.classList.contains("light-mode")) {
    themeToggleBtn.innerHTML = `<i class="fa-solid fa-moon"></i>`;
    localStorage.setItem("mediaVaultTheme", "light");
  } else {
    themeToggleBtn.innerHTML = `<i class="fa-solid fa-sun"></i>`;
    localStorage.setItem("mediaVaultTheme", "dark");
  }
});

// ==========================================
// 4. CORE FUNCTIONS
// ==========================================
function updateStorage() {
  localStorage.setItem("mediaVault", JSON.stringify(mediaVault));
}

function displayMedia() {
  gallery.innerHTML = "";
  let itemsToDisplay = mediaVault;

  // Apply Tab/Badge Filters
  if (currentFilter !== "All") {
    itemsToDisplay = mediaVault.filter(
      (item) => item.status === currentFilter || item.type === currentFilter,
    );
  }

  // Apply Search Bar Filter
  const searchTerm = searchInput.value.toLowerCase().trim();
  if (searchTerm !== "") {
    itemsToDisplay = itemsToDisplay.filter(function (item) {
      const safeStatusDate = item.statusDate
        ? item.statusDate.toLowerCase()
        : "";
      return (
        item.title.toLowerCase().includes(searchTerm) ||
        item.type.toLowerCase().includes(searchTerm) ||
        item.status.toLowerCase().includes(searchTerm) ||
        item.dateAdded.includes(searchTerm) ||
        safeStatusDate.includes(searchTerm)
      );
    });
  }

  // Render Cards
  itemsToDisplay.forEach(function (item) {
    const card = document.createElement("div");
    card.classList.add("media-card");
    card.id = `card-${item.id}`;

    const safeType = item.type ? item.type.toLowerCase() : "unknown";
    const safeStatus = item.status ? item.status.toLowerCase() : "unknown";
    const typeClass = safeType;
    const statusClass = safeStatus.replace(/\s/g, "-");

    let statusDateHTML = "";
    if (safeStatus.includes("watching")) {
      statusDateHTML = `<span>Started: ${item.statusDate || item.dateAdded}</span>`;
    } else if (safeStatus.includes("completed")) {
      statusDateHTML = `<span>Completed: ${item.statusDate || item.dateAdded}</span>`;
    }

    const imageHTML = item.imgUrl
      ? `<img src="${item.imgUrl}" class="card-poster-img" alt="${item.title} Poster" />`
      : `<div class="card-poster-img placeholder-poster"><span>📺</span></div>`;

    card.innerHTML = `
      ${imageHTML} 
      <button class="edit-btn" onclick="editCard(${item.id})"><i class="fa-solid fa-pen"></i></button>
      <button class="delete-btn" onclick="deleteCard(${item.id})">${deleteSvg}</button>
      
      <div class="card-content">
          <h3>${item.title || "Unknown Title"}</h3>
          <span class="badge type-${typeClass}" onclick="applyFilter('${item.type}')">${item.type}</span>
          <span class="badge status-${statusClass}" onclick="applyFilter('${item.status}')">${item.status}</span>
          <div class="card-dates">
              <span>Added: ${item.dateAdded || "Unknown"}</span>
              ${statusDateHTML}
          </div>
      </div>
    `;

    gallery.appendChild(card);
  });
}

// ==========================================
// 5. ADDING MEDIA (FORM LOGIC)
// ==========================================
mediaForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  const type = typeInput.value;
  const status = statusInput.value;
  const rawDate = document.getElementById("date-input").value;

  if (title === "") {
    alert("Please enter a title before adding!");
    return;
  }

  const isDuplicate = mediaVault.some(
    (item) =>
      title.toLowerCase() === item.title.toLowerCase() &&
      type.toLowerCase() === item.type.toLowerCase(),
  );

  if (isDuplicate) {
    alert("This media Already Exists in the Vault");
    return;
  }

  // Format today's date
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  const currentDate = dd + "/" + mm + "/" + yyyy;

  // Determine Custom Status Date
  let customStatusDate = currentDate;
  if (rawDate !== "") {
    const parts = rawDate.split("-");
    customStatusDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  const newItem = {
    id: Date.now(),
    title: title,
    type: type,
    status: status,
    dateAdded: currentDate,
    statusDate: customStatusDate,
    imgUrl: selectedImageUrl,
  };

  mediaVault.push(newItem);
  updateStorage();
  displayMedia();

  // Reset inputs
  titleInput.value = "";
  document.getElementById("date-input").value = "";
  selectedImageUrl = "";

  toastNotification.classList.add("show");

  // Remove the class after 2.5 seconds so it fades out
  setTimeout(function () {
    toastNotification.classList.remove("show");
  }, 2500);
});

// ==========================================
// 6. API AUTOCOMPLETE
// ==========================================
titleInput.addEventListener("input", function () {
  clearTimeout(debounceTimer);
  const query = this.value.trim();

  if (query.length < 2) {
    suggestionsList.innerHTML = "";
    return;
  }

  const currentType = typeInput.value;

  debounceTimer = setTimeout(async function () {
    try {
      suggestionsList.innerHTML = "";
      let normalizedResults = [];

      // Route 1: TV Shows (TVmaze API)
      if (currentType === "TV-Show") {
        const response = await fetch(
          `https://api.tvmaze.com/search/shows?q=${query}`,
        );
        const data = await response.json();
        normalizedResults = data.slice(0, 5).map((item) => ({
          title: item.show.name,
          img: item.show.image
            ? item.show.image.medium
            : "https://placehold.co/30x40/2a2a2a/FFFFFF/png?text=?",
          highResImg: item.show.image
            ? item.show.image.original || item.show.image.medium
            : "",
        }));
      }
      // Route 2: Anime (Jikan API)
      else if (currentType === "Anime") {
        const response = await fetch(
          `https://api.jikan.moe/v4/anime?q=${query}&limit=5`,
        );
        const data = await response.json();
        normalizedResults = data.data.map((item) => ({
          title: item.title,
          img: item.images.jpg.image_url,
          highResImg:
            item.images.jpg.large_image_url || item.images.jpg.image_url,
        }));
      }
      // Route 3: Movies (OMDB API)
      else if (currentType === "Movie") {
        const apiKey = "49136baf";
        const response = await fetch(
          `https://www.omdbapi.com/?s=${query}&type=movie&apikey=${apiKey}`,
        );
        const data = await response.json();
        if (data.Search) {
          normalizedResults = data.Search.slice(0, 5).map((item) => ({
            title: item.Title,
            img:
              item.Poster !== "N/A"
                ? item.Poster
                : "https://placehold.co/30x40/2a2a2a/FFFFFF/png?text=?",
            highResImg: item.Poster !== "N/A" ? item.Poster : "",
          }));
        }
      }
      // Route 4: Games (RAWG API)
      else if (currentType === "Game") {
        const apiKey = "1731ffd5d50b4f0697387aaf202b48fc";
        const response = await fetch(
          `https://api.rawg.io/api/games?search=${query}&key=${apiKey}`,
        );
        const data = await response.json();
        if (data.results) {
          normalizedResults = data.results.slice(0, 5).map((item) => ({
            title: item.name,
            img: item.background_image
              ? item.background_image
              : "https://placehold.co/30x40/2a2a2a/FFFFFF/png?text=?",
            highResImg: item.background_image ? item.background_image : "",
          }));
        }
      }

      // Render Suggestions
      normalizedResults.forEach(function (media) {
        const li = document.createElement("li");
        li.innerHTML = `
            <img src="${media.img}" alt="${media.title}">
            <span>${media.title}</span>
        `;
        li.addEventListener("click", function () {
          titleInput.value = media.title;
          selectedImageUrl = media.highResImg;
          suggestionsList.innerHTML = "";
        });
        suggestionsList.appendChild(li);
      });
    } catch (error) {
      console.error("Error fetching API data:", error);
    }
  }, 500);
});

// Close Autocomplete on outside click
document.addEventListener("click", function (e) {
  if (!document.querySelector(".autocomplete-wrapper").contains(e.target)) {
    suggestionsList.innerHTML = "";
  }
});

// ==========================================
// 7. SEARCH & FILTERING
// ==========================================
searchIconBtn.addEventListener("click", function (e) {
  e.preventDefault();
  searchWrapper.classList.toggle("active");

  if (searchWrapper.classList.contains("active")) {
    searchInput.focus();
  } else {
    searchInput.value = "";
    displayMedia();
  }
});

searchInput.addEventListener("input", displayMedia);

function applyFilter(filterValue) {
  currentFilter = filterValue;
  filterLinks.forEach((link) => {
    if (link.innerText === filterValue) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
  displayMedia();
}

filterLinks.forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    applyFilter(this.innerText);
  });
});

// ==========================================
// 8. CRUD OPERATIONS (EDIT & DELETE)
// ==========================================
// --- DELETE LOGIC ---
function deleteCard(id) {
  cardIdToDelete = id;
  deleteModal.classList.add("show");
}

function closeDeleteModal() {
  deleteModal.classList.remove("show");
  cardIdToDelete = null;
}

function confirmDelete() {
  deleteModal.classList.remove("show");

  if (cardIdToDelete !== null) {
    const cardElement = document.getElementById(`card-${cardIdToDelete}`);
    if (cardElement) {
      cardElement.classList.add("fade-out");
    }

    setTimeout(function () {
      mediaVault = mediaVault.filter((item) => item.id !== cardIdToDelete);
      updateStorage();
      displayMedia();
      cardIdToDelete = null;
    }, 400);
  }
}

// --- EDIT LOGIC ---
function editCard(idToEdit) {
  const item = mediaVault.find((i) => i.id === idToEdit);
  const cardElement = document.getElementById(`card-${idToEdit}`);
  cardElement.classList.add("editing");

  // Format Date for HTML Calendar
  let currentDate = item.statusDate || item.dateAdded;
  let calendarFormat = "";
  if (currentDate.includes("/")) {
    const parts = currentDate.split("/");
    calendarFormat = `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  cardElement.innerHTML = `
    <input type="text" class="inline-edit-input" autocomplete="off" value="${item.title}" id="edit-title-${idToEdit}" />
    <select id="edit-type-${idToEdit}" class="inline-edit-select">
      <option value="Anime" ${item.type === "Anime" ? "selected" : ""}>Anime</option>
      <option value="Movie" ${item.type === "Movie" ? "selected" : ""}>Movie</option>
      <option value="TV-Show" ${item.type === "TV-Show" ? "selected" : ""}>TV Show</option>
      <option value="Game" ${item.type === "Game" ? "selected" : ""}>Game</option>
    </select>
    <select id="edit-status-${idToEdit}" class="inline-edit-select">
      <option value="Watching" ${item.status === "Watching" ? "selected" : ""}>Currently Watching</option>
      <option value="Completed"  ${item.status === "Completed" ? "selected" : ""}>Completed</option>
      <option value="Plan to Watch"  ${item.status === "Plan to Watch" ? "selected" : ""}>Plan to Watch</option>
    </select>
    <input type="date" id="edit-date-${idToEdit}" class="inline-edit-input" value="${calendarFormat}" />
    
    <div class="inline-edit-actions">
      <button class="save-btn" onclick="saveEdit(${idToEdit})">Save</button>
      <button class="cancel-btn" onclick="displayMedia()">Cancel</button>
    </div>
  `;
}

function saveEdit(idToSave) {
  const newTitle = document
    .getElementById(`edit-title-${idToSave}`)
    .value.trim();
  const newType = document.getElementById(`edit-type-${idToSave}`).value;
  const newStatus = document.getElementById(`edit-status-${idToSave}`).value;
  const rawDate = document.getElementById(`edit-date-${idToSave}`).value;

  if (newTitle == "") {
    alert("Title cannot be empty!");
    return;
  }

  const itemIndex = mediaVault.findIndex((i) => i.id === idToSave);

  if (itemIndex !== -1) {
    let finalDateToSave = mediaVault[itemIndex].statusDate;

    if (rawDate !== "") {
      const parts = rawDate.split("-");
      finalDateToSave = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    mediaVault[itemIndex].title = newTitle;
    mediaVault[itemIndex].type = newType;
    mediaVault[itemIndex].status = newStatus;
    mediaVault[itemIndex].statusDate = finalDateToSave;

    updateStorage();
  }

  displayMedia();
}

// ==========================================
// 9. DASHBOARD STATS LOGIC
// ==========================================
navDashboard.addEventListener("click", function (e) {
  e.preventDefault();
  generateStats();
  dashboardModal.classList.add("show");
});

function closeDashboard() {
  dashboardModal.classList.remove("show");
}

function generateStats() {
  const total = mediaVault.length;

  const animeCount = mediaVault.filter((i) => i.type === "Anime").length;
  const tvShowsCount = mediaVault.filter((i) => i.type === "TV-Show").length;
  const totalShows = animeCount + tvShowsCount;

  const movieCount = mediaVault.filter((i) => i.type === "Movie").length;
  const gameCount = mediaVault.filter((i) => i.type === "Game").length;

  const completedCount = mediaVault.filter(
    (i) => i.status === "Completed",
  ).length;
  const watchingCount = mediaVault.filter(
    (i) => i.status === "Watching",
  ).length;

  statsContainer.innerHTML = `
        <div class="stat-card">
            <h4>Total Entries</h4>
            <span>${total}</span>
        </div>
        <div class="stat-card">
            <h4>Completed</h4>
            <span style="color: #2ecc71;">${completedCount}</span> 
        </div>
        <div class="stat-card">
            <h4>In Progress</h4>
            <span style="color: #f1c40f;">${watchingCount}</span> 
        </div>
        <div class="stat-card">
            <h4>TV Shows/Anime</h4>
            <span>${totalShows}</span>
        </div>
        <div class="stat-card">
            <h4>Games</h4>
            <span>${gameCount}</span>
        </div>
        <div class="stat-card">
            <h4>Movies</h4>
            <span>${movieCount}</span>
        </div>
    `;
}
