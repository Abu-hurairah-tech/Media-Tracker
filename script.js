console.log("hello");
let titleInput = document.getElementById("title-input");
let typeInput = document.getElementById("type-input");
let statusInput = document.getElementById("status-input");
let submitBtn = document.getElementById("submit-btn");
let gallery = document.getElementById("media-gallery");

let mediaVault = [];

submitBtn.addEventListener("click", function () {
  const title = titleInput.value;
  const type = typeInput.value;
  const status = statusInput.value;

  if (title == "") {
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
  const FormattedDate = dd + "/" + mm + "/" + yyyy;

  const newItem = {
    id: Date.now(),
    title: title,
    type: type,
    status: status,
    dateAdded: FormattedDate,
  };

  mediaVault.push(newItem);
  displayMedia();
  titleInput.value = "";
});

function displayMedia() {
  gallery.innerHTML = "";

  mediaVault.forEach(function (item) {
    const card = document.createElement("div");
    card.classList.add("media-card");
    card.id = `card-${item.id}`;

    const typeClass = item.type.toLowerCase();
    const statusClass = item.status.toLowerCase().replace(/\s/g, "-");

    card.innerHTML = `
    <button class="delete-btn" onclick="deleteCard(${item.id})"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M262.2 48C248.9 48 236.9 56.3 232.2 68.8L216 112L120 112C106.7 112 96 122.7 96 136C96 149.3 106.7 160 120 160L520 160C533.3 160 544 149.3 544 136C544 122.7 533.3 112 520 112L424 112L407.8 68.8C403.1 56.3 391.2 48 377.8 48L262.2 48zM128 208L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 208L464 208L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 208L128 208zM288 280C288 266.7 277.3 256 264 256C250.7 256 240 266.7 240 280L240 456C240 469.3 250.7 480 264 480C277.3 480 288 469.3 288 456L288 280zM400 280C400 266.7 389.3 256 376 256C362.7 256 352 266.7 352 280L352 456C352 469.3 362.7 480 376 480C389.3 480 400 469.3 400 456L400 280z"/></svg></button>
    <h3>${item.title}</h3>
    <span class="badge type-${typeClass}">${typeClass}</span>
    <span class="badge status-${statusClass}">${statusClass}</span>
    <span class="date-Added">Added on: ${item.dateAdded}</span>
    `;

    gallery.appendChild(card);
  });
}

function deleteCard(idToRemove) {
  const cardElement = document.getElementById(`card-${idToRemove}`);

  cardElement.classList.add("fade-out");

  setTimeout(function () {
    mediaVault = mediaVault.filter(function (item) {
      return item.id !== idToRemove;
    });

    displayMedia();
  }, 400);
}
