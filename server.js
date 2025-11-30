const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// -------------------
// API: All Restaurants
// -------------------
app.get("/api/restaurants", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM restaurants");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// -------------------
// API: Single Restaurant
// -------------------
app.get("/api/restaurants/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const restaurant = await pool.query("SELECT * FROM restaurants WHERE id = $1", [id]);
    const reviews = await pool.query(
      "SELECT * FROM reviews WHERE restaurant_id = $1 ORDER BY created_at DESC", 
      [id]
    );
    res.json({ restaurant: restaurant.rows[0], reviews: reviews.rows });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// -------------------
// API: Add Review
// -------------------
app.post("/api/reviews", async (req, res) => {
  const { restaurant_id, reviewer_name, rating, comment } = req.body;

  try {
    await pool.query(
      "INSERT INTO reviews (restaurant_id, reviewer_name, rating, comment) VALUES ($1,$2,$3,$4)",
      [restaurant_id, reviewer_name, rating, comment]
    );
    res.json({ status: "success", message: "Review added!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// -------------------
// FALLBACK ROUTE
// -------------------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// -------------------
// START SERVER (Render)
// -------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
