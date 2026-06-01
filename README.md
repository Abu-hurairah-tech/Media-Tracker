# 📺 MediaVault

A sleek, modern web application to organize and track your favorite media—anime, movies, TV shows, and games—all in one beautiful vault.

---

## ✨ Features

### 🎯 Core Functionality

- **Add Media**: Easily add anime, movies, TV shows, or games with auto-filling titles and poster images
- **Smart Search**: Search by title, type, date added, or status in real-time
- **Filter & Sort**: Filter by media type or completion status (All, Watching, Completed)
- **Edit Anytime**: Modify any entry including title, type, status, and dates
- **Delete Safely**: Confirm before removing entries with a modal dialog
- **Statistics Dashboard**: View vault statistics including total entries, completion rate, and breakdown by type

### 🤖 Intelligent Autocomplete

Powered by three APIs for smart suggestions:

- **TVmaze API** for TV shows
- **Jikan API** for anime
- **OMDB API** for movies
- Auto-fetches high-quality posters from each source

### 📊 Data Tracking

- **Date Added**: Automatically records when you added the media
- **Status Date**: Manually set when you started watching or completed
- **Persistent Storage**: All data saved locally using localStorage

### 🎨 Beautiful UI

- Dark theme optimized for extended viewing
- Responsive grid layout that adapts to any screen size
- Smooth animations and hover effects
- Intuitive modal dialogs for confirmations

---

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for API autocomplete)

### Installation

1. Clone or download the project files
2. Open `index.html` in your web browser
3. Start adding your media!

---

## 📖 How to Use

### Adding Media

1. **Enter Title**: Type or select from autocomplete suggestions
2. **Choose Type**: Select from Anime, Movie, TV Show, or Game
3. **Set Status**: Choose Currently Watching, Completed, or Plan to Watch
4. **Optional Date**: Set a custom start/completion date
5. **Click "Add to Vault"**: Your media is saved automatically

### Searching & Filtering

- **Search Bar**: Click the search icon in the navbar and type to filter
- **Filter by Type/Status**: Click on badges in the navbar or card badges to filter
- **Active Indicator**: Current filter shows with a red highlight

### Editing Entries

1. Click the **pencil icon** on any card
2. Modify the details in the inline editor
3. Click **Save** to update or **Cancel** to discard changes

### Deleting Entries

1. Click the **trash icon** on any card
2. Confirm in the modal dialog
3. Entry fades out smoothly and is removed

### Viewing Statistics

1. Click **Stats** in the navbar
2. View your vault breakdown:
   - Total entries
   - Completed vs. In Progress
   - Breakdown by media type

---

## 🛠️ Technical Stack

- **HTML5**: Semantic markup and structure
- **CSS3**: Custom animations, grid layouts, and dark theme
- **JavaScript (Vanilla)**: No dependencies—pure JS for lightweight performance
- **APIs**:
  - [TVmaze API](https://www.tvmaze.com/api) - TV shows
  - [Jikan API](https://jikan.moe/) - Anime
  - [OMDB API](https://www.omdbapi.com/) - Movies
- **Storage**: Browser localStorage for persistence

---

## 📁 Project Structure

```text
Media Tracker/
├── index.html          # Main HTML file
├── style.css           # All styling and animations
├── script.js           # Application logic
└── README.md          # This file