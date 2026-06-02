# 📺 MediaVault

A sleek, modern web application to organize and track your favorite media—anime, movies, TV shows, and games—all in one beautiful vault.

---

## ✨ Features

### 🎯 Core Functionality

- **Omni-Search**: Search by title, type, date added, status, or completion dates in real-time.
- **Filter & Sort**: Filter by media type or completion status (All, Watching, Completed).
- **Edit Anytime**: Modify any entry including title, type, status, and dates using an inline editor.
- **Delete Safely**: Confirm before removing entries with a custom modal dialog.
- **Statistics Dashboard**: View vault statistics including total entries, completion rate, and breakdown by media type.
- **Instant Feedback**: Sleek glassmorphism toast notifications confirm when media is successfully added.

### 🤖 Intelligent Autocomplete

Powered by four distinct databases for smart suggestions:

- **TVmaze API** for TV shows
- **Jikan API** for anime
- **OMDB API** for movies
- **RAWG API** for video games
- *Auto-fetches high-quality posters and backgrounds from each source.*

### 🎨 Beautiful UI & Customization

- **Light/Dark Mode**: Seamlessly toggle between dark and light themes, with your preference saved locally.
- **Responsive Design**: Auto-fitting card grid and custom media queries ensure the app looks perfect on desktop, tablets, and the smallest mobile screens.
- **Premium Aesthetics**: Features smooth CSS transitions, hover effects, and modern glassmorphism elements.

### 📊 Data Tracking

- **Date Added**: Automatically records when you added the media.
- **Status Date**: Manually set when you started watching or completed an item.
- **Persistent Storage**: All vault data and theme preferences are saved locally using the browser's localStorage.

---

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for API autocomplete)

### Installation

1. Clone or download the project files.
2. Open `index.html` in your web browser.
3. Start adding your media!

---

## 📖 How to Use

### Adding Media

1. **Enter Title**: Type or select from autocomplete suggestions.
2. **Choose Type**: Select from Anime, Movie, TV Show, or Game.
3. **Set Status**: Choose Currently Watching, Completed, or Plan to Watch.
4. **Optional Date**: Set a custom start/completion date (defaults to today if left blank).
5. **Click "Add to Vault"**: A toast notification will confirm your media is saved.

### Searching & Filtering

- **Omni-Search Bar**: Click the search icon in the navbar and type any title, type, or date to instantly filter your vault.
- **Filter Badges**: Click on badges in the navbar or directly on the media cards to filter by category.
- **Active Indicator**: Current active filters are highlighted in primary red.

### Editing & Deleting

1. **Edit**: Click the pencil icon on any card to open the inline editor. Modify details and click Save.
2. **Delete**: Click the trash icon on any card and confirm in the modal dialog to smoothly remove the entry.

### Viewing Statistics

1. Click **Stats** in the navbar.
2. View your vault breakdown:
   - Total entries
   - Completed vs. In Progress
   - Breakdown by media type

---

## 🛠️ Technical Stack

- **HTML5**: Semantic markup and structure
- **CSS3**: Custom animations, grid layouts, theme variables, and advanced media queries
- **JavaScript (Vanilla)**: No dependencies—pure JS for lightweight performance and state management
- **APIs**:
  - [TVmaze API](https://www.tvmaze.com/api) - TV shows
  - [Jikan API](https://jikan.moe/) - Anime
  - [OMDB API](https://www.omdbapi.com/) - Movies
  - [RAWG API](https://rawg.io/apidocs) - Video games
- **Storage**: Browser localStorage for data persistence

---

## 📁 Project Structure

```text
Media Tracker/
├── index.html          # Main HTML file
├── style.css           # All styling, themes, and animations
├── script.js           # Application logic, state, and API routing
└── README.md           # This documentation