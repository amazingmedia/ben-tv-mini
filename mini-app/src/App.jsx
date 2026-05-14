import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [movies, setMovies] = useState([]);
  const [missingChannels, setMissingChannels] = useState([]);

  const tg = window.Telegram.WebApp;

  useEffect(() => {
    tg.ready();
    tg.expand();

    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/movies");
      setMovies(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const checkJoin = async (movie) => {
    let userId;

    // Telegram Mini App
    if (tg.initDataUnsafe?.user?.id) {
      userId = tg.initDataUnsafe.user.id;
    } else {
      // localhost browser testing
      userId = prompt("Enter Telegram User ID");
    }

    if (!userId) return;

    try {
      const res = await axios.post(
        "http://localhost:4000/api/check-join",
        {
          userId,
        }
      );

      if (res.data.joined) {
        window.open(movie.telegramPostLink, "_blank");
      } else {
        setMissingChannels(res.data.missing);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      style={{
        background: "#111",
        minHeight: "100vh",
        padding: 20,
        color: "white",
      }}
    >
      <h1>Ben TV Mini App</h1>

      {missingChannels.length > 0 && (
        <div
          style={{
            background: "#222",
            padding: 20,
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <h3>Please Join Required Channels</h3>

          {missingChannels.map((channel) => (
            <a
              key={channel}
              href={`https://t.me/${channel.replace("@", "")}`}
              target="_blank"
              style={{
                display: "block",
                marginTop: 10,
                padding: 12,
                background: "#0088cc",
                color: "white",
                textDecoration: "none",
                borderRadius: 8,
              }}
            >
              Join {channel}
            </a>
          ))}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
          gap: 20,
        }}
      >
        {movies.map((movie) => (
          <div
            key={movie.id}
            style={{
              background: "#222",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <img
              src={movie.poster}
              alt={movie.title}
              style={{
                width: "100%",
                height: 260,
                objectFit: "cover",
              }}
            />

            <div style={{ padding: 12 }}>
              <h3>{movie.title}</h3>

              <button
                onClick={() => checkJoin(movie)}
                style={{
                  width: "100%",
                  padding: 10,
                  background: "#0088cc",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Watch Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;