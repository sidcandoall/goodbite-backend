const API = "https://goodbite-backend.onrender.com/api";

const IMAGES = {
  1: "images/1.png",
  2: "images/2.png",
  3: "images/3.png",
  4: "images/4.png",
  5: "images/5.png",
  6: "images/6.png",
  7: "images/7.png",
  8: "images/8.png",
  9: "images/9.png",
  10: "images/10.png"
};

let favorites = JSON.parse(localStorage.getItem("favs") || "[]");

function toggleFavorite(id) {
  if (favorites.includes(id)) favorites = favorites.filter(x => x !== id);
  else favorites.push(id);
  localStorage.setItem("favs", JSON.stringify(favorites));
  renderRestaurants(currentList);
}

function star() {
  return "<svg class='star' fill='gold' viewBox='0 0 24 24'><path d='M12 .6l3.7 7.6L24 9.7l-6 5.8 1.5 8.3L12 18.9 4.6 23.8 6 15.6 0 9.7l8.3-1.6z'/></svg>";
}

let restaurantData = [];
let currentList = [];
let currentPage = 1;
const perPage = 4;

function renderPagination(list) {
  let pages = Math.ceil(list.length / perPage);
  let html = "";
  for (let i = 1; i <= pages; i++) {
    html += `<button onclick="go(${i})" class="btn" style="margin:5px;">${i}</button>`;
  }
  document.getElementById("pagination").innerHTML = html;
}

function go(p) {
  currentPage = p;
  renderRestaurants(currentList);
}

function renderRestaurants(list) {
  currentList = list;
  renderPagination(list);

  let start = (currentPage - 1) * perPage;
  let slice = list.slice(start, start + perPage);

  let html = "";
  slice.forEach(r => {
    let img = IMAGES[r.id];
    let fav = favorites.includes(r.id) ? "favorite active" : "favorite";

    let s = "";
    let rating = r.avg_rating || 4;
    for (let i = 0; i < rating; i++) s += star();

    html += `
    <div class="card">
      <img src="${img}">
      <div class="card-body">
        <span class="${fav}" onclick="toggleFavorite(${r.id})">&hearts;</span>
        <h3>${r.name}</h3>
        <p>${r.location}</p>

        <div class="card-footer">
          <div class="stars">${s}</div>
          <a class="btn view-btn" href="restaurant.html?id=${r.id}">View</a>
        </div>

      </div>
    </div>`;
  });

  document.getElementById("restaurant-list").innerHTML = html;
}

if (location.pathname.includes("restaurants.html")) {
  fetch(API + "/restaurants")
    .then(r => r.json())
    .then(data => {
      restaurantData = data;
      currentList = data;
      renderRestaurants(data);

      document.getElementById("searchBox").addEventListener("input", e => {
        let v = e.target.value.toLowerCase();
        currentList = restaurantData.filter(x => x.name.toLowerCase().includes(v));
        currentPage = 1;
        renderRestaurants(currentList);
      });

      document.getElementById("cuisineFilter").addEventListener("change", e => {
        let v = e.target.value;
        currentList = v === "all" ? restaurantData : restaurantData.filter(x => x.cuisine === v);
        currentPage = 1;
        renderRestaurants(currentList);
      });

      document.getElementById("sortBy").addEventListener("change", e => {
        let v = e.target.value;
        if (v === "name") currentList.sort((a, b) => a.name.localeCompare(b.name));
        if (v === "rating") currentList.sort((a, b) => (b.avg_rating || 4) - (a.avg_rating || 4));
        currentPage = 1;
        renderRestaurants(currentList);
      });
    });
}

if (location.pathname.includes("restaurant.html")) {
  const id = new URLSearchParams(location.search).get("id");

  fetch(API + "/restaurants/" + id)
    .then(r => r.json())
    .then(data => {
      const r = data.restaurant;
      let img = IMAGES[r.id];

      let s = "";
      let rating = r.avg_rating || 4;
      for (let i = 0; i < rating; i++) s += star();

      document.getElementById("restaurant-details").innerHTML = `
      <div class="card">
        <img src="${img}">
        <div class="card-body">
          <h2>${r.name}</h2>
          <p>${r.description || ""}</p>

          <div class="details-footer">
            <div class="stars">${s}</div>
            <a class="btn map-btn" target="_blank"
               href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + " " + r.location)}">
               View on Maps
            </a>
          </div>
        </div>
      </div>`;

      let rev = "";
      data.reviews.forEach(rv => {
        let s2 = "";
        for (let i = 0; i < rv.rating; i++) s2 += star();

        rev += `
        <div class="card">
          <div class="card-body">
            <h4>${rv.reviewer_name} ${s2}</h4>
            <p>${rv.comment}</p>
          </div>
        </div>`;
      });

      document.getElementById("reviews").innerHTML = rev;
    });
}

if (location.pathname.includes("add-review.html")) {
  const id = new URLSearchParams(location.search).get("id");

  document.getElementById("reviewForm").addEventListener("submit", e => {
    e.preventDefault();

    fetch(API + "/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurant_id: id,
        reviewer_name: document.getElementById("name").value,
        rating: document.getElementById("rating").value,
        comment: document.getElementById("comment").value
      })
    }).then(() => location.href = "restaurant.html?id=" + id);
  });
}
