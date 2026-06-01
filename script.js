console.log("hello");
let selectedImageUrl = "";
const deleteSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M262.2 48C248.9 48 236.9 56.3 232.2 68.8L216 112L120 112C106.7 112 96 122.7 96 136C96 149.3 106.7 160 120 160L520 160C533.3 160 544 149.3 544 136C544 122.7 533.3 112 520 112L424 112L407.8 68.8C403.1 56.3 391.2 48 377.8 48L262.2 48zM128 208L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 208L464 208L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 208L128 208zM288 280C288 266.7 277.3 256 264 256C250.7 256 240 266.7 240 280L240 456C240 469.3 250.7 480 264 480C277.3 480 288 469.3 288 456L288 280zM400 280C400 266.7 389.3 256 376 256C362.7 256 352 266.7 352 280L352 456C352 469.3 362.7 480 376 480C389.3 480 400 469.3 400 456L400 280z"/></svg>';

let filterLinks = document.querySelectorAll(".nav-links a");
let mediaForm = document.getElementById("media-form");
let titleInput = document.getElementById("title-input");
let typeInput = document.getElementById("type-input");
let statusInput = document.getElementById("status-input");
let submitBtn = document.getElementById("submit-btn");
let gallery = document.getElementById("media-gallery");
const searchWrapper = document.getElementById("search-wrapper");
const searchIconBtn = document.getElementById("search-icon-btn");
const searchInput = document.getElementById("search-input");
const deleteModal = document.getElementById("delete-modal");
let cardIdToDelete = null;
let currentFilter = "All";

let mediaVault = JSON.parse(localStorage.getItem("mediaVault")) || [];
displayMedia();

function updateStorage() {
  localStorage.setItem("mediaVault", JSON.stringify(mediaVault));
}

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

  let isDuplicate = false;
  mediaVault.forEach(function (item) {
    if (
      title.toLowerCase() === item.title.toLowerCase() &&
      type.toLowerCase() === item.type.toLowerCase()
    ) {
      isDuplicate = true;
    }
  });

  if (isDuplicate) {
    alert("This media Already Exists in the Vault");
    return;
  }

  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  const currentDate = dd + "/" + mm + "/" + yyyy;

  // 2. Determine the Status Date (Manual vs Default)
  let customStatusDate = currentDate; // It defaults to today...

  if (rawDate !== "") {
    //if the user picked a calendar date, use that instead!
    const parts = rawDate.split("-");
    customStatusDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  //Save them completely independently!
  const newItem = {
    id: Date.now(),
    title: title,
    type: type,
    status: status,
    dateAdded: currentDate, // ALWAYS today's real date
    statusDate: customStatusDate, // The manual calendar date (or today if left blank)
    imgUrl: selectedImageUrl,
  };

  mediaVault.push(newItem);
  updateStorage();
  displayMedia();

  // Clear the inputs & reset the image memory!
  titleInput.value = "";
  document.getElementById("date-input").value = "";
  selectedImageUrl = "";
});

// --- LIVE API AUTOCOMPLETE ---
const suggestionsList = document.getElementById("suggestions-list");
let debounceTimer;

// 1. Listen for the user typing in the title box
titleInput.addEventListener("input", function () {
  clearTimeout(debounceTimer);
  const query = this.value.trim();

  if (query.length < 2) {
    suggestionsList.innerHTML = "";
    return;
  }

  // Check what type of media the user is searching for!
  const currentType = document.getElementById("type-input").value;

  debounceTimer = setTimeout(async function () {
    try {
      suggestionsList.innerHTML = "";
      let normalizedResults = []; // Our clean, unified data array

      // --- ROUTE 1: TV SHOWS (TVmaze API) ---
      if (currentType === "TV-Show") {
        const response = await fetch(
          `https://api.tvmaze.com/search/shows?q=${query}`,
        );
        const data = await response.json();

        // Map TVmaze messy data into our clean format
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

      // --- ROUTE 2: ANIME (Jikan API - Free, No Auth) ---
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

      // --- ROUTE 3: MOVIES (OMDB API - Requires Free Key) ---
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

      // --- THE RENDERER (Works for all 3 APIs automatically!) ---
      normalizedResults.forEach(function (media) {
        const li = document.createElement("li");

        li.innerHTML = `
            <img src="${media.img}" alt="${media.title}">
            <span>${media.title}</span>
        `;

        li.addEventListener("click", function () {
          titleInput.value = media.title;
          selectedImageUrl = media.highResImg; // Saves the poster!
          suggestionsList.innerHTML = "";
        });

        suggestionsList.appendChild(li);
      });
    } catch (error) {
      console.error("Error fetching API data:", error);
    }
  }, 500);
});

// Hide the suggestions if the user clicks anywhere else on the page
document.addEventListener("click", function (e) {
  if (!document.querySelector(".autocomplete-wrapper").contains(e.target)) {
    suggestionsList.innerHTML = "";
  }
});

function displayMedia() {
  // Clear the gallery once
  gallery.innerHTML = "";

  // Grab the master data
  let itemsToDisplay = mediaVault;

  // Apply Tab/Badge Filters
  if (currentFilter !== "All") {
    itemsToDisplay = mediaVault.filter(function (item) {
      return item.status === currentFilter || item.type === currentFilter;
    });
  }

  // Apply Search Bar Filter
  const searchTerm = searchInput.value.toLowerCase().trim();
  if (searchTerm !== "") {
    itemsToDisplay = itemsToDisplay.filter(function (item) {
      return (
        item.title.toLowerCase().includes(searchTerm) ||
        item.type.toLowerCase().includes(searchTerm) ||
        item.status.toLowerCase().includes(searchTerm) ||
        item.dateAdded.includes(searchTerm)
      );
    });
  }

  // Draw the filtered items! (Only one loop needed here)
  itemsToDisplay.forEach(function (item) {
    const card = document.createElement("div");
    card.classList.add("media-card");
    card.id = `card-${item.id}`;

    // DEFINE SAFE VARIABLES FIRST
    const safeType = item.type ? item.type.toLowerCase() : "unknown";
    const safeStatus = item.status ? item.status.toLowerCase() : "unknown";

    // Create the CSS classes safely
    const typeClass = safeType;
    const statusClass = safeStatus.replace(/\s/g, "-");

    // FIGURE OUT THE DATES
    let statusDateHTML = "";
    if (safeStatus.includes("watching")) {
      statusDateHTML = `<span>Started: ${item.statusDate || item.dateAdded}</span>`;
    } else if (safeStatus.includes("completed")) {
      statusDateHTML = `<span>Completed: ${item.statusDate || item.dateAdded}</span>`;
    }

    console.log(`Checking ${item.title} image status:`, item.imgUrl);

    // POSTER IMAGE HTML
    const imageHTML = item.imgUrl
      ? `<img src="${item.imgUrl}" class="card-poster-img" alt="${item.title} Poster" />`
      : `<div class="card-poster-img placeholder-poster"><span>📺</span></div>`;

    // INJECT EVERYTHING INTO THE CARD
    // Note: I used ${item.type} for the badge text so it keeps its capital letters visually!
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
      mediaVault = mediaVault.filter(function (item) {
        return item.id !== cardIdToDelete;
      });

      updateStorage();
      displayMedia();

      cardIdToDelete = null;
    }, 400);
  }
}

function editCard(idToEdit) {
  const item = mediaVault.find(function (i) {
    return i.id === idToEdit;
  });

  const cardElement = document.getElementById(`card-${idToEdit}`);
  cardElement.classList.add("editing");

  // THE FLIP: Convert DD/MM/YYYY to YYYY-MM-DD for the HTML Calendar
  let currentDate = item.statusDate || item.dateAdded;
  let calendarFormat = "";
  if (currentDate.includes("/")) {
    const parts = currentDate.split("/"); // Chops it into [DD, MM, YYYY]
    calendarFormat = `${parts[2]}-${parts[1]}-${parts[0]}`; // Rebuilds it backwards!
  }

  // Add the <input type="date"> to the panel
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

  // Grab the raw date from the new calendar input
  const rawDate = document.getElementById(`edit-date-${idToSave}`).value;

  if (newTitle == "") {
    alert("Title cannot be empty!");
    return;
  }

  const itemIndex = mediaVault.findIndex(function (i) {
    return i.id === idToSave;
  });

  if (itemIndex !== -1) {
    //THE FLIP BACK: Convert YYYY-MM-DD back to your DD/MM/YYYY format
    let finalDateToSave = mediaVault[itemIndex].statusDate;

    if (rawDate !== "") {
      const parts = rawDate.split("-"); // Chops it into [YYYY, MM, DD]
      finalDateToSave = `${parts[2]}/${parts[1]}/${parts[0]}`; // Rebuilds it to DD/MM/YYYY
    }

    //Save all the new data
    mediaVault[itemIndex].title = newTitle;
    mediaVault[itemIndex].type = newType;
    mediaVault[itemIndex].status = newStatus;
    mediaVault[itemIndex].statusDate = finalDateToSave; // Save our perfectly formatted manual date!

    updateStorage();
  }

  displayMedia();
}

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

searchInput.addEventListener("input", function () {
  displayMedia();
});

function applyFilter(filterValue) {
  currentFilter = filterValue;

  filterLinks.forEach(function (link) {
    if (link.innerText === filterValue) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  displayMedia();
}

filterLinks.forEach(function (link) {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    applyFilter(this.innerText);
  });
});

// --- DASHBOARD LOGIC ---

const dashboardModal = document.getElementById("dashboard-modal");
const navDashboard = document.getElementById("nav-dashboard");
const statsContainer = document.getElementById("stats-container");

// Open Dashboard & Trigger Calculations
navDashboard.addEventListener("click", function (e) {
  e.preventDefault();
  generateStats(); // Run the math
  dashboardModal.classList.add("show"); // Reveal the modal
});

//Close Dashboard
function closeDashboard() {
  dashboardModal.classList.remove("show");
}

//The Math Engine
function generateStats() {
  // Total count is just the length of the array
  const total = mediaVault.length;

  // We use the .filter() method to count specific items
  const animeCount = mediaVault.filter(function (i) {
    return i.type === "Anime";
  }).length;
  const tvShowsCount = mediaVault.filter(function (i) {
    return i.type === "TV-Show";
  }).length;

  const totalShows = animeCount + tvShowsCount;
  const movieCount = mediaVault.filter(function (i) {
    return i.type === "Movie";
  }).length;
  const gameCount = mediaVault.filter(function (i) {
    return i.type === "Game";
  }).length;

  // Count by Status
  const completedCount = mediaVault.filter(function (i) {
    return i.status === "Completed";
  }).length;
  const watchingCount = mediaVault.filter(function (i) {
    return i.status === "Watching";
  }).length;

  // 4. Inject the calculated numbers into our HTML Grid
  statsContainer.innerHTML = `
        <div class="stat-card">
            <h4>Total Entries</h4>
            <span>${total}</span>
        </div>
        <div class="stat-card">
            <h4>Completed</h4>
            <span style="color: #2ecc71;">${completedCount}</span> </div>
        <div class="stat-card">
            <h4>In Progress</h4>
            <span style="color: #f1c40f;">${watchingCount}</span> </div>
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
