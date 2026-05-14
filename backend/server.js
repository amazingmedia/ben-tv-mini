const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const REQUIRED_CHANNELS = [
  process.env.PUBLIC_CHANNEL_1,
  process.env.PUBLIC_CHANNEL_2,
];

app.get("/api/movies", (req, res) => {
  const movies = JSON.parse(fs.readFileSync("./movies.json", "utf8"));
  res.json(movies);
});

app.get("/api/movies/:id", (req, res) => {
  const movies = JSON.parse(fs.readFileSync("./movies.json", "utf8"));
  const movie = movies.find((m) => String(m.id) === req.params.id);
  if (!movie) return res.status(404).json({ error: "Movie not found" });
  res.json(movie);
});

app.post("/api/check-join", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId required" });
  }

  const missing = [];

  for (const channel of REQUIRED_CHANNELS) {
    try {
      const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember`;
      const response = await axios.get(url, {
        params: {
          chat_id: channel,
          user_id: userId,
        },
      });

      const status = response.data.result.status;

      if (
        status !== "member" &&
        status !== "administrator" &&
        status !== "creator"
      ) {
        missing.push(channel);
      }
    } catch (err) {
      missing.push(channel);
    }
  }

  res.json({
    joined: missing.length === 0,
    missing,
  });
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`Backend running on http://localhost:${process.env.PORT || 4000}`);
});